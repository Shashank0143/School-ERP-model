import { MockDB } from "../mockDB";
import { getCourses } from "./academicsService";

/**
 * assignmentService.js
 * 
 * Operational service for managing assignments, submissions, and academic task tracking.
 * Designed as a lightweight ERP module.
 */

/**
 * Fetches all assignments for a specific student's class
 * and resolves their current submission status.
 */
export const getStudentAssignments = async (studentId) => {
  const student = await MockDB.students.findById(studentId);
  if (!student) return [];

  const assignments = await MockDB.assignments.find({ classId: student.classId });
  const submissions = await MockDB.submissions.find({ studentId });

  const enrolledCourses = await getCourses(studentId);

  // Relational Mapping: Join assignments with student submissions
  return assignments.map(asgn => {
    const submission = submissions.find(s => s.assignmentId === asgn.id);
    
    // Status Logic
    let status = 'PENDING';
    const dueDate = new Date(asgn.dueDate);
    const now = new Date();
    const isOverdue = dueDate < now;
    const isDueSoon = !isOverdue && (dueDate - now) < (48 * 60 * 60 * 1000); // 48 hours

    if (submission) {
      status = submission.status === 'GRADED' ? 'REVIEWED' : 'SUBMITTED';
    } else if (isOverdue) {
      status = 'OVERDUE';
    } else if (isDueSoon) {
      status = 'DUE_SOON';
    }

    // Relational Lookup: Find course name to prevent raw IDs rendering
    const course = enrolledCourses.find(c => c.id === asgn.subjectId);

    return {
      ...asgn,
      subjectName: course ? course.name : asgn.subjectId,
      status,
      submissionDetails: submission || null
    };
  });
};

/**
 * Calculates academic task progress per subject for a student
 */
export const getAcademicProgress = async (studentId) => {
  const assignments = await getStudentAssignments(studentId);
  const enrolledCourses = await getCourses(studentId);
  
  // Group by enrolled course and calculate completion
  return enrolledCourses.map(course => {
    const subjectId = course.id;
    
    const subAssignments = assignments.filter(a => a.subjectId === subjectId);
    const total = subAssignments.length;
    const completed = subAssignments.filter(a => ['SUBMITTED', 'REVIEWED', 'GRADED'].includes(a.status)).length;
    
    return {
      subjectId: subjectId,
      subjectName: course.name,
      totalTasks: total,
      completedTasks: completed,
      progressPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      status: total === 0 ? 'NO_TASKS' : completed === total ? 'COMPLETED' : 'IN_PROGRESS'
    };
  });
};

/**
 * Fetches the academic timeline (upcoming and overdue work)
 */
export const getAcademicTimeline = async (studentId) => {
  const assignments = await getStudentAssignments(studentId);
  
  return {
    overdue: assignments.filter(a => a.status === 'OVERDUE'),
    upcoming: assignments
      .filter(a => ['PENDING', 'DUE_SOON'].includes(a.status))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)),
    recent: assignments
      .filter(a => ['SUBMITTED', 'REVIEWED'].includes(a.status))
      .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))
      .slice(0, 5)
  };
};

/**
 * Mock submission of an assignment
 * In a real backend, this would involve file upload and DB mutation.
 */
export const submitAssignment = async (studentId, assignmentId, fileMetadata) => {
  console.log(`[Service] Submitting assignment ${assignmentId} for student ${studentId}`, fileMetadata);
  
  // Simulation: We don't mutate the actual MockDB here to avoid state persistence issues in this session,
  // but we return success to allow UI updates.
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ 
        success: true, 
        submissionId: `subm-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString()
      });
    }, 1000);
  });
};
