package com.forgetmenot.app.data

import android.content.Context
import android.content.SharedPreferences
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import java.time.LocalDate
import java.time.format.DateTimeFormatter

class TopicRepository(context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences("forgetmenot_prefs", Context.MODE_PRIVATE)
    private val gson = Gson()
    private val KEY_TOPICS = "saved_topics_list"

    fun getTopics(): List<Topic> {
        val json = prefs.getString(KEY_TOPICS, null)
        return if (json != null) {
            try {
                val type = object : TypeToken<List<Topic>>() {}.type
                gson.fromJson(json, type) ?: seedDefaultTopics()
            } catch (e: Exception) {
                seedDefaultTopics()
            }
        } else {
            val defaults = seedDefaultTopics()
            saveTopics(defaults)
            defaults
        }
    }

    fun saveTopics(topics: List<Topic>) {
        val json = gson.toJson(topics)
        prefs.edit().putString(KEY_TOPICS, json).apply()
    }

    fun addOrUpdateTopic(topic: Topic) {
        val current = getTopics().toMutableList()
        val index = current.indexOfFirst { it.id == topic.id }
        if (index >= 0) {
            current[index] = topic
        } else {
            current.add(0, topic)
        }
        saveTopics(current)
    }

    fun deleteTopic(topicId: String) {
        val current = getTopics().filter { it.id != topicId }
        saveTopics(current)
    }

    fun snoozeMilestone(topicId: String, milestoneId: String, days: Int = 1) {
        val current = getTopics().map { topic ->
            if (topic.id == topicId) {
                topic.copy(
                    milestones = SequenceEngine.snoozeMilestone(topic.milestones, milestoneId, days)
                )
            } else {
                topic
            }
        }
        saveTopics(current)
    }

    fun completeMilestone(
        topicId: String,
        milestoneId: String,
        notes: String,
        difficulty: String
    ) {
        val nowStr = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)
        val current = getTopics().map { topic ->
            if (topic.id == topicId) {
                val updatedMilestones = topic.milestones.map { m ->
                    if (m.id == milestoneId) {
                        m.copy(
                            completedAt = nowStr,
                            notes = notes,
                            difficulty = difficulty
                        )
                    } else {
                        m
                    }
                }
                topic.copy(milestones = updatedMilestones)
            } else {
                topic
            }
        }
        saveTopics(current)
    }

    fun exportJson(): String {
        return gson.toJson(getTopics())
    }

    fun importJson(json: String): Boolean {
        return try {
            val type = object : TypeToken<List<Topic>>() {}.type
            val imported: List<Topic>? = gson.fromJson(json, type)
            if (!imported.isNullOrEmpty()) {
                saveTopics(imported)
                true
            } else {
                false
            }
        } catch (e: Exception) {
            false
        }
    }

    private fun seedDefaultTopics(): List<Topic> {
        val today = LocalDate.now()
        val dMinus3 = today.minusDays(3).format(DateTimeFormatter.ISO_LOCAL_DATE)
        val dMinus1 = today.minusDays(1).format(DateTimeFormatter.ISO_LOCAL_DATE)
        val dToday = today.format(DateTimeFormatter.ISO_LOCAL_DATE)

        val parametricMilestones = SequenceEngine.generateMilestones(dMinus3, SequenceType.FIBONACCI).toMutableList()
        if (parametricMilestones.isNotEmpty()) {
            parametricMilestones[0] = parametricMilestones[0].copy(
                completedAt = dMinus2(today),
                notes = "Practiced Voronoi panelization and curve attractors in Grasshopper.",
                difficulty = "medium"
            )
        }

        return listOf(
            Topic(
                name = "Parametric Design (Rhino & Grasshopper)",
                category = "Design & 3D",
                description = "Master Voronoi patterns, attractor curves, and generative algorithms.",
                startDate = dMinus3,
                reminderTime = "10:00",
                sequenceType = SequenceType.FIBONACCI,
                colorHex = "#6366F1",
                milestones = parametricMilestones
            ),
            Topic(
                name = "Android 16 Jetpack Compose & Kotlin",
                category = "Coding",
                description = "Deep dive into state hoisting, coroutine flows, and Material 3 design systems.",
                startDate = dMinus1,
                reminderTime = "14:30",
                sequenceType = SequenceType.FIBONACCI,
                colorHex = "#06B6D4",
                milestones = SequenceEngine.generateMilestones(dMinus1, SequenceType.FIBONACCI)
            ),
            Topic(
                name = "Studio Clean & Workspace Habit",
                category = "Habits & Living",
                description = "Organize tool drawers, cable routing, and hardware storage containers.",
                startDate = dToday,
                reminderTime = "18:00",
                sequenceType = SequenceType.LEITNER_SM2,
                colorHex = "#10B981",
                milestones = SequenceEngine.generateMilestones(dToday, SequenceType.LEITNER_SM2)
            )
        )
    }

    private fun dMinus2(today: LocalDate): String {
        return today.minusDays(2).format(DateTimeFormatter.ISO_LOCAL_DATE)
    }
}
