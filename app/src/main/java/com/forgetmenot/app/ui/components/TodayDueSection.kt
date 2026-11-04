package com.forgetmenot.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Snooze
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.forgetmenot.app.data.ReviewMilestone
import com.forgetmenot.app.data.Topic
import com.forgetmenot.app.ui.theme.*
import com.forgetmenot.app.utils.CalendarExportHelper
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit

data class DueItem(
    val topic: Topic,
    val milestone: ReviewMilestone,
    val daysDiff: Long
)

fun parseHexColor(hex: String?, fallback: Color = PrimaryIndigo): Color {
    if (hex.isNullOrBlank()) return fallback
    return try {
        val clean = hex.removePrefix("#")
        val colorInt = clean.toLong(16).toInt()
        if (clean.length == 6) {
            Color(colorInt or -0x1000000)
        } else {
            Color(colorInt)
        }
    } catch (e: Exception) {
        fallback
    }
}

@Composable
fun TodayDueSection(
    topics: List<Topic>,
    onOpenNotes: (Topic, ReviewMilestone) -> Unit,
    onSnooze: (String, String) -> Unit
) {
    val context = LocalContext.current
    val today = LocalDate.now()
    val dueItems = mutableListOf<DueItem>()

    topics.forEach { topic ->
        val active = topic.milestones.firstOrNull { it.completedAt == null }
        if (active != null) {
            val effDate = LocalDate.parse(active.effectiveDate, DateTimeFormatter.ISO_LOCAL_DATE)
            val diff = ChronoUnit.DAYS.between(today, effDate)
            if (diff <= 0) {
                dueItems.add(DueItem(topic, active, diff))
            }
        }
    }

    if (dueItems.isEmpty()) {
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceDark.copy(alpha = 0.5f)),
            modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)
        ) {
            Row(
                modifier = Modifier.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    Icons.Default.CheckCircle,
                    contentDescription = null,
                    tint = AccentEmerald,
                    modifier = Modifier.size(32.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text("All caught up for today!", fontWeight = FontWeight.Bold, color = TextPrimary, fontSize = 14.sp)
                    Text("No pending reviews. Keep up the great memory retention!", color = TextSecondary, fontSize = 12.sp)
                }
            }
        }
        return
    }

    Column(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 4.dp, vertical = 6.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(AccentRose)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    "DUE FOR RECAP (${dueItems.size})",
                    color = AccentRose,
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp,
                    letterSpacing = 1.sp
                )
            }
            Text("Fight forgetting curve", color = TextMuted, fontSize = 11.sp)
        }

        dueItems.forEach { (topic, milestone, diff) ->
            val isOverdue = diff < 0
            val topicColor = parseHexColor(topic.colorHex)

            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                            Box(
                                modifier = Modifier
                                    .size(9.dp)
                                    .clip(CircleShape)
                                    .background(topicColor)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = topic.name,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary,
                                fontSize = 15.sp
                            )
                        }

                        SuggestionChip(
                            onClick = {},
                            label = {
                                Text(
                                    if (isOverdue) "${-diff}d overdue" else "Due Today",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isOverdue) AccentRose else AccentAmber
                                )
                            },
                            colors = SuggestionChipDefaults.suggestionChipColors(
                                containerColor = if (isOverdue) AccentRose.copy(alpha = 0.15f) else AccentAmber.copy(alpha = 0.15f)
                            )
                        )
                    }

                    if (topic.description.isNotBlank()) {
                        Text(
                            text = topic.description,
                            color = TextSecondary,
                            fontSize = 12.sp,
                            maxLines = 2,
                            modifier = Modifier.padding(vertical = 4.dp)
                        )
                    }

                    Text(
                        text = "Stage ${milestone.stageIndex} (Day +${milestone.intervalFromStart})" +
                                if (milestone.snoozedDays > 0) " • Snoozed +${milestone.snoozedDays}d" else "",
                        color = topicColor,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Google Calendar Quick-Add Button
                        IconButton(
                            onClick = { CalendarExportHelper.openGoogleCalendar(context, topic, milestone) },
                            modifier = Modifier.size(36.dp)
                        ) {
                            Icon(Icons.Default.CalendarMonth, contentDescription = "Add to Google Calendar", tint = SecondaryCyan, modifier = Modifier.size(18.dp))
                        }

                        Spacer(modifier = Modifier.width(4.dp))

                        OutlinedButton(
                            onClick = { onSnooze(topic.id, milestone.id) },
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.height(36.dp),
                            contentPadding = PaddingValues(horizontal = 10.dp)
                        ) {
                            Icon(Icons.Default.Snooze, contentDescription = null, modifier = Modifier.size(14.dp), tint = AccentAmber)
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Snooze +1d", color = AccentAmber, fontSize = 12.sp)
                        }

                        Spacer(modifier = Modifier.width(6.dp))

                        Button(
                            onClick = { onOpenNotes(topic, milestone) },
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.height(36.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = topicColor),
                            contentPadding = PaddingValues(horizontal = 12.dp)
                        ) {
                            Icon(Icons.Default.Edit, contentDescription = null, modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Recap Notes", fontSize = 12.sp)
                        }
                    }
                }
            }
        }
    }
}
