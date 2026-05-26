import { getDataProvider } from "../data";
import { getSubjectsForStudent } from "./academicsService";
import { isSeniorSecondary } from "../utils/classIdentity";

/**
 * Fetches the student profile (Purely Relational via storage)
 */
export const getStudentProfile = async (studentId) => {
  const id = studentId || "stud-001";
  const provider = getDataProvider();

  const students = await provider.getStudents();
  const student = students.find((s) => s.id === id);
  if (!student) return null;

  const classes = await provider.getClasses();
  const classesMap = new Map(classes.map((c) => [c.id, c]));
  const classData = classesMap.get(student.classId);

  const subjects = await getSubjectsForStudent(id);

  // Resolve Class Teacher relationally
  let classTeacherName = "N/A";
  if (classData && classData.classTeacherId) {
    const teachers = await provider.getTeachers();
    const teachersMap = new Map(teachers.map((t) => [t.id, t]));
    const teacher = teachersMap.get(classData.classTeacherId);
    if (teacher) {
      classTeacherName = teacher.name;
    }
  }

  // Resolve Parents for Family Section
  const parentsList = await provider.getParents();
  const parentsMap = new Map(parentsList.map((p) => [p.id, p]));
  const parents = (student.parentIds || [])
    .map((pid) => parentsMap.get(pid))
    .filter(Boolean);

  // Derive initials and colors
  const initials = student.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Generate unique credentials dynamically
  const classCode = classData
    ? `${classData.name}${classData.section}`.toUpperCase()
    : "11A";
  const firstName = student.name.split(" ")[0];
  const emailUsername = student.name.toLowerCase().replace(/\s/g, ".");

  const libraryCardNo = `LIB-${classCode}-${student.id.split("-")[1]}`;
  const libraryPin = `lib@${firstName}${student.admissionNo.slice(-3)}`;
  const schoolEmail = `${emailUsername}@springdale.edu.in`;
  const emailPassword = `${firstName}@Spring#${student.admissionNo.slice(-2)}`;

  // Return a structured entity-driven profile
  return {
    personal: {
      fullName: student.name,
      firstName: firstName,
      lastName: student.name.split(" ").slice(1).join(" "),
      studentId: student.id,
      admissionNumber: student.admissionNo,
      rollNumber: student.id.split("-")[1], // Derived
      email: schoolEmail,
      avatarInitials: initials,
      avatarColor: "#03045e",
      status: "Active",
      phoneNumber: student.phoneNumber || "+91 98765 43210",
      gender: student.gender || "Male",
      nationality: student.nationality || "Indian",
      category: student.category || "General",
      dateOfBirth: student.dob || "2008-04-12",
      aadhaarNumber: student.aadhar || "4532-9812-7364",
    },
    academic: {
      class: student.classLevel || classData?.name || "N/A",
      section: student.section || classData?.section || "A",
      stream: isSeniorSecondary(student.classLevel)
        ? student.stream || "General"
        : null,
      subjects: subjects.map((s) => s.name),
      academicSession: "2024-25",
      cgpa: 8.8,
      classTeacher: classTeacherName,
      house: student.houseGroup || "Saturn (Blue)",
      admissionDate:
        student.admissionDate || student.enrollDate || "2024-04-05",
    },
    family: {
      father: {
        name: parents[0]?.name || "N/A",
        occupation: student.fatherOccupation || "Professional",
        phoneNumber: student.fatherPhone || "+91 90000 00001",
      },
      mother: {
        name: student.motherName || "N/A",
        occupation: student.motherOccupation || "Home Maker",
        phoneNumber: student.motherPhone || "+91 90000 00002",
      },
      guardian: {
        name: parents[0]?.name || "N/A",
        relation: "Father",
        phoneNumber:
          parents[0]?.phoneNumber || student.fatherPhone || "+91 90000 00001",
        address: "123, Park Avenue, New Delhi, India",
      },
    },
    credentials: {
      library: {
        cardNumber: libraryCardNo,
        pin: libraryPin,
      },
      email: {
        address: schoolEmail,
        password: emailPassword,
      },
    },
    medical: {
      bloodGroup: ["O+", "A+", "B+", "AB+", "O-", "A-"][
        student.id.charCodeAt(student.id.length - 1) % 6
      ],
      height: "172 cm",
      weight: "64 kg",
      identificationMark: "Mole on right arm",
      allergies: ["None reported"],
      emergencyNotes:
        "NO KNOWN DRUG ALLERGIES. IN CASE OF EMERGENCY, CALL GUARDIAN.",
    },
    address: {
      current: {
        address: "123, Park Avenue, Vasant Kunj",
        city: "New Delhi",
        state: "Delhi",
        postalCode: "110070",
      },
    },
  };
};

export const getProfile = getStudentProfile;

/**
 * Fetches student attendance summary (Relational via storage)
 */
export const getAttendance = async (studentId) => {
  const id = studentId || "stud-001";
  const { getAttendanceSummary } = await import("./attendanceService");
  const summary = await getAttendanceSummary(id);

  // Only full-day attendance is used in this school (marked by class teacher)
  // Subject-wise attendance concept has been removed
  return {
    overall: {
      percentage: summary.percentage,
      totalClasses: summary.totalClasses,
      attended: summary.attended,
    },
  };
};

/**
 * Fetches student transport details (Relational via storage)
 */
export const getTransportDetails = async (studentId) => {
  const id = studentId || "stud-001";
  const provider = getDataProvider();
  const assignments = await provider.getTransportAssignments();
  const assignment = assignments.find((ta) => ta.studentId === id);
  if (!assignment) return null;

  const routes = await provider.getTransportRoutes();
  const route = routes.find((tr) => tr.id === assignment.routeId);

  return {
    summary: {
      ...route,
      pickupStop: assignment.pickupStop,
      status: assignment.status,
      validTill: "31 March 2026",
    },
  };
};

/**
 * Fetches student documents (Relational via storage)
 */
export const getDocuments = async (studentId) => {
  const id = studentId || "stud-001";
  const provider = getDataProvider();
  const docs = await provider.getDocuments();
  return docs.filter((d) => d.studentId === id);
};

/**
 * Fetches student achievements (Relational via storage)
 */
export const getAchievements = async (studentId) => {
  const id = studentId || "stud-001";
  const provider = getDataProvider();
  const achs = await provider.getAchievements();
  return achs.filter((a) => a.studentId === id);
};

export const getStudentAchievements = getAchievements;

/**
 * Fetches document categories for documents page
 */
export const getDocumentCategories = async () => {
  return [
    { id: "all", labelEn: "All Documents", labelHi: "सभी दस्तावेज़" },
    { id: "identity", labelEn: "Identity Proofs", labelHi: "पहचान पत्र" },
    { id: "academic", labelEn: "Academics", labelHi: "शैक्षणिक" },
    { id: "administrative", labelEn: "Administrative", labelHi: "प्रशासनिक" },
    { id: "medical", labelEn: "Medical", labelHi: "चिकित्सा" },
  ];
};

export const getAllStudents = async () => {
  const provider = getDataProvider();
  return await provider.getStudents();
};

export const updateStudentProfile = async (id, updates) => {
  const provider = getDataProvider();
  const students = await provider.getStudents();
  const idx = students.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error("Student not found");

  const finalUpdates = { ...updates };
  if (updates.classLevel && updates.section) {
    finalUpdates.classId = `class-${updates.classLevel.toLowerCase()}${updates.section.toLowerCase()}`;
  }
  // Clear stream fields for non-senior secondary
  if (updates.classLevel && !isSeniorSecondary(updates.classLevel)) {
    finalUpdates.stream = null;
    finalUpdates.streamId = null;
  } else if (updates.stream) {
    const streamNameToId = {
      "Science Non-Medical": "SCIENCE_NON_MEDICAL",
      "Science Medical": "SCIENCE_MEDICAL",
      Commerce: "COMMERCE",
      Humanities: "HUMANITIES",
    };
    finalUpdates.streamId = streamNameToId[updates.stream] || null;
  }

  const updatedStudent = await provider.updateStudent(id, finalUpdates);
  return updatedStudent;
};
