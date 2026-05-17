import { MockDB } from "../mockDB";
import { getSubjectsForStudent } from "./academicsService";

/**
 * Fetches all examination definitions
 */
export const getExams = async () => {
  return MockDB.exams.all();
};

/**
 * Fetches exam schedules and details (Relational)
 */
export const getExamData = async (studentId) => {
  const student = await MockDB.students.findById(studentId);
  const rollNo = student ? `R-${student.admissionNo}` : 'R-2024001';
  const exams = await MockDB.exams.all();
  const studentSubjects = await getSubjectsForStudent(studentId);

  const baseDates = [
    { date: "18 Jul", day: "Friday" },
    { date: "21 Jul", day: "Monday" },
    { date: "23 Jul", day: "Wednesday" },
    { date: "25 Jul", day: "Friday" },
    { date: "28 Jul", day: "Monday" },
    { date: "30 Jul", day: "Wednesday" }
  ];

  const schedule = studentSubjects.map((sub, idx) => {
    const d = baseDates[idx % baseDates.length];
    let room = "Examination Hall A";
    let time = "09:00 AM - 12:00 PM";
    
    // Core science subjects practical exam simulation
    const isScienceCore = sub.id === "sub-phy" || sub.id === "sub-chem" || sub.id === "sub-bio" || sub.id === "sub-cs";
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
      room: room
    };
  });
  
  return {
    activeExams: exams.filter(e => new Date(e.startDate) <= new Date()),
    upcomingExams: exams.filter(e => new Date(e.startDate) > new Date()),
    guidelines: [
      "Admit card is mandatory.",
      "Arrive 30 mins before start time."
    ],
    admitCard: {
      examName: "Half-Yearly Examination 2025",
      issued: true,
      rollNo: rollNo,
      examCenter: "Springdale Senior Secondary School, Main Campus",
      reportingTime: "08:30 AM",
      examDates: "18th July - 28th July 2025"
    },
    schedule,
    instructions: [
      "Candidates must carry a physical copy of their Admit Card to the examination hall.",
      "Banned items include mobile phones, calculators, smartwatches, and loose paper sheets.",
      "Candidates must report to the examination center at least 30 minutes before the scheduled time.",
      "A grace period of 15 minutes is allowed, post which no student will be permitted to enter the hall.",
      "Do not write anything on the question paper or admit card during the examination."
    ]
  };
};

/**
 * Fetches results for a student
 */
export const getStudentResults = async (studentId) => {
  const results = await MockDB.results.find({ studentId });
  // Resolve subject and exam names
  return Promise.all(results.map(async (res) => {
    const subject = await MockDB.subjects.findById(res.subjectId);
    const exam = await MockDB.exams.findById(res.examId);
    return {
      ...res,
      subjectName: subject?.name,
      examName: exam?.name
    };
  }));
};
/**
 * Fetches academic analytics for a student
 */
export const getStudentAnalytics = async (studentId) => {
  const weakAreas = MockDB.helpers.getStudentWeakAreas(studentId);
  const resolvedWeakAreas = await Promise.all(weakAreas.map(async (wa) => {
    const subject = await MockDB.subjects.findById(wa.subjectId);
    return { ...wa, subjectName: subject?.name };
  }));

  return {
    weakAreas: resolvedWeakAreas,
    // Add more analytics as needed
  };
};

/**
 * Fetches class-wide analytics for a specific exam/subject
 */
export const getClassAnalytics = async (classId, subjectId, examId) => {
  const average = MockDB.helpers.getClassAverage(classId, subjectId, examId);
  const topperRecord = MockDB.helpers.getTopper(classId, subjectId, examId);
  
  let topperName = 'N/A';
  if (topperRecord) {
    const student = await MockDB.students.findById(topperRecord.studentId);
    topperName = student?.name;
  }

  return {
    average,
    topper: {
      name: topperName,
      marks: topperRecord?.marksObtained
    }
  };
};
