package app.lumen.ui

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.lumen.R
import app.lumen.data.CATEGORIES
import app.lumen.data.Currency
import app.lumen.data.Expense
import app.lumen.data.Ledger
import app.lumen.data.ThemeMode
import app.lumen.data.byCategory
import app.lumen.data.inMonth
import app.lumen.data.newestFirst
import app.lumen.data.parseAmount
import app.lumen.data.plainAmount
import app.lumen.data.readBackup
import app.lumen.data.total
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

/** The dashboard for one month, with the full history underneath. The history is collapsed until it is asked for. */
@Composable
internal fun HomeScreen(
    expenses: List<Expense>,
    budget: Double,
    month: YearMonth,
    onMonth: (YearMonth) -> Unit,
    onAdd: () -> Unit,
    onBudget: () -> Unit,
    onDelete: (String) -> Unit,
) {
    val today = LocalDate.now()
    val spent = expenses.inMonth(month.toString()).total()
    val available = budget - spent
    var historyOpen by rememberSaveable { mutableStateOf(false) }
    val history = remember(expenses) { expenses.newestFirst() }
    LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(Dimens.screen)) {
        item { MonthHeader(month, onMonth) }
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
        if (expenses.isEmpty()) item { PromptCard(stringResource(R.string.add_first), stringResource(R.string.add_first_hint), onAdd) }
        if (expenses.isNotEmpty()) {
            item { HistoryHeader(history.size, historyOpen) { historyOpen = !historyOpen } }
            if (historyOpen) {
                items(history, key = { it.id }) { e ->
                    TxRow(
                        e.title,
                        "\u2212" + money(e.amount, 2),
                        categoryName(e.category) + " \u00B7 " + shortDate(e.date),
                        trailing = { DeleteLink { onDelete(e.id) } },
                    )
                }
            }
        }
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

@Composable
internal fun InsightsScreen(expenses: List<Expense>, month: YearMonth, onMonth: (YearMonth) -> Unit) {
    val spent = expenses.inMonth(month.toString())
    val total = spent.total()
    Detail(stringResource(R.string.nav_insights)) {
        MonthHeader(month, onMonth, 20.sp)
        Heading(money(total, 2), 36.sp)
        Text(stringResource(R.string.total_spending), color = palette.muted)
        if (spent.isEmpty()) Text(stringResource(R.string.nothing_spent), color = palette.muted, modifier = Modifier.padding(top = 16.dp))
        spent.byCategory().forEach { (category, amount) ->
            TxRow("\u25CF  " + categoryName(category), money(amount, 2), titleColor = categoryColor(category))
            Box(Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)).background(palette.ink.copy(alpha = 0.08f))) {
                Box(Modifier.fillMaxWidth((amount / total).toFloat().coerceIn(0f, 1f)).height(6.dp).background(categoryColor(category)))
            }
        }
    }
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
            val read = readBackup(context, uri)
            if (read == null) status = R.string.restore_invalid else pending = read
        }
    }
    Detail(stringResource(R.string.nav_settings)) {
        Text(stringResource(R.string.settings_blurb), color = palette.muted)
        Heading(stringResource(R.string.currency), 18.sp, Modifier.padding(top = 20.dp))
        Text(stringResource(R.string.currency_help), color = palette.muted, fontSize = 13.sp)
        Row(Modifier.fillMaxWidth().padding(top = 10.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Currency.entries.forEach { c ->
                Choice(c.symbol + " " + c.name, c == currency, Modifier.weight(1f)) { onCurrency(c) }
            }
        }
        Heading(stringResource(R.string.theme), 18.sp, Modifier.padding(top = 20.dp))
        Row(Modifier.fillMaxWidth().padding(top = 10.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            ThemeMode.entries.forEach { m ->
                val label = when (m) {
                    ThemeMode.Auto -> R.string.theme_auto
                    ThemeMode.Light -> R.string.theme_light
                    ThemeMode.Dark -> R.string.theme_dark
                }
                Choice(stringResource(label), m == theme, Modifier.weight(1f)) { onTheme(m) }
            }
        }
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
internal fun AddScreen(onClose: () -> Unit, onSave: (title: String, amount: Double, category: String) -> Unit) {
    var title by rememberSaveable { mutableStateOf("") }
    var amount by rememberSaveable { mutableStateOf("") }
    var category by rememberSaveable { mutableStateOf("Food & Drink") }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(Dimens.screen)) {
        CloseLink(onClose)
        Heading(stringResource(R.string.new_expense), 28.sp, Modifier.padding(vertical = 12.dp))
        Field(amount, stringResource(R.string.amount), { amount = it }, KeyboardType.Decimal)
        Spacer(Modifier.height(8.dp))
        Field(title, stringResource(R.string.name), { title = it })
        Spacer(Modifier.height(12.dp))
        CATEGORIES.forEach { id ->
            val selected = id == category
            Text(
                if (selected) "\u25CF  " + categoryName(id) else categoryName(id),
                color = if (selected) categoryColor(id) else palette.muted,
                fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Normal,
                modifier = Modifier.fillMaxWidth().clickable { category = id }.padding(vertical = 12.dp),
            )
        }
        Spacer(Modifier.height(12.dp))
        Button(
            onClick = {
                val value = parseAmount(amount)
                if (value != null && value > 0 && title.isNotBlank()) onSave(title.trim(), value, category)
            },
            modifier = Modifier.fillMaxWidth(),
        ) { Text(stringResource(R.string.save_expense)) }
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
