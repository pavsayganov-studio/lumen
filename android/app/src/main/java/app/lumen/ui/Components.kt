package app.lumen.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlin.math.cos
import kotlin.math.sin

@Composable
internal fun Heading(text: String, size: TextUnit, modifier: Modifier = Modifier) {
    Text(text, color = Color.White, fontSize = size, fontWeight = FontWeight.SemiBold, modifier = modifier)
}

/** "Close" with a full-size touch target. */
@Composable
internal fun CloseLink(onClose: () -> Unit) {
    Box(
        Modifier.heightIn(min = 48.dp).clickable(onClick = onClose),
        contentAlignment = Alignment.CenterStart,
    ) {
        Text("Close", color = Cyan)
    }
}

/** One line item. The title takes the leftover width and truncates, so it never runs into the amount. */
@Composable
internal fun TxRow(
    title: String,
    amount: String,
    subtitle: String? = null,
    titleColor: Color = Color.White,
    amountColor: Color = Color.White,
) {
    Row(
        Modifier.fillMaxWidth().padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(Modifier.weight(1f)) {
            Text(title, color = titleColor, maxLines = 1, overflow = TextOverflow.Ellipsis)
            if (subtitle != null) {
                Text(subtitle, color = Muted, fontSize = 13.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
        }
        Spacer(Modifier.width(12.dp))
        Text(amount, color = amountColor, maxLines = 1)
    }
}

@Composable
internal fun Stat(label: String, value: String, modifier: Modifier = Modifier, onClick: (() -> Unit)? = null) {
    val tap = if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier
    Column(modifier.then(tap), horizontalAlignment = Alignment.CenterHorizontally) {
        Text(label, color = Muted, fontSize = 13.sp, maxLines = 1)
        Text(value, color = Color.White, fontWeight = FontWeight.SemiBold, maxLines = 1)
    }
}

@Composable
internal fun InsightCard(
    title: String,
    value: String,
    foot: String,
    colors: List<Color>,
    modifier: Modifier = Modifier,
    onClick: () -> Unit,
) {
    Column(
        modifier
            .height(148.dp)
            .clip(RoundedCornerShape(22.dp))
            .background(Brush.verticalGradient(colors))
            .clickable(onClick = onClick)
            .padding(14.dp),
        verticalArrangement = Arrangement.SpaceBetween,
    ) {
        Text(title, color = Color.White.copy(alpha = 0.8f), fontSize = 13.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
        Text(value, color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.SemiBold, maxLines = 1)
        Text(foot, color = Muted, fontSize = 13.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
    }
}

@Composable
internal fun BudgetRing(fraction: Double, amount: String) {
    Box(Modifier.fillMaxWidth().height(280.dp), contentAlignment = Alignment.Center) {
        Canvas(Modifier.size(260.dp)) {
            val stroke = 22.dp.toPx()
            val arc = Size(size.width - stroke * 2, size.height - stroke * 2)
            val topLeft = Offset(stroke, stroke)
            drawArc(Color(0x334878AA), 0f, 360f, false, topLeft, arc, style = Stroke(16.dp.toPx(), cap = StrokeCap.Round))
            drawArc(
                brush = Brush.linearGradient(listOf(Color(0xFF7AF0FF), Color(0xFF1AA4FF))),
                startAngle = 140f,
                sweepAngle = 360f * fraction.coerceIn(0.0, 1.0).toFloat(),
                useCenter = false,
                topLeft = topLeft,
                size = arc,
                style = Stroke(stroke, cap = StrokeCap.Round),
            )
            val dots = 42
            val radius = size.minDimension / 2 - 48.dp.toPx()
            repeat(dots) { i ->
                val angle = (i / dots.toFloat()) * Math.PI * 2 - Math.PI / 2
                drawCircle(
                    Color(0xB35AAADC),
                    2.2.dp.toPx(),
                    Offset((size.width / 2 + cos(angle) * radius).toFloat(), (size.height / 2 + sin(angle) * radius).toFloat()),
                )
            }
        }
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Heading(amount, 40.sp)
            Text("left to spend", color = Muted)
        }
    }
}

/** Scrollable detail page with a Close link and a title. */
@Composable
internal fun Detail(title: String, subtitle: String, onClose: () -> Unit, body: @Composable () -> Unit) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            CloseLink(onClose)
            Spacer(Modifier.width(16.dp))
            Column {
                Heading(title, 18.sp)
                Text(subtitle, color = Muted, fontSize = 13.sp)
            }
        }
        Spacer(Modifier.height(20.dp))
        body()
    }
}

@Composable
internal fun fieldColors() = OutlinedTextFieldDefaults.colors(
    focusedTextColor = Color.White,
    unfocusedTextColor = Color.White,
    focusedBorderColor = Cyan,
    unfocusedBorderColor = Color.White.copy(alpha = 0.2f),
    focusedLabelColor = Cyan,
    unfocusedLabelColor = Muted,
    cursorColor = Cyan,
)
