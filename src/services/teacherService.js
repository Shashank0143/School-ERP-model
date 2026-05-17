import { MockDB } from "../mockDB";
import { facultyData } from "../data/teachers/faculty";
import { mentorProfile, quickResources, sessionHistory, supportCategories } from "../data/teachers/mentors";

/**
 * services/teacherService.js
 * Service abstraction for faculty and operational teacher workflows
 */

const simulateNetwork = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), 150);
  });
};

// --- RESTORED LEGACY EXPORTS (Top Priority to fix HMR) ---
export const getMentorResources = async () => simulateNetwork(quickResources);
export const getMentors = async () => simulateNetwork(mentorProfile);
export const getMentorSessions = async () => simulateNetwork(sessionHistory);
export const getFaculty = async () => simulateNetwork(facultyData);
export const getMentorCategories = async () => simulateNetwork(supportCategories);
export const getMentorshipData = async () => {
  return simulateNetwork({
    mentorProfile,
    supportCategories,
    quickResources,
    sessionHistory
  });
};

// --- NEW RELATIONAL OPERATIONAL EXPORTS ---

/**
 * Fetches the teacher profile and assigned classes
 */
export const getTeacherWorkload = async (teacherId) => {
  const id = teacherId || 'teach-001';
  const teacher = await MockDB.teachers.findById(id);
  
  if (!teacher) return null;

  const classes = await Promise.all(
    teacher.assignedClassIds.map(classId => MockDB.classes.findById(classId))
  );

  return {
    profile: teacher,
    classes: classes
  };
};

/**
 * Fetches students in a specific class
 */
export const getStudentsInClass = async (classId) => {
  return MockDB.helpers.resolveStudentsInClass(classId);
};

/**
 * Submits attendance for a class
 */
export const submitAttendance = async (teacherId, classId, attendanceList) => {
  const results = await Promise.all(
    attendanceList.map(item => 
      MockDB.attendance.insert({
        studentId: item.studentId,
        classId: classId,
        date: new Date().toISOString().split('T')[0],
        status: item.status,
        markedById: teacherId
      })
    )
  );
  return results;
};

/**
 * Fetches existing attendance for a class on a specific date
 */
export const getAttendanceForClass = async (classId, date) => {
  return MockDB.attendance.find({ classId, date });
};
/**
 * Fetches existing marks for a class, subject, and exam
 */
export const getMarksForClass = async (classId, subjectId, examId) => {
  return MockDB.results.find({ classId, subjectId, examId });
};

/**
 * Submits marks for a list of students
 */
export const submitMarks = async (teacherId, classId, subjectId, examId, marksList) => {
  const records = marksList.map(item => ({
    studentId: item.studentId,
    classId: classId,
    subjectId: subjectId,
    examId: examId,
    marksObtained: parseFloat(item.marks),
    maxMarks: parseFloat(item.maxMarks || 100),
    remarks: item.remarks || '',
    grade: calculateGrade(item.marks, item.maxMarks || 100),
    teacherId: teacherId
  }));

  return MockDB.results.insertMany(records);
};

/**
 * Simple grade calculator
 */
const calculateGrade = (marks, max) => {
  const percentage = (marks / max) * 100;
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
};
