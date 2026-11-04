import { SequencePreset, SequenceType, ReviewMilestone } from '../types';

export const SEQUENCE_PRESETS: SequencePreset[] = [
  {
    id: 'fibonacci',
    name: 'Fibonacci Sequence',
    description: 'Golden ratio expansion. Best for complex mastery (parametric design, coding).',
    formulaDescription: 'Day = F(n): 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144...',
    defaultSteps: [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233],
  },
  {
    id: 'equation',
    name: 'Mathematical Equation f(n)',
    description: 'Define your own equation (e.g. round(pow(1.618, n)), round(n * 4 + 2 * sin(n))).',
    formulaDescription: 'Evaluated function: f(n) over n = 1, 2, 3...',
    defaultSteps: [1, 2, 4, 8, 15, 27, 48, 85, 150],
    isCustomizable: true,
  },
  {
    id: 'powers_of_2',
    name: 'Powers of 2 (Binary Doubling)',
    description: 'Rapid early recap followed by exponential spacing.',
    formulaDescription: 'Day = 2^n: 1, 2, 4, 8, 16, 32, 64, 128, 256...',
    defaultSteps: [1, 2, 4, 8, 16, 32, 64, 128, 256],
  },
  {
    id: 'leitner_classic',
    name: 'Classic Spaced Repetition (SM-2)',
    description: 'Proven standard used by flashcard memory systems.',
    formulaDescription: 'Standard intervals: 1, 3, 7, 14, 30, 60, 120, 240...',
    defaultSteps: [1, 3, 7, 14, 30, 60, 120, 240],
  },
  {
    id: 'exponential',
    name: 'Exponential (1.6x Growth)',
    description: 'Smooth geometric progression (~1.618x multiplier per recap stage).',
    formulaDescription: 'Day ≈ round(1.618^n): 1, 2, 3, 5, 8, 14, 23, 37, 60, 97...',
    defaultSteps: [1, 2, 3, 5, 8, 14, 23, 37, 60, 97, 157],
  },
  {
    id: 'sublinear_log',
    name: 'Gentle Logarithmic / Triangular',
    description: 'Gradual ramp up with frequent early reinforcement for tricky skills or habits.',
    formulaDescription: 'Incremental step: 1, 2, 4, 7, 11, 16, 22, 29, 37, 46, 56...',
    defaultSteps: [1, 2, 4, 7, 11, 16, 22, 29, 37, 46, 56, 70],
  },
  {
    id: 'periodic_sine',
    name: 'Wave / Cyclic Rhythm',
    description: 'Blends periodic cycles with expanding gaps (revisit on weekend/midweek rhythm).',
    formulaDescription: 'Harmonic spaced cycle: 1, 3, 7, 10, 14, 21, 28, 42, 63, 91...',
    defaultSteps: [1, 3, 7, 10, 14, 21, 28, 42, 63, 91, 126],
  },
  {
    id: 'custom',
    name: 'Manual List of Days',
    description: 'Manually enter your exact list of cumulative review days.',
    formulaDescription: 'Custom days: e.g. 1, 2, 5, 10, 20, 45, 90',
    defaultSteps: [1, 2, 4, 7, 15, 30, 60],
    isCustomizable: true,
  },
];

/**
 * Standard Fibonacci number helper
 */
export function fib(n: number): number {
  if (n <= 0) return 0;
  if (n === 1) return 1;
  let a = 0;
  let b = 1;
  for (let i = 2; i <= n; i++) {
    const c = a + b;
    a = b;
    b = c;
  }
  return b;
}

export interface EquationResult {
  steps: number[];
  error?: string;
}

/**
 * Safely evaluates a mathematical equation string f(n) over n = 1...stepCount
 */
export function evaluateEquation(
  formula: string,
  stepCount: number = 10
): EquationResult {
  if (!formula || !formula.trim()) {
    return { steps: [1, 2, 4, 7, 14, 28, 56], error: 'Formula is empty' };
  }

  // Preprocess formula: replace ^ with **
  const sanitized = formula.replace(/\^/g, '**');

  try {
    // Build evaluator function with Math context
    const fn = new Function(
      'n',
      'fib',
      'sin',
      'cos',
      'tan',
      'pow',
      'sqrt',
      'round',
      'floor',
      'ceil',
      'log',
      'log2',
      'log10',
      'exp',
      'abs',
      'min',
      'max',
      'PI',
      'E',
      `return (${sanitized});`
    );

    const steps: number[] = [];
    let lastDay = 0;

    for (let n = 1; n <= Math.min(Math.max(stepCount, 3), 30); n++) {
      let val = fn(
        n,
        fib,
        Math.sin,
        Math.cos,
        Math.tan,
        Math.pow,
        Math.sqrt,
        Math.round,
        Math.floor,
        Math.ceil,
        Math.log,
        Math.log2,
        Math.log10,
        Math.exp,
        Math.abs,
        Math.min,
        Math.max,
        Math.PI,
        Math.E
      );

      if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) {
        return { steps: [1, 2, 3, 5, 8], error: `Evaluation produced non-numeric result at n=${n}` };
      }

      let dayVal = Math.round(val);
      // Ensure positive and strictly increasing so each recap has a distinct calendar date
      if (dayVal <= lastDay) {
        dayVal = lastDay + 1;
      }
      steps.push(dayVal);
      lastDay = dayVal;
    }

    return { steps };
  } catch (err: any) {
    return {
      steps: [1, 2, 3, 5, 8, 13],
      error: err.message || 'Syntax error in equation',
    };
  }
}

/**
 * Add days to a YYYY-MM-DD date string safely without timezone offset issues.
 */
export function addDaysToDateString(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return formatDateToISO(date);
}

/**
 * Format Date to YYYY-MM-DD string
 */
export function formatDateToISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Get today's date formatted as YYYY-MM-DD in local time
 */
export function getTodayDateString(): string {
  return formatDateToISO(new Date());
}

/**
 * Calculate difference in calendar days between two YYYY-MM-DD dates (d2 - d1)
 */
export function diffCalendarDays(d1: string, d2: string): number {
  const [y1, m1, day1] = d1.split('-').map(Number);
  const [y2, m2, day2] = d2.split('-').map(Number);
  const dt1 = new Date(y1, m1 - 1, day1);
  const dt2 = new Date(y2, m2 - 1, day2);
  const diffTime = dt2.getTime() - dt1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Generate milestones for a topic given start date, sequence type, custom steps, or equation
 */
export function generateMilestones(
  startDate: string,
  sequenceType: SequenceType,
  customSteps?: number[],
  customEquation?: string,
  equationStepsCount: number = 10
): ReviewMilestone[] {
  let steps: number[] = [];

  if (sequenceType === 'equation' && customEquation) {
    const res = evaluateEquation(customEquation, equationStepsCount);
    steps = res.steps;
  } else if (sequenceType === 'custom' && customSteps && customSteps.length > 0) {
    steps = [...customSteps].sort((a, b) => a - b);
  } else {
    const preset = SEQUENCE_PRESETS.find((p) => p.id === sequenceType) || SEQUENCE_PRESETS[0];
    steps = preset.defaultSteps;
  }

  let prevDay = 0;
  return steps.map((cumulativeDays, idx) => {
    const intervalFromPrev = cumulativeDays - prevDay;
    prevDay = cumulativeDays;
    const targetDate = addDaysToDateString(startDate, cumulativeDays);

    return {
      id: `milestone-${idx}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      stageIndex: idx + 1,
      intervalFromStart: cumulativeDays,
      intervalFromPrev,
      targetDate,
      snoozedDays: 0,
      effectiveDate: targetDate,
    };
  });
}

/**
 * Snooze a specific milestone by +days without breaking the remaining sequence
 */
export function snoozeMilestone(
  milestones: ReviewMilestone[],
  milestoneId: string,
  extraDays: number = 1
): ReviewMilestone[] {
  return milestones.map((m) => {
    if (m.id === milestoneId) {
      const newSnooze = m.snoozedDays + extraDays;
      const newEffective = addDaysToDateString(m.targetDate, newSnooze);
      return {
        ...m,
        snoozedDays: newSnooze,
        effectiveDate: newEffective,
      };
    }
    return m;
  });
}
