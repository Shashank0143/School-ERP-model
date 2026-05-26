/**
 * Cross-Portal Workflow Validation System
 *
 * Validates entire ERP ecosystem after class identity normalization.
 * Tests all workflows across Admin, Student, Parent, Teacher portals,
 * and the Login System to confirm institutional synchronization integrity.
 */

import { getItem } from "../persistence/storage";
import { extractLevel, normalizeClassLevel } from "./classIdentity";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Safely parses data from localStorage - handles both string and object formats
 */
function safeParse(data) {
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("JSON parse error:", e);
      return null;
    }
  }
  return data; // Already an object
}

// ============================================================================
// VALIDATION RESULT STRUCTURE
// ============================================================================

/**
 * @typedef {Object} WorkflowValidationResult
 * @property {boolean} valid - Overall validation status
 * @property {Object} admin - Admin portal validation results
 * @property {Object} student - Student portal validation results
 * @property {Object} parent - Parent portal validation results
 * @property {Object} teacher - Teacher portal validation results
 * @property {Object} login - Login system validation results
 * @property {Array<string>} errors - All errors across all portals
 * @property {Array<string>} warnings - All warnings across all portals
 * @property {Object} summary - Summary statistics
 */

// ============================================================================
// ADMIN PORTAL WORKFLOW VALIDATION
// ============================================================================

/**
 * Validates Admin Portal workflows
 */
function validateAdminPortal() {
  const errors = [];
  const warnings = [];
  const details = {
    classFilters: { valid: true, errors: [], warnings: [] },
    teacherAllocation: { valid: true, errors: [], warnings: [] },
    examTargeting: { valid: true, errors: [], warnings: [] },
    timetable: { valid: true, errors: [], warnings: [] },
    attendance: { valid: true, errors: [], warnings: [] },
    notices: { valid: true, errors: [], warnings: [] },
  };

  // 1. Class Filters
  try {
    const classes = getItem("erp_classes");
    if (classes) {
      const parsed = safeParse(classes);
      parsed.forEach((cls) => {
        if (cls.level) {
          const normalized = normalizeClassLevel(cls.level);
          if (
            cls.level !== normalized &&
            !["Nursery", "LKG", "UKG"].includes(cls.level)
          ) {
            details.classFilters.errors.push(
              `Class ${cls.id} has non-canonical level: ${cls.level}`,
            );
            errors.push(
              `Admin class filter: Class ${cls.id} has non-canonical level: ${cls.level}`,
            );
          }
        }
      });
    }
  } catch (e) {
    details.classFilters.warnings.push(
      `Could not validate class filters: ${e.message}`,
    );
    warnings.push(`Admin class filter validation error: ${e.message}`);
  }

  // 2. Teacher Allocation
  try {
    const teachers = getItem("erp_teachers");
    if (teachers) {
      const parsed = safeParse(teachers);
      parsed.forEach((teacher) => {
        if (teacher.assignedLevels && Array.isArray(teacher.assignedLevels)) {
          teacher.assignedLevels.forEach((level) => {
            const normalized = normalizeClassLevel(level);
            if (
              level !== normalized &&
              !["Nursery", "LKG", "UKG"].includes(level)
            ) {
              details.teacherAllocation.errors.push(
                `Teacher ${teacher.id} has non-canonical assignedLevel: ${level}`,
              );
              errors.push(
                `Admin teacher allocation: Teacher ${teacher.id} has non-canonical level: ${level}`,
              );
            }
          });
        }
        if (teacher.homeroom) {
          const level = extractLevel(teacher.homeroom);
          if (level && (level === "XI" || level === "XII")) {
            details.teacherAllocation.errors.push(
              `Teacher ${teacher.id} has legacy homeroom: ${teacher.homeroom}`,
            );
            errors.push(
              `Admin teacher allocation: Teacher ${teacher.id} has legacy homeroom: ${teacher.homeroom}`,
            );
          }
        }
      });
    }
  } catch (e) {
    details.teacherAllocation.warnings.push(
      `Could not validate teacher allocation: ${e.message}`,
    );
    warnings.push(`Admin teacher allocation validation error: ${e.message}`);
  }

  // 3. Exam Targeting
  try {
    const exams = getItem("erp_exams");
    if (exams) {
      const parsed = safeParse(exams);
      parsed.forEach((exam) => {
        if (exam.classLevel) {
          const normalized = normalizeClassLevel(exam.classLevel);
          if (
            exam.classLevel !== normalized &&
            !["Nursery", "LKG", "UKG"].includes(exam.classLevel)
          ) {
            details.examTargeting.errors.push(
              `Exam ${exam.id} has non-canonical classLevel: ${exam.classLevel}`,
            );
            errors.push(
              `Admin exam targeting: Exam ${exam.id} has non-canonical level: ${exam.classLevel}`,
            );
          }
        }
        if (exam.applicableClasses && Array.isArray(exam.applicableClasses)) {
          exam.applicableClasses.forEach((cls) => {
            const level = extractLevel(cls);
            if (level && (level === "XI" || level === "XII")) {
              details.examTargeting.errors.push(
                `Exam ${exam.id} has legacy applicableClass: ${cls}`,
              );
              errors.push(
                `Admin exam targeting: Exam ${exam.id} has legacy class: ${cls}`,
              );
            }
          });
        }
      });
    }
  } catch (e) {
    details.examTargeting.warnings.push(
      `Could not validate exam targeting: ${e.message}`,
    );
    warnings.push(`Admin exam targeting validation error: ${e.message}`);
  }

  // 4. Timetable
  try {
    const timetable = getItem("erp_timetable");
    if (timetable) {
      const parsed = safeParse(timetable);
      const entries = Array.isArray(parsed) ? parsed : Object.values(parsed);
      entries.forEach((entry) => {
        if (entry.classId) {
          const level = extractLevel(entry.classId);
          if (level && (level === "XI" || level === "XII")) {
            details.timetable.errors.push(
              `Timetable entry ${entry.id || "unknown"} has legacy classId: ${entry.classId}`,
            );
            errors.push(
              `Admin timetable: Entry has legacy classId: ${entry.classId}`,
            );
          }
        }
      });
    }
  } catch (e) {
    details.timetable.warnings.push(
      `Could not validate timetable: ${e.message}`,
    );
    warnings.push(`Admin timetable validation error: ${e.message}`);
  }

  // 5. Attendance
  try {
    const attendance = getItem("erp_attendance");
    if (attendance) {
      const parsed = safeParse(attendance);
      parsed.forEach((record) => {
        if (record.classId) {
          const level = extractLevel(record.classId);
          if (level && (level === "XI" || level === "XII")) {
            details.attendance.errors.push(
              `Attendance record ${record.id || "unknown"} has legacy classId: ${record.classId}`,
            );
            errors.push(
              `Admin attendance: Record has legacy classId: ${record.classId}`,
            );
          }
        }
      });
    }
  } catch (e) {
    details.attendance.warnings.push(
      `Could not validate attendance: ${e.message}`,
    );
    warnings.push(`Admin attendance validation error: ${e.message}`);
  }

  // 6. Notices
  try {
    const notices = getItem("erp_notices");
    if (notices) {
      const parsed = safeParse(notices);
      parsed.forEach((notice) => {
        if (notice.targetClass) {
          const level = extractLevel(notice.targetClass);
          if (level && (level === "XI" || level === "XII")) {
            details.notices.errors.push(
              `Notice ${notice.id || "unknown"} has legacy targetClass: ${notice.targetClass}`,
            );
            errors.push(
              `Admin notices: Notice has legacy targetClass: ${notice.targetClass}`,
            );
          }
        }
        if (
          notice.applicableClasses &&
          Array.isArray(notice.applicableClasses)
        ) {
          notice.applicableClasses.forEach((cls) => {
            const level = extractLevel(cls);
            if (level && (level === "XI" || level === "XII")) {
              details.notices.errors.push(
                `Notice ${notice.id || "unknown"} has legacy applicableClass: ${cls}`,
              );
              errors.push(`Admin notices: Notice has legacy class: ${cls}`);
            }
          });
        }
      });
    }
  } catch (e) {
    details.notices.warnings.push(`Could not validate notices: ${e.message}`);
    warnings.push(`Admin notices validation error: ${e.message}`);
  }

  // Calculate overall validity
  const valid = Object.values(details).every((d) => d.valid);

  return { valid, details, errors, warnings };
}

// ============================================================================
// STUDENT PORTAL WORKFLOW VALIDATION
// ============================================================================

/**
 * Validates Student Portal workflows
 */
function validateStudentPortal() {
  const errors = [];
  const warnings = [];
  const details = {
    exams: { valid: true, errors: [], warnings: [] },
    attendance: { valid: true, errors: [], warnings: [] },
    notices: { valid: true, errors: [], warnings: [] },
    results: { valid: true, errors: [], warnings: [] },
    timetable: { valid: true, errors: [], warnings: [] },
  };

  // 1. Exams (student view)
  try {
    const students = getItem("erp_students");
    if (students) {
      const parsed = safeParse(students);
      parsed.forEach((student) => {
        if (student.classLevel) {
          const normalized = normalizeClassLevel(student.classLevel);
          if (
            student.classLevel !== normalized &&
            !["Nursery", "LKG", "UKG"].includes(student.classLevel)
          ) {
            details.exams.errors.push(
              `Student ${student.id} has non-canonical classLevel: ${student.classLevel}`,
            );
            errors.push(
              `Student exams: Student ${student.id} has non-canonical level: ${student.classLevel}`,
            );
          }
        }
        if (student.classId) {
          const level = extractLevel(student.classId);
          if (level && (level === "XI" || level === "XII")) {
            details.exams.errors.push(
              `Student ${student.id} has legacy classId: ${student.classId}`,
            );
            errors.push(
              `Student exams: Student ${student.id} has legacy classId: ${student.classId}`,
            );
          }
        }
      });
    }
  } catch (e) {
    details.exams.warnings.push(
      `Could not validate student exams: ${e.message}`,
    );
    warnings.push(`Student exams validation error: ${e.message}`);
  }

  // 2. Attendance (student view)
  try {
    const attendance = getItem("erp_attendance");
    if (attendance) {
      const parsed = safeParse(attendance);
      parsed.forEach((record) => {
        if (record.classId) {
          const level = extractLevel(record.classId);
          if (level && (level === "XI" || level === "XII")) {
            details.attendance.errors.push(
              `Attendance record ${record.id || "unknown"} has legacy classId: ${record.classId}`,
            );
            errors.push(
              `Student attendance: Record has legacy classId: ${record.classId}`,
            );
          }
        }
      });
    }
  } catch (e) {
    details.attendance.warnings.push(
      `Could not validate student attendance: ${e.message}`,
    );
    warnings.push(`Student attendance validation error: ${e.message}`);
  }

  // 3. Notices (student view)
  try {
    const notices = getItem("erp_notices");
    if (notices) {
      const parsed = safeParse(notices);
      parsed.forEach((notice) => {
        if (notice.targetClass) {
          const level = extractLevel(notice.targetClass);
          if (level && (level === "XI" || level === "XII")) {
            details.notices.errors.push(
              `Notice ${notice.id || "unknown"} has legacy targetClass: ${notice.targetClass}`,
            );
            errors.push(
              `Student notices: Notice has legacy targetClass: ${notice.targetClass}`,
            );
          }
        }
      });
    }
  } catch (e) {
    details.notices.warnings.push(
      `Could not validate student notices: ${e.message}`,
    );
    warnings.push(`Student notices validation error: ${e.message}`);
  }

  // 4. Results (student view)
  try {
    const results = getItem("erp_results");
    if (results) {
      const parsed = safeParse(results);
      parsed.forEach((result) => {
        if (result.classId) {
          const level = extractLevel(result.classId);
          if (level && (level === "XI" || level === "XII")) {
            details.results.errors.push(
              `Result record ${result.id || "unknown"} has legacy classId: ${result.classId}`,
            );
            errors.push(
              `Student results: Record has legacy classId: ${result.classId}`,
            );
          }
        }
        if (result.classLevel) {
          const normalized = normalizeClassLevel(result.classLevel);
          if (
            result.classLevel !== normalized &&
            !["Nursery", "LKG", "UKG"].includes(result.classLevel)
          ) {
            details.results.errors.push(
              `Result record ${result.id || "unknown"} has non-canonical classLevel: ${result.classLevel}`,
            );
            errors.push(
              `Student results: Record has non-canonical level: ${result.classLevel}`,
            );
          }
        }
      });
    }
  } catch (e) {
    details.results.warnings.push(
      `Could not validate student results: ${e.message}`,
    );
    warnings.push(`Student results validation error: ${e.message}`);
  }

  // 5. Timetable (student view)
  try {
    const timetable = getItem("erp_timetable");
    if (timetable) {
      const parsed = safeParse(timetable);
      const entries = Array.isArray(parsed) ? parsed : Object.values(parsed);
      entries.forEach((entry) => {
        if (entry.classId) {
          const level = extractLevel(entry.classId);
          if (level && (level === "XI" || level === "XII")) {
            details.timetable.errors.push(
              `Timetable entry ${entry.id || "unknown"} has legacy classId: ${entry.classId}`,
            );
            errors.push(
              `Student timetable: Entry has legacy classId: ${entry.classId}`,
            );
          }
        }
      });
    }
  } catch (e) {
    details.timetable.warnings.push(
      `Could not validate student timetable: ${e.message}`,
    );
    warnings.push(`Student timetable validation error: ${e.message}`);
  }

  const valid = Object.values(details).every((d) => d.valid);

  return { valid, details, errors, warnings };
}

// ============================================================================
// PARENT PORTAL WORKFLOW VALIDATION
// ============================================================================

/**
 * Validates Parent Portal workflows
 */
function validateParentPortal() {
  const errors = [];
  const warnings = [];
  const details = {
    childMappings: { valid: true, errors: [], warnings: [] },
    notices: { valid: true, errors: [], warnings: [] },
    results: { valid: true, errors: [], warnings: [] },
    feeViews: { valid: true, errors: [], warnings: [] },
  };

  // 1. Child Mappings
  try {
    const students = getItem("erp_students");
    if (students) {
      const parsed = safeParse(students);
      parsed.forEach((student) => {
        if (student.classLevel) {
          const normalized = normalizeClassLevel(student.classLevel);
          if (
            student.classLevel !== normalized &&
            !["Nursery", "LKG", "UKG"].includes(student.classLevel)
          ) {
            details.childMappings.errors.push(
              `Student ${student.id} has non-canonical classLevel: ${student.classLevel}`,
            );
            errors.push(
              `Parent child mappings: Student ${student.id} has non-canonical level: ${student.classLevel}`,
            );
          }
        }
        if (student.classId) {
          const level = extractLevel(student.classId);
          if (level && (level === "XI" || level === "XII")) {
            details.childMappings.errors.push(
              `Student ${student.id} has legacy classId: ${student.classId}`,
            );
            errors.push(
              `Parent child mappings: Student ${student.id} has legacy classId: ${student.classId}`,
            );
          }
        }
      });
    }
  } catch (e) {
    details.childMappings.warnings.push(
      `Could not validate child mappings: ${e.message}`,
    );
    warnings.push(`Parent child mappings validation error: ${e.message}`);
  }

  // 2. Notices (parent view)
  try {
    const notices = getItem("erp_notices");
    if (notices) {
      const parsed = safeParse(notices);
      parsed.forEach((notice) => {
        if (notice.targetClass) {
          const level = extractLevel(notice.targetClass);
          if (level && (level === "XI" || level === "XII")) {
            details.notices.errors.push(
              `Notice ${notice.id || "unknown"} has legacy targetClass: ${notice.targetClass}`,
            );
            errors.push(
              `Parent notices: Notice has legacy targetClass: ${notice.targetClass}`,
            );
          }
        }
      });
    }
  } catch (e) {
    details.notices.warnings.push(
      `Could not validate parent notices: ${e.message}`,
    );
    warnings.push(`Parent notices validation error: ${e.message}`);
  }

  // 3. Results (parent view)
  try {
    const results = getItem("erp_results");
    if (results) {
      const parsed = safeParse(results);
      parsed.forEach((result) => {
        if (result.classId) {
          const level = extractLevel(result.classId);
          if (level && (level === "XI" || level === "XII")) {
            details.results.errors.push(
              `Result record ${result.id || "unknown"} has legacy classId: ${result.classId}`,
            );
            errors.push(
              `Parent results: Record has legacy classId: ${result.classId}`,
            );
          }
        }
      });
    }
  } catch (e) {
    details.results.warnings.push(
      `Could not validate parent results: ${e.message}`,
    );
    warnings.push(`Parent results validation error: ${e.message}`);
  }

  // 4. Fee Views
  try {
    const feeStructures = getItem("erp_fee_structures");
    if (feeStructures) {
      const parsed = safeParse(feeStructures);
      parsed.forEach((structure) => {
        if (structure.level) {
          const normalized = normalizeClassLevel(structure.level);
          if (
            structure.level !== normalized &&
            !["Nursery", "LKG", "UKG"].includes(structure.level)
          ) {
            details.feeViews.errors.push(
              `Fee structure ${structure.id} has non-canonical level: ${structure.level}`,
            );
            errors.push(
              `Parent fee views: Fee structure ${structure.id} has non-canonical level: ${structure.level}`,
            );
          }
        }
      });
    }
  } catch (e) {
    details.feeViews.warnings.push(
      `Could not validate fee views: ${e.message}`,
    );
    warnings.push(`Parent fee views validation error: ${e.message}`);
  }

  const valid = Object.values(details).every((d) => d.valid);

  return { valid, details, errors, warnings };
}

// ============================================================================
// TEACHER PORTAL WORKFLOW VALIDATION
// ============================================================================

/**
 * Validates Teacher Portal workflows
 */
function validateTeacherPortal() {
  const errors = [];
  const warnings = [];
  const details = {
    evaluations: { valid: true, errors: [], warnings: [] },
    assignedClasses: { valid: true, errors: [], warnings: [] },
    timetable: { valid: true, errors: [], warnings: [] },
    attendance: { valid: true, errors: [], warnings: [] },
  };

  // 1. Evaluations
  try {
    const teachers = getItem("erp_teachers");
    if (teachers) {
      const parsed = safeParse(teachers);
      parsed.forEach((teacher) => {
        if (teacher.assignedLevels && Array.isArray(teacher.assignedLevels)) {
          teacher.assignedLevels.forEach((level) => {
            const normalized = normalizeClassLevel(level);
            if (
              level !== normalized &&
              !["Nursery", "LKG", "UKG"].includes(level)
            ) {
              details.evaluations.errors.push(
                `Teacher ${teacher.id} has non-canonical assignedLevel: ${level}`,
              );
              errors.push(
                `Teacher evaluations: Teacher ${teacher.id} has non-canonical level: ${level}`,
              );
            }
          });
        }
      });
    }
  } catch (e) {
    details.evaluations.warnings.push(
      `Could not validate evaluations: ${e.message}`,
    );
    warnings.push(`Teacher evaluations validation error: ${e.message}`);
  }

  // 2. Assigned Classes
  try {
    const teachers = getItem("erp_teachers");
    if (teachers) {
      const parsed = safeParse(teachers);
      parsed.forEach((teacher) => {
        if (teacher.homeroom) {
          const level = extractLevel(teacher.homeroom);
          if (level && (level === "XI" || level === "XII")) {
            details.assignedClasses.errors.push(
              `Teacher ${teacher.id} has legacy homeroom: ${teacher.homeroom}`,
            );
            errors.push(
              `Teacher assigned classes: Teacher ${teacher.id} has legacy homeroom: ${teacher.homeroom}`,
            );
          }
        }
      });
    }
  } catch (e) {
    details.assignedClasses.warnings.push(
      `Could not validate assigned classes: ${e.message}`,
    );
    warnings.push(`Teacher assigned classes validation error: ${e.message}`);
  }

  // 3. Timetable (teacher view)
  try {
    const timetable = getItem("erp_timetable");
    if (timetable) {
      const parsed = safeParse(timetable);
      const entries = Array.isArray(parsed) ? parsed : Object.values(parsed);
      entries.forEach((entry) => {
        if (entry.classId) {
          const level = extractLevel(entry.classId);
          if (level && (level === "XI" || level === "XII")) {
            details.timetable.errors.push(
              `Timetable entry ${entry.id || "unknown"} has legacy classId: ${entry.classId}`,
            );
            errors.push(
              `Teacher timetable: Entry has legacy classId: ${entry.classId}`,
            );
          }
        }
      });
    }
  } catch (e) {
    details.timetable.warnings.push(
      `Could not validate teacher timetable: ${e.message}`,
    );
    warnings.push(`Teacher timetable validation error: ${e.message}`);
  }

  // 4. Attendance (teacher view)
  try {
    const attendance = getItem("erp_attendance");
    if (attendance) {
      const parsed = safeParse(attendance);
      parsed.forEach((record) => {
        if (record.classId) {
          const level = extractLevel(record.classId);
          if (level && (level === "XI" || level === "XII")) {
            details.attendance.errors.push(
              `Attendance record ${record.id || "unknown"} has legacy classId: ${record.classId}`,
            );
            errors.push(
              `Teacher attendance: Record has legacy classId: ${record.classId}`,
            );
          }
        }
      });
    }
  } catch (e) {
    details.attendance.warnings.push(
      `Could not validate teacher attendance: ${e.message}`,
    );
    warnings.push(`Teacher attendance validation error: ${e.message}`);
  }

  const valid = Object.values(details).every((d) => d.valid);

  return { valid, details, errors, warnings };
}

// ============================================================================
// LOGIN SYSTEM WORKFLOW VALIDATION
// ============================================================================

/**
 * Validates Login System workflows
 */
function validateLoginSystem() {
  const errors = [];
  const warnings = [];
  const details = {
    roleLookup: { valid: true, errors: [], warnings: [] },
    admissionLookup: { valid: true, errors: [], warnings: [] },
    classFiltering: { valid: true, errors: [], warnings: [] },
  };

  // 1. Role Lookup
  try {
    const users = getItem("erp_users");
    if (users) {
      const parsed = safeParse(users);
      parsed.forEach((user) => {
        if (user.role) {
          // Role should be one of: admin, teacher, student, parent
          const validRoles = ["admin", "teacher", "student", "parent"];
          if (!validRoles.includes(user.role)) {
            details.roleLookup.errors.push(
              `User ${user.id} has invalid role: ${user.role}`,
            );
            errors.push(
              `Login role lookup: User ${user.id} has invalid role: ${user.role}`,
            );
          }
        }
      });
    }
  } catch (e) {
    details.roleLookup.warnings.push(
      `Could not validate role lookup: ${e.message}`,
    );
    warnings.push(`Login role lookup validation error: ${e.message}`);
  }

  // 2. Admission Lookup
  try {
    const students = getItem("erp_students");
    if (students) {
      const parsed = safeParse(students);
      parsed.forEach((student) => {
        if (student.admissionNo) {
          // Admission number should match ADM2026XXX format
          if (!student.admissionNo.startsWith("ADM2026")) {
            details.admissionLookup.errors.push(
              `Student ${student.id} has invalid admissionNo: ${student.admissionNo}`,
            );
            errors.push(
              `Login admission lookup: Student ${student.id} has invalid admissionNo: ${student.admissionNo}`,
            );
          }
        }
      });
    }
  } catch (e) {
    details.admissionLookup.warnings.push(
      `Could not validate admission lookup: ${e.message}`,
    );
    warnings.push(`Login admission lookup validation error: ${e.message}`);
  }

  // 3. Class Filtering
  try {
    const filters = getItem("erp_filters");
    if (filters) {
      const parsed = safeParse(filters);
      if (parsed.class) {
        const level = extractLevel(parsed.class);
        if (level && (level === "XI" || level === "XII")) {
          details.classFiltering.errors.push(
            `Filter has legacy class: ${parsed.class}`,
          );
          errors.push(
            `Login class filtering: Filter has legacy class: ${parsed.class}`,
          );
        }
      }
      if (parsed.classLevel) {
        const normalized = normalizeClassLevel(parsed.classLevel);
        if (
          parsed.classLevel !== normalized &&
          !["Nursery", "LKG", "UKG"].includes(parsed.classLevel)
        ) {
          details.classFiltering.errors.push(
            `Filter has non-canonical classLevel: ${parsed.classLevel}`,
          );
          errors.push(
            `Login class filtering: Filter has non-canonical level: ${parsed.classLevel}`,
          );
        }
      }
    }
  } catch (e) {
    details.classFiltering.warnings.push(
      `Could not validate class filtering: ${e.message}`,
    );
    warnings.push(`Login class filtering validation error: ${e.message}`);
  }

  const valid = Object.values(details).every((d) => d.valid);

  return { valid, details, errors, warnings };
}

// ============================================================================
// MAIN VALIDATION FUNCTION
// ============================================================================

/**
 * Runs comprehensive cross-portal workflow validation.
 *
 * @returns {WorkflowValidationResult} Complete validation result
 */
export function validateCrossPortalWorkflows() {
  console.log(
    "[CrossPortalValidation] Starting comprehensive workflow validation...",
  );

  const admin = validateAdminPortal();
  const student = validateStudentPortal();
  const parent = validateParentPortal();
  const teacher = validateTeacherPortal();
  const login = validateLoginSystem();

  const allErrors = [
    ...admin.errors,
    ...student.errors,
    ...parent.errors,
    ...teacher.errors,
    ...login.errors,
  ];

  const allWarnings = [
    ...admin.warnings,
    ...student.warnings,
    ...parent.warnings,
    ...teacher.warnings,
    ...login.warnings,
  ];

  const valid = allErrors.length === 0;

  const summary = {
    totalErrors: allErrors.length,
    totalWarnings: allWarnings.length,
    adminValid: admin.valid,
    studentValid: student.valid,
    parentValid: parent.valid,
    teacherValid: teacher.valid,
    loginValid: login.valid,
  };

  if (!valid) {
    console.error(
      "[CrossPortalValidation] Workflow validation failed:",
      allErrors,
    );
  }
  if (allWarnings.length > 0) {
    console.warn(
      "[CrossPortalValidation] Workflow validation warnings:",
      allWarnings,
    );
  }

  console.log("[CrossPortalValidation] Workflow validation complete:", summary);

  return {
    valid,
    admin: admin.details,
    student: student.details,
    parent: parent.details,
    teacher: teacher.details,
    login: login.details,
    errors: allErrors,
    warnings: allWarnings,
    summary,
  };
}

/**
 * Generates a human-readable validation report.
 *
 * @param {WorkflowValidationResult} result - Validation result
 * @returns {string} Formatted report
 */
export function generateValidationReport(result) {
  const lines = [];

  lines.push("=".repeat(80));
  lines.push("CROSS-PORTAL WORKFLOW VALIDATION REPORT");
  lines.push("=".repeat(80));
  lines.push("");

  lines.push(`Overall Status: ${result.valid ? "✓ PASSED" : "✗ FAILED"}`);
  lines.push(`Total Errors: ${result.summary.totalErrors}`);
  lines.push(`Total Warnings: ${result.summary.totalWarnings}`);
  lines.push("");

  lines.push("-".repeat(80));
  lines.push("PORTAL STATUS");
  lines.push("-".repeat(80));
  lines.push(
    `Admin Portal: ${result.summary.adminValid ? "✓ PASSED" : "✗ FAILED"}`,
  );
  lines.push(
    `Student Portal: ${result.summary.studentValid ? "✓ PASSED" : "✗ FAILED"}`,
  );
  lines.push(
    `Parent Portal: ${result.summary.parentValid ? "✓ PASSED" : "✗ FAILED"}`,
  );
  lines.push(
    `Teacher Portal: ${result.summary.teacherValid ? "✓ PASSED" : "✗ FAILED"}`,
  );
  lines.push(
    `Login System: ${result.summary.loginValid ? "✓ PASSED" : "✗ FAILED"}`,
  );
  lines.push("");

  if (result.errors.length > 0) {
    lines.push("-".repeat(80));
    lines.push("ERRORS");
    lines.push("-".repeat(80));
    result.errors.forEach((error) => {
      lines.push(`✗ ${error}`);
    });
    lines.push("");
  }

  if (result.warnings.length > 0) {
    lines.push("-".repeat(80));
    lines.push("WARNINGS");
    lines.push("-".repeat(80));
    result.warnings.forEach((warning) => {
      lines.push(`⚠ ${warning}`);
    });
    lines.push("");
  }

  lines.push("=".repeat(80));
  lines.push("END OF REPORT");
  lines.push("=".repeat(80));

  return lines.join("\n");
}

/**
 * Prints validation report to console.
 *
 * @param {WorkflowValidationResult} result - Validation result
 */
export function printValidationReport(result) {
  console.log(generateValidationReport(result));
}
