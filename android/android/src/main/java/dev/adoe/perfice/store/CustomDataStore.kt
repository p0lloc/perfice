package dev.adoe.perfice.store

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit

import androidx.datastore.preferences.core.stringPreferencesKey
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.runBlocking
import org.json.JSONArray
import org.json.JSONObject

interface JsonSerializer<T> {
    fun toJson(value: T): JSONObject
    fun fromJson(obj: JSONObject): T
}

interface Identifiable {
    val id: String
}

open class CustomDataStore<T : Identifiable>(
    private val dataStore: DataStore<Preferences>,
    keyName: String,
    private val serializer: JsonSerializer<T>
) {

    private val key = stringPreferencesKey(keyName)
    private val items: MutableList<T> = mutableListOf()

    fun load() {
        val loadedItems = loadItems()
        for (i in 0 until loadedItems.length()) {
            items.add(serializer.fromJson(loadedItems.getJSONObject(i)))
        }
    }

    fun add(item: T) {
        items.add(item)
    }

    fun addAndSave(item: T) {
        add(item)
        save()
    }

    fun getById(id: String): T? {
        return items.find { it.id == id }
    }

    fun update(item: T) {
        val index = items.indexOfFirst { it.id == item.id }
        if(index != -1) {
            items[index] = item
        }
    }

    fun updateAndSave(item: T) {
        update(item)
        save()
    }

    fun getAll(): List<T> = items

    fun clear() {
        items.clear()
        save()
    }

    fun save() {
        val jsonArray = JSONArray()
        for (item in items) {
            jsonArray.put(serializer.toJson(item))
        }
        runBlocking(Dispatchers.IO) {
            dataStore.edit { preferences ->
                preferences[key] = jsonArray.toString()
            }
        }
    }

    private fun loadItems(): JSONArray {
        val flow: Flow<JSONArray> = dataStore.data
            .map { preferences ->
                if (preferences.contains(key)) JSONArray(preferences[key]) else JSONArray()
            }

        return runBlocking(Dispatchers.IO) {
            flow.first()
        }
    }

    fun overwrite(list: List<T>) {
        items.clear()
        items.addAll(list)
        save()
    }

}

fun deserializeJsonArray(jsonArray: JSONArray): List<Any> {
    val result = mutableListOf<Any>()
    for (i in 0 until jsonArray.length()) {
        val value = jsonArray.get(i)
        var deserialized = value
        if (value is JSONObject) {
            deserialized = deserializeJsonObject<Any>(value)
        } else if(value is JSONArray) {
            deserialized = deserializeJsonArray(value)
        }
        result.add(deserialized)
    }
    return result
}

fun <T> deserializeJsonObject(jsonObject: JSONObject): Map<String, T> {
    val result = mutableMapOf<String, T>()
    jsonObject.keys().forEach { key ->
        val value = jsonObject.get(key)
        var deserialized: Any = value
        if (value is JSONObject) {
            deserialized = deserializeJsonObject<T>(value)
        } else if(value is JSONArray) {
            deserialized = deserializeJsonArray(value)
        }

        result[key] = deserialized as T
    }

    return result
}
