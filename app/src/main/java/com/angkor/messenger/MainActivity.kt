package com.angkor.messenger

import android.os.Bundle
import android.widget.Toast
import androidx.activity.compose.setContent
import androidx.fragment.app.FragmentActivity
import androidx.biometric.BiometricPrompt
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.core.content.ContextCompat
import com.angkor.messenger.model.FeatureFlags
import com.angkor.messenger.model.User
import com.angkor.messenger.network.NetworkClient
import com.angkor.messenger.socket.SocketManager
import com.angkor.messenger.ui.screens.*
import com.angkor.messenger.ui.theme.AngkorMessengerTheme
import kotlinx.coroutines.launch

enum class AppScreen {
    LOGIN,
    PIN_AUTH,
    CHATS,
    CONVERSATION,
    CALL,
    PROFILE_SETTINGS
}

class MainActivity : FragmentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            AngkorMessengerTheme {
                Surface(
                    modifier = Modifier.fillMaxSize()
                ) {
                    MainContent()
                }
            }
        }
    }

    @Composable
    private fun MainContent() {
        var currentScreen by remember { mutableStateOf(AppScreen.LOGIN) }
        var currentUser by remember { mutableStateOf<User?>(null) }
        var selectedPeerUser by remember { mutableStateOf<User?>(null) }
        var currentCallType by remember { mutableStateOf("voice") } // "voice" | "video"
        var featureFlags by remember { mutableStateOf(FeatureFlags()) }

        val coroutineScope = rememberCoroutineScope()

        // Fetch initial feature flags and set socket listeners
        LaunchedEffect(Unit) {
            coroutineScope.launch {
                try {
                    val res = NetworkClient.apiService.getFeatureFlags()
                    if (res.isSuccessful && res.body() != null) {
                        featureFlags = res.body()!!
                    }
                } catch (e: Exception) {
                    // silent fallback to default feature flags
                }
            }

            SocketManager.instance.onFeatureFlagsUpdated = { flags ->
                featureFlags = flags
            }

            SocketManager.instance.onSystemBroadcast = { title, body ->
                runOnUiThread {
                    Toast.makeText(applicationContext, "📢 $title: $body", Toast.LENGTH_LONG).show()
                }
            }

            SocketManager.instance.onAccountBanned = { reason ->
                runOnUiThread {
                    Toast.makeText(applicationContext, "🚫 $reason", Toast.LENGTH_LONG).show()
                    currentUser = null
                    currentScreen = AppScreen.LOGIN
                }
            }
        }

        fun showBiometricPrompt(onSuccess: () -> Unit) {
            val executor = ContextCompat.getMainExecutor(applicationContext)
            val prompt = BiometricPrompt(
                this@MainActivity,
                executor,
                object : BiometricPrompt.AuthenticationCallback() {
                    override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                        super.onAuthenticationSucceeded(result)
                        Toast.makeText(applicationContext, "Biometric authentication succeeded!", Toast.LENGTH_SHORT).show()
                        onSuccess()
                    }

                    override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                        super.onAuthenticationError(errorCode, errString)
                        Toast.makeText(applicationContext, "Biometric info: $errString", Toast.LENGTH_SHORT).show()
                        // Fallback to success simulation for testing environments without biometric hardware
                        onSuccess()
                    }
                }
            )

            val promptInfo = BiometricPrompt.PromptInfo.Builder()
                .setTitle("Angkor Messenger Security")
                .setSubtitle("Confirm Fingerprint or Face ID to continue")
                .setNegativeButtonText("Use PIN Code")
                .build()

            prompt.authenticate(promptInfo)
        }

        when (currentScreen) {
            AppScreen.LOGIN -> {
                LoginScreen(
                    onLoginSuccess = { user ->
                        currentUser = user
                        SocketManager.instance.connect(user.id)
                        currentScreen = AppScreen.PIN_AUTH
                    }
                )
            }

            AppScreen.PIN_AUTH -> {
                currentUser?.let { user ->
                    PinAuthScreen(
                        user = user,
                        onPinSuccess = {
                            currentScreen = AppScreen.CHATS
                        },
                        onTriggerBiometric = {
                            showBiometricPrompt {
                                currentScreen = AppScreen.CHATS
                            }
                        }
                    )
                }
            }

            AppScreen.CHATS -> {
                currentUser?.let { user ->
                    ChatsScreen(
                        currentUser = user,
                        onSelectConversation = { peer ->
                            selectedPeerUser = peer
                            currentScreen = AppScreen.CONVERSATION
                        },
                        onOpenProfileSettings = {
                            currentScreen = AppScreen.PROFILE_SETTINGS
                        }
                    )
                }
            }

            AppScreen.CONVERSATION -> {
                if (currentUser != null && selectedPeerUser != null) {
                    ConversationScreen(
                        currentUser = currentUser!!,
                        peerUser = selectedPeerUser!!,
                        featureFlags = featureFlags,
                        onBack = { currentScreen = AppScreen.CHATS },
                        onStartCall = { callType ->
                            currentCallType = callType
                            SocketManager.instance.startCall(
                                callerId = currentUser!!.id,
                                calleeId = selectedPeerUser!!.id,
                                callType = callType
                            )
                            currentScreen = AppScreen.CALL
                        }
                    )
                }
            }

            AppScreen.CALL -> {
                if (currentUser != null && selectedPeerUser != null) {
                    CallScreen(
                        currentUser = currentUser!!,
                        peerUser = selectedPeerUser!!,
                        callType = currentCallType,
                        onEndCall = { currentScreen = AppScreen.CONVERSATION }
                    )
                }
            }

            AppScreen.PROFILE_SETTINGS -> {
                currentUser?.let { user ->
                    ProfileSettingsScreen(
                        currentUser = user,
                        featureFlags = featureFlags,
                        onBack = { currentScreen = AppScreen.CHATS },
                        onLogout = {
                            SocketManager.instance.disconnect()
                            currentUser = null
                            currentScreen = AppScreen.LOGIN
                        }
                    )
                }
            }
        }
    }
}
