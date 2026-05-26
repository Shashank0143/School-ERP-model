/**
 * initialization/migrationManager.js
 * Manages database schema migrations and layout updates to support
 * evolution without disrupting active runtime session properties.
 */

import { STORAGE_KEYS } from "../persistence/storageKeys";
import { getItem, setItem } from "../persistence/storage";
import { runClassNamingMigration } from "../utils/classNamingMigration";
import { validateClassIdentityIntegrity } from "../utils/classIdentity";
import {
  validateCrossPortalWorkflows,
  printValidationReport,
} from "../utils/crossPortalWorkflowValidation";

const CURRENT_SCHEMA_VERSIONS = {
  STUDENTS: "v5",
  TEACHERS: "v2",
  CLASSES: "v2",
  RESULTS: "v2",
  ASSIGNMENTS: "v1",
  SUBMISSIONS: "v1",
};

const FOUNDATION_LEVELS = ["Nursery", "LKG", "UKG", "1", "2", "3", "4"];
const ACTIVITY_SUBJECT_IDS = [
  "act-art",
  "act-music",
  "act-games",
  "act-library",
  "sub-pe",
];

export const migrationManager = {
  /**
   * Executes checking and application of layout migrations.
   */
  runMigrations: () => {
    console.log("[InitializationEngine] Performing schema evolution check...");

    // 1. Students Schema Migration
    const studentVer = getItem(STORAGE_KEYS.STUDENTS_SCHEMA_VERSION);
    if (studentVer !== CURRENT_SCHEMA_VERSIONS.STUDENTS) {
      console.info(
        `[InitializationEngine] Migrating students schema: "${studentVer || "v0"}" -> "${CURRENT_SCHEMA_VERSIONS.STUDENTS}"`,
      );

      const students = getItem(STORAGE_KEYS.STUDENTS) || [];
      const updatedStudents = students.map((s) => {
        // Enforce ADM2026XXX admissionNo format
        let admissionNo = s.admissionNo || "";
        if (!admissionNo.startsWith("ADM2026")) {
          const numericPart = s.id?.match(/\d+/) ||
            s.admissionNo?.match(/\d+/) || [Math.floor(Math.random() * 1000)];
          const paddedNum = String(numericPart[0]).padStart(3, "0");
          admissionNo = `ADM2026${paddedNum}`;
        }

        // Reconstruct default parent/guardian/emergency contacts and sibling metadata if missing
        const parentLinkage = s.parentLinkage || {
          parentId: s.parentIds?.[0] || "parent-001",
          fatherName: s.fatherName || "Rajesh Kumar",
          fatherPhone: s.fatherPhone || "+91 98765 88001",
          fatherOccupation: s.fatherOccupation || "Business Executive",
          motherName: s.motherName || "Kiran Kumar",
          motherPhone: s.motherPhone || "+91 98765 99001",
          motherOccupation: s.motherOccupation || "Home Maker",
        };

        const guardianLinkage = s.guardianLinkage || {
          name: parentLinkage.fatherName || "Rajesh Kumar",
          relation: "Father",
          phone: parentLinkage.fatherPhone || "+91 98765 88001",
        };

        const emergencyContacts = s.emergencyContacts || [
          {
            name: parentLinkage.motherName || "Kiran Kumar",
            relation: "Mother",
            phone: parentLinkage.motherPhone || "+91 98765 99001",
          },
        ];

        const siblingMetadata = s.siblingMetadata || [];

        return {
          ...s,
          studentId: s.studentId || s.id,
          admissionNo,
          parentLinkage,
          guardianLinkage,
          emergencyContacts,
          siblingMetadata,
        };
      });

      setItem(STORAGE_KEYS.STUDENTS, updatedStudents);
      setItem(
        STORAGE_KEYS.STUDENTS_SCHEMA_VERSION,
        CURRENT_SCHEMA_VERSIONS.STUDENTS,
      );
    }

    // 2. Teachers Schema Migration — backfill teacherType
    const teacherVer = getItem("erp_teachers_schema_version");
    if (teacherVer !== CURRENT_SCHEMA_VERSIONS.TEACHERS) {
      console.info(
        `[InitializationEngine] Migrating teachers schema: "${teacherVer || "v0"}" -> "${CURRENT_SCHEMA_VERSIONS.TEACHERS}"`,
      );

      const teachers = getItem(STORAGE_KEYS.TEACHERS) || [];
      const updatedTeachers = teachers.map((t) => {
        if (t.teacherType) return t; // Already stamped — skip

        // Infer from specialization subject
        let teacherType;
        const subId = t.specializationSubjectId || t.subjectId || "";
        if (ACTIVITY_SUBJECT_IDS.includes(subId)) {
          teacherType = "ACTIVITY";
        } else if (subId === "multi-subject") {
          teacherType = "FOUNDATION";
        } else {
          // Infer from assigned levels if available
          const levels = t.assignedLevels || [];
          const hasFoundationOnly =
            levels.length > 0 &&
            levels.every((l) => FOUNDATION_LEVELS.includes(l));
          const homeroom = t.homeroom || "";
          // If homeroom is a foundation class ID, it's a foundation teacher
          const homeroomLevel = homeroom.replace("class-", "").slice(0, -1);
          const isFoundationHomeroom =
            FOUNDATION_LEVELS.includes(homeroomLevel) ||
            FOUNDATION_LEVELS.some((fl) => homeroom.includes(fl.toLowerCase()));
          teacherType =
            hasFoundationOnly || isFoundationHomeroom
              ? "FOUNDATION"
              : "SPECIALIZED";
        }

        return { ...t, teacherType };
      });

      setItem(STORAGE_KEYS.TEACHERS, updatedTeachers);
      setItem("erp_teachers_schema_version", CURRENT_SCHEMA_VERSIONS.TEACHERS);
    }

    // 3. Classes Schema Migration — backfill isFoundationClass flag
    const classesVer = getItem("erp_classes_schema_version");
    if (classesVer !== CURRENT_SCHEMA_VERSIONS.CLASSES) {
      console.info(
        `[InitializationEngine] Migrating classes schema: "${classesVer || "v0"}" -> "${CURRENT_SCHEMA_VERSIONS.CLASSES}"`,
      );

      const classes = getItem(STORAGE_KEYS.CLASSES) || [];
      const updatedClasses = classes.map((c) => {
        if (c.isFoundationClass !== undefined) return c; // Already stamped

        // Derive from classId: "class-nurseryA" → "nursery" → "Nursery"
        const rawLevel = (c.id || "").replace("class-", "").slice(0, -1);
        const namedMap = { nursery: "Nursery", lkg: "LKG", ukg: "UKG" };
        const level = namedMap[rawLevel.toLowerCase()] || rawLevel;
        const isFoundationClass = FOUNDATION_LEVELS.includes(level);

        return { ...c, isFoundationClass };
      });

      setItem(STORAGE_KEYS.CLASSES, updatedClasses);
      setItem("erp_classes_schema_version", CURRENT_SCHEMA_VERSIONS.CLASSES);
    }

    // 4. Results Schema Version Stamp
    const resultsVer = getItem("erp_results_schema_version");
    if (resultsVer !== CURRENT_SCHEMA_VERSIONS.RESULTS) {
      setItem("erp_results_schema_version", CURRENT_SCHEMA_VERSIONS.RESULTS);
    }

    // 5. Assignments Schema Version Stamp
    const asgnVer = getItem("erp_assignments_schema_version");
    if (asgnVer !== CURRENT_SCHEMA_VERSIONS.ASSIGNMENTS) {
      setItem(
        "erp_assignments_schema_version",
        CURRENT_SCHEMA_VERSIONS.ASSIGNMENTS,
      );
    }

    // 6. Submissions Schema Version Stamp
    const subVer = getItem("erp_submissions_schema_version");
    if (subVer !== CURRENT_SCHEMA_VERSIONS.SUBMISSIONS) {
      setItem(
        "erp_submissions_schema_version",
        CURRENT_SCHEMA_VERSIONS.SUBMISSIONS,
      );
    }

    // 7. Class Naming Migration (XI/XII → 11/12)
    // This migration handles legacy class naming in persisted data
    runClassNamingMigration();

    // 8. Class Identity Integrity Validation
    // Validates that no legacy naming remains after migration
    const integrityCheck = validateClassIdentityIntegrity();
    if (!integrityCheck.valid) {
      console.error(
        "[InitializationEngine] Class identity integrity check failed:",
        integrityCheck.errors,
      );
      // Don't block startup, but log the errors for debugging
    }

    // 9. Cross-Portal Workflow Validation
    // Validates entire ERP ecosystem after normalization
    const workflowCheck = validateCrossPortalWorkflows();
    if (!workflowCheck.valid) {
      console.error(
        "[InitializationEngine] Cross-portal workflow validation failed:",
        workflowCheck.errors,
      );
      // Print detailed report for debugging
      printValidationReport(workflowCheck);
      // Don't block startup, but log the errors for debugging
    } else {
      console.log(
        "[InitializationEngine] Cross-portal workflow validation passed:",
        workflowCheck.summary,
      );
    }

    console.log("[InitializationEngine] All schema versions are up to date.");
  },
};

export default migrationManager;
