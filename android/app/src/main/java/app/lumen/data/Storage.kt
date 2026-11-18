package app.lumen.data

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

private const val PREFS = "lumen"
private const val KEY_EXTRA = "extra"

private fun prefs(context: Context) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

/** Expenses the user added on this device. */
fun loadExtra(context: Context): List<Tx> {
    val raw = prefs(context).getString(KEY_EXTRA, null) ?: return emptyList()
    return runCatching {
        val array = JSONArray(raw)
        List(array.length()) { i ->
            val o = array.getJSONObject(i)
            Tx(o.getString("id"), o.getString("title"), o.getDouble("amount"), o.getString("date"), o.getString("category"), false)
        }
    }.getOrDefault(emptyList())
}

fun saveExtra(context: Context, extra: List<Tx>) {
    val array = JSONArray()
    extra.forEach { tx ->
        array.put(
            JSONObject()
                .put("id", tx.id)
                .put("title", tx.title)
                .put("amount", tx.amount)
                .put("date", tx.date)
                .put("category", tx.category),
        )
    }
    prefs(context).edit().putString(KEY_EXTRA, array.toString()).apply()
}
