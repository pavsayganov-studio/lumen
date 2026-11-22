package app.lumen.data

import java.time.LocalDate
import java.time.YearMonth

/** The reporting period: first and last day, both included. The default is the current calendar month. */
data class Period(val from: LocalDate, val to: LocalDate) {
    /** The calendar month this period covers exactly, or null for any other range. */
    val month: YearMonth?
        get() = YearMonth.from(from).takeIf { from == it.atDay(1) && to == it.atEndOfMonth() }

    /** [iso] is a yyyy-MM-dd date; those compare correctly as text. */
    fun contains(iso: String): Boolean = iso >= from.toString() && iso <= to.toString()

    override fun toString(): String = "$from/$to"

    companion object {
        fun month(month: YearMonth) = Period(month.atDay(1), month.atEndOfMonth())

        fun parse(text: String): Period? = runCatching {
            val (a, b) = text.split('/')
            Period(LocalDate.parse(a), LocalDate.parse(b))
        }.getOrNull()
    }
}
