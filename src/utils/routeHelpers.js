import { ROLES } from "../auth/roles";

/**
 * Maps sidebar navigation IDs to their corresponding route paths based on the user role.
 */
export function getRouteForNavItem(id, role) {
  if (role === ROLES.STUDENT) {
    switch (id) {
      case "home": return "/student/dashboard";
      case "assignments": return "/student/assignments";
      case "courses": return "/student/subjects";
      case "timetable": return "/student/timetable";
      case "examination": return "/student/examinations";
      case "feeDetails": return "/student/fees";
      case "transport": return "/student/transport";
      case "clubsCommittees": return "/student/clubs";
      case "mentorSupport": return "/student/mentor-support";
      case "documents": return "/student/documents";
      case "achievements": return "/student/achievements";
      case "calendar": return "/student/calendar";
      case "profile": return "/student/profile";
      default: return "/student/dashboard";
    }
  }
  if (role === ROLES.PARENT) {
    switch (id) {
      case "home": return "/parent/dashboard";
      case "assignments": return "/parent/assignments";
      case "courses": return "/parent/subjects";
      case "timetable": return "/parent/timetable";
      case "examination": return "/parent/examinations";
      case "feeDetails": return "/parent/fees";
      case "transport": return "/parent/transport";
      case "mentorSupport": return "/parent/mentor-support";
      case "documents": return "/parent/documents";
      case "achievements": return "/parent/achievements";
      case "profile": return "/parent/profile";
      default: return "/parent/dashboard";
    }
  }
  if (role === ROLES.TEACHER) {
    switch (id) {
      case "teacher_home": return "/teacher/dashboard";
      case "attendance_mgmt": return "/teacher/attendance";
      case "assignments_mgmt": return "/teacher/assignments";
      case "marks_exams": return "/teacher/marks";
      case "class_timetable": return "/teacher/timetable";
      case "student_perf": return "/teacher/students";
      case "mentorship_mgmt": return "/teacher/mentorship";
      case "announcements": return "/teacher/announcements";
      case "clubs_activities": return "/teacher/clubs";
      case "reports_analytics": return "/teacher/reports";
      case "profile_settings": return "/teacher/profile-settings";
      default: return "/teacher/dashboard";
    }
  }
  if (role === ROLES.ADMIN) {
    switch (id) {
      case "home": return "/admin/dashboard";
      case "fee_mgmt": return "/admin/fee-mgmt";
      case "transport_mgmt": return "/admin/transport-mgmt";
      case "announcements": return "/admin/announcements";
      case "administration": return "/admin/administration";
      case "profile": return "/admin/profile";
      default: return "/admin/dashboard";
    }
  }
  return "/";
}

/**
 * Checks if a navigation item is active based on the current route path and user role.
 */
export function isNavItemActive(id, role, pathname) {
  const targetRoute = getRouteForNavItem(id, role);
  
  if (id === "courses") {
    // Both courses overview and individual subject details map to the courses sidebar item
    return pathname.startsWith(targetRoute);
  }
  
  return pathname === targetRoute;
}
