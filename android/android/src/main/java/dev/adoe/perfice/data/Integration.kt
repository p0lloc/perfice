package dev.adoe.perfice.data

import dev.adoe.perfice.store.Identifiable
import dev.adoe.perfice.store.JsonSerializer
import dev.adoe.perfice.store.deserializeJsonObject
import org.json.JSONObject

data class Integration(
        override val id: String,
        val integrationType: String,
        val entityType: String,
        val formId: String,
        val fields: Map<String, String>,
        val options: Map<String, Any>
) : Identifiable

object IntegrationSerializer : JsonSerializer<Integration> {
    override fun toJson(value: Integration): JSONObject {
        return JSONObject(
                mapOf(
                        "id" to value.id,
                        "integrationType" to value.integrationType,
                        "entityType" to value.entityType,
                        "formId" to value.formId,
                        "fields" to value.fields,
                        "options" to value.options
                )
        )
    }

    override fun fromJson(obj: JSONObject): Integration {
        return Integration(
                id = obj.getString("id"),
                integrationType = obj.getString("integrationType"),
                entityType = obj.getString("entityType"),
                formId = obj.getString("formId"),
                fields = deserializeJsonObject(obj.getJSONObject("fields")),
                options = deserializeJsonObject(obj.getJSONObject("options"))
        )
    }
}
