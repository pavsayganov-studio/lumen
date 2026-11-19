package app.lumen.data

import java.math.RoundingMode
import java.text.DecimalFormat
import java.text.DecimalFormatSymbols
import java.util.Locale
import kotlin.math.abs

/** Official symbols: euro, US dollar, Russian ruble, Belarusian ruble. Amounts are never converted. */
enum class Currency(val symbol: String, val before: Boolean, val group: Char, val decimal: Char) {
    EUR("\u20AC", false, '.', ','),
    USD("$", true, ',', '.'),
    RUB("\u20BD", false, '\u00A0', ','),
    BYN("Br", false, '\u00A0', ','),
}

/** "1.332 €", "$1,332.50" or "1 332,50 Br". Negative values get a real minus sign. */
fun formatMoney(value: Double, currency: Currency, digits: Int = if (abs(value % 1.0) < 0.001) 0 else 2): String {
    val symbols = DecimalFormatSymbols(Locale.ROOT).apply {
        groupingSeparator = currency.group
        decimalSeparator = currency.decimal
    }
    val format = DecimalFormat(if (digits == 0) "#,##0" else "#,##0.00", symbols).apply { roundingMode = RoundingMode.HALF_UP }
    val number = format.format(abs(value))
    val text = if (currency.before) currency.symbol + number else number + "\u00A0" + currency.symbol
    return (if (value < -0.001) "\u2212" else "") + text
}

/** Number for an edit field: no trailing ".0". */
fun plainAmount(value: Double): String =
    if (value % 1.0 == 0.0) value.toLong().toString() else value.toString()

/** Accepts "12,50", "1.234,50", "1234.5" and any currency sign or spaces around it. */
fun parseAmount(raw: String): Double? {
    val text = raw.replace(Regex("[^0-9.,]"), "")
    if (text.isEmpty()) return null
    val normalized = when {
        text.contains(',') && text.contains('.') -> text.replace(".", "").replace(',', '.')
        text.contains(',') -> text.replace(',', '.')
        else -> text
    }
    return normalized.toDoubleOrNull()
}
