import React from 'react';
import { Plus, Bell, BellRing, Download, Sparkles, Calendar as CalendarIcon, ListTodo } from 'lucide-react';
import { requestNotificationPermission } from '../utils/storage';

interface HeaderProps {
  onNewTopic: () => void;
  onOpenBackup: () => void;
  activeView: 'list' | 'calendar';
  onViewChange: (view: 'list' | 'calendar') => void;
  hasNotifications: boolean;
  onNotificationsGranted: () => void;
  dueCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onNewTopic,
  onOpenBackup,
  activeView,
  onViewChange,
  hasNotifications,
  onNotificationsGranted,
  dueCount,
}) => {
  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      onNotificationsGranted();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 py-2.5 sm:px-6 sm:py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-2 min-w-0 shrink">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-md shadow-indigo-500/20 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div className="min-w-0 truncate">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-white truncate">
                ForgetMeNot
              </h1>
              <span className="hidden xs:inline-block text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 shrink-0">
                FIB
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden md:block">
              Spaced Repetition & Habits
            </p>
          </div>
        </div>

        {/* View Toggle & Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* View Switcher */}
          <div className="bg-slate-800/90 p-0.5 rounded-lg border border-slate-700/60 flex items-center shrink-0">
            <button
              type="button"
              onClick={() => onViewChange('list')}
              className={`flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeView === 'list'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Topics & Due Reviews"
              aria-label="Schedule view"
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Schedule</span>
              {dueCount > 0 && (
                <span className="px-1 py-0.2 bg-rose-500 text-white text-[9px] font-bold rounded-full min-w-[14px] text-center">
                  {dueCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => onViewChange('calendar')}
              className={`flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeView === 'calendar'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Calendar Timeline View"
              aria-label="Calendar view"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Calendar</span>
            </button>
          </div>

          {/* Notifications button */}
          <button
            type="button"
            onClick={handleEnableNotifications}
            className={`p-1.5 sm:p-2 rounded-lg border transition-all text-xs font-medium flex items-center justify-center shrink-0 ${
              hasNotifications
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title={hasNotifications ? 'Notifications enabled' : 'Enable browser notifications'}
            aria-label={hasNotifications ? 'Notifications active' : 'Enable notifications'}
          >
            {hasNotifications ? <BellRing className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" /> : <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          {/* Data Backup */}
          <button
            type="button"
            onClick={onOpenBackup}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors shrink-0"
            title="Backup & Restore Data"
            aria-label="Backup and restore data"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* New Topic Button */}
          <button
            type="button"
            onClick={onNewTopic}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg shadow-md shadow-indigo-600/25 active:scale-95 transition-all shrink-0"
            aria-label="Add new topic"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">New Topic</span>
            <span className="sm:hidden text-xs">Topic</span>
          </button>
        </div>
      </div>
    </header>
  );
};
