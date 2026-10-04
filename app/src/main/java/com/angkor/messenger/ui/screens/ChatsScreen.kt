package com.angkor.messenger.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.angkor.messenger.model.User
import com.angkor.messenger.network.NetworkClient
import com.angkor.messenger.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatsScreen(
    currentUser: User,
    onSelectConversation: (User) -> Unit,
    onOpenProfileSettings: () -> Unit
) {
    var usersList by remember { mutableStateOf<List<User>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var selectedFilter by remember { mutableStateOf("all") }
    val coroutineScope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        coroutineScope.launch {
            try {
                val res = NetworkClient.apiService.getUsers()
                if (res.isSuccessful) {
                    usersList = res.body()?.filter { it.id != currentUser.id } ?: emptyList()
                }
            } catch (e: Exception) {
                // handle error
            } finally {
                isLoading = false
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .clickable { onOpenProfileSettings() }
                        ) {
                            AsyncImage(
                                model = currentUser.avatar,
                                contentDescription = "Profile",
                                modifier = Modifier.fillMaxSize(),
                                contentScale = ContentScale.Crop
                            )
                        }
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = "Cipher",
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = OnSurfacePrimary
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "🔒",
                                    fontSize = 12.sp
                                )
                            }
                            Text(
                                text = "Encrypted Chats",
                                fontSize = 11.sp,
                                color = TextSecondary
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = SurfaceContainer
                ),
                actions = {
                    Box(
                        modifier = Modifier
                            .padding(end = 8.dp)
                            .clip(RoundedCornerShape(50))
                            .background(TertiaryEmerald.copy(alpha = 0.15f))
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = "E2EE ACTIVE",
                            color = TertiaryEmerald,
                            fontSize = 10.sp,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    IconButton(onClick = { onOpenProfileSettings() }) {
                        Text(text = "⚙️", fontSize = 18.sp)
                    }
                }
            )
        },
        containerColor = SurfaceBackground
    ) { paddingValues ->
        if (isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = SecondaryCyan)
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
            ) {
                // Security Notice Banner
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 8.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(SurfaceContainer)
                            .border(1.dp, BorderSubtle, RoundedCornerShape(12.dp))
                            .padding(12.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Text(text = "🔐", fontSize = 16.sp)
                                Column {
                                    Text(
                                        text = "Quantum-Resistant Layer",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = OnSurfacePrimary
                                    )
                                    Text(
                                        text = "Signal Ratchet + Kyber-1024 Active",
                                        fontSize = 10.sp,
                                        fontFamily = FontFamily.Monospace,
                                        color = TextSecondary
                                    )
                                }
                            }
                            Text(text = "VERIFIED", color = TertiaryEmerald, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }

                // Filter Pills
                item {
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp)
                    ) {
                        val filters = listOf("all" to "All (18)", "unread" to "Unread (3)", "groups" to "Groups", "vault" to "🔑 Vault")
                        items(filters) { (key, label) ->
                            val isSelected = selectedFilter == key
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(20.dp))
                                    .background(if (isSelected) PrimaryElectricBlue else SurfaceContainer)
                                    .clickable { selectedFilter = key }
                                    .padding(horizontal = 12.dp, vertical = 6.dp)
                            ) {
                                Text(
                                    text = label,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = if (isSelected) Color.White else TextSecondary
                                )
                            }
                        }
                    }
                }

                // Active Contacts Carousel
                item {
                    Column(modifier = Modifier.padding(vertical = 8.dp)) {
                        Text(
                            text = "ONLINE DIRECT CONTACTS",
                            fontSize = 10.sp,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            color = TextSecondary,
                            modifier = Modifier.padding(start = 16.dp, end = 16.dp, bottom = 8.dp)
                        )
                        LazyRow(
                            horizontalArrangement = Arrangement.spacedBy(16.dp),
                            contentPadding = PaddingValues(horizontal = 16.dp)
                        ) {
                            items(usersList) { user ->
                                Column(
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    modifier = Modifier
                                        .width(60.dp)
                                        .clickable { onSelectConversation(user) }
                                ) {
                                    Box(modifier = Modifier.size(50.dp)) {
                                        AsyncImage(
                                            model = user.avatar,
                                            contentDescription = null,
                                            modifier = Modifier
                                                .fillMaxSize()
                                                .clip(CircleShape),
                                            contentScale = ContentScale.Crop
                                        )
                                        if (user.status == "online") {
                                            Box(
                                                modifier = Modifier
                                                    .size(12.dp)
                                                    .background(TertiaryEmerald, CircleShape)
                                                    .border(2.dp, SurfaceBackground, CircleShape)
                                                    .align(Alignment.BottomEnd)
                                            )
                                        }
                                    }
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = user.name.split(" ")[0],
                                        fontSize = 11.sp,
                                        color = OnSurfacePrimary,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                }
                            }
                        }
                    }
                    HorizontalDivider(modifier = Modifier.padding(top = 8.dp), color = BorderSubtle)
                }

                // Conversations List
                items(usersList) { user ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onSelectConversation(user) }
                            .padding(horizontal = 16.dp, vertical = 12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(modifier = Modifier.size(48.dp)) {
                            AsyncImage(
                                model = user.avatar,
                                contentDescription = null,
                                modifier = Modifier
                                    .fillMaxSize()
                                    .clip(CircleShape),
                                contentScale = ContentScale.Crop
                            )
                            if (user.status == "online") {
                                Box(
                                    modifier = Modifier
                                        .size(12.dp)
                                        .background(TertiaryEmerald, CircleShape)
                                        .border(2.dp, SurfaceBackground, CircleShape)
                                        .align(Alignment.BottomEnd)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.width(12.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = user.name,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = OnSurfacePrimary
                                )
                                Text(
                                    text = if (user.status == "online") "Active" else "Offline",
                                    fontSize = 10.sp,
                                    fontFamily = FontFamily.Monospace,
                                    color = if (user.status == "online") TertiaryEmerald else TextMuted
                                )
                            }
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "E2EE session active • Tap to open...",
                                fontSize = 12.sp,
                                color = TextSecondary,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }
                }
            }
        }
    }
}
