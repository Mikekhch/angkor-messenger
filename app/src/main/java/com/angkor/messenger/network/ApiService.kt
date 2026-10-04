package com.angkor.messenger.network

import com.angkor.messenger.model.*
import okhttp3.MultipartBody
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    @POST("api/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    @POST("api/auth/verify-pin")
    suspend fun verifyPin(@Body request: VerifyPinRequest): Response<AuthResponse>

    @PUT("api/auth/settings")
    suspend fun updateSettings(@Body request: UpdateSettingsRequest): Response<AuthResponse>

    @GET("api/features")
    suspend fun getFeatureFlags(): Response<FeatureFlags>

    @GET("api/messages")
    suspend fun getMessages(
        @Query("userId") userId: String,
        @Query("targetId") targetId: String
    ): Response<List<ChatMessage>>

    @GET("api/admin/users")
    suspend fun getUsers(): Response<List<User>>

    @Multipart
    @POST("api/upload")
    suspend fun uploadFile(
        @Part file: MultipartBody.Part
    ): Response<UploadResponse>
}

data class UploadResponse(
    val success: Boolean,
    val fileUrl: String,
    val fileName: String,
    val fileType: String,
    val fileSize: Long
)
