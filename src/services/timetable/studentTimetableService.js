import { getDataProvider } from "../../data";

/**
 * Get full timetable object for a student by their classId
 */
export const getStudentTimetable = async (studentId) => {
  const provider = getDataProvider();
  const student = await provider.getStudentById(studentId);
  if (!student) return null;

  const timetable = await provider.getTimetableByClass(student.classId);
  return timetable;
};

/**
 * Get today's schedule specifically (for dashboard)
 */
export const getStudentTodaySchedule = async (studentId, date = new Date()) => {
  const timetable = await getStudentTimetable(studentId);
  if (!timetable || !timetable.weeklySchedule) return [];

  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const dayName = days[date.getDay()];
  
  if (dayName === "sunday" || dayName === "saturday") return [];
  
  return timetable.weeklySchedule[dayName] || [];
};

export const studentTimetableService = {
  getStudentTimetable,
  getStudentTodaySchedule
};
