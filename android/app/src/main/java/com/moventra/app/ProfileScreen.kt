package com.moventra.app

import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SmallTopAppBar
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.moventra.app.ui.theme.MovGreen1
import com.moventra.app.ui.theme.MovLightBgAlt
import com.moventra.app.ui.theme.MovTextDescription
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    token: String,
    onLogout: () -> Unit,
    onOpenSettings: () -> Unit
) {
    val bearer = remember(token) { "Bearer $token" }
    val scope = rememberCoroutineScope()

    var user by remember { mutableStateOf<UserDto?>(null) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        loading = true
        error = null
        try {
            val meResp = RetrofitClient.authApi.me(bearer)
            user = meResp.user
        } catch (e: Exception) {
            e.printStackTrace()
            error = e.message ?: "Could not load profile."
        } finally {
            loading = false
        }
    }

    Scaffold(
        topBar = {
            SmallTopAppBar(
                title = {
                    Text(
                        text = "Profile",
                        style = MaterialTheme.typography.titleMedium,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                },
                colors = TopAppBarDefaults.smallTopAppBarColors(
                    containerColor = MovLightBgAlt
                ),
                actions = {
                    // ✅ sağ üstte ayarlar ikonu
                    IconButton(onClick = onOpenSettings) {
                        Icon(
                            imageVector = Icons.Default.Settings,
                            contentDescription = "Settings"
                        )
                    }
                }
            )
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(MovLightBgAlt)
                .padding(innerPadding)
        ) {
            when {
                loading -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            CircularProgressIndicator()
                            Spacer(Modifier.height(12.dp))
                            Text(
                                text = "Loading your profile…",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MovTextDescription
                            )
                        }
                    }
                }

                error != null -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = error ?: "Unknown error",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.error
                        )
                    }
                }

                user == null -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "Profile not available.",
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }
                }

                else -> {
                    ProfileContent(
                        user = user!!,
                        onLogout = onLogout
                    )
                }
            }
        }
    }
}

@Composable
private fun ProfileContent(
    user: UserDto,
    onLogout: () -> Unit
) {
    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .padding(horizontal = 16.dp, vertical = 20.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp)
    ) {
        // --- HERO + header kısmı ---
        ProfileHeroCard(user = user)

        // Meetup'taki gibi stats bar
        StatsRow(
            eventsCount = 0,      // TODO: upcoming events endpoint eklenince doldur
            interestsCount = 0,   // TODO: hobbies/my endpoint eklenince doldur
            groupsCount = 0       // TODO: groups endpoint eklenince doldur
        )

        // "I'm looking to ✨" alanı (şimdilik placeholder chipler)
        LookingForSection()

        // "About me" alanı
        AboutSection(user = user)

        // "Interests" – statik chip listesi (ileride backend'e bağlanır)
        InterestsSection()

        // Organizer alanı – ileride grup / event organize et
        OrganizerSection()

        // Hesap + Logout
        AccountSection(user = user, onLogout = onLogout)
    }
}

@Composable
private fun ProfileHeroCard(user: UserDto) {
    val displayName = user.name?.takeIf { it.isNotBlank() } ?: user.email
    val firstLetter = displayName.firstOrNull()?.uppercaseChar() ?: 'M'

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(26.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.Transparent
        ),
        elevation = CardDefaults.cardElevation(8.dp)
    ) {
        Box(
            modifier = Modifier
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Color(0xFF004058),
                            Color(0xFF005C6E)
                        )
                    )
                )
                .padding(18.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // Avatar
                Box(
                    modifier = Modifier
                        .size(72.dp)
                        .clip(CircleShape)
                        .background(
                            Brush.sweepGradient(
                                listOf(
                                    Color(0xFF38BDF8),
                                    Color(0xFF6366F1),
                                    Color(0xFFF97316),
                                    Color(0xFF22C55E),
                                    Color(0xFF38BDF8)
                                )
                            )
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = firstLetter.toString(),
                        style = MaterialTheme.typography.headlineMedium.copy(
                            fontWeight = FontWeight.ExtraBold,
                            color = Color(0xFF0F172A)
                        )
                    )
                }

                Column(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Text(
                        text = displayName,
                        style = MaterialTheme.typography.titleLarge.copy(
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        ),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    Text(
                        text = user.email,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color(0xFFDBEAFE),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )

                    user.city?.takeIf { it.isNotBlank() }?.let { city ->
                        Text(
                            text = city,
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFFBFDBFE)
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun StatsRow(
    eventsCount: Int,
    interestsCount: Int,
    groupsCount: Int
) {
    Row(
        modifier = Modifier
            .fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        StatCard(
            label = "Groups",
            value = groupsCount.toString(),
            modifier = Modifier.weight(1f)
        )
        StatCard(
            label = "Interests",
            value = interestsCount.toString(),
            modifier = Modifier.weight(1f)
        )
        StatCard(
            label = "RSVPs",
            value = eventsCount.toString(),
            modifier = Modifier.weight(1f)
        )
    }
}

@Composable
private fun StatCard(
    label: String,
    value: String,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.White
        ),
        elevation = CardDefaults.cardElevation(3.dp)
    ) {
        Column(
            modifier = Modifier
                .padding(horizontal = 12.dp, vertical = 10.dp),
            verticalArrangement = Arrangement.spacedBy(2.dp)
        ) {
            Text(
                text = value,
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.Bold
                )
            )
            Text(
                text = label,
                style = MaterialTheme.typography.bodySmall,
                color = MovTextDescription
            )
        }
    }
}

@Composable
private fun LookingForSection() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(22.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.White
        ),
        elevation = CardDefaults.cardElevation(3.dp)
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 14.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = "I'm looking to ✨",
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.SemiBold
                )
            )
            Text(
                text = "Select why you're on Moventra. These tags help match you with better events.",
                style = MaterialTheme.typography.bodySmall,
                color = MovTextDescription
            )

            val options = listOf(
                "Practice hobbies",
                "Socialize",
                "Make friends",
                "Professional network"
            )

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                options.forEach { label ->
                    AssistChip(
                        onClick = { /* TODO: ileride editable hale getir */ },
                        label = { Text(label) }
                    )
                }
            }
        }
    }
}

@Composable
private fun AboutSection(user: UserDto) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(22.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.White
        ),
        elevation = CardDefaults.cardElevation(3.dp)
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 14.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = "About me",
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.SemiBold
                )
            )

            val bio = user.bio?.takeIf { it.isNotBlank() }

            if (bio != null) {
                Text(
                    text = bio,
                    style = MaterialTheme.typography.bodyMedium
                )
            } else {
                Text(
                    text = "Introduce yourself to others on Moventra. This can be short and simple.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MovTextDescription
                )
            }

            val gender = user.gender?.takeIf { it.isNotBlank() }
            if (gender != null) {
                Spacer(Modifier.height(4.dp))
                Text(
                    text = "Gender: $gender",
                    style = MaterialTheme.typography.bodySmall,
                    color = MovTextDescription
                )
            }
        }
    }
}

@Composable
private fun InterestsSection() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(22.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.White
        ),
        elevation = CardDefaults.cardElevation(3.dp)
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 14.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = "Interests",
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.SemiBold
                )
            )
            Text(
                text = "Select your favorite hobbies. We’ll use these to suggest better meetups.",
                style = MaterialTheme.typography.bodySmall,
                color = MovTextDescription
            )

            val interests = listOf(
                "Adventure",
                "Outdoor fitness",
                "Board games",
                "Tech & coding",
                "Language exchange"
            )

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                interests.forEach { label ->
                    AssistChip(
                        onClick = { /* TODO: hobby selection bağlanacak */ },
                        label = { Text(label) }
                    )
                }
            }
        }
    }
}

@Composable
private fun OrganizerSection() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(22.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.White
        ),
        elevation = CardDefaults.cardElevation(3.dp)
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 14.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = "Organizer",
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.SemiBold
                )
            )
            Text(
                text = "Start your own small meetups for the hobbies you care about.",
                style = MaterialTheme.typography.bodySmall,
                color = MovTextDescription
            )

            androidx.compose.material3.OutlinedButton(
                onClick = {
                    // TODO: İleride direkt Create tab'ine navigate
                },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(999.dp)
            ) {
                Text("Start a new group")
            }
        }
    }
}

@Composable
private fun AccountSection(
    user: UserDto,
    onLogout: () -> Unit
) {
    val scope = rememberCoroutineScope()

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(22.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.White
        ),
        elevation = CardDefaults.cardElevation(3.dp)
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 14.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Text(
                text = "Account",
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.SemiBold
                )
            )

            Text(
                text = "Signed in as ${user.email}",
                style = MaterialTheme.typography.bodySmall,
                color = MovTextDescription
            )

            Spacer(Modifier.height(4.dp))

            androidx.compose.material3.Button(
                onClick = {
                    scope.launch { onLogout() }
                },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(999.dp),
                colors = androidx.compose.material3.ButtonDefaults.buttonColors(
                    containerColor = MovGreen1,
                    contentColor = Color.White
                )
            ) {
                Icon(
                    imageVector = Icons.Filled.ExitToApp,
                    contentDescription = null,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(Modifier.width(8.dp))
                Text(
                    text = "Logout",
                    style = MaterialTheme.typography.bodyMedium.copy(
                        fontWeight = FontWeight.Bold
                    )
                )
            }
        }
    }
}
