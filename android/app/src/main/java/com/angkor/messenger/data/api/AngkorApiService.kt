package com.angkor.messenger.data.api

import com.angkor.messenger.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface AngkorApiService {

    @POST("api/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    @POST("api/auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>

    @GET("api/auth/me")
    suspend fun getCurrentUser(@Header("Authorization") token: String): Response<User>

    @GET("api/auth/users")
    suspend fun getUsers(@Header("Authorization") token: String): Response<List<User>>

    @GET("api/channels")
    suspend fun getChannels(@Header("Authorization") token: String): Response<List<Channel>>

    @POST("api/channels")
    suspend fun createChannel(
        @Header("Authorization") token: String,
        @Body request: CreateChannelRequest
    ): Response<Channel>

    @GET("api/messages/channel/{channelId}")
    suspend fun getChannelMessages(
        @Header("Authorization") token: String,
        @Path("channelId") channelId: Int
    ): Response<List<Message>>

    @GET("api/messages/direct/{userId}")
    suspend fun getDirectMessages(
        @Header("Authorization") token: String,
        @Path("userId") userId: Int
    ): Response<List<Message>>

    @POST("api/messages")
    suspend fun sendMessage(
        @Header("Authorization") token: String,
        @Body request: SendMessageRequest
    ): Response<Message>
}
