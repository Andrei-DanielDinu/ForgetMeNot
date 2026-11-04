package com.forgetmenot.app.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
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

@Composable
fun TopicCard(
    topic: Topic,
    onOpenNotes: (Topic, ReviewMilestone) -> Unit,
    onSnooze: (String, String) -> Unit,
    onEdit: (Topic) -> Unit,
    onDelete: (String) -> Unit
) {
    var expanded by remember { mutableStateOf(false) }
    val context = LocalContext.current
    val today = LocalDate.now()
    val topicColor = parseHexColor(topic.colorHex)

    val completedCount = topic.milestones.count { it.completedAt != null }
    val totalCount = topic.milestones.size
    val progress = if (totalCount > 0) completedCount.toFloat() / totalCount else 0f

    val nextMilestone = topic.milestones.firstOrNull { it.completedAt == null }
    val daysUntilNext = nextMilestone?.let {
        ChronoUnit.DAYS.between(today, LocalDate.parse(it.effectiveDate, DateTimeFormatter.ISO_LOCAL_DATE))
    }

    Card(
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header with color dot, title, and actions
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(10.dp)
                                .clip(CircleShape)
                                .background(topicColor)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = topic.name,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary,
                            fontSize = 16.sp
                        )
                    }

                    Row(
                        modifier = Modifier.padding(top = 3.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        SuggestionChip(
                            onClick = {},
                            label = { Text(topic.category, fontSize = 10.sp, color = TextSecondary) },
                            colors = SuggestionChipDefaults.suggestionChipColors(containerColor = BgDark.copy(alpha = 0.7f))
                        )
                        Text(
                            text = topic.sequenceType.displayName,
                            color = topicColor,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }

                // Action buttons: .ics download, Edit, Delete
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(
                        onClick = { CalendarExportHelper.shareICSFile(context, topic) },
                        modifier = Modifier.size(30.dp)
                    ) {
                        Icon(Icons.Default.Download, contentDescription = "Export .ics", tint = SecondaryCyan, modifier = Modifier.size(17.dp))
                    }
                    IconButton(
                        onClick = { onEdit(topic) },
                        modifier = Modifier.size(30.dp)
                    ) {
                        Icon(Icons.Default.Edit, contentDescription = "Edit Topic", tint = TextSecondary, modifier = Modifier.size(16.dp))
                    }
                    IconButton(
                        onClick = { onDelete(topic.id) },
                        modifier = Modifier.size(30.dp)
                    ) {
                        Icon(Icons.Default.DeleteOutline, contentDescription = "Delete", tint = AccentRose, modifier = Modifier.size(17.dp))
                    }
                }
            }

            if (topic.description.isNotBlank()) {
                Text(
                    text = topic.description,
                    color = TextSecondary,
                    fontSize = 12.sp,
                    modifier = Modifier.padding(vertical = 6.dp)
                )
            }

            // Progress Bar
            Spacer(modifier = Modifier.height(4.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Retention Trajectory", color = TextMuted, fontSize = 11.sp)
                Text("${(progress * 100).toInt()}% ($completedCount/$totalCount)", color = topicColor, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
            }
            Spacer(modifier = Modifier.height(4.dp))
            LinearProgressIndicator(
                progress = { progress },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(6.dp)
                    .clip(RoundedCornerShape(3.dp)),
                color = topicColor,
                trackColor = SurfaceVariantDark
            )

            // Next Milestone Banner
            if (nextMilestone != null) {
                Spacer(modifier = Modifier.height(10.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(BgDark.copy(alpha = 0.6f))
                        .padding(10.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            "Next: Stage ${nextMilestone.stageIndex} (Day +${nextMilestone.intervalFromStart})",
                            color = TextPrimary,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                        Text(
                            when {
                                daysUntilNext == 0L -> "Due today! (${nextMilestone.effectiveDate})"
                                daysUntilNext != null && daysUntilNext < 0 -> "${-daysUntilNext} days overdue (${nextMilestone.effectiveDate})"
                                else -> "Due in $daysUntilNext days (${nextMilestone.effectiveDate})"
                            },
                            color = if (daysUntilNext != null && daysUntilNext <= 0) AccentAmber else TextSecondary,
                            fontSize = 11.sp
                        )
                    }

                    Row {
                        IconButton(
                            onClick = { CalendarExportHelper.openGoogleCalendar(context, topic, nextMilestone) },
                            modifier = Modifier.size(32.dp)
                        ) {
                            Icon(Icons.Default.CalendarMonth, contentDescription = "Add to Google Calendar", tint = SecondaryCyan, modifier = Modifier.size(18.dp))
                        }
                        IconButton(
                            onClick = { onSnooze(topic.id, nextMilestone.id) },
                            modifier = Modifier.size(32.dp)
                        ) {
                            Icon(Icons.Default.Snooze, contentDescription = "Snooze 1 day", tint = AccentAmber, modifier = Modifier.size(18.dp))
                        }
                        IconButton(
                            onClick = { onOpenNotes(topic, nextMilestone) },
                            modifier = Modifier.size(32.dp)
                        ) {
                            Icon(Icons.Default.EditNote, contentDescription = "Log Notes", tint = topicColor, modifier = Modifier.size(20.dp))
                        }
                    }
                }
            }

            // Expand Timeline Button
            Spacer(modifier = Modifier.height(6.dp))
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { expanded = !expanded }
                    .padding(vertical = 4.dp),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    if (expanded) "Hide Milestone Schedule" else "View Full Milestone Journey & Logs",
                    color = TextSecondary,
                    fontSize = 11.sp
                )
                Icon(
                    if (expanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                    contentDescription = null,
                    tint = TextSecondary,
                    modifier = Modifier.size(16.dp)
                )
            }

            AnimatedVisibility(visible = expanded) {
                Column(modifier = Modifier.padding(top = 8.dp)) {
                    topic.milestones.forEach { m ->
                        val isDone = m.completedAt != null
                        Card(
                            shape = RoundedCornerShape(10.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = if (isDone) SurfaceDark.copy(alpha = 0.4f) else BgDark.copy(alpha = 0.5f)
                            ),
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 2.dp)
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(
                                            if (isDone) Icons.Default.CheckCircle else Icons.Default.RadioButtonUnchecked,
                                            contentDescription = null,
                                            tint = if (isDone) AccentEmerald else TextMuted,
                                            modifier = Modifier.size(16.dp)
                                        )
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text(
                                            "Stage ${m.stageIndex} (+${m.intervalFromStart}d)",
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.SemiBold,
                                            color = if (isDone) TextSecondary else TextPrimary
                                        )
                                    }

                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(
                                            m.effectiveDate + if (m.snoozedDays > 0) " (+${m.snoozedDays}d)" else "",
                                            fontSize = 11.sp,
                                            color = if (m.snoozedDays > 0) AccentAmber else TextMuted
                                        )
                                        IconButton(
                                            onClick = { CalendarExportHelper.openGoogleCalendar(context, topic, m) },
                                            modifier = Modifier.size(24.dp).padding(start = 4.dp)
                                        ) {
                                            Icon(Icons.Default.CalendarMonth, contentDescription = "Add event to Google Calendar", tint = SecondaryCyan, modifier = Modifier.size(14.dp))
                                        }
                                        IconButton(
                                            onClick = { onOpenNotes(topic, m) },
                                            modifier = Modifier.size(24.dp)
                                        ) {
                                            Icon(Icons.Default.Edit, contentDescription = "Log Notes", tint = TextSecondary, modifier = Modifier.size(13.dp))
                                        }
                                    }
                                }

                                if (!m.notes.isNullOrBlank()) {
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(start = 24.dp, top = 4.dp)
                                            .clip(RoundedCornerShape(6.dp))
                                            .background(BgDark.copy(alpha = 0.8f))
                                            .padding(6.dp)
                                    ) {
                                        Column {
                                            Row(
                                                modifier = Modifier.fillMaxWidth(),
                                                horizontalArrangement = Arrangement.SpaceBetween
                                            ) {
                                                Text("LOGGED SESSION NOTES", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = TextMuted)
                                                if (!m.difficulty.isNullOrBlank()) {
                                                    Text(
                                                        when (m.difficulty) {
                                                            "easy" -> "🌱 Easy"
                                                            "hard" -> "🔥 Challenging"
                                                            else -> "⚖️ Good Effort"
                                                        },
                                                        fontSize = 9.sp,
                                                        color = when (m.difficulty) {
                                                            "easy" -> AccentEmerald
                                                            "hard" -> AccentRose
                                                            else -> PrimaryIndigo
                                                        }
                                                    )
                                                }
                                            }
                                            Text(
                                                text = m.notes,
                                                fontSize = 11.sp,
                                                color = TextPrimary,
                                                modifier = Modifier.padding(top = 2.dp)
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
