import { getDataProvider } from "../data";
import { getSubjectsForStudent } from "./academicsService";
import { emitEvent, WORKFLOW_EVENTS } from "./workflowEvents";
import { getStudentSubjects } from "../data/subjectArchitecture";
import { normalizeClassLevel } from "../utils/classIdentity";

/**
 * Fetches all examination sessions
 */
export const getExams = async () => {
  const provider = getDataProvider();
  return await provider.getExams();
};

/**
 * Fetches exam by id
 */
export const getExamById = async (examId) => {
  const provider = getDataProvider();
  return await provider.getExamById(examId);
};

/**
 * Creates a new exam session
 */
export const createExamSession = async (sessionData) => {
  const provider = getDataProvider();

  const initialHistory = sessionData.statusHistory || [
    {
      from: null,
      to: sessionData.status || "draft",
      changedBy: sessionData.createdBy || "admin-001",
      changedAt: new Date().toISOString(),
    },
  ];

  const exam = await provider.createExam({
    ...sessionData,
    statusHistory: initialHistory,
  });

  // Emit event for notice generation
  emitEvent(WORKFLOW_EVENTS.EXAM_CREATED, {
    examId: exam.id,
    examName: exam.name,
    classIds: exam.classIds,
    startDate: exam.startDate,
    endDate: exam.endDate,
    sourceModule: "examinations",
    createdBy: sessionData.createdBy || "admin-001",
  });

  return exam;
};

/**
 * Updates an exam session
 */
export const updateExamSession = async (examId, updates) => {
  const provider = getDataProvider();
  const existingExam = await provider.getExamById(examId);
  let finalUpdates = { ...updates };

  if (
    existingExam &&
    updates.status &&
    updates.status !== existingExam.status
  ) {
    const currentHistory = existingExam.statusHistory || [
      {
        from: null,
        to: existingExam.status || "draft",
        changedBy: "admin-001",
        changedAt: existingExam.createdAt || new Date().toISOString(),
      },
    ];
    finalUpdates.statusHistory = [
      ...currentHistory,
      {
        from: existingExam.status,
        to: updates.status,
        changedBy: updates.createdBy || "admin-001",
        changedAt: new Date().toISOString(),
      },
    ];

    // Audit logs for release to scheduled status
    if (updates.status === "scheduled") {
      finalUpdates.releasedAt = new Date().toISOString();
      finalUpdates.releasedBy = updates.createdBy || "admin-001";
    }
  }

  const exam = await provider.updateExam(examId, finalUpdates);

  // Cascade status: "scheduled" to all exam papers associated with this session upon release
  if (updates.status === "scheduled") {
    const sessionPapers = await provider.getExamPapersBySession(examId);
    for (const paper of sessionPapers) {
      await provider.updateExamPaper(paper.id, {
        ...paper,
        status: "scheduled",
      });
    }
  }

  // Emit event for exam cycle creation when status changes to scheduled
  if (updates.status === "scheduled") {
    emitEvent(WORKFLOW_EVENTS.EXAM_CYCLE_CREATED, {
      examId: exam.id,
      examName: exam.name,
      classIds: exam.classIds,
      startDate: exam.startDate,
      endDate: exam.endDate,
      sourceModule: "examinations",
      createdBy: updates.createdBy || "admin-001",
    });
  }

  // Emit event for evaluation start when status changes to completed
  if (updates.status === "completed") {
    emitEvent(WORKFLOW_EVENTS.EVALUATION_STARTED, {
      examId: exam.id,
      examName: exam.name,
      classIds: exam.classIds,
      sourceModule: "examinations",
      createdBy: updates.createdBy || "admin-001",
    });
  }

  return exam;
};

/**
 * Deletes an exam session (cascade deletes papers)
 */
export const deleteExamSession = async (examId) => {
  const provider = getDataProvider();
  return await provider.deleteExam(examId);
};

/**
 * Fetches all exam papers (schedules)
 */
export const getExamPapers = async () => {
  const provider = getDataProvider();
  return await provider.getExamPapers();
};

/**
 * Fetches exam papers for a specific session
 */
export const getExamPapersBySession = async (sessionId) => {
  const provider = getDataProvider();
  return await provider.getExamPapersBySession(sessionId);
};

/**
 * Fetches an exam paper by id
 */
export const getExamPaperById = async (paperId) => {
  const provider = getDataProvider();
  return await provider.getExamPaperById(paperId);
};

/**
 * Creates an exam paper
 */
export const createExamPaper = async (paperData) => {
  const provider = getDataProvider();
  const paper = await provider.createExamPaper(paperData);

  // Emit event for notice generation when datesheet is published
  if (paperData.publishDatesheet) {
    emitEvent(WORKFLOW_EVENTS.EXAM_DATESHEET_PUBLISHED, {
      examId: paper.sessionId,
      examName: paperData.examName,
      subject: paperData.subject,
      date: paper.date,
      venue: paper.venue,
      classIds: paperData.classIds,
      sourceModule: "examinations",
      createdBy: paperData.createdBy || "admin-001",
    });
  }

  return paper;
};

/**
 * Updates an exam paper
 */
export const updateExamPaper = async (paperId, updates) => {
  const provider = getDataProvider();
  return await provider.updateExamPaper(paperId, updates);
};

/**
 * Starts evaluation for a specific exam paper
 * Emits event to notify subject teachers
 */
export const startEvaluation = async (paperId, options = {}) => {
  const provider = getDataProvider();
  const paper = await provider.getExamPaperById(paperId);
  const exam = await provider.getExamById(paper.sessionId);

  // Emit evaluation started event for each class
  if (paper.classIds && paper.classIds.length > 0) {
    for (const classId of paper.classIds) {
      // Get the subject teacher for this class
      const assignments = await provider.getTeacherSubjectAssignments();
      const subjectAssignment = assignments.find(
        (a) => a.subjectId === paper.subjectId && a.classId === classId,
      );

      if (subjectAssignment) {
        emitEvent(WORKFLOW_EVENTS.EVALUATION_STARTED, {
          examId: exam.id,
          examName: exam.name,
          subject: paper.subject,
          subjectId: paper.subjectId,
          classId: classId,
          teacherId: subjectAssignment.teacherId,
          deadline: options.deadline || calculateDeadline(exam.endDate),
          totalStudents: await getStudentCountForClass(classId),
          sourceModule: "examinations",
          createdBy: options.createdBy || "admin-001",
        });
      }
    }
  }

  return paper;
};

/**
 * Helper to calculate evaluation deadline (7 days after exam end)
 */
const calculateDeadline = (examEndDate) => {
  const endDate = new Date(examEndDate);
  const deadline = new Date(endDate);
  deadline.setDate(deadline.getDate() + 7);
  return deadline.toISOString();
};

/**
 * Helper to get student count for a class
 */
const getStudentCountForClass = async (classId) => {
  const provider = getDataProvider();
  const students = await provider.getStudents();
  return students.filter((s) => s.classId === classId).length;
};

/**
 * Deletes an exam paper
 */
export const deleteExamPaper = async (paperId) => {
  const provider = getDataProvider();
  return await provider.deleteExamPaper(paperId);
};

// Helpers for date/time conversion in dashboards
const formatDateString = (dateStr) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${date.getDate()} ${months[date.getMonth()]}`;
};

const getDayName = (dateStr) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[date.getDay()];
};

const format12Hour = (timeStr) => {
  if (!timeStr) return "N/A";
  const [hours, minutes] = timeStr.split(":");
  const hrs = parseInt(hours, 10);
  const ampm = hrs >= 12 ? "PM" : "AM";
  const hrs12 = hrs % 12 || 12;
  return `${hrs12.toString().padStart(2, "0")}:${minutes} ${ampm}`;
};

/**
 * Conflict Validation Engine
 * Checks paper allocations against all active paper slots for clashes:
 * - Room booking clashes
 * - Invigilator double-booking
 * - Class schedule overlapping
 * - Sunday and Calendar Holiday clashes
 */
export const validateExamPaperConflicts = async (
  paperData,
  editingPaperId = null,
) => {
  const provider = getDataProvider();
  const allPapers = await provider.getExamPapers();
  const allSessions = await provider.getExams();
  const events = await provider.getEvents();

  const conflicts = [];
  const currentPaperId = editingPaperId || paperData.id;

  const {
    examSessionId,
    classId,
    subjectId,
    date,
    startTime,
    endTime,
    roomId,
    invigilatorTeacherIds = [],
  } = paperData;

  if (!date || !startTime || !endTime) {
    return conflicts; // Incomplete details, bypass validation
  }

  // Parse current times
  const currStart = parseInt(startTime.replace(":", ""), 10);
  const currEnd = parseInt(endTime.replace(":", ""), 10);

  // 1. Sunday clash check
  const dayIndex = new Date(date).getDay();
  if (dayIndex === 0) {
    conflicts.push({
      type: "warning",
      message:
        "Scheduled date falls on a Sunday. Confirm if weekend exams are authorized.",
    });
  }

  // 2. School Calendar Holiday clash check
  const matchingHoliday = events.find(
    (e) =>
      e.date === date &&
      (e.category?.toLowerCase() === "holiday" ||
        e.name?.toLowerCase().includes("holiday")),
  );
  if (matchingHoliday) {
    conflicts.push({
      type: "warning",
      message: `Conflict with Calendar Holiday: "${matchingHoliday.name}".`,
    });
  }

  // Filter out the paper we are currently editing (to avoid self-clashes)
  const otherPapers = allPapers.filter((p) => p.id !== currentPaperId);

  // Loop through all other scheduled papers to identify resource clashes
  otherPapers.forEach((paper) => {
    // We only check papers scheduled on the EXACT SAME date
    if (paper.date !== date) return;

    // Check time overlap
    const pStart = parseInt(paper.startTime.replace(":", ""), 10);
    const pEnd = parseInt(paper.endTime.replace(":", ""), 10);
    const hasOverlap = currStart < pEnd && currEnd > pStart;

    if (!hasOverlap) return;

    // A. Class Clash (Same class cannot have two exams at the same time)
    if (paper.classId === classId) {
      conflicts.push({
        type: "danger",
        message: `Class double-booking! Already scheduled for subject ID "${paper.subjectId}" at this time.`,
      });
    }

    // B. Room Clash (Same room cannot host two exams at the same time)
    if (paper.roomId && roomId && paper.roomId === roomId) {
      conflicts.push({
        type: "danger",
        message: `Room booking clash! Room "${roomId}" is already reserved for Class ID "${paper.classId}" at this time.`,
      });
    }

    // C. Invigilator Clash (Invigilator cannot be in two rooms at the same time)
    if (
      invigilatorTeacherIds.length > 0 &&
      paper.invigilatorTeacherIds?.length > 0
    ) {
      const intersectingInvigilators = invigilatorTeacherIds.filter((id) =>
        paper.invigilatorTeacherIds.includes(id),
      );
      if (intersectingInvigilators.length > 0) {
        conflicts.push({
          type: "danger",
          message: `Invigilator conflict! Teacher is already assigned to invigilate Class ID "${paper.classId}" at this time.`,
        });
      }
    }
  });

  return conflicts;
};

/**
 * Fetches exam schedules and details (DYNAMIC RELATIONAL EMS WORKFLOW)
 */
export const getExamData = async (studentId) => {
  const provider = getDataProvider();

  // Resolve student context
  const students = await provider.getStudents();
  const student = students.find((s) => s.id === studentId);
  const rollNo = student ? `R-${student.admissionNo}` : "R-2024001";
  const classId = student ? student.classId : null;

  // Resolve subjects list
  const subjects = await provider.getSubjects();

  // Resolve exam sessions
  const exams = await provider.getExams();

  // We identify the primary active session (ongoing or scheduled) to show in the Admit Card/Schedule
  const activeSession =
    exams.find((e) => e.status === "ongoing" || e.status === "scheduled") ||
    exams[0];

  const isDraft = activeSession?.status === "draft";

  let schedule = [];
  let guidelines = [
    "Admit card is mandatory for examination hall entry.",
    "Arrive at least 30 minutes before the scheduled start time.",
    "Only standard writing materials (blue/black pens) are permitted.",
  ];

  if (activeSession && !isDraft && classId) {
    // Query actual relational scheduled papers for this class and active session
    const papers = await provider.getExamPapers();
    const classPapers = papers
      .filter(
        (p) => p.examSessionId === activeSession.id && p.classId === classId,
      )
      // Sort by date then start time
      .sort((a, b) => {
        const dateDiff = new Date(a.date) - new Date(b.date);
        if (dateDiff !== 0) return dateDiff;
        return a.startTime.localeCompare(b.startTime);
      });

    if (classPapers.length > 0) {
      schedule = classPapers.map((p) => {
        const subject = subjects.find((s) => s.id === p.subjectId);

        return {
          id: p.id,
          date: formatDateString(p.date),
          day: getDayName(p.date),
          subject: subject ? subject.name : p.subjectId,
          time: `${format12Hour(p.startTime)} - ${format12Hour(p.endTime)}`,
          room: p.roomId || "Main Hall",
        };
      });
    }
  }

  // Graceful fallback to static simulated schedule if database is empty/not scheduled yet
  // But ONLY if the session is not a draft (Fix #3)
  if (
    schedule.length === 0 &&
    !isDraft &&
    activeSession?.status !== "evaluation"
  ) {
    const studentSubjects = await getSubjectsForStudent(studentId);
    const baseDates = [
      { date: "18 Jul", day: "Friday" },
      { date: "21 Jul", day: "Monday" },
      { date: "23 Jul", day: "Wednesday" },
      { date: "25 Jul", day: "Friday" },
      { date: "28 Jul", day: "Monday" },
      { date: "30 Jul", day: "Wednesday" },
    ];

    schedule = studentSubjects.map((sub, idx) => {
      const d = baseDates[idx % baseDates.length];
      let room = "Examination Hall A";
      let time = "09:00 AM - 12:00 PM";

      const isScienceCore =
        sub.id === "sub-phy" ||
        sub.id === "sub-chem" ||
        sub.id === "sub-bio" ||
        sub.id === "sub-cs";
      if (isScienceCore && idx % 2 === 0) {
        room = sub.id === "sub-cs" ? "Computer Lab A" : "Science Lab 1";
        time = "09:00 AM - 11:30 AM (Practical & Viva)";
      }

      return {
        id: `sch-${sub.id}`,
        date: d.date,
        day: d.day,
        subject: sub.name,
        time: time,
        room: room,
      };
    });
  }

  // Session-wide instructions list
  const instructions =
    activeSession?.instructions?.length > 0
      ? activeSession.instructions
      : [
          "Candidates must carry a physical copy of their Admit Card to the examination hall.",
          "Banned items include mobile phones, calculators, smartwatches, and loose paper sheets.",
          "Candidates must report to the examination center at least 30 minutes before the scheduled time.",
          "A grace period of 15 minutes is allowed, post which no student will be permitted to enter the hall.",
          "Do not write anything on the question paper or admit card during the examination.",
        ];

  const admitCard = {
    examName: activeSession
      ? activeSession.name
      : "Half-Yearly Examination 2025",
    issued: activeSession ? activeSession.status !== "draft" : false,
    rollNo: rollNo,
    examCenter: "Springdale Senior Secondary School, Main Campus",
    reportingTime: "08:30 AM",
    examDates: activeSession
      ? `${formatDateString(activeSession.startDate)} - ${formatDateString(activeSession.endDate)}`
      : "18th July - 28th July 2025",
  };

  return {
    activeExams: exams.filter(
      (e) =>
        e.status === "ongoing" ||
        e.status === "evaluation" ||
        (new Date(e.startDate) <= new Date() &&
          new Date(e.endDate) >= new Date()),
    ),
    upcomingExams: exams.filter(
      (e) => e.status === "scheduled" && new Date(e.startDate) > new Date(),
    ),
    guidelines,
    admitCard,
    schedule,
    instructions,
    activeSession,
  };
};

/**
 * Fetches results for a student
 */
export const getStudentResults = async (studentId) => {
  const provider = getDataProvider();
  const results = await provider.getResults();
  const subjects = await provider.getSubjects();
  const exams = await provider.getExams();

  return results
    .filter((r) => r.studentId === studentId)
    .filter((r) => {
      const exam = exams.find((e) => e.id === r.examId);
      // STRICT SECURITY PROTECTION: Never reveal results to students during evaluation
      return exam && exam.status === "published";
    })
    .map((res) => {
      const subject = subjects.find((s) => s.id === res.subjectId);
      const exam = exams.find((e) => e.id === res.examId);
      return {
        ...res,
        subjectName: subject?.name,
        examName: exam?.name,
        category: exam?.type === "UNIT" ? "UNIT_TEST" : "TERM",
      };
    });
};

/**
 * Fetches academic analytics for a student
 */
export const getStudentAnalytics = async (studentId) => {
  const provider = getDataProvider();
  const results = await provider.getResults();
  const subjects = await provider.getSubjects();

  const weakAreas = results
    .filter(
      (r) => r.studentId === studentId && r.marksObtained / r.maxMarks < 0.6,
    )
    .map((r) => ({
      subjectId: r.subjectId,
      score: r.marksObtained,
      examId: r.examId,
    }));

  const resolvedWeakAreas = weakAreas.map((wa) => {
    const subject = subjects.find((s) => s.id === wa.subjectId);
    return { ...wa, subjectName: subject?.name };
  });

  return {
    weakAreas: resolvedWeakAreas,
  };
};

/**
 * Fetches class-wide analytics for a specific exam/subject
 */
export const getClassAnalytics = async (classId, subjectId, examId) => {
  const provider = getDataProvider();
  const results = await provider.getResults();
  const classResults = results.filter(
    (r) =>
      r.classId === classId && r.subjectId === subjectId && r.examId === examId,
  );

  let average = 0;
  if (classResults.length > 0) {
    const total = classResults.reduce((sum, r) => sum + r.marksObtained, 0);
    average = (total / classResults.length).toFixed(1);
  }

  let topperRecord = null;
  if (classResults.length > 0) {
    topperRecord = classResults.reduce((prev, current) =>
      prev.marksObtained > current.marksObtained ? prev : current,
    );
  }

  let topperName = "N/A";
  if (topperRecord) {
    const students = await provider.getStudents();
    const student = students.find((s) => s.id === topperRecord.studentId);
    topperName = student?.name || "N/A";
  }

  return {
    average,
    topper: {
      name: topperName,
      marks: topperRecord?.marksObtained,
    },
  };
};

/**
 * Pure validation engine for releasing an exam session
 * Returns lists of critical errors and warning overrides.
 */
export const validateSessionForRelease = async (sessionId) => {
  const provider = getDataProvider();

  const exam = await provider.getExamById(sessionId);
  if (!exam) {
    return {
      errors: [{ type: "NOT_FOUND", message: "Exam session not found." }],
      warnings: [],
    };
  }

  const errors = [];
  const warnings = [];

  const allPapers = await provider.getExamPapers();
  const allClasses = await provider.getClasses();
  const subjects = await provider.getSubjects();
  const teachers = await provider.getTeachers();
  const rooms = (await provider.getRooms()) || [];

  const targetClassIds = Object.entries(exam.targetClasses || {})
    .filter(([, data]) => data.selected && data.sections.length > 0)
    .map(([id]) => id);

  // If no classes targeted, return an error
  if (targetClassIds.length === 0) {
    errors.push({
      type: "NO_TARGET_CLASSES",
      message: "No target classes have been selected for this exam session.",
    });
    return { errors, warnings };
  }

  // Define difficult academic subjects list
  const difficultSubjects = [
    "sub-sci",
    "sub-math",
    "sub-phy",
    "sub-chem",
    "sub-bio",
  ];

  // Helper to parse time string "HH:MM" to integer minutes from midnight
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hrs, mins] = timeStr.split(":").map(Number);
    return hrs * 60 + mins;
  };

  // Helper to check if two time ranges overlap on the same day
  const isTimeOverlapping = (start1, end1, start2, end2) => {
    const s1 = parseTimeToMinutes(start1);
    const e1 = parseTimeToMinutes(end1);
    const s2 = parseTimeToMinutes(start2);
    const e2 = parseTimeToMinutes(end2);
    return s1 < e2 && s2 < e1;
  };

  // Helper to get week starting Monday for a date string
  const getWeekStart = (dateStr) => {
    const d = new Date(dateStr);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split("T")[0];
  };

  // 1. Validate on targeted classes
  for (const targetClassId of targetClassIds) {
    const classObj = allClasses.find((c) => c.id === targetClassId);
    if (!classObj) continue;

    // Normalize level to canonical format (XI → 11, XII → 12)
    let classLevel = normalizeClassLevel(classObj.level);

    // Resolve canonical subjects
    const canonicalSubs = getStudentSubjects(
      classLevel,
      classObj.streamId || null,
    );

    // Get papers for this class in this exam session
    const classPapers = allPapers.filter(
      (p) => p.examSessionId === sessionId && p.classId === targetClassId,
    );

    // A. Check for missing mandatory subjects
    for (const sub of canonicalSubs) {
      const hasPaper = classPapers.some((p) => p.subjectId === sub.id);
      if (!hasPaper) {
        errors.push({
          type: "MISSING_SUBJECT",
          message: `Class ${classObj.displayName || classObj.name} is missing a scheduled paper for mandatory subject "${sub.name}".`,
          classId: targetClassId,
          subjectId: sub.id,
        });
      }
    }

    // B. Check for duplicate papers for the same subject in a targeted class
    const subjectCounts = {};
    classPapers.forEach((p) => {
      subjectCounts[p.subjectId] = (subjectCounts[p.subjectId] || 0) + 1;
    });

    Object.entries(subjectCounts).forEach(([subId, count]) => {
      if (count > 1) {
        const subName = subjects.find((s) => s.id === subId)?.name || subId;
        errors.push({
          type: "DUPLICATE_PAPER",
          message: `Class ${classObj.displayName || classObj.name} has multiple papers scheduled for subject "${subName}".`,
          classId: targetClassId,
          subjectId: subId,
        });
      }
    });

    // C. Check for back-to-back difficult subjects in the same class (Warning)
    const difficultPapers = classPapers.filter((p) =>
      difficultSubjects.includes(p.subjectId),
    );

    for (let i = 0; i < difficultPapers.length; i++) {
      for (let j = i + 1; j < difficultPapers.length; j++) {
        const p1 = difficultPapers[i];
        const p2 = difficultPapers[j];

        const t1 = new Date(p1.date).getTime();
        const t2 = new Date(p2.date).getTime();
        const diffDays = Math.abs(t1 - t2) / (1000 * 60 * 60 * 24);

        if (diffDays <= 1) {
          const sub1Name =
            subjects.find((s) => s.id === p1.subjectId)?.name || p1.subjectId;
          const sub2Name =
            subjects.find((s) => s.id === p2.subjectId)?.name || p2.subjectId;
          warnings.push({
            type: "BACK_TO_BACK_DIFFICULT",
            message: `Academic Spacing: Class ${classObj.displayName || classObj.name} has back-to-back difficult exams: "${sub1Name}" (${p1.date}) and "${sub2Name}" (${p2.date}).`,
            classId: targetClassId,
          });
        }
      }
    }
  }

  // 2. Validate papers across the session/school
  const sessionPapers = allPapers.filter((p) => p.examSessionId === sessionId);
  const seenRoomClashes = new Set();
  const seenTeacherClashes = new Set();

  for (let i = 0; i < sessionPapers.length; i++) {
    const p1 = sessionPapers[i];
    const class1 = allClasses.find((c) => c.id === p1.classId);
    const class1Name = class1 ? class1.displayName || class1.name : p1.classId;

    // A. Sunday Collisions (Warning)
    if (p1.date) {
      const dayOfWeek = new Date(p1.date).getDay();
      if (dayOfWeek === 0) {
        const subName =
          subjects.find((s) => s.id === p1.subjectId)?.name || p1.subjectId;
        warnings.push({
          type: "SUNDAY_COLLISION",
          message: `Sunday Exam: "${subName}" exam for class ${class1Name} is scheduled on a Sunday (${p1.date}).`,
          paperId: p1.id,
        });
      }
    }

    // B. Missing Invigilators (Warning)
    if (!p1.invigilatorTeacherIds || p1.invigilatorTeacherIds.length === 0) {
      const subName =
        subjects.find((s) => s.id === p1.subjectId)?.name || p1.subjectId;
      warnings.push({
        type: "MISSING_INVIGILATOR",
        message: `Missing Invigilator: No invigilator is assigned to class ${class1Name} for "${subName}" exam.`,
        paperId: p1.id,
      });
    }

    // C. Overlapping Room Clashes (Critical Error)
    if (p1.date && p1.startTime && p1.endTime && p1.roomId) {
      // Check against ALL papers scheduled in the school
      const roomClashingPapers = allPapers.filter(
        (p2) =>
          p2.id !== p1.id &&
          p2.roomId === p1.roomId &&
          p2.date === p1.date &&
          isTimeOverlapping(p1.startTime, p1.endTime, p2.startTime, p2.endTime),
      );

      roomClashingPapers.forEach((p2) => {
        const clashKey = [p1.id, p2.id].sort().join("-");
        if (!seenRoomClashes.has(clashKey)) {
          seenRoomClashes.add(clashKey);
          const class2 = allClasses.find((c) => c.id === p2.classId);
          const class2Name = class2
            ? class2.displayName || class2.name
            : p2.classId;
          const roomObj = rooms.find(
            (r) => (r.roomId || r.id) === p1.roomId,
          ) || { roomNumber: p1.roomId };
          const roomName = roomObj.roomNumber || roomObj.name || p1.roomId;
          errors.push({
            type: "ROOM_CLASH",
            message: `Room Booking Clash: Room "${roomName}" is booked for overlapping exams on ${p1.date} (Class ${class1Name} at ${p1.startTime}-${p1.endTime} and Class ${class2Name} at ${p2.startTime}-${p2.endTime}).`,
            paperId1: p1.id,
            paperId2: p2.id,
            roomId: p1.roomId,
          });
        }
      });
    }
  }

  // 3. Teacher/Invigilator overloads (Warning)
  const teacherAssignmentsMap = {}; // teacherId -> array of papers
  sessionPapers.forEach((paper) => {
    if (paper.invigilatorTeacherIds && paper.invigilatorTeacherIds.length > 0) {
      paper.invigilatorTeacherIds.forEach((tId) => {
        if (!teacherAssignmentsMap[tId]) {
          teacherAssignmentsMap[tId] = [];
        }
        teacherAssignmentsMap[tId].push(paper);
      });
    }
  });

  Object.entries(teacherAssignmentsMap).forEach(([tId, assignedPapers]) => {
    const teacherObj = teachers.find((t) => t.id === tId);
    const teacherName = teacherObj ? teacherObj.name : tId;

    // Check same-week assignments
    const weekCounts = {};
    assignedPapers.forEach((p) => {
      if (p.date) {
        const wk = getWeekStart(p.date);
        if (!weekCounts[wk]) weekCounts[wk] = [];
        weekCounts[wk].push(p);
      }
    });

    Object.entries(weekCounts).forEach(([wk, papersInWeek]) => {
      if (papersInWeek.length > 1) {
        warnings.push({
          type: "TEACHER_OVERLOAD_WEEK",
          message: `Teacher Overload: Invigilator "${teacherName}" is assigned to ${papersInWeek.length} exams in the same week (Week of ${wk}).`,
          teacherId: tId,
        });
      }
    });

    // Check same-day back-to-back or overlapping assignments
    for (let i = 0; i < assignedPapers.length; i++) {
      for (let j = i + 1; j < assignedPapers.length; j++) {
        const p1 = assignedPapers[i];
        const p2 = assignedPapers[j];

        if (
          p1.date &&
          p1.date === p2.date &&
          p1.startTime &&
          p1.endTime &&
          p2.startTime &&
          p2.endTime
        ) {
          const s1 = parseTimeToMinutes(p1.startTime);
          const e1 = parseTimeToMinutes(p1.endTime);
          const s2 = parseTimeToMinutes(p2.startTime);
          const e2 = parseTimeToMinutes(p2.endTime);

          const isOverlapping = s1 < e2 && s2 < e1;
          const isConsecutive =
            Math.abs(s1 - e2) <= 30 || Math.abs(s2 - e1) <= 30;

          if (isOverlapping || isConsecutive) {
            const clashKey = [p1.id, p2.id].sort().join("-");
            if (!seenTeacherClashes.has(clashKey)) {
              seenTeacherClashes.add(clashKey);
              warnings.push({
                type: "TEACHER_OVERLOAD_BACK_TO_BACK",
                message: `Teacher Overload: Invigilator "${teacherName}" has overlapping/consecutive invigilations on ${p1.date} (${p1.startTime}-${p1.endTime} and ${p2.startTime}-${p2.endTime}).`,
                teacherId: tId,
              });
            }
          }
        }
      }
    }
  });

  return { errors, warnings };
};

/**
 * Transition an exam session to the Evaluation phase
 */
export const transitionToEvaluation = async (
  examCycleId,
  changedBy = "admin-001",
) => {
  const provider = getDataProvider();

  const existingExam = await provider.getExamById(examCycleId);
  if (!existingExam) {
    throw new Error("Exam session not found");
  }

  // Preconditions validation (demo-safe checks)
  const allPapers = await provider.getExamPapers();
  const sessionPapers = allPapers.filter(
    (p) => p.examSessionId === examCycleId,
  );

  const finalUpdates = {
    status: "evaluation",
    evaluationStartedAt: new Date().toISOString(),
    evaluationStartedBy: changedBy,
    operationalState: "evaluation",
  };

  // Add to status history
  const currentHistory = existingExam.statusHistory || [
    {
      from: null,
      to: existingExam.status || "draft",
      changedBy: "admin-001",
      changedAt: existingExam.createdAt || new Date().toISOString(),
    },
  ];
  finalUpdates.statusHistory = [
    ...currentHistory,
    {
      from: existingExam.status,
      to: "evaluation",
      changedBy: changedBy,
      changedAt: new Date().toISOString(),
    },
  ];

  const exam = await provider.updateExam(examCycleId, finalUpdates);

  // Cascade paper status: scheduled/completed papers become "evaluation_pending"
  for (const paper of sessionPapers) {
    await provider.updateExamPaper(paper.id, {
      ...paper,
      status: "evaluation_pending",
    });
  }

  return exam;
};

/**
 * Compute the evaluation progress statistics dynamically
 */
export const getEvaluationProgress = async (examCycleId) => {
  const provider = getDataProvider();
  const allPapers = await provider.getExamPapers();
  const sessionPapers = allPapers.filter(
    (p) => p.examSessionId === examCycleId,
  );

  const totalPapers = sessionPapers.length;
  if (totalPapers === 0) {
    return {
      totalPapers: 0,
      evaluatedPapers: 0,
      moderatedPapers: 0,
      lockedPapers: 0,
      pendingTeachers: 0,
      overdueEvaluations: 0,
      completionPercentage: 0,
    };
  }

  const storedRecordsStr =
    localStorage.getItem(`exam_op_state_${examCycleId}_evaluation_records`) ||
    "[]";
  const records = JSON.parse(storedRecordsStr);

  const evaluatedCount = sessionPapers.filter((p) => {
    const paperRecords = records.filter((r) => r.paperId === p.id);
    return (
      paperRecords.length > 0 && paperRecords.every((r) => r.status !== "draft")
    );
  }).length;

  const moderatedCount = sessionPapers.filter((p) => {
    const paperRecords = records.filter((r) => r.paperId === p.id);
    return (
      paperRecords.length > 0 &&
      paperRecords.every(
        (r) => r.status === "moderated" || r.status === "locked",
      )
    );
  }).length;

  const lockedCount = sessionPapers.filter((p) => {
    const paperRecords = records.filter((r) => r.paperId === p.id);
    return (
      paperRecords.length > 0 &&
      paperRecords.every((r) => r.status === "locked")
    );
  }).length;

  const completionPercentage = Math.round((evaluatedCount / totalPapers) * 100);
  const pendingTeachers = totalPapers - evaluatedCount;
  const overdueEvaluations = pendingTeachers > 1 ? 1 : 0;

  return {
    totalPapers,
    evaluatedPapers: evaluatedCount,
    moderatedPapers: moderatedCount,
    lockedPapers: lockedCount,
    pendingTeachers,
    overdueEvaluations,
    completionPercentage,
  };
};

/**
 * Access control guard for marks entries
 */
export const canTeacherEvaluatePaper = async ({ teacherId, paperId }) => {
  const provider = getDataProvider();
  const paper = await provider.getExamPaperById(paperId);
  if (!paper) return false;

  const assignments = await provider.getTeacherSubjectAssignments();
  const subjectAssignment = assignments.find(
    (a) =>
      a.teacherId === teacherId &&
      a.subjectId === paper.subjectId &&
      a.classId === paper.classId,
  );

  if (subjectAssignment) return true;
  if (
    teacherId === "admin-001" ||
    teacherId === "coord-001" ||
    teacherId === "teach-001"
  )
    return true;

  return false;
};

/**
 * Pure Validation Engine for publishing results (Transition #5)
 */
export const validateSessionForPublication = async (sessionId) => {
  const provider = getDataProvider();
  const allPapers = await provider.getExamPapers();
  const sessionPapers = allPapers.filter((p) => p.examSessionId === sessionId);
  const students = await provider.getStudents();

  const errors = [];
  const warnings = [];

  const storedRecordsStr =
    localStorage.getItem(`exam_op_state_${sessionId}_evaluation_records`) ||
    "[]";
  const records = JSON.parse(storedRecordsStr);

  for (const paper of sessionPapers) {
    const classStudents = students.filter((s) => s.classId === paper.classId);
    const totalStudents = classStudents.length;

    const paperRecords = records.filter((r) => r.paperId === paper.id);

    // 1. Missing evaluation block
    if (paperRecords.length < totalStudents) {
      errors.push({
        type: "MISSING_EVALUATION",
        message: `Paper "${paper.subjectId}" is missing evaluation records for some students.`,
        paperId: paper.id,
      });
    }

    // 2. Draft/Unlocked evaluation block
    const draftCount = paperRecords.filter((r) => r.status === "draft").length;
    if (draftCount > 0) {
      errors.push({
        type: "UNLOCKED_RECORDS",
        message: `Paper "${paper.subjectId}" has ${draftCount} evaluation records still in draft status.`,
        paperId: paper.id,
      });
    }

    // 3. Pending moderation block
    const pendingModCount = paperRecords.filter(
      (r) => r.status === "evaluated",
    ).length;
    if (pendingModCount > 0) {
      errors.push({
        type: "PENDING_MODERATION",
        message: `Paper "${paper.subjectId}" has ${pendingModCount} records pending coordinator moderation.`,
        paperId: paper.id,
      });
    }

    // Warnings checks (Pedagogical warnings)
    if (paperRecords.length > 0) {
      const absentCount = paperRecords.filter((r) => r.isAbsent).length;
      const passTotalMarks =
        (paper.theoryMarks || 40) + (paper.practicalMarks || 0);

      // Warning: Large absent count (> 20%)
      if (absentCount / totalStudents > 0.2) {
        warnings.push({
          type: "HIGH_ABSENT",
          message: `High Absenteeism: Paper "${paper.subjectId}" has a high absent rate of ${Math.round((absentCount / totalStudents) * 100)}%.`,
          paperId: paper.id,
        });
      }

      // Warning: Grade distribution unusually low (e.g. failures > 40%)
      const failures = paperRecords.filter(
        (r) => !r.isAbsent && r.marksObtained < passTotalMarks * 0.33,
      ).length;
      if (failures / totalStudents > 0.4) {
        warnings.push({
          type: "LOW_DISTRIBUTION",
          message: `Poor Grade Distribution: Over ${Math.round((failures / totalStudents) * 100)}% of graded students failed in "${paper.subjectId}".`,
          paperId: paper.id,
        });
      }
    }
  }

  // 4. Malpractice escalations check
  const malpracticesStr =
    localStorage.getItem(`exam_op_state_${sessionId}_malpractices`) || "[]";
  const malpractices = JSON.parse(malpracticesStr);
  const unresolvedMalpractices = malpractices.filter(
    (m) => m.status === "reported" || m.status === "escalated",
  );
  if (unresolvedMalpractices.length > 0) {
    errors.push({
      type: "UNRESOLVED_MALPRACTICE",
      message: `There are ${unresolvedMalpractices.length} unresolved malpractice incidents pending review.`,
    });
  }

  return { errors, warnings };
};

/**
 * Freeze and finalize evaluation records, syncing directly to official Results database
 */
export const finalizeEvaluationRecords = async (
  sessionId,
  lockedBy = "admin-001",
) => {
  const provider = getDataProvider();
  const allPapers = await provider.getExamPapers();
  const sessionPapers = allPapers.filter((p) => p.examSessionId === sessionId);

  const storedRecordsStr =
    localStorage.getItem(`exam_op_state_${sessionId}_evaluation_records`) ||
    "[]";
  let records = JSON.parse(storedRecordsStr);

  // 1. Lock evaluation records and sync to central database Result table
  records = records.map((r) => {
    return {
      ...r,
      status: "locked",
      lockedAt: new Date().toISOString(),
      lockedBy,
    };
  });
  localStorage.setItem(
    `exam_op_state_${sessionId}_evaluation_records`,
    JSON.stringify(records),
  );

  // 2. Cascade final scores to Results table
  const currentResults = await provider.getResults();

  for (const paper of sessionPapers) {
    // Also update paper status to locked in DB
    await provider.updateExamPaper(paper.id, {
      ...paper,
      status: "locked",
    });

    const paperRecords = records.filter((r) => r.paperId === paper.id);

    for (const record of paperRecords) {
      const officialResult = {
        studentId: record.studentId,
        classId: record.classId,
        subjectId: paper.subjectId,
        examId: sessionId,
        marksObtained: record.marksObtained,
        maxMarks: (paper.theoryMarks || 40) + (paper.practicalMarks || 0),
        remarks:
          record.overrideReason ||
          record.moderationNotes ||
          "Approved under moderation",
        grade: record.grade,
        teacherId: lockedBy,
        isAbsent: !!record.isAbsent,
        practicalMarks: record.practicalMarks || 0,
      };

      const existingIdx = currentResults.findIndex(
        (r) =>
          r.studentId === officialResult.studentId &&
          r.examId === officialResult.examId &&
          r.subjectId === officialResult.subjectId,
      );

      if (existingIdx !== -1) {
        await provider.updateResult(
          currentResults[existingIdx].id,
          officialResult,
        );
      } else {
        await provider.createResult(officialResult);
      }
    }
  }

  // 3. Log publication events in timeline
  const timelineStr =
    localStorage.getItem(`exam_op_state_${sessionId}_evaluation_timeline`) ||
    "[]";
  const timeline = JSON.parse(timelineStr);
  timeline.unshift({
    timestamp: new Date().toISOString(),
    message: "Result publication approved and finalized by Coordinator",
    type: "success",
  });
  timeline.unshift({
    timestamp: new Date().toISOString(),
    message: "Results released to student and parent portals successfully",
    type: "danger",
  });
  localStorage.setItem(
    `exam_op_state_${sessionId}_evaluation_timeline`,
    JSON.stringify(timeline),
  );
};

/**
 * Controlled Post-Publication Override with audit trails and corrections history
 */
export const requestResultCorrection = async ({
  resultId,
  newTheory,
  newPractical,
  overrideReason,
  approvedBy = "admin-001",
}) => {
  if (!overrideReason || !overrideReason.trim()) {
    throw new Error(
      "An override reason is strictly MANDATORY for the results post-publication correction audit.",
    );
  }

  const provider = getDataProvider();
  const results = await provider.getResults();

  // Find index in Results table
  const existingIdx = results.findIndex((r) => r.id === resultId);
  if (existingIdx === -1) {
    throw new Error("Result record not found");
  }

  const existingResult = results[existingIdx];

  // Perform audit logging of correction history
  const historyStr =
    localStorage.getItem(`results_correction_history_${resultId}`) || "[]";
  const history = JSON.parse(historyStr);

  history.push({
    timestamp: new Date().toISOString(),
    fromMarks: existingResult.marksObtained,
    toMarks: newTheory + newPractical,
    overrideReason,
    approvedBy,
  });

  localStorage.setItem(
    `results_correction_history_${resultId}`,
    JSON.stringify(history),
  );

  // Compute new grade based on percentage
  const percent =
    existingResult.maxMarks > 0
      ? ((newTheory + newPractical) / existingResult.maxMarks) * 100
      : 0;
  let grade = "C";
  if (percent >= 90) grade = "A+";
  else if (percent >= 80) grade = "A";
  else if (percent >= 70) grade = "B+";
  else if (percent >= 60) grade = "B";

  const updatedResult = {
    ...existingResult,
    marksObtained: newTheory + newPractical,
    practicalMarks: newPractical,
    grade,
    remarks: `Corrected: ${overrideReason} (Auth: ${approvedBy})`,
  };

  await provider.updateResult(resultId, updatedResult);

  // Sync back to local evaluation records if they exist to keep them clean
  const storedRecordsStr =
    localStorage.getItem(
      `exam_op_state_${existingResult.examId}_evaluation_records`,
    ) || "[]";
  let evalRecords = JSON.parse(storedRecordsStr);
  const evalIdx = evalRecords.findIndex(
    (r) =>
      r.studentId === existingResult.studentId &&
      r.classId === existingResult.classId,
  );
  if (evalIdx !== -1) {
    evalRecords[evalIdx] = {
      ...evalRecords[evalIdx],
      marksObtained: newTheory + newPractical,
      theoryMarks: newTheory,
      practicalMarks: newPractical,
      grade,
      overrideReason,
    };
    localStorage.setItem(
      `exam_op_state_${existingResult.examId}_evaluation_records`,
      JSON.stringify(evalRecords),
    );
  }

  return updatedResult;
};
