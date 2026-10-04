package com.angkor.messenger.ui.chat

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.angkor.messenger.data.model.Channel
import com.angkor.messenger.data.model.User
import com.angkor.messenger.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatListScreen(
    currentUsername: String,
    onSelectChannel: (Channel) -> Unit,
    onSelectUser: (User) -> Unit,
    onOpenAdminPanel: () -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedTab by remember { mutableIntStateOf(0) } // 0: Channels, 1: Direct Messages

    val channels = remember {
        listOf(
            Channel(1, "general", "General discussion channel", 0),
            Channel(2, "phnom-penh", "Community chat for Phnom Penh", 0),
            Channel(3, "siem-reap", "Angkor culture & announcements", 0)
        )
    }

    val directUsers = remember {
        listOf(
            User(2, "sokha", null, "Sokha Visal", null, "user", "online"),
            User(3, "chanthou", null, "Chanthou Heng", null, "user", "offline"),
            User(4, "admin", "admin@angkor.kh", "Angkor Admin", null, "admin", "online")
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .background(AngkorGold, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("អង្គរ", color = AngkorBlueDark, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text("Angkor Messenger", color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                            Text("@$currentUsername", color = AngkorGold, fontSize = 12.sp)
                        }
                    }
                },
                actions = {
                    if (currentUsername == "admin") {
                        TextButton(onClick = onOpenAdminPanel) {
                            Text("ADMIN", color = AngkorGold, fontWeight = FontWeight.Bold)
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = AngkorBlueDark)
            )
        },
        containerColor = AngkorSlate
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
        ) {
            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search chats or channels...", color = TextSecondary) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = TextSecondary) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = AngkorSurface,
                    unfocusedContainerColor = AngkorSurface,
                    focusedBorderColor = AngkorGold,
                    unfocusedBorderColor = Color.Transparent,
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White
                )
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Tabs
            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = AngkorSurface,
                contentColor = AngkorGold
            ) {
                Tab(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    text = { Text("Channels (${channels.size})", fontWeight = FontWeight.SemiBold) }
                )
                Tab(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    text = { Text("Direct Messages (${directUsers.size})", fontWeight = FontWeight.SemiBold) }
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            if (selectedTab == 0) {
                LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(channels.filter { it.name.contains(searchQuery, ignoreCase = true) }) { channel ->
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { onSelectChannel(channel) },
                            colors = CardDefaults.cardColors(containerColor = AngkorSurface),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(42.dp)
                                        .background(AngkorBlue, CircleShape),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text("#", color = AngkorGold, fontWeight = FontWeight.Bold, fontSize = 20.sp)
                                }
                                Spacer(modifier = Modifier.width(16.dp))
                                Column {
                                    Text("#${channel.name}", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                                    Text(channel.description ?: "", color = TextSecondary, fontSize = 12.sp)
                                }
                            }
                        }
                    }
                }
            } else {
                LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(directUsers.filter { (it.displayName ?: it.username).contains(searchQuery, ignoreCase = true) }) { user ->
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { onSelectUser(user) },
                            colors = CardDefaults.cardColors(containerColor = AngkorSurface),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(42.dp)
                                        .background(AngkorGoldLight, CircleShape),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        (user.displayName ?: user.username).take(1).uppercase(),
                                        color = AngkorBlueDark,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 18.sp
                                    )
                                }
                                Spacer(modifier = Modifier.width(16.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(user.displayName ?: user.username, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                                    Text("@${user.username}", color = TextSecondary, fontSize = 12.sp)
                                }
                                Box(
                                    modifier = Modifier
                                        .size(10.dp)
                                        .background(
                                            if (user.status == "online") Color(0xFF10B981) else Color.Gray,
                                            CircleShape
                                        )
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
