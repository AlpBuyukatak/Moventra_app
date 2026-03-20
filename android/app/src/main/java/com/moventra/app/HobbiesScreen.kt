package com.moventra.app

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.moventra.app.hobbies.HobbyDto
import com.moventra.app.hobbies.SaveHobbiesRequest
import com.moventra.app.ui.theme.MovGreen1
import com.moventra.app.ui.theme.MovTextDescription
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HobbiesScreen(
    token: String
) {
    val bearer = remember(token) { "Bearer $token" }

    var allHobbies by remember { mutableStateOf<List<HobbyDto>>(emptyList()) }
    var selectedIds by remember { mutableStateOf<Set<Int>>(emptySet()) }

    var loading by remember { mutableStateOf(true) }
    var saving by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var info by remember { mutableStateOf<String?>(null) }

    val scope = rememberCoroutineScope()

    // İlk açılışta listeleri çek
    LaunchedEffect(Unit) {
        try {
            val all = RetrofitClient.hobbiesApi.getAll()
            allHobbies = all.hobbies

            val my = RetrofitClient.hobbiesApi.getMy(bearer)
            selectedIds = my.hobbies.map { it.id }.toSet()
        } catch (e: Exception) {
            e.printStackTrace()
            error = e.message ?: "Could not load hobbies."
        } finally {
            loading = false
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp)
    ) {
        Text(
            text = "Your hobbies",
            style = MaterialTheme.typography.headlineMedium
        )
        Spacer(Modifier.height(4.dp))
        Text(
            text = "Choose what you’re into. We’ll recommend small, local events that match these.",
            style = MaterialTheme.typography.bodyMedium,
            color = MovTextDescription
        )

        Spacer(Modifier.height(16.dp))

        if (loading) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        } else {
            if (allHobbies.isEmpty()) {
                Text(
                    text = "No hobbies defined yet. You’ll be able to update this later.",
                    style = MaterialTheme.typography.bodyMedium
                )
            } else {
                LazyColumn(
                    modifier = Modifier
                        .weight(1f),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(allHobbies) { hobby ->
                        val selected = selectedIds.contains(hobby.id)
                        FilterChip(
                            selected = selected,
                            onClick = {
                                selectedIds = if (selected) {
                                    selectedIds - hobby.id
                                } else {
                                    selectedIds + hobby.id
                                }
                            },
                            label = { Text(hobby.name) }
                        )
                    }
                }

                Spacer(Modifier.height(16.dp))

                Button(
                    onClick = {
                        scope.launch {
                            error = null
                            info = null
                            saving = true
                            try {
                                RetrofitClient.hobbiesApi.saveMy(
                                    bearer,
                                    SaveHobbiesRequest(selectedIds.toList())
                                )
                                info = "Your hobbies have been updated."
                            } catch (e: Exception) {
                                e.printStackTrace()
                                error = e.message ?: "Could not save hobbies."
                            } finally {
                                saving = false
                            }
                        }
                    },
                    enabled = !saving,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(if (saving) "Saving..." else "Save hobbies")
                }
            }
        }

        if (error != null) {
            Spacer(Modifier.height(8.dp))
            Text(
                text = error!!,
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodySmall
            )
        }

        if (info != null) {
            Spacer(Modifier.height(8.dp))
            Text(
                text = info!!,
                color = MovGreen1,
                style = MaterialTheme.typography.bodySmall
            )
        }
    }
}
