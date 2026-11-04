package com.forgetmenot.app.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Snooze
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.forgetmenot.app.data.ReviewMilestone
import com.forgetmenot.app.data.Topic
import com.forgetmenot.app.ui.theme.*

@Composable
fun RecapNotesDialog(
    topic: Topic,
    milestone: ReviewMilestone,
    onDismiss: () -> Unit,
    onSaveNotes: (notes: String, difficulty: String) -> Unit,
    onSnooze: () -> Unit
) {
    var notes by remember { mutableStateOf(milestone.notes ?: "") }
    var difficulty by remember { mutableStateOf(milestone.difficulty ?: "medium") }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceDark),
            modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp)
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Text(
                    "Log Recap Session",
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp,
                    color = TextPrimary
                )
                Text(
                    "${topic.name} • Stage ${milestone.stageIndex} (Day +${milestone.intervalFromStart})",
                    fontSize = 12.sp,
                    color = PrimaryIndigo,
                    fontWeight = FontWeight.SemiBold
                )

                if (topic.description.isNotBlank()) {
                    Text(
                        "Goal: ${topic.description}",
                        fontSize = 12.sp,
                        color = TextSecondary,
                        modifier = Modifier.padding(top = 4.dp, bottom = 8.dp)
                    )
                }

                Spacer(modifier = Modifier.height(6.dp))

                OutlinedTextField(
                    value = notes,
                    onValueChange = { notes = it },
                    label = { Text("Recap Notes & Exercises Completed") },
                    placeholder = { Text("What did you build/practice today? What felt easy, what needs another pass?") },
                    modifier = Modifier.fillMaxWidth().height(120.dp),
                    maxLines = 5
                )

                Spacer(modifier = Modifier.height(12.dp))

                Text("Recall & Practice Difficulty", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                Row(
                    modifier = Modifier.fillMaxWidth().padding(top = 6.dp),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    val difficulties = listOf("easy" to "🌱 Easy", "medium" to "⚖️ Medium", "hard" to "🔥 Hard")
                    difficulties.forEach { (key, label) ->
                        val isSelected = difficulty == key
                        FilterChip(
                            selected = isSelected,
                            onClick = { difficulty = key },
                            label = { Text(label, fontSize = 11.sp) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = when (key) {
                                    "easy" -> AccentEmerald.copy(alpha = 0.25f)
                                    "hard" -> AccentRose.copy(alpha = 0.25f)
                                    else -> PrimaryIndigo.copy(alpha = 0.25f)
                                }
                            ),
                            modifier = Modifier.weight(1f)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextButton(onClick = {
                        onSnooze()
                        onDismiss()
                    }) {
                        Icon(Icons.Default.Snooze, contentDescription = null, tint = AccentAmber, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Snooze +1d", color = AccentAmber, fontSize = 12.sp)
                    }

                    Row {
                        TextButton(onClick = onDismiss) {
                            Text("Cancel", color = TextSecondary)
                        }
                        Spacer(modifier = Modifier.width(4.dp))
                        Button(
                            onClick = {
                                onSaveNotes(notes.trim(), difficulty)
                                onDismiss()
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = PrimaryIndigo),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text("Save Recap")
                        }
                    }
                }
            }
        }
    }
}
