package com.forgetmenot.app

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.FormatListBulleted
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.forgetmenot.app.data.ReviewMilestone
import com.forgetmenot.app.data.Topic
import com.forgetmenot.app.data.TopicRepository
import com.forgetmenot.app.notifications.NotificationHelper
import com.forgetmenot.app.ui.components.*
import com.forgetmenot.app.ui.screens.CalendarScreen
import com.forgetmenot.app.ui.theme.*

class MainActivity : ComponentActivity() {

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { _ -> }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        NotificationHelper.createNotificationChannel(this)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED) {
                requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }

        val repository = TopicRepository(this)

        setContent {
            ForgetMeNotTheme {
                ForgetMeNotApp(repository)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ForgetMeNotApp(repository: TopicRepository) {
    var topics by remember { mutableStateOf(repository.getTopics()) }
    var currentView by remember { mutableStateOf("schedule") } // "schedule" or "calendar"
    var searchQuery by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("All") }

    // Dialog states
    var showAddDialog by remember { mutableStateOf(false) }
    var activeNotesTopic by remember { mutableStateOf<Topic?>(null) }
    var activeNotesMilestone by remember { mutableStateOf<ReviewMilestone?>(null) }

    fun refreshTopics() {
        topics = repository.getTopics()
    }

    val categories = remember(topics) {
        listOf("All") + topics.map { it.category }.distinct().filter { it.isNotBlank() }
    }

    val filteredTopics = remember(topics, searchQuery, selectedCategory) {
        topics.filter { t ->
            val matchesCat = selectedCategory == "All" || t.category == selectedCategory
            val matchesQuery = t.name.contains(searchQuery, ignoreCase = true) ||
                    t.description.contains(searchQuery, ignoreCase = true)
            matchesCat && matchesQuery
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("ForgetMeNot", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = TextPrimary)
                        Spacer(modifier = Modifier.width(6.dp))
                        SuggestionChip(
                            onClick = {},
                            label = { Text("FIBONACCI", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = PrimaryIndigo) },
                            colors = SuggestionChipDefaults.suggestionChipColors(containerColor = PrimaryIndigo.copy(alpha = 0.15f))
                        )
                    }
                },
                actions = {
                    IconButton(onClick = { currentView = if (currentView == "schedule") "calendar" else "schedule" }) {
                        Icon(
                            if (currentView == "schedule") Icons.Default.CalendarMonth else Icons.Default.FormatListBulleted,
                            contentDescription = "Switch view",
                            tint = PrimaryIndigo
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = BgDark)
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddDialog = true },
                containerColor = PrimaryIndigo,
                contentColor = TextPrimary,
                shape = RoundedCornerShape(16.dp)
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Topic")
            }
        },
        containerColor = BgDark
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            if (currentView == "calendar") {
                CalendarScreen(
                    topics = topics,
                    onOpenNotes = { topic, milestone ->
                        activeNotesTopic = topic
                        activeNotesMilestone = milestone
                    }
                )
            } else {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp),
                    contentPadding = PaddingValues(bottom = 80.dp)
                ) {
                    item {
                        // High Priority Today's Reviews
                        TodayDueSection(
                            topics = topics,
                            onOpenNotes = { topic, milestone ->
                                activeNotesTopic = topic
                                activeNotesMilestone = milestone
                            },
                            onSnooze = { topicId, milestoneId ->
                                repository.snoozeMilestone(topicId, milestoneId, 1)
                                refreshTopics()
                            }
                        )
                    }

                    item {
                        // Search bar
                        OutlinedTextField(
                            value = searchQuery,
                            onValueChange = { searchQuery = it },
                            placeholder = { Text("Search topics (parametric design, coding...)", fontSize = 12.sp) },
                            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = TextMuted) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 6.dp),
                            shape = RoundedCornerShape(12.dp),
                            singleLine = true
                        )
                    }

                    item {
                        // Category chips
                        LazyRow(
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            modifier = Modifier.padding(vertical = 4.dp)
                        ) {
                            items(categories) { cat ->
                                val isSelected = selectedCategory == cat
                                FilterChip(
                                    selected = isSelected,
                                    onClick = { selectedCategory = cat },
                                    label = { Text(cat, fontSize = 11.sp) },
                                    colors = FilterChipDefaults.filterChipColors(
                                        selectedContainerColor = PrimaryIndigo,
                                        selectedLabelColor = TextPrimary
                                    )
                                )
                            }
                        }
                    }

                    items(filteredTopics, key = { it.id }) { topic ->
                        TopicCard(
                            topic = topic,
                            onOpenNotes = { t, m ->
                                activeNotesTopic = t
                                activeNotesMilestone = m
                            },
                            onSnooze = { topicId, milestoneId ->
                                repository.snoozeMilestone(topicId, milestoneId, 1)
                                refreshTopics()
                            },
                            onDelete = { topicId ->
                                repository.deleteTopic(topicId)
                                refreshTopics()
                            }
                        )
                    }
                }
            }

            // Dialogs
            if (showAddDialog) {
                AddTopicDialog(
                    onDismiss = { showAddDialog = false },
                    onSave = { newTopic ->
                        repository.addOrUpdateTopic(newTopic)
                        refreshTopics()
                        showAddDialog = false
                    }
                )
            }

            if (activeNotesTopic != null && activeNotesMilestone != null) {
                RecapNotesDialog(
                    topic = activeNotesTopic!!,
                    milestone = activeNotesMilestone!!,
                    onDismiss = {
                        activeNotesTopic = null
                        activeNotesMilestone = null
                    },
                    onSaveNotes = { notes, difficulty ->
                        repository.completeMilestone(
                            activeNotesTopic!!.id,
                            activeNotesMilestone!!.id,
                            notes,
                            difficulty
                        )
                        refreshTopics()
                    },
                    onSnooze = {
                        repository.snoozeMilestone(
                            activeNotesTopic!!.id,
                            activeNotesMilestone!!.id,
                            1
                        )
                        refreshTopics()
                    }
                )
            }
        }
    }
}
