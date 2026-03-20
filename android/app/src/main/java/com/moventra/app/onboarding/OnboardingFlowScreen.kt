package com.moventra.app.onboarding

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.moventra.app.RetrofitClient
import com.moventra.app.hobbies.HobbyDto
import com.moventra.app.hobbies.SaveHobbiesRequest
import com.moventra.app.ui.theme.MovGreen1
import com.moventra.app.ui.theme.MovGreen2
import com.moventra.app.ui.theme.MovLightBgAlt
import com.moventra.app.ui.theme.MovTextDescription
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

enum class OnboardingStep {
    NAME,
    CITY,
    BIRTHDATE,
    GENDER,
    PURPOSE,
    HOBBIES
}

// Basit ülke/şehir modeli – şimdilik sabit liste
private data class OnboardingCountry(
    val code: String,
    val name: String,
    val cities: List<String>
)

private val DefaultCountries = listOf(
    OnboardingCountry(
        code = "TR",
        name = "Turkey",
        cities = listOf("İzmir", "İstanbul", "Ankara", "Bursa", "Eskişehir")
    ),
    OnboardingCountry(
        code = "DE",
        name = "Germany",
        cities = listOf("Nürnberg", "Erlangen", "München", "Berlin", "Hamburg")
    )
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OnboardingFlowScreen(
    token: String,
    onFinished: () -> Unit
) {
    val bearer = remember(token) { "Bearer $token" }
    val scope = rememberCoroutineScope()

    var loading by remember { mutableStateOf(true) }
    var saving by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }

    var step by remember { mutableStateOf(OnboardingStep.NAME) }

    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }

    // Ülke + şehir
    var countryCode by remember { mutableStateOf<String?>(null) }
    var city by remember { mutableStateOf("") }

    var birthDate by remember { mutableStateOf("") } // "YYYY-MM-DD"
    var gender by remember { mutableStateOf<String?>(null) }
    var purpose by remember { mutableStateOf<String?>(null) }

    var allHobbies by remember { mutableStateOf<List<HobbyDto>>(emptyList()) }
    var selectedHobbyIds by remember { mutableStateOf<Set<Int>>(emptySet()) }

    val countries = remember { DefaultCountries }

    // İlk açılışta profil + hobileri çek
    LaunchedEffect(Unit) {
        try {
            val meResp = RetrofitClient.authApi.me(bearer)
            val me = meResp.user

            if (me.onboardingCompleted == true) {
                onFinished()
                return@LaunchedEffect
            }

            // name -> first + last
            me.name?.let { full ->
                val parts = full.trim().split("\\s+".toRegex())
                if (parts.isNotEmpty()) {
                    firstName = parts.first()
                    lastName = parts.drop(1).joinToString(" ")
                }
            }
            city = me.city.orEmpty()
            birthDate = me.birthDate?.take(10).orEmpty()
            gender = me.gender
            purpose = me.onboardingPurpose

            // Tüm hobiler
            val hobbiesRes = RetrofitClient.hobbiesApi.getAll()
            allHobbies = hobbiesRes.hobbies

            // Kullanıcının seçili hobileri
            val myHobbiesRes = RetrofitClient.hobbiesApi.getMy(bearer)
            selectedHobbyIds = myHobbiesRes.hobbies.map { it.id }.toSet()
        } catch (e: Exception) {
            e.printStackTrace()
            error = "Could not load your profile. Please try again."
        } finally {
            loading = false
        }
    }

    if (loading) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(MovLightBgAlt)
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator()
        }
        return
    }

    val steps = OnboardingStep.values()
    val currentIndex = steps.indexOf(step) + 1
    val totalSteps = steps.size
    val progressFraction = currentIndex.toFloat() / totalSteps.toFloat()

    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MovLightBgAlt)
            .padding(horizontal = 20.dp, vertical = 24.dp)
    ) {
        // Üst başlık
        Text(
            text = "Welcome to Moventra",
            style = MaterialTheme.typography.labelMedium,
            color = MovTextDescription
        )
        Spacer(Modifier.height(4.dp))
        Text(
            text = "We’ll ask a few quick questions to personalize your experience.",
            style = MaterialTheme.typography.bodySmall,
            color = MovTextDescription
        )
        Spacer(Modifier.height(16.dp))

        // Progress bar
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(6.dp)
                .background(
                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f),
                    shape = RoundedCornerShape(999.dp)
                )
        ) {
            Box(
                modifier = Modifier
                    .fillMaxHeight()
                    .fillMaxWidth(progressFraction)
                    .background(
                        brush = Brush.horizontalGradient(
                            listOf(MovGreen1, MovGreen2)
                        ),
                        shape = RoundedCornerShape(999.dp)
                    )
            )
        }
        Spacer(Modifier.height(8.dp))
        Text(
            text = "Step $currentIndex of $totalSteps",
            style = MaterialTheme.typography.labelSmall,
            color = MovTextDescription
        )

        Spacer(Modifier.height(20.dp))

        // Ana kart
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f),
            shape = RoundedCornerShape(24.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 6.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surface
            )
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 18.dp, vertical = 20.dp)
                    .verticalScroll(scrollState),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                when (step) {
                    OnboardingStep.NAME -> {
                        StepTitle(
                            title = "What’s your name?",
                            subtitle = "We’ll show this on your profile and in events."
                        )

                        OutlinedTextField(
                            value = firstName,
                            onValueChange = { firstName = it },
                            label = { Text("First name") },
                            modifier = Modifier.fillMaxWidth()
                        )
                        Spacer(Modifier.height(12.dp))
                        OutlinedTextField(
                            value = lastName,
                            onValueChange = { lastName = it },
                            label = { Text("Last name") },
                            modifier = Modifier.fillMaxWidth()
                        )

                        Spacer(Modifier.height(16.dp))

                        PrimaryActionsRow(
                            onBack = null,
                            nextLabel = if (saving) "Saving..." else "Continue",
                            nextEnabled = !saving
                        ) {
                            if (firstName.isBlank() || lastName.isBlank()) {
                                error = "Please enter your first and last name."
                                return@PrimaryActionsRow
                            }
                            scope.launch {
                                error = null
                                saving = true
                                try {
                                    val body = mapOf(
                                        "name" to (firstName.trim() + " " + lastName.trim())
                                    )
                                    RetrofitClient.authApi.updateMe(bearer, body)
                                    step = OnboardingStep.CITY
                                } catch (e: Exception) {
                                    e.printStackTrace()
                                    error = "Could not save your name."
                                } finally {
                                    saving = false
                                }
                            }
                        }
                    }

                    OnboardingStep.CITY -> {
                        StepTitle(
                            title = "Where are you based?",
                            subtitle = "We’ll use this to surface events in your area."
                        )

                        val selectedCountry = countries.firstOrNull { it.code == countryCode }

                        SimpleDropdownField(
                            label = "Country",
                            value = selectedCountry?.name ?: "",
                            enabled = true,
                            options = countries.map { it.name }
                        ) { selectedName ->
                            val c = countries.first { it.name == selectedName }
                            countryCode = c.code
                            city = ""
                        }

                        Spacer(Modifier.height(12.dp))

                        SimpleDropdownField(
                            label = "City / Region",
                            value = city,
                            enabled = selectedCountry != null,
                            options = selectedCountry?.cities ?: emptyList()
                        ) { selectedCity ->
                            city = selectedCity
                        }

                        Spacer(Modifier.height(16.dp))

                        PrimaryActionsRow(
                            onBack = { step = OnboardingStep.NAME },
                            nextLabel = if (saving) "Saving..." else "Continue",
                            nextEnabled = !saving
                        ) {
                            if (countryCode == null || city.isBlank()) {
                                error = "Please select a country and city."
                                return@PrimaryActionsRow
                            }
                            scope.launch {
                                error = null
                                saving = true
                                try {
                                    // Şimdilik backend'de sadece city alanı var
                                    val body = mapOf("city" to city.trim())
                                    RetrofitClient.authApi.updateMe(bearer, body)
                                    step = OnboardingStep.BIRTHDATE
                                } catch (e: Exception) {
                                    e.printStackTrace()
                                    error = "Could not save your city."
                                } finally {
                                    saving = false
                                }
                            }
                        }
                    }

                    OnboardingStep.BIRTHDATE -> {
                        StepTitle(
                            title = "When were you born?",
                            subtitle = "This helps us keep Moventra age-appropriate."
                        )

                        var showDatePicker by remember { mutableStateOf(false) }

                        if (showDatePicker) {
                            DatePickerDialog(
                                onDismissRequest = { showDatePicker = false },
                                confirmButton = {
                                    TextButton(onClick = {
                                        // Material3 DatePicker çok karışmasın diye
                                        // sistem date picker yerine basit çözüm kullanıyoruz:
                                        // Burada sadece dialog’u kapatıyoruz. Gerçek seçimi istersen
                                        // ileride native date picker ile yaparız.
                                        showDatePicker = false
                                    }) {
                                        Text("OK")
                                    }
                                },
                                dismissButton = {
                                    TextButton(onClick = { showDatePicker = false }) {
                                        Text("Cancel")
                                    }
                                }
                            ) {
                                // Basit DatePicker state ile seçilen tarihi alalım
                                val state = rememberDatePickerState()
                                DatePicker(state = state)

                                // Seçim değiştikçe text’e yaz
                                val millis = state.selectedDateMillis
                                LaunchedEffect(millis) {
                                    if (millis != null) {
                                        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.US)
                                        sdf.timeZone = TimeZone.getTimeZone("UTC")
                                        birthDate = sdf.format(Date(millis))
                                    }
                                }
                            }
                        }

                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { showDatePicker = true }
                        ) {
                            OutlinedTextField(
                                value = birthDate,
                                onValueChange = {},
                                label = { Text("Birth date (YYYY-MM-DD)") },
                                modifier = Modifier.fillMaxWidth(),
                                enabled = false
                            )
                        }

                        Spacer(Modifier.height(8.dp))
                        TextButton(onClick = { showDatePicker = true }) {
                            Text("Select date")
                        }

                        Spacer(Modifier.height(16.dp))

                        PrimaryActionsRow(
                            onBack = { step = OnboardingStep.CITY },
                            nextLabel = if (saving) "Saving..." else "Continue",
                            nextEnabled = !saving
                        ) {
                            if (birthDate.isBlank()) {
                                error = "Please select your birth date."
                                return@PrimaryActionsRow
                            }
                            scope.launch {
                                error = null
                                saving = true
                                try {
                                    val body = mapOf("birthDate" to birthDate.trim())
                                    RetrofitClient.authApi.updateMe(bearer, body)
                                    step = OnboardingStep.GENDER
                                } catch (e: Exception) {
                                    e.printStackTrace()
                                    error = "Could not save your birth date."
                                } finally {
                                    saving = false
                                }
                            }
                        }
                    }

                    OnboardingStep.GENDER -> {
                        StepTitle(
                            title = "How do you describe yourself?",
                            subtitle = "You can change this later from settings."
                        )

                        val options = listOf(
                            "female" to "Female",
                            "male" to "Male",
                            "non_binary" to "Non-binary",
                            "prefer_not_to_say" to "Prefer not to say"
                        )

                        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            options.forEach { (value, label) ->
                                val selected = gender == value
                                GenderPurposeChip(
                                    selected = selected,
                                    label = label,
                                    onClick = { gender = value }
                                )
                            }
                        }

                        Spacer(Modifier.height(12.dp))

                        PrimaryActionsRow(
                            onBack = { step = OnboardingStep.BIRTHDATE },
                            nextLabel = if (saving) "Saving..." else "Continue",
                            nextEnabled = !saving
                        ) {
                            if (gender.isNullOrBlank()) {
                                error = "Please choose one option."
                                return@PrimaryActionsRow
                            }
                            scope.launch {
                                error = null
                                saving = true
                                try {
                                    val body = mapOf("gender" to gender)
                                    RetrofitClient.authApi.updateMe(bearer, body)
                                    step = OnboardingStep.PURPOSE
                                } catch (e: Exception) {
                                    e.printStackTrace()
                                    error = "Could not save your answer."
                                } finally {
                                    saving = false
                                }
                            }
                        }
                    }

                    OnboardingStep.PURPOSE -> {
                        StepTitle(
                            title = "What brings you to Moventra?",
                            subtitle = "This helps us prioritize which events to show first."
                        )

                        val options = listOf(
                            "find_friends" to "Find new friends",
                            "language_practice" to "Practice languages",
                            "try_new_hobbies" to "Try new hobbies",
                            "stay_active" to "Stay active & healthy"
                        )

                        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            options.forEach { (value, label) ->
                                val selected = purpose == value
                                GenderPurposeChip(
                                    selected = selected,
                                    label = label,
                                    onClick = { purpose = value }
                                )
                            }
                        }

                        Spacer(Modifier.height(12.dp))

                        PrimaryActionsRow(
                            onBack = { step = OnboardingStep.GENDER },
                            nextLabel = if (saving) "Saving..." else "Continue",
                            nextEnabled = !saving
                        ) {
                            if (purpose.isNullOrBlank()) {
                                error = "Please choose why you’re using Moventra."
                                return@PrimaryActionsRow
                            }
                            scope.launch {
                                error = null
                                saving = true
                                try {
                                    val body = mapOf("onboardingPurpose" to purpose)
                                    RetrofitClient.authApi.updateMe(bearer, body)
                                    step = OnboardingStep.HOBBIES
                                } catch (e: Exception) {
                                    e.printStackTrace()
                                    error = "Could not save your purpose."
                                } finally {
                                    saving = false
                                }
                            }
                        }
                    }

                    OnboardingStep.HOBBIES -> {
                        StepTitle(
                            title = "Pick your hobbies",
                            subtitle = "We’ll recommend small, local events that match these."
                        )

                        if (allHobbies.isEmpty()) {
                            Text(
                                text = "No hobbies defined yet. You can update this later.",
                                modifier = Modifier.padding(vertical = 8.dp),
                                color = MovTextDescription
                            )
                        } else {
                            LazyColumn(
                                modifier = Modifier.heightIn(max = 260.dp),
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                items(allHobbies) { hobby ->
                                    val selected = selectedHobbyIds.contains(hobby.id)
                                    AssistChip(
                                        onClick = {
                                            selectedHobbyIds = if (selected) {
                                                selectedHobbyIds - hobby.id
                                            } else {
                                                selectedHobbyIds + hobby.id
                                            }
                                        },
                                        label = { Text(hobby.name) },
                                        modifier = Modifier.fillMaxWidth(),
                                        leadingIcon = {
                                            if (selected) {
                                                Icon(
                                                    imageVector = Icons.Filled.Check,
                                                    contentDescription = null
                                                )
                                            }
                                        },
                                        colors = AssistChipDefaults.assistChipColors(
                                            containerColor = if (selected)
                                                MovGreen1.copy(alpha = 0.12f)
                                            else
                                                MaterialTheme.colorScheme.surfaceVariant.copy(
                                                    alpha = 0.35f
                                                )
                                        )
                                    )
                                }
                            }
                        }

                        Spacer(Modifier.height(12.dp))

                        PrimaryActionsRow(
                            onBack = { step = OnboardingStep.PURPOSE },
                            nextLabel = if (saving) "Saving..." else "Finish",
                            nextEnabled = !saving
                        ) {
                            if (selectedHobbyIds.isEmpty()) {
                                error = "Please select at least one hobby."
                                return@PrimaryActionsRow
                            }
                            scope.launch {
                                error = null
                                saving = true
                                try {
                                    RetrofitClient.hobbiesApi.saveMy(
                                        bearer,
                                        SaveHobbiesRequest(
                                            hobbyIds = selectedHobbyIds.toList()
                                        )
                                    )
                                    RetrofitClient.authApi.updateMe(
                                        bearer,
                                        mapOf("onboardingCompleted" to true)
                                    )
                                    onFinished()
                                } catch (e: Exception) {
                                    e.printStackTrace()
                                    error = "Could not save your hobbies."
                                } finally {
                                    saving = false
                                }
                            }
                        }
                    }
                }
            }
        }

        if (error != null) {
            Spacer(Modifier.height(12.dp))
            Text(
                text = error!!,
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodySmall
            )
        }
    }
}

// Basit dropdown helper
@Composable
private fun SimpleDropdownField(
    label: String,
    value: String,
    enabled: Boolean,
    options: List<String>,
    onSelect: (String) -> Unit
) {
    var expanded by remember { mutableStateOf(false) }

    Box {
        OutlinedTextField(
            value = value,
            onValueChange = {},
            readOnly = true,
            enabled = enabled,
            label = { Text(label) },
            trailingIcon = {
                Icon(
                    imageVector = Icons.Filled.ArrowDropDown,
                    contentDescription = null
                )
            },
            modifier = Modifier
                .fillMaxWidth()
                .clickable(enabled = enabled) { expanded = true }
        )

        DropdownMenu(
            expanded = expanded && enabled,
            onDismissRequest = { expanded = false }
        ) {
            options.forEach { option ->
                DropdownMenuItem(
                    text = { Text(option) },
                    onClick = {
                        onSelect(option)
                        expanded = false
                    }
                )
            }
        }
    }
}

@Composable
private fun StepTitle(
    title: String,
    subtitle: String
) {
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Text(
            text = title,
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = subtitle,
            style = MaterialTheme.typography.bodyMedium,
            color = MovTextDescription
        )
    }
}

@Composable
private fun PrimaryActionsRow(
    onBack: (() -> Unit)?,
    nextLabel: String,
    nextEnabled: Boolean,
    onNext: () -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        if (onBack != null) {
            OutlinedButton(
                onClick = onBack,
                modifier = Modifier.weight(1f)
            ) {
                Text("Back")
            }
        }

        Button(
            onClick = onNext,
            enabled = nextEnabled,
            modifier = Modifier.weight(1f)
        ) {
            Text(nextLabel)
        }
    }
}

@Composable
private fun GenderPurposeChip(
    selected: Boolean,
    label: String,
    onClick: () -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(999.dp),
        tonalElevation = if (selected) 4.dp else 0.dp,
        color = if (selected)
            MovGreen1.copy(alpha = 0.12f)
        else
            MaterialTheme.colorScheme.surface
    ) {
        Row(
            modifier = Modifier
                .padding(horizontal = 14.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            RadioButton(
                selected = selected,
                onClick = onClick
            )
            Spacer(Modifier.width(8.dp))
            Text(
                text = label,
                style = MaterialTheme.typography.bodyMedium
            )
        }
    }
}
