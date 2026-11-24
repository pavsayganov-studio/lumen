package app.lumen.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
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
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.lumen.R
import app.lumen.data.Asset
import app.lumen.data.Currency
import app.lumen.data.parseAmount
import app.lumen.data.plainAmount
import app.lumen.data.totalIn
import java.time.LocalDate

/**
 * The Assets tab: the total on top with the date it is as of, then the bank accounts the person typed in.
 * Nothing is converted yet, so the total adds up the accounts in the chosen currency and lists the others beside it.
 */
@Composable
internal fun AssetsScreen(
    assets: List<Asset>,
    view: Currency,
    onView: (Currency) -> Unit,
    onOpen: (String) -> Unit,
    onNew: () -> Unit,
) {
    val sums = remember(assets, view) { assets.totalIn(view) }
    LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(Dimens.screen)) {
        item {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Heading(stringResource(R.string.total_assets), 22.sp, Modifier.weight(1f))
                CurrencyPicker(view, onView)
            }
        }
        item {
            Column(Modifier.fillMaxWidth().padding(vertical = 24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Heading(money(sums.total, view), 40.sp)
                Text(stringResource(R.string.as_of, shortDate(LocalDate.now().toString())), color = palette.muted)
                if (sums.others.isNotEmpty()) {
                    Text(stringResource(R.string.not_converted), color = palette.muted, fontSize = 13.sp, modifier = Modifier.padding(top = 12.dp))
                    sums.others.forEach { (currency, amount) -> Text(money(amount, currency), color = palette.ink, fontWeight = FontWeight.SemiBold) }
                }
            }
        }
        item {
            if (assets.isEmpty()) {
                PromptCard(stringResource(R.string.add_account), stringResource(R.string.add_account_hint), onNew)
            } else {
                Button(onClick = onNew, modifier = Modifier.fillMaxWidth()) { Text(stringResource(R.string.add_account)) }
            }
        }
        items(assets, key = { it.id }) { asset ->
            Box(
                Modifier.fillMaxWidth().heightIn(min = Dimens.touch).clickable(role = Role.Button) { onOpen(asset.id) },
                contentAlignment = Alignment.CenterStart,
            ) { TxRow(asset.bank, money(asset.amount, asset.currency, 2)) }
        }
    }
}

/** The bank account card: the bank, the amount and its currency, all typed by hand. */
@Composable
internal fun AssetEditor(initial: Asset?, startCurrency: Currency, onClose: () -> Unit, onDelete: () -> Unit, onSave: (Asset) -> Unit) {
    var bank by rememberSaveable { mutableStateOf(initial?.bank ?: "") }
    var amount by rememberSaveable { mutableStateOf(initial?.let { plainAmount(it.amount) } ?: "") }
    var currency by rememberSaveable { mutableStateOf(initial?.currency ?: startCurrency) }
    var deleting by rememberSaveable { mutableStateOf(false) }
    val value = parseAmount(amount)
    val valid = value != null && bank.isNotBlank()
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(Dimens.screen)) {
        CloseLink(onClose)
        Heading(stringResource(R.string.bank_account), 28.sp, Modifier.padding(vertical = 12.dp))
        Field(bank, stringResource(R.string.bank_name), { bank = it })
        Spacer(Modifier.height(8.dp))
        AmountField(amount, { amount = it }, currency) { currency = it }
        Spacer(Modifier.height(12.dp))
        Button(
            onClick = { if (value != null && bank.isNotBlank()) onSave(Asset(initial?.id ?: "a${System.currentTimeMillis()}", bank.trim(), value, currency)) },
            enabled = valid,
            modifier = Modifier.fillMaxWidth(),
        ) { Text(stringResource(R.string.save)) }
        if (initial != null) ActionLink(stringResource(R.string.delete_account), color = palette.danger) { deleting = true }
    }
    if (deleting) {
        FormDialog(stringResource(R.string.delete_account), stringResource(R.string.delete), { deleting = false; onDelete() }, { deleting = false }) {
            Text(stringResource(R.string.delete_account_ask), color = palette.muted)
        }
    }
}
