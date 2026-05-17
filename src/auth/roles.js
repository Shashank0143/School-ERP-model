/**
 * auth/roles.js
 * Centralized role definitions for EduDash ERP.
 */

export const ROLES = {
  STUDENT: "STUDENT",
  PARENT: "PARENT",
  TEACHER: "TEACHER",
  ADMIN: "ADMIN",
};

/**
 * Basic permissions mapping (Future-proofing)
 */
export const ROLE_PERMISSIONS = {
  [ROLES.STUDENT]: ["view_timetable", "view_fees", "view_exams", "view_transport"],
  [ROLES.PARENT]: ["view_timetable", "view_fees", "view_exams", "view_transport", "view_insights"],
  [ROLES.TEACHER]: ["manage_attendance", "upload_marks", "view_classes"],
  [ROLES.ADMIN]: ["manage_fees", "manage_transport", "manage_staff", "post_announcements"],
};
