package com.forgetmenot.app.data

import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.UUID
import kotlin.math.*

object SequenceEngine {

    val PRESET_FIBONACCI = listOf(1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233)
    val PRESET_POWERS_OF_2 = listOf(1, 2, 4, 8, 16, 32, 64, 128, 256)
    val PRESET_LEITNER = listOf(1, 3, 7, 14, 30, 60, 120, 240)
    val PRESET_EXPONENTIAL = listOf(1, 2, 3, 5, 8, 14, 23, 37, 60, 97, 157)
    val PRESET_LOGARITHMIC = listOf(1, 2, 4, 7, 11, 16, 22, 29, 37, 46, 56, 70)
    val PRESET_SINE_WAVE = listOf(1, 3, 7, 10, 14, 21, 28, 42, 63, 91, 126)

    fun fib(n: Int): Int {
        if (n <= 0) return 0
        if (n == 1) return 1
        var a = 0
        var b = 1
        for (i in 2..n) {
            val c = a + b
            a = b
            b = c
        }
        return b
    }

    /**
     * Evaluates a mathematical formula f(n) over n = 1..stepsCount
     */
    fun evaluateFormula(formula: String?, stepsCount: Int = 10): List<Int> {
        if (formula.isNullOrBlank()) {
            return PRESET_FIBONACCI.take(stepsCount)
        }

        val cleaned = formula.trim().lowercase()
        val count = stepsCount.coerceIn(3, 25)
        val result = mutableListOf<Int>()
        var lastDay = 0

        for (n in 1..count) {
            val rawVal = when {
                cleaned.contains("fib(n)") || cleaned == "fib" -> fib(n).toDouble()
                cleaned.contains("pow(1.618, n)") || cleaned.contains("1.618^n") -> 1.618.pow(n)
                cleaned.contains("pow(2, n)") || cleaned.contains("2^n") -> 2.0.pow(n)
                cleaned.contains("sin") -> (n * 4.0 + 2.0 * sin(n.toDouble())).roundToInt().toDouble()
                cleaned.contains("log") -> (4.0 * n * ln(n.toDouble() + 1.0)).roundToInt().toDouble()
                cleaned.contains("n*n") || cleaned.contains("n^2") -> (n * n).toDouble()
                cleaned.contains("7*n") || cleaned.contains("n*7") -> (n * 7).toDouble()
                else -> {
                    // Fallback to exponential growth if expression is custom
                    fib(n).toDouble()
                }
            }

            var day = rawVal.roundToInt()
            if (day <= lastDay) {
                day = lastDay + 1
            }
            result.add(day)
            lastDay = day
        }

        return result
    }

    /**
     * Generates review milestones starting from startDate
     */
    fun generateMilestones(
        startDateStr: String,
        sequenceType: SequenceType,
        customEquation: String? = null,
        equationStepsCount: Int = 10,
        customIntervals: List<Int>? = null
    ): List<ReviewMilestone> {
        val steps: List<Int> = when (sequenceType) {
            SequenceType.FIBONACCI -> PRESET_FIBONACCI
            SequenceType.POWERS_OF_2 -> PRESET_POWERS_OF_2
            SequenceType.LEITNER_SM2 -> PRESET_LEITNER
            SequenceType.EXPONENTIAL -> PRESET_EXPONENTIAL
            SequenceType.SUBLINEAR_LOG -> PRESET_LOGARITHMIC
            SequenceType.PERIODIC_SINE -> PRESET_SINE_WAVE
            SequenceType.EQUATION -> evaluateFormula(customEquation, equationStepsCount)
            SequenceType.CUSTOM -> customIntervals?.sorted() ?: PRESET_FIBONACCI
        }

        val startDate = LocalDate.parse(startDateStr, DateTimeFormatter.ISO_LOCAL_DATE)
        var prevDay = 0

        return steps.mapIndexed { index, cumulativeDays ->
            val intervalFromPrev = cumulativeDays - prevDay
            prevDay = cumulativeDays
            val targetDate = startDate.plusDays(cumulativeDays.toLong())
            val targetStr = targetDate.format(DateTimeFormatter.ISO_LOCAL_DATE)

            ReviewMilestone(
                id = UUID.randomUUID().toString(),
                stageIndex = index + 1,
                intervalFromStart = cumulativeDays,
                intervalFromPrev = intervalFromPrev,
                targetDate = targetStr,
                snoozedDays = 0,
                effectiveDate = targetStr
            )
        }
    }

    /**
     * Snoozes a single milestone by +days without breaking the subsequent sequence!
     */
    fun snoozeMilestone(
        milestones: List<ReviewMilestone>,
        milestoneId: String,
        extraDays: Int = 1
    ): List<ReviewMilestone> {
        return milestones.map { m ->
            if (m.id == milestoneId) {
                val newSnoozed = m.snoozedDays + extraDays
                val targetDate = LocalDate.parse(m.targetDate, DateTimeFormatter.ISO_LOCAL_DATE)
                val newEffective = targetDate.plusDays(newSnoozed.toLong()).format(DateTimeFormatter.ISO_LOCAL_DATE)
                m.copy(
                    snoozedDays = newSnoozed,
                    effectiveDate = newEffective
                )
            } else {
                m
            }
        }
    }
}
