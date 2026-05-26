import { studentTimetableService } from "./studentTimetableService";

/**
 * Creates a centralized empty projection for the timetable.
 * Yields a consistent shape to prevent UI crashes and inconsistent empty states.
 */
export const createEmptyTimetableProjection = () => ({
  isConfigured: false,
  status: null,
  today: [],
  weekly: {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
  },
});

/**
 * Builds the portal-ready UI projection for a student's timetable.
 * - Enforces "published" status visibility.
 * - Maps lowercase days to Capitalized Days.
 * - Derives 'today' schedule.
 */
export const buildStudentTimetableProjection = async (studentId) => {
  const timetable = await studentTimetableService.getStudentTimetable(
    studentId,
  );

  if (!timetable || timetable.status !== "published") {
    return createEmptyTimetableProjection();
  }

  const rawWeekly = timetable.weeklySchedule || {};

  const weekly = {
    Monday: rawWeekly.monday || [],
    Tuesday: rawWeekly.tuesday || [],
    Wednesday: rawWeekly.wednesday || [],
    Thursday: rawWeekly.thursday || [],
    Friday: rawWeekly.friday || [],
  };

  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const dayName = days[new Date().getDay()];
  let today = [];

  if (dayName !== "sunday" && dayName !== "saturday") {
    const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    today = weekly[capitalizedDay] || [];
  }

  return {
    isConfigured: true,
    status: timetable.status,
    today,
    weekly,
  };
};

export const studentTimetableProjectionService = {
  createEmptyTimetableProjection,
  buildStudentTimetableProjection,
};
