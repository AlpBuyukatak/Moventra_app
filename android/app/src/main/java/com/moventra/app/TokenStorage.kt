package com.moventra.app

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

// Top-level: Context.dataStore (hiçbir sınıfın içinde DEĞİL)
val Context.dataStore by preferencesDataStore("moventra_prefs")

class TokenStorage(private val context: Context) {

    companion object {
        private val KEY_TOKEN = stringPreferencesKey("jwt_token")
    }

    // Flow: token değişirse UI otomatik güncellenebilir
    val tokenFlow: Flow<String?> = context.dataStore.data.map { prefs ->
        prefs[KEY_TOKEN]
    }

    // Token saklama / silme
    suspend fun saveToken(token: String?) {
        context.dataStore.edit { prefs ->
            if (token == null) {
                prefs.remove(KEY_TOKEN)
            } else {
                prefs[KEY_TOKEN] = token
            }
        }
    }
}
