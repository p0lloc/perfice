package dev.adoe.perfice

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.Binder
import android.os.Build
import android.os.IBinder
import androidx.annotation.RequiresApi
import androidx.core.app.NotificationCompat
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.time.TimeRangeFilter
import dev.adoe.perfice.data.Integration
import dev.adoe.perfice.store.CustomDataStore
import dev.adoe.perfice.store.IntegrationUpdateDataStore
import java.time.LocalDateTime
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

const val CHANNEL_ID: String = "BackgroundServiceChannel"


class BackgroundService : Service() {

    private val binder = LocalBinder()
    var integrationUpdates: IntegrationUpdateDataStore? = null
    var integrations: CustomDataStore<Integration>? = null

    inner class LocalBinder : Binder() {
        fun getService() = this@BackgroundService
    }

    override fun onBind(intent: Intent?): IBinder {
        return binder
    }

    override fun onCreate() {
        super.onCreate()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val serviceChannel =
                    NotificationChannel(
                            CHANNEL_ID,
                            "Perfice Background Service Channel",
                            NotificationManager.IMPORTANCE_LOW
                    )

            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(serviceChannel)
        }
    }


    @RequiresApi(Build.VERSION_CODES.O)
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val notification: Notification =
                NotificationCompat.Builder(this, CHANNEL_ID)
                        .setContentTitle("Perfice Background Task")
                        .setContentText("Running in background")
                        .setSmallIcon(android.R.drawable.ic_dialog_info)
                        .setOngoing(true)
                        .build()

        startForeground(1, notification)

        val context = this
        CoroutineScope(Dispatchers.IO).launch {
            val healthConnect = HealthConnectClient.getOrCreate(context)
            while (true) {
                try {
                    run(healthConnect)
                    Thread.sleep(10000) // simulate background work
                } catch (e: InterruptedException) {
                    e.printStackTrace()
                }
            }
        }

        return START_STICKY
    }

    @RequiresApi(Build.VERSION_CODES.O)
    suspend fun run(healthConnect: HealthConnectClient) {
        if (integrations == null) return
        for (integration in integrations!!.getAll()) {
            extractRecordsAndCreateUpdates(healthConnect, integrationUpdates!!, integration, TimeRangeFilter.between(
                LocalDateTime.now().minusDays(1),
                LocalDateTime.now()
            ))
        }
    }

}
