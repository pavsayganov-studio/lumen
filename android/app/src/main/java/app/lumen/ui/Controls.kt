package app.lumen.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.DateRangePicker
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.material3.rememberDateRangePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.lumen.R
import app.lumen.data.Currency
import app.lumen.data.Period
import java.time.Instant
import java.time.LocalDate
import java.time.Month
import java.time.YearMonth
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import java.time.format.FormatStyle
import java.time.format.TextStyle
import java.util.Locale

/** "6 Nov 2026" in the phone's language. */
internal fun shortDate(iso: String): String =
    runCatching { LocalDate.parse(iso).format(DateTimeFormatter.ofLocalizedDate(FormatStyle.MEDIUM)) }.getOrDefault(iso)

internal fun monthTitle(month: YearMonth): String {
    val name = month.month.getDisplayName(TextStyle.FULL_STANDALONE, Locale.getDefault())
    return name.replaceFirstChar { it.titlecase(Locale.getDefault()) } + " " + month.year
}

/** A single-line text field in the app's colors. */
@Composable
internal fun Field(value: String, label: String, onChange: (String) -> Unit, keyboard: KeyboardType = KeyboardType.Text) {
    OutlinedTextField(
        value,
        onChange,
        label = { Text(label) },
        singleLine = true,
        keyboardOptions = KeyboardOptions(keyboardType = keyboard),
        colors = fieldColors(),
        modifier = Modifier.fillMaxWidth(),
    )
}

/** Progress toward a price. */
@Composable
internal fun ProgressBar(fraction: Double) {
    Box(Modifier.fillMaxWidth().padding(vertical = 8.dp).height(8.dp).clip(RoundedCornerShape(4.dp)).background(palette.ink.copy(alpha = 0.08f))) {
        Box(
            Modifier
                .fillMaxWidth(fraction.toFloat().coerceIn(0f, 1f))
                .height(8.dp)
                .background(Brush.horizontalGradient(listOf(palette.accentFrom, palette.accentTo))),
        )
    }
}

/** The small cross at the end of a row that can be deleted. */
@Composable
internal fun DeleteLink(onClick: () -> Unit) {
    val label = stringResource(R.string.delete)
    Text(
        "\u2715",
        color = palette.muted,
        modifier = Modifier
            .padding(start = 8.dp)
            .semantics { contentDescription = label }
            .clickable(onClick = onClick)
            .padding(8.dp),
    )
}

/** A dialog with a title, a form and Save / Cancel. */
@Composable
internal fun FormDialog(title: String, confirm: String, onConfirm: () -> Unit, onDismiss: () -> Unit, content: @Composable () -> Unit) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Heading(title, 20.sp) },
        text = {
            Column(Modifier.verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(8.dp)) { content() }
        },
        confirmButton = { TextButton(onClick = onConfirm) { Text(confirm, color = palette.accent, fontWeight = FontWeight.SemiBold) } },
        dismissButton = { TextButton(onClick = onDismiss) { Text(stringResource(R.string.cancel), color = palette.muted) } },
        containerColor = palette.bg,
        titleContentColor = palette.ink,
        textContentColor = palette.ink,
    )
}

/** A date shown as a tappable field; the picker opens on tap. */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun DateField(label: String, value: LocalDate?, onChange: (LocalDate?) -> Unit, clearable: Boolean = false) {
    var open by remember { mutableStateOf(false) }
    Row(
        Modifier
            .fillMaxWidth()
            .heightIn(min = Dimens.touch)
            .clip(RoundedCornerShape(Dimens.control))
            .background(palette.ink.copy(alpha = 0.06f))
            .clickable { open = true }
            .padding(horizontal = 14.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(Modifier.weight(1f)) {
            Text(label, color = palette.muted, fontSize = 12.sp)
            Text(if (value == null) "\u2014" else shortDate(value.toString()), color = palette.ink)
        }
        if (clearable && value != null) {
            val clear = stringResource(R.string.clear)
            Text(
                "\u2715",
                color = palette.muted,
                modifier = Modifier.semantics { contentDescription = clear }.clickable { onChange(null) }.padding(8.dp),
            )
        }
    }
    if (open) {
        val state = rememberDatePickerState(
            initialSelectedDateMillis = (value ?: LocalDate.now()).atStartOfDay(ZoneOffset.UTC).toInstant().toEpochMilli(),
        )
        DatePickerDialog(
            onDismissRequest = { open = false },
            confirmButton = {
                TextButton(
                    onClick = {
                        state.selectedDateMillis?.let { onChange(Instant.ofEpochMilli(it).atZone(ZoneOffset.UTC).toLocalDate()) }
                        open = false
                    },
                ) { Text(stringResource(R.string.save), color = palette.accent) }
            },
            dismissButton = { TextButton(onClick = { open = false }) { Text(stringResource(R.string.cancel), color = palette.muted) } },
        ) { DatePicker(state) }
    }
}

/** The period as a title. Tap it to pick a month or, from there, a date range; the choice is kept while the app is open. */
@Composable
internal fun PeriodHeader(period: Period, onChange: (Period) -> Unit, modifier: Modifier = Modifier, size: TextUnit = 28.sp) {
    var open by rememberSaveable { mutableStateOf(false) }
    val hint = stringResource(R.string.pick_period)
    Row(
        modifier
            .heightIn(min = Dimens.touch)
            .semantics { contentDescription = hint }
            .clickable { open = true },
        verticalAlignment = Alignment.CenterVertically,
    ) {
        // A range is longer than a month name, so it is set a little smaller.
        Heading(periodTitle(period), if (period.month == null) (size.value * 0.75f).sp else size)
        Text(" \u25BE", color = palette.muted, fontSize = size)
    }
    if (open) PeriodDialog(period, onPick = { onChange(it); open = false }, onDismiss = { open = false })
}

/** "November 2026" for a whole month, "6 Nov 2026 \u2013 21 Nov 2026" for any other range. */
internal fun periodTitle(period: Period): String =
    period.month?.let(::monthTitle) ?: (shortDate(period.from.toString()) + " \u2013 " + shortDate(period.to.toString()))

/** Top row of Home: the period on the left, the currency menu in the upper-right corner. */
@Composable
internal fun ViewBar(
    period: Period,
    shown: Currency?,
    options: List<Currency>,
    onPeriod: (Period) -> Unit,
    onShown: (Currency?) -> Unit,
    size: TextUnit = 28.sp,
) {
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        PeriodHeader(period, onPeriod, Modifier.weight(1f), size)
        Spacer(Modifier.width(12.dp))
        CurrencyMenu(shown, options, onShown)
    }
}

/**
 * A field-style button that opens a menu: the one look for a value picked from a short list. [current] is what the button shows and
 * [label] the text of each item. [wide] stretches it over the row; [compact] is the narrow form that sits inside a text field.
 */
@Composable
internal fun <T> MenuButton(
    current: String,
    items: List<T>,
    label: (T) -> String,
    selected: (T) -> Boolean,
    hint: String,
    onSelect: (T) -> Unit,
    modifier: Modifier = Modifier,
    wide: Boolean = false,
    compact: Boolean = false,
) {
    var open by remember { mutableStateOf(false) }
    Box(if (wide) modifier.fillMaxWidth() else modifier) {
        Row(
            Modifier
                .then(if (wide) Modifier.fillMaxWidth() else Modifier)
                .heightIn(min = Dimens.touch)
                .clip(RoundedCornerShape(Dimens.control))
                .background(palette.ink.copy(alpha = 0.06f))
                .semantics { contentDescription = "$hint: $current" }
                .clickable(role = Role.DropdownList) { open = true }
                .padding(horizontal = if (compact) 10.dp else 14.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(current, color = palette.ink, fontWeight = FontWeight.SemiBold, maxLines = 1)
            if (wide) Spacer(Modifier.weight(1f))
            Text(" \u25BE", color = palette.muted)
        }
        DropdownMenu(expanded = open, onDismissRequest = { open = false }, containerColor = palette.raised) {
            items.forEach { item ->
                val on = selected(item)
                DropdownMenuItem(
                    text = {
                        Text(
                            label(item),
                            color = if (on) palette.accent else palette.ink,
                            fontWeight = if (on) FontWeight.SemiBold else FontWeight.Normal,
                        )
                    },
                    onClick = { open = false; onSelect(item) },
                )
            }
        }
    }
}

private fun currencyLabel(currency: Currency): String = currency.sign() + "  " + currency.name

/** Total (every currency, listed side by side, never added) first, then each currency in use. */
@Composable
internal fun CurrencyMenu(selected: Currency?, options: List<Currency>, onSelect: (Currency?) -> Unit) {
    val total = stringResource(R.string.total)
    val label = { c: Currency? -> if (c == null) total else currencyLabel(c) }
    MenuButton(label(selected), listOf<Currency?>(null) + options, label, { it == selected }, stringResource(R.string.pick_currency), onSelect)
}

/** Every currency in a drop-down. [compact] shows only the sign, for the narrow form inside an amount field. */
@Composable
internal fun CurrencyPicker(
    selected: Currency,
    onSelect: (Currency) -> Unit,
    modifier: Modifier = Modifier,
    wide: Boolean = false,
    compact: Boolean = false,
) {
    MenuButton(
        if (compact) selected.sign() else currencyLabel(selected),
        Currency.entries,
        ::currencyLabel,
        { it == selected },
        stringResource(R.string.pick_currency),
        onSelect,
        modifier,
        wide,
        compact,
    )
}

/** An amount with its currency in a small, narrow drop-down at the right edge of the field. */
@Composable
internal fun AmountField(amount: String, onAmount: (String) -> Unit, currency: Currency, onCurrency: (Currency) -> Unit) {
    OutlinedTextField(
        amount,
        onAmount,
        label = { Text(stringResource(R.string.amount)) },
        singleLine = true,
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
        trailingIcon = { CurrencyPicker(currency, onCurrency, Modifier.padding(end = 8.dp), compact = true) },
        colors = fieldColors(),
        modifier = Modifier.fillMaxWidth(),
    )
}

/** An icon-only button with a 48dp touch target. [label] is what a screen reader says. */
@Composable
internal fun IconAction(icon: Int, label: String, onClick: () -> Unit) {
    Box(
        Modifier.size(Dimens.touch).semantics { contentDescription = label }.clickable(role = Role.Button, onClick = onClick),
        contentAlignment = Alignment.Center,
    ) { Icon(painterResource(icon), null, tint = palette.muted, modifier = Modifier.size(22.dp)) }
}

/** Every currency as exclusive chips, four to a row, by ISO code. */
@Composable
internal fun CurrencyChoices(selected: Currency, onSelect: (Currency) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Currency.entries.chunked(4).forEach { row ->
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                row.forEach { c -> Choice(c.name, c == selected, Modifier.weight(1f)) { onSelect(c) } }
                repeat(4 - row.size) { Spacer(Modifier.weight(1f)) }
            }
        }
    }
}

/** A month from the year stepper and grid, or "Date range" for the calendar. */
@Composable
private fun PeriodDialog(current: Period, onPick: (Period) -> Unit, onDismiss: () -> Unit) {
    var year by rememberSaveable { mutableStateOf(current.from.year) }
    var range by rememberSaveable { mutableStateOf(false) }
    if (range) {
        RangeDialog(current, onPick, onDismiss = { range = false })
    } else {
        AlertDialog(
            onDismissRequest = onDismiss,
            title = {
                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
                    YearStep("\u2039", stringResource(R.string.year_prev)) { year-- }
                    Heading(year.toString(), 22.sp)
                    YearStep("\u203A", stringResource(R.string.year_next)) { year++ }
                }
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    (1..12).chunked(3).forEach { months ->
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            months.forEach { m ->
                                val target = YearMonth.of(year, m)
                                Choice(shortMonth(m), target == current.month, Modifier.weight(1f)) { onPick(Period.month(target)) }
                            }
                        }
                    }
                }
            },
            confirmButton = { TextButton(onClick = onDismiss) { Text(stringResource(R.string.close), color = palette.accent) } },
            dismissButton = { TextButton(onClick = { range = true }) { Text(stringResource(R.string.date_range), color = palette.accent) } },
            containerColor = palette.bg,
            titleContentColor = palette.ink,
            textContentColor = palette.ink,
        )
    }
}

/** The calendar: tap the first day, then the last. One tap picks a single day. */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun RangeDialog(current: Period, onPick: (Period) -> Unit, onDismiss: () -> Unit) {
    val state = rememberDateRangePickerState(
        initialSelectedStartDateMillis = utcMillis(current.from),
        initialSelectedEndDateMillis = utcMillis(current.to),
    )
    val start = state.selectedStartDateMillis
    val end = state.selectedEndDateMillis
    DatePickerDialog(
        onDismissRequest = onDismiss,
        confirmButton = {
            TextButton(
                onClick = { if (start != null) onPick(Period(utcDate(start), utcDate(end ?: start))) },
                enabled = start != null,
            ) { Text(stringResource(R.string.save), color = palette.accent) }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text(stringResource(R.string.cancel), color = palette.muted) } },
    ) {
        DateRangePicker(state, Modifier.height(480.dp), showModeToggle = false)
    }
}

private fun utcMillis(date: LocalDate): Long = date.atStartOfDay(ZoneOffset.UTC).toInstant().toEpochMilli()

private fun utcDate(millis: Long): LocalDate = Instant.ofEpochMilli(millis).atZone(ZoneOffset.UTC).toLocalDate()
@Composable
private fun YearStep(symbol: String, label: String, onClick: () -> Unit) {
    Box(
        Modifier.size(Dimens.touch).clip(CircleShape).semantics { contentDescription = label }.clickable(onClick = onClick),
        contentAlignment = Alignment.Center,
    ) { Text(symbol, color = palette.accent, fontSize = 26.sp) }
}

private fun shortMonth(month: Int): String =
    Month.of(month).getDisplayName(TextStyle.SHORT_STANDALONE, Locale.getDefault()).replaceFirstChar { it.titlecase(Locale.getDefault()) }
