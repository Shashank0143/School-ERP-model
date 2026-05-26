import { getDataProvider } from "../data";

/**
 * services/teacherScheduleService.js
 *
 * Centralized service layer for the Teacher Teaching Schedule System.
 * Resolves weekly and daily periods from the structured day+period assignment schema.
 * Maintains hot precomputed schedule caches to avoid repeated queries.
 */

// ── Period Configuration ─────────────────────────────────────────────────────

/** Maps internal period codes to display labels and time ranges. */
const PERIOD_CONFIG = {
  P1: {
    label: "P1",
    time: "08:00 – 08:50",
    startTime: "08:00",
    endTime: "08:50",
  },
  P2: {
    label: "P2",
    time: "08:50 – 09:40",
    startTime: "08:50",
    endTime: "09:40",
  },
  P3: {
    label: "P3",
    time: "09:40 – 10:30",
    startTime: "09:40",
    endTime: "10:30",
  },
  P4: {
    label: "P4",
    time: "10:30 – 11:20",
    startTime: "10:30",
    endTime: "11:20",
  },
  // 11:20 – 11:50 = Lunch Break (not a period)
  P5: {
    label: "P5",
    time: "11:50 – 12:40",
    startTime: "11:50",
    endTime: "12:40",
  },
  P6: {
    label: "P6",
    time: "12:40 – 13:30",
    startTime: "12:40",
    endTime: "13:30",
  },
  P7: {
    label: "P7",
    time: "13:30 – 14:20",
    startTime: "13:30",
    endTime: "14:20",
  },
  P8: {
    label: "P8",
    time: "14:20 – 15:10",
    startTime: "14:20",
    endTime: "15:10",
  },
};

const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIOD_ORDER = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8"];

// ── Cache Registry ───────────────────────────────────────────────────────────

const weeklyScheduleCache = new Map();
const todayScheduleCache = new Map();

/**
 * Invalidate the precomputed schedule cache when allocations shift.
 */
export const clearScheduleCache = (teacherId) => {
  if (teacherId) {
    weeklyScheduleCache.delete(teacherId);
    for (const key of todayScheduleCache.keys()) {
      if (key.startsWith(`${teacherId}-`)) {
        todayScheduleCache.delete(key);
      }
    }
  } else {
    weeklyScheduleCache.clear();
    todayScheduleCache.clear();
  }
};

// ── Weekly Schedule ──────────────────────────────────────────────────────────

import { teacherTimetableService } from "./timetable";
import { studentTimetableService } from "./timetable";

export const getTeacherWeeklySchedule = async (teacherId) => {
  const tId = teacherId || "teach-001";

  if (weeklyScheduleCache.has(tId)) {
    return weeklyScheduleCache.get(tId);
  }

  console.time(`[PERF AUDIT] getTeacherWeeklySchedule for ${tId}`);

  // Fetch from the canonical projection service
  const weeklySchedule = await teacherTimetableService.getTeacherSchedule(tId);
  
  // Format to match old component expectations if necessary
  const formatted = weeklySchedule.map(slot => ({
    ...slot,
    time: `${slot.startTime} - ${slot.endTime}`,
    status: "Upcoming" // components derive real status on render usually
  }));

  // Sort by day order then period order
  const sorted = formatted.sort((a, b) => {
    const dayDiff = DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day);
    if (dayDiff !== 0) return dayDiff;
    return PERIOD_ORDER.indexOf(a.period) - PERIOD_ORDER.indexOf(b.period);
  });

  console.timeEnd(`[PERF AUDIT] getTeacherWeeklySchedule for ${tId}`);
  weeklyScheduleCache.set(tId, sorted);
  return sorted;
};

// ── Today's Schedule ─────────────────────────────────────────────────────────

export const getTeacherTodaySchedule = async (teacherId, dayName) => {
  const tId = teacherId || "teach-001";
  const targetDay =
    dayName || new Date().toLocaleDateString("en-US", { weekday: "long" });
  const cacheKey = `${tId}-${targetDay}`;

  if (todayScheduleCache.has(cacheKey)) {
    return todayScheduleCache.get(cacheKey);
  }

  console.time(`[PERF AUDIT] getTeacherTodaySchedule for ${cacheKey}`);

  const weekly = await getTeacherWeeklySchedule(tId);
  const todayClasses = weekly
    .filter((w) => w.day.toLowerCase() === targetDay.toLowerCase())
    .sort(
      (a, b) => PERIOD_ORDER.indexOf(a.period) - PERIOD_ORDER.indexOf(b.period),
    );

  console.timeEnd(`[PERF AUDIT] getTeacherTodaySchedule for ${cacheKey}`);
  todayScheduleCache.set(cacheKey, todayClasses);
  return todayClasses;
};

// ── Current / Next Class ─────────────────────────────────────────────────────

export const getCurrentClass = async (teacherId, todaySchedule) => {
  const today = todaySchedule || (await getTeacherTodaySchedule(teacherId));
  if (today.length > 0) {
    return { ...today[0], status: "Ongoing" };
  }
  return null;
};

export const getNextClass = async (teacherId, todaySchedule) => {
  const today = todaySchedule || (await getTeacherTodaySchedule(teacherId));
  if (today.length > 1) {
    return { ...today[1], status: "Upcoming" };
  }
  return null;
};

// ── Class Teacher Responsibilities ───────────────────────────────────────────

export const getClassTeacherResponsibilities = async (teacherId) => {
  const tId = teacherId || "teach-001";
  const provider = getDataProvider();
  console.time(`[PERF AUDIT] getClassTeacherResponsibilities for ${tId}`);

  const classes = await provider.getClasses();
  const homeroom = classes.find((c) => c.classTeacherId === tId);

  if (!homeroom) {
    console.timeEnd(`[PERF AUDIT] getClassTeacherResponsibilities for ${tId}`);
    return null;
  }

  const students = await provider.getStudents();
  const classStudents = students.filter((s) => s.classId === homeroom.id);
  const todayStr = new Date().toISOString().split("T")[0];

  const dailyAttendance = await provider.getDailyAttendance();
  const dailyAtt = dailyAttendance.filter(
    (a) => a.classId === homeroom.id && a.date === todayStr,
  );
  const presentCount = dailyAtt.filter((a) => a.status === "PRESENT").length;
  const isMarked = dailyAtt.length > 0;

  const leaveRequests = await provider.getLeaveRequests();
  const pendingLeaves = leaveRequests.filter(
    (l) => l.classId === homeroom.id && l.status === "PENDING",
  );

  const mentorAssignments = await provider.getMentorAssignments();
  const studentIds = classStudents.map((s) => s.id);
  const pendingMentors = mentorAssignments.filter(
    (ma) => ma.status === "PENDING" && studentIds.includes(ma.studentId),
  ).length;

  const result = {
    isClassTeacher: true,
    classId: homeroom.id,
    className: homeroom.name,
    room: homeroom.room,
    displayName: homeroom.displayName,
    totalStudents: classStudents.length,
    presentStudents: isMarked ? presentCount : 0,
    attendanceMarked: isMarked,
    pendingLeavesCount: pendingLeaves.length,
    pendingMentorsCount: pendingMentors,
  };

  console.timeEnd(`[PERF AUDIT] getClassTeacherResponsibilities for ${tId}`);
  return result;
};

// ── Class Schedule ───────────────────────────────────────────────────────────

/**
 * Resolves the full academic weekly schedule for a specific Class.
 * Returns one entry per period slot, sorted by day and period order.
 */
export const getClassSchedule = async (classId) => {
  if (!classId) return [];
  const provider = getDataProvider();

  const classes = await provider.getClasses();
  const cls = classes.find((c) => c.id === classId);
  if (!cls) return [];

  const assignments = await provider.getTeacherSubjectAssignments();
  const classAssignments = assignments.filter((a) => a.classId === classId);

  const subjects = await provider.getSubjects();
  const teachers = await provider.getTeachers();

  const subjectsMap = new Map(subjects.map((s) => [s.id, s]));
  const teachersMap = new Map(teachers.map((t) => [t.id, t]));

  const classSchedule = [];

  for (const assignment of classAssignments) {
    const sub = subjectsMap.get(assignment.subjectId);
    const teacher = teachersMap.get(assignment.teacherId);
    if (!sub) continue;

    const { day, period } = assignment;
    if (!day || !period || !PERIOD_CONFIG[period]) continue;

    const periodInfo = PERIOD_CONFIG[period];
    const room = assignment.room || sub.room || cls.room || "Room 101";

    classSchedule.push({
      day,
      period,
      time: periodInfo.time,
      startTime: periodInfo.startTime,
      endTime: periodInfo.endTime,
      subject: sub.name,
      subjectId: sub.id,
      teacher: teacher ? teacher.name : "Faculty",
      teacherId: assignment.teacherId,
      room,
      status: "Upcoming",
    });
  }

  return classSchedule.sort((a, b) => {
    const dayDiff = DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day);
    if (dayDiff !== 0) return dayDiff;
    return PERIOD_ORDER.indexOf(a.period) - PERIOD_ORDER.indexOf(b.period);
  });
};

/**
 * Alias for getTeacherWeeklySchedule — kept for backward compatibility.
 */
export const getTeacherSchedule = async (teacherId) => {
  return getTeacherWeeklySchedule(teacherId);
};

export const teacherScheduleService = {
  getTeacherWeeklySchedule,
  getTeacherTodaySchedule,
  getCurrentClass,
  getNextClass,
  getClassTeacherResponsibilities,
  getClassSchedule,
  getTeacherSchedule,
  clearScheduleCache,
};
