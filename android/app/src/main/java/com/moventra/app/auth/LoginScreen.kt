package com.moventra.app.auth

import android.util.Log
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import com.moventra.app.LoginRequest
import com.moventra.app.RetrofitClient
import com.moventra.app.TokenStorage
import com.moventra.app.ui.theme.MovGreen1
import com.moventra.app.ui.theme.MovTextDescription
import kotlinx.coroutines.launch

@Composable
fun LoginScreen(
    onLoginSuccess: (String) -> Unit,          // token geri veriyoruz
    onNavigateToSignUp: () -> Unit = {}        // Kayıt ekranına geçiş
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val tokenStorage = remember(context) { TokenStorage(context) }

    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    /* =========================
       UI
       ========================= */
    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {

                Text(
                    text = "Moventra",
                    style = MaterialTheme.typography.headlineMedium
                )

                Text(
                    text = "Kendi topluluğunu bul, küçük etkinliklere katıl.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MovTextDescription
                )

                Spacer(modifier = Modifier.height(8.dp))

                // E-mail TextField
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text("Email") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    shape = MaterialTheme.shapes.large
                )

                // Password TextField
                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    label = { Text("Şifre") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    visualTransformation = PasswordVisualTransformation(),
                    shape = MaterialTheme.shapes.large
                )

                // Hata mesajı
                if (errorMessage != null) {
                    Text(
                        text = errorMessage ?: "",
                        color = Color.Red,
                        style = MaterialTheme.typography.bodySmall
                    )
                }

                // E-mail / şifre ile login butonu
                Button(
                    onClick = {
                        scope.launch {
                            try {
                                isLoading = true
                                errorMessage = null

                                val request = LoginRequest(email = email, password = password)
                                val loginResponse = RetrofitClient.authApi.login(request)

                                tokenStorage.saveToken(loginResponse.token)
                                onLoginSuccess(loginResponse.token)
                            } catch (e: Exception) {
                                Log.e("LoginScreen", "login hata", e)
                                errorMessage =
                                    "Giriş sırasında bir hata oluştu: ${e.localizedMessage ?: "bilinmeyen hata"}"
                            } finally {
                                isLoading = false
                            }
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    enabled = !isLoading,
                    shape = MaterialTheme.shapes.large,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MovGreen1
                    )
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(20.dp),
                            strokeWidth = 2.dp,
                            color = Color.White
                        )
                    } else {
                        Text("Giriş yap")
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                TextButton(onClick = { onNavigateToSignUp() }) {
                    Text("Hesabın yok mu? Kayıt ol")
                }
            }
        }
    }
}
