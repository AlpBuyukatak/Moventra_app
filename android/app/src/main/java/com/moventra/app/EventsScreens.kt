package com.moventra.app

import android.app.DatePickerDialog
import android.app.TimePickerDialog
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.moventra.app.events.CreateEventRequest
import com.moventra.app.events.EventDto
import com.moventra.app.events.TitleSuggestionRequest
import com.moventra.app.hobbies.HobbyDto
import com.moventra.app.location.Country
import com.moventra.app.location.loadCountries
import com.moventra.app.ui.theme.MovGreen1
import com.moventra.app.ui.theme.MovLightBgAlt
import com.moventra.app.ui.theme.MovTextDescription
import kotlinx.coroutines.launch
import java.util.Calendar

// --- TAB 1: EVENTS (event listesi + profil info + logout + full-screen detail) ---

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EventsScreen(
    token: String,
    onLogout: () -> Unit
) {
    val bearer = remember(token) { "Bearer $token" }
    val scope = rememberCoroutineScope()
    val snackbarHostState = remember { SnackbarHostState() }

    var events by remember { mutableStateOf<List<EventDto>?>(null) }
    var eventsError by remember { mutableStateOf<String?>(null) }
    var eventsLoading by remember { mutableStateOf(true) }

    var me by remember { mutableStateOf<UserDto?>(null) }
    var meError by remember { mutableStateOf<String?>(null) }
    var meLoading by remember { mutableStateOf(true) }

    // Kullanıcının state'i: hangi eventlere katılmış / oluşturmuş / favori
    var joinedIds by remember { mutableStateOf<Set<Int>>(emptySet()) }
    var createdIds by remember { mutableStateOf<Set<Int>>(emptySet()) }
    var favoriteIds by remember { mutableStateOf<Set<Int>>(emptySet()) }

    // Tam sayfa detay için seçili event
    var selectedEvent by remember { mutableStateOf<EventDto?>(null) }

    // Event + my* endpoint'lerini yükle
    LaunchedEffect(Unit) {
        try {
            // Events
            eventsLoading = true
            eventsError = null
            val eventsResp = RetrofitClient.eventApi.getEvents(bearer)
            events = eventsResp.events
        } catch (e: Exception) {
            eventsError = e.message ?: "Unknown error"
        } finally {
            eventsLoading = false
        }

        // Me
        try {
            val meResp = RetrofitClient.authApi.me(bearer)
            me = meResp.user
        } catch (e: Exception) {
            meError = e.message ?: "Error loading profile"
        } finally {
            meLoading = false
        }

        // My joined / created / favorites
        try {
            val joinedResp = RetrofitClient.eventApi.getMyJoined(bearer)
            joinedIds = joinedResp.events.map { it.id }.toSet()
        } catch (_: Exception) {
            // sessiz geç
        }

        try {
            val createdResp = RetrofitClient.eventApi.getMyCreated(bearer)
            createdIds = createdResp.events.map { it.id }.toSet()
        } catch (_: Exception) {
        }

        try {
            val favResp = RetrofitClient.eventApi.getMyFavorites(bearer)
            favoriteIds = favResp.events.map { it.id }.toSet()
        } catch (_: Exception) {
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(MovLightBgAlt)
                .padding(innerPadding)
        ) {
            if (selectedEvent == null) {
                // Liste ekranı
                EventsListContent(
                    me = me,
                    meLoading = meLoading,
                    meError = meError,
                    events = events,
                    eventsLoading = eventsLoading,
                    eventsError = eventsError,
                    joinedIds = joinedIds,
                    createdIds = createdIds,
                    onLogout = onLogout,
                    onRetry = {
                        scope.launch {
                            try {
                                eventsLoading = true
                                eventsError = null
                                val eventsResp = RetrofitClient.eventApi.getEvents(bearer)
                                events = eventsResp.events
                            } catch (e: Exception) {
                                eventsError = e.message ?: "Unknown error"
                            } finally {
                                eventsLoading = false
                            }
                        }
                    },
                    onEventClick = { ev -> selectedEvent = ev }
                )
            } else {
                // Tam sayfa detay ekranı
                val event = selectedEvent!!
                val isJoined = joinedIds.contains(event.id)
                val isFavorite = favoriteIds.contains(event.id)
                val isOrganizer = createdIds.contains(event.id)

                EventDetailScreen(
                    event = event,
                    isJoined = isJoined,
                    isFavorite = isFavorite,
                    isOrganizer = isOrganizer,
                    onBack = { selectedEvent = null },
                    onJoinToggle = {
                        scope.launch {
                            try {
                                if (!isJoined) {
                                    RetrofitClient.eventApi.joinEvent(bearer, event.id)
                                    joinedIds = joinedIds + event.id
                                    snackbarHostState.showSnackbar("You’ve joined this event ✨")
                                } else {
                                    RetrofitClient.eventApi.unjoinEvent(bearer, event.id)
                                    joinedIds = joinedIds - event.id
                                    snackbarHostState.showSnackbar("You’ve left this event")
                                }
                            } catch (e: Exception) {
                                snackbarHostState.showSnackbar(
                                    e.message ?: "Could not update join status"
                                )
                            }
                        }
                    },
                    onFavoriteToggle = {
                        scope.launch {
                            try {
                                if (!isFavorite) {
                                    RetrofitClient.eventApi.favoriteEvent(bearer, event.id)
                                    favoriteIds = favoriteIds + event.id
                                    snackbarHostState.showSnackbar("Added to favorites")
                                } else {
                                    RetrofitClient.eventApi.unfavoriteEvent(bearer, event.id)
                                    favoriteIds = favoriteIds - event.id
                                    snackbarHostState.showSnackbar("Removed from favorites")
                                }
                            } catch (e: Exception) {
                                snackbarHostState.showSnackbar(
                                    e.message ?: "Could not update favorites"
                                )
                            }
                        }
                    },
                    onDelete = {
                        scope.launch {
                            try {
                                RetrofitClient.eventApi.deleteEvent(bearer, event.id)
                                // listedeki event'i çıkar
                                events = events?.filterNot { it.id == event.id }
                                joinedIds = joinedIds - event.id
                                favoriteIds = favoriteIds - event.id
                                createdIds = createdIds - event.id
                                selectedEvent = null
                                snackbarHostState.showSnackbar("Event deleted")
                            } catch (e: Exception) {
                                snackbarHostState.showSnackbar(
                                    e.message ?: "Could not delete event"
                                )
                            }
                        }
                    }
                )
            }
        }
    }
}

@Composable
private fun EventsListContent(
    me: UserDto?,
    meLoading: Boolean,
    meError: String?,
    events: List<EventDto>?,
    eventsLoading: Boolean,
    eventsError: String?,
    joinedIds: Set<Int>,
    createdIds: Set<Int>,
    onLogout: () -> Unit,
    onRetry: () -> Unit,
    onEventClick: (EventDto) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp, vertical = 18.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Başlık + profil bilgisi + logout
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = "Discover events",
                    style = MaterialTheme.typography.headlineMedium
                )
                Text(
                    text = "Small, hobby-first meetups in your city.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MovTextDescription
                )

                when {
                    meLoading -> Text(
                        text = "Loading profile...",
                        style = MaterialTheme.typography.bodySmall,
                        color = MovTextDescription
                    )

                    me != null -> Text(
                        text = "Signed in as ${me.name ?: me.email}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MovTextDescription
                    )

                    meError != null -> Text(
                        text = "Profile error",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.error
                    )
                }
            }

            TextButton(onClick = onLogout) {
                Text("Logout")
            }
        }

        // Küçük info bar
        if (!eventsLoading && !events.isNullOrEmpty()) {
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = MaterialTheme.shapes.extraLarge,
                tonalElevation = 2.dp
            ) {
                Row(
                    modifier = Modifier
                        .padding(horizontal = 14.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "${events!!.size} events found",
                        style = MaterialTheme.typography.labelMedium,
                        color = MovTextDescription
                    )
                    Text(
                        text = "Tap a card to see details",
                        style = MaterialTheme.typography.labelSmall,
                        color = MovTextDescription
                    )
                }
            }
        }

        when {
            eventsLoading -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(top = 24.dp),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }

            eventsError != null -> {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(top = 32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text(
                        text = "Error: $eventsError",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.error
                    )
                    Spacer(Modifier.height(12.dp))
                    OutlinedButton(onClick = onRetry) {
                        Text("Try again")
                    }
                }
            }

            events.isNullOrEmpty() -> {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(top = 32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text(
                        text = "No events found.",
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Spacer(Modifier.height(4.dp))
                    Text(
                        text = "Try changing your city or create the first meetup!",
                        style = MaterialTheme.typography.bodySmall,
                        color = MovTextDescription
                    )
                }
            }

            else -> {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(events!!) { event ->
                        val isJoined = joinedIds.contains(event.id)
                        val isOrganizer = createdIds.contains(event.id)

                        EventCard(
                            event = event,
                            isJoined = isJoined,
                            isOrganizer = isOrganizer,
                            onClick = { onEventClick(event) }
                        )
                    }
                }
            }
        }
    }
}

// --- TAB 2: CREATE (GERÇEK FORM) ---

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateEventScreen(
    token: String
) {
    val context = LocalContext.current
    val countries = remember { loadCountries(context) }

    // Country & City (countries.json'dan)
    var selectedCountry by remember { mutableStateOf<Country?>(null) }
    var selectedCity by remember { mutableStateOf<String?>(null) }
    val availableCities = selectedCountry?.cities ?: emptyList()

    var countryMenuExpanded by remember { mutableStateOf(false) }
    var cityMenuExpanded by remember { mutableStateOf(false) }

    val bearer = remember(token) { "Bearer $token" }
    val scope = rememberCoroutineScope()
    val calendar = remember { Calendar.getInstance() }

    var title by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }

    // Date & time picker display değerleri
    var dateDisplay by remember { mutableStateOf("") }   // 15.12.2026
    var timeDisplay by remember { mutableStateOf("") }   // 12:30

    var capacityText by remember { mutableStateOf("") }

    var hobbies by remember { mutableStateOf<List<HobbyDto>>(emptyList()) }
    var hobbiesLoading by remember { mutableStateOf(true) }
    var selectedHobby by remember { mutableStateOf<HobbyDto?>(null) }

    // Gemini title suggestions state
    var titleSuggestions by remember { mutableStateOf<List<String>>(emptyList()) }
    var titleSuggestionsLoading by remember { mutableStateOf(false) }
    var titleSuggestionsError by remember { mutableStateOf<String?>(null) }

    var submitting by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var success by remember { mutableStateOf<String?>(null) }

    val scrollState = rememberScrollState()

    // Hobi listesini çek (dropdown için)
    LaunchedEffect(Unit) {
        try {
            val res = RetrofitClient.hobbiesApi.getAll()
            hobbies = res.hobbies
        } catch (e: Exception) {
            e.printStackTrace()
            error = "Could not load hobbies. You can still fill the other fields."
        } finally {
            hobbiesLoading = false
        }
    }

    // Seçili hobi değişince title önerilerini Gemini'den çek
    LaunchedEffect(selectedHobby?.id) {
        titleSuggestions = emptyList()
        titleSuggestionsError = null

        val hobby = selectedHobby ?: return@LaunchedEffect
        val hobbyName = hobby.name.trim()
        if (hobbyName.isEmpty()) return@LaunchedEffect

        titleSuggestionsLoading = true
        try {
            val resp = RetrofitClient.titleSuggestionApi.getTitleSuggestions(
                TitleSuggestionRequest(hobbyName = hobbyName)
            )
            titleSuggestions = resp.suggestions
        } catch (e: Exception) {
            e.printStackTrace()
            titleSuggestionsError = e.message ?: "Could not load title suggestions."
        } finally {
            titleSuggestionsLoading = false
        }
    }

    // --- Date picker dialog ---
    fun openDatePicker() {
        val year = calendar.get(Calendar.YEAR)
        val month = calendar.get(Calendar.MONTH)
        val day = calendar.get(Calendar.DAY_OF_MONTH)

        DatePickerDialog(
            context,
            { _, y, m, d ->
                val mm = (m + 1).toString().padStart(2, '0')
                val dd = d.toString().padStart(2, '0')
                dateDisplay = "$dd.$mm.$y"          // kullanıcıya gösterilen format
            },
            year,
            month,
            day
        ).show()
    }

    // --- Time picker dialog ---
    fun openTimePicker() {
        val hour = calendar.get(Calendar.HOUR_OF_DAY)
        val minute = calendar.get(Calendar.MINUTE)

        TimePickerDialog(
            context,
            { _, h, m ->
                val hh = h.toString().padStart(2, '0')
                val mm = m.toString().padStart(2, '0')
                timeDisplay = "$hh:$mm"
            },
            hour,
            minute,
            true
        ).show()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .padding(24.dp),
        verticalArrangement = Arrangement.Top
    ) {
        Text(
            text = "Create a new event",
            style = MaterialTheme.typography.headlineMedium
        )
        Spacer(Modifier.height(4.dp))
        Text(
            text = "Host a small, hobby-first meetup and share it with your city.",
            style = MaterialTheme.typography.bodyMedium,
            color = MovTextDescription
        )

        Spacer(Modifier.height(24.dp))

        // 1) HOBBY (web ile aynı en üstte)
        var hobbyMenuExpanded by remember { mutableStateOf(false) }

        ExposedDropdownMenuBox(
            expanded = hobbyMenuExpanded,
            onExpandedChange = { hobbyMenuExpanded = !hobbyMenuExpanded }
        ) {
            OutlinedTextField(
                value = selectedHobby?.name ?: "",
                onValueChange = {},
                readOnly = true,
                label = { Text("Hobby *") },
                trailingIcon = {
                    ExposedDropdownMenuDefaults.TrailingIcon(expanded = hobbyMenuExpanded)
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .menuAnchor(),
                enabled = !hobbiesLoading && hobbies.isNotEmpty()
            )

            ExposedDropdownMenu(
                expanded = hobbyMenuExpanded,
                onDismissRequest = { hobbyMenuExpanded = false }
            ) {
                hobbies.forEach { hobby ->
                    DropdownMenuItem(
                        text = { Text(hobby.name) },
                        onClick = {
                            selectedHobby = hobby
                            hobbyMenuExpanded = false
                        }
                    )
                }
            }
        }

        if (hobbiesLoading) {
            Spacer(Modifier.height(8.dp))
            Text(
                text = "Loading hobbies...",
                style = MaterialTheme.typography.bodySmall,
                color = MovTextDescription
            )
        }

        Spacer(Modifier.height(16.dp))

        // 2) TITLE
        OutlinedTextField(
            value = title,
            onValueChange = { title = it },
            label = { Text("Title *") },
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(Modifier.height(8.dp))

        // Title suggestions (Gemini)
        if (selectedHobby != null) {
            when {
                titleSuggestionsLoading -> {
                    Text(
                        text = "Loading title ideas...",
                        style = MaterialTheme.typography.bodySmall,
                        color = MovTextDescription
                    )
                }

                titleSuggestions.isNotEmpty() -> {
                    Text(
                        text = "Title ideas",
                        style = MaterialTheme.typography.bodySmall,
                        color = MovTextDescription
                    )
                    Spacer(Modifier.height(4.dp))

                    Column(
                        verticalArrangement = Arrangement.spacedBy(6.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        titleSuggestions.forEach { suggestion ->
                            AssistChip(
                                onClick = { title = suggestion },
                                label = {
                                    Text(
                                        text = suggestion,
                                        maxLines = 1
                                    )
                                },
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                    }

                    Spacer(Modifier.height(4.dp))
                    Text(
                        text = "You can still type your own title.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MovTextDescription
                    )
                }

                titleSuggestionsError != null -> {
                    Text(
                        text = "Could not load title suggestions. You can still type your own title.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MovTextDescription
                    )
                }
            }
        } else {
            Text(
                text = "Select a hobby to see title ideas.",
                style = MaterialTheme.typography.bodySmall,
                color = MovTextDescription
            )
        }

        Spacer(Modifier.height(12.dp))

        // 3) DESCRIPTION
        OutlinedTextField(
            value = description,
            onValueChange = { description = it },
            label = { Text("Description") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 3
        )

        Spacer(Modifier.height(16.dp))

        // 4) LOCATION (COUNTRY + CITY)
        Text(
            text = "Location *",
            style = MaterialTheme.typography.bodyMedium
        )
        Spacer(Modifier.height(6.dp))

        // Country dropdown
        ExposedDropdownMenuBox(
            expanded = countryMenuExpanded,
            onExpandedChange = { countryMenuExpanded = !countryMenuExpanded }
        ) {
            OutlinedTextField(
                value = selectedCountry?.name ?: "",
                onValueChange = {},
                readOnly = true,
                label = { Text("Country") },
                trailingIcon = {
                    ExposedDropdownMenuDefaults.TrailingIcon(expanded = countryMenuExpanded)
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .menuAnchor()
            )

            ExposedDropdownMenu(
                expanded = countryMenuExpanded,
                onDismissRequest = { countryMenuExpanded = false }
            ) {
                countries.forEach { country ->
                    DropdownMenuItem(
                        text = { Text(country.name) },
                        onClick = {
                            selectedCountry = country
                            selectedCity = null        // ülke değişince şehir sıfırlansın
                            countryMenuExpanded = false
                        }
                    )
                }
            }
        }

        Spacer(Modifier.height(8.dp))

        // City dropdown (ülke seçilmeden aktif olmasın)
        ExposedDropdownMenuBox(
            expanded = cityMenuExpanded,
            onExpandedChange = {
                if (selectedCountry != null) {
                    cityMenuExpanded = !cityMenuExpanded
                }
            }
        ) {
            OutlinedTextField(
                value = selectedCity ?: "",
                onValueChange = {},
                readOnly = true,
                label = { Text("City") },
                enabled = selectedCountry != null && availableCities.isNotEmpty(),
                trailingIcon = {
                    ExposedDropdownMenuDefaults.TrailingIcon(expanded = cityMenuExpanded)
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .menuAnchor()
            )

            ExposedDropdownMenu(
                expanded = cityMenuExpanded,
                onDismissRequest = { cityMenuExpanded = false }
            ) {
                availableCities.forEach { city ->
                    DropdownMenuItem(
                        text = { Text(city) },
                        onClick = {
                            selectedCity = city
                            cityMenuExpanded = false
                        }
                    )
                }
            }
        }

        Spacer(Modifier.height(6.dp))
        Text(
            text = "We’ll use the city for discovery and the country as a short location tag.",
            style = MaterialTheme.typography.bodySmall,
            color = MovTextDescription
        )

        Spacer(Modifier.height(16.dp))

        // 5) DATE & TIME (picker-only)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // DATE
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clickable { openDatePicker() }
            ) {
                OutlinedTextField(
                    value = dateDisplay,
                    onValueChange = {},
                    label = { Text("Date (YYYY-MM-DD) *") },
                    enabled = false,
                    modifier = Modifier.fillMaxWidth()
                )
            }

            // TIME
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clickable { openTimePicker() }
            ) {
                OutlinedTextField(
                    value = timeDisplay,
                    onValueChange = {},
                    label = { Text("Time (HH:MM) *") },
                    enabled = false,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }

        Spacer(Modifier.height(12.dp))

        // 6) CAPACITY
        OutlinedTextField(
            value = capacityText,
            onValueChange = { capacityText = it },
            label = { Text("Capacity (optional)") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(Modifier.height(24.dp))

        // SUBMIT BUTTON
        Button(
            onClick = {
                error = null
                success = null

                val trimmedTitle = title.trim()
                val trimmedDesc = description.trim()

                if (selectedHobby == null) {
                    error = "Please choose a hobby for this event."
                    return@Button
                }
                if (
                    trimmedTitle.isBlank() ||
                    selectedCountry == null ||
                    selectedCity.isNullOrBlank() ||
                    dateDisplay.isBlank() ||
                    timeDisplay.isBlank()
                ) {
                    error = "Please fill the required fields (title, country, city, date and time)."
                    return@Button
                }

                if (trimmedTitle.length < 8) {
                    error = "Please write a slightly longer title (at least 8 characters)."
                    return@Button
                }

                if (trimmedDesc.length < 20) {
                    error =
                        "Please add a short description (at least 20 characters) about level, vibe, language and meeting point."
                    return@Button
                }

                val capacity = capacityText.trim().takeIf { it.isNotEmpty() }?.toIntOrNull()
                if (capacityText.isNotBlank() && capacity == null) {
                    error = "Capacity must be a number."
                    return@Button
                }

                // dateDisplay "dd.MM.yyyy" -> "yyyy-MM-dd"
                val normalizedDate = dateDisplay
                    .replace('.', '-')
                    .split('-', '.', ' ')
                    .let { parts ->
                        if (parts.size == 3) {
                            val dd = parts[0].padStart(2, '0')
                            val mm = parts[1].padStart(2, '0')
                            val yyyy = parts[2]
                            "$yyyy-$mm-$dd"
                        } else dateDisplay
                    }

                val normalizedTime = timeDisplay.replace('.', ':')

                val dateOk = Regex("""\d{4}-\d{2}-\d{2}""").matches(normalizedDate)
                val timeOk = Regex("""\d{2}:\d{2}""").matches(normalizedTime)

                if (!dateOk || !timeOk) {
                    error = "Please enter a valid date and time."
                    return@Button
                }

                val dateTimeIso = "${normalizedDate}T$normalizedTime:00"

                val request = CreateEventRequest(
                    title = trimmedTitle,
                    description = trimmedDesc.ifBlank { null },
                    city = selectedCity!!.trim(),                  // WEB: city
                    location = selectedCountry?.name?.trim(),      // WEB: country -> location
                    dateTime = dateTimeIso,
                    hobbyId = selectedHobby!!.id,
                    capacity = capacity
                )

                scope.launch {
                    submitting = true
                    try {
                        RetrofitClient.eventApi.createEvent(bearer, request)
                        success = "Your event has been created 🎉"

                        // formu temizle
                        title = ""
                        description = ""
                        selectedCountry = null
                        selectedCity = null
                        dateDisplay = ""
                        timeDisplay = ""
                        capacityText = ""
                        selectedHobby = null
                        titleSuggestions = emptyList()
                        titleSuggestionsError = null
                    } catch (e: Exception) {
                        e.printStackTrace()
                        error = e.message ?: "Could not create event."
                    } finally {
                        submitting = false
                    }
                }
            },
            enabled = !submitting,
            modifier = Modifier
                .fillMaxWidth()
        ) {
            Text(if (submitting) "Creating..." else "Create event")
        }

        if (error != null) {
            Spacer(Modifier.height(8.dp))
            Text(
                text = error!!,
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodySmall
            )
        }

        if (success != null) {
            Spacer(Modifier.height(8.dp))
            Text(
                text = success!!,
                color = MovGreen1,
                style = MaterialTheme.typography.bodySmall
            )
        }

        Spacer(Modifier.height(32.dp))
    }
}

// --- Ortak EventCard + tarih formatlama ---

@Composable
fun EventCard(
    event: EventDto,
    isJoined: Boolean,
    isOrganizer: Boolean,
    onClick: () -> Unit
) {
    val joinedCount = event.participants?.size ?: 0

    // Capacity / Joined satırı için küçük helper
    val capacityLine: String? = when {
        event.capacity != null && joinedCount > 0 ->
            "Capacity: ${event.capacity} • Joined: $joinedCount"
        event.capacity != null ->
            "Capacity: ${event.capacity}"
        joinedCount > 0 ->
            "Joined: $joinedCount"
        else -> null
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        shape = MaterialTheme.shapes.large
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Text(
                        text = event.title,
                        style = MaterialTheme.typography.titleMedium,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                    Text(
                        text = "${event.city} • ${formatDateTime(event.dateTime)}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MovTextDescription
                    )
                }

                Column(
                    horizontalAlignment = Alignment.End,
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        if (isOrganizer) {
                            AssistChip(
                                onClick = {},
                                label = { Text("Organizer") }
                            )
                        }
                        if (isJoined) {
                            AssistChip(
                                onClick = {},
                                label = { Text("Joined") }
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(4.dp))

            if (!event.description.isNullOrBlank()) {
                Text(
                    text = event.description ?: "",
                    style = MaterialTheme.typography.bodyMedium,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )

                Spacer(modifier = Modifier.height(6.dp))
            }

            if (capacityLine != null) {
                Text(
                    text = capacityLine,
                    style = MaterialTheme.typography.bodySmall,
                    color = MovTextDescription
                )
            }
        }
    }
}

fun formatDateTime(iso: String): String {
    return try {
        if (iso.length >= 16 && iso[10] == 'T') {
            val date = iso.substring(0, 10)
            val time = iso.substring(11, 16)
            "$date $time"
        } else {
            iso
        }
    } catch (e: Exception) {
        iso
    }
}

// --- Tam sayfa Event detail ekranı (dialog yerine) ---

@Composable
fun EventDetailScreen(
    event: EventDto,
    isJoined: Boolean,
    isFavorite: Boolean,
    isOrganizer: Boolean,
    onBack: () -> Unit,
    onJoinToggle: () -> Unit,
    onFavoriteToggle: () -> Unit,
    onDelete: () -> Unit
) {
    val joinedCount = event.participants?.size ?: 0

    val capacityLine: String? = when {
        event.capacity != null && joinedCount > 0 ->
            "Capacity: ${event.capacity} • Joined: $joinedCount"
        event.capacity != null ->
            "Capacity: ${event.capacity}"
        joinedCount > 0 ->
            "Joined: $joinedCount"
        else -> null
    }

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MovLightBgAlt
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp, vertical = 18.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Top bar
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.Filled.ArrowBack,
                            contentDescription = "Back"
                        )
                    }
                    Text(
                        text = "Event details",
                        style = MaterialTheme.typography.titleMedium
                    )
                }
            }

            // Kart içinde detay
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = MaterialTheme.shapes.extraLarge,
                elevation = CardDefaults.cardElevation(defaultElevation = 6.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 18.dp, vertical = 20.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Text(
                        text = event.title,
                        style = MaterialTheme.typography.headlineSmall
                    )

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        // Time (ikon yok, sadece text)
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = formatDateTime(event.dateTime),
                                style = MaterialTheme.typography.bodySmall,
                                color = MovTextDescription
                            )
                        }
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Filled.LocationOn,
                                contentDescription = null,
                                modifier = Modifier.size(18.dp),
                                tint = MovTextDescription
                            )
                            Spacer(Modifier.width(4.dp))
                            Text(
                                text = event.city,
                                style = MaterialTheme.typography.bodySmall,
                                color = MovTextDescription
                            )
                        }
                    }

                    if (!event.location.isNullOrBlank()) {
                        Text(
                            text = event.location,
                            style = MaterialTheme.typography.bodySmall,
                            color = MovTextDescription
                        )
                    }

                    Divider()

                    if (!event.description.isNullOrBlank()) {
                        Text(
                            text = event.description,
                            style = MaterialTheme.typography.bodyMedium
                        )
                    } else {
                        Text(
                            text = "No detailed description provided.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MovTextDescription
                        )
                    }

                    if (capacityLine != null) {
                        Text(
                            text = capacityLine,
                            style = MaterialTheme.typography.bodySmall,
                            color = MovTextDescription
                        )
                    }
                }
            }

            Spacer(Modifier.height(4.dp))

            // Alt CTA butonları
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Button(
                    onClick = onJoinToggle,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(if (isJoined) "Leave event" else "Join this event")
                }

                OutlinedButton(
                    onClick = onFavoriteToggle,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(if (isFavorite) "Remove favorite" else "Save for later")
                }

                if (isOrganizer) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        OutlinedButton(
                            onClick = { /* TODO: Edit flow (ileride) */ },
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Edit")
                        }
                        OutlinedButton(
                            onClick = onDelete,
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.outlinedButtonColors(
                                contentColor = MaterialTheme.colorScheme.error
                            )
                        ) {
                            Text("Delete")
                        }
                    }
                }
            }
        }
    }
}
