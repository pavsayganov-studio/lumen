package app.lumen.data

import java.math.RoundingMode
import java.text.DecimalFormat
import java.text.DecimalFormatSymbols
import java.util.Locale
import kotlin.math.abs

private val SYMBOLS = DecimalFormatSymbols(Locale.GERMANY)

/** "1.332 €", or "1.332,50 €" when there are cents. Negative values get a real minus sign. */
fun money(value: Double, digits: Int = if (abs(value % 1.0) < 0.001) 0 else 2): String {
    val pattern = if (digits == 0) "#,##0" else "#,##0.00"
    val format = DecimalFormat(pattern, SYMBOLS).apply { roundingMode = RoundingMode.HALF_UP }
    return (if (value < -0.001) "−" else "") + format.format(abs(value)) + " €"
}

/** Number for an edit field: no trailing ".0". */
fun plainAmount(value: Double): String =
    if (value % 1.0 == 0.0) value.toLong().toString() else value.toString()

/** Accepts "12,50", "1.234,50", "1234.5" and an optional euro sign. */
fun parseAmount(raw: String): Double? {
    val text = raw.trim().replace(" ", "").replace("€", "")
    if (text.isEmpty()) return null
    val normalized = when {
        text.contains(',') && text.contains('.') -> text.replace(".", "").replace(',', '.')
        text.contains(',') -> text.replace(',', '.')
        else -> text
    }
    return normalized.toDoubleOrNull()
}
