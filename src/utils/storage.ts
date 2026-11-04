import { Topic } from '../types';
import { generateMilestones, getTodayDateString, addDaysToDateString } from './sequences';

const STORAGE_KEY = 'forgetmenot_topics_v1';

const INITIAL_TOPICS: Topic[] = [
  {
    id: 'topic-parametric-1',
    name: 'Parametric Design (Rhino & Grasshopper)',
    category: 'Design & 3D',
    description: 'Master Voronoi patterns, attractor curves, and panelization algorithms. Rebuild one generative sculpture each recap.',
    startDate: addDaysToDateString(getTodayDateString(), -3),
    reminderTime: '10:00',
    sequenceType: 'fibonacci',
    color: '#6366f1', // Indigo
    createdAt: new Date().toISOString(),
    milestones: generateMilestones(addDaysToDateString(getTodayDateString(), -3), 'fibonacci'),
  },
  {
    id: 'topic-coding-2',
    name: 'Advanced TypeScript & Systems',
    category: 'Coding',
    description: 'Implement complex mapped types, template literal inference, and custom async schedulers.',
    startDate: addDaysToDateString(getTodayDateString(), -1),
    reminderTime: '14:30',
    sequenceType: 'fibonacci',
    color: '#06b6d4', // Cyan
    createdAt: new Date().toISOString(),
    milestones: generateMilestones(addDaysToDateString(getTodayDateString(), -1), 'fibonacci'),
  },
  {
    id: 'topic-cleaning-3',
    name: 'Deep Clean & Studio Organization',
    category: 'Habits & Living',
    description: 'Spaced maintenance for tools, cable management, hardware bins, and workshop surface decluttering.',
    startDate: getTodayDateString(),
    reminderTime: '18:00',
    sequenceType: 'leitner_classic',
    color: '#10b981', // Emerald
    createdAt: new Date().toISOString(),
    milestones: generateMilestones(getTodayDateString(), 'leitner_classic'),
  },
];

// Mark stage 1 of the parametric design topic as completed with sample notes so user sees notes history
if (INITIAL_TOPICS[0].milestones[0]) {
  INITIAL_TOPICS[0].milestones[0].completedAt = new Date().toISOString();
  INITIAL_TOPICS[0].milestones[0].notes = 'Completed day 1 Grasshopper recap: successfully rebuilt a sine wave attractor grid. Need to review Weaverbird mesh smoothing next.';
  INITIAL_TOPICS[0].milestones[0].difficulty = 'medium';
}

export function loadTopics(): Topic[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveTopics(INITIAL_TOPICS);
      return INITIAL_TOPICS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_TOPICS;
  } catch (e) {
    console.error('Failed to load topics from localStorage:', e);
    return INITIAL_TOPICS;
  }
}

export function saveTopics(topics: Topic[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(topics));
  } catch (e) {
    console.error('Failed to save topics to localStorage:', e);
  }
}

export function exportBackupJSON(topics: Topic[]) {
  const jsonStr = JSON.stringify(topics, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `forgetmenot_backup_${getTodayDateString()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importBackupJSON(file: File): Promise<Topic[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          resolve(parsed);
        } else {
          reject(new Error('Invalid backup file format: expected array of topics'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read backup file'));
    reader.readAsText(file);
  });
}

/**
 * Browser Notification Helper
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

export function sendLocalNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
      });
    } catch (e) {
      console.warn('Native notification failed:', e);
    }
  }
}
