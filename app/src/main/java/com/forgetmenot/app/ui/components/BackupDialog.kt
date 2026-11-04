package com.forgetmenot.app.ui.components

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Upload
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.forgetmenot.app.ui.theme.*

@Composable
fun BackupDialog(
    jsonBackup: String,
    onDismiss: () -> Unit,
    onRestore: (String) -> Boolean
) {
    val context = LocalContext.current
    var importText by remember { mutableStateOf("") }
    var isImportMode by remember { mutableStateOf(false) }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceDark),
            modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp)
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Text(
                    "Data Backup & Restore",
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp,
                    color = TextPrimary
                )
                Text(
                    "All your topics, equations, notes, and schedules are stored 100% locally on your phone.",
                    fontSize = 12.sp,
                    color = TextSecondary,
                    modifier = Modifier.padding(vertical = 4.dp)
                )

                Spacer(modifier = Modifier.height(10.dp))

                if (!isImportMode) {
                    Text("Export Data (JSON)", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = PrimaryIndigo)
                    OutlinedTextField(
                        value = jsonBackup,
                        onValueChange = {},
                        readOnly = true,
                        modifier = Modifier.fillMaxWidth().height(130.dp),
                        maxLines = 6
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = {
                                val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                clipboard.setPrimaryClip(ClipData.newPlainText("ForgetMeNot Backup", jsonBackup))
                                Toast.makeText(context, "Backup copied to clipboard!", Toast.LENGTH_SHORT).show()
                            },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = PrimaryIndigo)
                        ) {
                            Icon(Icons.Default.ContentCopy, contentDescription = null, modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Copy Backup", fontSize = 12.sp)
                        }

                        OutlinedButton(
                            onClick = { isImportMode = true },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Icon(Icons.Default.Upload, contentDescription = null, modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Restore JSON", fontSize = 12.sp)
                        }
                    }
                } else {
                    Text("Paste Backup JSON", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = AccentEmerald)
                    OutlinedTextField(
                        value = importText,
                        onValueChange = { importText = it },
                        placeholder = { Text("Paste JSON backup string here...") },
                        modifier = Modifier.fillMaxWidth().height(130.dp),
                        maxLines = 6
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End
                    ) {
                        TextButton(onClick = { isImportMode = false }) {
                            Text("Back", color = TextSecondary)
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Button(
                            onClick = {
                                val success = onRestore(importText.trim())
                                if (success) {
                                    Toast.makeText(context, "Data restored successfully!", Toast.LENGTH_SHORT).show()
                                    onDismiss()
                                } else {
                                    Toast.makeText(context, "Invalid JSON format", Toast.LENGTH_SHORT).show()
                                }
                            },
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = AccentEmerald)
                        ) {
                            Text("Apply Restore")
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                    TextButton(onClick = onDismiss) {
                        Text("Close", color = TextSecondary)
                    }
                }
            }
        }
    }
}
