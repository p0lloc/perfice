package dev.adoe.perfice

import android.util.Log
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.BloodGlucoseRecord
import androidx.health.connect.client.records.BloodPressureRecord
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.HeightRecord
import androidx.health.connect.client.records.HydrationRecord
import androidx.health.connect.client.records.NutritionRecord
import androidx.health.connect.client.records.Record
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.TotalCaloriesBurnedRecord
import androidx.health.connect.client.records.WeightRecord
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import dev.adoe.perfice.data.Integration
import dev.adoe.perfice.data.IntegrationUpdate
import dev.adoe.perfice.store.IntegrationUpdateDataStore
import java.time.Instant

import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.UUID
import kotlin.reflect.KClass

interface RecordExtractor {
    fun extract(record: Any): List<ExtractedRecord>
    fun getType(): KClass<out Record>
}

data class ExtractedRecord(val data: Map<String, Any>, val identifier: String, val timestamp: Long)

val dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd").withZone(ZoneId.systemDefault())


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

fun instantDurationInMinutes(start: Instant, end: Instant): Double {
    return (end.toEpochMilli().toDouble() - start.toEpochMilli().toDouble()) / (1000 * 60)
}

class NutritionRecordExtractor : RecordExtractor {
    override fun extract(record: Any): List<ExtractedRecord> {
        val nutrition = (record as NutritionRecord)

        val name: String = nutrition.name ?: ""
        val carbs: Double = nutrition.totalCarbohydrate?.inGrams ?: 0.0
        val kcal: Double = nutrition.energy?.inKilocalories ?: 0.0
        val protein: Double = nutrition.protein?.inGrams ?: 0.0
        val fat: Double = nutrition.totalFat?.inGrams ?: 0.0
        return listOf(
            ExtractedRecord(
                mapOf(
                    "name" to name,
                    "carbs" to carbs,
                    "calories" to kcal,
                    "protein" to protein,
                    "fat" to fat
                ),
                nutrition.startTime.toEpochMilli().toString(),
                nutrition.endTime.toEpochMilli()
            )
        )
    }

    override fun getType(): KClass<out Record> {
        return NutritionRecord::class
    }
}

class BloodPressureRecordExtractor : RecordExtractor {
    override fun extract(record: Any): List<ExtractedRecord> {
        val bloodPressure = (record as BloodPressureRecord)

        return listOf(
            ExtractedRecord(
                mapOf(
                    "systolic" to bloodPressure.systolic.inMillimetersOfMercury,
                    "diastolic" to bloodPressure.diastolic.inMillimetersOfMercury
                ),
                bloodPressure.time.toEpochMilli().toString(),
                bloodPressure.time.toEpochMilli()
            )
        )
    }

    override fun getType(): KClass<out Record> {
        return BloodPressureRecord::class
    }
}

class ExerciseSessionRecordExtractor : RecordExtractor {
    override fun extract(record: Any): List<ExtractedRecord> {
        val exerciseSession = (record as ExerciseSessionRecord)
        val title = exerciseSession.title ?: ""

        return listOf(
            ExtractedRecord(
                mapOf(
                    "title" to title,
                    "duration" to instantDurationInMinutes(exerciseSession.startTime, exerciseSession.endTime)
                ), // Duration in minutes
                exerciseSession.startTime.toEpochMilli().toString(),
                exerciseSession.startTime.toEpochMilli()
            )
        )
    }

    override fun getType(): KClass<out Record> {
        return ExerciseSessionRecord::class
    }
}

class BloodGlucoseRecordExtractor : RecordExtractor {
    override fun extract(record: Any): List<ExtractedRecord> {
        val bloodGlucose = (record as BloodGlucoseRecord)

        return listOf(
            ExtractedRecord(
                mapOf("bloodGlucose" to bloodGlucose.level.inMillimolesPerLiter),
                bloodGlucose.time.toEpochMilli().toString(),
                bloodGlucose.time.toEpochMilli()
            )
        )
    }

    override fun getType(): KClass<out Record> {
        return BloodGlucoseRecord::class
    }
}

class HeightRecordExtractor : RecordExtractor {
    override fun extract(record: Any): List<ExtractedRecord> {
        val height = (record as HeightRecord)

        return listOf(
            ExtractedRecord(
                mapOf("height" to height.height.inMeters),
                height.time.toEpochMilli().toString(),
                height.time.toEpochMilli()
            )
        )
    }

    override fun getType(): KClass<out Record> {
        return HeightRecord::class
    }
}

class WeightRecordExtractor : RecordExtractor {
    override fun extract(record: Any): List<ExtractedRecord> {
        val weight = (record as WeightRecord)

        return listOf(
            ExtractedRecord(
                mapOf("weight" to weight.weight.inKilograms),
                weight.time.toEpochMilli().toString(),
                weight.time.toEpochMilli()
            )
        )
    }

    override fun getType(): KClass<out Record> {
        return WeightRecord::class
    }
}

class SleepSessionRecordExtractor : RecordExtractor {
    override fun extract(record: Any): List<ExtractedRecord> {
        val sleepSession = (record as SleepSessionRecord)
        val duration = sleepSession.endTime.toEpochMilli() - sleepSession.startTime.toEpochMilli()

        return listOf(
            ExtractedRecord(
                mapOf("duration" to duration / (1000 * 60)), // Duration in minutes
                dateFormatter.format(sleepSession.endTime),
                sleepSession.endTime.toEpochMilli()
            )
        )
    }

    override fun getType(): KClass<out Record> {
        return SleepSessionRecord::class
    }
}

class HydrationRecordExtractor : RecordExtractor {
    override fun extract(record: Any): List<ExtractedRecord> {
        val hydration = (record as HydrationRecord)

        return listOf(
            ExtractedRecord(
                mapOf("hydration" to hydration.volume.inMilliliters),
                hydration.startTime.toEpochMilli().toString(),
                hydration.startTime.toEpochMilli()
            )
        )
    }

    override fun getType(): KClass<out Record> {
        return HydrationRecord::class
    }
}

class TotalCaloriesBurnedRecordExtractor : RecordExtractor {
    override fun extract(record: Any): List<ExtractedRecord> {
        val totalCaloriesBurned = (record as TotalCaloriesBurnedRecord)

        return listOf(
            ExtractedRecord(
                mapOf("totalCaloriesBurned" to totalCaloriesBurned.energy.inKilocalories),
                totalCaloriesBurned.startTime.toEpochMilli().toString(),
                totalCaloriesBurned.startTime.toEpochMilli()
            )
        )
    }

    override fun getType(): KClass<out Record> {
        return TotalCaloriesBurnedRecord::class
    }
}

class StepsRecordExtractor : RecordExtractor {
    override fun extract(record: Any): List<ExtractedRecord> {
        val steps = (record as StepsRecord)

        return listOf(
            ExtractedRecord(
                mapOf("steps" to steps.count),
                dateFormatter.format(steps.startTime),
                steps.startTime.toEpochMilli()
            )
        )
    }

    override fun getType(): KClass<out Record> {
        return StepsRecord::class
    }
}

class HeartRateRecordExtractor : RecordExtractor {
    override fun extract(record: Any): List<ExtractedRecord> {
        return (record as HeartRateRecord)
            .samples
            .map { sample ->
                ExtractedRecord(
                    mapOf<String, Any>("heartRate" to sample.beatsPerMinute),
                    dateFormatter.format(sample.time),
                    sample.time.toEpochMilli()
                )
            }
            .toList()
    }

    override fun getType(): KClass<out Record> {
        return HeartRateRecord::class
    }
}

suspend fun extractRecordsAndCreateUpdates(
    healthConnect: HealthConnectClient,
    updates: IntegrationUpdateDataStore,
    integration: Integration,
    timeRangeFilter: TimeRangeFilter
) {
    try {
        val extractor = RECORD_EXTRACTORS[integration.entityType] ?: return

        val response =
            healthConnect.readRecords(
                ReadRecordsRequest(
                    extractor.getType(),
                    timeRangeFilter = timeRangeFilter
                )
            )

        val extracted = response.records.flatMap { record -> extractor.extract(record) }

        Log.d("Perfice", "extracted" + extracted.size + " records")

        extracted.forEach { extractedRecord ->
            val existing =
                updates.getUpdateByIntegrationIdAndIdentifier(
                    integration.id,
                    extractedRecord.identifier
                )
            val mapped = mapResponse(integration.fields, extractedRecord.data)
            if (existing == null) {
                updates.add(
                    IntegrationUpdate(
                        UUID.randomUUID().toString(),
                        integration.id,
                        extractedRecord.identifier,
                        mapped,
                        extractedRecord.timestamp
                    )
                )
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
            }
        }

        updates.save()
    } catch (e: Exception) {
        Log.e("Perfice", "Error extracting records", e)
    }
}

private fun mapResponse(fields: Map<String, String>, data: Map<String, Any>): Map<String, Any> {
    val result = mutableMapOf<String, Any>()
    for (field in fields) {
        val data = data[field.key] ?: continue
        result[field.value] = data
    }

    return result
}
