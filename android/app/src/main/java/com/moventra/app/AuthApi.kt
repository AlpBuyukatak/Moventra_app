package com.moventra.app

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.PUT

/**
 * DİKKAT:
 * - LoginRequest, RegisterRequest, LoginResponse, MeResponse, UserDto
 *   AuthModels.kt içinde tanımlı.
 */

interface AuthApi {

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): LoginResponse

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): LoginResponse

    @GET("auth/me")
    suspend fun me(@Header("Authorization") bearerToken: String): MeResponse

    // Onboarding + profil update
    @PUT("auth/me")
    suspend fun updateMe(
        @Header("Authorization") bearerToken: String,
        @Body body: Map<String, @JvmSuppressWildcards Any?>
    ): MeResponse

    @POST("auth/google")
    suspend fun googleLogin(
        @Body request: GoogleLoginRequest
    ): LoginResponse
}
