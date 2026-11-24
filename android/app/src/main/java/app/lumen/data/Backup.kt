package app.lumen.data

import android.content.Context
import android.net.Uri
import org.json.JSONArray
import org.json.JSONObject
import java.time.LocalDate

private const val FORMAT = "lumen-backup"
private const val VERSION = 3 // 3: assets, deleted and renamed categories. 2: currency per expense and project, custom categories. Older files still load.

/** Everything the person entered. Currency, theme and language belong to the phone and are not part of a backup. */
class Ledger(
    val budget: Double,
    val expenses: List<Expense>,
    val projects: List<Project>,
    val categories: List<Category>,
    val assets: List<Asset>,
)

/** A readable JSON document: one file moves all data to another phone. It is not encrypted. */
fun encodeBackup(ledger: Ledger, today: LocalDate): String =
    JSONObject()
        .put("app", FORMAT)
        .put("version", VERSION)
        .put("exported", today.toString())
        .put("budget", ledger.budget)
        .put("expenses", expensesToJson(ledger.expenses))
        .put("projects", projectsToJson(ledger.projects))
        .put("categories", categoriesToJson(ledger.categories))
        .put("assets", assetsToJson(ledger.assets))
        .toString(2)

/** Null when the text is not a Lumen backup this version understands. [fallback] is the currency of version 1 entries. */
fun decodeBackup(text: String, fallback: Currency): Ledger? = runCatching {
    val o = JSONObject(text)
    require(o.getString("app") == FORMAT && o.getInt("version") <= VERSION)
    Ledger(
        o.getDouble("budget"),
        expensesFromJson(o.getJSONArray("expenses"), fallback),
        projectsFromJson(o.optJSONArray("projects") ?: JSONArray(), fallback),
        categoriesFromJson(o.optJSONArray("categories") ?: JSONArray()),
        assetsFromJson(o.optJSONArray("assets") ?: JSONArray()),
    )
}.getOrNull()

fun writeBackup(context: Context, uri: Uri, ledger: Ledger, today: LocalDate): Boolean = runCatching {
    context.contentResolver.openOutputStream(uri, "wt")!!.use { it.write(encodeBackup(ledger, today).toByteArray()) }
}.isSuccess

fun readBackup(context: Context, uri: Uri, fallback: Currency): Ledger? = runCatching {
    context.contentResolver.openInputStream(uri)!!.use { decodeBackup(it.readBytes().decodeToString(), fallback) }
}.getOrNull()
