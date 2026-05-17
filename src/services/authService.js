/**
 * services/authService.js
 * Service for authentication logic using MockDB
 */

import { MockDB } from "../mockDB";
import { db } from "../mockDB/entities";

/**
 * Simulated Login
 * Performs a relational lookup to find a user and their linked entity.
 * 
 * @param {string} username - The username to search for
 * @param {string} role - The role to validate against
 */
export const loginUser = async (username, role) => {
  // 1. Find the user record in the relational store
  const userRecord = await MockDB.users.findOne({ username, role });
  
  if (!userRecord) {
    throw new Error(`User not found with username "${username}" and role "${role}"`);
  }

  // 2. Resolve the linked entity details
  let entity = null;
  let fullName = "Unknown User";

  if (userRecord.role === "STUDENT") {
    entity = await MockDB.students.findById(userRecord.linkedEntityId);
    fullName = entity?.name || "Student";
  } else if (userRecord.role === "TEACHER") {
    entity = await MockDB.teachers.findById(userRecord.linkedEntityId);
    fullName = entity?.name || "Teacher";
  } else if (userRecord.role === "PARENT") {
    entity = await MockDB.parents.findById(userRecord.linkedEntityId);
    fullName = entity?.name || "Parent";
  } else if (userRecord.role === "ADMIN") {
    fullName = "System Administrator";
  }

  // 3. Construct the authenticated session object with UI-friendly helpers
  const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const roleColors = {
    STUDENT: "#03045e",
    TEACHER: "#0077b6",
    PARENT: "#00b4d8",
    ADMIN: "#7209b7"
  };

  return {
    id: userRecord.id,
    username: userRecord.username,
    role: userRecord.role,
    linkedEntityId: userRecord.linkedEntityId,
    name: fullName,
    enrollmentNumber: entity?.admissionNo || entity?.employeeId || userRecord.linkedEntityId || "N/A",
    avatarInitials: initials || "?",
    avatarColor: roleColors[userRecord.role] || "#03045e",
    profile: entity // Full relational entity data
  };
};

/**
 * Validates session integrity (Simulated)
 */
export const validateSession = async (user) => {
  if (!user || !user.id) return false;
  const record = await MockDB.users.findById(user.id);
  return !!record;
};

let cachedPreviews = null;

/**
 * Resolves lightweight preview details directly from the relational entities registry.
 * Bypasses simulated latency to deliver sub-millisecond (0ms) login screen loading times
 * while keeping structure aligned with future production REST APIs.
 */
const resolveAllPreviews = () => {
  if (cachedPreviews) return cachedPreviews;

  // Create lightweight preview maps for O(1) synchronous lookup
  const classMap = new Map(db.classes.map(c => [c.id, c]));
  const streamMap = new Map(db.streams.map(s => [s.id, s]));
  const studentMap = new Map(db.students.map(s => [s.id, s]));

  const studentPreviews = [];
  const parentPreviews = [];
  const teacherPreviews = [];

  for (const user of db.users) {
    if (user.role === "STUDENT") {
      const student = studentMap.get(user.linkedEntityId);
      if (student) {
        const classData = classMap.get(student.classId);
        const stream = streamMap.get(student.streamId);
        let sub = "N/A";
        if (classData) {
          const streamSuffix = stream ? ` (${stream.name})` : "";
          sub = `Class ${classData.name}-${classData.section}${streamSuffix}`;
        }
        studentPreviews.push({
          id: user.username,
          name: student.name,
          sub
        });
      }
    } else if (user.role === "TEACHER") {
      const teacher = db.teachers.find(t => t.id === user.linkedEntityId);
      if (teacher) {
        teacherPreviews.push({
          id: user.username,
          name: teacher.name,
          sub: teacher.subjectIds && teacher.subjectIds.length > 0 
            ? `${teacher.subjectIds.map(s => s.replace("sub-", "").toUpperCase()).join(", ")} Dept`
            : "Faculty"
        });
      }
    } else if (user.role === "PARENT") {
      const parent = db.parents.find(p => p.id === user.linkedEntityId);
      if (parent) {
        const children = (parent.childIds || []).map(cid => studentMap.get(cid));
        const childrenNames = children.filter(Boolean).map(c => c.name.split(' ')[0]).join(' & ');
        parentPreviews.push({
          id: user.username,
          name: parent.name,
          sub: `Parent of ${childrenNames || "..."}`
        });
      }
    }
  }

  cachedPreviews = {
    STUDENT: studentPreviews,
    PARENT: parentPreviews,
    TEACHER: teacherPreviews
  };

  return cachedPreviews;
};

export const getLoginStudentPreviews = async () => {
  const previews = resolveAllPreviews();
  return previews.STUDENT;
};

export const getLoginParentPreviews = async () => {
  const previews = resolveAllPreviews();
  return previews.PARENT;
};

export const getLoginTeacherPreviews = async () => {
  const previews = resolveAllPreviews();
  return previews.TEACHER;
};
