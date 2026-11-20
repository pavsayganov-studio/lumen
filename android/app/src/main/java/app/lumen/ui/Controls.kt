package app.lumen.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberDatePickerState
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
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.lumen.R
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

/** Month and year as a title. Tap it to pick another month; the choice is shared by Home and Insights. */
@Composable
internal fun MonthHeader(month: YearMonth, onChange: (YearMonth) -> Unit, size: TextUnit = 28.sp) {
    var open by rememberSaveable { mutableStateOf(false) }
    val hint = stringResource(R.string.pick_month)
    Row(
        Modifier
            .heightIn(min = Dimens.touch)
            .semantics { contentDescription = hint }
            .clickable { open = true },
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Heading(monthTitle(month), size)
        Text(" \u25BE", color = palette.muted, fontSize = size)
    }
    if (open) MonthDialog(month, onPick = { onChange(it); open = false }, onDismiss = { open = false })
}

@Composable
private fun MonthDialog(current: YearMonth, onPick: (YearMonth) -> Unit, onDismiss: () -> Unit) {
    var year by rememberSaveable { mutableStateOf(current.year) }
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
                            Choice(shortMonth(m), target == current, Modifier.weight(1f)) { onPick(target) }
                        }
                    }
                }
            }
        },
        confirmButton = { TextButton(onClick = onDismiss) { Text(stringResource(R.string.close), color = palette.accent) } },
        containerColor = palette.bg,
        titleContentColor = palette.ink,
        textContentColor = palette.ink,
    )
}

@Composable
private fun YearStep(symbol: String, label: String, onClick: () -> Unit) {
    Box(
        Modifier.size(Dimens.touch).clip(CircleShape).semantics { contentDescription = label }.clickable(onClick = onClick),
        contentAlignment = Alignment.Center,
    ) { Text(symbol, color = palette.accent, fontSize = 26.sp) }
}

private fun shortMonth(month: Int): String =
    Month.of(month).getDisplayName(TextStyle.SHORT_STANDALONE, Locale.getDefault()).replaceFirstChar { it.titlecase(Locale.getDefault()) }
