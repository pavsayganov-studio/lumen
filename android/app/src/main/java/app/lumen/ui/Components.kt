package app.lumen.ui

import android.graphics.Paint
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.lumen.R
import app.lumen.data.Currency
import app.lumen.data.formatMoney
import kotlin.math.cos
import kotlin.math.sin

private val glyphCheck = Paint()

/** The official sign, or the ISO code on a phone whose font lacks the glyph (the Kyrgyz som sign is new). */
internal fun Currency.sign(): String = if (glyphCheck.hasGlyph(symbol)) symbol else name

/** Amount in the currency of the surrounding screen (see [WithCurrency]). */
@Composable
internal fun money(value: Double, digits: Int? = null): String = money(value, LocalCurrency.current, digits)

/** Amount in [currency]. */
internal fun money(value: Double, currency: Currency, digits: Int? = null): String =
    if (digits == null) formatMoney(value, currency, symbol = currency.sign()) else formatMoney(value, currency, digits, currency.sign())

@Composable
internal fun categoryName(id: String): String {
    val builtIn = when (id) {
        "Housing" -> R.string.cat_housing
        "Savings" -> R.string.cat_savings
        "Transportation" -> R.string.cat_transport
        "Food & Drink" -> R.string.cat_food
        "Shopping" -> R.string.cat_shopping
        "Entertainment" -> R.string.cat_fun
        "Health" -> R.string.cat_health
        else -> null
    }
    // A built-in category the person renamed has an entry with the new name; one never renamed has an empty name.
    val saved = LocalCategories.current.firstOrNull { it.id == id }?.name?.takeIf { it.isNotBlank() }
    return saved ?: if (builtIn != null) stringResource(builtIn) else id
}

@Composable
internal fun Heading(text: String, size: TextUnit, modifier: Modifier = Modifier) {
    Text(text, color = palette.ink, fontSize = size, fontWeight = FontWeight.SemiBold, modifier = modifier)
}

/** "Close" with a full-size touch target. */
@Composable
internal fun CloseLink(onClose: () -> Unit) {
    Box(
        Modifier.heightIn(min = 48.dp).clickable(onClick = onClose),
        contentAlignment = Alignment.CenterStart,
    ) {
        Text(stringResource(R.string.close), color = palette.accent)
    }
}

/** One line item. The title takes the leftover width and truncates, so it never runs into the amount. */
@Composable
internal fun TxRow(
    title: String,
    amount: String,
    subtitle: String? = null,
    titleColor: Color = palette.ink,
    amountColor: Color = palette.ink,
    trailing: @Composable () -> Unit = {},
) {
    Row(
        Modifier.fillMaxWidth().padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(Modifier.weight(1f)) {
            Text(title, color = titleColor, maxLines = 1, overflow = TextOverflow.Ellipsis)
            if (subtitle != null) {
                Text(subtitle, color = palette.muted, fontSize = 13.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
        }
        Spacer(Modifier.width(12.dp))
        Text(amount, color = amountColor, maxLines = 1)
        trailing()
    }
}

@Composable
internal fun Stat(label: String, value: String, modifier: Modifier = Modifier, onClick: (() -> Unit)? = null) {
    val tap = if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier
    Column(modifier.then(tap), horizontalAlignment = Alignment.CenterHorizontally) {
        Text(label, color = palette.muted, fontSize = 13.sp, maxLines = 1)
        Text(value, color = palette.ink, fontWeight = FontWeight.SemiBold, maxLines = 1)
    }
}

/** A tappable card that asks for the next step. */
@Composable
internal fun PromptCard(title: String, hint: String, onClick: () -> Unit) {
    Column(
        Modifier
            .fillMaxWidth()
            .padding(top = 12.dp)
            .clip(RoundedCornerShape(22.dp))
            .background(palette.ink.copy(alpha = 0.06f))
            .clickable(onClick = onClick)
            .padding(14.dp),
    ) {
        Text(title, color = palette.ink, fontWeight = FontWeight.SemiBold)
        Text(hint, color = palette.muted, fontSize = 13.sp)
    }
}

/** One option of an exclusive choice. */
@Composable
internal fun Choice(label: String, selected: Boolean, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Box(
        modifier
            .heightIn(min = 48.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(if (selected) palette.accent else palette.ink.copy(alpha = 0.06f))
            .clickable(onClick = onClick)
            .padding(horizontal = 4.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            label,
            color = if (selected) palette.onAccent else palette.ink,
            fontWeight = FontWeight.SemiBold,
            fontSize = 14.sp,
            maxLines = 1,
            textAlign = TextAlign.Center,
        )
    }
}

@Composable
internal fun BudgetRing(fraction: Double, amount: String) {
    val p = palette
    Box(Modifier.fillMaxWidth().height(280.dp), contentAlignment = Alignment.Center) {
        Canvas(Modifier.size(260.dp)) {
            val stroke = 22.dp.toPx()
            val arc = Size(size.width - stroke * 2, size.height - stroke * 2)
            val topLeft = Offset(stroke, stroke)
            drawArc(p.accent.copy(alpha = 0.2f), 0f, 360f, false, topLeft, arc, style = Stroke(16.dp.toPx(), cap = StrokeCap.Round))
            if (fraction > 0) {
                drawArc(
                    brush = Brush.linearGradient(listOf(p.accentFrom, p.accentTo)),
                    startAngle = 140f,
                    sweepAngle = 360f * fraction.coerceIn(0.0, 1.0).toFloat(),
                    useCenter = false,
                    topLeft = topLeft,
                    size = arc,
                    style = Stroke(stroke, cap = StrokeCap.Round),
                )
            }
            val dots = 42
            val radius = size.minDimension / 2 - 48.dp.toPx()
            repeat(dots) { i ->
                val angle = (i / dots.toFloat()) * Math.PI * 2 - Math.PI / 2
                drawCircle(
                    p.accent.copy(alpha = 0.55f),
                    2.2.dp.toPx(),
                    Offset((size.width / 2 + cos(angle) * radius).toFloat(), (size.height / 2 + sin(angle) * radius).toFloat()),
                )
            }
        }
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Heading(amount, 40.sp)
            Text(stringResource(R.string.left_to_spend), color = p.muted)
        }
    }
}

/** Scrollable page with a title. Section screens pass no close action; the bottom bar leaves them. */
@Composable
internal fun Detail(title: String, subtitle: String? = null, onClose: (() -> Unit)? = null, body: @Composable () -> Unit) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            if (onClose != null) {
                CloseLink(onClose)
                Spacer(Modifier.width(16.dp))
            }
            Column {
                Heading(title, 22.sp)
                if (subtitle != null) Text(subtitle, color = palette.muted, fontSize = 13.sp)
            }
        }
        Spacer(Modifier.height(20.dp))
        body()
    }
}

@Composable
internal fun fieldColors(): androidx.compose.material3.TextFieldColors {
    val p = palette
    return OutlinedTextFieldDefaults.colors(
        focusedTextColor = p.ink,
        unfocusedTextColor = p.ink,
        focusedBorderColor = p.accent,
        unfocusedBorderColor = p.ink.copy(alpha = 0.2f),
        focusedLabelColor = p.accent,
        unfocusedLabelColor = p.muted,
        cursorColor = p.accent,
    )
}
