import { MockDB } from "../mockDB";
import { notificationsData } from "../data/shared/notifications";
import { navItems } from "../data/shared/navigation";
import { schoolBranding } from "../data/shared/branding";
import { schoolCalendar } from "../data/shared/calendar";

export const simulateNetwork = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), 100);
  });
};

/**
 * Fetches notifications
 */
export const getNotifications = async () => simulateNetwork(notificationsData);

/**
 * Fetches notices and events (Relational)
 */
export const getNoticesAndEvents = async (studentId) => {
  const allNotices = await MockDB.notices.all();
  const allEvents = await MockDB.events.all();

  // If no studentId is specified, fallback to a default or return general
  const activeId = studentId || 'stud-001';
  const student = await MockDB.students.findById(activeId);

  const studentStreamId = student?.streamId || null;
  const studentClassId = student?.classId || null;

  // Filter notices for this student based on stream, class and role targeting
  const filteredNotices = allNotices.filter(n => {
    if (n.targetStreamId && n.targetStreamId !== studentStreamId) return false;
    if (n.targetClassId && n.targetClassId !== studentClassId) return false;
    return true;
  });

  // Filter events for this student based on stream and class targeting
  const filteredEvents = allEvents.filter(e => {
    if (e.targetStreamId && e.targetStreamId !== studentStreamId) return false;
    if (e.targetClassId && e.targetClassId !== studentClassId) return false;
    return true;
  });

  return {
    general: filteredNotices.filter(n => n.category === 'general'),
    exam: filteredNotices.filter(n => n.category === 'exam'),
    events: filteredEvents.filter(e => e.status === 'happening'),
    upcoming: filteredEvents.filter(e => e.status === 'upcoming')
  };
};

/**
 * Fetches navigation items
 */
export const getNavigation = async () => simulateNetwork(navItems);

/**
 * Fetches school branding and general info
 */
export const getBrandingInfo = async () => simulateNetwork(schoolBranding);

/**
 * Fetches the school academic calendar
 */
export const getSchoolCalendar = async () => simulateNetwork(schoolCalendar);
