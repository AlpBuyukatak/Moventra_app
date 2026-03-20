package com.moventra.app.auth

import android.util.Log
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.moventra.app.GoogleLoginRequest
import com.moventra.app.R
import com.moventra.app.RetrofitClient
import com.moventra.app.TokenStorage
import com.moventra.app.ui.theme.MovGreen1
import com.moventra.app.ui.theme.MovTextDescription
import kotlinx.coroutines.launch

@Composable
fun AuthIntroScreen(
    onGoogleLoginSuccess: (String) -> Unit,
    onSignUpWithEmail: () -> Unit,
    onLoginWithEmail: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val tokenStorage = remember(context) { TokenStorage(context) }

    var googleLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    /* =========================
       Google Sign-In client
       ========================= */
    val gso = remember {
        GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(context.getString(R.string.google_web_client_id))
            .requestEmail()
            .build()
    }

    val googleSignInClient = remember {
        GoogleSignIn.getClient(context, gso)
    }

    /* ==========================================
       Google sign-in sonucu için ActivityResult
       ========================================== */
    val googleLauncher =
        rememberLauncherForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            val task = GoogleSignIn.getSignedInAccountFromIntent(result.data)

            try {
                val account = task.getResult(ApiException::class.java)
                val idToken = account.idToken

                if (idToken != null) {
                    scope.launch {
                        try {
                            googleLoading = true
                            errorMessage = null

                            val request = GoogleLoginRequest(idToken = idToken)
                            val loginResponse = RetrofitClient.authApi.googleLogin(request)

                            // Token'ı kaydet ve üst seviyeye ilet
                            tokenStorage.saveToken(loginResponse.token)
                            onGoogleLoginSuccess(loginResponse.token)
                        } catch (e: Exception) {
                            Log.e("AuthIntroScreen", "Backend Google login hata", e)
                            errorMessage =
                                "Google ile giriş sırasında bir hata oluştu: ${
                                    e.localizedMessage ?: "bilinmeyen hata"
                                }"
                        } finally {
                            googleLoading = false
                        }
                    }
                } else {
                    errorMessage = "Google ID token alınamadı."
                }
            } catch (e: ApiException) {
                Log.e("AuthIntroScreen", "Google sign-in ApiException", e)
                errorMessage =
                    "Google giriş hatası: statusCode=${e.statusCode}, message=${e.localizedMessage}"
            }
        }

    /* =========================
       UI
       ========================= */
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 24.dp, vertical = 32.dp),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // Üst kısım: logo + slogan (+ grup hissi)
        Column(
            verticalArrangement = Arrangement.spacedBy(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.fillMaxWidth()
        ) {
            Spacer(modifier = Modifier.height(16.dp))

            // Flamingo logo
            Image(
                painter = painterResource(id = R.drawable.moventra_logo),
                contentDescription = "Moventra logo",
                modifier = Modifier.size(140.dp)
            )

            Text(
                text = "MOVENTRA",
                style = MaterialTheme.typography.headlineSmall
            )
            Text(
                text = "Meet people through your hobbies.",
                style = MaterialTheme.typography.headlineMedium
            )
            Text(
                text = "Discover small, friendly hobby meetups instead of crowded random events.",
                style = MaterialTheme.typography.bodyMedium,
                color = MovTextDescription
            )

            // Basit bir "grup görseli" hissi: üç yuvarlak avatar
            Row(
                modifier = Modifier.padding(top = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                SimpleAvatar("🎵")
                SimpleAvatar("🥙")
                SimpleAvatar("🎨")
            }
        }

        // Alt kısım: butonlar
        Column(
            verticalArrangement = Arrangement.spacedBy(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            if (errorMessage != null) {
                Text(
                    text = errorMessage!!,
                    color = Color.Red,
                    style = MaterialTheme.typography.bodySmall
                )
            }

            // Continue with Google
            Button(
                onClick = {
                    errorMessage = null
                    val signInIntent = googleSignInClient.signInIntent
                    googleLauncher.launch(signInIntent)
                },
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF111827),
                    contentColor = Color.White
                ),
                enabled = !googleLoading,
                shape = MaterialTheme.shapes.large
            ) {
                if (googleLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(20.dp),
                        strokeWidth = 2.dp,
                        color = Color.White
                    )
                } else {
                    Text("Continue with Google")
                }
            }

            // Continue with Apple (şimdilik TODO)
            Button(
                onClick = { /* TODO: Apple sign-in */ },
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color.White,
                    contentColor = Color(0xFF111827)
                ),
                shape = MaterialTheme.shapes.large
            ) {
                Text("Continue with Apple")
            }

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Divider(modifier = Modifier.weight(1f))
                Text(
                    text = "or",
                    modifier = Modifier.padding(horizontal = 8.dp),
                    color = MovTextDescription
                )
                Divider(modifier = Modifier.weight(1f))
            }

            // Sign up with email
            Button(
                onClick = onSignUpWithEmail,
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MovGreen1,
                    contentColor = Color.White
                ),
                shape = MaterialTheme.shapes.large
            ) {
                Text("Sign up with email")
            }

            TextButton(onClick = onLoginWithEmail) {
                Text("Log in with email")
            }
        }
    }
}

@Composable
private fun SimpleAvatar(emoji: String) {
    Surface(
        modifier = Modifier.size(40.dp),
        shape = MaterialTheme.shapes.large,
        color = Color.White
    ) {
        Box(contentAlignment = Alignment.Center) {
            Text(text = emoji)
        }
    }
}
