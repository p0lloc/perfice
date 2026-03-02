package dev.adoe.perfice

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.util.Log
import androidx.activity.result.ActivityResultLauncher
import androidx.annotation.RequiresApi
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.preferencesDataStore
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.time.TimeRangeFilter
import androidx.work.*
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import dev.adoe.perfice.data.Integration
import dev.adoe.perfice.data.IntegrationSerializer
import dev.adoe.perfice.store.CustomDataStore
import dev.adoe.perfice.store.IntegrationUpdateDataStore
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.json.JSONArray
import java.time.LocalDateTime
import java.util.concurrent.TimeUnit

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "settings")

// These variables must be shared because we cannot instantiate the worker with them.
// Defining a custom worker factory requires access to "Application" which is unavailable in Capacitor.
var integrationUpdates: IntegrationUpdateDataStore? = null
var integrations: CustomDataStore<Integration>? = null

class ScheduleWorker(
    private val appContext: Context, workerParams: WorkerParameters
) :
    CoroutineWorker(appContext, workerParams) {

    @RequiresApi(Build.VERSION_CODES.O)
    override suspend fun doWork(): Result {
        val healthConnect = HealthConnectClient.getOrCreate(appContext)
        if (healthConnect.permissionController.getGrantedPermissions().isEmpty()) return Result.success()

        for (integration in integrations!!.getAll()) {
            extractRecordsAndCreateUpdates(
                healthConnect, integrationUpdates!!, integration, TimeRangeFilter.between(
                    LocalDateTime.now().minusDays(1),
                    LocalDateTime.now()
                )
            )
        }

        return Result.success()
    }
}


@CapacitorPlugin(name = "Perfice")
class PerficePlugin : Plugin() {

    private lateinit var requestPermissions: ActivityResultLauncher<Set<String>>

    private var permissionCall: ((Boolean) -> Unit)? = null
    override fun load() {
        super.load()
        try {
            integrationUpdates = IntegrationUpdateDataStore(context.dataStore)
            integrationUpdates!!.load()

            integrations = CustomDataStore(context.dataStore, "integrations", IntegrationSerializer)
            integrations!!.load()
        } catch (e: Exception) {
            Log.e("Perfice", "Error loading data", e)
        }

        WorkManager.getInstance(context).enqueueUniquePeriodicWork(
            "read_health_connect",
            ExistingPeriodicWorkPolicy.REPLACE,
            PeriodicWorkRequestBuilder<ScheduleWorker>(
                15, TimeUnit.MINUTES
            ).build()
        )

        val requestPermissionActivityContract =
            PermissionController.createRequestPermissionResultContract()
        requestPermissions =
            activity.registerForActivityResult(requestPermissionActivityContract) { granted ->
                if (granted.isNotEmpty()) {
                    permissionCall?.invoke(true)
                } else {
                    permissionCall?.invoke(false)
                }
            }
    }

    @PluginMethod
    fun getUpdates(call: PluginCall) {
        if(integrationUpdates == null) return
        val response = JSObject()

        response.put("updates", JSONArray(integrationUpdates!!.getAll().map { it.toJson() }))
        integrationUpdates!!.clear()
        call.resolve(response)
    }

    @PluginMethod
    fun syncIntegrations(call: PluginCall) {
        val array = call.getArray("integrations")

        val list = mutableListOf<Integration>()
        for (i in 0 until array.length()) {
            val integration = array.getJSONObject(i)
            list.add(IntegrationSerializer.fromJson(integration))
        }

        integrations!!.overwrite(list)
        call.resolve()
    }

    @RequiresApi(Build.VERSION_CODES.O)
    @PluginMethod
    fun fetchHistorical(call: PluginCall) {
        val integrationId = call.getString("id")
        if (integrationId == null) {
            call.reject("Invalid integration id")
            return
        }

        val integration = integrations!!.getById(integrationId)
        if (integration == null) {
            call.reject("Integration not found")
            return
        }

        val healthConnectClient = HealthConnectClient.getOrCreate(context)

        CoroutineScope(Dispatchers.IO).launch {
            val results = extractRecordsAndCreateUpdates(
                healthConnectClient, updates = integrationUpdates!!, integration, TimeRangeFilter.between(
                    LocalDateTime.now().minusYears(1),
                    LocalDateTime.now()
                )
            ).sortedBy { it.timestamp }

            val responseObject = JSObject()
            responseObject.put("oldest", if (results.isNotEmpty()) results[0].timestamp else 0)
            responseObject.put("count", results.size)
            call.resolve(responseObject)
        }
    }

    @PluginMethod
    fun promptPermissions(call: PluginCall) {
        checkPermissions(true) { granted ->
            if (granted) {
                val responseObject = JSObject()
                responseObject.put("result", true)
                call.resolve(responseObject)
            } else {
                call.reject("Not granted")
            }
        }
    }

    private fun checkPermissions(request: Boolean, callback: (Boolean) -> Unit) {
        val providerPackageName = "com.google.android.apps.healthdata"
        val availabilityStatus = HealthConnectClient.getSdkStatus(context, providerPackageName)
        if (availabilityStatus == HealthConnectClient.SDK_UNAVAILABLE) {
            callback(false)
            return
        }

        if (availabilityStatus == HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) {
            val uriString =
                "market://details?id=$providerPackageName&url=healthconnect%3A%2F%2Fonboarding"
            context.startActivity(
                Intent(Intent.ACTION_VIEW).apply {
                    setPackage("com.android.vending")
                    data = Uri.parse(uriString)
                    putExtra("overlay", true)
                    putExtra("callerId", context.packageName)
                }
            )
            return
        }

        val healthConnectClient = HealthConnectClient.getOrCreate(context)
        CoroutineScope(Dispatchers.IO).launch {
            val granted = healthConnectClient.permissionController.getGrantedPermissions()
            if (granted.isNotEmpty()) {
                callback(true)
            } else if (request) {
                permissionCall = callback
                requestPermissions.launch(RECORD_PERMISSIONS)
            }
        }
    }
}
