package com.moventra.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.material3.Shapes
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.shape.RoundedCornerShape

// LIGHT COLOR SCHEME
private val LightColors = lightColorScheme(
    primary = MovGreen1,
    onPrimary = Color.White,
    primaryContainer = MovGreen2,
    onPrimaryContainer = Color.White,

    secondary = MovGreen2,
    onSecondary = Color.White,
    secondaryContainer = MovLightBgAlt,
    onSecondaryContainer = MovTextDark,

    background = MovLightBg,
    onBackground = MovTextDark,

    surface = MovCardLight,
    onSurface = MovTextDark,
    surfaceVariant = MovLightBgAlt,
    onSurfaceVariant = MovTextDescription,

    outline = MovBorderLight,

    error = Color(0xFFB00020),
    onError = Color.White
)

// DARK COLOR SCHEME
private val DarkColors = darkColorScheme(
    primary = MovGreen1,
    onPrimary = Color.White,
    primaryContainer = MovGreen3,
    onPrimaryContainer = Color.White,

    secondary = MovGreen2,
    onSecondary = Color.White,
    secondaryContainer = MovDarkSurface,
    onSecondaryContainer = MovDarkText,

    background = MovDarkBg,
    onBackground = MovDarkText,

    surface = MovDarkSurface,
    onSurface = MovDarkText,
    surfaceVariant = MovDarkBg,
    onSurfaceVariant = MovDarkSubtleText,

    outline = MovBorderStrong,

    error = Color(0xFFEF4444),
    onError = Color(0xFF111827)
)

// SHAPES – Moventra tarzı yumuşak köşeler
val MovShapes = Shapes(
    extraSmall = RoundedCornerShape(8.dp),
    small = RoundedCornerShape(12.dp),
    medium = RoundedCornerShape(16.dp),
    large = RoundedCornerShape(22.dp),
    extraLarge = RoundedCornerShape(26.dp)
)

@Composable
fun MoventraTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colors = if (darkTheme) DarkColors else LightColors

    MaterialTheme(
        colorScheme = colors,
        typography = MovTypography,
        shapes = MovShapes,
        content = content
    )
}
