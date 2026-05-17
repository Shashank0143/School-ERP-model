import { MockDB } from "../mockDB";

/**
 * academicsService.js
 * Centralized service for academic data resolution.
 * All modules (Attendance, Assignments, Marks) must use these functions.
 */

/**
 * Resolves the academic subjects for a specific student based on their stream.
 * This is the SINGLE SOURCE OF TRUTH for a student's subjects.
 */
export const getSubjectsForStudent = async (studentId) => {
  const student = await MockDB.students.findById(studentId);
  if (!student || !student.streamId) return [];

  const stream = await MockDB.streams.findById(student.streamId);
  if (!stream) return [];

  const allSubjects = await MockDB.subjects.all();
  return allSubjects.filter(sub => stream.subjectIds.includes(sub.id));
};

/**
 * Fetches all courses for the current student (Alias for getSubjectsForStudent)
 */
export const getCourses = async (studentId = 'stud-001') => {
  return getSubjectsForStudent(studentId);
};

/**
 * Fetches the timetable for a specific student, filtered by their academic subjects.
 */
export const getTimetable = async (studentId = 'stud-001') => {
  const student = await MockDB.students.findById(studentId);
  const studentSubjects = await getSubjectsForStudent(studentId);
  if (!student || studentSubjects.length === 0) {
    return { today: [], weekly: {} };
  }

  // 7 period slots per day with one Lunch Break
  const slots = [
    { time: "08:00 AM", startTime: "08:00 AM", endTime: "08:50 AM", isBreak: false },
    { time: "09:00 AM", startTime: "09:00 AM", endTime: "09:50 AM", isBreak: false },
    { time: "10:00 AM", startTime: "10:00 AM", endTime: "10:50 AM", isBreak: false },
    { time: "11:00 AM", startTime: "11:00 AM", endTime: "11:50 AM", isBreak: false },
    { time: "11:50 AM", startTime: "11:50 AM", endTime: "12:40 PM", isBreak: true, label: "Lunch Break" },
    { time: "12:40 PM", startTime: "12:40 PM", endTime: "01:30 PM", isBreak: false },
    { time: "01:30 PM", startTime: "01:30 PM", endTime: "02:20 PM", isBreak: false },
    { time: "02:20 PM", startTime: "02:20 PM", endTime: "03:10 PM", isBreak: false }
  ];

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const weekly = {};

  days.forEach((day, dayIdx) => {
    let daySubjects = [];
    let subIdx = dayIdx; // rotate starting index per day for realistic scheduling

    slots.forEach((slot, slotIdx) => {
      if (slot.isBreak) {
        daySubjects.push({
          id: `${day}-${slotIdx}-break`,
          subject: slot.label,
          startTime: slot.startTime,
          endTime: slot.endTime,
          room: "Cafeteria / Courtyard",
          teacher: "Duty Staff",
          code: "BREAK",
          isBreak: true
        });
      } else {
        const sub = studentSubjects[(subIdx++) % studentSubjects.length];
        
        // Practical/lab logic for Science streams on Wed/Fri
        let isPractical = false;
        let room = sub.room || "Room 101";
        if ((day === "Wednesday" || day === "Friday") && 
            (sub.id === "sub-phy" || sub.id === "sub-chem" || sub.id === "sub-bio" || sub.id === "sub-cs")) {
          isPractical = true;
          room = sub.id === "sub-phy" ? "Physics Lab 1" : 
                 sub.id === "sub-chem" ? "Chemistry Lab 2" : 
                 sub.id === "sub-bio" ? "Biology Lab 3" : "Computer Lab A";
        }

        daySubjects.push({
          id: `${day}-${slotIdx}`,
          subject: sub.name + (isPractical ? " (Practical)" : ""),
          startTime: slot.startTime,
          endTime: slot.endTime,
          room: room,
          teacher: sub.teachers?.[0] || "Faculty",
          code: sub.code || "SUB-00",
          isBreak: false
        });
      }
    });

    weekly[day] = daySubjects;
  });

  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayTimetable = weekly[todayName] || weekly.Monday;

  return {
    today: todayTimetable,
    weekly: weekly
  };
};

/**
 * Fetches curriculum details for a specific subject (Derived from Subject entity)
 */
const subjectCurriculums = {
  'sub-phy': {
    objectives: [
      "Analyze the fundamental principles of classical mechanics.",
      "Understand the laws of thermodynamics and heat transfer.",
      "Explore wave optics and physical optics principles.",
      "Conduct and analyze physics laboratory experiments with precision."
    ],
    curriculum: [
      { unit: "Unit I: Physical World & Measurement", topics: "Units, dimensional analysis, error estimation and precision measurements." },
      { unit: "Unit II: Kinematics & Laws of Motion", topics: "Vectors, motion in a plane, Newton's Laws, friction, circular motion." },
      { unit: "Unit III: Work, Energy & Power", topics: "Kinetic and potential energy, work-energy theorem, elastic and inelastic collisions." },
      { unit: "Unit IV: Thermodynamics", topics: "Thermal equilibrium, Zeroth, First, and Second laws of thermodynamics, heat engines." }
    ],
    outcomes: [
      "Ability to solve complex multi-step physics mechanics problems.",
      "Understanding the mathematical representations of physical laws.",
      "Practical competence in analyzing experimental deviations."
    ],
    textbooks: [
      { type: "main", title: "Concepts of Physics - Vol I", author: "Dr. H.C. Verma" },
      { type: "reference", title: "Fundamentals of Physics", author: "Halliday & Resnick" }
    ]
  },
  'sub-chem': {
    objectives: [
      "Understand atomic structure and chemical bonding principles.",
      "Master the laws of stoichiometry and chemical reactions.",
      "Perform organic chemical reaction mechanisms analysis.",
      "Observe molecular interactions in laboratory environments."
    ],
    curriculum: [
      { unit: "Unit I: Basic Concepts & Structure", topics: "Significant figures, atomic mass, mole concept, stoichiometry." },
      { unit: "Unit II: Classification of Elements", topics: "Periodic table trends, ionization enthalpy, electronegativity, atomic radii." },
      { unit: "Unit III: Chemical Bonding", topics: "Ionic and covalent bonds, Lewis structure, VSEPR theory, hybridization." },
      { unit: "Unit IV: Organic Chemistry Basics", topics: "IUPAC nomenclature, inductive effect, resonance, electrophilic substitution." }
    ],
    outcomes: [
      "Competency in balancing complex equations and calculating mole yields.",
      "Ability to predict molecular geometries using VSEPR.",
      "Understanding organic reaction mechanisms."
    ],
    textbooks: [
      { type: "main", title: "Modern Approach to Chemical Calculations", author: "R.C. Mukherjee" },
      { type: "reference", title: "Organic Chemistry", author: "Morrison & Boyd" }
    ]
  },
  'sub-math': {
    objectives: [
      "Apply calculus principles including limits, derivatives, and integrations.",
      "Formulate and solve algebraic and trigonometric systems.",
      "Master vector algebra and three-dimensional geometries.",
      "Model real-world scenarios using probability distributions."
    ],
    curriculum: [
      { unit: "Unit I: Sets, Relations & Functions", topics: "Types of sets, Cartesian products, equivalence relations, injective/surjective functions." },
      { unit: "Unit II: Trigonometry & Complex Numbers", topics: "Trigonometric identities, polar form of complex numbers, De Moivre's theorem." },
      { unit: "Unit III: Calculus Foundations", topics: "Limits and continuity, derivatives, tangents and normals, basic integration rules." },
      { unit: "Unit IV: Linear Programming", topics: "Graphical solution of linear inequalities, objective functions, optimization." }
    ],
    outcomes: [
      "Ability to take limits and calculate derivatives of complex algebraic functions.",
      "Competency in solving linear programming optimization problems.",
      "Strong conceptual grasp of trigonometric transformations."
    ],
    textbooks: [
      { type: "main", title: "Mathematics for Class XI", author: "Dr. R.D. Sharma" },
      { type: "reference", title: "Higher Algebra", author: "Hall & Knight" }
    ]
  },
  'sub-cs': {
    objectives: [
      "Design algorithms and write clean, structured Python code.",
      "Apply fundamental object-oriented programming concepts.",
      "Utilize dynamic data structures such as lists, stacks, and queues.",
      "Understand database connectivity and structured queries (SQL)."
    ],
    curriculum: [
      { unit: "Unit I: Computational Thinking", topics: "Problem-solving methodologies, flowcharts, pseudocode, execution speeds." },
      { unit: "Unit II: Core Python Programming", topics: "Data types, control flow, functions, file handling (text, CSV, binary)." },
      { unit: "Unit III: Data Structures", topics: "List operations, linear search, binary search, stacks implementation." },
      { unit: "Unit IV: Databases & SQL", topics: "Relational database concepts, primary/foreign keys, SELECT queries, JOINs." }
    ],
    outcomes: [
      "Ability to implement computational algorithms in Python.",
      "Hands-on competency in managing text and binary files.",
      "Writing optimized relational database queries."
    ],
    textbooks: [
      { type: "main", title: "Computer Science with Python", author: "Preeti Arora" },
      { type: "reference", title: "Python Programming: An Introduction", author: "John Zelle" }
    ]
  },
  'sub-eng': {
    objectives: [
      "Analyze literary devices and themes in prose and poetry.",
      "Improve formal written communication and report writing.",
      "Refine reading comprehension and critical analytical listening.",
      "Produce structured persuasive essays and formal letters."
    ],
    curriculum: [
      { unit: "Unit I: Literature & Reading", topics: "Hornbill & Snapshots prose studies, poetry analysis, comprehension passages." },
      { unit: "Unit II: Writing Skills", topics: "Notice writing, formal letter writing, poster making, report drafting." },
      { unit: "Unit III: Grammar & Syntax", topics: "Tenses, active/passive voice, reordering sentences, error correction." },
      { unit: "Unit IV: Creative Essay Writing", topics: "Argumentative essays, descriptive reports, narrative writing." }
    ],
    outcomes: [
      "Strong mastery of formal business correspondence format.",
      "Critical literary appreciation of diverse English prose styles.",
      "Advanced conversational and written grammatical precision."
    ],
    textbooks: [
      { type: "main", title: "Hornbill: Textbook in English", author: "NCERT Editorial Board" },
      { type: "reference", title: "High School English Grammar & Composition", author: "Wren & Martin" }
    ]
  },
  'sub-acc': {
    objectives: [
      "Understand the double-entry bookkeeping system.",
      "Journalize business transactions and post them to ledgers.",
      "Prepare dynamic balance sheets and financial statements.",
      "Analyze depreciation policies and bank reconciliations."
    ],
    curriculum: [
      { unit: "Unit I: Theoretical Framework", topics: "Accounting principles, double-entry concept, accounting standards." },
      { unit: "Unit II: Recording Transactions", topics: "Journal entries, cash book, ledger posting, trial balance preparation." },
      { unit: "Unit III: Financial Statements", topics: "Trading account, Profit & Loss statement, Balance Sheet with adjustments." },
      { unit: "Unit IV: Depreciation & Provisions", topics: "Straight-line method, written-down value method, provisions." }
    ],
    outcomes: [
      "Proficiency in balancing complex double-entry ledger accounts.",
      "Ability to compile corporate trading and profit/loss statements.",
      "Understanding audit trails and transaction reconciliations."
    ],
    textbooks: [
      { type: "main", title: "Double Entry Book Keeping", author: "T.S. Grewal" },
      { type: "reference", title: "Financial Accounting", author: "D.K. Goel" }
    ]
  }
};

const getDetailsForSubject = (subject) => {
  const custom = subjectCurriculums[subject.id];
  if (custom) return custom;

  const name = subject.name;
  return {
    objectives: [
      `Develop a deep understanding of core concepts in ${name}.`,
      `Apply theoretical knowledge of ${name} to practical scenarios.`,
      `Engage in critical analysis of contemporary topics in ${name}.`,
      `Utilize research methodologies and textbooks to master ${name}.`
    ],
    curriculum: [
      { unit: "Unit I: Foundations", topics: `Introduction to ${name}, basic paradigms, historical context.` },
      { unit: "Unit II: Core Frameworks", topics: `Theoretical models, structural elements, practical methodologies.` },
      { unit: "Unit III: Applied Methodologies", topics: `Case studies, operational workflows, systems analysis.` },
      { unit: "Unit IV: Advanced Seminars", topics: `Future trends, synthesis of concepts, experimental reviews.` }
    ],
    outcomes: [
      `Comprehensive conceptual mastery of ${name} principles.`,
      `Strong analytical problem-solving skills inside ${name}.`,
      `Ability to present structured academic reports on ${name}.`
    ],
    textbooks: [
      { type: "main", title: `Textbook of ${name} for Class XI`, author: "Academic Board" },
      { type: "reference", title: `Comprehensive Guide to ${name}`, author: "Dr. A.K. Sharma" }
    ]
  };
};

export const getSubjectCurriculum = async (subjectId) => {
  const subject = await MockDB.subjects.findById(subjectId);
  if (!subject) return null;

  const details = getDetailsForSubject(subject);

  return {
    title: subject.name,
    code: subject.code,
    classLevel: "Class 11",
    academicSession: "2024-25",
    teacher: subject.teachers?.[0] || "Faculty",
    description: subject.description,
    overview: subject.description,
    objectives: details.objectives,
    curriculum: details.curriculum,
    outcomes: details.outcomes,
    textbooks: details.textbooks
  };
};

/**
 * Fetches all academic subjects available in the ERP
 */
export const getSubjects = async () => {
  return MockDB.subjects.all();
};
