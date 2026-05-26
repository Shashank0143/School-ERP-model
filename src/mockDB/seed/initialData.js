/**
 * Modular Seeding Engine for EduDash ERP
 *
 * Aggregates modularized static sub-seeds and relation definitions,
 * executing relational generator routines and bootstrapping localStorage.
 */

import { getClassesSeed } from "./classes";
import { subjectsSeed } from "./subjects";
import { streamsSeed } from "./streams";
import { generateExpandedTeachers } from "./expandedTeachers";
import {
  generateTeacherSubjectAssignments,
  deriveClassTeacherMap,
} from "./teacherSubjectAssignments";
import {
  baseFees,
  baseExams,
  transportDriversSeed,
  transportVehiclesSeed,
  transportRoutesSeed,
  transportAlertsSeed,
  transportAssignmentsSeed,
  noticesSeed,
  eventsSeed,
  clubsSeed,
  clubCoordinatorsSeed,
  clubActivitiesSeed,
  mentorAssignmentsSeed,
  mentorSessionsSeed,
  generateDocumentsSeed,
  generateTeacherDocumentsSeed,
  generateAchievementsSeed,
  generateInvoicesAndReceiptsSeed,
  generateClubEnrollmentsSeed,
  generateResultsSeed,
  generateAssignmentsAndSubmissionsSeed,
  generateExamPapersSeed,
} from "./relationships";
import {
  generateExpandedStudents,
  generateExpandedParents,
} from "./expandedStudents";
import {
  periodsSeed,
  getRoomsSeed,
  academicCalendarSeed,
} from "./academicStructure";

import { generateAuthUsers } from "../authUsers";
import { generateDailyAttendance } from "../dailyAttendance";
import { generateLeaveRequests } from "../leaveRequests";
import { generateMentorRemarks } from "../mentorRemarks";
import { generateClassUpdates } from "../classUpdates";

import { feeStructuresSeed, getFeeStructureForClass } from "./feeStructures";
import { getItem, setItem } from "../../persistence/storage";
import { STORAGE_KEYS } from "../../persistence/storageKeys";

/**
 * seedData
 * Populates the provided database registry object with relation-complete seeds.
 */
export const seedData = (db) => {
  // 1. Static and Dyno definitions
  db.subjects = subjectsSeed;
  db.streams = streamsSeed;

  // 2. Academic structure
  db.periods = [...periodsSeed];
  db.rooms = getRoomsSeed();
  db.academicCalendar = { ...academicCalendarSeed };

  // 3. Base relational identities
  db.teachers = generateExpandedTeachers();

  // Initially get classes without classTeacherMap to know what classes exist
  db.classes = getClassesSeed();

  // Derive relational teacher-subject-class assignment table deterministically
  db.teacherSubjectAssignments = generateTeacherSubjectAssignments(
    db.classes,
    db.teachers,
    db.subjects,
  );

  // Derive class teacher ownership from assignments (English → Math → Science → Any priority)
  const classTeacherMap = deriveClassTeacherMap(db.teacherSubjectAssignments);

  // Re-resolve classes with the derived classTeacherId
  db.classes = getClassesSeed(classTeacherMap);

  // Generate expanded students and parents
  const expandedStudents = generateExpandedStudents();
  const expandedParents = generateExpandedParents(expandedStudents);

  db.students = [...expandedStudents];
  db.parents = [...expandedParents];
  db.feeStructures = [...feeStructuresSeed];

  // Build fee records keyed to actual annual totals from fee structures
  db.fees = baseFees.map((fee) => {
    const stu = db.students.find((s) => s.id === fee.studentId);
    const cls = stu ? db.classes.find((c) => c.id === stu.classId) : null;
    const fs = cls ? getFeeStructureForClass(db.feeStructures, cls) : null;
    if (fs) {
      const annualTotal = fs.feeHeads.reduce(
        (sum, h) => sum + (h.annualAmount || 0),
        0,
      );
      const ratio = fee.paidAmount / fee.totalAmount;
      return {
        ...fee,
        totalAmount: annualTotal,
        paidAmount: Math.round(annualTotal * ratio),
      };
    }
    return fee;
  });
  db.exams = [...baseExams];
  db.examPapers = generateExamPapersSeed(
    db.classes,
    db.subjects,
    db.teacherSubjectAssignments,
  );

  // 3. Dependent relationship maps
  db.results = generateResultsSeed(
    db.students,
    db.streams,
    db.subjects,
    db.teacherSubjectAssignments,
  );

  const { assignments, submissions } = generateAssignmentsAndSubmissionsSeed(
    db.subjects,
    db.teacherSubjectAssignments,
    db.students,
    db.streams,
  );
  db.assignments = assignments;
  db.submissions = submissions;

  db.transportDrivers = [...transportDriversSeed];
  db.transportVehicles = [...transportVehiclesSeed];
  db.transportRoutes = [...transportRoutesSeed];
  db.transportAlerts = [...transportAlertsSeed];
  db.transportAssignments = [...transportAssignmentsSeed];

  db.documents = generateDocumentsSeed(db.students);
  db.teacherDocuments = generateTeacherDocumentsSeed(db.teachers);
  db.achievements = generateAchievementsSeed(db.students);

  const { invoices, receipts } = generateInvoicesAndReceiptsSeed(
    db.fees,
    db.feeStructures,
    db.students,
    db.classes,
  );
  db.invoices = invoices;
  db.receipts = receipts;

  db.notices = [...noticesSeed];
  db.events = [...eventsSeed];
  db.clubs = [...clubsSeed];
  db.clubCoordinators = [...clubCoordinatorsSeed];
  db.clubActivities = [...clubActivitiesSeed];
  db.clubEnrollments = generateClubEnrollmentsSeed(db.students, db.clubs);
  db.clubUpdates = [];

  // 4. Dynamic workflow generators
  generateAuthUsers(db);
  generateDailyAttendance(db);
  generateLeaveRequests(db);
  generateMentorRemarks(db);
  generateClassUpdates(db);

  // 5. Mentorship associations
  db.mentorAssignments = [...mentorAssignmentsSeed];
  db.mentorSessions = [...mentorSessionsSeed];
};

/**
 * ensureSeedData
 * Checks localStorage and bootstraps the full database structure if not already seeded.
 */
export const ensureSeedData = () => {
  const isSeeded = getItem(STORAGE_KEYS.STUDENTS);
  if (isSeeded) {
    return; // Already initialized
  }

  // Define temporary entities registry
  const db = {
    users: [],
    students: [],
    teachers: [],
    parents: [],
    classes: [],
    subjects: [],
    attendance: [],
    assignments: [],
    fees: [],
    notices: [],
    events: [],
    exams: [],
    examPapers: [],
    results: [],
    submissions: [],
    streams: [],
    transportRoutes: [],
    transportAssignments: [],
    transportVehicles: [],
    transportDrivers: [],
    transportAlerts: [],
    documents: [],
    achievements: [],
    invoices: [],
    receipts: [],
    clubs: [],
    clubEnrollments: [],
    clubActivities: [],
    clubCoordinators: [],
    dailyAttendance: [],
    attendanceSessions: [],
    leaveRequests: [],
    mentorRemarks: [],
    mentorAssignments: [],
    mentorSessions: [],
    classUpdates: [],
    clubUpdates: [],
    teacherSubjectAssignments: [],
    authUsers: [],
    periods: [],
    rooms: [],
    academicCalendar: null,
    feeStructures: [],
    teacherDocuments: [],
  };

  // Run dynamic relational population
  seedData(db);

  // Persist all populated tables directly to localStorage
  setItem(STORAGE_KEYS.STUDENTS, db.students);
  setItem(STORAGE_KEYS.TEACHERS, db.teachers);
  setItem(STORAGE_KEYS.PARENTS, db.parents);
  setItem(STORAGE_KEYS.AUTH_USERS, db.authUsers);
  setItem(STORAGE_KEYS.CLASSES, db.classes);
  setItem(STORAGE_KEYS.SUBJECTS, db.subjects);
  setItem(STORAGE_KEYS.STREAMS, db.streams);
  setItem(
    STORAGE_KEYS.TEACHER_SUBJECT_ASSIGNMENTS,
    db.teacherSubjectAssignments,
  );
  setItem(STORAGE_KEYS.DAILY_ATTENDANCE, db.dailyAttendance);
  setItem(STORAGE_KEYS.ATTENDANCE_SESSIONS, db.attendanceSessions);
  setItem(STORAGE_KEYS.EXAMS, db.exams);
  setItem(STORAGE_KEYS.EXAM_PAPERS, db.examPapers);
  setItem(STORAGE_KEYS.RESULTS, db.results);
  setItem(STORAGE_KEYS.ASSIGNMENTS, db.assignments);
  setItem(STORAGE_KEYS.SUBMISSIONS, db.submissions);
  setItem(STORAGE_KEYS.FEES, db.fees);
  setItem(STORAGE_KEYS.FEE_STRUCTURES, db.feeStructures || []);
  setItem(STORAGE_KEYS.INVOICES, db.invoices);
  setItem(STORAGE_KEYS.RECEIPTS, db.receipts);
  setItem(STORAGE_KEYS.TEACHER_DOCUMENTS, db.teacherDocuments || []);
  setItem(STORAGE_KEYS.TRANSPORT_ROUTES, db.transportRoutes);
  setItem(STORAGE_KEYS.TRANSPORT_VEHICLES, db.transportVehicles);
  setItem(STORAGE_KEYS.TRANSPORT_DRIVERS, db.transportDrivers);
  setItem(STORAGE_KEYS.TRANSPORT_ASSIGNMENTS, db.transportAssignments);
  setItem(STORAGE_KEYS.TRANSPORT_ALERTS, db.transportAlerts);
  setItem(STORAGE_KEYS.DOCUMENTS, db.documents);
  setItem(STORAGE_KEYS.ACHIEVEMENTS, db.achievements);
  setItem(STORAGE_KEYS.NOTICES, db.notices);
  setItem(STORAGE_KEYS.EVENTS, db.events);
  setItem(STORAGE_KEYS.CLUBS, db.clubs);
  setItem(STORAGE_KEYS.CLUB_ENROLLMENTS, db.clubEnrollments);
  setItem(STORAGE_KEYS.CLUB_ACTIVITIES, db.clubActivities);
  setItem(STORAGE_KEYS.CLUB_COORDINATORS, db.clubCoordinators);
  setItem(STORAGE_KEYS.CLUB_UPDATES, db.clubUpdates);
  setItem(STORAGE_KEYS.MENTOR_REMARKS, db.mentorRemarks);
  setItem(STORAGE_KEYS.MENTOR_ASSIGNMENTS, db.mentorAssignments);
  setItem(STORAGE_KEYS.MENTOR_SESSIONS, db.mentorSessions);
  setItem(STORAGE_KEYS.CLASS_UPDATES, db.classUpdates);
  setItem(STORAGE_KEYS.LEAVE_REQUESTS, db.leaveRequests);

  // Persist academic structure
  setItem(STORAGE_KEYS.PERIODS, db.periods);
  setItem(STORAGE_KEYS.ROOMS, db.rooms);
  setItem(STORAGE_KEYS.ACADEMIC_CALENDAR, db.academicCalendar);

  // Set schema versions for stability check
  setItem(STORAGE_KEYS.STUDENTS_SCHEMA_VERSION, "v4");
  setItem("erp_results_schema_version", "v2");
  setItem("erp_assignments_schema_version", "v1");
  setItem("erp_submissions_schema_version", "v1");
};
