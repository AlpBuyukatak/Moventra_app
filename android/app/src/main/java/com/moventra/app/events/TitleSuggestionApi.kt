package com.moventra.app.events

import retrofit2.http.Body
import retrofit2.http.POST

// ✅ Burada tanımlıyoruz, bütün projede bu paketten görünecek
data class TitleSuggestionRequest(
    val hobbyName: String,
    val language: String? = null   // şimdilik kullanmasak da backend destekli
)

data class TitleSuggestionResponse(
    val suggestions: List<String>
)

interface TitleSuggestionApi {

    @POST("ai/title-suggestions")
    suspend fun getTitleSuggestions(
        @Body body: TitleSuggestionRequest
    ): TitleSuggestionResponse
}
