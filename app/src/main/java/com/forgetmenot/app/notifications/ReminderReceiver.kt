package com.forgetmenot.app.notifications

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class ReminderReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val topicName = intent.getStringExtra("TOPIC_NAME") ?: "Learning Topic"
        val stageIndex = intent.getIntExtra("STAGE_INDEX", 1)
        val description = intent.getStringExtra("DESCRIPTION")

        NotificationHelper.showReminderNotification(context, topicName, stageIndex, description)
    }
}
