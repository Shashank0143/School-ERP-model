/**
 * services/teacherClassification.js
 *
 * TEACHER TYPE CLASSIFICATION ENGINE
 *
 * Pure deterministic utility — no I/O, no side effects, no React.
 * All classification logic lives here. Services consume these functions.
 *
 * Business Rules (Indian K-12 CBSE):
 *
 * FOUNDATION (Nursery → Class 4):
 *   - One teacher owns an entire section
 *   - That teacher teaches ALL subjects in that section
 *   - That teacher IS the class teacher (homeroom authority)
 *   - teacherType = "FOUNDATION"
 *
 * SPECIALIZED (Class 5 → Class 12):
 *   - One teacher = one subject specialization only
 *   - May teach that subject across multiple sections/classes
 *   - May or may not be class teacher
 *   - Class teacher MUST teach at least one subject in that class
 *   - teacherType = "SPECIALIZED"
 *
 * ACTIVITY (Cross-school):
 *   - Art, Music, PE, Library
 *   - Teaches across all levels
 *   - teacherType = "ACTIVITY"
 */

import { extractLevel, isFoundationClass } from "../utils/classIdentity";

// ─── Level Classification ─────────────────────────────────────────────────────

export const FOUNDATION_LEVELS = ["Nursery", "LKG", "UKG", "1", "2", "3", "4"];
export const SPECIALIZED_LEVELS = ["5", "6", "7", "8", "9", "10", "11", "12"];
export const ACTIVITY_SUBJECT_IDS = [
  "act-art",
  "act-music",
  "act-games",
  "act-library",
  "sub-pe",
];

// Legacy: use isFoundationClass from classIdentity instead
export const isFoundationLevel = (classLevel) => isFoundationClass(classLevel);

export const TEACHER_TYPES = {
  FOUNDATION: "FOUNDATION",
  SPECIALIZED: "SPECIALIZED",
  ACTIVITY: "ACTIVITY",
};

/**
 * Determines whether a class level is a specialized level.
 * @param {string} classLevel - e.g. "5", "8", "11"
 * @returns {boolean}
 */
export const isSpecializedLevel = (classLevel) => {
  return SPECIALIZED_LEVELS.includes(String(classLevel));
};

/**
 * Derives the teacher type from a teacher record.
 * Handles all three teacher models deterministically.
 *
 * @param {Object} teacher - Teacher record from storage
 * @returns {"FOUNDATION" | "SPECIALIZED" | "ACTIVITY"}
 */
export const deriveTeacherType = (teacher) => {
  if (!teacher) return TEACHER_TYPES.SPECIALIZED;

  // Explicit field takes precedence (already set by generator or migration)
  if (teacher.teacherType) {
    const t = String(teacher.teacherType).toUpperCase();
    if (t === "FOUNDATION" || t === "section-homeroom")
      return TEACHER_TYPES.FOUNDATION;
    if (t === "ACTIVITY" || t === "activity-specialized")
      return TEACHER_TYPES.ACTIVITY;
    if (t === "SPECIALIZED" || t === "subject-specialized")
      return TEACHER_TYPES.SPECIALIZED;
  }

  // Infer from specialization subject
  if (
    teacher.specializationSubjectId &&
    ACTIVITY_SUBJECT_IDS.includes(teacher.specializationSubjectId)
  ) {
    return TEACHER_TYPES.ACTIVITY;
  }
  if (teacher.subjectId && ACTIVITY_SUBJECT_IDS.includes(teacher.subjectId)) {
    return TEACHER_TYPES.ACTIVITY;
  }

  // Infer from assigned levels
  const levels = teacher.assignedLevels || [];
  if (levels.length > 0) {
    const allFoundation = levels.every((l) => isFoundationLevel(l));
    if (allFoundation) return TEACHER_TYPES.FOUNDATION;
  }

  // Infer from multi-subject marker
  if (
    teacher.specializationSubjectId === "multi-subject" ||
    teacher.subjectId === "multi-subject"
  ) {
    return TEACHER_TYPES.FOUNDATION;
  }

  return TEACHER_TYPES.SPECIALIZED;
};

/**
 * Checks if a teacher is allowed to be the class teacher of a given class.
 *
 * Foundation: teacher must own that class (homeroom === classId)
 * Specialized: teacher must have at least one subject assignment in that class
 *
 * @param {Object} teacher - Teacher record
 * @param {string} classId - e.g. "class-8b"
 * @param {Array} teacherSubjectAssignments - all TSA records
 * @returns {boolean}
 */
export const canBeClassTeacher = (
  teacher,
  classId,
  teacherSubjectAssignments = [],
) => {
  if (!teacher || !classId) return false;

  const type = deriveTeacherType(teacher);

  if (type === TEACHER_TYPES.FOUNDATION) {
    // Foundation teacher owns their specific section only
    return (teacher.assignedClasses || []).includes(classId);
  }

  if (type === TEACHER_TYPES.ACTIVITY) {
    // Activity teachers do not hold class teacher authority
    return false;
  }

  // Specialized: must actually teach a subject in this class
  return teacherSubjectAssignments.some(
    (a) => a.teacherId === teacher.id && a.classId === classId,
  );
};

/**
 * Validates that a teacher is not teaching multiple different subject specializations.
 * Foundation teachers are exempt (they teach multi-subject by design).
 *
 * @param {Object} teacher - Teacher record
 * @param {Array} teacherSubjectAssignments - all TSA records for this teacher
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateSpecializationIntegrity = (
  teacher,
  teacherSubjectAssignments = [],
) => {
  if (!teacher) return { valid: false, error: "Teacher not found." };

  const type = deriveTeacherType(teacher);

  // Foundation and Activity teachers are exempt
  if (type === TEACHER_TYPES.FOUNDATION || type === TEACHER_TYPES.ACTIVITY) {
    return { valid: true };
  }

  const teacherAssignments = teacherSubjectAssignments.filter(
    (a) => a.teacherId === teacher.id,
  );

  if (teacherAssignments.length === 0) return { valid: true };

  const uniqueSubjectIds = [
    ...new Set(teacherAssignments.map((a) => a.subjectId)),
  ];

  if (uniqueSubjectIds.length > 1) {
    return {
      valid: false,
      error: `Specialized teacher "${teacher.name}" (${teacher.id}) is assigned to multiple subjects: [${uniqueSubjectIds.join(", ")}]. Only one specialization is permitted.`,
    };
  }

  // Also validate against declared specialization
  const declaredSpecialization =
    teacher.specializationSubjectId || teacher.subjectId;
  if (
    declaredSpecialization &&
    uniqueSubjectIds[0] &&
    uniqueSubjectIds[0] !== declaredSpecialization
  ) {
    return {
      valid: false,
      error: `Teacher "${teacher.name}" declared specialization is "${declaredSpecialization}" but is assigned subject "${uniqueSubjectIds[0]}".`,
    };
  }

  return { valid: true };
};

/**
 * Validates that a proposed class teacher assignment is legitimate.
 *
 * @param {Object} teacher
 * @param {string} classId
 * @param {Array} teacherSubjectAssignments
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateClassTeacherAssignment = (
  teacher,
  classId,
  teacherSubjectAssignments = [],
) => {
  if (!teacher) return { valid: false, error: "Teacher not found." };
  if (!classId) return { valid: false, error: "Class ID is required." };

  const type = deriveTeacherType(teacher);

  if (type === TEACHER_TYPES.ACTIVITY) {
    return {
      valid: false,
      error: `Activity teacher "${teacher.name}" cannot be assigned as class teacher.`,
    };
  }

  if (type === TEACHER_TYPES.FOUNDATION) {
    const owns = (teacher.assignedClasses || []).includes(classId);
    if (!owns) {
      return {
        valid: false,
        error: `Foundation teacher "${teacher.name}" does not own class "${classId}".`,
      };
    }
    return { valid: true };
  }

  // Specialized: must teach at least one subject in this class
  const teachesInClass = teacherSubjectAssignments.some(
    (a) => a.teacherId === teacher.id && a.classId === classId,
  );

  if (!teachesInClass) {
    return {
      valid: false,
      error: `Teacher "${teacher.name}" does not teach any subject in class "${classId}". A class teacher must teach at least one subject in that class.`,
    };
  }

  return { valid: true };
};

/**
 * Given a classId, returns the canonical teacher type model expected for that class.
 * @param {string} classId - e.g. "class-3a", "class-9c"
 * @returns {"FOUNDATION" | "SPECIALIZED"}
 */
export const getExpectedTeacherModelForClass = (classId) => {
  const level = extractLevel(classId);
  return isFoundationClass(level)
    ? TEACHER_TYPES.FOUNDATION
    : TEACHER_TYPES.SPECIALIZED;
};

/**
 * Validates that a complete class teacher assignment set is consistent.
 * Checks all classes have valid class teacher links.
 *
 * @param {Array} classes
 * @param {Array} teachers
 * @param {Array} teacherSubjectAssignments
 * @returns {Array<{ classId: string, valid: boolean, error?: string }>}
 */
export const auditAllClassTeacherAssignments = (
  classes,
  teachers,
  teacherSubjectAssignments,
) => {
  const teacherMap = new Map(teachers.map((t) => [t.id, t]));

  return classes.map((cls) => {
    if (!cls.classTeacherId) {
      return {
        classId: cls.id,
        valid: false,
        error: `Class "${cls.id}" has no classTeacherId assigned.`,
      };
    }

    const teacher = teacherMap.get(cls.classTeacherId);
    if (!teacher) {
      return {
        classId: cls.id,
        valid: false,
        error: `classTeacherId "${cls.classTeacherId}" in class "${cls.id}" does not resolve to a known teacher.`,
      };
    }

    const result = validateClassTeacherAssignment(
      teacher,
      cls.id,
      teacherSubjectAssignments,
    );
    return { classId: cls.id, valid: result.valid, error: result.error };
  });
};
