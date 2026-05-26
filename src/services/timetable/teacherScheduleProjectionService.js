import { getDataProvider } from "../../data";

// In-memory cache for the projection
let projectionCache = null;

/**
 * Rebuilds the teacher schedule projection from all published timetables.
 * This should be called whenever a timetable is published/updated.
 */
export const rebuildTeacherScheduleProjection = async () => {
  const provider = getDataProvider();
  const timetables = await provider.getTimetables();
  const subjects = await provider.getSubjects();
  const classes = await provider.getClasses();
  
  const subjectsMap = new Map(subjects.map(s => [s.id, s]));
  const classMap = new Map(classes.map(c => [c.id, c]));

  // { teacherId: { monday: [], tuesday: [], ... } }
  const newProjection = {}; 
  
  const getTeacherContainer = (teacherId) => {
    if (!newProjection[teacherId]) {
      newProjection[teacherId] = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      };
    }
    return newProjection[teacherId];
  };

  const DAY_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday"];

  timetables.forEach(timetable => {
    if (timetable.status !== "published") return; 
    if (!timetable.weeklySchedule) return;

    const currentClass = classMap.get(timetable.classId);

    DAY_ORDER.forEach(day => {
      const daySchedule = timetable.weeklySchedule[day] || [];
      daySchedule.forEach(slot => {
        let activeTeacherId = slot.teacherId;

        // Auto-inject Class Teacher for P1 if not already assigned
        if (slot.periodNumber === "P1" && currentClass && currentClass.classTeacherId) {
           // We derive it dynamically if it's the homeroom period
           activeTeacherId = currentClass.classTeacherId;
        }
        
        if (!activeTeacherId) return;

        const subject = subjectsMap.get(slot.subjectId);
        
        let teacherType = "subject_teacher";
        if (slot.periodNumber === "P1") {
          teacherType = "class_teacher";
        } else if (subject && subject.type === "extracurricular") {
          teacherType = "activity_teacher";
        }

        const container = getTeacherContainer(activeTeacherId);
        container[day].push({
          classId: timetable.classId,
          subjectId: slot.subjectId,
          periodNumber: slot.periodNumber,
          startTime: slot.startTime,
          endTime: slot.endTime,
          teacherType: teacherType,
          room: slot.roomId || currentClass?.roomNumber || currentClass?.fixedRoomId || "TBA"
        });
      });
    });
  });

  projectionCache = newProjection;
  return projectionCache;
};

/**
 * Gets the projection cache, rebuilding it if it doesn't exist yet.
 */
export const getProjection = async () => {
  if (!projectionCache) {
    await rebuildTeacherScheduleProjection();
  }
  return projectionCache;
};

/**
 * Clears the cache to force a rebuild on next request
 */
export const invalidateProjection = () => {
  projectionCache = null;
};

export const teacherScheduleProjectionService = {
  rebuildTeacherScheduleProjection,
  getProjection,
  invalidateProjection
};
