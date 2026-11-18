package app.lumen.ui

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

internal val Bg = Color(0xFF070B12)
internal val Muted = Color(0xFF9AA6BD)
internal val Cyan = Color(0xFF3AD7FF)
internal val Good = Color(0xFF3DDC97)

private val OnCyan = Color(0xFF041018)

private val LumenColors = darkColorScheme(
    primary = Cyan,
    onPrimary = OnCyan,
    background = Bg,
    onBackground = Color.White,
    surface = Bg,
    onSurface = Color.White,
    onSurfaceVariant = Muted,
)

/** Dark scheme, so Material defaults (buttons, text fields) stay readable on the dark background. */
@Composable
internal fun LumenTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = LumenColors, content = content)
}

internal fun categoryColor(category: String): Color = when (category) {
    "Housing" -> Color(0xFF2EE6C7)
    "Savings" -> Color(0xFFFF8A3D)
    "Transportation" -> Color(0xFF4C8DFF)
    "Food & Drink" -> Color(0xFFE15CF0)
    else -> Color(0xFF8B7CFF)
}
