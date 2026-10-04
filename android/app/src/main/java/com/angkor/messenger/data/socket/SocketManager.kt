package com.angkor.messenger.data.socket

import com.angkor.messenger.data.model.Message
import com.google.gson.Gson
import io.socket.client.IO
import io.socket.client.Socket
import org.json.JSONObject

class SocketManager {
    private var socket: Socket? = null
    private val gson = Gson()

    fun connect(token: String, onMessageReceived: (Message) -> Unit) {
        try {
            val options = IO.Options().apply {
                auth = mapOf("token" to token)
                forceNew = true
                reconnection = true
            }
            socket = IO.socket("http://10.0.2.2:5000", options)

            socket?.on("new_message") { args ->
                if (args.isNotEmpty() && args[0] != null) {
                    val jsonStr = args[0].toString()
                    val msg = gson.fromJson(jsonStr, Message::class.java)
                    onMessageReceived(msg)
                }
            }

            socket?.connect()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun joinChannel(channelId: Int) {
        socket?.emit("join_channel", channelId)
    }

    fun joinDirect(userId: Int) {
        socket?.emit("join_direct", userId)
    }

    fun sendMessage(channelId: Int?, recipientId: Int?, content: String) {
        val json = JSONObject().apply {
            put("channel_id", channelId)
            put("recipient_id", recipientId)
            put("content", content)
        }
        socket?.emit("send_message", json)
    }

    fun disconnect() {
        socket?.disconnect()
        socket?.off()
        socket = null
    }
}
