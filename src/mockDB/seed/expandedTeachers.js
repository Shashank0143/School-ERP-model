/**
 * Expanded Teachers Seed Data
 *
 * Generates realistic Indian K-12 teacher workforce following specialization rules.
 * Teachers are generated WITHOUT workload projections (assignedClasses, assignedSections, etc.).
 * Workload is derived relationally based on class subject requirements and deterministic assignments.
 */

import { deriveEligibleStages } from "../../data/academicStages.js";

const SECTIONS = ["A", "B", "C", "D"];

// Indian names for realistic teacher data
const indianFirstNames = {
  female: [
    "Priya",
    "Anita",
    "Sunita",
    "Kavita",
    "Meena",
    "Rekha",
    "Savita",
    "Lakshmi",
    "Sarita",
    "Geeta",
    "Seema",
    "Neeta",
    "Deepa",
    "Suman",
    "Anjali",
    "Pooja",
    "Ritu",
    "Neha",
    "Shweta",
    "Divya",
    "Kiran",
    "Rashmi",
    "Sangeeta",
    "Archana",
  ],
  male: [
    "Rajesh",
    "Suresh",
    "Ramesh",
    "Mahesh",
    "Amit",
    "Vikram",
    "Rahul",
    "Arun",
    "Sanjay",
    "Vijay",
    "Ajay",
    "Sunil",
    "Anil",
    "Ravi",
    "Deepak",
    "Pradeep",
    "Prakash",
    "Dinesh",
    "Mukesh",
    "Rakesh",
    "Naresh",
    "Harish",
    "Rajiv",
    "Srikant",
  ],
};

const indianLastNames = [
  "Sharma",
  "Verma",
  "Gupta",
  "Singh",
  "Kumar",
  "Patel",
  "Reddy",
  "Iyer",
  "Nair",
  "Menon",
  "Das",
  "Bose",
  "Mukherjee",
  "Chatterjee",
  "Sengupta",
  "Rao",
  "Naidu",
  "Pillai",
  "Shetty",
  "Bhat",
  "Kulkarni",
  "Desai",
  "Mehta",
  "Shah",
  "Jain",
  "Agarwal",
  "Goel",
  "Malhotra",
  "Khanna",
  "Saxena",
];

const designations = {
  foundation: "Primary Teacher",
  primary: "Junior Teacher",
  middle: "Trained Graduate Teacher (TGT)",
  secondary: "Post Graduate Teacher (PGT)",
  senior: "Senior PGT",
};

const departments = {
  foundation: "Foundation Stage",
  primary: "Primary School",
  middle: "Middle School",
  secondary: "Secondary School",
  senior: "Senior Secondary",
};

const generateTeacherId = (index) =>
  `teach-${String(index + 1).padStart(3, "0")}`;
const generateEmployeeId = (index) =>
  `EMP${String(index + 1).padStart(3, "0")}`;
const generatePhone = (base) => `+91 98765 ${String(base).padStart(5, "0")}`;
const generateEmail = (name) => {
  const [firstName, lastName] = name.toLowerCase().split(" ");
  return `${firstName}.${lastName}@school.edu`;
};

const cbseTeachers = [
  {
    id: "teach-001",
    name: "Dr. Sarah Wilson",
    specializationSubjectId: "sub-phy",
    designation: "Senior PGT",
    department: "Science",
    phoneNumber: "+91 98765 43001",
    email: "sarah.wilson@school.edu",
    emergencyContact: "+91 98765 54001",
    address: "12, Vasant Kunj, New Delhi, India",
    dob: "1972-08-15",
    gender: "Female",
    qualification: "Ph.D. in Physics, M.Sc., B.Ed.",
    experience: "18 Years of Physics Teaching",
    certifications: "CBSE Physics Examiner, Science Fair Judge",
    subjectSpecialization: "Mechanics, Thermodynamics, Optics, Modern Physics",
    joiningDate: "2008-07-01",
    committeeMembership:
      "Science Club, Lab Safety Committee, School Advisory Board",
    teacherType: "SPECIALIZED",
  },
  {
    id: "teach-002",
    name: "Mrs. Priya Nair",
    specializationSubjectId: "sub-bio",
    designation: "Senior PGT",
    department: "Science",
    phoneNumber: "+91 98765 43002",
    email: "priya.nair@school.edu",
    emergencyContact: "+91 98765 54002",
    address: "45, Saket, New Delhi, India",
    dob: "1978-04-20",
    gender: "Female",
    qualification: "M.Sc. in Botany, B.Ed.",
    experience: "12 Years of Biology Teaching",
    certifications: "Biology Olympiad Trainer, Eco Club Coordinator",
    subjectSpecialization: "Cell Biology, Genetics, Human Anatomy, Ecology",
    joiningDate: "2014-07-01",
    committeeMembership: "Eco Club, Biology Society",
    teacherType: "SPECIALIZED",
  },
  {
    id: "teach-003",
    name: "Mrs. Elena Gilbert",
    specializationSubjectId: "sub-eng",
    designation: "Senior PGT",
    department: "Languages",
    phoneNumber: "+91 98765 43003",
    email: "elena.gilbert@school.edu",
    emergencyContact: "+91 98765 54003",
    address: "78, Civil Lines, New Delhi, India",
    dob: "1980-11-12",
    gender: "Female",
    qualification: "M.A. in English, B.Ed. with NET",
    experience: "10 Years of English Teaching",
    certifications: "CBSE English Examiner, Creative Writing Workshop",
    subjectSpecialization: "English Literature, Grammar, Communication Skills",
    joiningDate: "2016-07-01",
    committeeMembership: "Literary Society, School Magazine Editorial Board",
    teacherType: "SPECIALIZED",
  },
  {
    id: "teach-004",
    name: "Mr. Kiran Desai",
    specializationSubjectId: "sub-his",
    designation: "Senior PGT",
    department: "Humanities",
    phoneNumber: "+91 98765 43004",
    email: "kiran.desai@school.edu",
    emergencyContact: "+91 98765 54004",
    address: "15, Chandni Chowk, New Delhi, India",
    dob: "1975-02-28",
    gender: "Male",
    qualification: "M.A. in History, B.Ed.",
    experience: "15 Years of History Teaching",
    certifications: "Humanities Workshop, MUN Coordinator",
    subjectSpecialization:
      "Ancient History, Modern Indian History, World History",
    joiningDate: "2010-07-01",
    committeeMembership: "Debate Club, Heritage Club",
    teacherType: "SPECIALIZED",
  },
  {
    id: "teach-005",
    name: "Mr. Rajesh Sharma",
    specializationSubjectId: "act-games",
    designation: "Activity Teacher",
    department: "Physical Education",
    phoneNumber: "+91 98765 43005",
    email: "rajesh.sharma@school.edu",
    emergencyContact: "+91 98765 54005",
    address: "9, Sports Ground Road, New Delhi, India",
    dob: "1982-06-18",
    gender: "Male",
    qualification: "M.P.Ed, B.P.Ed",
    experience: "10 Years of Physical Education Teaching",
    certifications: "National Level Athletics Coach",
    subjectSpecialization: "Physical Education, Sports Training, Athletics",
    joiningDate: "2016-07-01",
    committeeMembership:
      "Sports Committee Coordinator, Annual Sports Day In-charge",
    teacherType: "ACTIVITY",
  },
  {
    id: "teach-006",
    name: "Dr. Ananya Gupta",
    specializationSubjectId: "sub-chem",
    designation: "Senior PGT",
    department: "Science",
    phoneNumber: "+91 98765 43006",
    email: "ananya.gupta@school.edu",
    emergencyContact: "+91 98765 54006",
    address: "88, Greater Kailash, New Delhi, India",
    dob: "1976-09-05",
    gender: "Female",
    qualification: "Ph.D. in Chemistry, M.Sc., B.Ed.",
    experience: "14 Years of Chemistry Teaching",
    certifications: "Chemistry Lab In-charge, CSIR NET Qualified",
    subjectSpecialization:
      "Organic Chemistry, Physical Chemistry, Inorganic Chemistry",
    joiningDate: "2012-07-01",
    committeeMembership: "Chemistry Club, Lab Management Committee",
    teacherType: "SPECIALIZED",
  },
  {
    id: "teach-007",
    name: "Mr. Vikram Singh",
    specializationSubjectId: "sub-math",
    designation: "Senior PGT",
    department: "Mathematics",
    phoneNumber: "+91 98765 43007",
    email: "vikram.singh@school.edu",
    emergencyContact: "+91 98765 54007",
    address: "56, Rajendra Nagar, New Delhi, India",
    dob: "1974-12-01",
    gender: "Male",
    qualification: "M.Sc. in Mathematics, B.Ed. with NET",
    experience: "16 Years of Mathematics Teaching",
    certifications: "Ramanujan Math Society Member, IMO Training In-charge",
    subjectSpecialization: "Algebra, Geometry, Calculus, Trigonometry",
    joiningDate: "2010-07-01",
    committeeMembership: "Mathematics Club, Olympiad Training Cell",
    teacherType: "SPECIALIZED",
  },
  {
    id: "teach-008",
    name: "Mrs. Priya Malhotra",
    specializationSubjectId: "sub-acc",
    designation: "Senior PGT",
    department: "Commerce",
    phoneNumber: "+91 98765 43008",
    email: "priya.malhotra@school.edu",
    emergencyContact: "+91 98765 54008",
    address: "34, Connaught Place, New Delhi, India",
    dob: "1979-05-14",
    gender: "Female",
    qualification: "M.Com, CA Inter, B.Ed.",
    experience: "11 Years of Accountancy Teaching",
    certifications: "CA Foundation Trainer, Commerce Workshop Certified",
    subjectSpecialization:
      "Corporate Accounting, Financial Statements, Auditing",
    joiningDate: "2015-07-01",
    committeeMembership: "Commerce Club, Entrepreneurship Cell",
    teacherType: "SPECIALIZED",
  },
  {
    id: "teach-009",
    name: "Mr. Arun Khanna",
    specializationSubjectId: "sub-bst",
    designation: "Senior PGT",
    department: "Commerce",
    phoneNumber: "+91 98765 43009",
    email: "arun.khanna@school.edu",
    emergencyContact: "+91 98765 54009",
    address: "22, Karol Bagh, New Delhi, India",
    dob: "1977-10-30",
    gender: "Male",
    qualification: "M.B.A, M.Com, B.Ed.",
    experience: "13 Years of Business Studies Teaching",
    certifications: "Business Case Analysis Trainer",
    subjectSpecialization:
      "Principles of Management, Marketing, Business Environment",
    joiningDate: "2013-07-01",
    committeeMembership: "Commerce Club, School Disciplinary Committee",
    teacherType: "SPECIALIZED",
  },
  {
    id: "teach-010",
    name: "Dr. Meera Reddy",
    specializationSubjectId: "sub-eco",
    designation: "Senior PGT",
    department: "Commerce",
    phoneNumber: "+91 98765 43010",
    email: "meera.reddy@school.edu",
    emergencyContact: "+91 98765 54010",
    address: "71, South Ext, New Delhi, India",
    dob: "1973-03-24",
    gender: "Female",
    qualification: "Ph.D. in Economics, M.A., B.Ed.",
    experience: "17 Years of Economics Teaching",
    certifications: "Indian Economic Association Member",
    subjectSpecialization:
      "Microeconomics, Macroeconomics, Indian Economic Development",
    joiningDate: "2009-07-01",
    committeeMembership: "Planning Forum, Cultural Activities Coordinator",
    teacherType: "SPECIALIZED",
  },
  {
    id: "teach-011",
    name: "Mr. Sanjay Kumar",
    specializationSubjectId: "sub-pol",
    designation: "Senior PGT",
    department: "Humanities",
    phoneNumber: "+91 98765 43011",
    email: "sanjay.kumar@school.edu",
    emergencyContact: "+91 98765 54011",
    address: "19, Mayur Vihar, New Delhi, India",
    dob: "1978-07-15",
    gender: "Male",
    qualification: "M.A. in Political Science, B.Ed. with NET",
    experience: "12 Years of Political Science Teaching",
    certifications: "Civics and Constitution Workshop Organizer",
    subjectSpecialization:
      "Indian Constitution, Comparative Politics, International Relations",
    joiningDate: "2014-07-01",
    committeeMembership: "Debate Society Moderator, MUN Club In-charge",
    teacherType: "SPECIALIZED",
  },
  {
    id: "teach-012",
    name: "Mrs. Deepa Sharma",
    specializationSubjectId: "sub-geo",
    designation: "Senior PGT",
    department: "Humanities",
    phoneNumber: "+91 98765 43012",
    email: "deepa.sharma@school.edu",
    emergencyContact: "+91 98765 54012",
    address: "63, Laxmi Nagar, New Delhi, India",
    dob: "1981-12-05",
    gender: "Female",
    qualification: "M.Sc. in Geography, B.Ed.",
    experience: "10 Years of Geography Teaching",
    certifications: "GIS Training Workshop, Map Drawing Specialist",
    subjectSpecialization: "Physical Geography, Human Geography, Cartography",
    joiningDate: "2016-07-01",
    committeeMembership: "Heritage Club, Eco Club Advisory Board",
    teacherType: "SPECIALIZED",
  },
  {
    id: "teach-013",
    name: "Mr. Rahul Verma",
    specializationSubjectId: "sub-cs",
    designation: "Senior PGT",
    department: "Computer Science",
    phoneNumber: "+91 98765 43013",
    email: "rahul.verma@school.edu",
    emergencyContact: "+91 98765 54013",
    address: "102, Noida Sector 62, Uttar Pradesh, India",
    dob: "1983-09-22",
    gender: "Male",
    qualification: "M.Tech in CS, B.Tech, B.Ed.",
    experience: "9 Years of Computer Science Teaching",
    certifications: "Google Certified Educator, Python Developer Certified",
    subjectSpecialization:
      "Python Programming, Database Systems, Computer Networks",
    joiningDate: "2017-07-01",
    committeeMembership:
      "Coding Club President, Technology Symposium Coordinator",
    teacherType: "SPECIALIZED",
  },
  {
    id: "teach-014",
    name: "Mrs. Anjali Patel",
    specializationSubjectId: "sub-ip",
    designation: "Senior PGT",
    department: "Computer Science",
    phoneNumber: "+91 98765 43014",
    email: "anjali.patel@school.edu",
    emergencyContact: "+91 98765 54014",
    address: "5, Dwarka, New Delhi, India",
    dob: "1980-05-18",
    gender: "Female",
    qualification: "M.C.A., B.Ed.",
    experience: "12 Years of Information Practices Teaching",
    certifications: "SQL and Data Analytics Professional",
    subjectSpecialization:
      "Data Handling using Pandas, SQL Queries, Societal Impacts",
    joiningDate: "2014-07-01",
    committeeMembership:
      "IT Infrastructure Management, Website Operations In-charge",
    teacherType: "SPECIALIZED",
  },
];

const generateTeachersBatch = (count, startIndex, configGenerator) => {
  const teachers = [];
  let teacherIndex = startIndex;

  for (let i = 0; i < count; i++) {
    const gender = Math.random() > 0.5 ? "female" : "male";
    const firstName =
      indianFirstNames[gender][
        Math.floor(Math.random() * indianFirstNames[gender].length)
      ];
    const lastName =
      indianLastNames[Math.floor(Math.random() * indianLastNames.length)];
    const name = `${firstName} ${lastName}`;
    const id = generateTeacherId(teacherIndex);
    const employeeId = generateEmployeeId(teacherIndex);

    const specificConfig = configGenerator(i, teacherIndex);

    teachers.push({
      id,
      employeeId,
      name,
      teacherType: specificConfig.teacherType || "SPECIALIZED",
      specializationSubjectId: specificConfig.specializationSubjectId,
      designation: specificConfig.designation,
      department: specificConfig.department,
      phoneNumber: generatePhone(43000 + teacherIndex),
      email: generateEmail(name),
      emergencyContact: generatePhone(54000 + teacherIndex),
      address: `${Math.floor(Math.random() * 100) + 1}, Some Street, New Delhi, India`,
      dob: `19${70 + Math.floor(Math.random() * 20)}-01-01`,
      gender: gender.charAt(0).toUpperCase() + gender.slice(1),
      qualification: specificConfig.qualification || "M.A. / M.Sc. B.Ed.",
      experience: `${Math.floor(Math.random() * 15) + 3} Years of Teaching`,
      certifications: specificConfig.certifications || "Certified Professional",
      subjectSpecialization: specificConfig.subjectSpecialization || "General",
      joiningDate: `20${10 + Math.floor(Math.random() * 10)}-07-01`,
      committeeMembership: "Various Committees",
    });

    teacherIndex++;
  }
  return teachers;
};

// Generate Foundation Teachers (28 teachers to cover 7 grades * 4 sections conceptually)
const generateFoundationTeachers = () => {
  return generateTeachersBatch(28, 14, () => ({
    specializationSubjectId: "multi-subject",
    designation: designations.foundation,
    department: departments.foundation,
    teacherType: "FOUNDATION",
    qualification: "B.El.Ed / D.El.Ed with NTT",
    subjectSpecialization: "All Foundation Subjects",
  }));
};

// Generate Specialized Teachers
const generateSubjectSpecializedTeachers = () => {
  let startIndex = 42; // 14 CBSE + 28 Foundation
  const teachers = [];

  const addBatch = (count, generator) => {
    const batch = generateTeachersBatch(count, startIndex, generator);
    teachers.push(...batch);
    startIndex += count;
  };

  // English Teachers (9)
  addBatch(9, () => ({
    specializationSubjectId: "sub-eng",
    designation: designations.secondary,
    department: "Languages",
    subjectSpecialization: "English Literature",
  }));

  // Hindi Teachers (9)
  addBatch(9, () => ({
    specializationSubjectId: "sub-hin",
    designation: designations.middle,
    department: "Languages",
    subjectSpecialization: "Hindi Literature",
  }));

  // Mathematics Teachers (8)
  addBatch(8, () => ({
    specializationSubjectId: "sub-math",
    designation: designations.secondary,
    department: "Mathematics",
    subjectSpecialization: "Algebra, Geometry, Calculus",
  }));

  // Science Teachers (8)
  addBatch(8, () => ({
    specializationSubjectId: "sub-sci",
    designation: designations.middle,
    department: "Science",
    subjectSpecialization: "Physics, Chemistry, Biology",
  }));

  // Social Science Teachers (9)
  addBatch(9, () => ({
    specializationSubjectId: "sub-sst",
    designation: designations.middle,
    department: "Social Sciences",
    subjectSpecialization: "History, Geography, Civics",
  }));

  // Sanskrit Teachers (6)
  addBatch(6, () => ({
    specializationSubjectId: "sub-sanskrit",
    designation: designations.middle,
    department: "Languages",
    subjectSpecialization: "Sanskrit Grammar",
  }));

  // Physics & Chemistry Senior (1 each)
  addBatch(1, () => ({
    specializationSubjectId: "sub-phy",
    designation: designations.senior,
    department: "Science",
    subjectSpecialization: "Advanced Physics",
  }));
  addBatch(1, () => ({
    specializationSubjectId: "sub-chem",
    designation: designations.senior,
    department: "Science",
    subjectSpecialization: "Advanced Chemistry",
  }));

  // Activity Teachers (Art, Music, Library)
  addBatch(1, () => ({
    specializationSubjectId: "act-art",
    designation: "Activity Teacher",
    department: "Arts",
    teacherType: "ACTIVITY",
    subjectSpecialization: "Art",
  }));
  addBatch(1, () => ({
    specializationSubjectId: "act-music",
    designation: "Activity Teacher",
    department: "Arts",
    teacherType: "ACTIVITY",
    subjectSpecialization: "Music",
  }));
  addBatch(1, () => ({
    specializationSubjectId: "act-library",
    designation: "Activity Teacher",
    department: "Library",
    teacherType: "ACTIVITY",
    subjectSpecialization: "Library",
  }));

  return teachers;
};

const restructureTeacher = (teacher) => {
  const { id, teacherType, specializationSubjectId, ...metadata } = teacher;

  const resolvedType = teacherType || "SPECIALIZED";
  const tempTeacher = {
    teacherType: resolvedType,
    designation: teacher.designation,
    metadata: { designation: teacher.designation },
  };
  const eligibleStages = deriveEligibleStages(tempTeacher);

  const primarySub = specializationSubjectId || teacher.subjectId || null;

  return {
    id,
    teacherType: resolvedType,
    specializationSubjectId:
      specializationSubjectId || teacher.subjectId || "multi-subject",
    eligibleStages,
    assignedLevels: [],
    assignedSections: [],
    primarySubjectId: primarySub,
    metadata: {
      ...metadata,
      subjectId:
        specializationSubjectId || teacher.subjectId || "multi-subject",
      teacherId: id,
    },
  };
};

export const generateExpandedTeachers = () => {
  const foundationTeachers = generateFoundationTeachers();
  const specializedTeachers = generateSubjectSpecializedTeachers();

  const allFlat = [
    ...cbseTeachers,
    ...foundationTeachers,
    ...specializedTeachers,
  ];
  return allFlat.map((t, idx) => {
    if (!t.employeeId) {
      t.employeeId = `EMP${String(idx + 1).padStart(3, "0")}`;
    }
    return restructureTeacher(t);
  });
};

export default generateExpandedTeachers;
