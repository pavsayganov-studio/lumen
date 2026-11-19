package app.lumen.data

data class Expense(
    val id: String,
    val title: String,
    val amount: Double,
    /** ISO date, yyyy-MM-dd. */
    val date: String,
    val category: String,
)

/** Stable ids saved with each expense. The UI maps them to names in the phone's language. */
val CATEGORIES = listOf(
    "Housing", "Savings", "Transportation", "Food & Drink", "Shopping", "Entertainment", "Health",
)

enum class ThemeMode { Auto, Light, Dark }

fun List<Expense>.total(): Double = sumOf { it.amount }

/** Expenses of one month, given as "yyyy-MM". */
fun List<Expense>.inMonth(month: String): List<Expense> = filter { it.date.startsWith(month) }

/** Spend per category, biggest first. */
fun List<Expense>.byCategory(): List<Pair<String, Double>> =
    groupBy { it.category }.map { (category, items) -> category to items.total() }.sortedByDescending { it.second }
