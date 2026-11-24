package app.lumen.data

data class Expense(
    val id: String,
    val title: String,
    val amount: Double,
    /** ISO date, yyyy-MM-dd. */
    val date: String,
    val category: String,
    /** The currency of [amount]. Amounts are never converted. */
    val currency: Currency,
    /** Set when this expense is a payment for a project. */
    val projectId: String? = null,
    /** Set when the payment settles one planned row of that project (the row's id). */
    val planRef: String? = null,
)

/** Stable ids saved with each expense. The UI maps them to names in the phone's language. */
val CATEGORIES = listOf(
    "Housing", "Savings", "Transportation", "Food & Drink", "Shopping", "Entertainment", "Health",
)

/**
 * A category the person created, or a built-in one (the English ids in [CATEGORIES]) they renamed ([name]) or deleted ([removed]).
 * A deleted category stays on file, so expenses that used it keep their name in History. [color] is ARGB.
 */
data class Category(val id: String, val name: String, val color: Long, val removed: Boolean = false)

/** Handed out to new categories in turn; none repeats a built-in color. */
private val CATEGORY_COLORS = listOf(0xFFFF7A7AL, 0xFFB8E65CL, 0xFFFF9EC7L, 0xFFD2A679L, 0xFF5CC8FFL, 0xFFB794F6L)

fun List<Category>.create(id: String, name: String) = Category(id, name.trim(), CATEGORY_COLORS[size % CATEGORY_COLORS.size])

/** The ids the Add screen offers: built-in ones first, then the ones the person created, without the deleted. */
fun List<Category>.visibleIds(): List<String> {
    val gone = filter { it.removed }.map { it.id }.toSet()
    return (CATEGORIES + map { it.id }.filter { it !in CATEGORIES }).filter { it !in gone }
}

fun List<Category>.renamed(id: String, name: String): List<Category> = edit(id) { it.copy(name = name.trim()) }

fun List<Category>.deleted(id: String): List<Category> = edit(id) { it.copy(removed = true) }

/** A built-in category has no entry until it is first renamed or deleted. */
private fun List<Category>.edit(id: String, change: (Category) -> Category): List<Category> =
    if (any { it.id == id }) map { if (it.id == id) change(it) else it } else this + change(Category(id, "", 0L))

/** A name is free when it is not blank and not among [taken] (the names shown now), ignoring case. */
fun isFreeName(name: String, taken: List<String>): Boolean {
    val clean = name.trim()
    return clean.isNotEmpty() && taken.none { it.equals(clean, ignoreCase = true) }
}

enum class ThemeMode { Auto, Light, Dark }

fun List<Expense>.total(): Double = sumOf { it.amount }

/** Expenses dated inside [period]. */
fun List<Expense>.inPeriod(period: Period): List<Expense> = filter { period.contains(it.date) }

/** One currency's expenses, or all of them when [currency] is null (Total). */
fun List<Expense>.inCurrency(currency: Currency?): List<Expense> =
    if (currency == null) this else filter { it.currency == currency }

/** Spend per currency, in the order of [Currency]. Currencies are never added together. */
fun List<Expense>.byCurrency(): List<Pair<Currency, Double>> =
    groupBy { it.currency }.map { (currency, items) -> currency to items.total() }.sortedBy { it.first.ordinal }

/** Newest date first; on the same day the expense added last comes first. */
fun List<Expense>.newestFirst(): List<Expense> = asReversed().sortedByDescending { it.date }
