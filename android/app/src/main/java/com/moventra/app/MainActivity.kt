package com.moventra.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddCircle
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.moventra.app.auth.AuthIntroScreen
import com.moventra.app.auth.LoginScreen
import com.moventra.app.auth.SignUpScreen
import com.moventra.app.onboarding.OnboardingFlowScreen
import com.moventra.app.ui.theme.MovDarkSurface
import com.moventra.app.ui.theme.MovGreen1
import com.moventra.app.ui.theme.MoventraTheme
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.launch
import com.moventra.app.RetrofitClient
import com.moventra.app.TokenStorage

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MoventraTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    MoventraApp()
                }
            }
        }
    }
}

// --- TAB TANIMLARI ---
enum class MoventraTab(val label: String) {
    HOME("Home"),
    EVENTS("Events"),
    CREATE("Create"),
    PROFILE("Profile")   // HOBBIES yerine PROFILE
}

// Auth akışı için state
enum class AuthStep {
    INTRO,   // Welcome ekranı
    LOGIN,   // Email login
    SIGNUP   // Email signup
}

@Composable
fun MoventraApp() {
    val context = LocalContext.current
    val tokenStorage = remember { TokenStorage(context.applicationContext) }
    val scope = rememberCoroutineScope()

    var token by remember { mutableStateOf<String?>(null) }
    var loadingInitial by remember { mutableStateOf(true) }

    var authStep by remember { mutableStateOf(AuthStep.INTRO) }
    var lastSignUpEmail by remember { mutableStateOf<String?>(null) }

    // onboarding kontrolü için:
    var checkingMe by remember { mutableStateOf(false) }
    var onboardingNeeded by remember { mutableStateOf<Boolean?>(null) }
    var meCheckError by remember { mutableStateOf<String?>(null) }

    // 1) Uygulama açıldığında DataStore'dan token'ı oku
    LaunchedEffect(Unit) {
        val storedToken = tokenStorage.tokenFlow.firstOrNull()
        token = storedToken
        loadingInitial = false

        if (storedToken == null) {
            authStep = AuthStep.INTRO
            onboardingNeeded = null
        } else {
            // token varsa, birazdan me ile kontrol edeceğiz
            authStep = AuthStep.LOGIN
        }
    }

    // 2) Token her değiştiğinde /auth/me çağır ve onboardingCompleted'a bak
    LaunchedEffect(token) {
        if (token == null) {
            onboardingNeeded = null
            checkingMe = false
            meCheckError = null
            return@LaunchedEffect
        }

        checkingMe = true
        meCheckError = null
        try {
            val bearer = "Bearer $token"
            val meResp = RetrofitClient.authApi.me(bearer)
            val user = meResp.user
            onboardingNeeded = user.onboardingCompleted != true
        } catch (e: Exception) {
            e.printStackTrace()
            meCheckError = e.message ?: "Error checking profile"

            // Token bozulmuş olabilir → logout
            scope.launch {
                tokenStorage.saveToken(null)
            }
            token = null
            authStep = AuthStep.INTRO
            lastSignUpEmail = null
        } finally {
            checkingMe = false
        }
    }

    when {
        // 1) İlk DataStore okuma
        loadingInitial -> {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Text("Loading...")
            }
        }

        // 2) Token yok → Auth flow
        token == null -> {
            when (authStep) {
                AuthStep.INTRO -> {
                    AuthIntroScreen(
                        onGoogleLoginSuccess = { newToken ->
                            // Google login başarılı → token'ı state'e yaz
                            token = newToken
                            // (AuthIntroScreen içinde zaten DataStore'a kaydediyoruz,
                            // burada tekrar kaydetmenin zararı yok)
                            scope.launch {
                                tokenStorage.saveToken(newToken)
                            }
                        },
                        onSignUpWithEmail = { authStep = AuthStep.SIGNUP },
                        onLoginWithEmail = { authStep = AuthStep.LOGIN }
                    )
                }

                AuthStep.LOGIN -> {
                    LoginScreen(
                        onLoginSuccess = { newToken ->
                            // Login başarılı → token'ı state'e yaz
                            token = newToken
                            scope.launch {
                                tokenStorage.saveToken(newToken)
                            }
                        },
                        onNavigateToSignUp = {
                            authStep = AuthStep.SIGNUP
                        }
                    )
                }

                AuthStep.SIGNUP -> {
                    SignUpScreen(
                        onSignUpSuccess = { email ->
                            lastSignUpEmail = email
                            authStep = AuthStep.LOGIN
                        },
                        onBackToIntro = { authStep = AuthStep.INTRO }
                    )
                }
            }
        }

        // 3) Token var ama onboarding durumu daha belli değil
        token != null && onboardingNeeded == null && checkingMe -> {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    CircularProgressIndicator()
                    Spacer(Modifier.height(8.dp))
                    Text("Checking your profile...")
                }
            }
        }

        // 4) Token var & onboarding gerekli → Onboarding wizard
        token != null && onboardingNeeded == true -> {
            OnboardingFlowScreen(
                token = token!!,
                onFinished = {
                    onboardingNeeded = false
                }
            )
        }

        // 5) Token var & onboarding tamam → Main tabs
        token != null && onboardingNeeded == false -> {
            MainTabsScreen(
                token = token!!,
                onLogout = {
                    scope.launch {
                        tokenStorage.saveToken(null)
                    }
                    token = null
                    authStep = AuthStep.INTRO
                    lastSignUpEmail = null
                    onboardingNeeded = null
                }
            )
        }

        else -> {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Text("Unexpected state")
            }
        }
    }
}

// --- ANA TABLI EKRAN (Home | Events | Create | Profile) ---

@Composable
fun MainTabsScreen(
    token: String,
    onLogout: () -> Unit
) {
    var selectedTab by remember { mutableStateOf(MoventraTab.HOME) }

    // Profile tabında Profile mi, Settings mi gözüksün?
    var showProfileSettings by remember { mutableStateOf(false) }

    Scaffold(
        bottomBar = {
            MoventraBottomBar(
                selectedTab = selectedTab,
                onSelect = { selectedTab = it }
            )
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (selectedTab) {
                MoventraTab.HOME -> HomeScreen(
                    onBrowseEvents = { selectedTab = MoventraTab.EVENTS },
                    // ismi onSeeAllHobbies kalsa da artık Profile sekmesine götürüyoruz
                    onSeeAllHobbies = { selectedTab = MoventraTab.PROFILE }
                )

                MoventraTab.EVENTS -> EventsScreen(
                    token = token,
                    onLogout = onLogout
                )

                MoventraTab.CREATE -> CreateEventScreen(token = token)

                MoventraTab.PROFILE -> {
                    if (showProfileSettings) {
                        // ✅ Ayarlar ekranı
                        SettingsScreen(
                            token = token,
                            onBack = { showProfileSettings = false },
                            onLogout = onLogout
                        )
                    } else {
                        // ✅ Profil ekranı – burada onOpenSettings parametresini veriyoruz
                        ProfileScreen(
                            token = token,
                            onLogout = onLogout,
                            onOpenSettings = { showProfileSettings = true }
                        )
                    }
                }
            }
        }
    }
}

// --- BOTTOM BAR ---

@Composable
fun MoventraBottomBar(
    selectedTab: MoventraTab,
    onSelect: (MoventraTab) -> Unit
) {
    NavigationBar(
        containerColor = MovDarkSurface,
        tonalElevation = 0.dp
    ) {
        NavigationBarItem(
            selected = selectedTab == MoventraTab.HOME,
            onClick = { onSelect(MoventraTab.HOME) },
            icon = { Icon(Icons.Default.Home, contentDescription = "Home") },
            label = { Text("Home") },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = MovGreen1,
                selectedTextColor = MovGreen1,
                unselectedIconColor = Color.White.copy(alpha = 0.85f),
                unselectedTextColor = Color.White.copy(alpha = 0.85f),
                indicatorColor = Color.Transparent
            )
        )

        NavigationBarItem(
            selected = selectedTab == MoventraTab.EVENTS,
            onClick = { onSelect(MoventraTab.EVENTS) },
            icon = { Icon(Icons.Default.List, contentDescription = "Events") },
            label = { Text("Events") },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = MovGreen1,
                selectedTextColor = MovGreen1,
                unselectedIconColor = Color.White.copy(alpha = 0.85f),
                unselectedTextColor = Color.White.copy(alpha = 0.85f),
                indicatorColor = Color.Transparent
            )
        )

        NavigationBarItem(
            selected = selectedTab == MoventraTab.CREATE,
            onClick = { onSelect(MoventraTab.CREATE) },
            icon = { Icon(Icons.Default.AddCircle, contentDescription = "Create") },
            label = { Text("Create") },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = MovGreen1,
                selectedTextColor = MovGreen1,
                unselectedIconColor = Color.White.copy(alpha = 0.9f),
                unselectedTextColor = Color.White.copy(alpha = 0.9f),
                indicatorColor = Color.Transparent
            )
        )

        NavigationBarItem(
            selected = selectedTab == MoventraTab.PROFILE,
            onClick = { onSelect(MoventraTab.PROFILE) },
            icon = { Icon(Icons.Default.Person, contentDescription = "Profile") },
            label a= { Text("Profile") },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = MovGreen1,
                selectedTextColor = MovGreen1,
                unselectedIconColor = Color.White.copy(alpha = 0.85f),
                unselectedTextColor = Color.White.copy(alpha = 0.85f),
                indicatorColor = Color.Transparent
            )
        )
    }
}
