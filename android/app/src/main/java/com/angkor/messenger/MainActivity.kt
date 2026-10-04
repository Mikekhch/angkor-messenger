package com.angkor.messenger

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.*
import com.angkor.messenger.ui.auth.AuthScreen
import com.angkor.messenger.ui.chat.ChatListScreen
import com.angkor.messenger.ui.chat.MessageRoomScreen
import com.angkor.messenger.ui.theme.AngkorMessengerTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AngkorMessengerTheme {
                var currentScreen by remember { mutableStateOf<Screen>(Screen.Auth) }
                var currentUser by remember { mutableStateOf("admin") }
                var activeRoomTitle by remember { mutableStateOf("#general") }

                when (currentScreen) {
                    is Screen.Auth -> {
                        AuthScreen(
                            onAuthSuccess = { token, username ->
                                currentUser = username
                                currentScreen = Screen.ChatList
                            }
                        )
                    }
                    is Screen.ChatList -> {
                        ChatListScreen(
                            currentUsername = currentUser,
                            onSelectChannel = { channel ->
                                activeRoomTitle = "#${channel.name}"
                                currentScreen = Screen.Room
                            },
                            onSelectUser = { user ->
                                activeRoomTitle = "@${user.displayName ?: user.username}"
                                currentScreen = Screen.Room
                            },
                            onOpenAdminPanel = {
                                // Admin shortcut
                                activeRoomTitle = "System Admin Control"
                                currentScreen = Screen.Room
                            }
                        )
                    }
                    is Screen.Room -> {
                        MessageRoomScreen(
                            roomTitle = activeRoomTitle,
                            currentUsername = currentUser,
                            onBack = { currentScreen = Screen.ChatList }
                        )
                    }
                }
            }
        }
    }
}

sealed class Screen {
    object Auth : Screen()
    object ChatList : Screen()
    object Room : Screen()
}
