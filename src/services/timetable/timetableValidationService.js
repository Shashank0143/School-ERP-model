import { getStageFromClassId } from "../../data/academicStages";

/**
 * Validates timetables for institutional constraints.
 * Does not mutate data, only returns structured error reports.
 */
export const validateTimetables = (
  timetables,
  classes,
  teachers,
  subjects,
  assignments,
  rooms = [],
  options = { classIdToValidate: null, enforceCompleteness: true }
) => {
  const errors = [];
  const DAY_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday"];
  const MANDATORY_PERIODS = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8"];

  const classMap = new Map(classes.map((c) => [c.id, c]));
  const teacherMap = new Map(teachers.map((t) => [t.id, t]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const roomMap = new Map(rooms.map((r) => [r.roomNumber, r])); // Timetable uses roomNumber string mostly

  // Track for Teacher & Room conflicts across all timetables
  // Map key: `${day}-${periodNumber}`
  // Map value: { teacherBookings: { teacherId: classId }, roomBookings: { roomName: classId } }
  const globalBookings = new Map();

  timetables.forEach((timetable) => {
    const classId = timetable.classId;
    const currentClass = classMap.get(classId);
    if (!currentClass) return;

    // Fast lookup for canonical assignments for this class
    const classAssignments = assignments.filter((a) => a.classId === classId);
    const assignedSubjectIds = new Set(classAssignments.map((a) => a.subjectId));

    DAY_ORDER.forEach((day) => {
      const daySchedule = timetable.weeklySchedule?.[day] || [];
      const scheduledPeriods = new Set();

      daySchedule.forEach((slot) => {
        const { periodNumber, subjectId, teacherId, roomId } = slot;
        scheduledPeriods.add(periodNumber);

        // Map `roomId` attribute back to standard nomenclature. Note that `roomId` in the payload is actually the roomName string like "Physics Lab 1" currently.
        const actualRoomName = roomId;
        const roomObj = actualRoomName ? roomMap.get(actualRoomName) : null;
        
        // Treat as shared facility if it's explicitly typed as non-classroom, or by fuzzy matching standard shared names if no room object matches.
        const isSharedFacility = roomObj 
          ? roomObj.roomType !== "classroom"
          : actualRoomName && /(lab|ground|music|art|library|audio)/i.test(actualRoomName);

        // --- Rule 1: Teacher Conflict ---
        // --- Rule 5: Room Conflict (Shared Facilities ONLY) ---
        if (teacherId || (actualRoomName && isSharedFacility)) {
          const timeKey = `${day}-${periodNumber}`;
          if (!globalBookings.has(timeKey)) {
            globalBookings.set(timeKey, { teacherBookings: {}, roomBookings: {} });
          }
          const bookings = globalBookings.get(timeKey);

          // Check Teacher Booking
          if (teacherId) {
            if (bookings.teacherBookings[teacherId] && bookings.teacherBookings[teacherId] !== classId) {
              const conflictClassId = bookings.teacherBookings[teacherId];
              // Only report error if we are validating the current class or global
              if (!options.classIdToValidate || options.classIdToValidate === classId) {
                errors.push({
                  type: "TEACHER_CONFLICT",
                  severity: "error",
                  classId,
                  teacherId,
                  day,
                  period: periodNumber,
                  message: `Teacher ${teacherMap.get(teacherId)?.name || teacherId} is double-booked in ${classMap.get(conflictClassId)?.name || conflictClassId} and ${currentClass.name}.`
                });
              }
            } else {
              bookings.teacherBookings[teacherId] = classId;
            }
          }

          // Check Room Booking (ONLY for Shared Facilities)
          if (actualRoomName && isSharedFacility && actualRoomName !== "TBA") {
            if (bookings.roomBookings[actualRoomName] && bookings.roomBookings[actualRoomName] !== classId) {
              const conflictClassId = bookings.roomBookings[actualRoomName];
              // Only report error if we are validating the current class or global
              if (!options.classIdToValidate || options.classIdToValidate === classId) {
                errors.push({
                  type: "ROOM_CONFLICT",
                  severity: "error",
                  classId,
                  roomId: actualRoomName,
                  day,
                  period: periodNumber,
                  message: `Shared Facility ${actualRoomName} is double-booked for ${classMap.get(conflictClassId)?.name || conflictClassId} and ${currentClass.name}.`
                });
              }
            } else {
              bookings.roomBookings[actualRoomName] = classId;
            }
          }
        }

        // If we are scoping validation, skip other class-specific rules for non-target classes
        if (options.classIdToValidate && options.classIdToValidate !== classId) return;

        if (!teacherId || !subjectId) return; // Skip further checks if empty, handled by Rule 6 (completeness)

        // --- Rule 2: Subject-Class Allocation ---
        if (subjectId !== "sub-homeroom" && !assignedSubjectIds.has(subjectId)) {
          errors.push({
            type: "INVALID_SUBJECT_ALLOCATION",
            severity: "error",
            classId,
            teacherId,
            day,
            period: periodNumber,
            message: `Subject ${subjectMap.get(subjectId)?.name || subjectId} is not officially assigned to ${currentClass.name}.`
          });
        }

        // --- Rule 3: Teacher Qualification ---
        const teacher = teacherMap.get(teacherId);
        if (teacher) {
          const classStage = getStageFromClassId(classId);
          // Teacher's eligible stages might be on `teacher.eligibleStages` depending on expandedTeachers generator
          // Fallback to primary if not populated, though it should be.
          const eligibleStages = teacher.eligibleStages || [];
          if (eligibleStages.length > 0 && !eligibleStages.includes(classStage)) {
            errors.push({
              type: "TEACHER_QUALIFICATION_MISMATCH",
              severity: "error",
              classId,
              teacherId,
              day,
              period: periodNumber,
              message: `Teacher ${teacher.name} is not qualified to teach at the ${classStage} stage.`
            });
          }
        }

        // --- Rule 4: Locked Class Teacher ---
        if (periodNumber === "P1") {
          const ctId = currentClass.classTeacherId;
          if (ctId && teacherId !== ctId) {
            errors.push({
              type: "CLASS_TEACHER_MISMATCH",
              severity: "error",
              classId,
              teacherId,
              day,
              period: periodNumber,
              message: `Period 1 must be taken by the Class Teacher (${teacherMap.get(ctId)?.name || ctId}).`
            });
          }
        }
      });

      // If we are scoping validation, skip completeness rule for non-target classes
      if (options.classIdToValidate && options.classIdToValidate !== classId) return;

      // --- Rule 6: Completeness ---
      if (options.enforceCompleteness !== false) {
        MANDATORY_PERIODS.forEach((p) => {
          if (!scheduledPeriods.has(p)) {
            errors.push({
              type: "INCOMPLETE_TIMETABLE",
              severity: "error",
              classId,
              day,
              period: p,
              message: `Missing mandatory period ${p} for ${currentClass.name} on ${day}.`
            });
          }
        });
      }
    });
  });

  return errors;
};

export const timetableValidationService = {
  validateTimetables
};
