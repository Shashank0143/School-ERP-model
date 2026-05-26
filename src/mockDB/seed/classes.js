/**
 * Classes Seed Data
 *
 * Defines school classes dynamically from Nursery to Class 12 (sections A, B, C, D)
 * with designated homeroom assignments and room allocations.
 *
 * Each class follows:
 * {
 *   classId,         // Normalized identifier (stable)
 *   className,       // Readable class-section name e.g. "XI-A"
 *   section,         // "A" | "B" | "C" | "D"
 *   roomNumber,      // Normalized room number e.g. "Room 301"
 *   classTeacherId,  // Homeroom class teacher
 *   streamId,        // Division stream (for 11 and 12)
 *   academicYear,    // "2026" (normalized academic timing)
 *   stage,           // Academic stage: foundation|primary|middle|secondary|senior_secondary
 *   id,              // Legacy alias (compat)
 *   name,            // Legacy alias (compat)
 *   room,            // Legacy alias (compat)
 *   stream,          // Legacy alias (compat)
 *   grade,           // Legacy alias (compat)
 *   displayName      // Legacy alias (compat)
 * }
 */

import { getStageFromLevel } from "../../data/academicStages.js";
import { formatClassLevel } from "../../utils/classIdentity.js";

/**
 * Foundation class levels (Nursery–Class 4).
 */
const FOUNDATION_LEVELS = ["Nursery", "LKG", "UKG", "1", "2", "3", "4"];

/**
 * Returns seed data for all classes (Nursery to Class 12, 4 sections each).
 *
 * @param {Map<string, string>} [classTeacherMap] - Pre-built classId → teacherId map
 *   from deriveClassTeacherMap(). When provided, classTeacherId is resolved relationally.
 *   When omitted, classTeacherId is null for all classes.
 */
export const getClassesSeed = (classTeacherMap = null) => {
  const classLevels = [
    "Nursery",
    "LKG",
    "UKG",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
  ];
  const sections = ["A", "B", "C", "D"];
  const streamsMap = {
    A: "SCIENCE_NON_MEDICAL",
    B: "SCIENCE_MEDICAL",
    C: "COMMERCE",
    D: "HUMANITIES",
  };
  const streamsNameMap = {
    A: "Science Non-Medical",
    B: "Science Medical",
    C: "Commerce",
    D: "Humanities",
  };

  const classes = [];
  classLevels.forEach((level) => {
    sections.forEach((sec) => {
      const isSenior = level === "11" || level === "12";
      const isFoundation = FOUNDATION_LEVELS.includes(level);
      const classId = `class-${level.toLowerCase()}${sec.toLowerCase()}`;
      const streamId = isSenior ? streamsMap[sec] : null;
      const streamName = isSenior ? streamsNameMap[sec] : null;

      // Resolve classTeacherId relationally from the pre-built map
      const classTeacherId = classTeacherMap
        ? classTeacherMap.get(classId) || null
        : null;

      const roomNum = isSenior
        ? 100 + (parseInt(level) - 10) * 10 + sec.charCodeAt(0) - 64
        : ["Nursery", "LKG", "UKG"].includes(level)
          ? `N-${sec}`
          : `${level}-${sec}`;

      const displayLevel = formatClassLevel(level); // "Nursery" | "LKG" | "UKG" | "1"…"10" | "XI" | "XII"
      const className = `${displayLevel}-${sec}`;
      const displayName = isSenior
        ? `Class ${displayLevel}-${sec} (${streamName})`
        : `Class ${displayLevel}-${sec}`;

      const roomValue = `Room ${roomNum}`;

      const fixedRoomId = isSenior
        ? `room-${level}${sec.toLowerCase()}`
        : ["Nursery", "LKG", "UKG"].includes(level)
          ? `room-${level.toLowerCase()}${sec.toLowerCase()}`
          : `room-${level}${sec.toLowerCase()}`;

      classes.push({
        classId,
        id: classId,
        className,
        name: className,
        level: level, // canonical level label without section: "Nursery"|"LKG"|"UKG"|"1"…"10"|"11"|"12"
        section: sec,
        grade: isSenior
          ? parseInt(level)
          : ["Nursery", "LKG", "UKG"].includes(level)
            ? 0
            : parseInt(level),
        stage: getStageFromLevel(level),
        streamId,
        stream: streamId,
        classTeacherId,
        isFoundationClass: isFoundation,
        roomNumber: roomValue,
        room: roomValue,
        fixedRoomId,
        displayName,
        academicYear: "2026",
      });
    });
  });

  return classes;
};
