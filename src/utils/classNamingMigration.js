/**
 * Class Naming Migration Compatibility Layer
 *
 * Safely migrates existing persisted data from old naming (XI, XII)
 * to new canonical naming (11, 12) without resetting ERP state.
 *
 * This migration is idempotent - safe to run multiple times.
 * It only modifies data that needs conversion, preserving everything else.
 */

import {
  normalizeClassLevel,
  extractLevel,
  extractSection,
} from "./classIdentity";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Checks if any legacy Roman numeral data exists in localStorage
 * @returns {boolean} True if legacy data detected
 */
function checkForLegacyData() {
  const keysToCheck = [
    STORAGE_KEYS.CLASSES,
    STORAGE_KEYS.NOTICES,
    STORAGE_KEYS.FEE_STRUCTURES,
    STORAGE_KEYS.STUDENTS,
    STORAGE_KEYS.EXAMS,
    STORAGE_KEYS.EXAM_PAPERS,
    STORAGE_KEYS.ATTENDANCE,
    STORAGE_KEYS.RESULTS,
    STORAGE_KEYS.ANALYTICS,
    STORAGE_KEYS.FILTERS,
    STORAGE_KEYS.TEACHER_SUBJECT_ASSIGNMENTS,
  ];

  for (const key of keysToCheck) {
    const data = localStorage.getItem(key);
    if (!data) continue;

    // Check raw string for legacy Roman numerals
    if (/\bXI\b|\bXII\b/.test(data)) {
      console.log(`[Migration] Legacy data detected in ${key}`);
      return true;
    }
  }

  return false;
}

// ============================================================================
// MIGRATION VERSION TRACKING
// ============================================================================

const MIGRATION_VERSION_KEY = "erp_class_naming_migration_version";
const MIGRATION_VERSION = "1.0.3"; // Bumped to force re-run with deep migration

/**
 * Checks if migration has already been run.
 * @returns {boolean} True if migration is needed
 */
export function needsMigration() {
  const currentVersion = localStorage.getItem(MIGRATION_VERSION_KEY);
  return currentVersion !== MIGRATION_VERSION;
}

/**
 * Marks migration as complete.
 */
export function markMigrationComplete() {
  localStorage.setItem(MIGRATION_VERSION_KEY, MIGRATION_VERSION);
}

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
  STUDENTS: "erp_students",
  CLASSES: "erp_classes",
  EXAMS: "erp_exams",
  EXAM_PAPERS: "erp_exam_papers",
  NOTICES: "erp_notices",
  ATTENDANCE: "erp_attendance",
  RESULTS: "erp_results",
  ANALYTICS: "erp_analytics",
  FILTERS: "erp_filters",
  FEE_STRUCTURES: "erp_fee_structures",
  TEACHER_SUBJECT_ASSIGNMENTS: "erp_teacher_subject_assignments",
};

// ============================================================================
// CORE MIGRATION UTILITIES
// ============================================================================

/**
 * Deep migration helper that replaces XI/XII in all string values recursively.
 * This ensures no legacy Roman numerals remain anywhere in the data.
 * @param {any} value - Value to migrate
 * @returns {any} Migrated value
 */
function deepMigrateValue(value) {
  if (typeof value === "string") {
    return value
      .replace(/\bXI\b/g, "11")
      .replace(/\bXII\b/g, "12")
      .replace(/-xi-/g, "-11-")
      .replace(/-xii-/g, "-12-")
      .replace(/^fs-xi/g, "fs-11")
      .replace(/^fs-xii/g, "fs-12")
      .replace(/class-xi/g, "class-11")
      .replace(/class-xii/g, "class-12");
  }
  if (Array.isArray(value)) {
    return value.map(deepMigrateValue);
  }
  if (value !== null && typeof value === "object") {
    const migrated = {};
    for (const key of Object.keys(value)) {
      migrated[key] = deepMigrateValue(value[key]);
    }
    return migrated;
  }
  return value;
}

/**
 * Migrates a single class level string.
 * @param {string} level - Old class level (e.g., "XI", "XII", "11")
 * @returns {string} Migrated class level (e.g., "11", "12", "11")
 */
function migrateClassLevel(level) {
  if (!level) return level;
  return normalizeClassLevel(level);
}

/**
 * Migrates a class name/ID string.
 * @param {string} classIdentifier - Old class identifier (e.g., "XI-A", "class-xia")
 * @returns {string} Migrated class identifier (e.g., "11-A", "class-11a")
 */
function migrateClassIdentifier(classIdentifier) {
  if (!classIdentifier) return classIdentifier;

  // Handle class- IDs (e.g., "class-xia" → "class-11a")
  if (classIdentifier.startsWith("class-")) {
    const level = extractLevel(classIdentifier);
    const section = extractSection(classIdentifier);
    const migratedLevel = migrateClassLevel(level);
    return `class-${migratedLevel.toLowerCase()}${section.toLowerCase()}`;
  }

  // Handle display names (e.g., "XI-A" → "11-A")
  if (classIdentifier.includes("-")) {
    const parts = classIdentifier.split("-");
    if (parts.length === 2) {
      const migratedLevel = migrateClassLevel(parts[0]);
      return `${migratedLevel}-${parts[1]}`;
    }
  }

  // Single level (e.g., "XI" → "11")
  return migrateClassLevel(classIdentifier);
}

// ============================================================================
// DATA MIGRATION FUNCTIONS
// ============================================================================

/**
 * Migrates students data.
 * Converts classLevel, classId, and className fields.
 */
function migrateStudents() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!data) return;

    const students = JSON.parse(data);
    let migrated = false;

    const migratedStudents = students.map((student) => {
      let updated = { ...student };

      // Migrate classLevel
      if (student.classLevel) {
        const oldLevel = student.classLevel;
        const newLevel = migrateClassLevel(oldLevel);
        if (oldLevel !== newLevel) {
          updated.classLevel = newLevel;
          migrated = true;
        }
      }

      // Migrate classId
      if (student.classId) {
        const oldClassId = student.classId;
        const newClassId = migrateClassIdentifier(oldClassId);
        if (oldClassId !== newClassId) {
          updated.classId = newClassId;
          migrated = true;
        }
      }

      // Migrate className (display field)
      if (student.className) {
        const oldClassName = student.className;
        const newClassName = migrateClassIdentifier(oldClassName);
        if (oldClassName !== newClassName) {
          updated.className = newClassName;
          migrated = true;
        }
      }

      return updated;
    });

    if (migrated) {
      localStorage.setItem(
        STORAGE_KEYS.STUDENTS,
        JSON.stringify(migratedStudents),
      );
      console.log(`[Migration] Migrated ${students.length} students`);
    }
  } catch (error) {
    console.error("[Migration] Error migrating students:", error);
  }
}

/**
 * Migrates classes data.
 * Converts level, id, name, and displayName fields.
 */
function migrateClasses() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CLASSES);
    if (!data) return;

    const classes = JSON.parse(data);
    let migrated = false;

    const migratedClasses = classes.map((cls) => {
      let updated = { ...cls };

      // Migrate level
      if (cls.level) {
        const oldLevel = cls.level;
        const newLevel = migrateClassLevel(oldLevel);
        if (oldLevel !== newLevel) {
          updated.level = newLevel;
          migrated = true;
        }
      }

      // Migrate id/classId
      if (cls.id || cls.classId) {
        const oldId = cls.id || cls.classId;
        const newId = migrateClassIdentifier(oldId);
        if (oldId !== newId) {
          updated.id = newId;
          updated.classId = newId;
          migrated = true;
        }
      }

      // Migrate name/className
      if (cls.name || cls.className) {
        const oldName = cls.name || cls.className;
        const newName = migrateClassIdentifier(oldName);
        if (oldName !== newName) {
          updated.name = newName;
          updated.className = newName;
          migrated = true;
        }
      }

      // Migrate displayName
      if (cls.displayName) {
        const oldDisplayName = cls.displayName;
        // Replace XI/XII in displayName while preserving rest
        const newDisplayName = oldDisplayName
          .replace(/\bXI\b/g, "11")
          .replace(/\bXII\b/g, "12");
        if (oldDisplayName !== newDisplayName) {
          updated.displayName = newDisplayName;
          migrated = true;
        }
      }

      return updated;
    });

    if (migrated) {
      localStorage.setItem(
        STORAGE_KEYS.CLASSES,
        JSON.stringify(migratedClasses),
      );
      console.log(`[Migration] Migrated ${classes.length} classes`);
    }
  } catch (error) {
    console.error("[Migration] Error migrating classes:", error);
  }
}

/**
 * Migrates exams data.
 * Converts classLevel and classId fields in exam records.
 */
function migrateExams() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.EXAMS);
    if (!data) return;

    const exams = JSON.parse(data);
    let migrated = false;

    const migratedExams = exams.map((exam) => {
      let updated = { ...exam };

      // Migrate classLevel
      if (exam.classLevel) {
        const oldLevel = exam.classLevel;
        const newLevel = migrateClassLevel(oldLevel);
        if (oldLevel !== newLevel) {
          updated.classLevel = newLevel;
          migrated = true;
        }
      }

      // Migrate applicableClasses array
      if (exam.applicableClasses && Array.isArray(exam.applicableClasses)) {
        const oldClasses = exam.applicableClasses;
        const newClasses = oldClasses.map(migrateClassIdentifier);
        if (JSON.stringify(oldClasses) !== JSON.stringify(newClasses)) {
          updated.applicableClasses = newClasses;
          migrated = true;
        }
      }

      return updated;
    });

    if (migrated) {
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(migratedExams));
      console.log(`[Migration] Migrated ${exams.length} exams`);
    }
  } catch (error) {
    console.error("[Migration] Error migrating exams:", error);
  }
}

/**
 * Migrates exam papers data.
 * Converts classId and classLevel fields.
 */
function migrateExamPapers() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.EXAM_PAPERS);
    if (!data) return;

    const papers = JSON.parse(data);
    let migrated = false;

    const migratedPapers = papers.map((paper) => {
      let updated = { ...paper };

      // Migrate classId
      if (paper.classId) {
        const oldClassId = paper.classId;
        const newClassId = migrateClassIdentifier(oldClassId);
        if (oldClassId !== newClassId) {
          updated.classId = newClassId;
          migrated = true;
        }
      }

      // Migrate classLevel
      if (paper.classLevel) {
        const oldLevel = paper.classLevel;
        const newLevel = migrateClassLevel(oldLevel);
        if (oldLevel !== newLevel) {
          updated.classLevel = newLevel;
          migrated = true;
        }
      }

      return updated;
    });

    if (migrated) {
      localStorage.setItem(
        STORAGE_KEYS.EXAM_PAPERS,
        JSON.stringify(migratedPapers),
      );
      console.log(`[Migration] Migrated ${papers.length} exam papers`);
    }
  } catch (error) {
    console.error("[Migration] Error migrating exam papers:", error);
  }
}

/**
 * Migrates notices data.
 * Deep migrates all string values to replace XI/XII.
 */
function migrateNotices() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.NOTICES);
    if (!data) return;

    const notices = JSON.parse(data);
    const migratedNotices = notices.map(deepMigrateValue);

    // Check if anything changed by comparing stringified versions
    const hasChanges =
      JSON.stringify(notices) !== JSON.stringify(migratedNotices);

    if (hasChanges) {
      localStorage.setItem(
        STORAGE_KEYS.NOTICES,
        JSON.stringify(migratedNotices),
      );
      console.log(`[Migration] Migrated ${notices.length} notices`);
    }
  } catch (error) {
    console.error("[Migration] Error migrating notices:", error);
  }
}

/**
 * Migrates attendance data.
 * Converts classId and student class references.
 */
function migrateAttendance() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (!data) return;

    const attendance = JSON.parse(data);
    let migrated = false;

    const migratedAttendance = attendance.map((record) => {
      let updated = { ...record };

      // Migrate classId
      if (record.classId) {
        const oldClassId = record.classId;
        const newClassId = migrateClassIdentifier(oldClassId);
        if (oldClassId !== newClassId) {
          updated.classId = newClassId;
          migrated = true;
        }
      }

      // Migrate student class references if present
      if (record.students && Array.isArray(record.students)) {
        const oldStudents = record.students;
        const newStudents = oldStudents.map((student) => {
          if (student.classId) {
            return {
              ...student,
              classId: migrateClassIdentifier(student.classId),
            };
          }
          return student;
        });
        if (JSON.stringify(oldStudents) !== JSON.stringify(newStudents)) {
          updated.students = newStudents;
          migrated = true;
        }
      }

      return updated;
    });

    if (migrated) {
      localStorage.setItem(
        STORAGE_KEYS.ATTENDANCE,
        JSON.stringify(migratedAttendance),
      );
      console.log(
        `[Migration] Migrated ${attendance.length} attendance records`,
      );
    }
  } catch (error) {
    console.error("[Migration] Error migrating attendance:", error);
  }
}

/**
 * Migrates results data.
 * Converts classId, classLevel, and student class references.
 */
function migrateResults() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RESULTS);
    if (!data) return;

    const results = JSON.parse(data);
    let migrated = false;

    const migratedResults = results.map((result) => {
      let updated = { ...result };

      // Migrate classId
      if (result.classId) {
        const oldClassId = result.classId;
        const newClassId = migrateClassIdentifier(oldClassId);
        if (oldClassId !== newClassId) {
          updated.classId = newClassId;
          migrated = true;
        }
      }

      // Migrate classLevel
      if (result.classLevel) {
        const oldLevel = result.classLevel;
        const newLevel = migrateClassLevel(oldLevel);
        if (oldLevel !== newLevel) {
          updated.classLevel = newLevel;
          migrated = true;
        }
      }

      // Migrate student class references
      if (result.student && result.student.classId) {
        const oldStudentClassId = result.student.classId;
        const newStudentClassId = migrateClassIdentifier(oldStudentClassId);
        if (oldStudentClassId !== newStudentClassId) {
          updated.student = {
            ...result.student,
            classId: newStudentClassId,
          };
          migrated = true;
        }
      }

      return updated;
    });

    if (migrated) {
      localStorage.setItem(
        STORAGE_KEYS.RESULTS,
        JSON.stringify(migratedResults),
      );
      console.log(`[Migration] Migrated ${results.length} result records`);
    }
  } catch (error) {
    console.error("[Migration] Error migrating results:", error);
  }
}

/**
 * Migrates analytics data.
 * Converts class references in analytics records.
 */
function migrateAnalytics() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
    if (!data) return;

    const analytics = JSON.parse(data);
    let migrated = false;

    const migratedAnalytics = analytics.map((record) => {
      let updated = { ...record };

      // Migrate classId
      if (record.classId) {
        const oldClassId = record.classId;
        const newClassId = migrateClassIdentifier(oldClassId);
        if (oldClassId !== newClassId) {
          updated.classId = newClassId;
          migrated = true;
        }
      }

      // Migrate classLevel
      if (record.classLevel) {
        const oldLevel = record.classLevel;
        const newLevel = migrateClassLevel(oldLevel);
        if (oldLevel !== newLevel) {
          updated.classLevel = newLevel;
          migrated = true;
        }
      }

      // Migrate class filter if present
      if (record.filter && record.filter.class) {
        const oldFilterClass = record.filter.class;
        const newFilterClass = migrateClassIdentifier(oldFilterClass);
        if (oldFilterClass !== newFilterClass) {
          updated.filter = {
            ...record.filter,
            class: newFilterClass,
          };
          migrated = true;
        }
      }

      return updated;
    });

    if (migrated) {
      localStorage.setItem(
        STORAGE_KEYS.ANALYTICS,
        JSON.stringify(migratedAnalytics),
      );
      console.log(`[Migration] Migrated ${analytics.length} analytics records`);
    }
  } catch (error) {
    console.error("[Migration] Error migrating analytics:", error);
  }
}

/**
 * Migrates filter preferences.
 * Converts class filter values.
 */
function migrateFilters() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FILTERS);
    if (!data) return;

    const filters = JSON.parse(data);
    let migrated = false;

    const migratedFilters = { ...filters };

    // Migrate class filter
    if (filters.class) {
      const oldClass = filters.class;
      const newClass = migrateClassIdentifier(oldClass);
      if (oldClass !== newClass) {
        migratedFilters.class = newClass;
        migrated = true;
      }
    }

    // Migrate classLevel filter
    if (filters.classLevel) {
      const oldLevel = filters.classLevel;
      const newLevel = migrateClassLevel(oldLevel);
      if (oldLevel !== newLevel) {
        migratedFilters.classLevel = newLevel;
        migrated = true;
      }
    }

    // Migrate selectedClasses array
    if (filters.selectedClasses && Array.isArray(filters.selectedClasses)) {
      const oldClasses = filters.selectedClasses;
      const newClasses = oldClasses.map(migrateClassIdentifier);
      if (JSON.stringify(oldClasses) !== JSON.stringify(newClasses)) {
        migratedFilters.selectedClasses = newClasses;
        migrated = true;
      }
    }

    if (migrated) {
      localStorage.setItem(
        STORAGE_KEYS.FILTERS,
        JSON.stringify(migratedFilters),
      );
      console.log(`[Migration] Migrated filter preferences`);
    }
  } catch (error) {
    console.error("[Migration] Error migrating filters:", error);
  }
}

/**
 * Migrates fee structures data.
 * Deep migrates all string values to replace XI/XII.
 */
function migrateFeeStructures() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FEE_STRUCTURES);
    if (!data) return;

    const feeStructures = JSON.parse(data);
    const migratedFeeStructures = feeStructures.map(deepMigrateValue);

    // Check if anything changed by comparing stringified versions
    const hasChanges =
      JSON.stringify(feeStructures) !== JSON.stringify(migratedFeeStructures);

    if (hasChanges) {
      localStorage.setItem(
        STORAGE_KEYS.FEE_STRUCTURES,
        JSON.stringify(migratedFeeStructures),
      );
      console.log(
        `[Migration] Migrated ${feeStructures.length} fee structures`,
      );
    }
  } catch (error) {
    console.error("[Migration] Error migrating fee structures:", error);
  }
}

/**
 * Migrates teacher subject assignments.
 * Converts classId references.
 */
function migrateTeacherSubjectAssignments() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TEACHER_SUBJECT_ASSIGNMENTS);
    if (!data) return;

    const assignments = JSON.parse(data);
    let migrated = false;

    const migratedAssignments = assignments.map((assignment) => {
      let updated = { ...assignment };

      // Migrate classId
      if (assignment.classId) {
        const oldClassId = assignment.classId;
        const newClassId = migrateClassIdentifier(oldClassId);
        if (oldClassId !== newClassId) {
          updated.classId = newClassId;
          migrated = true;
        }
      }

      return updated;
    });

    if (migrated) {
      localStorage.setItem(
        STORAGE_KEYS.TEACHER_SUBJECT_ASSIGNMENTS,
        JSON.stringify(migratedAssignments),
      );
      console.log(
        `[Migration] Migrated ${assignments.length} teacher subject assignments`,
      );
    }
  } catch (error) {
    console.error(
      "[Migration] Error migrating teacher subject assignments:",
      error,
    );
  }
}

// ============================================================================
// MAIN MIGRATION FUNCTION
// ============================================================================

/**
 * Runs the complete class naming migration.
 * This function is idempotent and safe to run multiple times.
 * It only modifies data that needs conversion.
 */
export function runClassNamingMigration() {
  // Force re-run if legacy data detected, regardless of version
  const hasLegacyData = checkForLegacyData();

  if (!needsMigration() && !hasLegacyData) {
    console.log("[Migration] Class naming migration already complete");
    return;
  }

  // Clear version to force re-run if legacy data exists
  if (hasLegacyData) {
    console.log("[Migration] Legacy data detected, forcing re-run");
    localStorage.removeItem(MIGRATION_VERSION_KEY);
  }

  console.log("[Migration] Starting class naming migration...");

  // Run all migrations in order
  migrateClasses();
  migrateStudents();
  migrateExams();
  migrateExamPapers();
  migrateNotices();
  migrateAttendance();
  migrateResults();
  migrateAnalytics();
  migrateFilters();
  migrateFeeStructures();
  migrateTeacherSubjectAssignments();

  // Mark migration as complete
  markMigrationComplete();

  console.log("[Migration] Class naming migration complete");
}

/**
 * Forces migration to run even if already marked complete.
 * Use this for testing or if migration needs to be re-run.
 */
export function forceMigration() {
  localStorage.removeItem(MIGRATION_VERSION_KEY);
  runClassNamingMigration();
}
