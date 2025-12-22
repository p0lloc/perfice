package dev.adoe.perfice.data

import android.util.Log
import dev.adoe.perfice.store.Identifiable
import dev.adoe.perfice.store.deserializeJsonObject
import org.json.JSONObject

data class IntegrationUpdate(
    override val id: String,
    val integrationId: String,
    val identifier: String,
    val data: Map<String, Any>,
    val timestamp: Long
): Identifiable {
    fun toJson(): JSONObject {
        return JSONObject(
            mapOf(
                "id" to id,
                "integrationId" to integrationId,
                "identifier" to identifier,
                "data" to data,
                "timestamp" to timestamp
            )
        )
    }

    companion object {
        fun fromJson(jsonObject: JSONObject): IntegrationUpdate {
            Log.d("Perfice", "incoming" + jsonObject.toString())
            return IntegrationUpdate(
                id = jsonObject.getString("id"),
                integrationId = jsonObject.getString("integrationId"),
                identifier = jsonObject.getString("identifier"),
                data = deserializeJsonObject(jsonObject.getJSONObject("data")),
                timestamp = jsonObject.getLong("timestamp")
            )
        }
    }
}
