package app.lumen.data

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.util.Locale

private const val PREFS = "lumen"
private const val KEY_EXPENSES = "extra" // same key as earlier versions, so entries already saved stay
private const val KEY_PROJECTS = "projects"
private const val KEY_BUDGET = "budget"
private const val KEY_CURRENCY = "currency"
private const val KEY_THEME = "theme"

/** Saved text that could not be read is copied under this prefix first, so the next save never destroys it. */
private const val UNREADABLE = "unreadable_"

private fun prefs(context: Context) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

internal fun expensesToJson(expenses: List<Expense>): JSONArray = JSONArray().also { array ->
    expenses.forEach { e ->
        array.put(
            JSONObject()
                .put("id", e.id)
                .put("title", e.title)
                .put("amount", e.amount)
                .put("date", e.date)
                .put("category", e.category)
                .putOpt("projectId", e.projectId)
                .putOpt("planRef", e.planRef),
        )
    }
}

internal fun expensesFromJson(array: JSONArray): List<Expense> = List(array.length()) { i ->
    val o = array.getJSONObject(i)
    Expense(
        o.getString("id"),
        o.getString("title"),
        o.getDouble("amount"),
        o.getString("date"),
        o.getString("category"),
        o.optString("projectId").ifEmpty { null },
        o.optString("planRef").ifEmpty { null },
    )
}.distinctBy { it.id } // ids are list keys; a repeated one would crash the list

internal fun projectsToJson(projects: List<Project>): JSONArray = JSONArray().also { array ->
    projects.forEach { p ->
        val plan = JSONArray().also { rows ->
            p.plan.forEach { r -> rows.put(JSONObject().put("id", r.id).put("title", r.title).put("amount", r.amount).put("date", r.date)) }
        }
        array.put(
            JSONObject()
                .put("id", p.id)
                .put("name", p.name)
                .put("kind", p.kind.name)
                .put("price", p.price)
                .putOpt("deadline", p.deadline)
                .put("plan", plan),
        )
    }
}

internal fun projectsFromJson(array: JSONArray): List<Project> = List(array.length()) { i ->
    val o = array.getJSONObject(i)
    val rows = o.optJSONArray("plan") ?: JSONArray()
    Project(
        o.getString("id"),
        o.getString("name"),
        runCatching { ProjectKind.valueOf(o.getString("kind")) }.getOrDefault(ProjectKind.Other),
        o.getDouble("price"),
        o.optString("deadline").ifEmpty { null },
        List(rows.length()) { j ->
            val r = rows.getJSONObject(j)
            PlanItem(r.getString("id"), r.getString("title"), r.getDouble("amount"), r.getString("date"))
        }.distinctBy { it.id },
    )
}.distinctBy { it.id }

private fun <T> readList(context: Context, key: String, parse: (JSONArray) -> List<T>): List<T> {
    val raw = prefs(context).getString(key, null) ?: return emptyList()
    return runCatching { parse(JSONArray(raw)) }.getOrElse {
        prefs(context).edit().putString(UNREADABLE + key, raw).apply()
        emptyList()
    }
}

fun loadExpenses(context: Context): List<Expense> = readList(context, KEY_EXPENSES, ::expensesFromJson)

fun saveExpenses(context: Context, expenses: List<Expense>) {
    prefs(context).edit().putString(KEY_EXPENSES, expensesToJson(expenses).toString()).apply()
}

fun loadProjects(context: Context): List<Project> = readList(context, KEY_PROJECTS, ::projectsFromJson)

fun saveProjects(context: Context, projects: List<Project>) {
    prefs(context).edit().putString(KEY_PROJECTS, projectsToJson(projects).toString()).apply()
}

/** Monthly budget; 0 until the person sets one. */
fun loadBudget(context: Context): Double = prefs(context).getString(KEY_BUDGET, null)?.toDoubleOrNull() ?: 0.0

fun saveBudget(context: Context, budget: Double) {
    prefs(context).edit().putString(KEY_BUDGET, budget.toString()).apply()
}

/** The saved choice. On the first launch the phone's language decides, and that is saved so it never shifts later. */
fun loadCurrency(context: Context): Currency {
    val saved = runCatching { Currency.valueOf(prefs(context).getString(KEY_CURRENCY, null) ?: "") }.getOrNull()
    return saved ?: currencyFor(Locale.getDefault()).also { saveCurrency(context, it) }
}

fun saveCurrency(context: Context, currency: Currency) {
    prefs(context).edit().putString(KEY_CURRENCY, currency.name).apply()
}

fun loadTheme(context: Context): ThemeMode =
    runCatching { ThemeMode.valueOf(prefs(context).getString(KEY_THEME, null) ?: "") }.getOrDefault(ThemeMode.Auto)

fun saveTheme(context: Context, mode: ThemeMode) {
    prefs(context).edit().putString(KEY_THEME, mode.name).apply()
}
