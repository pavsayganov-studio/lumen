package app.lumen.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.lumen.R
import app.lumen.data.Currency
import app.lumen.data.Expense
import app.lumen.data.PlanItem
import app.lumen.data.Project
import app.lumen.data.ProjectKind
import app.lumen.data.RowState
import app.lumen.data.balance
import app.lumen.data.neededPerMonth
import app.lumen.data.newestFirst
import app.lumen.data.paid
import app.lumen.data.parseAmount
import app.lumen.data.payments
import app.lumen.data.plainAmount
import app.lumen.data.progress
import app.lumen.data.rows
import app.lumen.data.splitBalance
import java.time.LocalDate

@Composable
private fun kindName(kind: ProjectKind): String = stringResource(
    when (kind) {
        ProjectKind.Home -> R.string.kind_home
        ProjectKind.Car -> R.string.kind_car
        ProjectKind.Trip -> R.string.kind_trip
        ProjectKind.Other -> R.string.kind_other
    },
)

/** The Projects tab: every big purchase with what is paid and what is still due. */
@Composable
internal fun ProjectsScreen(projects: List<Project>, expenses: List<Expense>, onOpen: (String) -> Unit, onNew: () -> Unit) {
    val today = LocalDate.now().toString()
    Detail(stringResource(R.string.nav_projects)) {
        if (projects.isEmpty()) PromptCard(stringResource(R.string.projects_empty), stringResource(R.string.projects_empty_hint), onNew)
        projects.forEach { p -> ProjectCard(p, expenses, today) { onOpen(p.id) } }
        if (projects.isNotEmpty()) {
            Button(onClick = onNew, modifier = Modifier.fillMaxWidth().padding(top = 16.dp)) { Text(stringResource(R.string.new_project)) }
        }
    }
}

@Composable
private fun ProjectCard(p: Project, expenses: List<Expense>, today: String, onClick: () -> Unit) {
    WithCurrency(p.currency) { ProjectCardBody(p, expenses, today, onClick) }
}

@Composable
private fun ProjectCardBody(p: Project, expenses: List<Expense>, today: String, onClick: () -> Unit) {
    val next = p.rows(expenses, today).firstOrNull { it.state != RowState.Paid }
    Column(
        Modifier
            .fillMaxWidth()
            .padding(top = 12.dp)
            .clip(RoundedCornerShape(Dimens.card))
            .background(palette.ink.copy(alpha = 0.06f))
            .clickable(onClick = onClick)
            .padding(14.dp),
    ) {
        TxRow(p.name, money(p.balance(expenses)), kindName(p.kind))
        ProgressBar(p.progress(expenses))
        Totals(p, expenses)
        if (next != null) {
            val due = next.state == RowState.Due
            Text(
                stringResource(R.string.next_payment) + ": " + shortDate(next.item.date) + " \u00B7 " + money(next.item.amount),
                color = if (due) palette.danger else palette.muted,
                fontSize = 13.sp,
                modifier = Modifier.padding(top = 8.dp),
            )
        }
    }
}

@Composable
private fun Totals(p: Project, expenses: List<Expense>) {
    Row(Modifier.fillMaxWidth()) {
        Stat(stringResource(R.string.price), money(p.price), Modifier.weight(1f))
        Stat(stringResource(R.string.paid), money(p.paid(expenses)), Modifier.weight(1f))
        Stat(stringResource(R.string.balance_due), money(p.balance(expenses)), Modifier.weight(1f))
    }
}

private sealed interface Dialog {
    data class Pay(val row: PlanItem?) : Dialog
    data object Cost : Dialog
    data object Split : Dialog
    data object Delete : Dialog
}

/** One project: totals, the payment schedule, and every payment made so far. */
@Composable
internal fun ProjectScreen(
    project: Project,
    expenses: List<Expense>,
    onClose: () -> Unit,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    onSave: (Project) -> Unit,
    onPay: (amount: Double, row: PlanItem?) -> Unit,
    onDeletePayment: (String) -> Unit,
) {
    val today = LocalDate.now()
    var dialog by remember { mutableStateOf<Dialog?>(null) }
    val rows = project.rows(expenses, today.toString())
    val needed = if (project.plan.isEmpty()) project.neededPerMonth(expenses, today) else null
    Detail(project.name, kindName(project.kind), onClose = onClose) {
        ProgressBar(project.progress(expenses))
        Totals(project, expenses)
        if (project.deadline != null) {
            Text(stringResource(R.string.target_date) + ": " + shortDate(project.deadline), color = palette.muted, modifier = Modifier.padding(top = 8.dp))
        }
        if (needed != null) Text(stringResource(R.string.need_monthly, money(needed, 0)), color = palette.muted, modifier = Modifier.padding(top = 4.dp))

        if (rows.isNotEmpty()) {
            Heading(stringResource(R.string.plan), 18.sp, Modifier.padding(top = 20.dp, bottom = 4.dp))
            rows.forEach { row ->
                val paidRow = row.state == RowState.Paid
                val dueRow = row.state == RowState.Due
                TxRow(
                    title = (if (paidRow) "\u2713  " else "") + row.item.title,
                    amount = money(row.item.amount),
                    subtitle = shortDate(row.item.date) + if (dueRow) " \u00B7 " + stringResource(R.string.due) else "",
                    titleColor = if (paidRow) palette.good else palette.ink,
                    amountColor = if (dueRow) palette.danger else palette.ink,
                    trailing = {
                        if (!paidRow) {
                            Text(
                                stringResource(R.string.pay),
                                color = palette.accent,
                                fontWeight = FontWeight.SemiBold,
                                modifier = Modifier.heightIn(min = Dimens.touch).clickable { dialog = Dialog.Pay(row.item) }.padding(start = 12.dp).padding(vertical = 12.dp),
                            )
                        }
                    },
                )
            }
        }

        Button(onClick = { dialog = Dialog.Pay(null) }, modifier = Modifier.fillMaxWidth().padding(top = 16.dp)) { Text(stringResource(R.string.add_payment)) }
        ActionLink(stringResource(R.string.split_balance)) { dialog = Dialog.Split }
        ActionLink(stringResource(R.string.add_cost)) { dialog = Dialog.Cost }

        val payments = project.payments(expenses).newestFirst()
        if (payments.isNotEmpty()) {
            Heading(stringResource(R.string.payments), 18.sp, Modifier.padding(top = 20.dp, bottom = 4.dp))
            payments.forEach { e ->
                TxRow(e.title, "\u2212" + money(e.amount, 2), shortDate(e.date), trailing = { DeleteLink { onDeletePayment(e.id) } })
            }
        }

        Spacer(Modifier.height(12.dp))
        ActionLink(stringResource(R.string.edit_project), onClick = onEdit)
        ActionLink(stringResource(R.string.delete_project), color = palette.danger) { dialog = Dialog.Delete }
    }

    when (val d = dialog) {
        is Dialog.Pay -> PayDialog(d.row?.amount, { amount -> onPay(amount, d.row); dialog = null }, { dialog = null })
        Dialog.Cost -> CostDialog(
            { title, amount, date ->
                onSave(project.copy(plan = project.plan + PlanItem("c${System.currentTimeMillis()}", title, amount, date.toString())))
                dialog = null
            },
            { dialog = null },
        )
        Dialog.Split -> SplitDialog(
            { count, first ->
                onSave(project.splitBalance(expenses, count, first, "s${System.currentTimeMillis()}-"))
                dialog = null
            },
            { dialog = null },
        )
        Dialog.Delete -> FormDialog(stringResource(R.string.delete_project), stringResource(R.string.delete), { dialog = null; onDelete() }, { dialog = null }) {
            Text(stringResource(R.string.delete_project_ask), color = palette.muted)
        }
        null -> Unit
    }
}

@Composable
internal fun ActionLink(label: String, color: androidx.compose.ui.graphics.Color = palette.accent, onClick: () -> Unit) {
    Text(
        label,
        color = color,
        fontWeight = FontWeight.SemiBold,
        modifier = Modifier.fillMaxWidth().heightIn(min = Dimens.touch).clickable(onClick = onClick).padding(vertical = 14.dp),
    )
}

@Composable
private fun PayDialog(planned: Double?, onConfirm: (Double) -> Unit, onDismiss: () -> Unit) {
    var amount by rememberSaveable { mutableStateOf(if (planned != null) plainAmount(planned) else "") }
    FormDialog(
        stringResource(R.string.add_payment),
        stringResource(R.string.save),
        { parseAmount(amount)?.takeIf { it > 0 }?.let(onConfirm) },
        onDismiss,
    ) { Field(amount, stringResource(R.string.amount), { amount = it }, KeyboardType.Decimal) }
}

@Composable
private fun CostDialog(onConfirm: (String, Double, LocalDate) -> Unit, onDismiss: () -> Unit) {
    var title by rememberSaveable { mutableStateOf("") }
    var amount by rememberSaveable { mutableStateOf("") }
    var date by remember { mutableStateOf(LocalDate.now()) }
    FormDialog(
        stringResource(R.string.add_cost),
        stringResource(R.string.save),
        {
            val value = parseAmount(amount)
            if (value != null && value > 0 && title.isNotBlank()) onConfirm(title.trim(), value, date)
        },
        onDismiss,
    ) {
        Field(title, stringResource(R.string.name), { title = it })
        Field(amount, stringResource(R.string.amount), { amount = it }, KeyboardType.Decimal)
        DateField(stringResource(R.string.date), date, { date = it ?: date })
    }
}

@Composable
private fun SplitDialog(onConfirm: (Int, LocalDate) -> Unit, onDismiss: () -> Unit) {
    var count by rememberSaveable { mutableStateOf("12") }
    var first by remember { mutableStateOf(LocalDate.now().plusMonths(1)) }
    FormDialog(
        stringResource(R.string.split_balance),
        stringResource(R.string.save),
        { count.toIntOrNull()?.takeIf { it in 1..600 }?.let { onConfirm(it, first) } },
        onDismiss,
    ) {
        Field(count, stringResource(R.string.parts), { count = it.filter(Char::isDigit) }, KeyboardType.Number)
        DateField(stringResource(R.string.first_payment), first, { first = it ?: first })
    }
}

/** New or existing project: name, kind, price and an optional target date. The schedule is built on the project screen. */
@Composable
internal fun ProjectEditor(initial: Project?, startCurrency: Currency, onClose: () -> Unit, onSave: (Project) -> Unit) {
    var name by rememberSaveable { mutableStateOf(initial?.name ?: "") }
    var kind by rememberSaveable { mutableStateOf(initial?.kind ?: ProjectKind.Home) }
    var price by rememberSaveable { mutableStateOf(initial?.price?.let { plainAmount(it) } ?: "") }
    var currency by rememberSaveable { mutableStateOf(startCurrency) }
    var deadline by rememberSaveable { mutableStateOf(initial?.deadline) }
    val value = parseAmount(price)
    val valid = value != null && value > 0 && name.isNotBlank()
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(Dimens.screen), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        CloseLink(onClose)
        Heading(stringResource(if (initial == null) R.string.new_project else R.string.edit_project), 28.sp, Modifier.padding(vertical = 4.dp))
        Field(name, stringResource(R.string.name), { name = it })
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
            ProjectKind.entries.forEach { k -> Choice(kindName(k), k == kind, Modifier.weight(1f)) { kind = k } }
        }
        Field(price, stringResource(R.string.price), { price = it }, KeyboardType.Decimal)
        // The payments are made in this currency, so it is chosen once, when the project is created.
        if (initial == null) CurrencyChoices(currency) { currency = it }
        DateField(
            stringResource(R.string.target_date),
            deadline?.let { runCatching { LocalDate.parse(it) }.getOrNull() },
            { deadline = it?.toString() },
            clearable = true,
        )
        Button(
            onClick = {
                if (valid && value != null) {
                    val base = initial ?: Project("p${System.currentTimeMillis()}", name, kind, value, currency)
                    onSave(base.copy(name = name.trim(), kind = kind, price = value, deadline = deadline))
                }
            },
            enabled = valid,
            modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
        ) { Text(stringResource(R.string.save)) }
    }
}
