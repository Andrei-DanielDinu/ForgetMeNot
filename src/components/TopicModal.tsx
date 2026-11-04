import React, { useState, useEffect } from 'react';
import { Topic, SequenceType } from '../types';
import { 
  SEQUENCE_PRESETS, 
  generateMilestones, 
  evaluateEquation, 
  getTodayDateString 
} from '../utils/sequences';
import { X, Sparkles, Calendar, Clock, Info, Binary, FunctionSquare, ListOrdered, AlertCircle } from 'lucide-react';

interface TopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (topicData: Partial<Topic>) => void;
  initialTopic?: Topic | null;
}

const CATEGORY_PRESETS = [
  'Design & 3D',
  'Coding',
  'Habits & Living',
  'Languages',
  'Math & Science',
  'Music & Art',
  'Fitness',
];

const COLOR_OPTIONS = [
  '#6366f1', // Indigo
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#3b82f6', // Blue
  '#ef4444', // Red
];

const EQUATION_TEMPLATES = [
  { label: 'Golden Ratio (1.618^n)', formula: 'round(pow(1.618, n))' },
  { label: 'Fibonacci fib(n)', formula: 'fib(n)' },
  { label: 'Powers of 2 (2^n)', formula: 'pow(2, n)' },
  { label: 'Sine Wave Cycle', formula: 'round(n * 4 + 2 * sin(n))' },
  { label: 'Logarithmic Ramp', formula: 'round(4 * n * log(n + 1))' },
  { label: 'Quadratic (n²)', formula: 'round(n * n)' },
  { label: 'Weekly Rhythm (7n)', formula: 'n * 7' },
];

export const TopicModal: React.FC<TopicModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTopic,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORY_PRESETS[0]);
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [reminderTime, setReminderTime] = useState('09:00');
  const [sequenceType, setSequenceType] = useState<SequenceType>('fibonacci');
  const [customDaysStr, setCustomDaysStr] = useState('1, 2, 4, 7, 15, 30, 60');
  const [customEquation, setCustomEquation] = useState('round(pow(1.618, n))');
  const [equationStepsCount, setEquationStepsCount] = useState(10);
  const [color, setColor] = useState(COLOR_OPTIONS[0]);

  useEffect(() => {
    if (initialTopic) {
      setName(initialTopic.name);
      setCategory(initialTopic.category || CATEGORY_PRESETS[0]);
      setDescription(initialTopic.description || '');
      setStartDate(initialTopic.startDate || getTodayDateString());
      setReminderTime(initialTopic.reminderTime || '09:00');
      setSequenceType(initialTopic.sequenceType || 'fibonacci');
      setColor(initialTopic.color || COLOR_OPTIONS[0]);
      if (initialTopic.customIntervals) {
        setCustomDaysStr(initialTopic.customIntervals.join(', '));
      }
      if (initialTopic.customEquation) {
        setCustomEquation(initialTopic.customEquation);
      }
      if (initialTopic.equationStepsCount) {
        setEquationStepsCount(initialTopic.equationStepsCount);
      }
    } else {
      setName('');
      setCategory(CATEGORY_PRESETS[0]);
      setDescription('');
      setStartDate(getTodayDateString());
      setReminderTime('09:00');
      setSequenceType('fibonacci');
      setColor(COLOR_OPTIONS[0]);
      setCustomDaysStr('1, 2, 4, 7, 15, 30, 60');
      setCustomEquation('round(pow(1.618, n))');
      setEquationStepsCount(10);
    }
  }, [initialTopic, isOpen]);

  if (!isOpen) return null;

  // Parse custom days if needed
  const parsedCustomSteps = customDaysStr
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n > 0);

  // Check equation validation
  const equationResult = sequenceType === 'equation' ? evaluateEquation(customEquation, equationStepsCount) : null;

  // Generate preview milestones
  const previewMilestones = generateMilestones(
    startDate || getTodayDateString(),
    sequenceType,
    sequenceType === 'custom' ? parsedCustomSteps : undefined,
    sequenceType === 'equation' ? customEquation : undefined,
    equationStepsCount
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      category: category.trim(),
      description: description.trim(),
      startDate,
      reminderTime,
      sequenceType,
      color,
      customIntervals: sequenceType === 'custom' ? parsedCustomSteps : undefined,
      customEquation: sequenceType === 'equation' ? customEquation : undefined,
      equationStepsCount: sequenceType === 'equation' ? equationStepsCount : undefined,
    });
    onClose();
  };

  const selectedPreset = SEQUENCE_PRESETS.find((p) => p.id === sequenceType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        role="dialog"
        aria-labelledby="modal-title"
        aria-modal="true"
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 id="modal-title" className="text-base font-bold text-white">
              {initialTopic ? 'Edit Topic & Sequence' : 'Create New Learning Topic'}
            </h2>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Topic Name */}
          <div>
            <label htmlFor="topic-name" className="block text-xs font-semibold text-slate-300 mb-1">
              Topic Name *
            </label>
            <input
              id="topic-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Parametric Design, Full-Stack TypeScript, Studio Cleaning"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
            />
          </div>

          {/* Category & Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="category-select" className="block text-xs font-semibold text-slate-300 mb-1">
                Category
              </label>
              <input
                id="category-select"
                type="text"
                list="category-options"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Category"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <datalist id="category-options">
                {CATEGORY_PRESETS.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Color Accent
              </label>
              <div className="flex items-center gap-1.5 pt-1">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-110 opacity-70'
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Description & Practice Goal */}
          <div>
            <label htmlFor="topic-desc" className="block text-xs font-semibold text-slate-300 mb-1">
              Description & Exercises Goal
            </label>
            <textarea
              id="topic-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What exercises, projects, or techniques will you practice during each recap session?"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Start Date & Daily Reminder Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="start-date" className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Start Day (Day 0)
              </label>
              <input
                id="start-date"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <div>
              <label htmlFor="reminder-time" className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Reminder Time
              </label>
              <input
                id="reminder-time"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          {/* Spaced Repetition Sequence Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Interval Sequence Function
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {SEQUENCE_PRESETS.map((p) => {
                const isSelected = sequenceType === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSequenceType(p.id)}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-800/50 border-slate-700/70 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{p.name}</span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {p.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* If Equation Sequence Selected */}
          {sequenceType === 'equation' && (
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-indigo-500/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <FunctionSquare className="w-4 h-4" />
                  Custom Mathematical Equation f(n)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  n = 1, 2, 3...
                </span>
              </div>

              <div>
                <label htmlFor="equation-input" className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Formula expression for day:
                </label>
                <input
                  id="equation-input"
                  type="text"
                  value={customEquation}
                  onChange={(e) => setCustomEquation(e.target.value)}
                  placeholder="e.g. round(pow(1.618, n)), round(n * 4 + 2 * sin(n))"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:ring-2 focus:ring-indigo-500/50"
                />
                {equationResult?.error && (
                  <div className="flex items-center gap-1.5 text-[11px] text-rose-400 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{equationResult.error}</span>
                  </div>
                )}
              </div>

              {/* Number of stages */}
              <div className="flex items-center justify-between gap-3 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <label htmlFor="step-count" className="text-xs text-slate-300">
                  Number of recap stages to generate:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="step-count"
                    type="range"
                    min="3"
                    max="20"
                    value={equationStepsCount}
                    onChange={(e) => setEquationStepsCount(parseInt(e.target.value, 10))}
                    className="w-24 accent-indigo-500"
                  />
                  <span className="text-xs font-mono font-bold text-indigo-300 w-5">
                    {equationStepsCount}
                  </span>
                </div>
              </div>

              {/* Clickable Templates */}
              <div>
                <div className="text-[11px] text-slate-400 mb-1.5 font-medium">
                  Quick Equation Presets:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {EQUATION_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.label}
                      type="button"
                      onClick={() => setCustomEquation(tmpl.formula)}
                      className="px-2 py-1 rounded-md text-[10px] bg-slate-900/80 hover:bg-indigo-950/80 text-slate-300 hover:text-indigo-300 border border-slate-700/80 hover:border-indigo-600 transition-colors font-mono"
                    >
                      {tmpl.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* If Manual Custom List Selected */}
          {sequenceType === 'custom' && (
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-indigo-500/50 space-y-2">
              <label htmlFor="custom-steps" className="block text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <ListOrdered className="w-4 h-4 text-indigo-400" />
                Manual Cumulative Days (comma separated)
              </label>
              <input
                id="custom-steps"
                type="text"
                value={customDaysStr}
                onChange={(e) => setCustomDaysStr(e.target.value)}
                placeholder="e.g. 1, 2, 4, 7, 15, 30, 60"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
              />
              <p className="text-[11px] text-slate-400">
                Number of days elapsed from Day 0 for each recap.
              </p>
            </div>
          )}

          {/* Live Preview Schedule */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold mb-2">
              <span className="flex items-center gap-1 text-indigo-300">
                <Info className="w-3.5 h-3.5" />
                Calculated Schedule Preview ({selectedPreset?.name})
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {previewMilestones.length} Milestones
              </span>
            </div>

            <div className="max-h-36 overflow-y-auto pr-1 space-y-1.5">
              {previewMilestones.map((m) => (
                <div
                  key={m.stageIndex}
                  className="flex items-center justify-between text-[11px] bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800/80"
                >
                  <span className="font-semibold text-slate-200">
                    Stage {m.stageIndex}: +{m.intervalFromStart} days (Δ +{m.intervalFromPrev}d)
                  </span>
                  <span className="text-indigo-300 font-mono">
                    {m.targetDate}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Submit / Cancel Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/30 transition-all"
            >
              {initialTopic ? 'Save Changes' : 'Create Topic'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
