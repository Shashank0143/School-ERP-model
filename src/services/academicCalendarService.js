import { getItem, setItem } from "../persistence/storage";
import { STORAGE_KEYS } from "../persistence/storageKeys";

/**
 * services/academicCalendarService.js
 * Centralized service for Academic Calendar operations,
 * providing backend-ready CRUD methods backed by LocalStorage.
 */

/**
 * Retrieves the complete Academic Calendar object.
 * Returns null if not yet seeded.
 * @returns {Object|null}
 */
export const getAcademicCalendar = () => {
  return getItem(STORAGE_KEYS.ACADEMIC_CALENDAR);
};

/**
 * Saves the complete Academic Calendar object.
 * @param {Object} calendar 
 */
export const saveAcademicCalendar = (calendar) => {
  setItem(STORAGE_KEYS.ACADEMIC_CALENDAR, calendar);
};

/**
 * Retrieves all events from the Academic Calendar (excluding cancelled ones).
 * @returns {Array} Array of event objects
 */
export const getEvents = () => {
  const calendar = getAcademicCalendar();
  const events = calendar?.events || [];
  return events.filter(e => e.status !== 'cancelled');
};

/**
 * Retrieves a specific event by its ID, including cancelled ones.
 * @param {string} id 
 * @returns {Object|undefined} The event object, or undefined if not found
 */
export const getEventById = (id) => {
  const calendar = getAcademicCalendar();
  return (calendar?.events || []).find((e) => e.id === id);
};

/**
 * Creates a new event and persists it to LocalStorage.
 * @param {Object} eventData 
 * @returns {Array} The updated events array
 */
export const createEvent = (eventData) => {
  const calendar = getAcademicCalendar() || { events: [] };
  const newEvent = {
    ...eventData,
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    isSeeded: false,
    academicSession: eventData.academicSession || "2026-27"
  };
  calendar.events = [...(calendar.events || []), newEvent];
  saveAcademicCalendar(calendar);
  return getEvents();
};

/**
 * Updates an existing event and persists to LocalStorage.
 * @param {string} id 
 * @param {Object} updates 
 * @returns {Array} The updated events array
 */
export const updateEvent = (id, updates) => {
  const calendar = getAcademicCalendar();
  if (!calendar || !calendar.events) return [];
  
  calendar.events = calendar.events.map(e => {
    if (e.id === id) {
      // Ensure we don't accidentally overwrite the id or isSeeded flag
      return { ...e, ...updates, id: e.id, isSeeded: e.isSeeded };
    }
    return e;
  });
  
  saveAcademicCalendar(calendar);
  return getEvents();
};

/**
 * Permanently deletes an admin-created event.
 * @param {string} id 
 * @returns {Array} The updated events array
 * @throws {Error} If the event is seeded
 */
export const deleteEvent = (id) => {
  const calendar = getAcademicCalendar();
  if (!calendar || !calendar.events) return [];
  
  const eventToDelete = calendar.events.find(e => e.id === id);
  if (!eventToDelete) return getEvents();
  
  if (eventToDelete.isSeeded) {
    throw new Error("Seeded events cannot be permanently deleted. Use overrideHoliday instead.");
  }
  
  calendar.events = calendar.events.filter(e => e.id !== id);
  saveAcademicCalendar(calendar);
  return getEvents();
};

/**
 * Overrides a seeded event by modifying its status.
 * @param {string} id 
 * @param {string} overrideStatus 
 * @returns {Array} The updated events array
 */
export const overrideHoliday = (id, overrideStatus) => {
  return updateEvent(id, { status: overrideStatus });
};

/**
 * Classifies a specific date based on the academic calendar.
 * Returns an object with { isHoliday: boolean, event?: Object }
 * Explicitly evaluates working day overrides.
 * @param {string} dateStr - The date in YYYY-MM-DD format
 * @returns {Object}
 */
export const getDayClassification = (dateStr) => {
  const parts = dateStr.split("-");
  if (parts.length < 3) return { isHoliday: false };
  
  const day = parseInt(parts[2], 10);
  const monthIndex = parseInt(parts[1], 10) - 1;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[monthIndex];

  // getAcademicCalendar gives us ALL events, including cancelled ones
  const calendar = getAcademicCalendar() || { events: [] };
  const allEvents = calendar.events || [];

  // Find any event matching the exact date
  const matchingEvents = allEvents.filter((e) => {
    const hParts = e.date.split(" ");
    if (hParts.length >= 2) {
      const hDay = parseInt(hParts[0], 10);
      const hMonth = hParts[1];
      return (
        hDay === day &&
        hMonth.toLowerCase().startsWith(month.toLowerCase().substring(0, 3))
      );
    }
    return false;
  });

  // If there's an explicit working day override or a cancelled holiday, it's NOT a holiday
  const isWorkingDayOverride = matchingEvents.some(e => 
    e.status === "cancelled" || e.type === "working_day" || e.status === "working_day_override"
  );
  if (isWorkingDayOverride) {
    return { isHoliday: false, isWorkingDayOverride: true };
  }

  // Check if any of the active events is a recognized holiday type
  const holidayTypes = ["holiday", "government_holiday", "school_holiday", "vacation"];
  const activeHoliday = matchingEvents.find(e => 
    holidayTypes.includes(e.type) && e.status !== "cancelled"
  );

  if (activeHoliday) {
    return { isHoliday: true, event: activeHoliday };
  }

  return { isHoliday: false, isWorkingDayOverride: false };
};
