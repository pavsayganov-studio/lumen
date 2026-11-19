package app.lumen.data

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

private const val PREFS = "lumen"
private const val KEY_EXPENSES = "extra" // same key as earlier versions, so entries already saved stay
private const val KEY_BUDGET = "budget"
private const val KEY_CURRENCY = "currency"
private const val KEY_THEME = "theme"

private fun prefs(context: Context) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

fun loadExpenses(context: Context): List<Expense> {
    val raw = prefs(context).getString(KEY_EXPENSES, null) ?: return emptyList()
    return runCatching {
        val array = JSONArray(raw)
        List(array.length()) { i ->
            val o = array.getJSONObject(i)
            Expense(o.getString("id"), o.getString("title"), o.getDouble("amount"), o.getString("date"), o.getString("category"))
        }
    }.getOrDefault(emptyList())
}

fun saveExpenses(context: Context, expenses: List<Expense>) {
    val array = JSONArray()
    expenses.forEach { e ->
        array.put(
            JSONObject()
                .put("id", e.id)
                .put("title", e.title)
                .put("amount", e.amount)
                .put("date", e.date)
                .put("category", e.category),
        )
    }
    prefs(context).edit().putString(KEY_EXPENSES, array.toString()).apply()
}

/** Monthly budget; 0 until the person sets one. */
fun loadBudget(context: Context): Double = prefs(context).getString(KEY_BUDGET, null)?.toDoubleOrNull() ?: 0.0

fun saveBudget(context: Context, budget: Double) {
    prefs(context).edit().putString(KEY_BUDGET, budget.toString()).apply()
}

fun loadCurrency(context: Context): Currency =
    runCatching { Currency.valueOf(prefs(context).getString(KEY_CURRENCY, null) ?: "") }.getOrDefault(Currency.EUR)

fun saveCurrency(context: Context, currency: Currency) {
    prefs(context).edit().putString(KEY_CURRENCY, currency.name).apply()
}

fun loadTheme(context: Context): ThemeMode =
    runCatching { ThemeMode.valueOf(prefs(context).getString(KEY_THEME, null) ?: "") }.getOrDefault(ThemeMode.Auto)

fun saveTheme(context: Context, mode: ThemeMode) {
    prefs(context).edit().putString(KEY_THEME, mode.name).apply()
}
