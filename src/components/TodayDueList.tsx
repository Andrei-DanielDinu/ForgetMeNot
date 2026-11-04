import React from 'react';
import { Topic, ReviewMilestone } from '../types';
import { getTodayDateString, diffCalendarDays } from '../utils/sequences';
import { CheckCircle2, Clock, CalendarDays, ExternalLink, Moon, Sparkles, BookOpen } from 'lucide-react';
import { getGoogleCalendarUrl } from '../utils/calendarExport';

interface TodayDueListProps {
  topics: Topic[];
  onOpenNotes: (topic: Topic, milestone: ReviewMilestone) => void;
  onSnooze: (topicId: string, milestoneId: string) => void;
}

export const TodayDueList: React.FC<TodayDueListProps> = ({
  topics,
  onOpenNotes,
  onSnooze,
}) => {
  const today = getTodayDateString();

  // Find all uncompleted milestones that are due today or overdue
  const dueItems: { topic: Topic; milestone: ReviewMilestone; daysDiff: number }[] = [];

  topics.forEach((topic) => {
    if (topic.archived) return;

    // We only care about the earliest active uncompleted milestone for each topic
    const activeMilestone = topic.milestones.find((m) => !m.completedAt);
    if (activeMilestone) {
      const diff = diffCalendarDays(today, activeMilestone.effectiveDate); // <= 0 means due today or past due
      if (diff <= 0) {
        dueItems.push({
          topic,
          milestone: activeMilestone,
          daysDiff: diff,
        });
      }
    }
  });

  // Sort by most overdue first
  dueItems.sort((a, b) => a.daysDiff - b.daysDiff);

  if (dueItems.length === 0) {
    return (
      <section className="bg-slate-800/40 border border-slate-800 rounded-2xl p-5 mb-6 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-200">
              All caught up for today!
            </h2>
            <p className="text-xs text-slate-400">
              No pending reviews due right now. Your retention is on track. Check your upcoming schedule below!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-rose-400">
            Due For Recap ({dueItems.length})
          </h2>
        </div>
        <span className="text-xs text-slate-400">
          Fight the forgetting curve today
        </span>
      </div>

      <div className="space-y-3">
        {dueItems.map(({ topic, milestone, daysDiff }) => {
          const isOverdue = daysDiff < 0;
          const gcalUrl = getGoogleCalendarUrl(topic, milestone);

          return (
            <div
              key={`${topic.id}-${milestone.id}`}
              className="bg-gradient-to-r from-slate-800/90 to-slate-800/60 border border-slate-700/80 hover:border-slate-600 rounded-2xl p-4 shadow-sm transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Topic Info */}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: topic.color || '#6366f1' }}
                    />
                    <h3 className="font-semibold text-base text-white tracking-tight">
                      {topic.name}
                    </h3>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-300 border border-slate-600/50">
                      {topic.category || 'General'}
                    </span>
                    {isOverdue ? (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-950/70 text-rose-300 border border-rose-800/60">
                        {Math.abs(daysDiff)} {Math.abs(daysDiff) === 1 ? 'day' : 'days'} overdue
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-950/70 text-amber-300 border border-amber-800/60">
                        Due Today
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2">
                    {topic.description || 'Practice and exercise session for this milestone.'}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1 font-mono text-indigo-300 bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-900/60">
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      Stage {milestone.stageIndex} (Day +{milestone.intervalFromStart})
                    </span>
                    {milestone.snoozedDays > 0 && (
                      <span className="text-amber-400/90 font-medium">
                        Snoozed +{milestone.snoozedDays}d
                      </span>
                    )}
                    {topic.reminderTime && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3" />
                        {topic.reminderTime}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 sm:pt-0 shrink-0 border-t border-slate-700/50 sm:border-0 justify-end">
                  {/* Google Calendar Link */}
                  <a
                    href={gcalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600/50 transition-colors"
                    title="Add event to Google Calendar"
                    aria-label="Add to Google Calendar"
                  >
                    <CalendarDays className="w-4 h-4" />
                  </a>

                  {/* Snooze 1 Day */}
                  <button
                    type="button"
                    onClick={() => onSnooze(topic.id, milestone.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600/60 active:scale-95 transition-all"
                    title="Snooze this reminder by 1 day without changing the rest of the sequence"
                  >
                    <Moon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Snooze +1d</span>
                  </button>

                  {/* Log Recap & Complete */}
                  <button
                    type="button"
                    onClick={() => onOpenNotes(topic, milestone)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 active:scale-95 transition-all"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Recap & Notes</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
