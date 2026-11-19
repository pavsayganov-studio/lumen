package app.lumen.ui

import android.graphics.Color as AndroidColor
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.compose.BackHandler
import androidx.activity.compose.LocalActivity
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import app.lumen.R
import app.lumen.data.Expense
import app.lumen.data.ThemeMode
import app.lumen.data.loadBudget
import app.lumen.data.loadCurrency
import app.lumen.data.loadExpenses
import app.lumen.data.loadTheme
import app.lumen.data.saveBudget
import app.lumen.data.saveCurrency
import app.lumen.data.saveExpenses
import app.lumen.data.saveTheme
import java.time.LocalDate

internal enum class Screen { Home, History, Insights, Settings, Add, Budget }

/** The four sections in the bottom bar. Add sits between them and opens the editor. */
private val SECTIONS = listOf(
    Triple(Screen.Home, R.drawable.ic_nav_home, R.string.nav_home),
    Triple(Screen.History, R.drawable.ic_nav_list, R.string.nav_history),
    Triple(Screen.Insights, R.drawable.ic_nav_chart, R.string.nav_insights),
    Triple(Screen.Settings, R.drawable.ic_nav_settings, R.string.nav_settings),
)

@Composable
fun LumenApp() {
    val context = LocalContext.current
    var screen by rememberSaveable { mutableStateOf(Screen.Home) }
    var budget by remember { mutableStateOf(loadBudget(context)) }
    var expenses by remember { mutableStateOf(loadExpenses(context)) }
    var currency by remember { mutableStateOf(loadCurrency(context)) }
    var themeMode by remember { mutableStateOf(loadTheme(context)) }
    LaunchedEffect(expenses) { saveExpenses(context, expenses) }

    val dark = when (themeMode) {
        ThemeMode.Dark -> true
        ThemeMode.Light -> false
        ThemeMode.Auto -> isSystemInDarkTheme()
    }
    val activity = LocalActivity.current as? ComponentActivity
    DisposableEffect(activity, dark) {
        // Edge-to-edge is forced from API 35; the icons must match the theme behind them.
        val bars = if (dark) SystemBarStyle.dark(AndroidColor.TRANSPARENT) else SystemBarStyle.light(AndroidColor.TRANSPARENT, AndroidColor.TRANSPARENT)
        activity?.enableEdgeToEdge(statusBarStyle = bars, navigationBarStyle = bars)
        onDispose {}
    }

    val close = { screen = Screen.Home }
    BackHandler(enabled = screen != Screen.Home, onBack = close)

    LumenTheme(dark, currency) {
        val p = palette
        // Background first, then the safe-area padding: the color runs under the system bars,
        // the content stays clear of them and of the keyboard.
        Column(Modifier.fillMaxSize().background(p.bg).safeDrawingPadding()) {
            Box(Modifier.weight(1f)) {
                when (screen) {
                    Screen.Home -> HomeScreen(expenses, budget, onAdd = { screen = Screen.Add }, onBudget = { screen = Screen.Budget })
                    Screen.History -> HistoryScreen(expenses, onDelete = { id -> expenses = expenses.filterNot { it.id == id } })
                    Screen.Insights -> InsightsScreen(expenses)
                    Screen.Settings -> SettingsScreen(
                        currency,
                        themeMode,
                        onCurrency = { currency = it; saveCurrency(context, it) },
                        onTheme = { themeMode = it; saveTheme(context, it) },
                    )
                    Screen.Add -> AddScreen(
                        onClose = close,
                        onSave = { title, amount, category ->
                            expenses = expenses + Expense("x${System.currentTimeMillis()}", title, amount, LocalDate.now().toString(), category)
                            screen = Screen.Home
                        },
                    )
                    Screen.Budget -> BudgetScreen(budget, close) { value ->
                        budget = value
                        saveBudget(context, value)
                        screen = Screen.Home
                    }
                }
            }
            if (screen != Screen.Add && screen != Screen.Budget) {
                NavigationBar(containerColor = p.bg, windowInsets = WindowInsets(0, 0, 0, 0)) {
                    val colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = p.accent,
                        selectedTextColor = p.accent,
                        indicatorColor = p.accent.copy(alpha = 0.16f),
                        unselectedIconColor = p.muted,
                        unselectedTextColor = p.muted,
                    )
                    SECTIONS.forEachIndexed { index, (target, icon, label) ->
                        if (index == 2) {
                            NavigationBarItem(
                                selected = false,
                                onClick = { screen = Screen.Add },
                                icon = { Icon(painterResource(R.drawable.ic_nav_add), null) },
                                label = { Text(stringResource(R.string.nav_add)) },
                                colors = colors,
                            )
                        }
                        NavigationBarItem(
                            selected = screen == target,
                            onClick = { screen = target },
                            icon = { Icon(painterResource(icon), null) },
                            label = { Text(stringResource(label)) },
                            colors = colors,
                        )
                    }
                }
            }
        }
    }
}
