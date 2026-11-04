import React, { useState } from 'react';
import { Topic, ReviewMilestone } from '../types';
import { getTodayDateString } from '../utils/sequences';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check, Clock } from 'lucide-react';

interface CalendarViewProps {
  topics: Topic[];
  onOpenNotes: (topic: Topic, milestone: ReviewMilestone) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ topics, onOpenNotes }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = getTodayDateString();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const gotoToday = () => setCurrentDate(new Date());

  // Build calendar days
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create mapping of YYYY-MM-DD -> list of items
  const eventsByDate = new Map<string, { topic: Topic; milestone: ReviewMilestone }[]>();

  topics.forEach((topic) => {
    if (topic.archived) return;
    topic.milestones.forEach((m) => {
      const dateKey = m.effectiveDate;
      const list = eventsByDate.get(dateKey) || [];
      list.push({ topic, milestone: m });
      eventsByDate.set(dateKey, list);
    });
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-slate-800/60 border border-slate-700/70 rounded-2xl p-4 sm:p-5 shadow-sm">
      {/* Month Navigation Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white">
            {monthNames[month]} {year}
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={gotoToday}
            className="px-2.5 py-1 text-xs font-semibold bg-slate-700/70 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            type="button"
            onClick={prevMonth}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-400 mb-1">
        {daysOfWeek.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Grid of Days */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {/* Leading empty cells */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[70px] sm:min-h-[85px] rounded-xl bg-slate-900/20" />
        ))}

        {/* Days of current month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const isToday = dateStr === today;
          const events = eventsByDate.get(dateStr) || [];

          return (
            <div
              key={dateStr}
              className={`min-h-[70px] sm:min-h-[85px] p-1 sm:p-1.5 rounded-xl border flex flex-col transition-all ${
                isToday
                  ? 'bg-indigo-950/40 border-indigo-500/60 shadow-sm ring-1 ring-indigo-500/40'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                    isToday
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  {dayNum}
                </span>
                {events.length > 0 && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    {events.length}
                  </span>
                )}
              </div>

              {/* Event pills */}
              <div className="flex-1 space-y-1 overflow-y-auto max-h-[50px] sm:max-h-[60px]">
                {events.map(({ topic, milestone }) => {
                  const isDone = !!milestone.completedAt;
                  return (
                    <button
                      key={`${topic.id}-${milestone.id}`}
                      type="button"
                      onClick={() => onOpenNotes(topic, milestone)}
                      className={`w-full text-left px-1.5 py-0.5 rounded text-[10px] font-medium truncate flex items-center gap-1 transition-transform hover:scale-[1.02] ${
                        isDone
                          ? 'bg-slate-800 text-slate-400 opacity-60'
                          : 'text-white shadow-sm'
                      }`}
                      style={{
                        backgroundColor: isDone ? undefined : (topic.color ? `${topic.color}33` : '#6366f133'),
                        borderLeft: `2.5px solid ${topic.color || '#6366f1'}`
                      }}
                      title={`${topic.name} (Stage ${milestone.stageIndex})${milestone.notes ? ` - ${milestone.notes}` : ''}`}
                    >
                      {isDone && <Check className="w-2.5 h-2.5 text-emerald-400 shrink-0" />}
                      <span className="truncate">{topic.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
