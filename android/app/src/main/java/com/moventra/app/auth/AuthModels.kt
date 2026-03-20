package com.moventra.app
// Dikkat: package satırı com.moventra.app kalsın,
// klasörünün auth olması sorun değil.

data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val email: String,
    val password: String,
    val name: String,
    val city: String? = null
)

/**
 * Backend /auth/me select ile uyumlu UserDto
 * Onboarding için gerekli alanlar da var.
 */
data class UserDto(
    val id: Int,
    val email: String,
    val name: String?,
    val city: String?,
    val createdAt: String? = null,
    val googleId: String? = null,
    val appleId: String? = null,
    val avatarUrl: String? = null,
    val isEmailVerified: Boolean = false,

    // 🔥 Onboarding alanları
    val onboardingCompleted: Boolean? = null,
    val onboardingPurpose: String? = null,
    val birthDate: String? = null,   // ör: "1995-03-21T00:00:00.000Z"
    val gender: String? = null,

    val planType: String? = null,
    val bio: String? = null,
    val showGroups: Boolean? = null,
    val showInterests: Boolean? = null,
    val isActive: Boolean? = null,
    val deactivatedAt: String? = null,
    val deactivationScheduledAt: String? = null
)

data class MeResponse(
    val user: UserDto
)

data class LoginResponse(
    val token: String,
    val user: UserDto
)

// Google login request
data class GoogleLoginRequest(
    val idToken: String
)
