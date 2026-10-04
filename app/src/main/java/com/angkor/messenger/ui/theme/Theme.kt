package com.angkor.messenger.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Cipher Slate Color Palette (from DESIGN.md)
val SurfaceVoid = Color(0xFF0B0F17)
val SurfaceBackground = Color(0xFF071423)
val SurfaceCanvas = Color(0xFF131A26)
val SurfaceContainerLow = Color(0xFF0F1C2B)
val SurfaceContainer = Color(0xFF14202F)
val SurfaceContainerHigh = Color(0xFF1E2B3A)
val SurfaceContainerHighest = Color(0xFF293645)
val SurfaceElevated = Color(0xFF1C2433)
val SurfaceInteractive = Color(0xFF253045)

val PrimaryElectricBlue = Color(0xFF007AFF)
val PrimaryLight = Color(0xFFADC6FF)
val SecondaryCyan = Color(0xFF00C2FF)
val SecondaryLight = Color(0xFF8FD8FF)
val TertiaryEmerald = Color(0xFF10B981)
val DestructiveRed = Color(0xFFEF4444)

val OnSurfacePrimary = Color(0xFFFFFFFF)
val OnSurfaceSecondary = Color(0xFFD6E3F8)
val TextSecondary = Color(0xFF8E9BAE)
val TextMuted = Color(0xFF4B586E)
val BorderSubtle = Color(0xFF253045)
val OutlineColor = Color(0xFF8B90A0)

// Backward compatibility aliases if needed
val DarkSlate = SurfaceBackground
val SurfaceSlate = SurfaceContainerHigh
val BorderSlate = BorderSubtle
val KhmerRed = PrimaryElectricBlue
val KhmerBlue = SecondaryCyan
val TextWhite = OnSurfacePrimary
val EmeraldGreen = TertiaryEmerald

val CipherSlateColorScheme = darkColorScheme(
    primary = PrimaryElectricBlue,
    onPrimary = OnSurfacePrimary,
    primaryContainer = Color(0xFF4B8EFF),
    onPrimaryContainer = Color(0xFF00285C),
    secondary = SecondaryCyan,
    onSecondary = Color(0xFF003548),
    secondaryContainer = Color(0xFF00C1FD),
    onSecondaryContainer = Color(0xFF004B65),
    tertiary = TertiaryEmerald,
    onTertiary = Color(0xFF003824),
    tertiaryContainer = Color(0xFF00A572),
    onTertiaryContainer = Color(0xFF00311F),
    background = SurfaceBackground,
    onBackground = OnSurfaceSecondary,
    surface = SurfaceContainer,
    onSurface = OnSurfacePrimary,
    surfaceVariant = SurfaceContainerHighest,
    onSurfaceVariant = TextSecondary,
    outline = OutlineColor,
    outlineVariant = BorderSubtle,
    error = DestructiveRed
)

@Composable
fun AngkorMessengerTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = CipherSlateColorScheme,
        typography = Typography,
        content = content
    )
}
