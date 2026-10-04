package com.angkor.messenger.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
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
import com.angkor.messenger.model.User
import com.angkor.messenger.socket.SocketManager
import com.angkor.messenger.ui.theme.*

@Composable
fun CallScreen(
    currentUser: User,
    peerUser: User,
    callType: String, // "voice" | "video"
    onEndCall: () -> Unit
) {
    var isMuted by remember { mutableStateOf(false) }
    var isCameraOff by remember { mutableStateOf(false) }
    var callStatus by remember { mutableStateOf("Encrypted Stream • 00:15") }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(SurfaceBackground)
    ) {
        // Video Preview Background
        if (callType == "video" && !isCameraOff) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(SurfaceContainerHigh),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "📹 Encrypted HD Video Feed (Kyber-1024)",
                    color = TextSecondary,
                    fontSize = 14.sp,
                    fontFamily = FontFamily.Monospace,
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
                Box(
                    modifier = Modifier
                        .size(96.dp)
                        .clip(CircleShape)
                        .border(2.dp, SecondaryCyan, CircleShape)
                ) {
                    AsyncImage(
                        model = peerUser.avatar,
                        contentDescription = null,
                        modifier = Modifier.fillMaxSize()
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = peerUser.name,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold,
                    color = OnSurfacePrimary
                )

                Text(
                    text = if (callType == "video") "Cipher E2EE Video • $callStatus" else "Cipher E2EE Voice • $callStatus",
                    fontSize = 12.sp,
                    fontFamily = FontFamily.Monospace,
                    color = TertiaryEmerald,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }

            // Bottom Call Controls
            Row(
                horizontalArrangement = Arrangement.spacedBy(24.dp),
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .clip(RoundedCornerShape(32.dp))
                    .background(SurfaceContainerLow.copy(alpha = 0.95f))
                    .border(1.dp, BorderSubtle, RoundedCornerShape(32.dp))
                    .padding(horizontal = 24.dp, vertical = 16.dp)
            ) {
                // Mute Mic Button
                IconButton(
                    onClick = { isMuted = !isMuted },
                    modifier = Modifier
                        .size(56.dp)
                        .background(if (isMuted) DestructiveRed else SurfaceElevated, CircleShape)
                ) {
                    Text(text = if (isMuted) "🔇" else "🎙️", fontSize = 20.sp)
                }

                // Camera Toggle (for video calls)
                if (callType == "video") {
                    IconButton(
                        onClick = { isCameraOff = !isCameraOff },
                        modifier = Modifier
                            .size(56.dp)
                            .background(if (isCameraOff) DestructiveRed else SurfaceElevated, CircleShape)
                    ) {
                        Text(text = if (isCameraOff) "📷❌" else "📹", fontSize = 20.sp)
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
                        .background(DestructiveRed, CircleShape)
                ) {
                    Text(text = "🛑", fontSize = 20.sp)
                }
            }
        }
    }
}
