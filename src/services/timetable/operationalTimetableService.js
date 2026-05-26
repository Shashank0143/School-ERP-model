/**
 * services/timetable/operationalTimetableService.js
 *
 * Implements pure runtime scheduling projection.
 * Merges the recurring Master Timetable with auditable Operational Overrides.
 * Never mutates canonical database collections.
 */

import { getDataProvider } from "../../data";
import { timetableOverrideService } from "./timetableOverrideService";
import { getTeacherSchedule } from "./teacherTimetableService";

/**
 * Returns the weekday string (e.g., "monday") for a given YYYY-MM-DD date.
 */
export const getWeekdayFromDate = (dateString) => {
  const date = new Date(dateString);
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return days[date.getDay()];
};

/**
 * Resolves the operational schedule for a specific class on a specific date.
 */
export const getOperationalScheduleForDate = async (classId, dateString) => {
  const provider = getDataProvider();
  
  // Resolve class details
  const classes = await provider.getClasses();
  const classObj = classes.find((c) => c.id === classId || c.classId === classId);
  const grade = classObj?.grade || classObj?.level || "";
  
  // Fetch active overrides sorted by priority desc
  const activeOverrides = await timetableOverrideService.getActiveOverridesForClassAndDate(
    classId,
    dateString,
    grade
  );

  // Fetch Master Timetable
  const timetable = await provider.getTimetableByClass(classId);
  const weekday = getWeekdayFromDate(dateString);
  const baseSlots = timetable?.weeklySchedule?.[weekday] || [];

  // Deep clone slots to keep the operational projection pure
  let resolvedSlots = baseSlots.map((slot) => ({ ...slot }));

  let isHoliday = false;
  let holidayName = null;
  let isHalfDay = false;
  let maxPeriod = null;

  // Apply overrides in priority order
  for (const override of activeOverrides) {
    if (override.type === "holiday") {
      isHoliday = true;
      holidayName = override.payload?.name || "Holiday";
      resolvedSlots = []; // No school periods on a holiday
      break; // Holiday wipes everything out, no other overrides matter
    }

    if (override.type === "half_day") {
      isHalfDay = true;
      maxPeriod = override.payload?.maxPeriod || "P4";
      const maxNum = parseInt(maxPeriod.replace("P", ""), 10) || 4;
      resolvedSlots = resolvedSlots.filter((slot) => {
        const slotNum = parseInt(slot.periodNumber.replace("P", ""), 10);
        return slotNum <= maxNum;
      });
    }

    if (override.type === "teacher_substitution") {
      const { targetPeriod, substitutedTeacherId, originalTeacherId } = override.payload;
      resolvedSlots = resolvedSlots.map((slot) => {
        if (slot.periodNumber === targetPeriod) {
          // If original teacher matches or is unspecified, overlay substitution
          if (!originalTeacherId || slot.teacherId === originalTeacherId) {
            return {
              ...slot,
              isSubstituted: true,
              substituteTeacherId: substitutedTeacherId,
            };
          }
        }
        return slot;
      });
    }

    if (override.type === "exam_day" || override.type === "custom_override") {
      if (override.payload?.schedule) {
        resolvedSlots = override.payload.schedule.map((s) => ({ ...s }));
      }
    }
  }

  return {
    date: dateString,
    weekday,
    classId,
    className: classObj?.name || classId,
    isHoliday,
    holidayName,
    isHalfDay,
    maxPeriod,
    slots: resolvedSlots,
  };
};

export const operationalTimetableService = {
  getOperationalScheduleForDate,
  getWeekdayFromDate,
};
