import { getDataProvider } from "../data";
import { teacherTimetableService } from "./timetable/teacherTimetableService";
import { teacherScheduleService } from "./teacherScheduleService";
import { teacherActionCenterService } from "./teacherActionCenterService";

// In-memory lightweight cache registry
const cache = new Map();
const CACHE_TTL = 8000; // 8 seconds cache validity

/**
 * getCriticalTeacherDashboardData
 *
 * Instantly resolves high-priority critical view data: teacher profile, subjects, and teaching schedules.
 */
export const getCriticalTeacherDashboardData = async (
  teacherId,
  forceRefresh = false,
) => {
  const tId = teacherId || "teach-001";
  const cacheKey = `teacher-dashboard-critical-${tId}`;

  // Serve from cache if valid
  if (!forceRefresh && cache.has(cacheKey)) {
    const entry = cache.get(cacheKey);
    if (Date.now() - entry.timestamp < CACHE_TTL) {
      return entry.payload;
    }
  }

  console.time(`[PERF AUDIT] getCriticalTeacherDashboardData for ${tId}`);
  const provider = getDataProvider();

  const teachers = await provider.getTeachers();
  const teacher = teachers.find((t) => t.id === tId);

  const assignments = await provider.getTeacherSubjectAssignments();
  const teacherAssignments = assignments.filter((a) => a.teacherId === tId);
  const subjectIds = [...new Set(teacherAssignments.map((a) => a.subjectId))];
  const classIds = [...new Set(teacherAssignments.map((a) => a.classId))];

  const subjects = await provider.getSubjects();
  const classesList = await provider.getClasses();

  const resolvedSubjects = subjectIds
    .map((id) => subjects.find((s) => s.id === id))
    .filter(Boolean);
  const resolvedClasses = classIds
    .map((id) => classesList.find((c) => c.id === id))
    .filter(Boolean);

  const subjectsTaught = resolvedSubjects.map((s) => s.name);
  const classesAssigned = resolvedClasses.map((c) => c.name);

  const rawTodaySchedule = await teacherTimetableService.getTeacherTodaySchedule(tId);
  const todaySchedule = rawTodaySchedule.map(slot => {
    const cls = resolvedClasses.find(c => c.id === slot.classId) || classesList.find(c => c.id === slot.classId);
    const sub = resolvedSubjects.find(s => s.id === slot.subjectId) || subjects.find(s => s.id === slot.subjectId);
    return {
      ...slot,
      period: slot.periodNumber,
      subject: sub ? sub.name : slot.subjectId,
      class: cls ? cls.name.replace("Class ", "") : slot.classId,
      time: `${slot.startTime} – ${slot.endTime}`,
    };
  });
  const currentClass = todaySchedule.length > 0 ? { ...todaySchedule[0], status: "Ongoing" } : null;
  const nextClass = todaySchedule.length > 1 ? { ...todaySchedule[1], status: "Upcoming" } : null;

  const classTeacherData =
    await teacherScheduleService.getClassTeacherResponsibilities(tId);

  const teacherIdentity = {
    id: tId,
    name: teacher ? teacher.name : "Faculty",
    designation: teacher ? teacher.designation : "Instructor",
    department: teacher ? teacher.department : "Academic",
    isClassTeacher: !!classTeacherData,
    className: classTeacherData ? classTeacherData.className : null,
    classId: classTeacherData ? classTeacherData.classId : null,
    totalStudents: classTeacherData ? classTeacherData.totalStudents : 0,
    attendanceMarked: classTeacherData
      ? classTeacherData.attendanceMarked
      : false,
    presentStudents: classTeacherData ? classTeacherData.presentStudents : 0,
    pendingLeavesCount: classTeacherData
      ? classTeacherData.pendingLeavesCount
      : 0,
    subjectsTaught,
    classesAssigned,
    lecturesTodayCount: todaySchedule.length,
  };

  const payload = {
    teacherIdentity,
    teachingSchedule: {
      today: todaySchedule,
      currentClass,
      nextClass,
      scheduleCount: todaySchedule.length,
    },
  };

  console.timeEnd(`[PERF AUDIT] getCriticalTeacherDashboardData for ${tId}`);

  cache.set(cacheKey, {
    payload,
    timestamp: Date.now(),
  });

  return payload;
};

/**
 * getDeferredTeacherDashboardData
 *
 * Asynchronously gathers deferred dashboard metadata: Action Center Tasks, class operations, and class timetable.
 */
export const getDeferredTeacherDashboardData = async (
  teacherId,
  forceRefresh = false,
) => {
  const tId = teacherId || "teach-001";
  const cacheKey = `teacher-dashboard-deferred-${tId}`;

  if (!forceRefresh && cache.has(cacheKey)) {
    const entry = cache.get(cacheKey);
    if (Date.now() - entry.timestamp < CACHE_TTL) {
      return entry.payload;
    }
  }

  console.time(`[PERF AUDIT] getDeferredTeacherDashboardData for ${tId}`);

  const provider = getDataProvider();

  // Fetch heavier collections in parallel to eliminate sequentially awaiting loops
  const [classTeacherData, actionItems, generalNotices, examNotices] =
    await Promise.all([
      teacherScheduleService.getClassTeacherResponsibilities(tId),
      teacherActionCenterService.getTeacherActionItems(tId),
      provider
        .getNotices()
        .then((notices) =>
          notices.filter(
            (n) => n.audience === "ALL" || n.audience === "FACULTY",
          ),
        ),
      provider
        .getNotices()
        .then((notices) => notices.filter((n) => n.category === "examination")),
    ]);

  const fullClassSchedule = classTeacherData
    ? await teacherScheduleService.getClassSchedule(classTeacherData.classId)
    : [];
  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayClassSchedule = fullClassSchedule.filter(
    (s) => s.day.toLowerCase() === todayName.toLowerCase(),
  );

  const payload = {
    classInfo: classTeacherData,
    classSchedule: {
      weekly: fullClassSchedule,
      today: todayClassSchedule,
    },
    actionItems,
    notices: {
      general: generalNotices,
      exam: examNotices,
    },
  };

  console.timeEnd(`[PERF AUDIT] getDeferredTeacherDashboardData for ${tId}`);

  cache.set(cacheKey, {
    payload,
    timestamp: Date.now(),
  });

  return payload;
};

/**
 * Legacy support for full aggregation layer.
 */
export const getTeacherDashboardData = async (
  teacherId,
  forceRefresh = false,
) => {
  const tId = teacherId || "teach-001";
  const cacheKey = `teacher-dashboard-${tId}`;

  if (!forceRefresh && cache.has(cacheKey)) {
    const entry = cache.get(cacheKey);
    if (Date.now() - entry.timestamp < CACHE_TTL) {
      return entry.payload;
    }
  }

  const [critical, deferred] = await Promise.all([
    getCriticalTeacherDashboardData(tId, forceRefresh),
    getDeferredTeacherDashboardData(tId, forceRefresh),
  ]);

  const payload = {
    teacherIdentity: critical.teacherIdentity,
    teachingSchedule: critical.teachingSchedule,
    classInfo: deferred.classInfo,
    classSchedule: deferred.classSchedule,
    actionItems: deferred.actionItems,
  };

  cache.set(cacheKey, {
    payload,
    timestamp: Date.now(),
  });

  return payload;
};

/**
 * Invalidates the dashboard cache.
 */
export const clearTeacherDashboardCache = (teacherId) => {
  if (teacherId) {
    cache.delete(`teacher-dashboard-critical-${teacherId}`);
    cache.delete(`teacher-dashboard-deferred-${teacherId}`);
    cache.delete(`teacher-dashboard-${teacherId}`);
  } else {
    cache.clear();
  }
};

export const teacherDashboardService = {
  getCriticalTeacherDashboardData,
  getDeferredTeacherDashboardData,
  getTeacherDashboardData,
  clearTeacherDashboardCache,
};
