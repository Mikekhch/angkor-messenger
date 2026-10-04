package com.angkor.messenger.socket

import android.util.Log
import com.angkor.messenger.model.ChatMessage
import com.angkor.messenger.model.FeatureFlags
import com.angkor.messenger.network.NetworkClient
import com.google.gson.Gson
import io.socket.client.IO
import io.socket.client.Socket
import org.json.JSONObject
import java.net.URISyntaxException

class SocketManager private constructor() {
    private var socket: Socket? = null
    private val gson = Gson()

    var onMessageReceived: ((ChatMessage) -> Unit)? = null
    var onFeatureFlagsUpdated: ((FeatureFlags) -> Unit)? = null
    var onAccountBanned: ((String) -> Unit)? = null
    var onSystemBroadcast: ((String, String) -> Unit)? = null
    var onUserStatusChanged: ((String, String) -> Unit)? = null
    var onIncomingCall: ((callerId: String, callType: String) -> Unit)? = null

    init {
        try {
            val opts = IO.Options().apply {
                forceNew = true
                reconnection = true
            }
            socket = IO.socket(NetworkClient.getBaseUrl(), opts)
            setupListeners()
        } catch (e: URISyntaxException) {
            Log.e("SocketManager", "URI Syntax Error", e)
        }
    }

    fun connect(userId: String) {
        socket?.let { s ->
            if (!s.connected()) {
                s.connect()
            }
            s.emit("register_user", JSONObject().put("userId", userId))
        }
    }

    fun disconnect() {
        socket?.disconnect()
    }

    fun sendMessage(senderId: String, receiverId: String, content: String, type: String = "text", fileUrl: String? = null) {
        val json = JSONObject().apply {
            put("senderId", senderId)
            put("receiverId", receiverId)
            put("content", content)
            put("type", type)
            put("fileUrl", fileUrl)
        }
        socket?.emit("send_message", json)
    }

    fun startCall(callerId: String, calleeId: String, callType: String) {
        val json = JSONObject().apply {
            put("callerId", callerId)
            put("calleeId", calleeId)
            put("callType", callType)
            put("offer", JSONObject().put("type", "offer").put("sdp", "simulated_sdp_offer"))
        }
        socket?.emit("call_offer", json)
    }

    fun endCall(targetId: String) {
        val json = JSONObject().apply {
            put("targetId", targetId)
            put("reason", "Call ended by user")
        }
        socket?.emit("end_call", json)
    }

    private fun setupListeners() {
        socket?.on("receive_message") { args ->
            if (args.isNotEmpty()) {
                val jsonStr = args[0].toString()
                val msg = gson.fromJson(jsonStr, ChatMessage::class.java)
                onMessageReceived?.invoke(msg)
            }
        }

        socket?.on("feature_flags_updated") { args ->
            if (args.isNotEmpty()) {
                val jsonStr = args[0].toString()
                val flags = gson.fromJson(jsonStr, FeatureFlags::class.java)
                onFeatureFlagsUpdated?.invoke(flags)
            }
        }

        socket?.on("account_banned") { args ->
            if (args.isNotEmpty()) {
                val obj = args[0] as? JSONObject
                val msg = obj?.optString("message") ?: "Account banned"
                onAccountBanned?.invoke(msg)
            }
        }

        socket?.on("system_broadcast") { args ->
            if (args.isNotEmpty()) {
                val obj = args[0] as? JSONObject
                val title = obj?.optString("title") ?: "System Notification"
                val body = obj?.optString("body") ?: ""
                onSystemBroadcast?.invoke(title, body)
            }
        }

        socket?.on("user_status_changed") { args ->
            if (args.isNotEmpty()) {
                val obj = args[0] as? JSONObject
                val userId = obj?.optString("userId") ?: ""
                val status = obj?.optString("status") ?: "offline"
                onUserStatusChanged?.invoke(userId, status)
            }
        }

        socket?.on("incoming_call") { args ->
            if (args.isNotEmpty()) {
                val obj = args[0] as? JSONObject
                val callerId = obj?.optString("callerId") ?: ""
                val callType = obj?.optString("callType") ?: "voice"
                onIncomingCall?.invoke(callerId, callType)
            }
        }
    }

    companion object {
        val instance: SocketManager by lazy { SocketManager() }
    }
}
