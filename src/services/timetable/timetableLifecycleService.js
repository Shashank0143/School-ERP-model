import { teacherDashboardService } from "../teacherDashboardService";
import { studentDashboardService } from "../studentDashboardService";
import { teacherScheduleProjectionService } from "./teacherScheduleProjectionService";
import { emitEvent, WORKFLOW_EVENTS } from "../workflowEvents";

/**
 * Orchestrates cross-domain cache invalidations, projection rebuilds, and UI events
 * whenever the institutional timetable state changes.
 */
export const emitTimetablePublished = async (payload = {}) => {
  console.log("[LIFECYCLE] Timetable published. Orchestrating system updates...", payload);

  // 1. Invalidate caches for all dashboards
  // Future architecture: cacheRegistryService.invalidateByDomain("timetable")
  teacherDashboardService.clearTeacherDashboardCache(null);
  studentDashboardService.clearStudentDashboardCache(null, false);
  studentDashboardService.clearStudentDashboardCache(null, true);

  // 2. Rebuild backend/service projections
  await teacherScheduleProjectionService.rebuildTeacherScheduleProjection();

  // 3. Dispatch global event so active UI sessions can silently re-fetch
  const eventPayload = {
    publishedAt: new Date().toISOString(),
    ...payload,
  };
  emitEvent(WORKFLOW_EVENTS.TIMETABLE_PUBLISHED, eventPayload);

  console.log("[LIFECYCLE] Timetable orchestration complete.");
};

export const timetableLifecycleService = {
  emitTimetablePublished,
};
