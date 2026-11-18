package app.lumen.ui

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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.lumen.data.ACCOUNTS
import app.lumen.data.CATEGORIES
import app.lumen.data.Demo
import app.lumen.data.Tx
import app.lumen.data.accountsTotal
import app.lumen.data.byCategory
import app.lumen.data.money
import app.lumen.data.parseAmount
import app.lumen.data.plainAmount
import app.lumen.data.savedAmount
import app.lumen.data.savingLabel
import app.lumen.data.savingRate
import app.lumen.data.total
import kotlin.math.roundToInt

private class Insight(
    val title: String,
    val value: String,
    val foot: String,
    val colors: List<Color>,
    val target: Screen,
)

@Composable
internal fun HomeScreen(
    budget: Double,
    allocated: Double,
    spent: Double,
    posted: List<Tx>,
    upcoming: List<Tx>,
    onOpen: (Screen) -> Unit,
    onAdd: () -> Unit,
    onBudget: () -> Unit,
) {
    val available = budget - allocated
    val top = posted.byCategory().firstOrNull()
    val rate = savingRate(savedAmount(posted))
    val spentPercent = if (budget > 0) (spent / budget * 100).roundToInt() else 0
    val insights = listOf(
        Insight("Trend", "+${Demo.TREND_PERCENT}%", "Increasing", listOf(Color(0xFF1B2344), Color(0xFF12182E)), Screen.Trend),
        Insight("Top Spending", money(top?.second?.total() ?: 0.0), top?.first ?: "—", listOf(Color(0xFF2A1748), Color(0xFF1A102C)), Screen.Breakdown),
        Insight("Upcoming", money(upcoming.total()), "${upcoming.size} expenses", listOf(Color(0xFF3A2A16), Color(0xFF24180F)), Screen.Upcoming),
        Insight("Saving Rate", "+$rate%", savingLabel(rate), listOf(Color(0xFF122844), Color(0xFF0D182C)), Screen.Saving),
        Insight("Money Flow", money(budget), "$spentPercent% spent", listOf(Color(0xFF0E2E2A), Color(0xFF0B1C1B)), Screen.Flow),
        Insight("Accounts", money(accountsTotal(), 0), money(Demo.ACCOUNTS_FOOT), listOf(Color(0xFF103222), Color(0xFF0C1E16)), Screen.Accounts),
    )
    Box(Modifier.fillMaxSize()) {
        // Bottom padding keeps the last row clear of the floating Add button.
        Column(Modifier.verticalScroll(rememberScrollState()).padding(20.dp).padding(bottom = 72.dp)) {
            Heading(Demo.MONTH_LABEL, 28.sp)
            Text("${Demo.DAYS_LEFT} days remaining", color = Muted)
            BudgetRing(if (budget > 0) allocated / budget else 0.0, money(available))
            Row(Modifier.fillMaxWidth()) {
                Stat("Budget", money(budget), Modifier.weight(1f), onBudget)
                Stat("Allocated", money(allocated), Modifier.weight(1f)) { onOpen(Screen.Breakdown) }
                Stat("Available", money(available), Modifier.weight(1f))
            }
            Heading("Insights", 22.sp, Modifier.padding(top = 18.dp, bottom = 10.dp))
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                insights.chunked(2).forEach { pair ->
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        pair.forEach { insight ->
                            InsightCard(insight.title, insight.value, insight.foot, insight.colors, Modifier.weight(1f)) {
                                onOpen(insight.target)
                            }
                        }
                    }
                }
            }
            Heading("Recent", 22.sp, Modifier.padding(top = 18.dp, bottom = 8.dp))
            posted.sortedByDescending { it.date }.take(4).forEach { tx ->
                TxRow(tx.title, "−" + money(tx.amount, 2), tx.category)
            }
        }
        Button(
            onClick = onAdd,
            modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
            shape = CircleShape,
            colors = ButtonDefaults.buttonColors(containerColor = Color.White.copy(alpha = 0.16f), contentColor = Color.White),
        ) { Text("Add +") }
    }
}

@Composable
internal fun TrendScreen(spent: Double, onClose: () -> Unit) {
    Detail("Spending Trend", Demo.MONTH_LABEL, onClose) {
        Text(Demo.TODAY_LABEL, color = Muted)
        Heading(money(spent), 40.sp)
        Text("↑  ${Demo.TREND_PERCENT}%", color = Cyan)
        Text(
            "Spending so far versus your 3-month average. The month is running high, but the pace flattened after the 6th.",
            color = Muted,
            modifier = Modifier.padding(top = 16.dp),
        )
    }
}

@Composable
internal fun FlowScreen(posted: List<Tx>, onClose: () -> Unit) {
    Detail("Money Flow", Demo.MONTH_LABEL, onClose) {
        posted.byCategory().forEach { (category, items) ->
            Text(
                category,
                color = categoryColor(category),
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.padding(top = 12.dp),
            )
            Text(money(items.total(), 2), color = Muted, fontSize = 13.sp)
            items.sortedByDescending { it.amount }.forEach { tx ->
                TxRow(tx.title, money(tx.amount, 2), amountColor = Muted)
            }
        }
    }
}

@Composable
internal fun BreakdownScreen(spent: Double, posted: List<Tx>, onClose: () -> Unit) {
    Detail("Spending Breakdown", Demo.MONTH_LABEL, onClose) {
        Heading(money(spent, 2), 36.sp)
        Text("Total spending", color = Muted)
        posted.byCategory().forEach { (category, items) ->
            TxRow("●  $category", money(items.total(), 2), titleColor = categoryColor(category))
        }
    }
}

@Composable
internal fun UpcomingScreen(upcoming: List<Tx>, onClose: () -> Unit) {
    Detail("Upcoming", Demo.MONTH_LABEL, onClose) {
        Heading(money(upcoming.total()), 36.sp)
        Text("${upcoming.size} expenses still to post", color = Muted)
        upcoming.sortedBy { it.date }.forEach { tx ->
            TxRow(tx.title, "−" + money(tx.amount, 2), tx.date)
        }
    }
}

@Composable
internal fun SavingScreen(posted: List<Tx>, onClose: () -> Unit) {
    val saved = savedAmount(posted)
    val rate = savingRate(saved)
    Detail("Saving Rate", Demo.MONTH_LABEL, onClose) {
        Heading("+$rate%", 48.sp)
        Text(savingLabel(rate), color = Cyan)
        Text(
            "Saved ${money(saved, 2)} of ${money(Demo.INCOME)} income.",
            color = Muted,
            modifier = Modifier.padding(top = 12.dp),
        )
    }
}

@Composable
internal fun AccountsScreen(onClose: () -> Unit) {
    Detail("Accounts", "All Accounts", onClose) {
        Heading(money(accountsTotal(), 2), 36.sp)
        Text("↑  ${money(Demo.ACCOUNTS_YEAR_GAIN, 2)} over 1 year", color = Good)
        ACCOUNTS.forEach { account -> TxRow(account.name, money(account.balance, 2)) }
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
        Heading("New expense", 28.sp, Modifier.padding(vertical = 12.dp))
        OutlinedTextField(
            amount,
            { amount = it },
            label = { Text("Amount") },
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
            colors = colors,
            modifier = Modifier.fillMaxWidth(),
        )
        Spacer(Modifier.height(8.dp))
        OutlinedTextField(
            title,
            { title = it },
            label = { Text("Name") },
            singleLine = true,
            colors = colors,
            modifier = Modifier.fillMaxWidth(),
        )
        Spacer(Modifier.height(12.dp))
        CATEGORIES.forEach { name ->
            val selected = name == category
            Text(
                if (selected) "●  $name" else name,
                color = if (selected) categoryColor(name) else Muted,
                modifier = Modifier.fillMaxWidth().clickable { category = name }.padding(vertical = 12.dp),
            )
        }
        Spacer(Modifier.height(12.dp))
        Button(
            onClick = {
                val value = parseAmount(amount)
                if (value != null && value > 0 && title.isNotBlank()) onSave(title.trim(), value, category)
            },
            modifier = Modifier.fillMaxWidth(),
        ) { Text("Save expense") }
    }
}

@Composable
internal fun BudgetScreen(current: Double, onClose: () -> Unit, onSave: (Double) -> Unit) {
    var text by rememberSaveable { mutableStateOf(plainAmount(current)) }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp)) {
        CloseLink(onClose)
        Heading("Monthly budget", 28.sp, Modifier.padding(vertical = 12.dp))
        OutlinedTextField(
            text,
            { text = it },
            label = { Text("Budget") },
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
        ) { Text("Save") }
    }
}
