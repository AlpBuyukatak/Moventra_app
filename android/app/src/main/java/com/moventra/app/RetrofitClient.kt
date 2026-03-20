package com.moventra.app

import com.moventra.app.events.EventApi
import com.moventra.app.events.TitleSuggestionApi
import com.moventra.app.hobbies.HobbiesApi
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {

    // Android Emulator → backend bağlantısı
    private const val BASE_URL = "http://10.0.2.2:4000/"

    // Logging interceptor
    private val logging = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    // HTTP Client
    private val client: OkHttpClient = OkHttpClient.Builder()
        .addInterceptor(logging)
        .build()

    // Retrofit Builder
    private val retrofit: Retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(client)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    // 🔐 Auth API
    val authApi: AuthApi = retrofit.create(AuthApi::class.java)

    // 📅 Event API
    val eventApi: EventApi = retrofit.create(EventApi::class.java)

    // 💡 Title suggestion API
    val titleSuggestionApi: TitleSuggestionApi =
        retrofit.create(TitleSuggestionApi::class.java)

    // ⭐ Hobbies API (onboarding için zorunlu)
    val hobbiesApi: HobbiesApi = retrofit.create(HobbiesApi::class.java)
}
