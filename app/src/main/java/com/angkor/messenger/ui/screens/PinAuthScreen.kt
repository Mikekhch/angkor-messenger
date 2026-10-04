package com.angkor.messenger.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.angkor.messenger.model.User
import com.angkor.messenger.model.VerifyPinRequest
import com.angkor.messenger.network.NetworkClient
import com.angkor.messenger.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun PinAuthScreen(
    user: User,
    onPinSuccess: () -> Unit,
    onTriggerBiometric: () -> Unit
) {
    var pinInput by remember { mutableStateOf("") }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var isLoading by remember { mutableStateOf(false) }
    val coroutineScope = rememberCoroutineScope()

    fun verifyPinCode(enteredPin: String) {
        coroutineScope.launch {
            isLoading = true
            errorMessage = null
            try {
                val res = NetworkClient.apiService.verifyPin(
                    VerifyPinRequest(userId = user.id, pin = enteredPin)
                )
                if (res.isSuccessful && res.body()?.success == true) {
                    onPinSuccess()
                } else {
                    errorMessage = "Incorrect Security Key. Try again."
                    pinInput = ""
                }
            } catch (e: Exception) {
                errorMessage = "Verification error: ${e.localizedMessage}"
            } finally {
                isLoading = false
            }
        }
    }

    fun handleKeyPress(key: String) {
        if (key == "DEL") {
            if (pinInput.isNotEmpty()) pinInput = pinInput.dropLast(1)
        } else if (key == "BIO") {
            onTriggerBiometric()
        } else if (pinInput.length < 4) {
            pinInput += key
            if (pinInput.length == 4) {
                verifyPinCode(pinInput)
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(SurfaceBackground)
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(
                text = "Enter Security Key",
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = OnSurfacePrimary
            )

            Text(
                text = "Session lock for ${user.name}",
                fontSize = 13.sp,
                color = TextSecondary,
                modifier = Modifier.padding(top = 4.dp)
            )

            Spacer(modifier = Modifier.height(32.dp))

            // PIN Indicator Dots
            Row(
                horizontalArrangement = Arrangement.spacedBy(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                for (i in 0 until 4) {
                    val isFilled = i < pinInput.length
                    Box(
                        modifier = Modifier
                            .size(16.dp)
                            .background(
                                color = if (isFilled) SecondaryCyan else SurfaceContainerHighest,
                                shape = CircleShape
                            )
                    )
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            errorMessage?.let { err ->
                Text(
                    text = err,
                    color = DestructiveRed,
                    fontSize = 13.sp,
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(16.dp))
            }

            if (isLoading) {
                CircularProgressIndicator(color = SecondaryCyan)
                Spacer(modifier = Modifier.height(16.dp))
            }

            // Keypad
            val keys = listOf(
                listOf("1", "2", "3"),
                listOf("4", "5", "6"),
                listOf("7", "8", "9"),
                listOf("BIO", "0", "DEL")
            )

            Column(
                verticalArrangement = Arrangement.spacedBy(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.padding(top = 16.dp)
            ) {
                for (row in keys) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(24.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        for (key in row) {
                            Button(
                                onClick = { handleKeyPress(key) },
                                modifier = Modifier.size(68.dp),
                                shape = CircleShape,
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = SurfaceElevated
                                )
                            ) {
                                Text(
                                    text = when(key) {
                                        "BIO" -> "👆"
                                        "DEL" -> "⌫"
                                        else -> key
                                    },
                                    fontSize = 20.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = OnSurfacePrimary
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
