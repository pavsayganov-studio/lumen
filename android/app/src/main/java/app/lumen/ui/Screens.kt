package app.lumen.ui

import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.lumen.R
import app.lumen.data.Category
import app.lumen.data.Currency
import app.lumen.data.Expense
import app.lumen.data.Ledger
import app.lumen.data.ThemeMode
import app.lumen.data.Period
import app.lumen.data.byCurrency
import app.lumen.data.create
import app.lumen.data.isFreeName
import app.lumen.data.inCurrency
import app.lumen.data.inPeriod
import app.lumen.data.newestFirst
import app.lumen.data.parseAmount
import app.lumen.data.plainAmount
import app.lumen.data.readBackup
import app.lumen.data.total
import app.lumen.data.visibleIds
import app.lumen.data.writeBackup
import java.time.LocalDate
import java.time.YearMonth

@Composable
private fun MonthNote(month: YearMonth, today: LocalDate) {
    val current = YearMonth.from(today)
    val text = when {
        month == current -> {
            val days = month.lengthOfMonth() - today.dayOfMonth
            LocalContext.current.resources.getQuantityString(R.plurals.days_left, days, days)
        }
        month < current -> stringResource(R.string.month_closed)
        else -> stringResource(R.string.month_ahead)
    }
    Text(text, color = palette.muted)
}

/** The currencies the menu offers: the main one, the one on screen and every one with an expense. */
internal fun currenciesInUse(expenses: List<Expense>, main: Currency, shown: Currency?): List<Currency> =
    Currency.entries.filter { c -> c == main || c == shown || expenses.any { it.currency == c } }

/**
 * The dashboard for the chosen period and currency, with the matching history underneath: open by default, newest first, one block per day.
 * The budget ring needs a whole month in the main currency; every other view shows what was spent.
 */
@Composable
internal fun HomeScreen(
    expenses: List<Expense>,
    budget: Double,
    main: Currency,
    period: Period,
    shown: Currency?,
    onPeriod: (Period) -> Unit,
    onShown: (Currency?) -> Unit,
    onAdd: () -> Unit,
    onBudget: () -> Unit,
    onDelete: (String) -> Unit,
) {
    val today = LocalDate.now()
    val inView = remember(expenses, period, shown) { expenses.inPeriod(period).inCurrency(shown) }
    val days = remember(inView) { inView.newestFirst().groupBy { it.date }.toList() }
    val month = period.month
    var historyOpen by rememberSaveable { mutableStateOf(true) }
    LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(Dimens.screen)) {
        item { ViewBar(period, shown, currenciesInUse(expenses, main, shown), onPeriod, onShown) }
        if (shown == main && month != null) {
            val spent = inView.total()
            val available = budget - spent
            item { MonthNote(month, today) }
            item { BudgetRing(if (budget > 0) spent / budget else 0.0, money(available)) }
            item {
                Row(Modifier.fillMaxWidth()) {
                    Stat(stringResource(R.string.budget), money(budget), Modifier.weight(1f), onBudget)
                    Stat(stringResource(R.string.spent), money(spent), Modifier.weight(1f))
                    Stat(stringResource(R.string.available), money(available), Modifier.weight(1f))
                }
            }
            if (budget <= 0) item { PromptCard(stringResource(R.string.set_budget), stringResource(R.string.set_budget_hint), onBudget) }
        } else if (shown != null) {
            item { SpentSummary(listOf(shown to inView.total())) }
        } else {
            item { SpentSummary(inView.byCurrency()) }
        }
        if (expenses.isEmpty()) item { PromptCard(stringResource(R.string.add_first), stringResource(R.string.add_first_hint), onAdd) }
        if (expenses.isNotEmpty() && inView.isEmpty()) {
            item { Text(stringResource(R.string.nothing_spent), color = palette.muted, modifier = Modifier.padding(top = 16.dp)) }
        }
        if (inView.isNotEmpty()) {
            item { HistoryHeader(inView.size, historyOpen) { historyOpen = !historyOpen } }
            if (historyOpen) {
                days.forEachIndexed { index, (date, day) ->
                    item(key = "day:$date") { DayHeader(date, first = index == 0) }
                    items(day, key = { it.id }) { e ->
                        // The comment is optional; without one the category is the title.
                        TxRow(
                            e.title.ifBlank { categoryName(e.category) },
                            "\u2212" + money(e.amount, e.currency, 2),
                            if (e.title.isBlank()) null else categoryName(e.category),
                            trailing = { DeleteLink { onDelete(e.id) } },
                        )
                    }
                }
            }
        }
    }
}

/** What was spent, one big figure per currency. Currencies are listed side by side, never added. */
@Composable
private fun SpentSummary(rows: List<Pair<Currency, Double>>) {
    Column(Modifier.fillMaxWidth().padding(vertical = 28.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        Text(stringResource(R.string.spent), color = palette.muted)
        rows.forEach { (currency, amount) -> Heading(money(amount, currency), 40.sp) }
    }
}

/** The date that opens one day of History; a line separates it from the day before. */
@Composable
private fun DayHeader(date: String, first: Boolean) {
    Column(Modifier.fillMaxWidth().padding(top = 12.dp)) {
        if (!first) HorizontalDivider(color = palette.ink.copy(alpha = 0.1f))
        Text(
            shortDate(date),
            color = palette.muted,
            fontSize = 13.sp,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.padding(top = if (first) 0.dp else 10.dp),
        )
    }
}

@Composable
private fun HistoryHeader(count: Int, open: Boolean, onToggle: () -> Unit) {
    Row(
        Modifier.fillMaxWidth().padding(top = 18.dp).heightIn(min = Dimens.touch).clickable(role = Role.Button, onClick = onToggle),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Heading(stringResource(R.string.history), 22.sp, Modifier.weight(1f))
        Text(count.toString(), color = palette.muted)
        Text(if (open) "  \u25B4" else "  \u25BE", color = palette.muted)
    }
}

private fun themeText(mode: ThemeMode): Int = when (mode) {
    ThemeMode.Auto -> R.string.theme_auto
    ThemeMode.Light -> R.string.theme_light
    ThemeMode.Dark -> R.string.theme_dark
}

@Composable
internal fun SettingsScreen(
    currency: Currency,
    theme: ThemeMode,
    ledger: Ledger,
    onCurrency: (Currency) -> Unit,
    onTheme: (ThemeMode) -> Unit,
    onRestore: (Ledger) -> Unit,
) {
    val context = LocalContext.current
    var status by remember { mutableStateOf<Int?>(null) }
    var pending by remember { mutableStateOf<Ledger?>(null) }
    val save = rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("application/json")) { uri ->
        if (uri != null) status = if (writeBackup(context, uri, ledger, LocalDate.now())) R.string.backup_done else R.string.backup_failed
    }
    val open = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        if (uri != null) {
            val read = readBackup(context, uri, currency)
            if (read == null) status = R.string.restore_invalid else pending = read
        }
    }
    Detail(stringResource(R.string.nav_settings)) {
        Text(stringResource(R.string.settings_blurb), color = palette.muted)
        Heading(stringResource(R.string.currency), 18.sp, Modifier.padding(top = 20.dp))
        Text(stringResource(R.string.currency_help), color = palette.muted, fontSize = 13.sp)
        CurrencyPicker(currency, onCurrency, Modifier.padding(top = 10.dp), wide = true)
        Heading(stringResource(R.string.theme), 18.sp, Modifier.padding(top = 20.dp))
        val themeNames = ThemeMode.entries.associateWith { stringResource(themeText(it)) }
        MenuButton(
            themeNames.getValue(theme),
            ThemeMode.entries,
            { themeNames.getValue(it) },
            { it == theme },
            stringResource(R.string.theme),
            onTheme,
            Modifier.padding(top = 10.dp),
            wide = true,
        )
        Heading(stringResource(R.string.backup), 18.sp, Modifier.padding(top = 20.dp))
        Text(stringResource(R.string.backup_help), color = palette.muted, fontSize = 13.sp)
        Row(Modifier.fillMaxWidth().padding(top = 10.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Choice(stringResource(R.string.backup_save), false, Modifier.weight(1f)) { save.launch("lumen-${LocalDate.now()}.json") }
            Choice(stringResource(R.string.backup_restore), false, Modifier.weight(1f)) { open.launch(arrayOf("*/*")) }
        }
        status?.let { Text(stringResource(it), color = palette.muted, modifier = Modifier.padding(top = 10.dp)) }
    }
    pending?.let { incoming ->
        FormDialog(
            stringResource(R.string.restore_title),
            stringResource(R.string.restore),
            { onRestore(incoming); status = R.string.restore_done; pending = null },
            { pending = null },
        ) { Text(stringResource(R.string.restore_ask), color = palette.muted) }
    }
}

@Composable
internal fun AddScreen(
    categories: List<Category>,
    startCurrency: Currency,
    onClose: () -> Unit,
    onNewCategory: (Category) -> Unit,
    onRenameCategory: (id: String, name: String) -> Unit,
    onDeleteCategory: (String) -> Unit,
    onSave: (comment: String, amount: Double, category: String, currency: Currency) -> Unit,
) {
    // The form keeps its state while a category is being edited: the editor is drawn in its place, not on a new screen.
    var comment by rememberSaveable { mutableStateOf("") }
    var amount by rememberSaveable { mutableStateOf("") }
    var category by rememberSaveable { mutableStateOf<String?>(null) }
    var currency by rememberSaveable { mutableStateOf(startCurrency) }
    var adding by rememberSaveable { mutableStateOf(false) }
    var editing by rememberSaveable { mutableStateOf<String?>(null) }
    var deleting by rememberSaveable { mutableStateOf<String?>(null) }
    val named = categories.visibleIds().map { it to categoryName(it) }
    val toEdit = named.firstOrNull { it.first == editing }
    if (toEdit != null) {
        BackHandler { editing = null }
        CategoryEditor(
            initial = toEdit.second,
            taken = named.filter { it.first != toEdit.first }.map { it.second },
            onSave = { onRenameCategory(toEdit.first, it); editing = null },
            onClose = { editing = null },
        )
    } else {
        Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(Dimens.screen)) {
            CloseLink(onClose)
            Heading(stringResource(R.string.new_expense), 28.sp, Modifier.padding(vertical = 12.dp))
            AmountField(amount, { amount = it }, currency) { currency = it }
            Spacer(Modifier.height(8.dp))
            Field(comment, stringResource(R.string.comment), { comment = it })
            Spacer(Modifier.height(12.dp))
            Text(stringResource(R.string.category), color = palette.muted)
            named.forEach { (id, name) ->
                val selected = id == category
                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        if (selected) "\u25CF  " + name else name,
                        color = if (selected) categoryColor(id) else palette.muted,
                        fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Normal,
                        modifier = Modifier.weight(1f).selectable(selected, role = Role.RadioButton) { category = id }.padding(vertical = 12.dp),
                    )
                    IconAction(R.drawable.ic_edit, stringResource(R.string.edit_named, name)) { editing = id }
                    IconAction(R.drawable.ic_delete, stringResource(R.string.delete_named, name)) { deleting = id }
                }
            }
            Text(
                "+  " + stringResource(R.string.new_category),
                color = palette.accent,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.fillMaxWidth().heightIn(min = Dimens.touch).clickable { adding = true }.padding(vertical = 12.dp),
            )
            Spacer(Modifier.height(12.dp))
            val value = parseAmount(amount)
            val chosen = category
            Button(
                onClick = { if (value != null && value > 0 && chosen != null) onSave(comment.trim(), value, chosen, currency) },
                enabled = value != null && value > 0 && chosen != null,
                modifier = Modifier.fillMaxWidth(),
            ) { Text(stringResource(R.string.save_expense)) }
        }
    }
    if (adding) {
        NewCategoryDialog(
            categories,
            taken = named.map { it.second },
            onCreate = { created -> onNewCategory(created); category = created.id; adding = false },
            onDismiss = { adding = false },
        )
    }
    named.firstOrNull { it.first == deleting }?.let { (id, name) ->
        FormDialog(
            stringResource(R.string.delete_named, name),
            stringResource(R.string.delete),
            { if (category == id) category = null; onDeleteCategory(id); deleting = null },
            { deleting = null },
        ) { Text(stringResource(R.string.delete_category_ask), color = palette.muted) }
    }
}

/** The category editing screen: the name, and Save. A category is named by what is shown, so the name must differ from the others shown. */
@Composable
private fun CategoryEditor(initial: String, taken: List<String>, onSave: (String) -> Unit, onClose: () -> Unit) {
    var name by rememberSaveable { mutableStateOf(initial) }
    val free = isFreeName(name, taken)
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(Dimens.screen)) {
        CloseLink(onClose)
        Heading(stringResource(R.string.edit_category), 28.sp, Modifier.padding(vertical = 12.dp))
        Field(name, stringResource(R.string.category_name), { name = it.take(30) })
        if (name.isNotBlank() && !free) Text(stringResource(R.string.category_exists), color = palette.danger, fontSize = 13.sp)
        Spacer(Modifier.height(12.dp))
        Button(onClick = { if (free) onSave(name.trim()) }, enabled = free, modifier = Modifier.fillMaxWidth()) { Text(stringResource(R.string.save)) }
    }
}

@Composable
private fun NewCategoryDialog(categories: List<Category>, taken: List<String>, onCreate: (Category) -> Unit, onDismiss: () -> Unit) {
    var name by rememberSaveable { mutableStateOf("") }
    FormDialog(
        stringResource(R.string.new_category),
        stringResource(R.string.save),
        { if (isFreeName(name, taken)) onCreate(categories.create("c${System.currentTimeMillis()}", name)) },
        onDismiss,
    ) {
        Field(name, stringResource(R.string.category_name), { name = it.take(30) })
        if (name.isNotBlank() && !isFreeName(name, taken)) Text(stringResource(R.string.category_exists), color = palette.danger, fontSize = 13.sp)
    }
}

@Composable
internal fun BudgetScreen(current: Double, onClose: () -> Unit, onSave: (Double) -> Unit) {
    var text by rememberSaveable { mutableStateOf(if (current > 0) plainAmount(current) else "") }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(Dimens.screen)) {
        CloseLink(onClose)
        Heading(stringResource(R.string.monthly_budget), 28.sp, Modifier.padding(vertical = 12.dp))
        Field(text, stringResource(R.string.budget), { text = it }, KeyboardType.Decimal)
        Spacer(Modifier.height(12.dp))
        Button(
            onClick = {
                val value = parseAmount(text)
                if (value != null && value > 0) onSave(value)
            },
            modifier = Modifier.fillMaxWidth(),
        ) { Text(stringResource(R.string.save)) }
    }
}
