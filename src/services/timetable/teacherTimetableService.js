import { getDataProvider } from "../../data";
import { teacherScheduleProjectionService } from "./teacherScheduleProjectionService";

/**
 * Get the full teaching schedule for a teacher, derived from the projection.
 */
export const getTeacherSchedule = async (teacherId) => {
  const projection = await teacherScheduleProjectionService.getProjection();
  return projection[teacherId] || {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
  };
};

/**
 * Get today's teaching schedule for a teacher.
 */
export const getTeacherTodaySchedule = async (teacherId, date = new Date()) => {
  const fullSchedule = await getTeacherSchedule(teacherId);
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const dayName = days[date.getDay()];
  
  if (dayName === "sunday" || dayName === "saturday") return [];
  
  const todayClasses = fullSchedule[dayName] || [];
  return todayClasses.sort((a, b) => a.periodNumber.localeCompare(b.periodNumber));
};

/**
 * Get the timetable of the class that this teacher is the Class Teacher for.
 */
export const getClassTeacherTimetable = async (teacherId) => {
  const provider = getDataProvider();
  const teachers = await provider.getTeachers(); // Or a specific query if available
  const teacher = teachers.find(t => t.id === teacherId);
  
  // Assuming assignedClasses[0] or similar contains the classId they are CT for, or using a specific field
  // For now, looking at existing structure, we might need to find the class they are assigned to as CT.
  // We'll return null if not a CT.
  if (!teacher || !teacher.isClassTeacher) return null;
  
  const classId = teacher.assignedClassId || (teacher.metadata && teacher.metadata.classId);
  if (!classId) return null;

  return await provider.getTimetableByClass(classId);
};

export const teacherTimetableService = {
  getTeacherSchedule,
  getTeacherTodaySchedule,
  getClassTeacherTimetable
};
