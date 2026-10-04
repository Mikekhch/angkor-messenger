package com.angkor.messenger.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.angkor.messenger.model.ChatMessage
import com.angkor.messenger.model.FeatureFlags
import com.angkor.messenger.model.User
import com.angkor.messenger.network.NetworkClient
import com.angkor.messenger.socket.SocketManager
import com.angkor.messenger.ui.theme.*
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
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        IconButton(onClick = onBack) {
                            Text(text = "⬅️", fontSize = 16.sp)
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
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = OnSurfacePrimary
                            )
                            Text(
                                text = if (peerUser.status == "online") "Signal Ratchet Active" else "Offline",
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace,
                                color = if (peerUser.status == "online") TertiaryEmerald else TextMuted
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
                                systemBanner = "Voice Calling disabled by policy"
                            }
                        }
                    ) {
                        Text(
                            text = "📞",
                            fontSize = 18.sp
                        )
                    }

                    // Video Call Button
                    IconButton(
                        onClick = {
                            if (featureFlags.video_calling) {
                                onStartCall("video")
                            } else {
                                systemBanner = "Video Calling disabled by policy"
                            }
                        }
                    ) {
                        Text(
                            text = "📹",
                            fontSize = 18.sp
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = SurfaceContainer)
            )
        },
        containerColor = SurfaceBackground
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // End-to-End Encryption Banner Pill
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp),
                contentAlignment = Alignment.Center
            ) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(16.dp))
                        .background(SurfaceCanvas)
                        .border(1.dp, SecondaryCyan.copy(alpha = 0.3f), RoundedCornerShape(16.dp))
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = "🔒 End-to-End Encrypted via Signal Protocol",
                        fontSize = 10.sp,
                        fontFamily = FontFamily.Monospace,
                        color = SecondaryCyan,
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            // Notification Banner
            systemBanner?.let { banner ->
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(DestructiveRed.copy(alpha = 0.2f))
                        .padding(horizontal = 16.dp, vertical = 8.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = banner, fontSize = 12.sp, color = OnSurfacePrimary)
                        TextButton(onClick = { systemBanner = null }) {
                            Text(text = "Dismiss", fontSize = 12.sp, color = SecondaryCyan)
                        }
                    }
                }
            }

            // Messages List
            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 4.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
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
                                .clip(
                                    RoundedCornerShape(
                                        topStart = 16.dp,
                                        topEnd = 16.dp,
                                        bottomStart = if (isMe) 16.dp else 4.dp,
                                        bottomEnd = if (isMe) 4.dp else 16.dp
                                    )
                                )
                                .background(if (isMe) PrimaryElectricBlue else SurfaceElevated)
                                .border(
                                    1.dp,
                                    if (isMe) Color.Transparent else BorderSubtle,
                                    RoundedCornerShape(
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
                                color = OnSurfacePrimary
                            )
                        }
                    }
                }
            }

            // Floating Input Dock
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(12.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(28.dp))
                        .background(SurfaceCanvas)
                        .border(1.dp, BorderSubtle, RoundedCornerShape(28.dp))
                        .padding(horizontal = 8.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    IconButton(
                        onClick = {
                            if (!featureFlags.file_sharing) {
                                systemBanner = "File sharing disabled by policy"
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
                        Text(text = "📎", fontSize = 18.sp)
                    }

                    TextField(
                        value = messageText,
                        onValueChange = { messageText = it },
                        placeholder = { Text("Encrypted message...", color = TextMuted, fontSize = 14.sp) },
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = Color.Transparent,
                            unfocusedContainerColor = Color.Transparent,
                            focusedTextColor = OnSurfacePrimary,
                            unfocusedTextColor = OnSurfacePrimary,
                            focusedIndicatorColor = Color.Transparent,
                            unfocusedIndicatorColor = Color.Transparent
                        ),
                        modifier = Modifier.weight(1f)
                    )

                    IconButton(
                        onClick = { handleSendMessage() },
                        modifier = Modifier
                            .size(40.dp)
                            .background(PrimaryElectricBlue, CircleShape)
                    ) {
                        Text(text = "➔", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    }
                }
            }
        }
    }
}
