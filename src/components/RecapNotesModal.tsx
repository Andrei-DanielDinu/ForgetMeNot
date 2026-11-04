import React, { useState, useEffect } from 'react';
import { Topic, ReviewMilestone } from '../types';
import { X, CheckCircle2, Moon, Sparkles, BookOpen, Calendar, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RecapNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: Topic | null;
  milestone: ReviewMilestone | null;
  onSave: (topicId: string, milestoneId: string, notes: string, difficulty: 'easy' | 'medium' | 'hard') => void;
  onSnooze: (topicId: string, milestoneId: string) => void;
}

export const RecapNotesModal: React.FC<RecapNotesModalProps> = ({
  isOpen,
  onClose,
  topic,
  milestone,
  onSave,
  onSnooze,
}) => {
  const [notes, setNotes] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  useEffect(() => {
    if (milestone) {
      setNotes(milestone.notes || '');
      setDifficulty(milestone.difficulty && milestone.difficulty !== 'skipped' ? milestone.difficulty : 'medium');
    }
  }, [milestone, isOpen]);

  if (!isOpen || !topic || !milestone) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(topic.id, milestone.id, notes.trim(), difficulty);

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b'],
      });
    } catch (err) {
      console.warn('Confetti error:', err);
    }

    onClose();
  };

  const handleSnoozeOneDay = () => {
    onSnooze(topic.id, milestone.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        role="dialog"
        aria-labelledby="recap-title"
        aria-modal="true"
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-6 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 id="recap-title" className="text-base font-bold text-white">
                Log Recap Session
              </h2>
              <p className="text-xs text-slate-400">
                Stage {milestone.stageIndex} • Day +{milestone.intervalFromStart} of sequence
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          {/* Topic Brief */}
          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/70 space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: topic.color || '#6366f1' }}
              />
              <span className="font-bold text-sm text-white">{topic.name}</span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                {topic.category}
              </span>
            </div>
            {topic.description && (
              <p className="text-xs text-slate-300 pt-1">
                <strong className="text-slate-400 font-semibold">Goal:</strong> {topic.description}
              </p>
            )}
            <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
              <span>Date: <strong className="text-slate-300 font-medium">{milestone.effectiveDate}</strong></span>
              {milestone.snoozedDays > 0 && (
                <span className="text-amber-400 font-medium">Snoozed +{milestone.snoozedDays}d</span>
              )}
            </div>
          </div>

          {/* Notes Textarea */}
          <div>
            <label htmlFor="recap-notes" className="block text-xs font-semibold text-slate-300 mb-1">
              Recap Notes & Exercises Completed
            </label>
            <textarea
              id="recap-notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What exercises or code did you practice today? Any sticky points, breakthroughs, or key concepts to remember?"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Difficulty / Recall rating */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Recall & Practice Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDifficulty('easy')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  difficulty === 'easy'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-sm'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                🌱 Easy Recall
              </button>
              <button
                type="button"
                onClick={() => setDifficulty('medium')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  difficulty === 'medium'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                ⚖️ Good Effort
              </button>
              <button
                type="button"
                onClick={() => setDifficulty('hard')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  difficulty === 'hard'
                    ? 'bg-rose-600/20 border-rose-500 text-rose-300 shadow-sm'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                🔥 Challenging
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            {/* Snooze button inside modal */}
            <button
              type="button"
              onClick={handleSnoozeOneDay}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-700 transition-colors"
              title="Postpone this session to tomorrow"
            >
              <Moon className="w-3.5 h-3.5 text-amber-400" />
              <span>Snooze +1 Day</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/30 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Recap</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
