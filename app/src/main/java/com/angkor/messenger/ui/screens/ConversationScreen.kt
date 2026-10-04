package com.angkor.messenger.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.angkor.messenger.model.ChatMessage
import com.angkor.messenger.model.FeatureFlags
import com.angkor.messenger.model.User
import com.angkor.messenger.network.NetworkClient
import com.angkor.messenger.socket.SocketManager
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ConversationScreen(
    currentUser: User,
    peerUser: User,
    featureFlags: FeatureFlags,
    onBack: () -> Unit,
    onStartCall: (callType: String) -> Unit
) {
    var messageText by remember { mutableStateOf("") }
    var messagesList by remember { mutableStateOf<List<ChatMessage>>(emptyList()) }
    var systemBanner by remember { mutableStateOf<String?>(null) }
    val coroutineScope = rememberCoroutineScope()

    LaunchedEffect(peerUser.id) {
        // Fetch existing messages
        coroutineScope.launch {
            try {
                val res = NetworkClient.apiService.getMessages(currentUser.id, peerUser.id)
                if (res.isSuccessful) {
                    messagesList = res.body() ?: emptyList()
                }
            } catch (e: Exception) {
                // handle
            }
        }

        // Register Socket Listener for incoming messages
        SocketManager.instance.onMessageReceived = { msg ->
            if (msg.senderId == peerUser.id || msg.senderId == currentUser.id) {
                messagesList = messagesList + msg
            }
        }

        SocketManager.instance.onAccountBanned = { reason ->
            systemBanner = "⚠️ $reason"
        }
    }

    fun handleSendMessage() {
        if (messageText.isBlank()) return
        val text = messageText.trim()
        messageText = ""
        SocketManager.instance.sendMessage(
            senderId = currentUser.id,
            receiverId = peerUser.id,
            content = text,
            type = "text"
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        IconButton(onClick = onBack) {
                            Text(text = "⬅️", fontSize = 18.sp)
                        }
                        Box(modifier = Modifier.size(36.dp)) {
                            AsyncImage(
                                model = peerUser.avatar,
                                contentDescription = null,
                                modifier = Modifier
                                    .fillMaxSize()
                                    .clip(CircleShape)
                            )
                        }
                        Column {
                            Text(
                                text = peerUser.name,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                            Text(
                                text = if (peerUser.status == "online") "Active Now" else "Offline",
                                fontSize = 11.sp,
                                color = if (peerUser.status == "online") Color(0xFF10B981) else Color(0xFF94A3B8)
                            )
                        }
                    }
                },
                actions = {
                    // Voice Call Button
                    IconButton(
                        onClick = {
                            if (featureFlags.voice_calling) {
                                onStartCall("voice")
                            } else {
                                systemBanner = "Voice Calling is disabled by admin"
                            }
                        }
                    ) {
                        Text(
                            text = "📞",
                            fontSize = 20.sp,
                            color = if (featureFlags.voice_calling) Color.White else Color.Gray
                        )
                    }

                    // Video Call Button
                    IconButton(
                        onClick = {
                            if (featureFlags.video_calling) {
                                onStartCall("video")
                            } else {
                                systemBanner = "Video Calling is disabled by admin"
                            }
                        }
                    ) {
                        Text(
                            text = "📹",
                            fontSize = 20.sp,
                            color = if (featureFlags.video_calling) Color.White else Color.Gray
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF0F172A))
            )
        },
        containerColor = Color(0xFF0F172A)
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Notification Banner
            systemBanner?.let { banner ->
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFFE11D48).copy(alpha = 0.2f))
                        .padding(horizontal = 16.dp, vertical = 8.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = banner, fontSize = 12.sp, color = Color(0xFFFDA4AF))
                        TextButton(onClick = { systemBanner = null }) {
                            Text(text = "Dismiss", fontSize = 12.sp, color = Color.White)
                        }
                    }
                }
            }

            // Messages List
            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(messagesList) { msg ->
                    val isMe = msg.senderId == currentUser.id
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = if (isMe) Arrangement.End else Arrangement.Start
                    ) {
                        Box(
                            modifier = Modifier
                                .widthIn(max = 280.dp)
                                .background(
                                    color = if (isMe) Color(0xFFE11D48) else Color(0xFF1E293B),
                                    shape = RoundedCornerShape(
                                        topStart = 16.dp,
                                        topEnd = 16.dp,
                                        bottomStart = if (isMe) 16.dp else 4.dp,
                                        bottomEnd = if (isMe) 4.dp else 16.dp
                                    )
                                )
                                .padding(12.dp)
                        ) {
                            Text(
                                text = msg.content,
                                fontSize = 14.sp,
                                color = Color.White
                            )
                        }
                    }
                }
            }

            // Bottom Message Input Bar
            Surface(
                color = Color(0xFF1E293B),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Attachment / File sharing button (respecting feature flag)
                    IconButton(
                        onClick = {
                            if (!featureFlags.file_sharing) {
                                systemBanner = "File sharing is disabled by admin"
                            } else {
                                systemBanner = "Simulated File Attached: photo.jpg"
                                SocketManager.instance.sendMessage(
                                    senderId = currentUser.id,
                                    receiverId = peerUser.id,
                                    content = "📷 Shared image: photo.jpg",
                                    type = "file"
                                )
                            }
                        }
                    ) {
                        Text(
                            text = "📎",
                            fontSize = 20.sp,
                            color = if (featureFlags.file_sharing) Color.White else Color.Gray
                        )
                    }

                    TextField(
                        value = messageText,
                        onValueChange = { messageText = it },
                        placeholder = { Text("Message...", color = Color(0xFF64748B)) },
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = Color(0xFF0F172A),
                            unfocusedContainerColor = Color(0xFF0F172A),
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            focusedIndicatorColor = Color.Transparent,
                            unfocusedIndicatorColor = Color.Transparent
                        ),
                        shape = RoundedCornerShape(24.dp),
                        modifier = Modifier.weight(1f)
                    )

                    IconButton(
                        onClick = { handleSendMessage() },
                        modifier = Modifier
                            .size(44.dp)
                            .background(Color(0xFFE11D48), CircleShape)
                    ) {
                        Text(text = "➔", color = Color.White, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
