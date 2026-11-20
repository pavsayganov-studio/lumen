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
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.safeDrawingPadding
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
import app.lumen.data.Expense
import app.lumen.data.Ledger
import app.lumen.data.Project
import app.lumen.data.ThemeMode
import app.lumen.data.detachFrom
import app.lumen.data.loadBudget
import app.lumen.data.loadCurrency
import app.lumen.data.loadExpenses
import app.lumen.data.loadProjects
import app.lumen.data.loadTheme
import app.lumen.data.paymentFor
import app.lumen.data.saveBudget
import app.lumen.data.saveCurrency
import app.lumen.data.saveExpenses
import app.lumen.data.saveProjects
import app.lumen.data.saveTheme
import java.time.LocalDate
import java.time.YearMonth

internal enum class Screen { Home, Projects, Project, ProjectEdit, Insights, Settings, Add, Budget }

@Composable
fun LumenApp() {
    val context = LocalContext.current
    var screen by rememberSaveable { mutableStateOf(Screen.Home) }
    var month by rememberSaveable { mutableStateOf(YearMonth.now().toString()) }
    var openProject by rememberSaveable { mutableStateOf<String?>(null) }
    var budget by remember { mutableStateOf(loadBudget(context)) }
    var expenses by remember { mutableStateOf(loadExpenses(context)) }
    var projects by remember { mutableStateOf(loadProjects(context)) }
    var currency by remember { mutableStateOf(loadCurrency(context)) }
    var themeMode by remember { mutableStateOf(loadTheme(context)) }
    LaunchedEffect(expenses) { saveExpenses(context, expenses) }
    LaunchedEffect(projects) { saveProjects(context, projects) }

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

    // A project that is gone (deleted, or never opened) falls back to the list.
    val open = projects.firstOrNull { it.id == openProject }
    val shown = if (screen == Screen.Project && open == null) Screen.Projects else screen
    val back = {
        screen = when (shown) {
            Screen.ProjectEdit -> if (open != null) Screen.Project else Screen.Projects
            Screen.Project -> Screen.Projects
            else -> Screen.Home
        }
    }
    BackHandler(enabled = shown != Screen.Home, onBack = back)

    val selectedTab = when (shown) {
        Screen.Budget -> Screen.Home
        Screen.Project, Screen.ProjectEdit -> Screen.Projects
        Screen.Add -> null
        else -> shown
    }
    val deleteExpense = { id: String -> expenses = expenses.filterNot { it.id == id } }
    val monthValue = YearMonth.parse(month)

    LumenTheme(dark, currency) {
        val p = palette
        // Background first, then the safe-area padding: the color runs under the system bars,
        // the content stays clear of them and of the keyboard.
        Column(Modifier.fillMaxSize().background(p.bg).safeDrawingPadding()) {
            Box(Modifier.weight(1f)) {
                when (shown) {
                    Screen.Home -> HomeScreen(
                        expenses, budget, monthValue,
                        onMonth = { month = it.toString() },
                        onAdd = { screen = Screen.Add },
                        onBudget = { screen = Screen.Budget },
                        onDelete = deleteExpense,
                    )
                    Screen.Insights -> InsightsScreen(expenses, monthValue) { month = it.toString() }
                    Screen.Settings -> SettingsScreen(
                        currency,
                        themeMode,
                        Ledger(budget, expenses, projects),
                        onCurrency = { currency = it; saveCurrency(context, it) },
                        onTheme = { themeMode = it; saveTheme(context, it) },
                        onRestore = { restored ->
                            budget = restored.budget
                            saveBudget(context, restored.budget)
                            expenses = restored.expenses
                            projects = restored.projects
                        },
                    )
                    Screen.Add -> AddScreen(
                        onClose = back,
                        onSave = { title, amount, category ->
                            expenses = expenses + Expense("x${System.currentTimeMillis()}", title, amount, LocalDate.now().toString(), category)
                            screen = Screen.Home
                        },
                    )
                    Screen.Budget -> BudgetScreen(budget, back) { value ->
                        budget = value
                        saveBudget(context, value)
                        screen = Screen.Home
                    }
                    Screen.Projects -> ProjectsScreen(
                        projects,
                        expenses,
                        onOpen = { openProject = it; screen = Screen.Project },
                        onNew = { openProject = null; screen = Screen.ProjectEdit },
                    )
                    Screen.ProjectEdit -> ProjectEditor(open, back) { saved: Project ->
                        projects = if (projects.any { it.id == saved.id }) projects.map { if (it.id == saved.id) saved else it } else projects + saved
                        openProject = saved.id
                        screen = Screen.Project
                    }
                    Screen.Project -> open?.let { project ->
                        ProjectScreen(
                            project,
                            expenses,
                            onClose = back,
                            onEdit = { screen = Screen.ProjectEdit },
                            onDelete = {
                                projects = projects.filterNot { it.id == project.id }
                                expenses = expenses.detachFrom(project.id)
                                openProject = null
                                screen = Screen.Projects
                            },
                            onSave = { saved -> projects = projects.map { if (it.id == saved.id) saved else it } },
                            onPay = { amount, row ->
                                expenses = expenses + paymentFor(project, amount, LocalDate.now(), "x${System.currentTimeMillis()}", row)
                            },
                            onDeletePayment = deleteExpense,
                        )
                    }
                }
            }
            BottomBar(selectedTab, onSelect = { screen = it }, onAdd = { screen = Screen.Add })
        }
    }
}
