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
import androidx.compose.runtime.saveable.Saver
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import app.lumen.data.Currency
import app.lumen.data.Expense
import app.lumen.data.Ledger
import app.lumen.data.Period
import app.lumen.data.Project
import app.lumen.data.ThemeMode
import app.lumen.data.detachFrom
import app.lumen.data.loadBudget
import app.lumen.data.loadCategories
import app.lumen.data.loadCurrency
import app.lumen.data.loadExpenses
import app.lumen.data.loadProjects
import app.lumen.data.loadTheme
import app.lumen.data.paymentFor
import app.lumen.data.saveBudget
import app.lumen.data.saveCategories
import app.lumen.data.saveCurrency
import app.lumen.data.saveExpenses
import app.lumen.data.saveProjects
import app.lumen.data.saveTheme
import java.time.LocalDate
import java.time.YearMonth

internal enum class Screen { Home, Projects, Project, ProjectEdit, Insights, Settings, Add, Budget }

/** The period survives a screen rotation as its text form. */
private val PeriodSaver = Saver<Period, Any>(save = { it.toString() }, restore = { Period.parse(it as String) })

@Composable
fun LumenApp() {
    val context = LocalContext.current
    var screen by rememberSaveable { mutableStateOf(Screen.Home) }
    // The main currency: the budget is in it, new expenses start in it, and entries saved without a currency belong to it.
    var currency by remember { mutableStateOf(loadCurrency(context)) }
    // What Home and Insights show; not saved. Whole current month, in the main currency.
    var period by rememberSaveable(stateSaver = PeriodSaver) { mutableStateOf(Period.month(YearMonth.now())) }
    // A currency name, or empty for Total (every currency, side by side).
    var viewCode by rememberSaveable { mutableStateOf(currency.name) }
    var openProject by rememberSaveable { mutableStateOf<String?>(null) }
    var budget by remember { mutableStateOf(loadBudget(context)) }
    var expenses by remember { mutableStateOf(loadExpenses(context, currency)) }
    var projects by remember { mutableStateOf(loadProjects(context, currency)) }
    var categories by remember { mutableStateOf(loadCategories(context)) }
    var themeMode by remember { mutableStateOf(loadTheme(context)) }
    LaunchedEffect(expenses) { saveExpenses(context, expenses) }
    LaunchedEffect(projects) { saveProjects(context, projects) }
    LaunchedEffect(categories) { saveCategories(context, categories) }

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
    val view = Currency.entries.firstOrNull { it.name == viewCode }
    val onShown = { picked: Currency? -> viewCode = picked?.name ?: "" }

    LumenTheme(dark, currency, categories) {
        val p = palette
        // Background first, then the safe-area padding: the color runs under the system bars,
        // the content stays clear of them and of the keyboard.
        Column(Modifier.fillMaxSize().background(p.bg).safeDrawingPadding()) {
            Box(Modifier.weight(1f)) {
                when (shown) {
                    Screen.Home -> HomeScreen(
                        expenses, budget, currency, period, view,
                        onPeriod = { period = it },
                        onShown = onShown,
                        onAdd = { screen = Screen.Add },
                        onBudget = { screen = Screen.Budget },
                        onDelete = deleteExpense,
                    )
                    Screen.Insights -> InsightsScreen(expenses, currency, period, view, onPeriod = { period = it }, onShown = onShown)
                    Screen.Settings -> SettingsScreen(
                        currency,
                        themeMode,
                        Ledger(budget, expenses, projects, categories),
                        onCurrency = { currency = it; saveCurrency(context, it) },
                        onTheme = { themeMode = it; saveTheme(context, it) },
                        onRestore = { restored ->
                            budget = restored.budget
                            saveBudget(context, restored.budget)
                            expenses = restored.expenses
                            projects = restored.projects
                            categories = restored.categories
                        },
                    )
                    Screen.Add -> AddScreen(
                        expenses,
                        categories,
                        startCurrency = view ?: currency,
                        onClose = back,
                        onNewCategory = { categories = categories + it },
                        onDeleteCategory = { id -> categories = categories.filterNot { it.id == id } },
                        onSave = { title, amount, category, spentIn ->
                            expenses = expenses + Expense("x${System.currentTimeMillis()}", title, amount, LocalDate.now().toString(), category, spentIn)
                            // Back on Home the new expense must be in view; Total already shows every currency.
                            if (view != null) viewCode = spentIn.name
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
                    Screen.ProjectEdit -> ProjectEditor(open, view ?: currency, back) { saved: Project ->
                        projects = if (projects.any { it.id == saved.id }) projects.map { if (it.id == saved.id) saved else it } else projects + saved
                        openProject = saved.id
                        screen = Screen.Project
                    }
                    Screen.Project -> open?.let { project ->
                        WithCurrency(project.currency) {
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
            }
            BottomBar(selectedTab, onSelect = { screen = it }, onAdd = { screen = Screen.Add })
        }
    }
}
