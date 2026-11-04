package com.forgetmenot.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.forgetmenot.app.data.SequenceEngine
import com.forgetmenot.app.data.SequenceType
import com.forgetmenot.app.data.Topic
import com.forgetmenot.app.ui.theme.*
import java.time.LocalDate
import java.time.format.DateTimeFormatter

val COLOR_PALETTE = listOf(
    "#6366F1", // Indigo
    "#06B6D4", // Cyan
    "#10B981", // Emerald
    "#F59E0B", // Amber
    "#EC4899", // Pink
    "#8B5CF6", // Purple
    "#3B82F6", // Blue
    "#EF4444"  // Red
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddTopicDialog(
    initialTopic: Topic? = null,
    onDismiss: () -> Unit,
    onSave: (Topic) -> Unit
) {
    val todayStr = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)

    var name by remember { mutableStateOf(initialTopic?.name ?: "") }
    var category by remember { mutableStateOf(initialTopic?.category ?: "Design & 3D") }
    var description by remember { mutableStateOf(initialTopic?.description ?: "") }
    var startDate by remember { mutableStateOf(initialTopic?.startDate ?: todayStr) }
    var reminderTime by remember { mutableStateOf(initialTopic?.reminderTime ?: "09:00") }
    var sequenceType by remember { mutableStateOf(initialTopic?.sequenceType ?: SequenceType.FIBONACCI) }
    var customEquation by remember { mutableStateOf(initialTopic?.customEquation ?: "round(pow(1.618, n))") }
    var equationStepsCount by remember { mutableStateOf(initialTopic?.equationStepsCount ?: 10) }
    var selectedColor by remember { mutableStateOf(initialTopic?.colorHex ?: COLOR_PALETTE[0]) }

    // Live preview milestones
    val previewMilestones = remember(startDate, sequenceType, customEquation, equationStepsCount) {
        try {
            SequenceEngine.generateMilestones(
                startDateStr = startDate.ifBlank { todayStr },
                sequenceType = sequenceType,
                customEquation = customEquation,
                equationStepsCount = equationStepsCount
            )
        } catch (e: Exception) {
            emptyList()
        }
    }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceDark),
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.92f)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(18.dp)
            ) {
                Text(
                    if (initialTopic == null) "Create Learning Topic" else "Edit Topic & Sequence",
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp,
                    color = TextPrimary
                )
                Text(
                    "Set up spaced repetition to fight the forgetting curve",
                    fontSize = 12.sp,
                    color = TextSecondary,
                    modifier = Modifier.padding(bottom = 12.dp)
                )

                LazyColumn(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    item {
                        OutlinedTextField(
                            value = name,
                            onValueChange = { name = it },
                            label = { Text("Topic Name *") },
                            placeholder = { Text("e.g. Parametric Design, Python, Cleaning") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true
                        )
                    }

                    item {
                        OutlinedTextField(
                            value = category,
                            onValueChange = { category = it },
                            label = { Text("Category") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true
                        )
                    }

                    item {
                        Text("Color Accent", fontWeight = FontWeight.SemiBold, fontSize = 12.sp, color = TextPrimary)
                        LazyRow(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier.padding(top = 4.dp)
                        ) {
                            items(COLOR_PALETTE) { hex ->
                                val color = parseHexColor(hex)
                                val isSelected = selectedColor == hex
                                Box(
                                    modifier = Modifier
                                        .size(32.dp)
                                        .clip(CircleShape)
                                        .background(color)
                                        .clickable { selectedColor = hex }
                                        .then(
                                            if (isSelected) Modifier.border(2.5.dp, Color.White, CircleShape)
                                            else Modifier
                                        )
                                )
                            }
                        }
                    }

                    item {
                        OutlinedTextField(
                            value = description,
                            onValueChange = { description = it },
                            label = { Text("Description & Exercise Goals") },
                            placeholder = { Text("What will you practice or build each recap?") },
                            modifier = Modifier.fillMaxWidth(),
                            maxLines = 3
                        )
                    }

                    item {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedTextField(
                                value = startDate,
                                onValueChange = { startDate = it },
                                label = { Text("Start Date (Day 0)") },
                                placeholder = { Text("YYYY-MM-DD") },
                                modifier = Modifier.weight(1f),
                                singleLine = true
                            )
                            OutlinedTextField(
                                value = reminderTime,
                                onValueChange = { reminderTime = it },
                                label = { Text("Reminder Time") },
                                placeholder = { Text("09:00") },
                                modifier = Modifier.weight(1f),
                                singleLine = true
                            )
                        }
                    }

                    item {
                        Text(
                            "Sequence Function",
                            fontWeight = FontWeight.SemiBold,
                            color = TextPrimary,
                            fontSize = 13.sp,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }

                    items(SequenceType.values().toList()) { st ->
                        val isSelected = sequenceType == st
                        Card(
                            shape = RoundedCornerShape(10.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = if (isSelected) PrimaryIndigo.copy(alpha = 0.25f) else BgDark.copy(alpha = 0.6f)
                            ),
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { sequenceType = st }
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Text(st.displayName, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = if (isSelected) PrimaryIndigo else TextPrimary)
                                Text(st.description, fontSize = 11.sp, color = TextSecondary)
                            }
                        }
                    }

                    if (sequenceType == SequenceType.EQUATION) {
                        item {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(BgDark)
                                    .padding(12.dp)
                            ) {
                                Text("Equation Formula f(n)", fontWeight = FontWeight.Bold, color = SecondaryCyan, fontSize = 12.sp)
                                OutlinedTextField(
                                    value = customEquation,
                                    onValueChange = { customEquation = it },
                                    placeholder = { Text("round(pow(1.618, n)), fib(n)") },
                                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                                    singleLine = true
                                )
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text("Stages: $equationStepsCount", fontSize = 12.sp, color = TextSecondary)
                                    Slider(
                                        value = equationStepsCount.toFloat(),
                                        onValueChange = { equationStepsCount = it.toInt() },
                                        valueRange = 3f..20f,
                                        modifier = Modifier.width(180.dp)
                                    )
                                }
                            }
                        }
                    }

                    item {
                        Text(
                            "Calculated Schedule Preview (${previewMilestones.size} stages)",
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 12.sp,
                            color = PrimaryIndigo,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }

                    items(previewMilestones.take(8)) { m ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(6.dp))
                                .background(BgDark.copy(alpha = 0.5f))
                                .padding(horizontal = 8.dp, vertical = 4.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Stage ${m.stageIndex}: +${m.intervalFromStart} days", fontSize = 11.sp, color = TextPrimary)
                            Text(m.targetDate, fontSize = 11.sp, color = SecondaryCyan)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    TextButton(onClick = onDismiss) {
                        Text("Cancel", color = TextSecondary)
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = {
                            if (name.isNotBlank()) {
                                onSave(
                                    Topic(
                                        id = initialTopic?.id ?: java.util.UUID.randomUUID().toString(),
                                        name = name.trim(),
                                        category = category.trim(),
                                        description = description.trim(),
                                        startDate = startDate.ifBlank { todayStr },
                                        reminderTime = reminderTime.ifBlank { "09:00" },
                                        sequenceType = sequenceType,
                                        customEquation = if (sequenceType == SequenceType.EQUATION) customEquation else null,
                                        equationStepsCount = equationStepsCount,
                                        colorHex = selectedColor,
                                        milestones = previewMilestones
                                    )
                                )
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = parseHexColor(selectedColor)),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text(if (initialTopic == null) "Save Topic" else "Update Topic")
                    }
                }
            }
        }
    }
}
