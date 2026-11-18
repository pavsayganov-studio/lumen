package app.lumen.data

import kotlin.math.max
import kotlin.math.roundToInt

data class Tx(
    val id: String,
    val title: String,
    val amount: Double,
    val date: String,
    val category: String,
    val upcoming: Boolean,
)

data class Account(val name: String, val balance: Double)

/** Demo month. Mirrors DEMO_TODAY and the November 2026 seed of the web app (src/lib/finance.ts). */
object Demo {
    const val TODAY = "2026-11-06"
    const val TODAY_LABEL = "Nov 6"
    const val MONTH_LABEL = "November 2026"
    const val DAYS_LEFT = 25
    const val DEFAULT_BUDGET = 3900.0
    const val INCOME = 3960.0
    const val TREND_PERCENT = 19
    const val ACCOUNTS_FOOT = 2072.0
    const val ACCOUNTS_YEAR_GAIN = 16639.5
    const val STRONG_SAVING_PERCENT = 15
}

val CATEGORIES = listOf(
    "Housing", "Savings", "Transportation", "Food & Drink", "Shopping", "Entertainment", "Health",
)

val ACCOUNTS = listOf(
    Account("Main", 8807.5),
    Account("CBC Banque SA", 55.0),
    Account("Banco do Brasil", 0.0),
    Account("Saving", 7832.0),
)

val SEED = listOf(
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

/** Planned amount per category. A category counts as allocated at least this much. */
private val ALLOCATION_FLOOR = mapOf(
    "Housing" to 1300.0,
    "Savings" to 760.0,
    "Transportation" to 360.0,
    "Food & Drink" to 148.0,
)

fun List<Tx>.total(): Double = sumOf { it.amount }

/** Categories with their transactions, biggest spend first. */
fun List<Tx>.byCategory(): List<Pair<String, List<Tx>>> =
    groupBy { it.category }.toList().sortedByDescending { (_, items) -> items.total() }

fun allocatedTotal(posted: List<Tx>): Double {
    val spent = posted.groupBy { it.category }.mapValues { (_, items) -> items.total() }
    return (ALLOCATION_FLOOR.keys + spent.keys).sumOf { max(ALLOCATION_FLOOR[it] ?: 0.0, spent[it] ?: 0.0) }
}

fun accountsTotal(): Double = ACCOUNTS.sumOf { it.balance }

fun savedAmount(posted: List<Tx>): Double = posted.filter { it.category == "Savings" }.total()

fun savingRate(saved: Double): Int = (saved / Demo.INCOME * 100).roundToInt()

fun savingLabel(rate: Int): String = if (rate >= Demo.STRONG_SAVING_PERCENT) "Strong" else "Building"
