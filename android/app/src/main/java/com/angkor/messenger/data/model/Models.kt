package com.angkor.messenger.data.model

import com.google.gson.annotations.SerializedName

data class User(
    val id: Int,
    val username: String,
    val email: String? = null,
    @SerializedName("display_name") val displayName: String? = null,
    @SerializedName("avatar_url") val avatarUrl: String? = null,
    val role: String = "user",
    val status: String = "offline",
    @SerializedName("is_blocked") val isBlocked: Int = 0
)

data class AuthResponse(
    val token: String,
    val user: User
)

data class LoginRequest(
    val username: String,
    val password: String
)

data class RegisterRequest(
    val username: String,
    val email: String,
    val password: String,
    @SerializedName("display_name") val displayName: String? = null
)

data class Channel(
    val id: Int,
    val name: String,
    val description: String? = null,
    @SerializedName("is_private") val isPrivate: Int = 0,
    @SerializedName("created_by") val createdBy: Int? = null
)

data class Message(
    val id: Int,
    @SerializedName("sender_id") val senderId: Int,
    @SerializedName("channel_id") val channelId: Int? = null,
    @SerializedName("recipient_id") val recipientId: Int? = null,
    val content: String,
    @SerializedName("media_url") val mediaUrl: String? = null,
    @SerializedName("created_at") val createdAt: String? = null,
    @SerializedName("sender_username") val senderUsername: String? = null,
    @SerializedName("sender_display_name") val senderDisplayName: String? = null
)

data class SendMessageRequest(
    @SerializedName("channel_id") val channelId: Int? = null,
    @SerializedName("recipient_id") val recipientId: Int? = null,
    val content: String,
    @SerializedName("media_url") val mediaUrl: String? = null
)

data class CreateChannelRequest(
    val name: String,
    val description: String? = null,
    @SerializedName("is_private") val isPrivate: Boolean = false
)
