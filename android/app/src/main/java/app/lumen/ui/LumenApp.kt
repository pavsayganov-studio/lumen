package app.lumen.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import app.lumen.data.Demo
import app.lumen.data.SEED
import app.lumen.data.Tx
import app.lumen.data.allocatedTotal
import app.lumen.data.loadExtra
import app.lumen.data.saveExtra
import app.lumen.data.total

internal enum class Screen { Home, Trend, Flow, Breakdown, Upcoming, Saving, Accounts, Add, Budget }

@Composable
fun LumenApp() {
    val context = LocalContext.current
    var screen by rememberSaveable { mutableStateOf(Screen.Home) }
    var budget by rememberSaveable { mutableStateOf(Demo.DEFAULT_BUDGET) }
    var extra by remember { mutableStateOf(loadExtra(context)) }
    LaunchedEffect(extra) { saveExtra(context, extra) }

    val txns = SEED + extra
    val posted = txns.filter { !it.upcoming }
    val upcoming = txns.filter { it.upcoming }
    val spent = posted.total()
    val allocated = allocatedTotal(posted)
    val close = { screen = Screen.Home }

    BackHandler(enabled = screen != Screen.Home, onBack = close)

    LumenTheme {
        // Background first, then the safe-area padding: the color runs under the system bars,
        // the content stays clear of them and of the keyboard.
        Box(Modifier.fillMaxSize().background(Bg).safeDrawingPadding()) {
            when (screen) {
                Screen.Home -> HomeScreen(
                    budget, allocated, spent, posted, upcoming,
                    onOpen = { screen = it },
                    onAdd = { screen = Screen.Add },
                    onBudget = { screen = Screen.Budget },
                )
                Screen.Trend -> TrendScreen(spent, close)
                Screen.Flow -> FlowScreen(posted, close)
                Screen.Breakdown -> BreakdownScreen(spent, posted, close)
                Screen.Upcoming -> UpcomingScreen(upcoming, close)
                Screen.Saving -> SavingScreen(posted, close)
                Screen.Accounts -> AccountsScreen(close)
                Screen.Add -> AddScreen(
                    onClose = close,
                    onSave = { title, amount, category ->
                        extra = extra + Tx("x${System.currentTimeMillis()}", title, amount, Demo.TODAY, category, false)
                        screen = Screen.Home
                    },
                )
                Screen.Budget -> BudgetScreen(budget, close) { value ->
                    budget = value
                    screen = Screen.Home
                }
            }
        }
    }
}
