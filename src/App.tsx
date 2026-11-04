import React, { useState, useEffect } from 'react';
import { Topic, ReviewMilestone } from './types';
import { loadTopics, saveTopics, sendLocalNotification } from './utils/storage';
import { generateMilestones, snoozeMilestone, getTodayDateString, diffCalendarDays } from './utils/sequences';
import { Header } from './components/Header';
import { TodayDueList } from './components/TodayDueList';
import { TopicCard } from './components/TopicCard';
import { CalendarView } from './components/CalendarView';
import { TopicModal } from './components/TopicModal';
import { RecapNotesModal } from './components/RecapNotesModal';
import { BackupModal } from './components/BackupModal';
import { Search, Filter, Sparkles, Brain, Plus } from 'lucide-react';

export const App: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>(() => loadTopics());
  const [activeView, setActiveView] = useState<'list' | 'calendar'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [hasNotifications, setHasNotifications] = useState(false);

  // Modals state
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [activeTopicForNotes, setActiveTopicForNotes] = useState<Topic | null>(null);
  const [activeMilestoneForNotes, setActiveMilestoneForNotes] = useState<ReviewMilestone | null>(null);

  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setHasNotifications(true);
    }
  }, []);

  // Save changes to localStorage whenever topics update
  const updateTopics = (newTopics: Topic[]) => {
    setTopics(newTopics);
    saveTopics(newTopics);
  };

  // Calculate Due Count for today or overdue
  const today = getTodayDateString();
  const dueCount = topics.reduce((count, topic) => {
    if (topic.archived) return count;
    const active = topic.milestones.find((m) => !m.completedAt);
    if (active && diffCalendarDays(today, active.effectiveDate) <= 0) {
      return count + 1;
    }
    return count;
  }, 0);

  // Check for daily reminder notification
  useEffect(() => {
    if (dueCount > 0 && hasNotifications) {
      sendLocalNotification(
        `ForgetMeNot: ${dueCount} Recap${dueCount > 1 ? 's' : ''} Due Today`,
        'Keep your memory retention sharp! Log your exercises and recap notes.'
      );
    }
  }, [dueCount, hasNotifications]);

  // Categories list
  const categories = ['All', ...Array.from(new Set(topics.map((t) => t.category).filter(Boolean)))];

  // Filtered topics
  const filteredTopics = topics.filter((t) => {
    if (t.archived) return false;
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handlers
  const handleCreateOrUpdateTopic = (topicData: Partial<Topic>) => {
    if (editingTopic) {
      // Editing existing topic
      const updated = topics.map((t) => {
        if (t.id === editingTopic.id) {
          // If start date or sequence changed, recalculate uncompleted milestones
          const isDateOrSeqChanged =
            topicData.startDate !== t.startDate ||
            topicData.sequenceType !== t.sequenceType;

          let newMilestones = t.milestones;
          if (isDateOrSeqChanged && topicData.startDate && topicData.sequenceType) {
            newMilestones = generateMilestones(
              topicData.startDate,
              topicData.sequenceType,
              topicData.customIntervals,
              topicData.customEquation,
              topicData.equationStepsCount
            );
          }

          return {
            ...t,
            ...topicData,
            milestones: newMilestones,
          };
        }
        return t;
      });
      updateTopics(updated);
    } else {
      // Creating new topic
      const newTopic: Topic = {
        id: `topic-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: topicData.name || 'Untitled Topic',
        category: topicData.category || 'General',
        description: topicData.description || '',
        startDate: topicData.startDate || today,
        reminderTime: topicData.reminderTime || '09:00',
        sequenceType: topicData.sequenceType || 'fibonacci',
        color: topicData.color || '#6366f1',
        createdAt: new Date().toISOString(),
        customIntervals: topicData.customIntervals,
        customEquation: topicData.customEquation,
        equationStepsCount: topicData.equationStepsCount,
        milestones: generateMilestones(
          topicData.startDate || today,
          topicData.sequenceType || 'fibonacci',
          topicData.customIntervals,
          topicData.customEquation,
          topicData.equationStepsCount
        ),
      };
      updateTopics([newTopic, ...topics]);
    }
    setEditingTopic(null);
  };

  const handleDeleteTopic = (topicId: string) => {
    const topic = topics.find((t) => t.id === topicId);
    if (window.confirm(`Are you sure you want to delete "${topic?.name}"?`)) {
      updateTopics(topics.filter((t) => t.id !== topicId));
    }
  };

  // Snooze a specific reminder by +1 day without messing up the sequence!
  const handleSnooze = (topicId: string, milestoneId: string) => {
    const updated = topics.map((t) => {
      if (t.id === topicId) {
        return {
          ...t,
          milestones: snoozeMilestone(t.milestones, milestoneId, 1),
        };
      }
      return t;
    });
    updateTopics(updated);
  };

  // Open Recap Notes Modal
  const handleOpenNotes = (topic: Topic, milestone: ReviewMilestone) => {
    setActiveTopicForNotes(topic);
    setActiveMilestoneForNotes(milestone);
    setIsNotesModalOpen(true);
  };

  // Save Recap Notes and mark complete
  const handleSaveNotes = (
    topicId: string,
    milestoneId: string,
    notes: string,
    difficulty: 'easy' | 'medium' | 'hard'
  ) => {
    const updated = topics.map((t) => {
      if (t.id === topicId) {
        return {
          ...t,
          milestones: t.milestones.map((m) => {
            if (m.id === milestoneId) {
              return {
                ...m,
                completedAt: m.completedAt || new Date().toISOString(),
                notes,
                difficulty,
              };
            }
            return m;
          }),
        };
      }
      return t;
    });
    updateTopics(updated);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-16">
      {/* Header bar */}
      <Header
        onNewTopic={() => {
          setEditingTopic(null);
          setIsTopicModalOpen(true);
        }}
        onOpenBackup={() => setIsBackupModalOpen(true)}
        activeView={activeView}
        onViewChange={setActiveView}
        hasNotifications={hasNotifications}
        onNotificationsGranted={() => setHasNotifications(true)}
        dueCount={dueCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-5 sm:px-6">
        {/* Intro Banner: Fighting the Forgetting Curve */}
        <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-900/40 rounded-2xl p-4 sm:p-5 mb-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white tracking-tight">
                  Fibonacci Spaced Repetition
                </h2>
              </div>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Counteract exponential forgetting. Start on day 0, then recap on days <span className="text-indigo-300 font-mono font-semibold">+1, +2, +3, +5, +8, +13, +21, +34...</span> Log your exercises and session notes at each milestone to lock skills into permanent long-term memory.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingTopic(null);
                setIsTopicModalOpen(true);
              }}
              className="hidden sm:flex items-center gap-1.5 shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Topic</span>
            </button>
          </div>
        </div>

        {/* View Content */}
        {activeView === 'calendar' ? (
          <CalendarView topics={topics} onOpenNotes={handleOpenNotes} />
        ) : (
          <>
            {/* High Priority: Due Today or Overdue Reviews */}
            <TodayDueList
              topics={topics}
              onOpenNotes={handleOpenNotes}
              onSnooze={handleSnooze}
            />

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search topics (parametric design, coding, etc.)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Topics List */}
            {filteredTopics.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 text-center">
                <p className="text-sm font-semibold text-slate-300">No topics found</p>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  {searchQuery || selectedCategory !== 'All'
                    ? 'Try clearing your search or category filter.'
                    : 'Get started by creating your first learning or recap topic!'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEditingTopic(null);
                    setIsTopicModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Topic</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTopics.map((topic) => (
                  <TopicCard
                    key={topic.id}
                    topic={topic}
                    onOpenNotes={handleOpenNotes}
                    onSnooze={handleSnooze}
                    onEdit={(t) => {
                      setEditingTopic(t);
                      setIsTopicModalOpen(true);
                    }}
                    onDelete={handleDeleteTopic}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <TopicModal
        isOpen={isTopicModalOpen}
        onClose={() => {
          setIsTopicModalOpen(false);
          setEditingTopic(null);
        }}
        onSave={handleCreateOrUpdateTopic}
        initialTopic={editingTopic}
      />

      <RecapNotesModal
        isOpen={isNotesModalOpen}
        onClose={() => {
          setIsNotesModalOpen(false);
          setActiveTopicForNotes(null);
          setActiveMilestoneForNotes(null);
        }}
        topic={activeTopicForNotes}
        milestone={activeMilestoneForNotes}
        onSave={handleSaveNotes}
        onSnooze={handleSnooze}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        topics={topics}
        onImport={(imported) => updateTopics(imported)}
      />
    </div>
  );
};
