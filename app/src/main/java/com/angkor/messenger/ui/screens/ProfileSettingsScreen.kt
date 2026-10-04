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
import com.angkor.messenger.model.FeatureFlags
import com.angkor.messenger.model.UpdateSettingsRequest
import com.angkor.messenger.model.User
import com.angkor.messenger.network.NetworkClient
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileSettingsScreen(
    currentUser: User,
    featureFlags: FeatureFlags,
    onBack: () -> Unit,
    onLogout: () -> Unit
) {
    var isActiveOnline by remember { mutableStateOf(currentUser.status == "online") }
    var biometricEnabled by remember { mutableStateOf(currentUser.biometricEnabled) }
    var newPinCode by remember { mutableStateOf(currentUser.pin ?: "1234") }
    var statusMessage by remember { mutableStateOf<String?>(null) }
    val coroutineScope = rememberCoroutineScope()

    fun saveSettings() {
        coroutineScope.launch {
            try {
                val res = NetworkClient.apiService.updateSettings(
                    UpdateSettingsRequest(
                        userId = currentUser.id,
                        pin = newPinCode,
                        biometricEnabled = biometricEnabled,
                        activeStatus = isActiveOnline
                    )
                )
                if (res.isSuccessful && res.body()?.success == true) {
                    statusMessage = "Settings updated successfully"
                }
            } catch (e: Exception) {
                statusMessage = "Failed to update settings"
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(onClick = onBack) {
                            Text(text = "⬅️", fontSize = 18.sp)
                        }
                        Text(
                            text = "Profile & Security",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
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
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            // User Header Profile Card
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF1E293B), RoundedCornerShape(20.dp))
                    .padding(16.dp)
            ) {
                Box(modifier = Modifier.size(60.dp)) {
                    AsyncImage(
                        model = currentUser.avatar,
                        contentDescription = null,
                        modifier = Modifier
                            .fillMaxSize()
                            .clip(CircleShape)
                    )
                }
                Spacer(modifier = Modifier.width(16.dp))
                Column {
                    Text(
                        text = currentUser.name,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Text(
                        text = currentUser.email,
                        fontSize = 12.sp,
                        color = Color(0xFF94A3B8)
                    )
                    Text(
                        text = "Auth: ${currentUser.authProvider.uppercase()}",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFE11D48),
                        modifier = Modifier.padding(top = 2.dp)
                    )
                }
            }

            statusMessage?.let { msg ->
                Text(
                    text = msg,
                    fontSize = 13.sp,
                    color = Color(0xFF10B981),
                    fontWeight = FontWeight.Medium
                )
            }

            // Active Status Section
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF1E293B), RoundedCornerShape(16.dp))
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(text = "Active Status", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        Text(text = "Show when you're online to contacts", fontSize = 12.sp, color = Color(0xFF94A3B8))
                    }
                    Switch(
                        checked = isActiveOnline,
                        onCheckedChange = {
                            isActiveOnline = it
                            saveSettings()
                        },
                        colors = SwitchDefaults.colors(checkedThumbColor = Color(0xFF10B981))
                    )
                }
            }

            // Biometric Auth Section
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF1E293B), RoundedCornerShape(16.dp))
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(text = "Biometric Authentication", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        Text(text = "Use Fingerprint or Face ID to unlock", fontSize = 12.sp, color = Color(0xFF94A3B8))
                    }
                    Switch(
                        checked = biometricEnabled,
                        onCheckedChange = {
                            biometricEnabled = it
                            saveSettings()
                        },
                        colors = SwitchDefaults.colors(checkedThumbColor = Color(0xFFE11D48))
                    )
                }
            }

            // PIN Code Section
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF1E293B), RoundedCornerShape(16.dp))
                    .padding(16.dp)
            ) {
                Text(text = "Security PIN Code", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Color.White)
                Text(text = "Change 4-digit passcode for app entry", fontSize = 12.sp, color = Color(0xFF94A3B8))

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = newPinCode,
                        onValueChange = { if (it.length <= 4) newPinCode = it },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        ),
                        modifier = Modifier.weight(1f)
                    )

                    Button(
                        onClick = { saveSettings() },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFE11D48))
                    ) {
                        Text(text = "Update PIN")
                    }
                }
            }

            // Remote Dynamic System Features Overview Card
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF1E293B), RoundedCornerShape(16.dp))
                    .padding(16.dp)
            ) {
                Text(text = "Admin Dynamic Remote Capabilities", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Color.White)
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "• Voice Calling: ${if (featureFlags.voice_calling) "ENABLED ✅" else "DISABLED ❌"}",
                    fontSize = 12.sp,
                    color = Color(0xFF94A3B8)
                )
                Text(
                    text = "• Video Calling: ${if (featureFlags.video_calling) "ENABLED ✅" else "DISABLED ❌"}",
                    fontSize = 12.sp,
                    color = Color(0xFF94A3B8)
                )
                Text(
                    text = "• File Sharing: ${if (featureFlags.file_sharing) "ENABLED ✅" else "DISABLED ❌"}",
                    fontSize = 12.sp,
                    color = Color(0xFF94A3B8)
                )
            }

            Spacer(modifier = Modifier.weight(1f))

            Button(
                onClick = onLogout,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF334155))
            ) {
                Text(text = "Log Out", color = Color.White, fontWeight = FontWeight.Bold)
            }
        }
    }
}
