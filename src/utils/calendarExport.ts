import { Topic, ReviewMilestone } from '../types';

/**
 * Generate standard .ics (iCalendar) content for all active milestones of a topic
 */
export function generateTopicICS(topic: Topic): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ForgetMeNot//Spaced Repetition Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:ForgetMeNot - ${topic.name}`,
  ];

  topic.milestones.forEach((m) => {
    // Skip already completed ones if desired, or include them with status
    const dateFormatted = m.effectiveDate.replace(/-/g, '');
    const reminderTime = topic.reminderTime || '09:00';
    const [hours, minutes] = reminderTime.split(':');
    const startDateTime = `${dateFormatted}T${hours.padStart(2, '0')}${minutes.padStart(2, '0')}00`;
    
    // 30 minute duration
    const endMinutes = (parseInt(minutes, 10) + 30) % 60;
    const endHours = parseInt(hours, 10) + Math.floor((parseInt(minutes, 10) + 30) / 60);
    const endDateTime = `${dateFormatted}T${String(endHours).padStart(2, '0')}${String(endMinutes).padStart(2, '0')}00`;

    const summary = `🧠 Recap: ${topic.name} (Stage ${m.stageIndex} • Day +${m.intervalFromStart})`;
    const description = `Recap session for "${topic.name}"\\n` +
      `Sequence: ${topic.sequenceType} (Stage ${m.stageIndex})\\n` +
      `Goal / Instructions: ${topic.description || 'Practice and recap skills to fight the forgetting curve.'}\\n` +
      (m.notes ? `Previous Notes: ${m.notes}\\n` : '');

    lines.push(
      'BEGIN:VEVENT',
      `UID:${m.id}@forgetmenot.app`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${startDateTime}`,
      `DTEND:${endDateTime}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `CATEGORIES:${topic.category}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT15M',
      'ACTION:DISPLAY',
      `DESCRIPTION:Reminder: Time to recap ${topic.name}!`,
      'END:VALARM',
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Trigger download of .ics file in browser
 */
export function downloadICS(topic: Topic) {
  const icsData = generateTopicICS(topic);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${topic.name.replace(/\s+/g, '_')}_schedule.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Build a Google Calendar Quick Add URL for a specific milestone
 */
export function getGoogleCalendarUrl(topic: Topic, milestone: ReviewMilestone): string {
  const dateFormatted = milestone.effectiveDate.replace(/-/g, '');
  const reminderTime = topic.reminderTime || '09:00';
  const [hours, minutes] = reminderTime.split(':');
  const startDateTime = `${dateFormatted}T${hours.padStart(2, '0')}${minutes.padStart(2, '0')}00`;
  
  const endMinutes = (parseInt(minutes, 10) + 30) % 60;
  const endHours = parseInt(hours, 10) + Math.floor((parseInt(minutes, 10) + 30) / 60);
  const endDateTime = `${dateFormatted}T${String(endHours).padStart(2, '0')}${String(endMinutes).padStart(2, '0')}00`;

  const title = encodeURIComponent(`🧠 Recap: ${topic.name} (Stage ${milestone.stageIndex})`);
  const details = encodeURIComponent(
    `Spaced repetition review for ${topic.name} (Day +${milestone.intervalFromStart}).\n\n` +
    `Goal: ${topic.description || 'Consolidate exercises and prevent forgetting.'}`
  );

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateTime}/${endDateTime}&details=${details}`;
}
