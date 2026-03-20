package com.moventra.app.location

import android.content.Context
import android.util.Log
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.moventra.app.R

fun loadCountries(context: Context): List<Country> {
    return try {
        val inputStream = context.resources.openRawResource(R.raw.countries)
        val json = inputStream.bufferedReader().use { it.readText() }

        val type = object : TypeToken<List<Country>>() {}.type
        Gson().fromJson<List<Country>>(json, type)
            .map { c ->
                Country(
                    code = c.code,
                    name = c.name,
                    cities = c.cities ?: emptyList()
                )
            }
    } catch (e: Exception) {
        Log.e("LocationLoader", "Error loading countries: ${e.message}", e)
        emptyList()
    }
}
