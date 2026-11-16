package app.lumen.ui

import android.content.Context
import androidx.compose.foundation.Canvas
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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.json.JSONArray
import org.json.JSONObject
import java.util.Locale
import kotlin.math.cos
import kotlin.math.max
import kotlin.math.roundToInt
import kotlin.math.sin

private val Bg = Color(0xFF070B12)
private val Muted = Color(0xFF9AA6BD)
private val Cyan = Color(0xFF3AD7FF)
private val Good = Color(0xFF3DDC97)
private val Housing = Color(0xFF2EE6C7)
private val Savings = Color(0xFFFF8A3D)
private val Transport = Color(0xFF4C8DFF)
private val Food = Color(0xFFE15CF0)

private data class Tx(
    val id: String,
    val title: String,
    val amount: Double,
    val date: String,
    val category: String,
    val upcoming: Boolean,
)

private val SEED = listOf(
    Tx("1", "Rent", 900.0, "2026-11-03", "Housing", false),
    Tx("2", "Utilities", 100.0, "2026-11-03", "Housing", false),
    Tx("3", "Internet", 50.0, "2026-11-04", "Housing", false),
    Tx("4", "Phone Bill", 50.0, "2026-11-05", "Housing", false),
    Tx("5", "Retirement Savings", 350.0, "2026-11-04", "Savings", false),
    Tx("6", "Savings Account", 300.0, "2026-11-04", "Savings", false),
    Tx("7", "Investments", 110.0, "2026-11-05", "Savings", false),
    Tx("8", "Car Loan", 250.0, "2026-11-05", "Transportation", false),
    Tx("9", "Gas", 30.0, "2026-11-02", "Transportation", false),
    Tx("10", "Dinner out", 22.5, "2026-11-02", "Food & Drink", false),
    Tx("11", "Coffee", 9.0, "2026-11-01", "Food & Drink", false),
    Tx("12", "Lunch", 12.0, "2026-11-01", "Food & Drink", false),
    Tx("13", "Cappuccino", 4.5, "2026-11-05", "Food & Drink", false),
    Tx("14", "Car insurance", 90.0, "2026-11-08", "Transportation", true),
    Tx("15", "Monthly transit pass", 60.0, "2026-11-10", "Transportation", true),
    Tx("16", "Streaming", 17.0, "2026-11-23", "Entertainment", true),
    Tx("17", "Gym", 39.0, "2026-11-26", "Health", true),
    Tx("18", "Groceries", 48.0, "2026-11-27", "Food & Drink", true),
    Tx("19", "Cloud storage", 18.0, "2026-11-28", "Shopping", true),
    Tx("20", "Dinner reservation", 25.0, "2026-11-29", "Food & Drink", true),
)

private val CATS = listOf("Housing", "Savings", "Transportation", "Food & Drink", "Shopping", "Entertainment", "Health")

private fun colorOf(cat: String) = when (cat) {
    "Housing" -> Housing
    "Savings" -> Savings
    "Transportation" -> Transport
    "Food & Drink" -> Food
    else -> Color(0xFF8B7CFF)
}

private fun money(value: Double, digits: Int = if (kotlin.math.abs(value % 1.0) < 0.001) 0 else 2): String {
    val neg = value < -0.001
    val abs = kotlin.math.abs(value)
    val fmt = java.text.DecimalFormatSymbols(Locale.GERMANY)
    val pattern = if (digits == 0) "#,##0" else "#,##0.00"
    val df = java.text.DecimalFormat(pattern, fmt)
    return (if (neg) "−" else "") + df.format(abs) + " €"
}

@Composable
fun LumenApp() {
    val context = LocalContext.current
    var screen by remember { mutableStateOf("home") }
    var budget by remember { mutableStateOf(3900.0) }
    var extra by remember { mutableStateOf(loadExtra(context)) }
    val txns = SEED + extra
    val posted = txns.filter { !it.upcoming }
    val upcoming = txns.filter { it.upcoming }
    val spent = posted.sumOf { it.amount }
    var alloc by remember { mutableStateOf(2568.0) }
    val available = budget - alloc
    LaunchedEffect(extra) { saveExtra(context, extra) }

    Box(Modifier.fillMaxSize().background(Bg)) {
        when (screen) {
            "home" -> Home(
                budget, alloc, available, spent, posted, upcoming,
                onOpen = { screen = it },
                onAdd = { screen = "add" },
                onBudget = { screen = "budget" },
            )
            "trend" -> Detail("Spending Trend", "November 2026", onClose = { screen = "home" }) {
                Text("Nov 6", color = Muted)
                Text(money(spent), color = Color.White, fontSize = 40.sp, fontWeight = FontWeight.SemiBold)
                Text("↑  19%", color = Cyan)
                Text("Spending so far versus your 3-month average. The month is running high, but the pace flattened after the 6th.", color = Muted, modifier = Modifier.padding(top = 16.dp))
            }
            "flow" -> Detail("Money Flow", "November 2026", onClose = { screen = "home" }) {
                posted.groupBy { it.category }.entries.sortedByDescending { it.value.sumOf { t -> t.amount } }.forEach { (cat, items) ->
                    Text(cat, color = colorOf(cat), fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(top = 12.dp))
                    Text(money(items.sumOf { it.amount }, 2), color = Muted, fontSize = 13.sp)
                    items.sortedByDescending { it.amount }.forEach { tx ->
                        Row(Modifier.fillMaxWidth().padding(vertical = 4.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(tx.title, color = Color.White)
                            Text(money(tx.amount, 2), color = Muted)
                        }
                    }
                }
            }
            "break" -> Detail("Spending Breakdown", "November 2026", onClose = { screen = "home" }) {
                Text(money(spent, 2), color = Color.White, fontSize = 36.sp, fontWeight = FontWeight.SemiBold)
                Text("Total spending", color = Muted)
                posted.groupBy { it.category }.entries.sortedByDescending { it.value.sumOf { t -> t.amount } }.forEach { (cat, items) ->
                    Row(Modifier.fillMaxWidth().padding(vertical = 8.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("●  $cat", color = colorOf(cat))
                        Text(money(items.sumOf { it.amount }, 2), color = Color.White)
                    }
                }
            }
            "upcoming" -> Detail("Upcoming", "November 2026", onClose = { screen = "home" }) {
                Text(money(upcoming.sumOf { it.amount }), color = Color.White, fontSize = 36.sp, fontWeight = FontWeight.SemiBold)
                Text("${upcoming.size} expenses still to post", color = Muted)
                upcoming.sortedBy { it.date }.forEach { tx ->
                    Row(Modifier.fillMaxWidth().padding(vertical = 8.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                        Column {
                            Text(tx.title, color = Color.White)
                            Text(tx.date, color = Muted, fontSize = 13.sp)
                        }
                        Text("−" + money(tx.amount, 2), color = Color.White)
                    }
                }
            }
            "saving" -> Detail("Saving Rate", "November 2026", onClose = { screen = "home" }) {
                val saved = posted.filter { it.category == "Savings" }.sumOf { it.amount }
                val rate = if (saved == 0.0) 0 else (saved / 3960.0 * 100).roundToInt()
                Text("+$rate%", color = Color.White, fontSize = 48.sp, fontWeight = FontWeight.SemiBold)
                Text(if (rate >= 15) "Strong" else "Building", color = Cyan)
                Text("Saved ${money(saved, 2)} of 3.960 € income.", color = Muted, modifier = Modifier.padding(top = 12.dp))
            }
            "accounts" -> Detail("Accounts", "All Accounts", onClose = { screen = "home" }) {
                Text(money(16694.5, 2), color = Color.White, fontSize = 36.sp, fontWeight = FontWeight.SemiBold)
                Text("↑  16.639,50 € over 1 year", color = Good)
                AccountRow("Main", "8.807,50 €")
                AccountRow("CBC Banque SA", "55,00 €")
                AccountRow("Banco do Brasil", "0,00 €")
                AccountRow("Saving", "7.832,00 €")
            }
            "add" -> AddScreen(
                onClose = { screen = "home" },
                onSave = { title, amount, cat ->
                    val next = Tx("x${System.currentTimeMillis()}", title, amount, "2026-11-06", cat, false)
                    val all = posted + next
                    extra = extra + next
                    val base = mapOf("Housing" to 1300.0, "Savings" to 760.0, "Transportation" to 360.0, "Food & Drink" to 148.0)
                    val byCat = all.groupBy { it.category }.mapValues { e -> e.value.sumOf { it.amount } }
                    alloc = (base.keys + byCat.keys).sumOf { max(base[it] ?: 0.0, byCat[it] ?: 0.0) }
                    screen = "home"
                },
            )
            "budget" -> BudgetScreen(budget, onClose = { screen = "home" }, onSave = { budget = it; screen = "home" })
        }
    }
}

@Composable
private fun Home(
    budget: Double,
    alloc: Double,
    available: Double,
    spent: Double,
    posted: List<Tx>,
    upcoming: List<Tx>,
    onOpen: (String) -> Unit,
    onAdd: () -> Unit,
    onBudget: () -> Unit,
) {
    Box(Modifier.fillMaxSize()) {
        Column(Modifier.verticalScroll(rememberScrollState()).padding(20.dp).padding(bottom = 72.dp)) {
            Text("November 2026", color = Color.White, fontSize = 28.sp, fontWeight = FontWeight.SemiBold)
            Text("25 days remaining", color = Muted)
            BudgetRing(if (budget > 0) alloc / budget else 0.0, money(available))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Stat("Budget", money(budget), onBudget)
                Stat("Allocated", money(alloc)) { onOpen("break") }
                Stat("Available", money(available)) {}
            }
            Text("Insights", color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(top = 18.dp, bottom = 10.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                InsightCard("Trend", "+19%", "Increasing", listOf(Color(0xFF1B2344), Color(0xFF12182E)), Modifier.weight(1f)) { onOpen("trend") }
                val top = posted.groupBy { it.category }.maxByOrNull { it.value.sumOf { t -> t.amount } }
                InsightCard("Top Spending", money(top?.value?.sumOf { it.amount } ?: 0.0), top?.key ?: "—", listOf(Color(0xFF2A1748), Color(0xFF1A102C)), Modifier.weight(1f)) { onOpen("break") }
            }
            Spacer(Modifier.height(10.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                InsightCard("Upcoming", money(upcoming.sumOf { it.amount }), "${upcoming.size} expenses", listOf(Color(0xFF3A2A16), Color(0xFF24180F)), Modifier.weight(1f)) { onOpen("upcoming") }
                InsightCard("Saving Rate", "+19%", "Strong", listOf(Color(0xFF122844), Color(0xFF0D182C)), Modifier.weight(1f)) { onOpen("saving") }
            }
            Spacer(Modifier.height(10.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                InsightCard("Money Flow", money(budget), "${if (budget > 0) (spent / budget * 100).roundToInt() else 0}% spent", listOf(Color(0xFF0E2E2A), Color(0xFF0B1C1B)), Modifier.weight(1f)) { onOpen("flow") }
                InsightCard("Accounts", "16.695 €", money(2072.0), listOf(Color(0xFF103222), Color(0xFF0C1E16)), Modifier.weight(1f)) { onOpen("accounts") }
            }
            Text("Recent", color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(top = 18.dp, bottom = 8.dp))
            posted.sortedByDescending { it.date }.take(4).forEach { tx ->
                Row(Modifier.fillMaxWidth().padding(vertical = 6.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Column {
                        Text(tx.title, color = Color.White)
                        Text(tx.category, color = Muted, fontSize = 13.sp)
                    }
                    Text("−" + money(tx.amount, 2), color = Color.White)
                }
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
private fun BudgetRing(fraction: Double, amount: String) {
    Box(Modifier.fillMaxWidth().height(280.dp), contentAlignment = Alignment.Center) {
        Canvas(Modifier.size(260.dp)) {
            val stroke = 22.dp.toPx()
            val inset = stroke
            val arc = Size(size.width - inset * 2, size.height - inset * 2)
            val top = Offset(inset, inset)
            drawArc(Color(0x334878AA), 0f, 360f, false, top, arc, style = Stroke(16.dp.toPx(), cap = StrokeCap.Round))
            drawArc(
                brush = Brush.linearGradient(listOf(Color(0xFF7AF0FF), Color(0xFF1AA4FF))),
                startAngle = 140f,
                sweepAngle = 360f * fraction.coerceIn(0.0, 1.0).toFloat(),
                useCenter = false,
                topLeft = top,
                size = arc,
                style = Stroke(stroke, cap = StrokeCap.Round),
            )
            val dots = 42
            val radius = size.minDimension / 2 - 48.dp.toPx()
            repeat(dots) { i ->
                val a = (i / dots.toFloat()) * Math.PI * 2 - Math.PI / 2
                drawCircle(Color(0xB35AAADC), 2.2.dp.toPx(), Offset((size.width / 2 + cos(a) * radius).toFloat(), (size.height / 2 + sin(a) * radius).toFloat()))
            }
        }
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(amount, color = Color.White, fontSize = 40.sp, fontWeight = FontWeight.SemiBold)
            Text("left to spend", color = Muted)
        }
    }
}

@Composable
private fun Stat(label: String, value: String, onClick: () -> Unit) {
    Column(Modifier.clickable(onClick = onClick), horizontalAlignment = Alignment.CenterHorizontally) {
        Text(label, color = Muted, fontSize = 13.sp)
        Text(value, color = Color.White, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
private fun InsightCard(title: String, value: String, foot: String, colors: List<Color>, modifier: Modifier, onClick: () -> Unit) {
    Column(
        modifier
            .height(148.dp)
            .clip(RoundedCornerShape(22.dp))
            .background(Brush.verticalGradient(colors))
            .clickable(onClick = onClick)
            .padding(14.dp),
        verticalArrangement = Arrangement.SpaceBetween,
    ) {
        Text(title, color = Color.White.copy(alpha = 0.8f), fontSize = 13.sp)
        Text(value, color = Color.White, fontSize = 26.sp, fontWeight = FontWeight.SemiBold)
        Text(foot, color = Muted, fontSize = 13.sp)
    }
}

@Composable
private fun Detail(title: String, subtitle: String, onClose: () -> Unit, body: @Composable () -> Unit) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("Close", color = Cyan, modifier = Modifier.clickable(onClick = onClose))
            Spacer(Modifier.width(16.dp))
            Column {
                Text(title, color = Color.White, fontWeight = FontWeight.SemiBold, fontSize = 18.sp)
                Text(subtitle, color = Muted, fontSize = 13.sp)
            }
        }
        Spacer(Modifier.height(20.dp))
        body()
    }
}

@Composable
private fun AccountRow(name: String, value: String) {
    Row(Modifier.fillMaxWidth().padding(vertical = 10.dp), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(name, color = Color.White)
        Text(value, color = Color.White)
    }
}

@Composable
private fun AddScreen(onClose: () -> Unit, onSave: (String, Double, String) -> Unit) {
    var title by remember { mutableStateOf("") }
    var amount by remember { mutableStateOf("") }
    var cat by remember { mutableStateOf("Food & Drink") }
    val fieldColors = OutlinedTextFieldDefaults.colors(
        focusedTextColor = Color.White,
        unfocusedTextColor = Color.White,
        focusedBorderColor = Cyan,
        unfocusedBorderColor = Color.White.copy(alpha = 0.2f),
        cursorColor = Cyan,
    )
    Column(Modifier.fillMaxSize().padding(20.dp)) {
        Text("Close", color = Cyan, modifier = Modifier.clickable(onClick = onClose))
        Text("New expense", color = Color.White, fontSize = 28.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(vertical = 12.dp))
        OutlinedTextField(amount, { amount = it }, label = { Text("Amount") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal), colors = fieldColors, modifier = Modifier.fillMaxWidth())
        Spacer(Modifier.height(8.dp))
        OutlinedTextField(title, { title = it }, label = { Text("Name") }, colors = fieldColors, modifier = Modifier.fillMaxWidth())
        Spacer(Modifier.height(12.dp))
        CATS.forEach { name ->
            Text(if (name == cat) "●  $name" else name, color = if (name == cat) colorOf(name) else Muted, modifier = Modifier.fillMaxWidth().clickable { cat = name }.padding(vertical = 6.dp))
        }
        Spacer(Modifier.height(12.dp))
        Button(
            onClick = {
                val value = parseAmount(amount) ?: return@Button
                if (title.isBlank() || value <= 0) return@Button
                onSave(title.trim(), value, cat)
            },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = Cyan, contentColor = Color(0xFF041018)),
        ) { Text("Save expense") }
    }
}

@Composable
private fun BudgetScreen(current: Double, onClose: () -> Unit, onSave: (Double) -> Unit) {
    var text by remember { mutableStateOf(current.toString()) }
    Column(Modifier.fillMaxSize().padding(20.dp)) {
        Text("Close", color = Cyan, modifier = Modifier.clickable(onClick = onClose))
        Text("Monthly budget", color = Color.White, fontSize = 28.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(vertical = 12.dp))
        OutlinedTextField(text, { text = it }, label = { Text("Budget") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal), modifier = Modifier.fillMaxWidth())
        Spacer(Modifier.height(12.dp))
        Button(onClick = {
            val value = parseAmount(text) ?: return@Button
            onSave(value)
        }) { Text("Save") }
    }
}

private fun parseAmount(raw: String): Double? {
    val t = raw.trim().replace(" ", "").replace("€", "")
    if (t.isEmpty()) return null
    val normalized = when {
        t.contains(',') && t.contains('.') -> t.replace(".", "").replace(',', '.')
        t.contains(',') -> t.replace(',', '.')
        else -> t
    }
    return normalized.toDoubleOrNull()
}

private fun prefs(context: Context) = context.getSharedPreferences("lumen", Context.MODE_PRIVATE)

private fun loadExtra(context: Context): List<Tx> {
    val raw = prefs(context).getString("extra", null) ?: return emptyList()
    return runCatching {
        val arr = JSONArray(raw)
        List(arr.length()) { i ->
            val o = arr.getJSONObject(i)
            Tx(o.getString("id"), o.getString("title"), o.getDouble("amount"), o.getString("date"), o.getString("category"), false)
        }
    }.getOrDefault(emptyList())
}

private fun saveExtra(context: Context, extra: List<Tx>) {
    val arr = JSONArray()
    extra.forEach { tx ->
        arr.put(JSONObject().put("id", tx.id).put("title", tx.title).put("amount", tx.amount).put("date", tx.date).put("category", tx.category))
    }
    prefs(context).edit().putString("extra", arr.toString()).apply()
}
