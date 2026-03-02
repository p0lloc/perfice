package dev.adoe.perfice

import android.os.Build
import androidx.annotation.RequiresApi
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
import java.time.Instant
import kotlin.reflect.KClass

class NutritionRecordExtractor : RecordExtractor {

    override fun getType(): KClass<out Record> {
        return NutritionRecord::class
    }

    @RequiresApi(Build.VERSION_CODES.O)
    override fun extract(
        time: Instant,
        records: List<*>
    ): List<ExtractedRecord> {
        val nutrition = (records as List<NutritionRecord>)

        return nutrition.map { nutrition ->
            val name: String = nutrition.name ?: ""
            val carbs: Double = nutrition.totalCarbohydrate?.inGrams ?: 0.0
            val kcal: Double = nutrition.energy?.inKilocalories ?: 0.0
            val protein: Double = nutrition.protein?.inGrams ?: 0.0
            val fat: Double = nutrition.totalFat?.inGrams ?: 0.0
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
        }
    }

    override fun extractTime(record: Any): Instant {
        return (record as NutritionRecord).startTime
    }
}

class BloodPressureRecordExtractor : RecordExtractor {
    @RequiresApi(Build.VERSION_CODES.O)
    override fun extract(time: Instant, records: List<*>): List<ExtractedRecord> {
        val bloodPressure = (records as List<BloodPressureRecord>)

        return bloodPressure.map { bloodPressure ->
            ExtractedRecord(
                mapOf(
                    "systolic" to bloodPressure.systolic.inMillimetersOfMercury,
                    "diastolic" to bloodPressure.diastolic.inMillimetersOfMercury
                ),
                bloodPressure.time.toEpochMilli().toString(),
                time.toEpochMilli()
            )
        }
    }

    override fun extractTime(record: Any): Instant {
        return (record as BloodPressureRecord).time
    }

    override fun getType(): KClass<out Record> {
        return BloodPressureRecord::class
    }
}

class ExerciseSessionRecordExtractor : RecordExtractor {

    @RequiresApi(Build.VERSION_CODES.O)
    override fun extract(time: Instant, records: List<*>): List<ExtractedRecord> {
        val exerciseSession = (records as List<ExerciseSessionRecord>)
        return exerciseSession.map { exerciseSession ->
            val title = exerciseSession.title ?: ""
            ExtractedRecord(
                mapOf(
                    "title" to title,
                    "duration" to instantDurationInMinutes(exerciseSession.startTime, exerciseSession.endTime)
                ), // Duration in minutes
                exerciseSession.startTime.toEpochMilli().toString(),
                time.toEpochMilli()
            )
        }
    }

    override fun extractTime(record: Any): Instant {
        return (record as ExerciseSessionRecord).startTime
    }

    override fun getType(): KClass<out Record> {
        return ExerciseSessionRecord::class
    }
}

class BloodGlucoseRecordExtractor : RecordExtractor {

    @RequiresApi(Build.VERSION_CODES.O)
    override fun extract(time: Instant, records: List<*>): List<ExtractedRecord> {
        val bloodGlucose = (records as List<BloodGlucoseRecord>)
        return bloodGlucose.map { bloodGlucose ->
            ExtractedRecord(
                mapOf("bloodGlucose" to bloodGlucose.level.inMillimolesPerLiter),
                bloodGlucose.time.toEpochMilli().toString(),
                time.toEpochMilli()
            )
        }
    }
    override fun extractTime(record: Any): Instant {
        return (record as BloodGlucoseRecord).time
    }

    override fun getType(): KClass<out Record> {
        return BloodGlucoseRecord::class
    }
}

class HeightRecordExtractor : RecordExtractor {
    @RequiresApi(Build.VERSION_CODES.O)
    override fun extract(time: Instant, records: List<*>): List<ExtractedRecord> {
        val height = (records as List<HeightRecord>)
        return height.map { height ->
            ExtractedRecord(
                mapOf("height" to height.height.inMeters),
                height.time.toEpochMilli().toString(),
                time.toEpochMilli()
            )
        }
    }

    override fun extractTime(record: Any): Instant {
        return (record as HeightRecord).time
    }

    override fun getType(): KClass<out Record> {
        return HeightRecord::class
    }
}

class WeightRecordExtractor : RecordExtractor {
    @RequiresApi(Build.VERSION_CODES.O)
    override fun extract(time: Instant, records: List<*>): List<ExtractedRecord> {
        val weight = (records as List<WeightRecord>)
        return weight.map { weight ->
            ExtractedRecord(
                mapOf("weight" to weight.weight.inKilograms),
                weight.time.toEpochMilli().toString(),
                time.toEpochMilli()
            )
        }
    }

    override fun extractTime(record: Any): Instant {
        return (record as WeightRecord).time
    }

    override fun getType(): KClass<out Record> {
        return WeightRecord::class
    }
}

class SleepSessionRecordExtractor : RecordExtractor {
    @RequiresApi(Build.VERSION_CODES.O)
    override fun extract(time: Instant, records: List<*>): List<ExtractedRecord> {
        val sleepSession = (records as List<SleepSessionRecord>)
        return sleepSession.map { sleepSession ->
            ExtractedRecord(
                mapOf("duration" to instantDurationInMinutes(sleepSession.startTime, sleepSession.endTime)), // Duration in minutes
                sleepSession.startTime.toEpochMilli().toString(),
                time.toEpochMilli()
        )}
    }

    override fun extractTime(record: Any): Instant {
        return (record as SleepSessionRecord).startTime
    }

    override fun getType(): KClass<out Record> {
        return SleepSessionRecord::class
    }
}

class HydrationRecordExtractor : RecordExtractor {
    @RequiresApi(Build.VERSION_CODES.O)
    override fun extract(time: Instant, records: List<*>): List<ExtractedRecord> {
        val hydration = (records as List<HydrationRecord>)
        return hydration.map { hydration ->
            ExtractedRecord(
                mapOf("hydration" to hydration.volume.inMilliliters),
                hydration.startTime.toEpochMilli().toString(),
                time.toEpochMilli()
            )
        }
    }

    override fun extractTime(record: Any): Instant {
        return (record as HydrationRecord).startTime
    }

    override fun getType(): KClass<out Record> {
        return HydrationRecord::class
    }
}

class TotalCaloriesBurnedRecordExtractor : RecordExtractor {
    @RequiresApi(Build.VERSION_CODES.O)
    override fun extract(time: Instant, records: List<*>): List<ExtractedRecord> {
        val totalCaloriesBurned = (records as List<TotalCaloriesBurnedRecord>)
        return listOf(
            ExtractedRecord(
                mapOf("totalCaloriesBurned" to totalCaloriesBurned.sumOf { it.energy.inKilocalories }),
                dateFormatter.format(time),
                time.toEpochMilli()
            )
        )
    }

    override fun extractTime(record: Any): Instant {
        return (record as TotalCaloriesBurnedRecord).startTime
    }

    override fun getType(): KClass<out Record> {
        return TotalCaloriesBurnedRecord::class
    }
}

class StepsRecordExtractor : RecordExtractor {
    @RequiresApi(Build.VERSION_CODES.O)
    override fun extract(time: Instant, records: List<*>): List<ExtractedRecord> {
        val steps = (records as List<StepsRecord>)

        return listOf(
            ExtractedRecord(
                mapOf("steps" to steps.sumOf { it.count }),
                dateFormatter.format(time),
                time.toEpochMilli()
            )
        )
    }

    override fun extractTime(record: Any): Instant {
        return (record as StepsRecord).startTime
    }

    override fun getType(): KClass<out Record> {
        return StepsRecord::class
    }
}


class HeartRateRecordExtractor : RecordExtractor {

    override fun getType(): KClass<out Record> {
        return HeartRateRecord::class
    }

    @RequiresApi(Build.VERSION_CODES.O)
    override fun extract(
        time: Instant,
        records: List<*>
    ): List<ExtractedRecord> {
        val heartRate = (records as List<HeartRateRecord>)

        return listOf(
            ExtractedRecord(
                mapOf<String, Any>("heartRate" to heartRate.avgOf { record -> record.samples.avgOf { it.beatsPerMinute.toDouble() } }),
                dateFormatter.format(time),
                time.toEpochMilli()
            )
        )
    }

    override fun extractTime(record: Any): Instant {
        return (record as HeartRateRecord).startTime
    }
}

@RequiresApi(Build.VERSION_CODES.O)
fun instantDurationInMinutes(start: Instant, end: Instant): Double {
    return (end.toEpochMilli().toDouble() - start.toEpochMilli().toDouble()) / (1000 * 60)
}

fun <T> List<T>.avgOf(func: (T) -> Double): Double {
    if (this.isEmpty()) return 0.0
    return this.sumOf(func) / this.size
}
