package dev.adoe.perfice

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.net.Uri
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.activity.result.ActivityResultLauncher
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.preferencesDataStore
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.TotalCaloriesBurnedRecord
import androidx.health.connect.client.time.TimeRangeFilter
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

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "settings")


@CapacitorPlugin(name = "Perfice")
class PerficePlugin : Plugin() {

    private lateinit var requestPermissions: ActivityResultLauncher<Set<String>>
    lateinit var updateStore: IntegrationUpdateDataStore
    lateinit var integrations: CustomDataStore<Integration>

    private var permissionCall: ((Boolean) -> Unit)? = null
    override fun load() {
        super.load()
        try {
            updateStore = IntegrationUpdateDataStore(context.dataStore)
            updateStore.load()

            integrations = CustomDataStore(context.dataStore, "integrations", IntegrationSerializer)
            integrations.load()
        } catch (e: Exception) {
            Log.e("Perfice", "Error loading data", e)
        }

        val requestPermissionActivityContract =
                PermissionController.createRequestPermissionResultContract()
        requestPermissions =
                activity.registerForActivityResult(requestPermissionActivityContract) { granted ->
                    if (granted.isNotEmpty()) {
                        permissionCall?.invoke(true)
                        startService()
                    } else {
                        permissionCall?.invoke(false)
                    }
                }

        // TODO: Start background service when permissions are granted

        checkPermissions(false) { granted ->
            if (!granted) return@checkPermissions

            startService()
        }
    }

    fun startService() {
        Log.d("Perfice", "Starting background service")

        val intent = Intent(context, BackgroundService::class.java)
        context.bindService(
                intent,
                object : ServiceConnection {
                    override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
                        val binder = service as BackgroundService.LocalBinder
                        val service = binder.getService()
                        service.integrationUpdates = updateStore
                        service.integrations = integrations
                    }

                    override fun onServiceDisconnected(name: ComponentName?) {}
                },
                Context.BIND_AUTO_CREATE
        )

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(intent)
        } else {
            context.startService(intent)
        }
    }

    @PluginMethod
    fun getUpdates(call: PluginCall) {
        val response = JSObject()

        response.put("updates", JSONArray(updateStore.getAll().map { it.toJson() }))
        updateStore.getAll().forEach { integrationUpdate ->
            Log.d("Perfice", "integrationUpdate: " + integrationUpdate.toJson().toString())
        }

        updateStore.clear()
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

        integrations.overwrite(list)
        call.resolve()
    }


    @PluginMethod
    fun fetchHistorical(call: PluginCall) {
        val integrationId = call.getString("id")
        if (integrationId == null) {
            call.reject("Invalid integration id")
            return
        }

        val integration = integrations.getById(integrationId)
        if(integration == null) {
            call.reject("Integration not found")
            return
        }

        val healthConnectClient = HealthConnectClient.getOrCreate(context)

        CoroutineScope(Dispatchers.IO).launch {
            extractRecordsAndCreateUpdates(
                healthConnectClient, updates = updateStore, integration, TimeRangeFilter.between(
                    LocalDateTime.now().minusYears(1),
                    LocalDateTime.now()
                )
            )

            call.resolve()
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
