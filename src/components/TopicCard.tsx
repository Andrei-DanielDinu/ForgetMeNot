import React, { useState } from 'react';
import { Topic, ReviewMilestone } from '../types';
import { getTodayDateString, diffCalendarDays } from '../utils/sequences';
import { SEQUENCE_PRESETS } from '../utils/sequences';
import { downloadICS, getGoogleCalendarUrl } from '../utils/calendarExport';
import { 
  Check, 
  Clock, 
  Calendar, 
  ChevronRight, 
  ChevronDown, 
  Download, 
  Moon, 
  Edit3, 
  Trash2, 
  Sparkles,
  BookOpen,
  CalendarDays
} from 'lucide-react';

interface TopicCardProps {
  topic: Topic;
  onOpenNotes: (topic: Topic, milestone: ReviewMilestone) => void;
  onSnooze: (topicId: string, milestoneId: string) => void;
  onEdit: (topic: Topic) => void;
  onDelete: (topicId: string) => void;
}

export const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  onOpenNotes,
  onSnooze,
  onEdit,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const today = getTodayDateString();

  const preset = SEQUENCE_PRESETS.find((p) => p.id === topic.sequenceType);
  const completedCount = topic.milestones.filter((m) => m.completedAt).length;
  const totalCount = topic.milestones.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  // Find next pending milestone
  const nextMilestone = topic.milestones.find((m) => !m.completedAt);
  const daysUntilNext = nextMilestone ? diffCalendarDays(today, nextMilestone.effectiveDate) : null;

  return (
    <div className="bg-slate-800/60 border border-slate-700/70 hover:border-slate-600/80 rounded-2xl p-4 sm:p-5 shadow-sm transition-all">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: topic.color || '#6366f1' }}
            />
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
              {topic.name}
            </h3>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
              {topic.category || 'General'}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-950/70 text-indigo-300 border border-indigo-800/50">
              {preset?.name || topic.sequenceType}
            </span>
          </div>

          {topic.description && (
            <p className="text-xs text-slate-300 mb-2 line-clamp-2">
              {topic.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
            <span>Started: <strong className="text-slate-300 font-medium">{topic.startDate}</strong></span>
            {topic.reminderTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {topic.reminderTime}
              </span>
            )}
            <span>
              Recaps: <strong className="text-indigo-300 font-semibold">{completedCount}</strong>/{totalCount}
            </span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => downloadICS(topic)}
            className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-700/60 rounded-lg transition-colors"
            title="Download .ics Calendar File"
            aria-label="Download calendar file"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(topic)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 rounded-lg transition-colors"
            title="Edit topic settings"
            aria-label="Edit topic"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(topic.id)}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
            title="Delete topic"
            aria-label="Delete topic"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3.5 mb-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
          <span>Retention Trajectory</span>
          <span>{progressPercent}% Complete</span>
        </div>
        <div className="w-full h-1.5 bg-slate-700/70 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Next Upcoming Recap Badge / Quick Action */}
      {nextMilestone && (
        <div className="mt-3 bg-slate-900/60 border border-slate-700/50 rounded-xl p-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-200 truncate">
                Stage {nextMilestone.stageIndex}: Day +{nextMilestone.intervalFromStart}
                {nextMilestone.snoozedDays > 0 && (
                  <span className="ml-1.5 text-[10px] text-amber-400 font-normal">
                    (snoozed +{nextMilestone.snoozedDays}d)
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400">
                {daysUntilNext === 0 ? (
                  <span className="text-amber-400 font-semibold">Due today ({nextMilestone.effectiveDate})</span>
                ) : daysUntilNext! < 0 ? (
                  <span className="text-rose-400 font-semibold">{Math.abs(daysUntilNext!)} days overdue ({nextMilestone.effectiveDate})</span>
                ) : (
                  <span>Scheduled for {nextMilestone.effectiveDate} (in {daysUntilNext} days)</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onSnooze(topic.id, nextMilestone.id)}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 flex items-center gap-1 transition-colors"
              title="Snooze this reminder by +1 day"
            >
              <Moon className="w-3 h-3 text-amber-400" />
              <span>+1d</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenNotes(topic, nextMilestone)}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-sm"
            >
              <BookOpen className="w-3 h-3" />
              <span>Recap</span>
            </button>
          </div>
        </div>
      )}

      {/* Expand/Collapse Timeline */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full mt-3 pt-2 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition-colors"
      >
        <span>
          {isExpanded ? 'Hide Milestone Journey' : 'View Full Milestone Sequence & Notes'}
        </span>
        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Expanded Roadmap Timeline */}
      {isExpanded && (
        <div className="mt-3 space-y-2 pt-1 border-t border-slate-700/30">
          <div className="text-[11px] text-slate-400 font-medium px-1 mb-2">
            Formula Progression: <span className="text-indigo-300 font-mono">{preset?.formulaDescription}</span>
          </div>

          <div className="space-y-2">
            {topic.milestones.map((m) => {
              const isDone = !!m.completedAt;
              const isNext = !isDone && nextMilestone?.id === m.id;
              const gcalUrl = getGoogleCalendarUrl(topic, m);

              return (
                <div
                  key={m.id}
                  className={`p-2.5 rounded-xl border text-xs transition-all ${
                    isDone
                      ? 'bg-slate-900/40 border-slate-800 text-slate-300'
                      : isNext
                      ? 'bg-indigo-950/30 border-indigo-500/50 text-indigo-100 shadow-sm'
                      : 'bg-slate-900/20 border-slate-800/70 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isDone
                            ? 'bg-emerald-500 text-slate-950'
                            : isNext
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : m.stageIndex}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-200">
                          Stage {m.stageIndex} (Day +{m.intervalFromStart})
                        </span>
                        <span className="text-slate-400 text-[11px] ml-2 font-mono">
                          {m.effectiveDate}
                        </span>
                        {m.snoozedDays > 0 && (
                          <span className="ml-1.5 text-[10px] text-amber-400 font-medium">
                            +{m.snoozedDays}d snoozed
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <a
                        href={gcalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded text-slate-400 hover:text-white"
                        title="Add to Google Calendar"
                      >
                        <CalendarDays className="w-3.5 h-3.5" />
                      </a>
                      {!isDone && (
                        <button
                          type="button"
                          onClick={() => onSnooze(topic.id, m.id)}
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700"
                        >
                          +1d
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onOpenNotes(topic, m)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                          isDone
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        }`}
                      >
                        {isDone ? 'Edit Notes' : 'Log'}
                      </button>
                    </div>
                  </div>

                  {/* Notes snippet if completed */}
                  {m.notes && (
                    <div className="mt-2 pl-7 pr-1 text-[11px] text-slate-300 bg-slate-950/40 p-2 rounded-lg border border-slate-800/80">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">
                        Logged Notes {m.completedAt ? `(${new Date(m.completedAt).toLocaleDateString()})` : ''}
                      </div>
                      <p className="whitespace-pre-wrap">{m.notes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
