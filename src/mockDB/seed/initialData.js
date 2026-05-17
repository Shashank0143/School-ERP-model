/**
 * Initial Seed Data for MockDB
 * 
 * Defines the maturity-level relational blueprint for the EduDash ERP ecosystem.
 * Simulates a complex school environment with overlapping ownership and deep relationships.
 */

export const seedData = (db) => {
  // 1. Define Classes
  db.classes = [
    { id: 'class-11a', name: '11th', section: 'A', grade: 11 },
    { id: 'class-11b', name: '11th', section: 'B', grade: 11 },
    { id: 'class-12a', name: '12th', section: 'A', grade: 12 },
    { id: 'class-12b', name: '12th', section: 'B', grade: 12 }
  ];

  // 2. Define Subjects (Comprehensive ERP-Grade with full meta)
  db.subjects = [
    // Science
    { id: 'sub-phy', name: 'Physics', code: 'SCI-PHY11', type: 'core', description: 'Mechanics, thermodynamics, and optics.', teachers: ['Dr. Sarah Wilson'], schedule: 'Mon, Wed, Fri 08:00', room: 'Lab 1' },
    { id: 'sub-chem', name: 'Chemistry', code: 'SCI-CHM11', type: 'core', description: 'Atomic structure and organic chemistry.', teachers: ['Dr. Sarah Wilson'], schedule: 'Tue, Thu 10:40', room: 'Lab 2' },
    { id: 'sub-bio', name: 'Biology', code: 'SCI-BIO11', type: 'core', description: 'Cell biology and human anatomy.', teachers: ['Mrs. Priya Sharma'], schedule: 'Mon, Wed 09:40', room: 'Lab 3' },
    { id: 'sub-math', name: 'Mathematics', code: 'SCI-MTH11', type: 'core', description: 'Calculus, algebra and trigonometry.', teachers: ['Prof. Michael Ross'], schedule: 'Daily 08:50', room: 'Room 11A' },
    { id: 'sub-cs', name: 'Computer Science', code: 'SCI-CS11', type: 'elective', description: 'Python programming and data structures.', teachers: ['Prof. Michael Ross'], schedule: 'Mon, Wed 11:30', room: 'Comp Lab' },
    
    // Languages & Common
    { id: 'sub-eng', name: 'English', code: 'LNG-ENG11', type: 'core', description: 'Literature and communication skills.', teachers: ['Mrs. Elena Gilbert'], schedule: 'Tue, Thu, Fri 09:40', room: 'Room 11A' },
    { id: 'sub-pe', name: 'Physical Education', code: 'SPT-PE11', type: 'elective', description: 'Sports theory and fitness.', teachers: ['Mr. Hans Mueller'], schedule: 'Wed, Fri 12:20', room: 'Ground' },
    
    // Commerce
    { id: 'sub-acc', name: 'Accountancy', code: 'COM-ACC11', type: 'core', description: 'Financial accounting and bookkeeping.', teachers: ['Mrs. Elena Gilbert'], schedule: 'Mon, Wed, Fri 10:40', room: 'Room 11B' },
    { id: 'sub-bst', name: 'Business Studies', code: 'COM-BST11', type: 'core', description: 'Principles of management and trade.', teachers: ['Mr. Suresh Nair'], schedule: 'Tue, Thu 08:00', room: 'Room 11B' },
    { id: 'sub-eco', name: 'Economics', code: 'COM-ECO11', type: 'core', description: 'Micro and macro economics.', teachers: ['Prof. Michael Ross'], schedule: 'Mon, Wed 12:20', room: 'Room 11B' },
    
    // Humanities
    { id: 'sub-his', name: 'History', code: 'HUM-HIS11', type: 'core', description: 'World history and civilizations.', teachers: ['Mrs. Elena Gilbert'], schedule: 'Mon, Wed 08:00', room: 'Room 12A' },
    { id: 'sub-pol', name: 'Political Science', code: 'HUM-POL11', type: 'core', description: 'Political theory and constitution.', teachers: ['Mrs. Sunita Rao'], schedule: 'Tue, Thu 09:40', room: 'Room 12A' },
    { id: 'sub-geo', name: 'Geography', code: 'HUM-GEO11', type: 'core', description: 'Physical and human geography.', teachers: ['Mr. Kiran Desai'], schedule: 'Fri 10:40', room: 'Room 12A' },
    { id: 'sub-soc', name: 'Sociology', code: 'HUM-SOC11', type: 'core', description: 'Social institutions and change.', teachers: ['Mrs. Anita Verma'], schedule: 'Mon, Wed 11:30', room: 'Room 12B' },
    { id: 'sub-hs', name: 'Home Science', code: 'HUM-HSC11', type: 'elective', description: 'Nutrition and resource management.', teachers: ['Mrs. Neha Singh'], schedule: 'Fri 12:20', room: 'Lab 4' }
  ];

  // 3. Define Streams
  db.streams = [
    { id: 'SCIENCE_MEDICAL', name: 'Science (Medical)', subjectIds: ['sub-phy', 'sub-chem', 'sub-bio', 'sub-eng', 'sub-math', 'sub-pe'] },
    { id: 'SCIENCE_NON_MEDICAL', name: 'Science (Non-Medical)', subjectIds: ['sub-phy', 'sub-chem', 'sub-math', 'sub-eng', 'sub-cs', 'sub-pe'] },
    { id: 'COMMERCE', name: 'Commerce', subjectIds: ['sub-acc', 'sub-bst', 'sub-eco', 'sub-eng', 'sub-math', 'sub-pe'] },
    { id: 'HUMANITIES', name: 'Humanities', subjectIds: ['sub-his', 'sub-pol', 'sub-geo', 'sub-eng', 'sub-soc', 'sub-hs'] }
  ];

  // 4. Define Students (Rich Relational Profiles with complete academic/personal metrics)
  db.students = [
    { 
      id: 'stud-001', 
      admissionNo: '2024001', 
      name: 'Rohan Kumar', 
      classId: 'class-11a', 
      streamId: 'SCIENCE_NON_MEDICAL', 
      userId: 'user-stud-1', 
      parentIds: ['parent-001'],
      category: 'General',
      dob: '2008-04-12',
      aadhar: '4532-9812-7364',
      houseGroup: 'Saturn (Blue)',
      enrollDate: '2024-04-05',
      gender: 'Male',
      nationality: 'Indian',
      phoneNumber: '+91 98765 43210',
      motherName: 'Kiran Kumar',
      motherPhone: '+91 98765 99001',
      motherOccupation: 'Home Maker',
      fatherOccupation: 'Business Executive',
      fatherPhone: '+91 98765 88001'
    },
    { 
      id: 'stud-002', 
      admissionNo: '2024002', 
      name: 'Priya Sharma', 
      classId: 'class-11a', 
      streamId: 'SCIENCE_MEDICAL', 
      userId: 'user-stud-2', 
      parentIds: ['parent-002'],
      category: 'General',
      dob: '2008-08-18',
      aadhar: '8721-6543-9801',
      houseGroup: 'Jupiter (Yellow)',
      enrollDate: '2024-04-06',
      gender: 'Female',
      nationality: 'Indian',
      phoneNumber: '+91 98765 43211',
      motherName: 'Sushma Sharma',
      motherPhone: '+91 98765 99002',
      motherOccupation: 'Lecturer',
      fatherOccupation: 'Chartered Accountant',
      fatherPhone: '+91 98765 88002'
    },
    { 
      id: 'stud-003', 
      admissionNo: '2024003', 
      name: 'Rahul Verma', 
      classId: 'class-11a', 
      streamId: 'SCIENCE_NON_MEDICAL', 
      userId: 'user-stud-3', 
      parentIds: ['parent-003'],
      category: 'OBC',
      dob: '2008-11-22',
      aadhar: '3210-9876-5432',
      houseGroup: 'Mars (Red)',
      enrollDate: '2024-04-05',
      gender: 'Male',
      nationality: 'Indian',
      phoneNumber: '+91 98765 43212',
      motherName: 'Meena Verma',
      motherPhone: '+91 98765 99003',
      motherOccupation: 'Bank Manager',
      fatherOccupation: 'Software Architect',
      fatherPhone: '+91 98765 88003'
    },
    { 
      id: 'stud-004', 
      admissionNo: '2024004', 
      name: 'Ananya Iyer', 
      classId: 'class-11b', 
      streamId: 'COMMERCE', 
      userId: 'user-stud-4', 
      parentIds: ['parent-004'],
      category: 'General',
      dob: '2008-01-30',
      aadhar: '6543-2109-8765',
      houseGroup: 'Neptune (Green)',
      enrollDate: '2024-04-08',
      gender: 'Female',
      nationality: 'Indian',
      phoneNumber: '+91 98765 43213',
      motherName: 'Lakshmi Iyer',
      motherPhone: '+91 98765 99004',
      motherOccupation: 'Journalist',
      fatherOccupation: 'Financial Consultant',
      fatherPhone: '+91 98765 88004'
    },
    { 
      id: 'stud-005', 
      admissionNo: '2024005', 
      name: 'Vikram Singh', 
      classId: 'class-11b', 
      streamId: 'HUMANITIES', 
      userId: 'user-stud-5', 
      parentIds: ['parent-005'],
      category: 'SC',
      dob: '2008-05-15',
      aadhar: '9876-5432-1098',
      houseGroup: 'Saturn (Blue)',
      enrollDate: '2024-04-09',
      gender: 'Male',
      nationality: 'Indian',
      phoneNumber: '+91 98765 43214',
      motherName: 'Gurpreet Kaur',
      motherPhone: '+91 98765 99005',
      motherOccupation: 'Teacher',
      fatherOccupation: 'Defense Officer',
      fatherPhone: '+91 98765 88005'
    },
    { 
      id: 'stud-006', 
      admissionNo: '2023006', 
      name: 'Siddharth Kumar', 
      classId: 'class-12a', 
      streamId: 'SCIENCE_NON_MEDICAL', 
      userId: 'user-stud-6', 
      parentIds: ['parent-001'],
      category: 'General',
      dob: '2007-03-04',
      aadhar: '1234-5678-9012',
      houseGroup: 'Saturn (Blue)',
      enrollDate: '2023-04-04',
      gender: 'Male',
      nationality: 'Indian',
      phoneNumber: '+91 98765 43215',
      motherName: 'Kiran Kumar',
      motherPhone: '+91 98765 99001',
      motherOccupation: 'Home Maker',
      fatherOccupation: 'Business Executive',
      fatherPhone: '+91 98765 88001'
    },
    { 
      id: 'stud-007', 
      admissionNo: '2023007', 
      name: 'Ishani Verma', 
      classId: 'class-12a', 
      streamId: 'SCIENCE_MEDICAL', 
      userId: 'user-stud-7', 
      parentIds: ['parent-003'],
      category: 'OBC',
      dob: '2007-09-12',
      aadhar: '3456-7890-1234',
      houseGroup: 'Mars (Red)',
      enrollDate: '2023-04-04',
      gender: 'Female',
      nationality: 'Indian',
      phoneNumber: '+91 98765 43216',
      motherName: 'Meena Verma',
      motherPhone: '+91 98765 99003',
      motherOccupation: 'Bank Manager',
      fatherOccupation: 'Software Architect',
      fatherPhone: '+91 98765 88003'
    },
    { 
      id: 'stud-008', 
      admissionNo: '2023008', 
      name: 'Arjun Mehra', 
      classId: 'class-12b', 
      streamId: 'COMMERCE', 
      userId: 'user-stud-8', 
      parentIds: ['parent-006'],
      category: 'General',
      dob: '2007-06-25',
      aadhar: '5678-9012-3456',
      houseGroup: 'Jupiter (Yellow)',
      enrollDate: '2023-04-05',
      gender: 'Male',
      nationality: 'Indian',
      phoneNumber: '+91 98765 43217',
      motherName: 'Ritu Mehra',
      motherPhone: '+91 98765 99006',
      motherOccupation: 'Interior Designer',
      fatherOccupation: 'Senior Advocate',
      fatherPhone: '+91 98765 88006'
    },
    { 
      id: 'stud-009', 
      admissionNo: '2023009', 
      name: 'Zoya Khan', 
      classId: 'class-12b', 
      streamId: 'HUMANITIES', 
      userId: 'user-stud-9', 
      parentIds: ['parent-007'],
      category: 'General',
      dob: '2007-12-05',
      aadhar: '7890-1234-5678',
      houseGroup: 'Neptune (Green)',
      enrollDate: '2023-04-06',
      gender: 'Female',
      nationality: 'Indian',
      phoneNumber: '+91 98765 43218',
      motherName: 'Yasmin Khan',
      motherPhone: '+91 98765 99007',
      motherOccupation: 'Fashion Designer',
      fatherOccupation: 'Architect',
      fatherPhone: '+91 98765 88007'
    },
    { 
      id: 'stud-010', 
      admissionNo: '2023010', 
      name: 'Kabir Das', 
      classId: 'class-12b', 
      streamId: 'COMMERCE', 
      userId: 'user-stud-10', 
      parentIds: ['parent-008'],
      category: 'SC',
      dob: '2007-10-10',
      aadhar: '9012-3456-7890',
      houseGroup: 'Jupiter (Yellow)',
      enrollDate: '2023-04-06',
      gender: 'Male',
      nationality: 'Indian',
      phoneNumber: '+91 98765 43219',
      motherName: 'Saraswati Das',
      motherPhone: '+91 98765 99008',
      motherOccupation: 'Primary Teacher',
      fatherOccupation: 'Government Servant',
      fatherPhone: '+91 98765 88008'
    }
  ];

  // 5. Define Parents
  db.parents = [
    { id: 'parent-001', name: 'Rajesh Kumar', userId: 'user-parent-1', childIds: ['stud-001', 'stud-006'] },
    { id: 'parent-002', name: 'Suresh Sharma', userId: 'user-parent-2', childIds: ['stud-002'] },
    { id: 'parent-003', name: 'Meena Verma', userId: 'user-parent-3', childIds: ['stud-003', 'stud-007'] },
    { id: 'parent-004', name: 'Karthik Iyer', userId: 'user-parent-4', childIds: ['stud-004'] },
    { id: 'parent-005', name: 'Harpreet Singh', userId: 'user-parent-5', childIds: ['stud-005'] },
    { id: 'parent-006', name: 'Amit Mehra', userId: 'user-parent-6', childIds: ['stud-008'] },
    { id: 'parent-007', name: 'Farhan Khan', userId: 'user-parent-7', childIds: ['stud-009'] },
    { id: 'parent-008', name: 'Lata Das', userId: 'user-parent-8', childIds: ['stud-010'] }
  ];

  // 6. Define Teachers
  db.teachers = [
    { id: 'teach-001', employeeId: 'EMP001', name: 'Dr. Sarah Wilson', userId: 'user-teach-1', assignedClassIds: ['class-11a', 'class-12a'], subjectIds: ['sub-phy', 'sub-chem'] },
    { id: 'teach-002', employeeId: 'EMP002', name: 'Prof. Michael Ross', userId: 'user-teach-2', assignedClassIds: ['class-11a', 'class-12a', 'class-12b'], subjectIds: ['sub-math', 'sub-cs', 'sub-eco'] },
    { id: 'teach-003', employeeId: 'EMP003', name: 'Mrs. Elena Gilbert', userId: 'user-teach-3', assignedClassIds: ['class-11b', 'class-12b'], subjectIds: ['sub-eng', 'sub-his', 'sub-acc'] }
  ];

  // 7. Define Attendance (Dynamic 30-Day Weekday Seeding for Realism & Variation)
  db.attendance = [];
  let attIdCounter = 1;

  const dates = [];
  const currentDate = new Date('2025-05-16');
  let loopDate = new Date(currentDate);

  while (dates.length < 30) {
    const day = loopDate.getDay();
    if (day !== 0 && day !== 6) { // Weekdays only
      const year = loopDate.getFullYear();
      const month = String(loopDate.getMonth() + 1).padStart(2, '0');
      const dateStr = String(loopDate.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${dateStr}`);
    }
    loopDate.setDate(loopDate.getDate() - 1);
  }

  db.students.forEach((student, index) => {
    const rate = student.id === 'stud-003' ? 0.78 : student.id === 'stud-005' ? 0.96 : 0.85 + (index % 4) * 0.03;
    dates.forEach((date, dateIdx) => {
      const isPresent = ((dateIdx * 13 + index * 17) % 100) < (rate * 100);
      db.attendance.push({
        id: `att-${attIdCounter++}`,
        studentId: student.id,
        date: date,
        status: isPresent ? 'present' : 'absent',
        markedById: student.classId.endsWith('a') ? 'teach-001' : 'teach-003',
        classId: student.classId
      });
    });
  });

  // 8. Define Fees (Directly used to resolve dynamic Invoices and Receipts below)
  db.fees = [
    { id: 'fee-1', studentId: 'stud-001', totalAmount: 45000, paidAmount: 32000, dueDate: '2024-06-01', status: 'Partially Paid' },
    { id: 'fee-2', studentId: 'stud-002', totalAmount: 45000, paidAmount: 45000, dueDate: '2024-06-01', status: 'Paid' },
    { id: 'fee-3', studentId: 'stud-003', totalAmount: 45000, paidAmount: 0, dueDate: '2024-06-01', status: 'Unpaid' },
    { id: 'fee-4', studentId: 'stud-004', totalAmount: 42000, paidAmount: 42000, dueDate: '2024-06-01', status: 'Paid' },
    { id: 'fee-5', studentId: 'stud-005', totalAmount: 38000, paidAmount: 15000, dueDate: '2024-06-01', status: 'Partially Paid' },
    { id: 'fee-6', studentId: 'stud-006', totalAmount: 52000, paidAmount: 52000, dueDate: '2024-06-01', status: 'Paid' },
    { id: 'fee-7', studentId: 'stud-007', totalAmount: 52000, paidAmount: 26000, dueDate: '2024-06-01', status: 'Partially Paid' },
    { id: 'fee-8', studentId: 'stud-008', totalAmount: 42000, paidAmount: 42000, dueDate: '2024-06-01', status: 'Paid' },
    { id: 'fee-9', studentId: 'stud-009', totalAmount: 38000, paidAmount: 38000, dueDate: '2024-06-01', status: 'Paid' },
    { id: 'fee-10', studentId: 'stud-010', totalAmount: 42000, paidAmount: 10000, dueDate: '2024-06-01', status: 'Partially Paid' }
  ];

  // 9. Define Exams
  db.exams = [
    { id: 'exam-hy-2025', name: 'Half-Yearly Examination 2025', type: 'TERM', startDate: '2025-07-18', endDate: '2025-07-28' },
    { id: 'exam-ut-1', name: 'Unit Test 1', type: 'UNIT', startDate: '2025-05-10', endDate: '2025-05-15' }
  ];

  // 10. Define Results (Dynamic Subject-aligned Gradebook for UT-1 & Half-Yearly)
  db.results = [];
  let resIdCounter = 1;

  db.students.forEach((student, studIndex) => {
    const stream = db.streams.find(s => s.id === student.streamId);
    if (!stream) return;

    const studentSubjects = db.subjects.filter(sub => stream.subjectIds.includes(sub.id));

    studentSubjects.forEach((subject, subIdx) => {
      // Unit Test 1 Result
      const basePercentage = 0.65 + ((studIndex * 7 + subIdx * 11) % 31) * 0.01;
      const utMarks = Math.round(100 * basePercentage);
      const utGrade = utMarks >= 90 ? 'A+' : utMarks >= 80 ? 'A' : utMarks >= 70 ? 'B' : utMarks >= 60 ? 'C' : 'D';
      const utRemarks = utMarks >= 90 ? 'Outstanding Effort' : utMarks >= 80 ? 'Very Good Progress' : utMarks >= 70 ? 'Good' : 'Needs Improvement';

      db.results.push({
        id: `res-ut-${resIdCounter++}`,
        studentId: student.id,
        examId: 'exam-ut-1',
        subjectId: subject.id,
        marksObtained: utMarks,
        maxMarks: 100,
        remarks: utRemarks,
        grade: utGrade,
        teacherId: subject.teachers?.[0] === 'Dr. Sarah Wilson' ? 'teach-001' : subject.teachers?.[0] === 'Prof. Michael Ross' ? 'teach-002' : 'teach-003',
        classId: student.classId
      });

      // Half-Yearly Result
      const hyPercentage = basePercentage + (studIndex % 2 === 0 ? 0.03 : -0.04);
      const hyMarks = Math.round(100 * Math.min(1.0, Math.max(0.4, hyPercentage)));
      const hyGrade = hyMarks >= 90 ? 'A+' : hyMarks >= 80 ? 'A' : hyMarks >= 70 ? 'B' : hyMarks >= 60 ? 'C' : 'D';
      const hyRemarks = hyMarks >= 90 ? 'Exceptional Performance' : hyMarks >= 80 ? 'Well Prepared' : hyMarks >= 70 ? 'Satisfactory' : 'Scope for Improvement';

      db.results.push({
        id: `res-hy-${resIdCounter++}`,
        studentId: student.id,
        examId: 'exam-hy-2025',
        subjectId: subject.id,
        marksObtained: hyMarks,
        maxMarks: 100,
        remarks: hyRemarks,
        grade: hyGrade,
        teacherId: subject.teachers?.[0] === 'Dr. Sarah Wilson' ? 'teach-001' : subject.teachers?.[0] === 'Prof. Michael Ross' ? 'teach-002' : 'teach-003',
        classId: student.classId
      });
    });
  });

  // 11. Define Auth Users Mapping
  db.users = [
    { id: 'user-stud-1', username: 'student', role: 'STUDENT', linkedEntityId: 'stud-001' },
    { id: 'user-stud-2', username: 'priya', role: 'STUDENT', linkedEntityId: 'stud-002' },
    { id: 'user-stud-3', username: 'rahul', role: 'STUDENT', linkedEntityId: 'stud-003' },
    { id: 'user-stud-4', username: 'ananya', role: 'STUDENT', linkedEntityId: 'stud-004' },
    { id: 'user-stud-5', username: 'vikram', role: 'STUDENT', linkedEntityId: 'stud-005' },
    { id: 'user-stud-6', username: 'siddharth', role: 'STUDENT', linkedEntityId: 'stud-006' },
    { id: 'user-stud-7', username: 'ishani', role: 'STUDENT', linkedEntityId: 'stud-007' },
    { id: 'user-stud-8', username: 'arjun', role: 'STUDENT', linkedEntityId: 'stud-008' },
    { id: 'user-stud-9', username: 'zoya', role: 'STUDENT', linkedEntityId: 'stud-009' },
    { id: 'user-stud-10', username: 'kabir', role: 'STUDENT', linkedEntityId: 'stud-010' },
    { id: 'user-parent-1', username: 'parent', role: 'PARENT', linkedEntityId: 'parent-001' },
    { id: 'user-parent-2', username: 'suresh', role: 'PARENT', linkedEntityId: 'parent-002' },
    { id: 'user-parent-3', username: 'meena', role: 'PARENT', linkedEntityId: 'parent-003' },
    { id: 'user-parent-4', username: 'karthik', role: 'PARENT', linkedEntityId: 'parent-004' },
    { id: 'user-parent-5', username: 'harpreet', role: 'PARENT', linkedEntityId: 'parent-005' },
    { id: 'user-parent-6', username: 'amit', role: 'PARENT', linkedEntityId: 'parent-006' },
    { id: 'user-parent-7', username: 'farhan', role: 'PARENT', linkedEntityId: 'parent-007' },
    { id: 'user-parent-8', username: 'lata', role: 'PARENT', linkedEntityId: 'parent-008' },
    { id: 'user-teach-1', username: 'teacher', role: 'TEACHER', linkedEntityId: 'teach-001' },
    { id: 'user-admin-1', username: 'admin', role: 'ADMIN', linkedEntityId: 'admin-001' }
  ];

  // 12. Define Assignments (Dynamic Seeding for all classes and subjects)
  const assignmentTemplates = {
    'sub-phy': { title: 'Electromagnetism & Circuits Lab', desc: 'Prepare a report on Faraday\'s Law experiments and simulation observations.', totalMarks: 25 },
    'sub-chem': { title: 'Chemical Kinetics & Rate Constants', desc: 'Determine the rate constant of the reaction between iodide ions and hydrogen peroxide.', totalMarks: 30 },
    'sub-bio': { title: 'Genetics & Pedigree Chart Analysis', desc: 'Draw a pedigree chart for a three-generation family showcasing recessive trait genetics.', totalMarks: 20 },
    'sub-math': { title: 'Differential Equations Set #5', desc: 'Solve exercises on first-order linear differential equations and boundary conditions.', totalMarks: 50 },
    'sub-cs': { title: 'SQL Relational Queries & Database Design', desc: 'Draft entity relation diagrams and write SELECT JOIN queries for a school database.', totalMarks: 100 },
    'sub-eng': { title: 'Modernism & Literary Criticism', desc: 'Submit a critical analysis essay of T.S. Eliot\'s poems in Hornbill.', totalMarks: 20 },
    'sub-pe': { title: 'Yoga & Cardio Fitness Journal', desc: 'Track your daily calorie expenditure, heart rate progression, and yoga poses for two weeks.', totalMarks: 15 },
    'sub-acc': { title: 'Corporate Balance Sheets Analysis', desc: 'Analyze the published balance sheet of a public limited company from the NSE.', totalMarks: 40 },
    'sub-bst': { title: 'Business Environment & Trade Study', desc: 'Analyze the impact of GST reforms on micro-retailers in your locality.', totalMarks: 30 },
    'sub-eco': { title: 'Monetary Policies & Macroeconomic Analysis', desc: 'Draft a report on recent repo rate changes and interest rate impacts in India.', totalMarks: 35 },
    'sub-his': { title: 'Harappan Civilization Archival Project', desc: 'Analyze archaeological excavation sites and pottery styles of Mohenjo-Daro.', totalMarks: 25 },
    'sub-pol': { title: 'Federalism & Decentralization Study', desc: 'Explore state-local relations and municipal finance patterns in metropolitan areas.', totalMarks: 25 },
    'sub-geo': { title: 'Soil Mechanics & Topographical Mapping', desc: 'Create a physical topographic profile of the Western Ghats region.', totalMarks: 30 },
    'sub-soc': { title: 'Social Stratification Fieldwork Survey', desc: 'Conduct a virtual survey on domestic labor and gendered division of work.', totalMarks: 25 },
    'sub-hs': { title: 'Nutritional Meal Planning & Caloric Budgets', desc: 'Design a high-protein diet chart for adolescent sports players.', totalMarks: 20 }
  };

  db.assignments = [];
  let asgnIdCounter = 1;

  db.subjects.forEach(subject => {
    const template = assignmentTemplates[subject.id];
    if (!template) return;

    const isSci = ['sub-phy', 'sub-chem', 'sub-bio', 'sub-cs'].includes(subject.id);
    const isComm = ['sub-acc', 'sub-bst', 'sub-eco'].includes(subject.id);
    const isHum = ['sub-his', 'sub-pol', 'sub-geo', 'sub-soc', 'sub-hs'].includes(subject.id);
    
    const class11List = isSci ? ['class-11a'] : isComm || isHum ? ['class-11b'] : ['class-11a', 'class-11b'];
    const class12List = isSci ? ['class-12a'] : isComm || isHum ? ['class-12b'] : ['class-12a', 'class-12b'];

    class11List.forEach(classId => {
      db.assignments.push({
        id: `asgn-11-${asgnIdCounter++}`,
        subjectId: subject.id,
        title: `${template.title} (11th)`,
        description: template.desc,
        dueDate: '2025-05-25',
        totalMarks: template.totalMarks,
        type: 'Assignment',
        teacherId: subject.teachers?.[0] === 'Dr. Sarah Wilson' ? 'teach-001' : subject.teachers?.[0] === 'Prof. Michael Ross' ? 'teach-002' : 'teach-003',
        classId: classId
      });
    });

    class12List.forEach(classId => {
      db.assignments.push({
        id: `asgn-12-${asgnIdCounter++}`,
        subjectId: subject.id,
        title: `${template.title} (12th)`,
        description: template.desc,
        dueDate: '2025-05-28',
        totalMarks: template.totalMarks,
        type: 'Assignment',
        teacherId: subject.teachers?.[0] === 'Dr. Sarah Wilson' ? 'teach-001' : subject.teachers?.[0] === 'Prof. Michael Ross' ? 'teach-002' : 'teach-003',
        classId: classId
      });
    });
  });

  // 13. Define Submissions (Academic Subject-aligned submission records)
  db.submissions = [];
  let submIdCounter = 1;

  db.students.forEach((student, studIndex) => {
    const studentAssignments = db.assignments.filter(a => a.classId === student.classId);
    const stream = db.streams.find(s => s.id === student.streamId);
    const validAssignments = studentAssignments.filter(a => stream.subjectIds.includes(a.subjectId));

    validAssignments.forEach((asgn, asgnIdx) => {
      const key = (studIndex + asgnIdx) % 5;
      let status = 'GRADED';
      let score = null;
      let submittedAt = '2025-05-20';

      if (key === 0) {
        status = 'PENDING';
      } else if (key === 1) {
        status = 'SUBMITTED';
        submittedAt = '2025-05-24';
      } else {
        status = 'GRADED';
        const percentage = 0.70 + ((asgnIdx * 3 + studIndex * 2) % 28) * 0.01;
        score = Math.round(asgn.totalMarks * percentage);
      }

      db.submissions.push({
        id: `subm-${submIdCounter++}`,
        assignmentId: asgn.id,
        studentId: student.id,
        status: status,
        score: score,
        submittedAt: status !== 'PENDING' ? submittedAt : undefined
      });
    });
  });

  // 14. Define Transport Routes
  db.transportRoutes = [
    { id: 'RT-104', routeNo: 'RT-104', vehicleNo: 'DL-1PB-4521', pickupTime: '07:15 AM', dropTime: '03:45 PM', driverName: 'Ramesh Chand', driverPhone: '+91 98765 43210' }
  ];

  // 15. Define Transport Assignments (Seed all 10 students dynamically)
  const stops = [
    'Sector 15 Main Gate',
    'HDFC Bank Square',
    'Central Mall Road',
    'Police Chowki Circle',
    'Metro Station Sector 21',
    'Dwarka Crossing',
    'Sector 6 Primary School',
    'Janakpuri West Junction',
    'Rajouri Garden Metro',
    'Connaught Place Circle'
  ];

  db.transportAssignments = db.students.map((student, index) => ({
    id: `ta-${index + 1}`,
    studentId: student.id,
    routeId: 'RT-104',
    pickupStop: stops[index % stops.length],
    status: 'Active'
  }));

  // 16. Define Documents (Seed all students with 5 mandatory and 2 optional documents)
  db.documents = [];
  db.students.forEach((student, idx) => {
    // 1. Aadhaar ID Card (Mandatory)
    db.documents.push({
      id: `doc-${student.id}-aadhaar`,
      studentId: student.id,
      titleEn: 'Aadhaar ID Card',
      category: 'identity',
      isMandatory: true,
      status: 'verified',
      uploadDate: '2024-04-12',
      fileSize: '1.2 MB'
    });

    // 2. Transfer Certificate (Mandatory - Missing for stud-002 to trigger Action Center)
    const isMissingTC = student.id === 'stud-002';
    db.documents.push({
      id: `doc-${student.id}-tc`,
      studentId: student.id,
      titleEn: 'Transfer Certificate',
      category: 'administrative',
      isMandatory: true,
      status: isMissingTC ? 'missing' : (idx % 4 === 0 ? 'pending' : idx % 5 === 0 ? 'rejected' : 'verified'),
      uploadDate: isMissingTC ? null : '2024-04-15',
      fileSize: isMissingTC ? null : '850 KB',
      remarks: idx % 5 === 0 ? 'Signature not visible' : ''
    });

    // 3. Previous Marksheet (Mandatory)
    db.documents.push({
      id: `doc-${student.id}-marksheet`,
      studentId: student.id,
      titleEn: 'Class 10 Mark Sheet',
      category: 'academic',
      isMandatory: true,
      status: idx % 3 === 0 ? 'uploaded' : 'verified',
      uploadDate: '2024-04-02',
      fileSize: '2.1 MB'
    });

    // 4. Passport-size Photograph (Mandatory)
    db.documents.push({
      id: `doc-${student.id}-photo`,
      studentId: student.id,
      titleEn: 'Passport-size Photograph',
      category: 'identity',
      isMandatory: true,
      status: 'verified',
      uploadDate: '2024-04-01',
      fileSize: '450 KB'
    });

    // 5. Birth Certificate (Mandatory - Missing for student idx 3 for simulation)
    const isMissingBirth = idx === 3;
    db.documents.push({
      id: `doc-${student.id}-birth`,
      studentId: student.id,
      titleEn: 'Birth Certificate',
      category: 'administrative',
      isMandatory: true,
      status: isMissingBirth ? 'missing' : 'verified',
      uploadDate: isMissingBirth ? null : '2024-04-05',
      fileSize: isMissingBirth ? null : '1.4 MB'
    });

    // 6. Medical Form (Optional - Missing does NOT trigger critical alert)
    db.documents.push({
      id: `doc-${student.id}-medical`,
      studentId: student.id,
      titleEn: 'Medical Declaration Form',
      category: 'administrative',
      isMandatory: false,
      status: idx % 2 === 0 ? 'verified' : 'missing',
      uploadDate: idx % 2 === 0 ? '2024-04-10' : null,
      fileSize: idx % 2 === 0 ? '920 KB' : null
    });

    // 7. Extra-curricular Certificate (Optional - Missing does NOT trigger critical alert)
    db.documents.push({
      id: `doc-${student.id}-extracurricular`,
      studentId: student.id,
      titleEn: 'State Level Extracurricular Certificate',
      category: 'extracurricular',
      isMandatory: false,
      status: idx % 3 === 0 ? 'verified' : 'missing',
      uploadDate: idx % 3 === 0 ? '2024-04-18' : null,
      fileSize: idx % 3 === 0 ? '1.8 MB' : null
    });
  });

  // 17. Define Achievements (Seed stream-appropriate accomplishments for all 10 students)
  db.achievements = [];
  const achievementsByStream = {
    'SCIENCE_MEDICAL': [
      { titleEn: 'Biology Symposium - Best Paper Award', category: 'academic', rank: 'gold' },
      { titleEn: 'Regional Science Fair - Finalist', category: 'academic', rank: 'silver' },
      { titleEn: 'Inter-School Football Championship Runner Up', category: 'sports', rank: 'silver' }
    ],
    'SCIENCE_NON_MEDICAL': [
      { titleEn: 'National Coding Contest - Top 5 Ranker', category: 'technical', rank: 'gold' },
      { titleEn: 'Science Olympiad - Gold Medalist', category: 'academic', rank: 'gold' },
      { titleEn: 'District Table Tennis Championship Winner', category: 'sports', rank: 'gold' }
    ],
    'COMMERCE': [
      { titleEn: 'Inter-School Business Pitch - Gold Medal', category: 'academic', rank: 'gold' },
      { titleEn: 'State Level Chess Tournament - Runner Up', category: 'sports', rank: 'silver' },
      { titleEn: 'Financial Literacy Essay - Best Writer', category: 'academic', rank: 'gold' }
    ],
    'HUMANITIES': [
      { titleEn: 'National Youth Parliament - Best Speaker', category: 'cultural', rank: 'gold' },
      { titleEn: 'State Level Painting Competition Winner', category: 'cultural', rank: 'gold' },
      { titleEn: 'Inter-School Debate Championship Winner', category: 'cultural', rank: 'gold' }
    ]
  };

  db.students.forEach((student, index) => {
    const list = achievementsByStream[student.streamId] || achievementsByStream['SCIENCE_NON_MEDICAL'];
    const ach = list[index % list.length];
    db.achievements.push({
      id: `ach-${student.id}`,
      studentId: student.id,
      titleEn: ach.titleEn,
      category: ach.category,
      date: '2024-11-20',
      rank: ach.rank
    });
  });

  // 18. Define Invoices & Receipts (Seeded dynamically from db.fees for math accuracy)
  db.invoices = [];
  db.receipts = [];

  db.fees.forEach((fee) => {
    const sId = fee.studentId;
    const admissionYear = sId === 'stud-006' || sId === 'stud-007' || sId === 'stud-008' || sId === 'stud-009' || sId === 'stud-010' ? '2023' : '2024';
    
    const term1Amt = Math.round(fee.totalAmount * 0.45);
    const term2Amt = Math.round(fee.totalAmount * 0.45);
    const transportAmt = Math.round(fee.totalAmount * 0.06);
    const miscAmt = fee.totalAmount - term1Amt - term2Amt - transportAmt;

    const invoices = [
      { id: `INV-${sId}-1`, studentId: sId, invoiceNo: `BL-${admissionYear}-001`, amount: term1Amt, dueDate: `${admissionYear}-07-15`, status: 'Paid', category: 'academic', targetLabel: 'Term 1 Fee' },
      { id: `INV-${sId}-2`, studentId: sId, invoiceNo: `BL-${admissionYear}-002`, amount: transportAmt, dueDate: `${admissionYear}-08-15`, status: 'Paid', category: 'transport', targetLabel: 'Transport Fee' },
      { id: `INV-${sId}-3`, studentId: sId, invoiceNo: `BL-${admissionYear}-003`, amount: miscAmt, dueDate: `${admissionYear}-09-15`, status: 'Paid', category: 'miscellaneous', targetLabel: 'Clubs & Activities Fee' },
      { id: `INV-${sId}-4`, studentId: sId, invoiceNo: `BL-2025-004`, amount: term2Amt, dueDate: '2025-01-15', status: 'Unpaid', category: 'academic', targetLabel: 'Term 2 Fee' }
    ];

    let remainingPaid = fee.paidAmount;

    invoices.forEach((inv, invIdx) => {
      if (remainingPaid >= inv.amount) {
        inv.status = 'Paid';
        db.receipts.push({
          id: `RCP-${sId}-${invIdx + 1}`,
          invoiceId: inv.id,
          studentId: sId,
          amount: inv.amount,
          date: inv.dueDate,
          mode: 'Online',
          targetLabel: inv.targetLabel,
          transactionId: `TXN${sId.split('-')[1]}${invIdx}48A2`
        });
        remainingPaid -= inv.amount;
      } else if (remainingPaid > 0) {
        inv.status = 'Partially Paid';
        db.receipts.push({
          id: `RCP-${sId}-${invIdx + 1}`,
          invoiceId: inv.id,
          studentId: sId,
          amount: remainingPaid,
          date: '2025-02-15',
          mode: remainingPaid > 2000 ? 'Online' : 'Cash',
          targetLabel: inv.targetLabel,
          transactionId: `TXN${sId.split('-')[1]}${invIdx}91B7`
        });
        remainingPaid = 0;
      } else {
        inv.status = 'Unpaid';
      }
    });

    db.invoices.push(...invoices);
  });

  // 20. Define Notices
  db.notices = [
    {
      id: 'not-1',
      title: 'Half-yearly examination schedule released',
      content: 'The official schedule for the half-yearly examinations starting next month has been published. Please check the Examination page for timing and guidelines.',
      date: '10 July 2025',
      priority: 'high',
      category: 'general',
      icon: 'FileText',
      targetStreamId: null,
      targetClassId: null,
      targetRole: null
    },
    {
      id: 'not-2',
      title: 'School library closed on 15 July (holiday)',
      content: 'Please note that the main library will remain closed on 15 July due to maintenance and a scheduled holiday.',
      date: '8 July 2025',
      priority: 'medium',
      category: 'general',
      icon: 'BookOpen',
      targetStreamId: null,
      targetClassId: null,
      targetRole: null
    },
    {
      id: 'not-3',
      title: 'Annual Sports Day registrations open till 20 July',
      content: 'Registrations for tracks, football, and basketball matches are now open. Register at the sports office.',
      date: '5 July 2025',
      priority: 'low',
      category: 'general',
      icon: 'Trophy',
      targetStreamId: null,
      targetClassId: null,
      targetRole: null
    },
    {
      id: 'not-4',
      title: 'Parent-Teacher Meeting on 20 July 2025',
      content: 'Annual Parent-Teacher Meeting will take place in the main auditorium. Presence of at least one parent is required.',
      date: '9 July 2025',
      priority: 'high',
      category: 'general',
      icon: 'AlertCircle',
      targetStreamId: null,
      targetClassId: null,
      targetRole: 'PARENT'
    },
    {
      id: 'not-5',
      title: 'Physics practical exam: 18 July 2025, Lab 1',
      content: 'Physics practical exams for Class 11 & 12 Science stream will be held in Physics Lab 1. Reporting time is 08:30 AM.',
      date: '10 July 2025',
      priority: 'high',
      category: 'exam',
      icon: 'FileText',
      targetStreamId: 'SCIENCE_NON_MEDICAL',
      targetClassId: 'class-11a',
      targetRole: null
    },
    {
      id: 'not-6',
      title: 'Chemistry theory exam: 22 July 2025, Hall A',
      content: 'Chemistry board level mock theory paper for Science non-medical students.',
      date: '10 July 2025',
      priority: 'high',
      category: 'exam',
      icon: 'FileText',
      targetStreamId: 'SCIENCE_NON_MEDICAL',
      targetClassId: 'class-11a',
      targetRole: null
    },
    {
      id: 'not-7',
      title: 'Mathematics test: 25 July 2025, Room 11A',
      content: 'Mathematics test on Calculus concepts will be conducted during first period.',
      date: '11 July 2025',
      priority: 'medium',
      category: 'exam',
      icon: 'FileText',
      targetStreamId: 'SCIENCE_NON_MEDICAL',
      targetClassId: 'class-11a',
      targetRole: null
    }
  ];

  // 21. Define Events
  db.events = [
    {
      id: 'eve-1',
      name: 'Science Exhibition 2025',
      date: '12 July 2025',
      category: 'Academic',
      bgGradient: 'linear-gradient(135deg, #03045e, #0077b6)',
      status: 'happening',
      daysLeft: 0,
      targetStreamId: null,
      targetClassId: null
    },
    {
      id: 'eve-2',
      name: 'Annual Cultural Fest',
      date: '13 July 2025',
      category: 'Cultural',
      bgGradient: 'linear-gradient(135deg, #0077b6, #00b4d8)',
      status: 'happening',
      daysLeft: 0,
      targetStreamId: null,
      targetClassId: null
    },
    {
      id: 'eve-3',
      name: 'Inter-House Quiz',
      date: '14 July 2025',
      category: 'Academic',
      bgGradient: 'linear-gradient(135deg, #03045e, #00b4d8)',
      status: 'happening',
      daysLeft: 0,
      targetStreamId: null,
      targetClassId: null
    },
    {
      id: 'eve-4',
      name: 'Inter-School Debate',
      date: '17 July 2025',
      category: 'Academic',
      bgGradient: 'linear-gradient(135deg, #0077b6, #03045e)',
      status: 'upcoming',
      daysLeft: 3,
      targetStreamId: null,
      targetClassId: null
    },
    {
      id: 'eve-5',
      name: 'Workshop: Robotics Basics',
      date: '19 July 2025',
      category: 'Tech',
      bgGradient: 'linear-gradient(135deg, #03045e, #0077b6)',
      status: 'upcoming',
      daysLeft: 5,
      targetStreamId: 'SCIENCE_NON_MEDICAL',
      targetClassId: null
    },
    {
      id: 'eve-6',
      name: 'Annual Sports Day',
      date: '21 July 2025',
      category: 'Sports',
      bgGradient: 'linear-gradient(135deg, #00b4d8, #0077b6)',
      status: 'upcoming',
      daysLeft: 7,
      targetStreamId: null,
      targetClassId: null
    }
  ];

  // 19. Seed Relational Clubs System (5-6 total clubs)
  db.clubs = [
    { id: 'club-robotics', name: 'Robotics & AI Club', category: 'Technical', coordinator: 'Dr. Sarah Wilson', description: 'Arduino, microcontrollers, and competitive robotics projects.', logo: 'cpu' },
    { id: 'club-debate', name: 'Debate & Literary Society', category: 'Literary', coordinator: 'Mrs. Elena Gilbert', description: 'Declamation, model UN debates, and communication exercises.', logo: 'mic' },
    { id: 'club-music', name: 'Harmony Music Club & Band', category: 'Performing Arts', coordinator: 'Mrs. Sunita Rao', description: 'Vocal training, classical theory, and rock band rehearsals.', logo: 'music' },
    { id: 'club-photo', name: 'Shutter & Lens Photography Club', category: 'Creative', coordinator: 'Mr. Kiran Desai', description: 'DSLR settings, photo editing workshops, and photo walks.', logo: 'camera' },
    { id: 'club-science', name: 'Einstein Science Innovation Club', category: 'Technical', coordinator: 'Dr. Sarah Wilson', description: 'Scientific experimentation, logic building, and chemistry fairs.', logo: 'code' },
    { id: 'club-literary', name: 'Creative Writing & Literary Circle', category: 'Literary', coordinator: 'Mrs. Elena Gilbert', description: 'Creative writing prompts, book discussions, and poetry contests.', logo: 'book-open' }
  ];

  db.clubCoordinators = [
    { id: 'fac-1', name: 'Dr. Sarah Wilson', department: 'Computer Science & Robotics', email: 's.wilson@edudash.edu', timings: 'Mon-Fri: 3PM - 5PM' },
    { id: 'fac-2', name: 'Mrs. Elena Gilbert', department: 'English Literature & Debating', email: 'e.gilbert@edudash.edu', timings: 'Tue, Thu: 4PM - 6PM' },
    { id: 'fac-3', name: 'Mrs. Sunita Rao', department: 'Performing Arts & Vocal', email: 's.rao@edudash.edu', timings: 'Mon, Wed: 3:30PM - 5:30PM' },
    { id: 'fac-4', name: 'Mr. Kiran Desai', department: 'Geography & Photography', email: 'k.desai@edudash.edu', timings: 'Wed, Fri: 2PM - 4PM' }
  ];

  db.clubActivities = [
    { id: 'act-1', clubId: 'club-robotics', title: 'National RoboCON Hackathon', date: '25 May 2025', time: '10:00 AM', venue: 'Physics Lab 1', type: 'Competition', status: 'Upcoming' },
    { id: 'act-2', clubId: 'club-debate', title: 'All-India Inter-School Model UN', date: '02 June 2025', time: '11:30 AM', venue: 'Main Auditorium', type: 'External Event', status: 'Registration Open' },
    { id: 'act-3', clubId: 'club-music', title: 'Annual Symphony Concert', date: '10 June 2025', time: '05:00 PM', venue: 'Open Amphitheatre', type: 'Performance', status: 'Rehearsals Ongoing' },
    { id: 'act-4', clubId: 'club-photo', title: 'Summer Landscape Photo Exhibition', date: '15 June 2025', time: '09:00 AM', venue: 'Creative Arts Center', type: 'Exhibition', status: 'Submissions Open' },
    { id: 'act-5', clubId: 'club-science', title: 'Science Innovation Fair & Lab Demo', date: '28 May 2025', time: '09:30 AM', venue: 'Physics Lab 2', type: 'Exhibition', status: 'Upcoming' },
    { id: 'act-6', clubId: 'club-literary', title: 'Creative Writing Workshop', date: '05 June 2025', time: '02:00 PM', venue: 'Seminar Hall B', type: 'Workshop', status: 'Upcoming' }
  ];

  db.clubEnrollments = [];

  // Seed club enrollments deterministically for all 10 students (max 2 clubs joined)
  db.students.forEach((student, idx) => {
    // Primary club enrollment
    const primaryClubIdx = idx % db.clubs.length;
    db.clubEnrollments.push({
      id: `enroll-${student.id}-1`,
      studentId: student.id,
      clubId: db.clubs[primaryClubIdx].id,
      role: idx % 3 === 0 ? 'Core Member' : idx % 3 === 1 ? 'Volunteer' : 'Member',
      joinedDate: '2024-07-20',
      status: 'Active',
      badges: idx % 3 === 0 ? ['Outstanding Contributor'] : []
    });

    // Secondary club enrollment (for max 2 clubs rule)
    if (idx % 2 === 0) {
      const secondaryClubIdx = (idx + 2) % db.clubs.length;
      db.clubEnrollments.push({
        id: `enroll-${student.id}-2`,
        studentId: student.id,
        clubId: db.clubs[secondaryClubIdx].id,
        role: 'Member',
        joinedDate: '2024-08-15',
        status: 'Active',
        badges: []
      });
    }
  });
};
