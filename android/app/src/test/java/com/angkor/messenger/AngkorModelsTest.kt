package com.angkor.messenger

import com.angkor.messenger.data.model.Channel
import com.angkor.messenger.data.model.User
import com.angkor.messenger.data.model.Message
import org.junit.Assert.*
import org.junit.Test

class AngkorModelsTest {

    @Test
    fun testUserDisplayNameFallback() {
        val user1 = User(id = 1, username = "testuser", displayName = "Test User")
        assertEquals("Test User", user1.displayName ?: user1.username)

        val user2 = User(id = 2, username = "anonymous")
        assertEquals("anonymous", user2.displayName ?: user2.username)
    }

    @Test
    fun testChannelFormatting() {
        val channel = Channel(id = 10, name = "phnom-penh", description = "Capital Chat", isPrivate = 0)
        assertEquals("#phnom-penh", "#${channel.name}")
        assertFalse(channel.isPrivate == 1)
    }

    @Test
    fun testMessageContent() {
        val msg = Message(
            id = 100,
            senderId = 1,
            channelId = 1,
            content = "Hello Angkor!",
            senderUsername = "admin"
        )
        assertEquals("Hello Angkor!", msg.content)
        assertEquals("admin", msg.senderUsername)
    }
}
