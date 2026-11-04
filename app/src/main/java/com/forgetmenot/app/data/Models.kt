package com.forgetmenot.app.data

import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.UUID

enum class SequenceType(val displayName: String, val description: String) {
    FIBONACCI("Fibonacci Sequence", "Golden ratio expansion: 1, 2, 3, 5, 8, 13, 21, 34, 55..."),
    EQUATION("Math Equation f(n)", "Custom formula over n: e.g. round(pow(1.618, n)), round(n*4 + 2*sin(n))"),
    POWERS_OF_2("Powers of 2", "Binary doubling: 1, 2, 4, 8, 16, 32, 64, 128..."),
    LEITNER_SM2("Classic SM-2", "Flashcard standard: 1, 3, 7, 14, 30, 60, 120..."),
    EXPONENTIAL("Exponential (1.6x)", "Smooth geometric growth: 1, 2, 3, 5, 8, 14, 23, 37..."),
    SUBLINEAR_LOG("Logarithmic Ramp", "Gradual ramp: 1, 2, 4, 7, 11, 16, 22, 29..."),
    PERIODIC_SINE("Wave / Cyclic Rhythm", "Harmonic cycles: 1, 3, 7, 10, 14, 21, 28, 42..."),
    CUSTOM("Manual List of Days", "Comma-separated days: e.g. 1, 2, 4, 7, 15, 30, 60")
}

data class ReviewMilestone(
    val id: String = UUID.randomUUID().toString(),
    val stageIndex: Int,
    val intervalFromStart: Int, // Cumulative days from start
    val intervalFromPrev: Int,  // Days since previous review
    val targetDate: String,     // ISO format YYYY-MM-DD
    val snoozedDays: Int = 0,   // Number of days snoozed (+1, +2)
    val effectiveDate: String,  // targetDate + snoozedDays
    val completedAt: String? = null,
    val notes: String? = null,
    val difficulty: String? = null // "easy", "medium", "hard"
)

data class Topic(
    val id: String = UUID.randomUUID().toString(),
    val name: String,
    val category: String,
    val description: String,
    val startDate: String,      // ISO format YYYY-MM-DD
    val reminderTime: String = "09:00",
    val sequenceType: SequenceType = SequenceType.FIBONACCI,
    val customEquation: String? = null,
    val equationStepsCount: Int = 10,
    val customIntervals: List<Int>? = null,
    val colorHex: String = "#6366F1",
    val milestones: List<ReviewMilestone> = emptyList(),
    val createdAt: String = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)
)
