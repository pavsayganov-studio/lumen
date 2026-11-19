package app.lumen.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.lumen.R
import app.lumen.data.CATEGORIES
import app.lumen.data.Currency
import app.lumen.data.Expense
import app.lumen.data.ThemeMode
import app.lumen.data.byCategory
import app.lumen.data.inMonth
import app.lumen.data.parseAmount
import app.lumen.data.plainAmount
import app.lumen.data.total
import java.time.LocalDate
import java.time.YearMonth
import java.time.format.DateTimeFormatter
import java.time.format.FormatStyle
import java.time.format.TextStyle
import java.util.Locale

private fun monthTitle(month: YearMonth): String {
    val name = month.month.getDisplayName(TextStyle.FULL_STANDALONE, Locale.getDefault())
    return name.replaceFirstChar { it.titlecase(Locale.getDefault()) } + " " + month.year
}

@Composable
internal fun HomeScreen(expenses: List<Expense>, budget: Double, onAdd: () -> Unit, onBudget: () -> Unit) {
    val today = LocalDate.now()
    val month = YearMonth.from(today)
    val spent = expenses.inMonth(month.toString()).total()
    val available = budget - spent
    val daysLeft = month.lengthOfMonth() - today.dayOfMonth
    Column(Modifier.verticalScroll(rememberScrollState()).padding(20.dp)) {
        Heading(monthTitle(month), 28.sp)
        Text(LocalContext.current.resources.getQuantityString(R.plurals.days_left, daysLeft, daysLeft), color = palette.muted)
        BudgetRing(if (budget > 0) spent / budget else 0.0, money(available))
        Row(Modifier.fillMaxWidth()) {
            Stat(stringResource(R.string.budget), money(budget), Modifier.weight(1f), onBudget)
            Stat(stringResource(R.string.spent), money(spent), Modifier.weight(1f))
            Stat(stringResource(R.string.available), money(available), Modifier.weight(1f))
        }
        if (budget <= 0) PromptCard(stringResource(R.string.set_budget), stringResource(R.string.set_budget_hint), onBudget)
        if (expenses.isEmpty()) PromptCard(stringResource(R.string.add_first), stringResource(R.string.add_first_hint), onAdd)
        if (expenses.isNotEmpty()) {
            Heading(stringResource(R.string.recent), 22.sp, Modifier.padding(top = 18.dp, bottom = 8.dp))
            expenses.sortedByDescending { it.date }.take(4).forEach { e ->
                TxRow(e.title, "\u2212" + money(e.amount, 2), categoryName(e.category))
            }
        }
    }
}

@Composable
internal fun HistoryScreen(expenses: List<Expense>, onDelete: (String) -> Unit) {
    val dateFormat = DateTimeFormatter.ofLocalizedDate(FormatStyle.MEDIUM)
    Detail(stringResource(R.string.nav_history)) {
        if (expenses.isEmpty()) Text(stringResource(R.string.no_expenses), color = palette.muted)
        expenses.sortedByDescending { it.date }.forEach { e ->
            val date = runCatching { LocalDate.parse(e.date).format(dateFormat) }.getOrDefault(e.date)
            TxRow(
                e.title,
                "\u2212" + money(e.amount, 2),
                categoryName(e.category) + " \u00B7 " + date,
                trailing = {
                    val label = stringResource(R.string.delete)
                    Text(
                        "\u2715",
                        color = palette.muted,
                        modifier = Modifier
                            .padding(start = 8.dp)
                            .semantics { contentDescription = label }
                            .clickable { onDelete(e.id) }
                            .padding(8.dp),
                    )
                },
            )
        }
    }
}

@Composable
internal fun InsightsScreen(expenses: List<Expense>) {
    val month = YearMonth.now()
    val spent = expenses.inMonth(month.toString())
    val total = spent.total()
    Detail(stringResource(R.string.nav_insights), monthTitle(month)) {
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
internal fun SettingsScreen(currency: Currency, theme: ThemeMode, onCurrency: (Currency) -> Unit, onTheme: (ThemeMode) -> Unit) {
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
    }
}

@Composable
internal fun AddScreen(onClose: () -> Unit, onSave: (title: String, amount: Double, category: String) -> Unit) {
    var title by rememberSaveable { mutableStateOf("") }
    var amount by rememberSaveable { mutableStateOf("") }
    var category by rememberSaveable { mutableStateOf("Food & Drink") }
    val colors = fieldColors()
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp)) {
        CloseLink(onClose)
        Heading(stringResource(R.string.new_expense), 28.sp, Modifier.padding(vertical = 12.dp))
        OutlinedTextField(
            amount,
            { amount = it },
            label = { Text(stringResource(R.string.amount)) },
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
            colors = colors,
            modifier = Modifier.fillMaxWidth(),
        )
        Spacer(Modifier.height(8.dp))
        OutlinedTextField(
            title,
            { title = it },
            label = { Text(stringResource(R.string.name)) },
            singleLine = true,
            colors = colors,
            modifier = Modifier.fillMaxWidth(),
        )
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
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp)) {
        CloseLink(onClose)
        Heading(stringResource(R.string.monthly_budget), 28.sp, Modifier.padding(vertical = 12.dp))
        OutlinedTextField(
            text,
            { text = it },
            label = { Text(stringResource(R.string.budget)) },
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
            colors = fieldColors(),
            modifier = Modifier.fillMaxWidth(),
        )
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
