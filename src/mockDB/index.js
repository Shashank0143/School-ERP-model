import { db } from './entities';
import { engine } from './core/engine';
import { seedData } from './seed/initialData';

/**
 * MockDB Central Instance
 * 
 * Provides a unified interface to interact with the relational mock engine.
 */

// Initialize Database
seedData(db);

export const MockDB = {
  // Collection Accessors
  students: {
    find: (query) => engine.where(db.students, query),
    findOne: (query) => engine.findOne(db.students, query),
    findById: (id) => engine.findById(db.students, id)
  },
  
  users: {
    find: (query) => engine.where(db.users, query),
    findOne: (query) => engine.findOne(db.users, query),
    findById: (id) => engine.findById(db.users, id)
  },
  
  teachers: {
    find: (query) => engine.where(db.teachers, query),
    findOne: (query) => engine.findOne(db.teachers, query),
    findById: (id) => engine.findById(db.teachers, id)
  },

  classes: {
    findById: (id) => engine.findById(db.classes, id),
    all: () => Promise.resolve(db.classes)
  },

  attendance: {
    find: (query) => engine.where(db.attendance, query),
    // Mutation simulation
    insert: async (record) => {
      // Idempotency: Check if attendance for this student/date/class already exists
      const existingIdx = db.attendance.findIndex(a => 
        a.studentId === record.studentId && 
        a.date === record.date &&
        a.classId === record.classId
      );

      if (existingIdx !== -1) {
        db.attendance[existingIdx] = { ...db.attendance[existingIdx], ...record };
        return db.attendance[existingIdx];
      }

      const newRecord = { ...record, id: `att-${Date.now()}` };
      db.attendance.push(newRecord);
      return newRecord;
    }
  },

  fees: {
    findOne: (query) => engine.findOne(db.fees, query)
  },

  parents: {
    find: (query) => engine.where(db.parents, query),
    findOne: (query) => engine.findOne(db.parents, query),
    findById: (id) => engine.findById(db.parents, id)
  },
  
  exams: {
    all: () => Promise.resolve(db.exams),
    findById: (id) => engine.findById(db.exams, id)
  },

  subjects: {
    all: () => Promise.resolve(db.subjects),
    findById: (id) => engine.findById(db.subjects, id)
  },

  results: {
    find: (query) => engine.where(db.results, query),
    insertMany: async (records) => {
      records.forEach(record => {
        const existingIdx = db.results.findIndex(r => 
          r.studentId === record.studentId && 
          r.examId === record.examId && 
          r.subjectId === record.subjectId
        );

        if (existingIdx !== -1) {
          db.results[existingIdx] = { ...db.results[existingIdx], ...record };
        } else {
          db.results.push({ ...record, id: `res-${Date.now()}-${Math.random()}` });
        }
      });
      return true;
    }
  },
  
  assignments: {
    find: (query) => engine.where(db.assignments, query),
    findById: (id) => engine.findById(db.assignments, id),
    all: () => Promise.resolve(db.assignments)
  },

  submissions: {
    find: (query) => engine.where(db.submissions, query),
    findOne: (query) => engine.findOne(db.submissions, query)
  },

  streams: {
    all: () => Promise.resolve(db.streams),
    findById: (id) => engine.findById(db.streams, id)
  },

  transport: {
    findAssignment: (query) => engine.findOne(db.transportAssignments, query),
    findRoute: (query) => engine.findOne(db.transportRoutes, query)
  },

  documents: {
    find: (query) => engine.where(db.documents, query)
  },

  achievements: {
    find: (query) => engine.where(db.achievements, query)
  },

  invoices: {
    find: (query) => engine.where(db.invoices, query),
    all: () => Promise.resolve(db.invoices)
  },

  receipts: {
    find: (query) => engine.where(db.receipts, query),
    all: () => Promise.resolve(db.receipts)
  },

  notices: {
    find: (query) => engine.where(db.notices, query),
    all: () => Promise.resolve(db.notices)
  },

  events: {
    find: (query) => engine.where(db.events, query),
    all: () => Promise.resolve(db.events)
  },

  clubs: {
    find: (query) => engine.where(db.clubs, query),
    all: () => Promise.resolve(db.clubs)
  },

  clubEnrollments: {
    find: (query) => engine.where(db.clubEnrollments, query),
    all: () => Promise.resolve(db.clubEnrollments)
  },

  clubActivities: {
    find: (query) => engine.where(db.clubActivities, query),
    all: () => Promise.resolve(db.clubActivities)
  },

  clubCoordinators: {
    find: (query) => engine.where(db.clubCoordinators, query),
    all: () => Promise.resolve(db.clubCoordinators)
  },

  // Relationship Resolvers
  helpers: {
    resolveClass: (student) => engine.resolveOne(student, 'classId', db.classes),
    resolveAttendance: (student) => engine.resolveMany(student, 'id', db.attendance, 'studentId'),
    resolveResults: (student) => engine.resolveMany(student, 'id', db.results, 'studentId'),
    resolveStudentsInClass: (classId) => db.students.filter(s => s.classId === classId),
    
    // Analytics Helpers
    getClassAverage: (classId, subjectId, examId) => {
      const classResults = db.results.filter(r => r.classId === classId && r.subjectId === subjectId && r.examId === examId);
      if (classResults.length === 0) return 0;
      const total = classResults.reduce((sum, r) => sum + r.marksObtained, 0);
      return (total / classResults.length).toFixed(1);
    },
    
    getTopper: (classId, subjectId, examId) => {
      const classResults = db.results.filter(r => r.classId === classId && r.subjectId === subjectId && r.examId === examId);
      if (classResults.length === 0) return null;
      return classResults.reduce((prev, current) => (prev.marksObtained > current.marksObtained) ? prev : current);
    },

    getStudentWeakAreas: (studentId) => {
      const studentResults = db.results.filter(r => r.studentId === studentId);
      // Subjects where marks < 60%
      return studentResults
        .filter(r => (r.marksObtained / r.maxMarks) < 0.6)
        .map(r => ({ subjectId: r.subjectId, score: r.marksObtained, examId: r.examId }));
    }
  }
};
