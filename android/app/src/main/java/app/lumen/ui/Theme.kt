package app.lumen.ui

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.compositeOver
import app.lumen.data.Category
import app.lumen.data.Currency

internal class Palette(
    val bg: Color,
    val ink: Color,
    val muted: Color,
    val accent: Color,
    /** Ends of the accent gradient: budget ring, progress bars, Add button. */
    val accentFrom: Color,
    val accentTo: Color,
    val onAccent: Color,
    val good: Color,
    val danger: Color,
)

internal val DarkPalette = Palette(
    bg = Color(0xFF070B12),
    ink = Color.White,
    muted = Color(0xFF9AA6BD),
    accent = Color(0xFF3AD7FF),
    accentFrom = Color(0xFF7AF0FF),
    accentTo = Color(0xFF1AA4FF),
    onAccent = Color(0xFF041018),
    good = Color(0xFF3DDC97),
    danger = Color(0xFFFF5D73),
)

/** Light uses Cloud Dancer, never pure white. */
internal val LightPalette = Palette(
    bg = Color(0xFFF0EEE9),
    ink = Color(0xFF151A24),
    muted = Color(0xFF566074),
    accent = Color(0xFF08779E),
    accentFrom = Color(0xFF1BA3CC),
    accentTo = Color(0xFF08779E),
    onAccent = Color(0xFFF0EEE9),
    good = Color(0xFF0E8A5C),
    danger = Color(0xFFCF2F49),
)

private val LocalPalette = staticCompositionLocalOf { DarkPalette }

/** The currency of the amounts being shown; the app's main currency until a screen says otherwise. Never converts values. */
internal val LocalCurrency = staticCompositionLocalOf { Currency.EUR }

/** The categories the person created. Built-in ones need no entry here. */
internal val LocalCategories = staticCompositionLocalOf<List<Category>> { emptyList() }

internal val palette: Palette
    @Composable @ReadOnlyComposable get() = LocalPalette.current

/** Amounts inside [content] are shown in [currency]. */
@Composable
internal fun WithCurrency(currency: Currency, content: @Composable () -> Unit) {
    CompositionLocalProvider(LocalCurrency provides currency, content = content)
}

/** Menus and other raised surfaces: ink at 10% over the background, one step above a card. */
internal val Palette.raised: Color get() = ink.copy(alpha = 0.10f).compositeOver(bg)

@Composable
internal fun LumenTheme(dark: Boolean, currency: Currency, categories: List<Category>, content: @Composable () -> Unit) {
    val p = if (dark) DarkPalette else LightPalette
    val scheme = if (dark) {
        darkColorScheme(primary = p.accent, onPrimary = p.onAccent, background = p.bg, onBackground = p.ink, surface = p.bg, onSurface = p.ink, onSurfaceVariant = p.muted)
    } else {
        lightColorScheme(primary = p.accent, onPrimary = p.onAccent, background = p.bg, onBackground = p.ink, surface = p.bg, onSurface = p.ink, onSurfaceVariant = p.muted)
    }
    CompositionLocalProvider(LocalPalette provides p, LocalCurrency provides currency, LocalCategories provides categories) {
        MaterialTheme(colorScheme = scheme, content = content)
    }
}

@Composable
internal fun categoryColor(category: String): Color = when (category) {
    "Housing" -> Color(0xFF2EE6C7)
    "Savings" -> Color(0xFFFF8A3D)
    "Transportation" -> Color(0xFF4C8DFF)
    "Food & Drink" -> Color(0xFFE15CF0)
    "Entertainment" -> Color(0xFFF6C445)
    "Health" -> Color(0xFF34D399)
    "Shopping" -> Color(0xFF8B7CFF)
    else -> LocalCategories.current.firstOrNull { it.id == category }?.let { Color(it.color) } ?: Color(0xFF8B7CFF)
}
