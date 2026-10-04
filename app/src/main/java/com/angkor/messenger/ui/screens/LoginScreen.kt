package com.angkor.messenger.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.angkor.messenger.model.User
import com.angkor.messenger.network.NetworkClient
import com.angkor.messenger.model.LoginRequest
import com.angkor.messenger.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun LoginScreen(
    onLoginSuccess: (User) -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var activeTab by remember { mutableStateOf("biometric") } // "biometric" or "credentials"

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(SurfaceBackground)
            .padding(horizontal = 20.dp, vertical = 16.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.fillMaxWidth()
        ) {
            // Hero Shield Logo
            Box(
                modifier = Modifier
                    .size(72.dp)
                    .clip(RoundedCornerShape(20.dp))
                    .background(SurfaceContainerHigh)
                    .border(1.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(20.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "🛡️",
                    fontSize = 36.sp
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                Text(
                    text = "Cipher",
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    color = OnSurfacePrimary
                )
                Spacer(modifier = Modifier.width(8.dp))
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(50))
                        .background(SecondaryCyan.copy(alpha = 0.2f))
                        .padding(horizontal = 8.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = "v2.4 E2EE",
                        color = SecondaryCyan,
                        fontSize = 10.sp,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Text(
                text = "End-to-End Encrypted Communication",
                fontSize = 13.sp,
                color = TextSecondary,
                modifier = Modifier.padding(top = 4.dp)
            )

            Spacer(modifier = Modifier.height(28.dp))

            // Mode Selector Tabs (Quick Unlock vs Account Sign In)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(SurfaceContainerLow)
                    .padding(4.dp)
            ) {
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (activeTab == "biometric") SurfaceContainer else Color.Transparent)
                        .clickable { activeTab = "biometric" }
                        .padding(vertical = 10.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "⚡ Quick Unlock",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = if (activeTab == "biometric") SecondaryCyan else TextSecondary
                    )
                }
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (activeTab == "credentials") SurfaceContainer else Color.Transparent)
                        .clickable { activeTab = "credentials" }
                        .padding(vertical = 10.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "🔑 Account Sign In",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = if (activeTab == "credentials") SecondaryCyan else TextSecondary
                    )
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            errorMessage?.let { err ->
                Text(
                    text = err,
                    color = DestructiveRed,
                    fontSize = 13.sp,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(bottom = 16.dp)
                )
            }

            // Google Sign-In Button
            Button(
                onClick = {
                    coroutineScope.launch {
                        isLoading = true
                        errorMessage = null
                        try {
                            val res = NetworkClient.apiService.login(
                                LoginRequest(
                                    email = "sophea.chan@example.com",
                                    name = "Sophea Chan",
                                    provider = "google",
                                    avatar = "https://i.pravatar.cc/150?u=sophea"
                                )
                            )
                            if (res.isSuccessful && res.body()?.success == true) {
                                res.body()?.user?.let { onLoginSuccess(it) }
                            } else {
                                errorMessage = res.body()?.error ?: "Sign in failed"
                            }
                        } catch (e: Exception) {
                            errorMessage = "Network error: ${e.localizedMessage}"
                        } finally {
                            isLoading = false
                        }
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                shape = RoundedCornerShape(24.dp),
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryElectricBlue)
            ) {
                Text(
                    text = "Sign in with Google",
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Apple Sign-In Button
            Button(
                onClick = {
                    coroutineScope.launch {
                        isLoading = true
                        errorMessage = null
                        try {
                            val res = NetworkClient.apiService.login(
                                LoginRequest(
                                    email = "vireak.bot@example.com",
                                    name = "Vireak Bot",
                                    provider = "apple",
                                    avatar = "https://i.pravatar.cc/150?u=vireak"
                                )
                            )
                            if (res.isSuccessful && res.body()?.success == true) {
                                res.body()?.user?.let { onLoginSuccess(it) }
                            } else {
                                errorMessage = res.body()?.error ?: "Sign in failed"
                            }
                        } catch (e: Exception) {
                            errorMessage = "Network error: ${e.localizedMessage}"
                        } finally {
                            isLoading = false
                        }
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                shape = RoundedCornerShape(24.dp),
                colors = ButtonDefaults.buttonColors(containerColor = SurfaceElevated)
            ) {
                Text(
                    text = "Sign in with Apple",
                    color = OnSurfacePrimary,
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp
                )
            }

            if (isLoading) {
                Spacer(modifier = Modifier.height(20.dp))
                CircularProgressIndicator(color = SecondaryCyan)
            }
        }
    }
}
