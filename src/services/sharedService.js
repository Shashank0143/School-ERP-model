import { getDataProvider } from "../data";
import { notificationsData } from "../data/shared/notifications";
import { navItems } from "../data/shared/navigation";
import { schoolBranding } from "../data/shared/branding";
import { getAcademicCalendar, getEvents as getAcademicEvents } from "./academicCalendarService";

/**
 * services/sharedService.js
 * Shared utilities and common service functions
 */

export const simulateNetwork = (data) => data;

export const getNotifications = async () => notificationsData;

/**
 * Fetches notices and events (Relational)
 * Uses proper audience resolution to filter notices for the user
 */
export const getNoticesAndEvents = async (studentId) => {
  const provider = getDataProvider();
  // Fetch all events from the centralized Academic Calendar
  const allEvents = getAcademicEvents();

  // If no studentId is specified, fallback to a default
  const activeId = studentId || "stud-001";
  const students = await provider.getStudents();
  const student = students.find((s) => s.id === activeId);

  const studentClassId = student?.classId || null;

  // Use proper audience resolution for notices
  const { resolveNoticesForUser } = await import("./noticeService");
  const filteredNotices = await resolveNoticesForUser({
    id: activeId,
    role: "student",
    classId: studentClassId,
  });

  // Calculate daysLeft for each event to determine upcoming vs happening
  const now = new Date();
  now.setHours(0,0,0,0);
  
  const eventsWithDays = allEvents.map(e => {
    const d = new Date(e.date);
    d.setHours(0,0,0,0);
    const diffTime = d - now;
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { ...e, daysLeft };
  });

  // Filter events for this student based on stream and class targeting
  const studentStreamId = student?.streamId || null;
  const filteredEvents = eventsWithDays.filter((e) => {
    // Ignore targeting for institutional calendar events as they apply to all
    if (e.targetStreamId && e.targetStreamId !== studentStreamId) return false;
    if (e.targetClassId && e.targetClassId !== studentClassId) return false;
    // Don't show past events
    if (e.daysLeft < 0) return false;
    return true;
  });

  // Events happening today
  const happeningEvents = filteredEvents.filter(e => e.daysLeft === 0);
  // Events happening in the future
  const upcomingEvents = filteredEvents.filter(e => e.daysLeft > 0).sort((a,b) => a.daysLeft - b.daysLeft);

  return {
    general: filteredNotices.filter((n) => n.category !== "examination"),
    exam: filteredNotices.filter((n) => n.category === "examination"),
    events: happeningEvents,
    upcoming: upcomingEvents,
  };
};

/**
 * Fetches navigation items
 */
export const getNavigation = async () => navItems;

/**
 * Fetches school branding and general info
 */
export const getBrandingInfo = async () => schoolBranding;

/**
 * Fetches the school academic calendar
 */
export const getSchoolCalendar = async () => {
  const calendar = getAcademicCalendar();
  if (calendar) {
    // Inject filtered events (without cancelled ones)
    return { ...calendar, events: getAcademicEvents() };
  }
  return null;
};
