package com.moventra.app.hobbies

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST

data class HobbyDto(
    val id: Int,
    val name: String
)

data class HobbiesResponse(
    val hobbies: List<HobbyDto> = emptyList()
)

data class SaveHobbiesRequest(
    val hobbyIds: List<Int>
)

data class SaveHobbiesResponse(
    val message: String? = null
)

interface HobbiesApi {

    @GET("hobbies")
    suspend fun getAll(): HobbiesResponse

    @GET("hobbies/my")
    suspend fun getMy(
        @Header("Authorization") bearerToken: String
    ): HobbiesResponse

    @POST("hobbies/my")
    suspend fun saveMy(
        @Header("Authorization") bearerToken: String,
        @Body body: SaveHobbiesRequest
    ): SaveHobbiesResponse
}
