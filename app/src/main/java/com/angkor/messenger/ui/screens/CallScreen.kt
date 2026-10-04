package com.angkor.messenger.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
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
import com.angkor.messenger.model.User
import com.angkor.messenger.socket.SocketManager

@Composable
fun CallScreen(
    currentUser: User,
    peerUser: User,
    callType: String, // "voice" | "video"
    onEndCall: () -> Unit
) {
    var isMuted by remember { mutableStateOf(false) }
    var isCameraOff by remember { mutableStateOf(false) }
    var callStatus by remember { mutableStateOf("Connected (00:15)") }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF090D16))
    ) {
        // Video Preview Background
        if (callType == "video" && !isCameraOff) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFF1E293B)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "📹 Live High-Definition Video Feed",
                    color = Color(0xFF64748B),
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }

        // Overlay Content
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Header Info
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.padding(top = 48.dp)
            ) {
                Box(modifier = Modifier.size(100.dp)) {
                    AsyncImage(
                        model = peerUser.avatar,
                        contentDescription = null,
                        modifier = Modifier
                            .fillMaxSize()
                            .clip(CircleShape)
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = peerUser.name,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )

                Text(
                    text = if (callType == "video") "Angkor Video Call • $callStatus" else "Angkor Voice Call • $callStatus",
                    fontSize = 14.sp,
                    color = Color(0xFF94A3B8),
                    modifier = Modifier.padding(top = 4.dp)
                )
            }

            // Bottom Call Controls
            Row(
                horizontalArrangement = Arrangement.spacedBy(24.dp),
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .background(Color(0xFF0F172A).copy(alpha = 0.9f), RoundedCornerShape(32.dp))
                    .padding(horizontal = 24.dp, vertical = 16.dp)
            ) {
                // Mute Mic Button
                IconButton(
                    onClick = { isMuted = !isMuted },
                    modifier = Modifier
                        .size(56.dp)
                        .background(if (isMuted) Color(0xFFEF4444) else Color(0xFF334155), CircleShape)
                ) {
                    Text(text = if (isMuted) "🔇" else "🎙️", fontSize = 22.sp)
                }

                // Camera Toggle (for video calls)
                if (callType == "video") {
                    IconButton(
                        onClick = { isCameraOff = !isCameraOff },
                        modifier = Modifier
                            .size(56.dp)
                            .background(if (isCameraOff) Color(0xFFEF4444) else Color(0xFF334155), CircleShape)
                    ) {
                        Text(text = if (isCameraOff) "📷❌" else "📹", fontSize = 22.sp)
                    }
                }

                // End Call Button
                IconButton(
                    onClick = {
                        SocketManager.instance.endCall(peerUser.id)
                        onEndCall()
                    },
                    modifier = Modifier
                        .size(56.dp)
                        .background(Color(0xFFE11D48), CircleShape)
                ) {
                    Text(text = "🛑", fontSize = 22.sp)
                }
            }
        }
    }
}
