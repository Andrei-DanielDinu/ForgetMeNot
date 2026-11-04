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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.forgetmenot.app.data.ReviewMilestone
import com.forgetmenot.app.data.Topic
import com.forgetmenot.app.ui.theme.*
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit

@Composable
fun TopicCard(
    topic: Topic,
    onOpenNotes: (Topic, ReviewMilestone) -> Unit,
    onSnooze: (String, String) -> Unit,
    onDelete: (String) -> Unit
) {
    var expanded by remember { mutableStateOf(false) }
    val today = LocalDate.now()

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
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(PrimaryIndigo)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = topic.name,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary,
                            fontSize = 16.sp
                        )
                    }
                    Text(
                        text = "${topic.category} • ${topic.sequenceType.displayName}",
                        color = SecondaryCyan,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        modifier = Modifier.padding(top = 2.dp)
                    )
                }

                IconButton(
                    onClick = { onDelete(topic.id) },
                    modifier = Modifier.size(28.dp)
                ) {
                    Icon(Icons.Default.DeleteOutline, contentDescription = "Delete", tint = TextMuted)
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
                Text("Retention Journey", color = TextMuted, fontSize = 11.sp)
                Text("${(progress * 100).toInt()}% ($completedCount/$totalCount)", color = PrimaryIndigo, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
            }
            Spacer(modifier = Modifier.height(4.dp))
            LinearProgressIndicator(
                progress = { progress },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(6.dp)
                    .clip(RoundedCornerShape(3.dp)),
                color = PrimaryIndigo,
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
                    Column {
                        Text(
                            "Next: Stage ${nextMilestone.stageIndex} (Day +${nextMilestone.intervalFromStart})",
                            color = TextPrimary,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                        Text(
                            when {
                                daysUntilNext == 0L -> "Due today!"
                                daysUntilNext != null && daysUntilNext < 0 -> "${-daysUntilNext} days overdue"
                                else -> "Due in $daysUntilNext days (${nextMilestone.effectiveDate})"
                            },
                            color = if (daysUntilNext != null && daysUntilNext <= 0) AccentAmber else TextSecondary,
                            fontSize = 11.sp
                        )
                    }

                    Row {
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
                            Icon(Icons.Default.EditNote, contentDescription = "Log Notes", tint = PrimaryIndigo, modifier = Modifier.size(20.dp))
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
                    if (expanded) "Hide Milestone Schedule" else "View Full Milestone Sequence",
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
                                    Text(
                                        m.effectiveDate + if (m.snoozedDays > 0) " (+${m.snoozedDays}d)" else "",
                                        fontSize = 11.sp,
                                        color = if (m.snoozedDays > 0) AccentAmber else TextMuted
                                    )
                                }

                                if (!m.notes.isNullOrBlank()) {
                                    Text(
                                        text = "Notes: ${m.notes}",
                                        fontSize = 11.sp,
                                        color = TextSecondary,
                                        modifier = Modifier.padding(start = 24.dp, top = 4.dp)
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
