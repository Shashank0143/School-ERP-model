/**
 * Teacher Subject Assignments — Relational Seed Generator
 *
 * Derives a pure relational dataset: { teacherId, classId, subjectId }
 * from the generated teacher array. This is the single source of truth
 * for who teaches what and where.
 *
 * Activity subjects (Art, Music, PE, Library) are excluded from
 * class teacher eligibility but are still included in assignments.
 */

const ACTIVITY_SUBJECT_IDS = new Set([
  "act-art",
  "act-music",
  "act-games",
  "act-library",
  "sub-pe",
]);

// Helper to determine the level string from classId
const getLevelFromClassId = (classId) => {
  const match = classId.match(/^class-(nursery|lkg|ukg|\d+)[a-d]$/i);
  if (match) {
    let level = match[1];
    // Capitalize properly to match subjects.js applicableClasses
    if (level.toLowerCase() === "nursery") return "Nursery";
    if (level.toLowerCase() === "lkg") return "LKG";
    if (level.toLowerCase() === "ukg") return "UKG";
    return level;
  }
  return null;
};

// 1. Generate Class Subject Requirements conceptually
export const generateClassSubjectRequirements = (classes, subjects) => {
  const requirements = [];

  for (const cls of classes) {
    const level = getLevelFromClassId(cls.classId);
    const requiredSubjectIds = [];

    for (const sub of subjects) {
      const appliesToLevel =
        sub.applicableClasses && sub.applicableClasses.includes(level);
      // If streamApplicability is empty or undefined, it applies to all streams in that level.
      // If it has entries, it must match the class streamId.
      const streamApplies =
        !sub.streamApplicability || sub.streamApplicability.length === 0;
      const appliesToStream =
        streamApplies ||
        (cls.streamId && sub.streamApplicability.includes(cls.streamId));

      if (appliesToLevel && appliesToStream) {
        requiredSubjectIds.push(sub.subjectId);
      }
    }

    // Foundation classes need 'multi-subject'
    if (
      cls.isFoundationClass &&
      !requiredSubjectIds.includes("multi-subject")
    ) {
      requiredSubjectIds.push("multi-subject");
    }

    requirements.push({
      classId: cls.classId,
      requiredSubjects: requiredSubjectIds,
    });
  }
  return requirements;
};

// Heuristic intensity catalogs
const SUBJECT_INTENSITY = {
  // Advanced Labs / Heavy Subjects
  "sub-phy": 3.5,
  "sub-chem": 3.5,
  "sub-bio": 3.5,
  "sub-math": 3.5,
  "sub-acc": 3.5,
  "sub-bst": 3.5,
  "sub-eco": 3.5,
  "sub-his": 3.5,
  "sub-pol": 3.5,
  "sub-geo": 3.5,

  // Core General Academics
  "sub-eng": 2.5,
  "sub-hin": 2.5,
  "sub-sst": 2.5,
  "sub-sanskrit": 2.5,
  "sub-sans-sec": 2.5,
  "sub-comp-primary": 2.5,
  "sub-gk": 2.5,
  "sub-evs": 2.5,

  // Activities & Optionals
  "sub-pe": 1.0,
  "sub-cs": 1.0,
  "sub-ip": 1.0,
  "sub-hs": 1.0,
  "act-art": 1.0,
  "act-music": 1.0,
  "act-games": 1.0,
  "act-library": 1.0,
  "act-activity": 1.0,
};

const GRADE_INTENSITY = {
  12: 2.0,
  11: 2.0, // Senior Secondary
  10: 1.5,
  9: 1.5, // Secondary
  8: 1.0,
  7: 1.0,
  6: 1.0,
  5: 1.0, // Middle School
};

// 2. Deterministic Workload-Aware Allocations
export const generateTeacherSubjectAssignments = (
  classes,
  teachers,
  subjects,
) => {
  const requirements = generateClassSubjectRequirements(classes, subjects);
  const assignments = [];

  // Sort teachers by ID to ensure deterministic sorting & selection
  const sortedTeachers = [...teachers].sort((a, b) => a.id.localeCompare(b.id));

  // Build a pool of teachers by subject specialization
  const teacherPool = {};
  for (const t of sortedTeachers) {
    const sub =
      t.specializationSubjectId ||
      t.subjectId ||
      (t.metadata && t.metadata.subjectId) ||
      "multi-subject";
    if (!teacherPool[sub]) teacherPool[sub] = [];
    teacherPool[sub].push(t);
  }

  // Initialize dynamic workload tracking state for each teacher
  const teacherStates = {};
  for (const t of sortedTeachers) {
    teacherStates[t.id] = {
      teacher: t,
      assignedClasses: new Set(),
      assignedSubjects: new Set(),
      assignedSections: new Set(),
      workloadUnits: 0,
    };
  }

  // To do round-robin for foundation teachers, we keep an index for multi-subject
  const foundationIndex = {
    index: 0,
  };

  const classMap = new Map(classes.map((c) => [c.classId, c]));

  for (const req of requirements) {
    const cls = classMap.get(req.classId);
    if (!cls) continue;

    const level = getLevelFromClassId(req.classId);

    if (cls.isFoundationClass) {
      // For foundation classes (Nursery-4): identify the section's primary foundation teacher
      // and assign ALL required subjects to that same teacher, bypassing specialization matching.
      const foundationPool = teacherPool["multi-subject"];
      if (foundationPool && foundationPool.length > 0) {
        const primaryTeacher = foundationPool[foundationIndex.index];
        foundationIndex.index =
          (foundationIndex.index + 1) % foundationPool.length;

        // Calculate and add workload to the foundation teacher
        const subIntensity = SUBJECT_INTENSITY["multi-subject"] || 1.5;
        const grIntensity = 0.8; // default grade intensity for foundation classes
        const assignmentWeight = subIntensity * grIntensity;

        const state = teacherStates[primaryTeacher.id];
        state.assignedClasses.add(req.classId);
        state.assignedSubjects.add("multi-subject");
        state.assignedSections.add(cls.section);
        state.workloadUnits += assignmentWeight * req.requiredSubjects.length; // all subjects assigned

        for (const subjectId of req.requiredSubjects) {
          assignments.push({
            id: `assign-${req.classId}-${subjectId}`,
            teacherId: primaryTeacher.id,
            classId: req.classId,
            subjectId: subjectId,
          });
        }
      } else {
        console.warn(
          `[Seed Warning] No foundation teacher found for class: ${req.classId}`,
        );
      }
    } else {
      // Specialized Classes (Class 5-12)
      for (const subjectId of req.requiredSubjects) {
        const pool = teacherPool[subjectId];
        if (pool && pool.length > 0) {
          // Calculate assignment intensity weight
          const subIntensity = SUBJECT_INTENSITY[subjectId] || 1.0;
          const grIntensity = GRADE_INTENSITY[level] || 1.0;
          const assignmentWeight = subIntensity * grIntensity;

          // Select the teacher with the lowest prospective workload score
          let bestTeacher = null;
          let minScore = Infinity;

          for (const teacher of pool) {
            const state = teacherStates[teacher.id];

            // Dynamic Scoring Heuristic
            let score = state.workloadUnits;

            // Section letter alignment affinity bonus (preferring same section letter verticals like "A", "B", etc.)
            if (state.assignedSections.has(cls.section)) {
              score -= 0.5;
            }

            // Since sorting of pool is deterministic, we select the first one with the lowest score.
            // This acts as a deterministic tie-breaker (lexicographical by teacher ID).
            if (score < minScore) {
              minScore = score;
              bestTeacher = teacher;
            }
          }

          if (bestTeacher) {
            // Update state
            const state = teacherStates[bestTeacher.id];
            state.assignedClasses.add(req.classId);
            state.assignedSubjects.add(subjectId);
            state.assignedSections.add(cls.section);
            state.workloadUnits += assignmentWeight;

            assignments.push({
              id: `assign-${req.classId}-${subjectId}`,
              teacherId: bestTeacher.id,
              classId: req.classId,
              subjectId: subjectId,
            });
          }
        } else {
          // Console warning if no teacher is available for a required subject
          console.warn(
            `[Seed Warning] No teacher found for required subject: ${subjectId} in class: ${req.classId}`,
          );
        }
      }
    }
  }

  return assignments;
};

// 3. Derive Teacher Workload Projections
// This modifies the given teachers array IN-MEMORY.
// We must ensure these are NOT persisted back to localStorage.
export const deriveTeacherWorkload = (teachers, assignments) => {
  const workloadMap = {};

  for (const assignment of assignments) {
    if (!workloadMap[assignment.teacherId]) {
      workloadMap[assignment.teacherId] = {
        classes: new Set(),
        sections: new Set(),
        levels: new Set(),
      };
    }
    const classId = assignment.classId;
    const level = getLevelFromClassId(classId);
    const section = classId.slice(-1).toUpperCase();

    workloadMap[assignment.teacherId].classes.add(classId);
    workloadMap[assignment.teacherId].sections.add(section);
    if (level) workloadMap[assignment.teacherId].levels.add(level);
  }

  for (const t of teachers) {
    const w = workloadMap[t.id];
    if (w) {
      t.assignedClasses = Array.from(w.classes);
      t.assignedClassIds = t.assignedClasses;
      t.assignedSections = Array.from(w.sections);
      t.assignedLevels = Array.from(w.levels);
      if (!t.metadata) t.metadata = {};
      t.metadata.assignedClasses = t.assignedClasses;
      t.metadata.assignedClassIds = t.assignedClassIds;
    } else {
      t.assignedClasses = [];
      t.assignedClassIds = [];
      t.assignedSections = [];
      t.assignedLevels = [];
      if (!t.metadata) t.metadata = {};
      t.metadata.assignedClasses = [];
      t.metadata.assignedClassIds = [];
    }
  }
};

// 4. Derive Class Teacher Map
export const CLASS_TEACHER_PRIORITY = [
  "multi-subject", // Foundation homeroom teacher
  "sub-eng", // English
  "sub-math", // Mathematics
  "sub-sci", // Science
  "sub-sst", // Social Studies
  "sub-hin", // Hindi
  "sub-phy", // Physics
  "sub-chem", // Chemistry
  "sub-acc", // Accountancy
  "sub-his", // History
  "sub-bio", // Biology
  "sub-bst", // Business Studies
  "sub-eco", // Economics
  "sub-pol", // Political Science
  "sub-geo", // Geography
  "sub-sanskrit", // Sanskrit
  "sub-cs", // Computer Science
];

export const deriveClassTeacherMap = (assignments) => {
  const byClass = new Map();

  for (const { teacherId, classId, subjectId } of assignments) {
    if (ACTIVITY_SUBJECT_IDS.has(subjectId)) continue;
    if (!byClass.has(classId)) byClass.set(classId, []);
    byClass.get(classId).push({ teacherId, subjectId });
  }

  const classTeacherMap = new Map();
  const usedTeachers = new Set(); // Uniqueness constraint: one CT per teacher

  for (const [classId, candidates] of byClass) {
    let chosen = null;

    // Priority pass: prefer higher-priority subject, skip already-used teachers
    for (const prioritySubject of CLASS_TEACHER_PRIORITY) {
      const match = candidates.find(
        (c) =>
          c.subjectId === prioritySubject && !usedTeachers.has(c.teacherId),
      );
      if (match) {
        chosen = match.teacherId;
        break;
      }
    }

    // Fallback: any non-activity candidate not already used as CT
    if (!chosen) {
      const fallback = candidates.find((c) => !usedTeachers.has(c.teacherId));
      if (fallback) chosen = fallback.teacherId;
    }

    // Final fallback: allow sharing only if absolutely no unique candidate exists
    if (!chosen && candidates.length > 0) {
      chosen = candidates[0].teacherId;
    }

    if (chosen) {
      classTeacherMap.set(classId, chosen);
      usedTeachers.add(chosen);
    }
  }

  return classTeacherMap;
};
