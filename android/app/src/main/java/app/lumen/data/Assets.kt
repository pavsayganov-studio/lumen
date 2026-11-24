package app.lumen.data

/** A bank account typed in by hand: the bank, the money on it and the currency of that money. */
data class Asset(val id: String, val bank: String, val amount: Double, val currency: Currency)

/** What the Assets total shows: the sum in one currency, and every other currency's sum beside it. */
class AssetsTotal(val total: Double, val others: List<Pair<Currency, Double>>)

/**
 * The total in [view]. Until exchange rates exist nothing is converted: accounts in [view] are added up,
 * and the accounts in other currencies are listed side by side, never added in.
 */
fun List<Asset>.totalIn(view: Currency): AssetsTotal {
    val sums = groupBy { it.currency }.mapValues { (_, items) -> items.sumOf { it.amount } }
    return AssetsTotal(sums[view] ?: 0.0, sums.filterKeys { it != view }.toList().sortedBy { it.first.ordinal })
}
