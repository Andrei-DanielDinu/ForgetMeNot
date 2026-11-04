export type SequenceType = 
  | 'fibonacci'
  | 'powers_of_2'
  | 'leitner_classic'
  | 'exponential'
  | 'sublinear_log'
  | 'periodic_sine'
  | 'equation'
  | 'custom';

export interface SequencePreset {
  id: SequenceType;
  name: string;
  description: string;
  formulaDescription: string;
  defaultSteps: number[]; // relative offsets in days from previous step, or cumulative days
  isCustomizable?: boolean;
}

export interface ReviewMilestone {
  id: string;
  stageIndex: number;
  intervalFromStart: number; // cumulative days from start
  intervalFromPrev: number;  // days since previous review
  targetDate: string;        // YYYY-MM-DD
  snoozedDays: number;       // number of days snoozed (e.g. +1, +2)
  effectiveDate: string;     // YYYY-MM-DD after snooze
  completedAt?: string;      // ISO datetime when completed
  notes?: string;            // User's recap notes & exercise journal
  difficulty?: 'easy' | 'medium' | 'hard' | 'skipped';
}

export interface Topic {
  id: string;
  name: string;
  category: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  reminderTime: string; // HH:MM e.g. "09:00"
  sequenceType: SequenceType;
  customIntervals?: number[]; // if custom manual sequence is used
  customEquation?: string;    // if equation formula is used (e.g. "round(pow(1.618, n))")
  equationStepsCount?: number; // number of stages to generate from equation (default 10)
  milestones: ReviewMilestone[];
  createdAt: string;
  color: string;
  archived?: boolean;
}

export interface FilterState {
  search: string;
  category: string;
  status: 'all' | 'due' | 'upcoming' | 'completed';
}
