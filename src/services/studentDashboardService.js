import {
  getStudentProfile,
  getAttendance,
  getDocuments,
} from "./studentService";
import { getFeeDetails } from "./financeService";
import { studentTimetableProjectionService } from "./timetable/studentTimetableProjectionService";
import { getBrandingInfo, getNoticesAndEvents } from "./sharedService";
import { getAcademicProgress, getAcademicTimeline } from "./assignmentService";
import { getExamData } from "./examService";
import { getUpdatesForStudent } from "./classUpdatesService";

// In-memory lightweight cache registry
const cache = new Map();
const CACHE_TTL = 10000; // 10 seconds cache validity

/**
 * getCriticalStudentDashboardPayload
 *
 * Fetches high-priority items needed for instantaneous above-the-fold paint:
 * Profile details, Attendance summary, Fees status, and Timetable.
 */
export const getCriticalStudentDashboardPayload = async (
  studentId,
  forceRefresh = false,
) => {
  const sId = studentId || "stud-001";
  const cacheKey = `student-dashboard-critical-${sId}`;

  if (!forceRefresh && cache.has(cacheKey)) {
    const entry = cache.get(cacheKey);
    if (Date.now() - entry.timestamp < CACHE_TTL) {
      return entry.payload;
    }
  }

  const perfLabel = `[PERF AUDIT] getCriticalStudentDashboardPayload for ${sId}`;
  console.time(perfLabel);

  // Fetch core metrics in parallel
  const [profile, attendance, finance, timetable] = await Promise.all([
    getStudentProfile(sId),
    getAttendance(sId),
    getFeeDetails(sId),
    studentTimetableProjectionService.buildStudentTimetableProjection(sId),
  ]);

  // Only full-day attendance is used - check overall percentage
  const attendanceWarnings =
    (attendance?.overall?.percentage || 100) < 75
      ? [
          {
            name: "attendance",
            percentage: attendance?.overall?.percentage || 100,
          },
        ]
      : [];

  const payload = {
    profile,
    attendance,
    finance,
    timetable,
    derived: {
      attendanceWarnings,
    },
  };

  console.timeEnd(perfLabel);

  cache.set(cacheKey, {
    payload,
    timestamp: Date.now(),
  });

  return payload;
};

/**
 * getDeferredStudentDashboardPayload
 *
 * Progressively loads secondary dashboard metrics:
 * Task progress, assignments, notices, mandatory documents status, and transport updates.
 */
export const getDeferredStudentDashboardPayload = async (
  studentId,
  isParent,
  forceRefresh = false,
) => {
  const sId = studentId || "stud-001";
  const cacheKey = `student-dashboard-deferred-${sId}-${!!isParent}`;

  if (!forceRefresh && cache.has(cacheKey)) {
    const entry = cache.get(cacheKey);
    if (Date.now() - entry.timestamp < CACHE_TTL) {
      return entry.payload;
    }
  }

  console.time(`[PERF AUDIT] getDeferredStudentDashboardPayload for ${sId}`);

  // Parallelize secondary ERP modules to prevent sequential cascades
  const [
    progress,
    timeline,
    branding,
    shared,
    documents,
    examData,
    classUpdates,
  ] = await Promise.all([
    getAcademicProgress(sId),
    getAcademicTimeline(sId),
    getBrandingInfo(),
    getNoticesAndEvents(sId),
    getDocuments(sId),
    getExamData(sId),
    getUpdatesForStudent(sId, !!isParent),
  ]);

  const missingDocuments = (documents || []).filter(
    (doc) => doc.isMandatory && doc.status === "missing",
  );

  const totalTasks = (progress || []).reduce(
    (acc, curr) => acc + (curr.totalTasks || 0),
    0,
  );
  const completedTasks = (progress || []).reduce(
    (acc, curr) => acc + (curr.completedTasks || 0),
    0,
  );
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const pendingCount = timeline?.upcoming?.length || 0;
  const overdueCount = timeline?.overdue?.length || 0;

  const nextExam = (() => {
    if (!examData?.schedule || examData.schedule.length === 0) return null;
    const firstExam = examData.schedule[0];
    return {
      name: firstExam.subject,
      date: firstExam.date,
    };
  })();

  const payload = {
    progress,
    timeline,
    branding,
    shared,
    documents,
    examData,
    classUpdates,
    derived: {
      missingDocuments,
      completionRate,
      pendingCount,
      overdueCount,
      nextExam,
    },
  };

  console.timeEnd(`[PERF AUDIT] getDeferredStudentDashboardPayload for ${sId}`);

  cache.set(cacheKey, {
    payload,
    timestamp: Date.now(),
  });

  return payload;
};

/**
 * Legacy full dashboard payload retrieval
 */
export const getStudentDashboardPayload = async (
  studentId,
  isParent,
  forceRefresh = false,
) => {
  const sId = studentId || "stud-001";
  const cacheKey = `student-dashboard-${sId}-${!!isParent}`;

  if (!forceRefresh && cache.has(cacheKey)) {
    const entry = cache.get(cacheKey);
    if (Date.now() - entry.timestamp < CACHE_TTL) {
      return entry.payload;
    }
  }

  const [critical, deferred] = await Promise.all([
    getCriticalStudentDashboardPayload(sId, forceRefresh),
    getDeferredStudentDashboardPayload(sId, isParent, forceRefresh),
  ]);

  const payload = {
    profile: critical.profile,
    attendance: critical.attendance,
    finance: critical.finance,
    timetable: critical.timetable,
    progress: deferred.progress,
    timeline: deferred.timeline,
    branding: deferred.branding,
    shared: deferred.shared,
    documents: deferred.documents,
    examData: deferred.examData,
    classUpdates: deferred.classUpdates,
    derived: {
      attendanceWarnings: critical.derived.attendanceWarnings,
      missingDocuments: deferred.derived.missingDocuments,
      completionRate: deferred.derived.completionRate,
      pendingCount: deferred.derived.pendingCount,
      overdueCount: deferred.derived.overdueCount,
      nextExam: deferred.derived.nextExam,
    },
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
export const clearStudentDashboardCache = (studentId, isParent) => {
  const sId = studentId || "stud-001";
  cache.delete(`student-dashboard-critical-${sId}`);
  cache.delete(`student-dashboard-deferred-${sId}-${!!isParent}`);
  cache.delete(`student-dashboard-${sId}-${!!isParent}`);
};

/**
 * Invalidates only the deferred payload cache (notices, events, etc.)
 * Use this when new notices/events are created without needing to reload profile/attendance
 */
export const clearDeferredCache = (studentId, isParent) => {
  const sId = studentId || "stud-001";
  cache.delete(`student-dashboard-deferred-${sId}-${!!isParent}`);
  cache.delete(`student-dashboard-${sId}-${!!isParent}`);
};

export const studentDashboardService = {
  getCriticalStudentDashboardPayload,
  getDeferredStudentDashboardPayload,
  getStudentDashboardPayload,
  clearStudentDashboardCache,
};
