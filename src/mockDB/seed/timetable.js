/**
 * Timetable Seed Data Engine
 *
 * Generates the canonical timetables collection.
 * Auto-injects the Class Teacher's primary subject into P1 for Mon-Fri.
 */

import { CLASS_TEACHER_PRIORITY } from "./teacherSubjectAssignments";

const periodTimes = {
  P1: { startTime: "08:00", endTime: "08:50" },
  P2: { startTime: "08:50", endTime: "09:40" },
  P3: { startTime: "09:40", endTime: "10:30" },
  P4: { startTime: "10:30", endTime: "11:20" },
  // Lunch Break: 11:20 AM - 11:50 AM
  P5: { startTime: "11:50", endTime: "12:40" },
  P6: { startTime: "12:40", endTime: "13:30" },
  P7: { startTime: "13:30", endTime: "14:20" },
  P8: { startTime: "14:20", endTime: "15:10" },
};

/**
 * Identify the primary subject for a class teacher.
 */
const getPrimarySubjectForTeacher = (teacherId, classId, teacherSubjectAssignments) => {
  const teacherAssignments = teacherSubjectAssignments.filter(
    (a) => a.teacherId === teacherId && a.classId === classId
  );
  
  if (teacherAssignments.length === 0) return null;
  if (teacherAssignments.length === 1) return teacherAssignments[0];

  let bestMatch = teacherAssignments[0];
  let bestScore = Infinity;

  for (const assignment of teacherAssignments) {
    const score = CLASS_TEACHER_PRIORITY.indexOf(assignment.subjectId);
    if (score !== -1 && score < bestScore) {
      bestScore = score;
      bestMatch = assignment;
    }
  }

  return bestMatch;
};

/**
 * Builds canonical timetables for all classes dynamically.
 * Injects P1 automatically with the class teacher.
 */
export const buildCanonicalTimetables = (classes, teacherSubjectAssignments, teachers = []) => {
  const timetables = [];
  const now = new Date().toISOString();
  const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday"];

  classes.forEach((cls) => {
    const classId = cls.id || cls.classId;
    const timetable = {
      id: `tt-${classId}`,
      schemaVersion: 1,
      classId: classId,
      academicYear: "2026-2027",
      status: "draft",
      weeklySchedule: {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: []
      },
      publishedAt: null,
      publishedBy: null,
      updatedAt: now,
      updatedBy: "system"
    };

    // Auto-inject P1 for the class teacher across all weekdays
    const classTeacherId = cls.classTeacherId;
    let primarySubjectId = null;
    if (classTeacherId) {
      const ctObj = teachers.find((t) => t.id === classTeacherId);
      if (ctObj && ctObj.primarySubjectId) {
        primarySubjectId = ctObj.primarySubjectId;
      } else {
        const p1Assignment = getPrimarySubjectForTeacher(classTeacherId, classId, teacherSubjectAssignments);
        if (p1Assignment) {
          primarySubjectId = p1Assignment.subjectId;
        }
      }
    }

    if (classTeacherId) {
      weekdays.forEach((dayKey) => {
        timetable.weeklySchedule[dayKey].push({
          periodNumber: "P1",
          subjectId: primarySubjectId || "sub-homeroom",
          teacherId: classTeacherId,
          startTime: periodTimes.P1.startTime,
          endTime: periodTimes.P1.endTime,
          isLocked: true // P1 is structurally locked for CT
        });
      });
    }

    timetables.push(timetable);
  });

  return timetables;
};
