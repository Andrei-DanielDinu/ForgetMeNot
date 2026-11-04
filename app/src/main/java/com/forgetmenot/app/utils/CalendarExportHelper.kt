package com.forgetmenot.app.utils

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.core.content.FileProvider
import com.forgetmenot.app.data.ReviewMilestone
import com.forgetmenot.app.data.Topic
import java.io.File
import java.io.FileOutputStream
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

object CalendarExportHelper {

    /**
     * Build Google Calendar URL to directly add a recap event with prefilled title, description, time and date
     */
    fun getGoogleCalendarUrl(topic: Topic, milestone: ReviewMilestone): String {
        val dateFormatted = milestone.effectiveDate.replace("-", "")
        val reminderTime = topic.reminderTime.ifBlank { "09:00" }
        val parts = reminderTime.split(":")
        val hours = parts.getOrNull(0)?.padStart(2, '0') ?: "09"
        val minutes = parts.getOrNull(1)?.padStart(2, '0') ?: "00"

        val startDateTime = "${dateFormatted}T${hours}${minutes}00"

        // 30 min duration
        val totalMins = (minutes.toIntOrNull() ?: 0) + 30
        val endHours = (hours.toIntOrNull() ?: 9) + totalMins / 60
        val endMinutes = totalMins % 60
        val endDateTime = "${dateFormatted}T${endHours.toString().padStart(2, '0')}${endMinutes.toString().padStart(2, '0')}00"

        val title = URLEncoder.encode("🧠 Recap: ${topic.name} (Stage ${milestone.stageIndex})", StandardCharsets.UTF_8.toString())
        val details = URLEncoder.encode(
            "Spaced repetition review for ${topic.name} (Day +${milestone.intervalFromStart}).\n\n" +
            "Goal / Instructions: ${topic.description.ifBlank { "Consolidate exercises and prevent forgetting." }}\n" +
            (if (!milestone.notes.isNullOrBlank()) "\nPrevious notes: ${milestone.notes}" else ""),
            StandardCharsets.UTF_8.toString()
        )

        return "https://calendar.google.com/calendar/render?action=TEMPLATE&text=$title&dates=$startDateTime/$endDateTime&details=$details"
    }

    /**
     * Open Google Calendar in app or browser
     */
    fun openGoogleCalendar(context: Context, topic: Topic, milestone: ReviewMilestone) {
        val url = getGoogleCalendarUrl(topic, milestone)
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(intent)
    }

    /**
     * Generates RFC 5545 iCalendar content for a topic
     */
    fun generateTopicICS(topic: Topic): String {
        val sb = StringBuilder()
        sb.append("BEGIN:VCALENDAR\r\n")
        sb.append("VERSION:2.0\r\n")
        sb.append("PRODID:-//ForgetMeNot//Android Spaced Repetition//EN\r\n")
        sb.append("CALSCALE:GREGORIAN\r\n")
        sb.append("METHOD:PUBLISH\r\n")
        sb.append("X-WR-CALNAME:ForgetMeNot - ${topic.name}\r\n")

        val reminderTime = topic.reminderTime.ifBlank { "09:00" }
        val parts = reminderTime.split(":")
        val hours = parts.getOrNull(0)?.padStart(2, '0') ?: "09"
        val minutes = parts.getOrNull(1)?.padStart(2, '0') ?: "00"

        topic.milestones.forEach { m ->
            val dateFormatted = m.effectiveDate.replace("-", "")
            val startDateTime = "${dateFormatted}T${hours}${minutes}00"
            val totalMins = (minutes.toIntOrNull() ?: 0) + 30
            val endHours = (hours.toIntOrNull() ?: 9) + totalMins / 60
            val endMinutes = totalMins % 60
            val endDateTime = "${dateFormatted}T${endHours.toString().padStart(2, '0')}${endMinutes.toString().padStart(2, '0')}00"

            val summary = "🧠 Recap: ${topic.name} (Stage ${m.stageIndex} • Day +${m.intervalFromStart})"
            val desc = "Recap session for ${topic.name}\\n" +
                    "Sequence: ${topic.sequenceType.displayName}\\n" +
                    "Goal: ${topic.description}\\n" +
                    (if (!m.notes.isNullOrBlank()) "Notes: ${m.notes}\\n" else "")

            sb.append("BEGIN:VEVENT\r\n")
            sb.append("UID:${m.id}@forgetmenot.app\r\n")
            sb.append("DTSTART:$startDateTime\r\n")
            sb.append("DTEND:$endDateTime\r\n")
            sb.append("SUMMARY:$summary\r\n")
            sb.append("DESCRIPTION:$desc\r\n")
            sb.append("CATEGORIES:${topic.category}\r\n")
            sb.append("STATUS:CONFIRMED\r\n")
            sb.append("BEGIN:VALARM\r\n")
            sb.append("TRIGGER:-PT15M\r\n")
            sb.append("ACTION:DISPLAY\r\n")
            sb.append("DESCRIPTION:Reminder: Time to recap ${topic.name}!\r\n")
            sb.append("END:VALARM\r\n")
            sb.append("END:VEVENT\r\n")
        }

        sb.append("END:VCALENDAR\r\n")
        return sb.toString()
    }

    /**
     * Share or save .ics file to Android Calendar apps or file manager
     */
    fun shareICSFile(context: Context, topic: Topic) {
        try {
            val icsContent = generateTopicICS(topic)
            val fileName = "${topic.name.replace("\\s+".toRegex(), "_")}_schedule.ics"
            val cachePath = File(context.cacheDir, "calendar")
            cachePath.mkdirs()
            val file = File(cachePath, fileName)
            FileOutputStream(file).use { it.write(icsContent.toByteArray(StandardCharsets.UTF_8)) }

            val uri = FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                file
            )

            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                type = "text/calendar"
                putExtra(Intent.EXTRA_STREAM, uri)
                putExtra(Intent.EXTRA_SUBJECT, "Calendar for ${topic.name}")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(Intent.createChooser(shareIntent, "Open or Save Calendar File"))
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
