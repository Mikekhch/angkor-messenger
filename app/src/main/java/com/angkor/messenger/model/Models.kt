package com.angkor.messenger.model

data class User(
    val id: String,
    val name: String,
    val email: String,
    val avatar: String,
    val authProvider: String,
    val status: String,
    val isBanned: Boolean = false,
    val pin: String? = "1234",
    val biometricEnabled: Boolean = true,
    val lastActive: String? = null
)

data class FeatureFlags(
    val video_calling: Boolean = true,
    val voice_calling: Boolean = true,
    val file_sharing: Boolean = true
)

data class ChatMessage(
    val id: String,
    val senderId: String,
    val receiverId: String,
    val content: String,
    val type: String = "text", // "text" or "file"
    val fileUrl: String? = null,
    val fileName: String? = null,
    val timestamp: String
)

data class LoginRequest(
    val email: String,
    val name: String? = null,
    val provider: String? = "google",
    val avatar: String? = null
)

data class AuthResponse(
    val success: Boolean,
    val user: User? = null,
    val error: String? = null
)

data class VerifyPinRequest(
    val userId: String,
    val pin: String
)

data class UpdateSettingsRequest(
    val userId: String,
    val pin: String? = null,
    val biometricEnabled: Boolean? = null,
    val activeStatus: Boolean? = null
)

data class BroadcastNotification(
    val id: String,
    val title: String,
    val body: String,
    val timestamp: String
)
