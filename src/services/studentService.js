import { MockDB } from "../mockDB";
import { getSubjectsForStudent } from "./academicsService";
import { simulateNetwork } from "./sharedService";

/**
 * Fetches the student profile (Purely Relational)
 */
export const getStudentProfile = async (studentId) => {
  const id = studentId || 'stud-001';
  const student = await MockDB.students.findById(id);
  
  if (!student) return null;

  const classData = await MockDB.helpers.resolveClass(student);
  const subjects = await getSubjectsForStudent(id);
  const stream = await MockDB.streams.findById(student.streamId);
  
  // Resolve Parents for Family Section
  const parents = await Promise.all(
    (student.parentIds || []).map(pid => MockDB.parents.findById(pid))
  );

  // Derive initials and colors
  const initials = student.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // Generate unique credentials dynamically
  const classCode = classData ? `${classData.name}${classData.section}`.toUpperCase() : "11A";
  const firstName = student.name.split(' ')[0];
  const emailUsername = student.name.toLowerCase().replace(/\s/g, '.');

  const libraryCardNo = `LIB-${classCode}-${student.id.split('-')[1]}`;
  const libraryPin = `lib@${firstName}${student.admissionNo.slice(-3)}`;
  const schoolEmail = `${emailUsername}@springdale.edu.in`;
  const emailPassword = `${firstName}@Spring#${student.admissionNo.slice(-2)}`;

  // Return a structured entity-driven profile
  return {
    personal: {
      fullName: student.name,
      firstName: firstName,
      lastName: student.name.split(' ').slice(1).join(' '),
      studentId: student.id,
      admissionNumber: student.admissionNo,
      enrollmentNumber: student.admissionNo,
      rollNumber: student.id.split('-')[1], // Derived
      email: schoolEmail,
      avatarInitials: initials,
      avatarColor: "#03045e",
      status: "Active",
      phoneNumber: student.phoneNumber || "+91 98765 43210",
      gender: student.gender || "Male",
      nationality: student.nationality || "Indian",
      category: student.category || "General",
      dateOfBirth: student.dob || "2008-04-12",
      aadhaarNumber: student.aadhar || "4532-9812-7364"
    },
    academic: {
      class: classData?.name || "N/A",
      section: classData?.section || "A",
      stream: stream?.name || "General",
      subjects: subjects.map(s => s.name),
      academicSession: "2024-25",
      cgpa: 8.8,
      classTeacher: student?.classId?.endsWith('a') ? 'Dr. Sarah Wilson' : 'Mrs. Elena Gilbert',
      house: student.houseGroup || "Saturn (Blue)",
      enrollmentDate: student.enrollDate || "2024-04-05"
    },
    family: {
      father: {
        name: parents[0]?.name || "N/A",
        occupation: student.fatherOccupation || "Professional",
        phoneNumber: student.fatherPhone || "+91 90000 00001"
      },
      mother: {
        name: student.motherName || "N/A",
        occupation: student.motherOccupation || "Home Maker",
        phoneNumber: student.motherPhone || "+91 90000 00002"
      },
      guardian: {
        name: parents[0]?.name || "N/A",
        relation: "Father",
        phoneNumber: parents[0]?.phoneNumber || student.fatherPhone || "+91 90000 00001",
        address: "123, Park Avenue, New Delhi, India"
      }
    },
    credentials: {
      library: {
        cardNumber: libraryCardNo,
        pin: libraryPin
      },
      email: {
        address: schoolEmail,
        password: emailPassword
      }
    },
    medical: {
      bloodGroup: ["O+", "A+", "B+", "AB+", "O-", "A-"][student.id.charCodeAt(student.id.length - 1) % 6],
      height: "172 cm",
      weight: "64 kg",
      identificationMark: "Mole on right arm",
      allergies: ["None reported"],
      emergencyNotes: "NO KNOWN DRUG ALLERGIES. IN CASE OF EMERGENCY, CALL GUARDIAN."
    },
    address: {
      current: {
        address: "123, Park Avenue, Vasant Kunj",
        city: "New Delhi",
        state: "Delhi",
        postalCode: "110070"
      }
    }
  };
};

export const getProfile = getStudentProfile;

/**
 * Fetches student attendance summary (Relational)
 */
export const getAttendance = async (studentId) => {
  const id = studentId || 'stud-001';
  const records = await MockDB.attendance.find({ studentId: id });
  const subjects = await getSubjectsForStudent(id);
  
  const total = records.length;
  const present = records.filter(r => r.status === 'present').length;
  const percentage = total > 0 ? (present / total) * 100 : 0;

  const subjectAttendance = subjects.map((sub, index) => ({
    id: sub.id,
    name: sub.name,
    percentage: Math.max(60, Math.min(98, 85 + (index * 2) - (index % 3 * 5))),
    color: index % 2 === 0 ? "#00b4d8" : index % 3 === 0 ? "#03045e" : "#0077b6"
  }));

  return {
    overall: {
      percentage: Math.round(percentage),
      totalClasses: total,
      attended: present,
    },
    subjects: subjectAttendance
  };
};

/**
 * Fetches student transport details (Relational)
 */
export const getTransportDetails = async (studentId) => {
  const id = studentId || 'stud-001';
  const assignment = await MockDB.transport.findAssignment({ studentId: id });
  if (!assignment) return null;

  const route = await MockDB.transport.findRoute({ id: assignment.routeId });
  
  return {
    summary: {
      ...route,
      pickupStop: assignment.pickupStop,
      status: assignment.status,
      validTill: "31 March 2026"
    }
  };
};

/**
 * Fetches student documents (Relational)
 */
export const getDocuments = async (studentId) => {
  const id = studentId || 'stud-001';
  const docs = await MockDB.documents.find({ studentId: id });
  return simulateNetwork(docs);
};

/**
 * Fetches student achievements (Relational)
 */
export const getAchievements = async (studentId) => {
  const id = studentId || 'stud-001';
  const achs = await MockDB.achievements.find({ studentId: id });
  return simulateNetwork(achs);
};

export const getStudentAchievements = getAchievements;

/**
 * Fetches document categories for documents page
 */
export const getDocumentCategories = async (studentId) => {
  return [
    { id: "all", labelEn: "All Documents", labelHi: "सभी दस्तावेज़" },
    { id: "identity", labelEn: "Identity Proofs", labelHi: "पहचान पत्र" },
    { id: "academic", labelEn: "Academics", labelHi: "शैक्षणिक" },
    { id: "administrative", labelEn: "Administrative", labelHi: "प्रशासनिक" },
    { id: "medical", labelEn: "Medical", labelHi: "चिकित्सा" }
  ];
};
