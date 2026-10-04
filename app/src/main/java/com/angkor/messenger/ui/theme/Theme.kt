package com.angkor.messenger.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val DarkSlate = Color(0xFF0F172A)
val SurfaceSlate = Color(0xFF1E293B)
val BorderSlate = Color(0xFF334155)
val KhmerRed = Color(0xFFE11D48)
val KhmerBlue = Color(0xFF2563EB)
val TextWhite = Color(0xFFF8FAFC)
val TextMuted = Color(0xFF94A3B8)
val EmeraldGreen = Color(0xFF10B981)

val AngkorColorScheme = darkColorScheme(
    primary = KhmerRed,
    secondary = KhmerBlue,
    background = DarkSlate,
    surface = SurfaceSlate,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = TextWhite,
    onSurface = TextWhite
)

@Composable
fun AngkorMessengerTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = AngkorColorScheme,
        typography = Typography,
        content = content
    )
}
