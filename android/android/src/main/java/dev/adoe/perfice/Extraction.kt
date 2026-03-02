package dev.adoe.perfice

import android.os.Build
import android.util.Log
import androidx.annotation.RequiresApi
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.*
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import dev.adoe.perfice.data.Integration
import dev.adoe.perfice.data.IntegrationUpdate
import dev.adoe.perfice.store.IntegrationUpdateDataStore
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit
import java.util.*
import kotlin.reflect.KClass


interface RecordExtractor {
    fun getType(): KClass<out Record>
    fun extract(time: Instant, records: List<*>): List<ExtractedRecord>
    fun extractTime(record: Any): Instant
}

data class ExtractedRecord(val data: Map<String, Any>, val identifier: String, val timestamp: Long)

@RequiresApi(Build.VERSION_CODES.O)
val dateFormatter: DateTimeFormatter = DateTimeFormatter
    .ofPattern("yyyy-MM-dd")
    .withZone(ZoneId.systemDefault())


val RECORD_EXTRACTORS: Map<String, RecordExtractor> =
    mapOf(
        "steps" to StepsRecordExtractor(),
        "heartRate" to HeartRateRecordExtractor(),
        "totalCaloriesBurned" to TotalCaloriesBurnedRecordExtractor(),
        "sleep" to SleepSessionRecordExtractor(),
        "exercise" to ExerciseSessionRecordExtractor(),
        "bloodGlucose" to BloodGlucoseRecordExtractor(),
        "height" to HeightRecordExtractor(),
        "weight" to WeightRecordExtractor(),
        "hydration" to HydrationRecordExtractor(),
        "bloodPressure" to BloodPressureRecordExtractor(),
        "nutrition" to NutritionRecordExtractor()
    )


val RECORD_PERMISSIONS =
    RECORD_EXTRACTORS.values.map { HealthPermission.getReadPermission(it.getType()) }.toSet()

@RequiresApi(Build.VERSION_CODES.O)
suspend fun extractRecordsAndCreateUpdates(
    healthConnect: HealthConnectClient,
    updates: IntegrationUpdateDataStore,
    integration: Integration,
    timeRangeFilter: TimeRangeFilter
): List<IntegrationUpdate> {
    try {
        val extractor = RECORD_EXTRACTORS[integration.entityType] ?: return emptyList()
        val response =
            healthConnect.readRecords(
                ReadRecordsRequest(
                    extractor.getType(),
                    timeRangeFilter = timeRangeFilter
                )
            )

        val extracted = response.records
            .groupBy { (extractor.extractTime(it)).truncatedTo(ChronoUnit.DAYS) }
            .mapValues { (key, value) -> extractor.extract(key, value) }
            .flatMap { (_, value) -> value }

        val allUpdates = mutableListOf<IntegrationUpdate>()

        //Log.d("Perfice", "extracted" + extracted.size + " records")

        extracted.forEach { extractedRecord ->
            val existing =
                updates.getUpdateByIntegrationIdAndIdentifier(
                    integration.id,
                    extractedRecord.identifier
                )
            val mapped = mapResponse(integration.fields, extractedRecord.data)
            if (existing == null) {
                val update = IntegrationUpdate(
                        UUID.randomUUID().toString(),
                        integration.id,
                        extractedRecord.identifier,
                        mapped,
                        extractedRecord.timestamp
                    )

                updates.add(update)
                allUpdates.add(update)
            } else {
                val updated =
                    IntegrationUpdate(
                        existing.id,
                        existing.integrationId,
                        existing.identifier,
                        mapped,
                        extractedRecord.timestamp
                    )

                updates.update(updated)
                allUpdates.add(updated)
            }
        }

        updates.save()
        return allUpdates
    } catch (e: Exception) {
        Log.e("Perfice", "Error extracting records", e)
    }

    return emptyList()
}

private fun mapResponse(fields: Map<String, String>, data: Map<String, Any>): Map<String, Any> {
    val result = mutableMapOf<String, Any>()
    for (field in fields) {
        val data = data[field.key] ?: continue
        result[field.value] = data
    }

    return result
}
