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
import com.angkor.messenger.model.FeatureFlags
import com.angkor.messenger.model.UpdateSettingsRequest
import com.angkor.messenger.model.User
import com.angkor.messenger.network.NetworkClient
import com.angkor.messenger.ui.theme.*
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
                    statusMessage = "Security settings updated successfully"
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
                            Text(text = "⬅️", fontSize = 16.sp)
                        }
                        Text(
                            text = "Security & Identity",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = OnSurfacePrimary
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
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // User Header Profile Card
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(SurfaceContainer)
                    .border(1.dp, BorderSubtle, RoundedCornerShape(16.dp))
                    .padding(16.dp)
            ) {
                Box(modifier = Modifier.size(56.dp)) {
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
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = OnSurfacePrimary
                    )
                    Text(
                        text = currentUser.email,
                        fontSize = 12.sp,
                        color = TextSecondary
                    )
                    Text(
                        text = "IDENTITY VERIFIED • ${currentUser.authProvider.uppercase()}",
                        fontSize = 10.sp,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        color = SecondaryCyan,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }
            }

            statusMessage?.let { msg ->
                Text(
                    text = msg,
                    fontSize = 13.sp,
                    color = TertiaryEmerald,
                    fontWeight = FontWeight.Medium
                )
            }

            // Active Status Section
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(SurfaceContainer)
                    .border(1.dp, BorderSubtle, RoundedCornerShape(12.dp))
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(text = "Peer Presence Status", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = OnSurfacePrimary)
                        Text(text = "Broadcast online presence to network peers", fontSize = 11.sp, color = TextSecondary)
                    }
                    Switch(
                        checked = isActiveOnline,
                        onCheckedChange = {
                            isActiveOnline = it
                            saveSettings()
                        },
                        colors = SwitchDefaults.colors(checkedThumbColor = TertiaryEmerald)
                    )
                }
            }

            // Biometric Auth Section
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(SurfaceContainer)
                    .border(1.dp, BorderSubtle, RoundedCornerShape(12.dp))
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(text = "Biometric Lock", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = OnSurfacePrimary)
                        Text(text = "Require Fingerprint / Face ID for vault access", fontSize = 11.sp, color = TextSecondary)
                    }
                    Switch(
                        checked = biometricEnabled,
                        onCheckedChange = {
                            biometricEnabled = it
                            saveSettings()
                        },
                        colors = SwitchDefaults.colors(checkedThumbColor = PrimaryElectricBlue)
                    )
                }
            }

            // PIN Code Section
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(SurfaceContainer)
                    .border(1.dp, BorderSubtle, RoundedCornerShape(12.dp))
                    .padding(16.dp)
            ) {
                Text(text = "Security Key Code", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = OnSurfacePrimary)
                Text(text = "4-digit cryptographic fallback entry key", fontSize = 11.sp, color = TextSecondary)

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
                            focusedTextColor = OnSurfacePrimary,
                            unfocusedTextColor = OnSurfacePrimary
                        ),
                        modifier = Modifier.weight(1f)
                    )

                    Button(
                        onClick = { saveSettings() },
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryElectricBlue)
                    ) {
                        Text(text = "Update Key")
                    }
                }
            }

            // Remote Dynamic System Features Overview Card
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(SurfaceContainer)
                    .border(1.dp, BorderSubtle, RoundedCornerShape(12.dp))
                    .padding(16.dp)
            ) {
                Text(text = "Dynamic Feature Control", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = OnSurfacePrimary)
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "• Voice Calling: ${if (featureFlags.voice_calling) "ACTIVE" else "RESTRICTED"}",
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace,
                    color = if (featureFlags.voice_calling) TertiaryEmerald else DestructiveRed
                )
                Text(
                    text = "• Video Calling: ${if (featureFlags.video_calling) "ACTIVE" else "RESTRICTED"}",
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace,
                    color = if (featureFlags.video_calling) TertiaryEmerald else DestructiveRed
                )
                Text(
                    text = "• File Sharing: ${if (featureFlags.file_sharing) "ACTIVE" else "RESTRICTED"}",
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace,
                    color = if (featureFlags.file_sharing) TertiaryEmerald else DestructiveRed
                )
            }

            Spacer(modifier = Modifier.weight(1f))

            Button(
                onClick = onLogout,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                shape = RoundedCornerShape(24.dp),
                colors = ButtonDefaults.buttonColors(containerColor = SurfaceElevated)
            ) {
                Text(text = "Revoke Session & Log Out", color = DestructiveRed, fontWeight = FontWeight.Bold)
            }
        }
    }
}
