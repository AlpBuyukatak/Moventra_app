package com.moventra.app.events

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.DELETE



interface EventApi {

    @DELETE("events/{id}")
    suspend fun deleteEvent(
        @Header("Authorization") bearer: String,
        @Path("id") eventId: Int
    ): SimpleMessageResponse

    // Ana event listesi (public, ama Authorization gönderirsek backend token'dan userId çıkarabiliyor)
    @GET("events")
    suspend fun getEvents(
        @Header("Authorization") bearer: String? = null
    ): EventsResponse

    // Event oluşturma
    @POST("events")
    suspend fun createEvent(
        @Header("Authorization") bearer: String,
        @Body body: CreateEventRequest
    ): CreateEventResponse

    // --- JOIN / UNJOIN ---

    @POST("events/{id}/join")
    suspend fun joinEvent(
        @Header("Authorization") bearer: String,
        @Path("id") eventId: Int
    ): JoinEventResponse

    @POST("events/{id}/unjoin")
    suspend fun unjoinEvent(
        @Header("Authorization") bearer: String,
        @Path("id") eventId: Int
    ): SimpleMessageResponse

    // --- FAVORITE / UNFAVORITE ---

    @POST("events/{id}/favorite")
    suspend fun favoriteEvent(
        @Header("Authorization") bearer: String,
        @Path("id") eventId: Int
    ): SimpleMessageResponse

    @POST("events/{id}/unfavorite")
    suspend fun unfavoriteEvent(
        @Header("Authorization") bearer: String,
        @Path("id") eventId: Int
    ): SimpleMessageResponse

    // --- Benim eventlerim (state için kullanacağız) ---

    @GET("events/my/joined")
    suspend fun getMyJoined(
        @Header("Authorization") bearer: String
    ): EventsResponse

    @GET("events/my/created")
    suspend fun getMyCreated(
        @Header("Authorization") bearer: String
    ): EventsResponse

    @GET("events/my/favorites")
    suspend fun getMyFavorites(
        @Header("Authorization") bearer: String
    ): EventsResponse
}
