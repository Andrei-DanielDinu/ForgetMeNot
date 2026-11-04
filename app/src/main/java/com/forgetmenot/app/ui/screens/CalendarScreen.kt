package com.forgetmenot.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronLeft
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.forgetmenot.app.data.ReviewMilestone
import com.forgetmenot.app.data.Topic
import com.forgetmenot.app.ui.theme.*
import java.time.LocalDate
import java.time.YearMonth
import java.time.format.DateTimeFormatter

@Composable
fun CalendarScreen(
    topics: List<Topic>,
    onOpenNotes: (Topic, ReviewMilestone) -> Unit
) {
    var currentMonth by remember { mutableStateOf(YearMonth.now()) }
    val today = LocalDate.now()

    // Map: YYYY-MM-DD -> List of (Topic, Milestone)
    val eventsByDate = remember(topics) {
        val map = mutableMapOf<String, MutableList<Pair<Topic, ReviewMilestone>>>()
        topics.forEach { t ->
            t.milestones.forEach { m ->
                val list = map.getOrPut(m.effectiveDate) { mutableListOf() }
                list.add(t to m)
            }
        }
        map
    }

    val daysInMonth = currentMonth.lengthOfMonth()
    val firstDayOfWeek = currentMonth.atDay(1).dayOfWeek.value % 7 // Sunday = 0

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Month Navigation Header
        Row(
            modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "${currentMonth.month.name} ${currentMonth.year}",
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp,
                color = TextPrimary
            )

            Row {
                IconButton(onClick = { currentMonth = currentMonth.minusMonths(1) }) {
                    Icon(Icons.Default.ChevronLeft, contentDescription = "Prev month", tint = TextPrimary)
                }
                IconButton(onClick = { currentMonth = currentMonth.plusMonths(1) }) {
                    Icon(Icons.Default.ChevronRight, contentDescription = "Next month", tint = TextPrimary)
                }
            }
        }

        // Days of week header
        val days = listOf("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat")
        Row(modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp)) {
            days.forEach { day ->
                Text(
                    text = day,
                    modifier = Modifier.weight(1f),
                    textAlign = TextAlign.Center,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = TextMuted
                )
            }
        }

        // Calendar Grid
        LazyVerticalGrid(
            columns = GridCells.Fixed(7),
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(6.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            // Empty leading cells
            items(firstDayOfWeek) {
                Box(modifier = Modifier.aspectRatio(1f))
            }

            // Days of the month
            items(daysInMonth) { index ->
                val day = index + 1
                val date = currentMonth.atDay(day)
                val dateStr = date.format(DateTimeFormatter.ISO_LOCAL_DATE)
                val isToday = date == today
                val events = eventsByDate[dateStr] ?: emptyList()

                Box(
                    modifier = Modifier
                        .aspectRatio(1f)
                        .clip(RoundedCornerShape(10.dp))
                        .background(if (isToday) PrimaryIndigo.copy(alpha = 0.25f) else SurfaceDark)
                        .padding(4.dp)
                        .clickable(enabled = events.isNotEmpty()) {
                            events.firstOrNull()?.let { (t, m) -> onOpenNotes(t, m) }
                        },
                    contentAlignment = Alignment.TopCenter
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier.fillMaxSize()
                    ) {
                        Text(
                            text = day.toString(),
                            fontSize = 11.sp,
                            fontWeight = if (isToday) FontWeight.Bold else FontWeight.Medium,
                            color = if (isToday) PrimaryIndigo else TextPrimary
                        )

                        if (events.isNotEmpty()) {
                            Row(
                                horizontalArrangement = Arrangement.Center,
                                modifier = Modifier.padding(bottom = 2.dp)
                            ) {
                                events.take(3).forEach { (t, m) ->
                                    val isDone = m.completedAt != null
                                    Box(
                                        modifier = Modifier
                                            .size(5.dp)
                                            .padding(horizontal = 0.5.dp)
                                            .clip(CircleShape)
                                            .background(if (isDone) AccentEmerald else PrimaryIndigo)
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
