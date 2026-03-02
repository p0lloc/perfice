package dev.adoe.perfice.store

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import dev.adoe.perfice.data.IntegrationUpdate
import org.json.JSONObject

object IntegrationUpdateSerializer : JsonSerializer<IntegrationUpdate> {
    override fun toJson(value: IntegrationUpdate): JSONObject {
        return JSONObject(
            mapOf(
                "id" to value.id,
                "integrationId" to value.integrationId,
                "identifier" to value.identifier,
                "data" to value.data,
                "timestamp" to value.timestamp
            )
        )
    }

    override fun fromJson(obj: JSONObject): IntegrationUpdate {
        return IntegrationUpdate.fromJson(obj)
    }
}

class IntegrationUpdateDataStore(
    dataStore: DataStore<Preferences>
) : CustomDataStore<IntegrationUpdate>(dataStore, "integration_updates", IntegrationUpdateSerializer) {

    fun getUpdateByIntegrationIdAndIdentifier(integrationId: String, identifier: String): IntegrationUpdate? {
        return getAll().find { it.integrationId == integrationId && it.identifier == identifier }
    }
}
