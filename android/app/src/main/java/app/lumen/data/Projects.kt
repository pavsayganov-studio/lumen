package app.lumen.data

import java.time.LocalDate
import java.time.YearMonth
import java.time.temporal.ChronoUnit
import kotlin.math.ceil

/** The kind sets the spending category of every payment made for the project. */
enum class ProjectKind(val category: String) {
    Home("Housing"),
    Car("Transportation"),
    Trip("Entertainment"),
    Other("Shopping"),
}

/** One planned payment: an installment or a cost, with its date. */
data class PlanItem(val id: String, val title: String, val amount: Double, /** yyyy-MM-dd */ val date: String)

/**
 * A big purchase. [price] is the whole amount. [plan] is the schedule of planned payments and may be empty
 * (saving up: pay whenever). What was paid is never stored here: it is the expenses that carry this project's id.
 */
data class Project(
    val id: String,
    val name: String,
    val kind: ProjectKind,
    val price: Double,
    /** Target date, yyyy-MM-dd. */
    val deadline: String? = null,
    val plan: List<PlanItem> = emptyList(),
)

enum class RowState { Paid, Due, Upcoming }

data class PlanRow(val item: PlanItem, val state: RowState)

fun Project.payments(expenses: List<Expense>): List<Expense> = expenses.filter { it.projectId == id }

fun Project.paid(expenses: List<Expense>): Double = payments(expenses).total()

fun Project.balance(expenses: List<Expense>): Double = (price - paid(expenses)).coerceAtLeast(0.0)

fun Project.progress(expenses: List<Expense>): Double = if (price > 0) (paid(expenses) / price).coerceIn(0.0, 1.0) else 0.0

private fun Project.settled(expenses: List<Expense>): Set<String> = payments(expenses).mapNotNull { it.planRef }.toSet()

/** The schedule by date. A row is Paid only when a payment points at it; a past date alone never pays it, it is Due. */
fun Project.rows(expenses: List<Expense>, today: String): List<PlanRow> {
    val done = settled(expenses)
    return plan.sortedBy { it.date }.map { item ->
        PlanRow(item, if (item.id in done) RowState.Paid else if (item.date <= today) RowState.Due else RowState.Upcoming)
    }
}

/** Whole amount to set aside each month to reach the price by the target date. Null without a date or a balance. */
fun Project.neededPerMonth(expenses: List<Expense>, today: LocalDate): Double? {
    val end = deadline?.let { runCatching { LocalDate.parse(it) }.getOrNull() } ?: return null
    val left = balance(expenses)
    if (left <= 0) return null
    val months = ChronoUnit.MONTHS.between(YearMonth.from(today), YearMonth.from(end)).coerceAtLeast(1)
    return ceil(left / months)
}

/**
 * Replaces the unpaid rows with [count] monthly payments that add up to the balance, the first on [first].
 * Cents are split exactly; the last payment takes the remainder. Paid rows stay.
 */
fun Project.splitBalance(expenses: List<Expense>, count: Int, first: LocalDate, idPrefix: String): Project {
    val total = Math.round(balance(expenses) * 100)
    if (count < 1 || total <= 0) return this
    val part = total / count
    val parts = List(count) { i ->
        val cents = if (i == count - 1) total - part * (count - 1) else part
        PlanItem("$idPrefix$i", "${i + 1}/$count", cents / 100.0, first.plusMonths(i.toLong()).toString())
    }
    val done = settled(expenses)
    return copy(plan = plan.filter { it.id in done } + parts)
}

/** A real expense for [project]; pass the planned row it settles, if any. */
fun paymentFor(project: Project, amount: Double, today: LocalDate, id: String, row: PlanItem? = null): Expense =
    Expense(
        id = id,
        title = if (row == null) project.name else project.name + " \u00B7 " + row.title,
        amount = amount,
        date = today.toString(),
        category = project.kind.category,
        projectId = project.id,
        planRef = row?.id,
    )

/** When a project is deleted its payments stay in the history, no longer tied to it. */
fun List<Expense>.detachFrom(projectId: String): List<Expense> =
    map { if (it.projectId == projectId) it.copy(projectId = null, planRef = null) else it }
