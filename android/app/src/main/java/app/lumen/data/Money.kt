package app.lumen.data

import java.math.RoundingMode
import java.text.DecimalFormat
import java.text.DecimalFormatSymbols
import java.util.Locale
import kotlin.math.abs

/**
 * Official symbols. Uzbekistan has no sign (the sum is written so\u02BBm) and Tajikistan uses the abbreviation SM.
 * Amounts are never converted.
 */
enum class Currency(val symbol: String, val before: Boolean, val group: Char, val decimal: Char) {
    EUR("\u20AC", false, '.', ','),
    USD("$", true, ',', '.'),
    RUB("\u20BD", false, '\u00A0', ','),
    BYN("Br", false, '\u00A0', ','),
    KZT("\u20B8", false, '\u00A0', ','),
    UZS("so\u02BBm", false, '\u00A0', ','),
    AZN("\u20BC", false, '\u00A0', ','),
    AMD("\u058F", false, '\u00A0', ','),
    KGS("\u20C0", false, '\u00A0', ','),
    TJS("SM", false, '\u00A0', ','),
}

/** Currency for a first launch: Belarusian language or region is BYN, Russian is RUB, English is USD, anything else EUR. */
fun currencyFor(locale: Locale): Currency = when {
    locale.country == "BY" || locale.language == "be" -> Currency.BYN
    locale.language == "ru" -> Currency.RUB
    locale.language == "en" -> Currency.USD
    else -> Currency.EUR
}

/** "1.332 €", "$1,332.50" or "1 332,50 Br". Negative values get a real minus sign. */
fun formatMoney(
    value: Double,
    currency: Currency,
    digits: Int = if (abs(value % 1.0) < 0.001) 0 else 2,
    /** The sign to print; the screen passes the ISO code when the phone's font lacks the official sign. */
    symbol: String = currency.symbol,
): String {
    val symbols = DecimalFormatSymbols(Locale.ROOT).apply {
        groupingSeparator = currency.group
        decimalSeparator = currency.decimal
    }
    val format = DecimalFormat(if (digits == 0) "#,##0" else "#,##0.00", symbols).apply { roundingMode = RoundingMode.HALF_UP }
    val number = format.format(abs(value))
    val text = if (currency.before) symbol + number else number + "\u00A0" + symbol
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
