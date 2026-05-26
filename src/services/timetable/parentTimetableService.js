import { studentTimetableProjectionService } from "./studentTimetableProjectionService";
import { getChildren } from "../parentService";

/**
 * Get timetable for a child. Validates that the parentId has access to childId.
 */
export const getParentChildTimetable = async (parentId, childId) => {
  // Relational validation
  const children = await getChildren(parentId);
  const isAuthorized = children.some((c) => c.id === childId);

  if (!isAuthorized) {
    return studentTimetableProjectionService.createEmptyTimetableProjection();
  }

  return await studentTimetableProjectionService.buildStudentTimetableProjection(childId);
};

export const parentTimetableService = {
  getParentChildTimetable,
};
