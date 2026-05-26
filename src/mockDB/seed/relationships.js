/**
 * High-fidelity Relational Seed Data
 *
 * Defines the core relationships: students, parents, teachers, transport,
 * finance, notices, events, clubs, achievements, and mentorship sessions.
 */

// export const baseStudents = [
//   {
//     studentId: "stud-001",
//     id: "stud-001",
//     admissionNo: "ADM2026001",
//     name: "Rohan Kumar",
//     classId: "class-11a", // XI-A Science Non-Medical
//     classLevel: "11",
//     section: "A",
//     stream: "Science Non-Medical",
//     streamId: "SCIENCE_NON_MEDICAL",
//     userId: "user-stud-1",
//     parentIds: ["parent-001"],
//     category: "General",
//     dob: "2008-04-12",
//     aadhar: "4532-9812-7364",
//     houseGroup: "Saturn (Blue)",
//     admissionDate: "2024-04-05",
//     gender: "Male",
//     nationality: "Indian",
//     phoneNumber: "+91 98765 43210",
//     motherName: "Kiran Kumar",
//     motherPhone: "+91 98765 99001",
//     motherOccupation: "Home Maker",
//     fatherOccupation: "Business Executive",
//     fatherPhone: "+91 98765 88001",
//     parentLinkage: {
//       parentId: "parent-001",
//       fatherName: "Rajesh Kumar",
//       fatherPhone: "+91 98765 88001",
//       fatherOccupation: "Business Executive",
//       motherName: "Kiran Kumar",
//       motherPhone: "+91 98765 99001",
//       motherOccupation: "Home Maker",
//     },
//     guardianLinkage: {
//       name: "Rajesh Kumar",
//       relation: "Father",
//       phone: "+91 98765 88001",
//     },
//     emergencyContacts: [
//       { name: "Kiran Kumar", relation: "Mother", phone: "+91 98765 99001" },
//     ],
//     siblingMetadata: [
//       {
//         studentId: "stud-006",
//         name: "Siddharth Kumar",
//         admissionNo: "ADM2026006",
//         relationship: "Sibling",
//       },
//       {
//         studentId: "stud-011",
//         name: "Aarav Gupta",
//         admissionNo: "ADM2026011",
//         relationship: "Sibling",
//       },
//     ],
//   },
//   {
//     studentId: "stud-002",
//     id: "stud-002",
//     admissionNo: "ADM2026002",
//     name: "Priya Sharma",
//     classId: "class-11b", // XI-B Science Medical
//     classLevel: "11",
//     section: "B",
//     stream: "Science Medical",
//     streamId: "SCIENCE_MEDICAL",
//     userId: "user-stud-2",
//     parentIds: ["parent-002"],
//     category: "General",
//     dob: "2008-08-18",
//     aadhar: "8721-6543-9801",
//     houseGroup: "Jupiter (Yellow)",
//     admissionDate: "2024-04-06",
//     gender: "Female",
//     nationality: "Indian",
//     phoneNumber: "+91 98765 43211",
//     motherName: "Sushma Sharma",
//     motherPhone: "+91 98765 99002",
//     motherOccupation: "Lecturer",
//     fatherOccupation: "Chartered Accountant",
//     fatherPhone: "+91 98765 88002",
//     parentLinkage: {
//       parentId: "parent-002",
//       fatherName: "Suresh Sharma",
//       fatherPhone: "+91 98765 88002",
//       fatherOccupation: "Chartered Accountant",
//       motherName: "Sushma Sharma",
//       motherPhone: "+91 98765 99002",
//       motherOccupation: "Lecturer",
//     },
//     guardianLinkage: {
//       name: "Suresh Sharma",
//       relation: "Father",
//       phone: "+91 98765 88002",
//     },
//     emergencyContacts: [
//       { name: "Sushma Sharma", relation: "Mother", phone: "+91 98765 99002" },
//     ],
//     siblingMetadata: [
//       {
//         studentId: "stud-012",
//         name: "Meera Patel",
//         admissionNo: "ADM2026012",
//         relationship: "Sibling",
//       },
//     ],
//   },
//   {
//     studentId: "stud-003",
//     id: "stud-003",
//     admissionNo: "ADM2026003",
//     name: "Rahul Verma",
//     classId: "class-11a", // XI-A Science Non-Medical
//     classLevel: "11",
//     section: "A",
//     stream: "Science Non-Medical",
//     streamId: "SCIENCE_NON_MEDICAL",
//     userId: "user-stud-3",
//     parentIds: ["parent-003"],
//     category: "OBC",
//     dob: "2008-11-22",
//     aadhar: "3210-9876-5432",
//     houseGroup: "Mars (Red)",
//     admissionDate: "2024-04-05",
//     gender: "Male",
//     nationality: "Indian",
//     phoneNumber: "+91 98765 43212",
//     motherName: "Meena Verma",
//     motherPhone: "+91 98765 99003",
//     motherOccupation: "Bank Manager",
//     fatherOccupation: "Software Architect",
//     fatherPhone: "+91 98765 88003",
//     parentLinkage: {
//       parentId: "parent-003",
//       fatherName: "Rajesh Verma",
//       fatherPhone: "+91 98765 88003",
//       fatherOccupation: "Software Architect",
//       motherName: "Meena Verma",
//       motherPhone: "+91 98765 99003",
//       motherOccupation: "Bank Manager",
//     },
//     guardianLinkage: {
//       name: "Meena Verma",
//       relation: "Mother",
//       phone: "+91 98765 99003",
//     },
//     emergencyContacts: [
//       { name: "Meena Verma", relation: "Mother", phone: "+91 98765 99003" },
//     ],
//     siblingMetadata: [
//       {
//         studentId: "stud-007",
//         name: "Ishani Verma",
//         admissionNo: "ADM2026007",
//         relationship: "Sibling",
//       },
//       {
//         studentId: "stud-013",
//         name: "Kunal Sen",
//         admissionNo: "ADM2026013",
//         relationship: "Sibling",
//       },
//     ],
//   },
//   {
//     studentId: "stud-004",
//     id: "stud-004",
//     admissionNo: "ADM2026004",
//     name: "Ananya Iyer",
//     classId: "class-11c", // XI-C Commerce
//     classLevel: "11",
//     section: "C",
//     stream: "Commerce",
//     streamId: "COMMERCE",
//     userId: "user-stud-4",
//     parentIds: ["parent-004"],
//     category: "General",
//     dob: "2008-01-30",
//     aadhar: "6543-2109-8765",
//     houseGroup: "Neptune (Green)",
//     admissionDate: "2024-04-08",
//     gender: "Female",
//     nationality: "Indian",
//     phoneNumber: "+91 98765 43213",
//     motherName: "Lakshmi Iyer",
//     motherPhone: "+91 98765 99004",
//     motherOccupation: "Journalist",
//     fatherOccupation: "Financial Consultant",
//     fatherPhone: "+91 98765 88004",
//     parentLinkage: {
//       parentId: "parent-004",
//       fatherName: "Karthik Iyer",
//       fatherPhone: "+91 98765 88004",
//       fatherOccupation: "Financial Consultant",
//       motherName: "Lakshmi Iyer",
//       motherPhone: "+91 98765 99004",
//       motherOccupation: "Journalist",
//     },
//     guardianLinkage: {
//       name: "Karthik Iyer",
//       relation: "Father",
//       phone: "+91 98765 88004",
//     },
//     emergencyContacts: [
//       { name: "Lakshmi Iyer", relation: "Mother", phone: "+91 98765 99004" },
//     ],
//     siblingMetadata: [
//       {
//         studentId: "stud-014",
//         name: "Diya Reddy",
//         admissionNo: "ADM2026014",
//         relationship: "Sibling",
//       },
//     ],
//   },
//   {
//     studentId: "stud-005",
//     id: "stud-005",
//     admissionNo: "ADM2026005",
//     name: "Vikram Singh",
//     classId: "class-11d", // 11-D Humanities
//     classLevel: "11",
//     section: "D",
//     stream: "Humanities",
//     streamId: "HUMANITIES",
//     userId: "user-stud-5",
//     parentIds: ["parent-005"],
//     category: "SC",
//     dob: "2008-05-15",
//     aadhar: "9876-5432-1098",
//     houseGroup: "Saturn (Blue)",
//     admissionDate: "2024-04-09",
//     gender: "Male",
//     nationality: "Indian",
//     phoneNumber: "+91 98765 43214",
//     motherName: "Gurpreet Kaur",
//     motherPhone: "+91 98765 99005",
//     motherOccupation: "Teacher",
//     fatherOccupation: "Defense Officer",
//     fatherPhone: "+91 98765 88005",
//     parentLinkage: {
//       parentId: "parent-005",
//       fatherName: "Harpreet Singh",
//       fatherPhone: "+91 98765 88005",
//       fatherOccupation: "Defense Officer",
//       motherName: "Gurpreet Kaur",
//       motherPhone: "+91 98765 99005",
//       motherOccupation: "Teacher",
//     },
//     guardianLinkage: {
//       name: "Harpreet Singh",
//       relation: "Father",
//       phone: "+91 98765 88005",
//     },
//     emergencyContacts: [
//       { name: "Gurpreet Kaur", relation: "Mother", phone: "+91 98765 99005" },
//     ],
//     siblingMetadata: [],
//   },
//   {
//     studentId: "stud-006",
//     id: "stud-006",
//     admissionNo: "ADM2026006",
//     name: "Siddharth Kumar",
//     classId: "class-11a", // XI-A Science Non-Medical
//     classLevel: "11",
//     section: "A",
//     stream: "Science Non-Medical",
//     streamId: "SCIENCE_NON_MEDICAL",
//     userId: "user-stud-6",
//     parentIds: ["parent-001"],
//     category: "General",
//     dob: "2007-03-04",
//     aadhar: "1234-5678-9012",
//     houseGroup: "Saturn (Blue)",
//     admissionDate: "2024-04-04",
//     gender: "Male",
//     nationality: "Indian",
//     phoneNumber: "+91 98765 43215",
//     motherName: "Kiran Kumar",
//     motherPhone: "+91 98765 99001",
//     motherOccupation: "Home Maker",
//     fatherOccupation: "Business Executive",
//     fatherPhone: "+91 98765 88001",
//     parentLinkage: {
//       parentId: "parent-001",
//       fatherName: "Rajesh Kumar",
//       fatherPhone: "+91 98765 88001",
//       fatherOccupation: "Business Executive",
//       motherName: "Kiran Kumar",
//       motherPhone: "+91 98765 99001",
//       motherOccupation: "Home Maker",
//     },
//     guardianLinkage: {
//       name: "Rajesh Kumar",
//       relation: "Father",
//       phone: "+91 98765 88001",
//     },
//     emergencyContacts: [
//       { name: "Kiran Kumar", relation: "Mother", phone: "+91 98765 99001" },
//     ],
//     siblingMetadata: [
//       {
//         studentId: "stud-001",
//         name: "Rohan Kumar",
//         admissionNo: "ADM2026001",
//         relationship: "Sibling",
//       },
//       {
//         studentId: "stud-011",
//         name: "Aarav Gupta",
//         admissionNo: "ADM2026011",
//         relationship: "Sibling",
//       },
//     ],
//   },
//   {
//     studentId: "stud-007",
//     id: "stud-007",
//     admissionNo: "ADM2026007",
//     name: "Ishani Verma",
//     classId: "class-11b", // XI-B Science Medical
//     classLevel: "11",
//     section: "B",
//     stream: "Science Medical",
//     streamId: "SCIENCE_MEDICAL",
//     userId: "user-stud-7",
//     parentIds: ["parent-003"],
//     category: "OBC",
//     dob: "2007-09-12",
//     aadhar: "3456-7890-1234",
//     houseGroup: "Mars (Red)",
//     admissionDate: "2023-04-04",
//     gender: "Female",
//     nationality: "Indian",
//     phoneNumber: "+91 98765 43216",
//     motherName: "Meena Verma",
//     motherPhone: "+91 98765 99003",
//     motherOccupation: "Bank Manager",
//     fatherOccupation: "Software Architect",
//     fatherPhone: "+91 98765 88003",
//     parentLinkage: {
//       parentId: "parent-003",
//       fatherName: "Rajesh Verma",
//       fatherPhone: "+91 98765 88003",
//       fatherOccupation: "Software Architect",
//       motherName: "Meena Verma",
//       motherPhone: "+91 98765 99003",
//       motherOccupation: "Bank Manager",
//     },
//     guardianLinkage: {
//       name: "Meena Verma",
//       relation: "Mother",
//       phone: "+91 98765 99003",
//     },
//     emergencyContacts: [
//       { name: "Meena Verma", relation: "Mother", phone: "+91 98765 99003" },
//     ],
//     siblingMetadata: [
//       {
//         studentId: "stud-003",
//         name: "Rahul Verma",
//         admissionNo: "ADM2026003",
//         relationship: "Sibling",
//       },
//       {
//         studentId: "stud-013",
//         name: "Kunal Sen",
//         admissionNo: "ADM2026013",
//         relationship: "Sibling",
//       },
//     ],
//   },
//   {
//     studentId: "stud-008",
//     id: "stud-008",
//     admissionNo: "ADM2026008",
//     name: "Arjun Mehra",
//     classId: "class-11c", // XI-C Commerce
//     classLevel: "11",
//     section: "C",
//     stream: "Commerce",
//     streamId: "COMMERCE",
//     userId: "user-stud-8",
//     parentIds: ["parent-006"],
//     category: "General",
//     dob: "2007-06-25",
//     aadhar: "5678-9012-3456",
//     houseGroup: "Jupiter (Yellow)",
//     admissionDate: "2024-04-05",
//     gender: "Male",
//     nationality: "Indian",
//     phoneNumber: "+91 98765 43217",
//     motherName: "Ritu Mehra",
//     motherPhone: "+91 98765 99006",
//     motherOccupation: "Interior Designer",
//     fatherOccupation: "Senior Advocate",
//     fatherPhone: "+91 98765 88006",
//     parentLinkage: {
//       parentId: "parent-006",
//       fatherName: "Amit Mehra",
//       fatherPhone: "+91 98765 88006",
//       fatherOccupation: "Senior Advocate",
//       motherName: "Ritu Mehra",
//       motherPhone: "+91 98765 99006",
//       motherOccupation: "Interior Designer",
//     },
//     guardianLinkage: {
//       name: "Amit Mehra",
//       relation: "Father",
//       phone: "+91 98765 88006",
//     },
//     emergencyContacts: [
//       { name: "Ritu Mehra", relation: "Mother", phone: "+91 98765 99006" },
//     ],
//     siblingMetadata: [],
//   },
//   {
//     studentId: "stud-009",
//     id: "stud-009",
//     admissionNo: "ADM2026009",
//     name: "Zoya Khan",
//     classId: "class-11d", // 11-D Humanities
//     classLevel: "11",
//     section: "D",
//     stream: "Humanities",
//     streamId: "HUMANITIES",
//     userId: "user-stud-9",
//     parentIds: ["parent-007"],
//     category: "General",
//     dob: "2007-12-05",
//     aadhar: "7890-1234-5678",
//     houseGroup: "Neptune (Green)",
//     admissionDate: "2024-04-06",
//     gender: "Female",
//     nationality: "Indian",
//     phoneNumber: "+91 98765 43218",
//     motherName: "Yasmin Khan",
//     motherPhone: "+91 98765 99007",
//     motherOccupation: "Fashion Designer",
//     fatherOccupation: "Architect",
//     fatherPhone: "+91 98765 88007",
//     parentLinkage: {
//       parentId: "parent-007",
//       fatherName: "Farhan Khan",
//       fatherPhone: "+91 98765 88007",
//       fatherOccupation: "Architect",
//       motherName: "Yasmin Khan",
//       motherPhone: "+91 98765 99007",
//       motherOccupation: "Fashion Designer",
//     },
//     guardianLinkage: {
//       name: "Farhan Khan",
//       relation: "Father",
//       phone: "+91 98765 88007",
//     },
//     emergencyContacts: [
//       { name: "Yasmin Khan", relation: "Mother", phone: "+91 98765 99007" },
//     ],
//     siblingMetadata: [],
//   },
//   {
//     studentId: "stud-010",
//     id: "stud-010",
//     admissionNo: "ADM2026010",
//     name: "Kabir Das",
//     classId: "class-11c", // XI-C Commerce
//     classLevel: "11",
//     section: "C",
//     stream: "Commerce",
//     streamId: "COMMERCE",
//     userId: "user-stud-10",
//     parentIds: ["parent-008"],
//     category: "SC",
//     dob: "2007-10-10",
//     aadhar: "9012-3456-7890",
//     houseGroup: "Jupiter (Yellow)",
//     admissionDate: "2024-04-06",
//     gender: "Male",
//     nationality: "Indian",
//     phoneNumber: "+91 98765 43219",
//     motherName: "Saraswati Das",
//     motherPhone: "+91 98765 99008",
//     motherOccupation: "Primary Teacher",
//     fatherOccupation: "Government Servant",
//     fatherPhone: "+91 98765 88008",
//     parentLinkage: {
//       parentId: "parent-008",
//       fatherName: "Laxman Das",
//       fatherPhone: "+91 98765 88008",
//       fatherOccupation: "Government Servant",
//       motherName: "Saraswati Das",
//       motherPhone: "+91 98765 99008",
//       motherOccupation: "Primary Teacher",
//     },
//     guardianLinkage: {
//       name: "Laxman Das",
//       relation: "Father",
//       phone: "+91 98765 88008",
//     },
//     emergencyContacts: [
//       { name: "Saraswati Das", relation: "Mother", phone: "+91 98765 99008" },
//     ],
//     siblingMetadata: [],
//   },
//   {
//     studentId: "stud-011",
//     id: "stud-011",
//     admissionNo: "ADM2026011",
//     name: "Aarav Gupta",
//     classId: "class-nurserya",
//     classLevel: "Nursery",
//     section: "A",
//     stream: null,
//     streamId: null,
//     userId: "user-stud-11",
//     parentIds: ["parent-001"],
//     category: "General",
//     dob: "2022-05-10",
//     aadhar: "1111-2222-3333",
//     houseGroup: "Mars (Red)",
//     admissionDate: "2024-04-10",
//     gender: "Male",
//     nationality: "Indian",
//     phoneNumber: "+91 98765 43220",
//     motherName: "Sneha Gupta",
//     motherPhone: "+91 98765 99011",
//     motherOccupation: "Consultant",
//     fatherOccupation: "Business Analyst",
//     fatherPhone: "+91 98765 88011",
//     parentLinkage: {
//       parentId: "parent-001",
//       fatherName: "Rajesh Kumar",
//       fatherPhone: "+91 98765 88011",
//       fatherOccupation: "Business Analyst",
//       motherName: "Sneha Gupta",
//       motherPhone: "+91 98765 99011",
//       motherOccupation: "Consultant",
//     },
//     guardianLinkage: {
//       name: "Rajesh Kumar",
//       relation: "Father",
//       phone: "+91 98765 88011",
//     },
//     emergencyContacts: [
//       { name: "Sneha Gupta", relation: "Mother", phone: "+91 98765 99011" },
//     ],
//     siblingMetadata: [
//       {
//         studentId: "stud-001",
//         name: "Rohan Kumar",
//         admissionNo: "ADM2026001",
//         relationship: "Sibling",
//       },
//       {
//         studentId: "stud-006",
//         name: "Siddharth Kumar",
//         admissionNo: "ADM2026006",
//         relationship: "Sibling",
//       },
//     ],
//   },
//   {
//     studentId: "stud-012",
//     id: "stud-012",
//     admissionNo: "ADM2026012",
//     name: "Meera Patel",
//     classId: "class-7b",
//     classLevel: "7",
//     section: "B",
//     stream: null,
//     streamId: null,
//     userId: "user-stud-12",
//     parentIds: ["parent-002"],
//     category: "OBC",
//     dob: "2014-08-14",
//     aadhar: "4444-5555-6666",
//     houseGroup: "Jupiter (Yellow)",
//     admissionDate: "2022-04-05",
//     gender: "Female",
//     nationality: "Indian",
//     phoneNumber: "+91 98765 43221",
//     motherName: "Alpa Patel",
//     motherPhone: "+91 98765 99012",
//     motherOccupation: "Pharmacist",
//     fatherOccupation: "Software Developer",
//     fatherPhone: "+91 98765 88012",
//     parentLinkage: {
//       parentId: "parent-002",
//       fatherName: "Suresh Sharma",
//       fatherPhone: "+91 98765 88012",
//       fatherOccupation: "Software Developer",
//       motherName: "Alpa Patel",
//       motherPhone: "+91 98765 99012",
//       motherOccupation: "Pharmacist",
//     },
//     guardianLinkage: {
//       name: "Suresh Sharma",
//       relation: "Father",
//       phone: "+91 98765 88012",
//     },
//     emergencyContacts: [
//       { name: "Alpa Patel", relation: "Mother", phone: "+91 98765 99012" },
//     ],
//     siblingMetadata: [
//       {
//         studentId: "stud-002",
//         name: "Priya Sharma",
//         admissionNo: "ADM2026002",
//         relationship: "Sibling",
//       },
//     ],
//   },
//   {
//     studentId: "stud-013",
//     id: "stud-013",
//     admissionNo: "ADM2026013",
//     name: "Kunal Sen",
//     classId: "class-12c",
//     classLevel: "12",
//     section: "C",
//     stream: "Commerce",
//     streamId: "COMMERCE",
//     userId: "user-stud-13",
//     parentIds: ["parent-003"],
//     category: "General",
//     dob: "2007-03-20",
//     aadhar: "7777-8888-9999",
//     houseGroup: "Saturn (Blue)",
//     admissionDate: "2023-04-06",
//     gender: "Male",
//     nationality: "Indian",
//     phoneNumber: "+91 98765 43222",
//     motherName: "Rina Sen",
//     motherPhone: "+91 98765 99013",
//     motherOccupation: "Home Maker",
//     fatherOccupation: "Government Director",
//     fatherPhone: "+91 98765 88013",
//     parentLinkage: {
//       parentId: "parent-003",
//       fatherName: "Subhash Sen",
//       fatherPhone: "+91 98765 88013",
//       fatherOccupation: "Government Director",
//       motherName: "Rina Sen",
//       motherPhone: "+91 98765 99013",
//       motherOccupation: "Home Maker",
//     },
//     guardianLinkage: {
//       name: "Subhash Sen",
//       relation: "Father",
//       phone: "+91 98765 88013",
//     },
//     emergencyContacts: [
//       { name: "Rina Sen", relation: "Mother", phone: "+91 98765 99013" },
//     ],
//     siblingMetadata: [
//       {
//         studentId: "stud-003",
//         name: "Rahul Verma",
//         admissionNo: "ADM2026003",
//         relationship: "Sibling",
//       },
//       {
//         studentId: "stud-007",
//         name: "Ishani Verma",
//         admissionNo: "ADM2026007",
//         relationship: "Sibling",
//       },
//     ],
//   },
//   {
//     studentId: "stud-014",
//     id: "stud-014",
//     admissionNo: "ADM2026014",
//     name: "Diya Reddy",
//     classId: "class-10d",
//     classLevel: "10",
//     section: "D",
//     stream: null,
//     streamId: null,
//     userId: "user-stud-14",
//     parentIds: ["parent-004"],
//     category: "ST",
//     dob: "2011-11-05",
//     aadhar: "1212-3434-5656",
//     houseGroup: "Neptune (Green)",
//     admissionDate: "2020-04-08",
//     gender: "Female",
//     nationality: "Indian",
//     phoneNumber: "+91 98765 43223",
//     motherName: "Lalitha Reddy",
//     motherPhone: "+91 98765 99014",
//     motherOccupation: "Bank PO",
//     fatherOccupation: "Senior Manager",
//     fatherPhone: "+91 98765 88014",
//     parentLinkage: {
//       parentId: "parent-004",
//       fatherName: "Anil Reddy",
//       fatherPhone: "+91 98765 88014",
//       fatherOccupation: "Senior Manager",
//       motherName: "Lalitha Reddy",
//       motherPhone: "+91 98765 99014",
//       motherOccupation: "Bank PO",
//     },
//     guardianLinkage: {
//       name: "Anil Reddy",
//       relation: "Father",
//       phone: "+91 98765 88014",
//     },
//     emergencyContacts: [
//       { name: "Lalitha Reddy", relation: "Mother", phone: "+91 98765 99014" },
//     ],
//     siblingMetadata: [
//       {
//         studentId: "stud-004",
//         name: "Ananya Iyer",
//         admissionNo: "ADM2026004",
//         relationship: "Sibling",
//       },
//     ],
//   },
// ];

// export const baseParents = [
//   {
//     id: "parent-001",
//     name: "Rajesh Kumar",
//     userId: "user-parent-1",
//     childIds: ["stud-001", "stud-006", "stud-011"],
//   },
//   {
//     id: "parent-002",
//     name: "Suresh Sharma",
//     userId: "user-parent-2",
//     childIds: ["stud-002", "stud-012"],
//   },
//   {
//     id: "parent-003",
//     name: "Meena Verma",
//     userId: "user-parent-3",
//     childIds: ["stud-003", "stud-007", "stud-013"],
//   },
//   {
//     id: "parent-004",
//     name: "Karthik Iyer",
//     userId: "user-parent-4",
//     childIds: ["stud-004", "stud-014"],
//   },
//   {
//     id: "parent-005",
//     name: "Harpreet Singh",
//     userId: "user-parent-5",
//     childIds: ["stud-005"],
//   },
//   {
//     id: "parent-006",
//     name: "Amit Mehra",
//     userId: "user-parent-6",
//     childIds: ["stud-008"],
//   },
//   {
//     id: "parent-007",
//     name: "Farhan Khan",
//     userId: "user-parent-7",
//     childIds: ["stud-009"],
//   },
//   {
//     id: "parent-008",
//     name: "Lata Das",
//     userId: "user-parent-8",
//     childIds: ["stud-010"],
//   },
// ];

export const baseTeachers = [
  {
    teacherId: "teach-001",
    id: "teach-001",
    employeeId: "EMP001",
    name: "Dr. Sarah Wilson",
    userId: "user-teach-1",
    homeroom: "class-11a", // Class Teacher: 11-A (Science Non-Medical)
    assignedClasses: ["class-11a", "class-11b"], // teaches Physics to 11-A and 11-B
    assignedClassIds: ["class-11a", "class-11b"],
    assignedSections: ["A", "B"],
    specializationSubjectId: "sub-phy", // SPECIALIZATION: Physics ONLY
    subjectId: "sub-phy",
    designation: "Senior Physics Teacher",
    department: "Science",
    phoneNumber: "+91 98765 43210",
    email: "sarah.wilson@school.edu",
    emergencyContact: "+91 98765 11111",
    address: "12, Park Street, New Delhi, India",
    dob: "1985-04-12",
    gender: "Female",
    qualification: "Ph.D. in Physics, M.Sc. in Physics (University of Delhi)",
    experience: "12 Years of Senior Secondary Teaching",
    certifications:
      "CBSE Board Examiner Panelist, National Science Teacher Excellence 2024",
    subjectSpecialization:
      "Quantum Mechanics, Electromagnetism, Practical Physics",
    joiningDate: "2018-07-01",
    committeeMembership: "Academic Advisory Board, Science Fair Convener",
  },
  {
    teacherId: "teach-002",
    id: "teach-002",
    employeeId: "EMP002",
    name: "Mrs. Priya Nair",
    userId: "user-teach-2",
    homeroom: "class-11b", // Class Teacher: XI-B (Science Medical)
    assignedClasses: ["class-11b"], // teaches Biology to XI-B
    assignedClassIds: ["class-11b"],
    assignedSections: ["B"],
    specializationSubjectId: "sub-bio", // SPECIALIZATION: Biology ONLY
    subjectId: "sub-bio",
    designation: "Senior Biology Teacher",
    department: "Science",
    phoneNumber: "+91 98765 43211",
    email: "priya.nair@school.edu",
    emergencyContact: "+91 98765 22222",
    address: "45, Golf Links Road, New Delhi, India",
    dob: "1987-09-23",
    gender: "Female",
    qualification: "M.Sc. in Botany, B.Ed. (University of Kerala)",
    experience: "10 Years of Secondary Teaching",
    certifications: "Advanced Biotech Mentorship Training",
    subjectSpecialization: "Plant Physiology, Genetics, Microbiology",
    joiningDate: "2020-04-15",
    committeeMembership: "Eco Club Coordinator, Disciplinary Committee Member",
  },
  {
    teacherId: "teach-003",
    id: "teach-003",
    employeeId: "EMP003",
    name: "Mrs. Elena Gilbert",
    userId: "user-teach-3",
    homeroom: "class-11c", // Class Teacher: 11-C (Commerce)
    assignedClasses: ["class-11c", "class-11a", "class-11b", "class-11d"], // English shared across all sections
    assignedClassIds: ["class-11c", "class-11a", "class-11b", "class-11d"],
    assignedSections: ["A", "B", "C", "D"],
    specializationSubjectId: "sub-eng", // SPECIALIZATION: English ONLY
    subjectId: "sub-eng",
    designation: "Senior English Teacher",
    department: "Languages",
    phoneNumber: "+91 98765 43212",
    email: "elena.gilbert@school.edu",
    emergencyContact: "+91 98765 33333",
    address: "78, Vasant Vihar, Sector 3, New Delhi, India",
    dob: "1984-06-18",
    gender: "Female",
    qualification: "M.A. in English, B.Ed. (Jamia Millia Islamia)",
    experience: "15 Years of CBSE Senior Secondary Teaching",
    certifications: "CBSE English Workshop Lead, Trinity CertTESOL",
    subjectSpecialization: "Modern English Literature, Creative Writing, Drama",
    joiningDate: "2016-01-10",
    committeeMembership:
      "Literary Society President, School Magazine Chief Editor",
  },
  {
    teacherId: "teach-004",
    id: "teach-004",
    employeeId: "EMP004",
    name: "Mr. Kiran Desai",
    userId: "user-teach-4",
    homeroom: "class-11d", // Class Teacher: 11-D (Humanities)
    assignedClasses: ["class-11d"], // teaches History to 11-D
    assignedClassIds: ["class-11d"],
    assignedSections: ["D"],
    specializationSubjectId: "sub-his", // SPECIALIZATION: History ONLY
    subjectId: "sub-his",
    designation: "Senior History Teacher",
    department: "Humanities",
    phoneNumber: "+91 98765 43213",
    email: "kiran.desai@school.edu",
    emergencyContact: "+91 98765 44444",
    address: "89, Defence Colony, New Delhi, India",
    dob: "1982-11-05",
    gender: "Male",
    qualification: "M.A. in History, UGC-NET Qualified",
    experience: "18 Years of High School Education",
    certifications:
      "Archaeological Survey Study Program, Model United Nations Director",
    subjectSpecialization:
      "World Civilizations, Indian History, Historiography",
    joiningDate: "2012-07-15",
    committeeMembership:
      "School MUN Advisor, Debate and Declamation Club Convener",
  },
  {
    teacherId: "teach-005",
    id: "teach-005",
    employeeId: "EMP005",
    name: "Mr. Rajesh Sharma",
    userId: "user-teach-5",
    homeroom: null, // Subject Teacher Only
    assignedClasses: ["class-11b"], // teaches PE to XI-B (Science Medical)
    assignedClassIds: ["class-11b"],
    assignedSections: ["B"],
    specializationSubjectId: "sub-pe", // SPECIALIZATION: Physical Education ONLY
    subjectId: "sub-pe",
    designation: "Senior Physical Education Teacher",
    department: "Physical Education",
    phoneNumber: "+91 98765 43214",
    email: "rajesh.sharma@school.edu",
    emergencyContact: "+91 98765 55555",
    address: "102, Saket Residential Complex, New Delhi, India",
    dob: "1989-02-28",
    gender: "Male",
    qualification:
      "M.P.Ed (Master of Physical Education), Dip. in Sports Coaching (NSNIS)",
    experience: "8 Years in Athletic Training and Coaching",
    certifications:
      "First Aid & CPR Certified (Red Cross), SAI Athletics Coach",
    subjectSpecialization:
      "Track & Field, Sports Nutrition, Physical Conditioning",
    joiningDate: "2021-08-01",
    committeeMembership:
      "Sports Committee Secretary, Annual Athletic Meet Organizer",
  },
  {
    teacherId: "teach-006",
    id: "teach-006",
    employeeId: "EMP006",
    name: "Dr. Ananya Gupta",
    userId: "user-teach-6",
    homeroom: null,
    assignedClasses: ["class-11a", "class-11b"], // teaches Chemistry to both Science streams
    assignedClassIds: ["class-11a", "class-11b"],
    assignedSections: ["A", "B"],
    specializationSubjectId: "sub-chem", // SPECIALIZATION: Chemistry ONLY
    subjectId: "sub-chem",
    designation: "Senior Chemistry Teacher",
    department: "Science",
    phoneNumber: "+91 98765 43215",
    email: "ananya.gupta@school.edu",
    emergencyContact: "+91 98765 66666",
    address: "45, Rajouri Garden, New Delhi, India",
    dob: "1986-03-15",
    gender: "Female",
    qualification: "Ph.D. in Chemistry, M.Sc. Organic Chemistry (IIT Delhi)",
    experience: "11 Years of Senior Secondary Teaching",
    certifications: "CSIR NET Qualified, CBSE Chemistry Panel Member",
    subjectSpecialization:
      "Organic Chemistry, Chemical Kinetics, Laboratory Safety",
    joiningDate: "2019-06-15",
    committeeMembership: "Science Fair Coordinator, Lab Safety Committee Head",
  },
  {
    teacherId: "teach-007",
    id: "teach-007",
    employeeId: "EMP007",
    name: "Mr. Vikram Singh",
    userId: "user-teach-7",
    homeroom: null,
    assignedClasses: ["class-11a"], // teaches Mathematics to 11-A (Science Non-Medical)
    assignedClassIds: ["class-11a"],
    assignedSections: ["A"],
    specializationSubjectId: "sub-math", // SPECIALIZATION: Mathematics ONLY
    subjectId: "sub-math",
    designation: "Senior Mathematics Teacher",
    department: "Mathematics",
    phoneNumber: "+91 98765 43216",
    email: "vikram.singh@school.edu",
    emergencyContact: "+91 98765 77777",
    address: "78, Dwarka Sector 12, New Delhi, India",
    dob: "1983-07-22",
    gender: "Male",
    qualification: "M.Sc. in Mathematics, B.Ed. (University of Delhi)",
    experience: "14 Years of Secondary Teaching",
    certifications: "IMO Mentor, NCERT Mathematics Workshop Trainer",
    subjectSpecialization: "Calculus, Linear Algebra, Mathematical Modeling",
    joiningDate: "2015-04-10",
    committeeMembership: "Mathematics Olympiad Coach, Quiz Club Convener",
  },
  {
    teacherId: "teach-008",
    id: "teach-008",
    employeeId: "EMP008",
    name: "Mrs. Priya Malhotra",
    userId: "user-teach-8",
    homeroom: null,
    assignedClasses: ["class-11c"], // teaches Accountancy to XI-C (Commerce)
    assignedClassIds: ["class-11c"],
    assignedSections: ["C"],
    specializationSubjectId: "sub-acc", // SPECIALIZATION: Accountancy ONLY
    subjectId: "sub-acc",
    designation: "Senior Accountancy Teacher",
    department: "Commerce",
    phoneNumber: "+91 98765 43217",
    email: "priya.malhotra@school.edu",
    emergencyContact: "+91 98765 88888",
    address: "23, Pitampura, New Delhi, India",
    dob: "1985-11-08",
    gender: "Female",
    qualification: "M.Com, CA Inter, B.Ed. (Delhi University)",
    experience: "12 Years in Commerce Education",
    certifications: "CA Foundation Trainer, Financial Literacy Educator",
    subjectSpecialization: "Financial Accounting, Corporate Accounts, Auditing",
    joiningDate: "2017-07-20",
    committeeMembership: "Commerce Club Advisor, Entrepreneurship Cell Mentor",
  },
  {
    teacherId: "teach-009",
    id: "teach-009",
    employeeId: "EMP009",
    name: "Mr. Arun Khanna",
    userId: "user-teach-9",
    homeroom: null,
    assignedClasses: ["class-11c"], // teaches Business Studies to XI-C (Commerce)
    assignedClassIds: ["class-11c"],
    assignedSections: ["C"],
    specializationSubjectId: "sub-bst", // SPECIALIZATION: Business Studies ONLY
    subjectId: "sub-bst",
    designation: "Senior Business Studies Teacher",
    department: "Commerce",
    phoneNumber: "+91 98765 43218",
    email: "arun.khanna@school.edu",
    emergencyContact: "+91 98765 99999",
    address: "56, Janakpuri, New Delhi, India",
    dob: "1981-09-12",
    gender: "Male",
    qualification: "MBA (Marketing), B.Ed. (Symbiosis)",
    experience: "16 Years in Business Education",
    certifications: "Startup India Mentor, Case Study Teaching Certified",
    subjectSpecialization:
      "Marketing Management, Business Strategy, Entrepreneurship",
    joiningDate: "2013-05-01",
    committeeMembership:
      "Business Club President, Alumni Relations Coordinator",
  },
  {
    teacherId: "teach-010",
    id: "teach-010",
    employeeId: "EMP010",
    name: "Dr. Meera Reddy",
    userId: "user-teach-10",
    homeroom: null,
    assignedClasses: ["class-11c", "class-11d"], // teaches Economics to XI-C and XI-D
    assignedClassIds: ["class-11c", "class-11d"],
    assignedSections: ["C", "D"],
    specializationSubjectId: "sub-eco", // SPECIALIZATION: Economics ONLY
    subjectId: "sub-eco",
    designation: "Senior Economics Teacher",
    department: "Social Sciences",
    phoneNumber: "+91 98765 43219",
    email: "meera.reddy@school.edu",
    emergencyContact: "+91 98765 00000",
    address: "89, Greater Kailash II, New Delhi, India",
    dob: "1984-04-25",
    gender: "Female",
    qualification: "Ph.D. in Economics, M.A. Economics (JNU)",
    experience: "13 Years in Economics Education",
    certifications: "NCERT Economics Panel, RBI Monetary Policy Workshop",
    subjectSpecialization:
      "Macroeconomics, International Trade, Development Economics",
    joiningDate: "2016-08-15",
    committeeMembership:
      "Economics Club Advisor, Social Science Exhibition Coordinator",
  },
  {
    teacherId: "teach-011",
    id: "teach-011",
    employeeId: "EMP011",
    name: "Mr. Sanjay Kumar",
    userId: "user-teach-11",
    homeroom: null,
    assignedClasses: ["class-11d"], // teaches Political Science to 11-D (Humanities)
    assignedClassIds: ["class-11d"],
    assignedSections: ["D"],
    specializationSubjectId: "sub-pol", // SPECIALIZATION: Political Science ONLY
    subjectId: "sub-pol",
    designation: "Senior Political Science Teacher",
    department: "Humanities",
    phoneNumber: "+91 98765 43220",
    email: "sanjay.kumar@school.edu",
    emergencyContact: "+91 98765 11112",
    address: "34, Vasant Kunj, New Delhi, India",
    dob: "1979-12-03",
    gender: "Male",
    qualification: "M.A. in Political Science, LL.B. (Delhi University)",
    experience: "19 Years in Humanities Education",
    certifications:
      "Constitutional Law Expert, Election Commission Resource Person",
    subjectSpecialization:
      "Political Theory, Indian Constitution, International Relations",
    joiningDate: "2010-07-01",
    committeeMembership: "Model UN Coordinator, Debate Club Mentor",
  },
  {
    teacherId: "teach-012",
    id: "teach-012",
    employeeId: "EMP012",
    name: "Mrs. Deepa Sharma",
    userId: "user-teach-12",
    homeroom: null,
    assignedClasses: ["class-11d"], // teaches Geography to XI-D (Humanities)
    assignedClassIds: ["class-11d"],
    assignedSections: ["D"],
    specializationSubjectId: "sub-geo", // SPECIALIZATION: Geography ONLY
    subjectId: "sub-geo",
    designation: "Senior Geography Teacher",
    department: "Humanities",
    phoneNumber: "+91 98765 43221",
    email: "deepa.sharma@school.edu",
    emergencyContact: "+91 98765 22223",
    address: "67, Rohini Sector 9, New Delhi, India",
    dob: "1987-06-18",
    gender: "Female",
    qualification: "M.A. in Geography, B.Ed. (Kurukshetra University)",
    experience: "9 Years in Geography Education",
    certifications: "GIS Mapping Certified, NCERT Geography Workshop",
    subjectSpecialization:
      "Physical Geography, Cartography, Environmental Studies",
    joiningDate: "2020-04-15",
    committeeMembership: "Nature Club Coordinator, Field Trip Organizer",
  },
  {
    teacherId: "teach-013",
    id: "teach-013",
    employeeId: "EMP013",
    name: "Mr. Rahul Verma",
    userId: "user-teach-13",
    homeroom: null,
    assignedClasses: ["class-11a"], // teaches Computer Science to XI-A (Science Non-Medical)
    assignedClassIds: ["class-11a"],
    assignedSections: ["A"],
    specializationSubjectId: "sub-cs", // SPECIALIZATION: Computer Science ONLY
    subjectId: "sub-cs",
    designation: "Senior Computer Science Teacher",
    department: "Computer Science",
    phoneNumber: "+91 98765 43222",
    email: "rahul.verma@school.edu",
    emergencyContact: "+91 98765 33334",
    address: "12, Noida Sector 62, Uttar Pradesh, India",
    dob: "1988-02-14",
    gender: "Male",
    qualification: "M.Tech in Computer Science, B.Ed. (Amity University)",
    experience: "7 Years in Computer Science Education",
    certifications: "Google Certified Educator, Python Institute PCAP",
    subjectSpecialization: "Data Structures, Algorithms, Python Programming",
    joiningDate: "2022-07-10",
    committeeMembership: "Coding Club Mentor, Tech Symposium Organizer",
  },
  {
    teacherId: "teach-014",
    id: "teach-014",
    employeeId: "EMP014",
    name: "Mrs. Anjali Patel",
    userId: "user-teach-14",
    homeroom: null,
    assignedClasses: ["class-11c"], // teaches Informatics Practices to 11-C (Commerce)
    assignedClassIds: ["class-11c"],
    assignedSections: ["C"],
    specializationSubjectId: "sub-ip", // SPECIALIZATION: Information Practices ONLY
    subjectId: "sub-ip",
    designation: "Senior Information Practices Teacher",
    department: "Computer Science",
    phoneNumber: "+91 98765 43223",
    email: "anjali.patel@school.edu",
    emergencyContact: "+91 98765 44445",
    address: "89, Ghaziabad, Uttar Pradesh, India",
    dob: "1990-08-30",
    gender: "Female",
    qualification:
      "M.Sc. in IT, B.Ed. (Indira Gandhi National Open University)",
    experience: "6 Years in IT Education",
    certifications: "Oracle SQL Certified, Microsoft Office Specialist",
    subjectSpecialization: "Database Management, SQL, Web Development",
    joiningDate: "2023-04-01",
    committeeMembership: "IT Club Coordinator, Digital Literacy Trainer",
  },
  // ============================================
  // FOUNDATION TEACHERS (Nursery-Class 4): Section-Homeroom Style
  // One teacher teaches ALL subjects for their assigned section
  // ============================================
  {
    teacherId: "teach-015",
    id: "teach-015",
    employeeId: "EMP015",
    name: "Sunita Sharma",
    userId: "user-teach-15",
    homeroom: "class-nurserya",
    assignedClasses: ["class-nurserya"],
    assignedClassIds: ["class-nurserya"],
    assignedSections: ["A"],
    assignedLevels: ["Nursery"],
    specializationSubjectId: "multi-subject",
    subjectId: "multi-subject",
    designation: "Primary Teacher",
    department: "Foundation Stage",
    phoneNumber: "+91 98765 43224",
    email: "sunita.sharma@school.edu",
    emergencyContact: "+91 98765 55556",
    address: "45, School Road, New Delhi, India",
    dob: "1990-03-15",
    gender: "Female",
    qualification: "B.El.Ed with NTT Certification",
    experience: "5 Years of Early Childhood Education",
    certifications: "Montessori Training, Child Psychology Workshop",
    subjectSpecialization:
      "All Foundation Subjects (Rhymes, Drawing, Storytelling, EVS)",
    joiningDate: "2020-04-01",
    committeeMembership: "Cultural Committee, Parent-Teacher Association",
    teacherType: "section-homeroom",
  },
  {
    teacherId: "teach-016",
    id: "teach-016",
    employeeId: "EMP016",
    name: "Meena Gupta",
    userId: "user-teach-16",
    homeroom: "class-nurseryb",
    assignedClasses: ["class-nurseryb"],
    assignedClassIds: ["class-nurseryb"],
    assignedSections: ["B"],
    assignedLevels: ["Nursery"],
    specializationSubjectId: "multi-subject",
    subjectId: "multi-subject",
    designation: "Primary Teacher",
    department: "Foundation Stage",
    phoneNumber: "+91 98765 43225",
    email: "meena.gupta@school.edu",
    emergencyContact: "+91 98765 55557",
    address: "23, School Road, New Delhi, India",
    dob: "1988-07-22",
    gender: "Female",
    qualification: "B.El.Ed with NTT Certification",
    experience: "7 Years of Early Childhood Education",
    certifications: "Montessori Training",
    subjectSpecialization: "All Foundation Subjects",
    joiningDate: "2018-04-01",
    committeeMembership: "Cultural Committee",
    teacherType: "section-homeroom",
  },
  {
    teacherId: "teach-017",
    id: "teach-017",
    employeeId: "EMP017",
    name: "Kavita Verma",
    userId: "user-teach-17",
    homeroom: "class-nurseryc",
    assignedClasses: ["class-nurseryc"],
    assignedClassIds: ["class-nurseryc"],
    assignedSections: ["C"],
    assignedLevels: ["Nursery"],
    specializationSubjectId: "multi-subject",
    subjectId: "multi-subject",
    designation: "Primary Teacher",
    department: "Foundation Stage",
    phoneNumber: "+91 98765 43226",
    email: "kavita.verma@school.edu",
    emergencyContact: "+91 98765 55558",
    address: "67, School Road, New Delhi, India",
    dob: "1992-11-08",
    gender: "Female",
    qualification: "D.El.Ed with NTT",
    experience: "4 Years of Early Childhood Education",
    certifications: "Early Childhood Care Certificate",
    subjectSpecialization: "All Foundation Subjects",
    joiningDate: "2021-04-01",
    committeeMembership: "Parent-Teacher Association",
    teacherType: "section-homeroom",
  },
  {
    teacherId: "teach-018",
    id: "teach-018",
    employeeId: "EMP018",
    name: "Rekha Singh",
    userId: "user-teach-18",
    homeroom: "class-nurseryd",
    assignedClasses: ["class-nurseryd"],
    assignedClassIds: ["class-nurseryd"],
    assignedSections: ["D"],
    assignedLevels: ["Nursery"],
    specializationSubjectId: "multi-subject",
    subjectId: "multi-subject",
    designation: "Primary Teacher",
    department: "Foundation Stage",
    phoneNumber: "+91 98765 43227",
    email: "rekha.singh@school.edu",
    emergencyContact: "+91 98765 55559",
    address: "89, School Road, New Delhi, India",
    dob: "1989-05-30",
    gender: "Female",
    qualification: "B.El.Ed",
    experience: "6 Years of Early Childhood Education",
    certifications: "Child Development Workshop",
    subjectSpecialization: "All Foundation Subjects",
    joiningDate: "2019-04-01",
    committeeMembership: "Cultural Committee",
    teacherType: "section-homeroom",
  },
  // LKG Teachers
  {
    teacherId: "teach-019",
    id: "teach-019",
    employeeId: "EMP019",
    name: "Anita Patel",
    userId: "user-teach-19",
    homeroom: "class-lkga",
    assignedClasses: ["class-lkga"],
    assignedClassIds: ["class-lkga"],
    assignedSections: ["A"],
    assignedLevels: ["LKG"],
    specializationSubjectId: "multi-subject",
    subjectId: "multi-subject",
    designation: "Primary Teacher",
    department: "Foundation Stage",
    phoneNumber: "+91 98765 43228",
    email: "anita.patel@school.edu",
    emergencyContact: "+91 98765 55560",
    address: "12, School Road, New Delhi, India",
    dob: "1991-09-14",
    gender: "Female",
    qualification: "B.El.Ed with NTT",
    experience: "5 Years of Early Childhood Education",
    certifications: "Montessori Training",
    subjectSpecialization: "All Foundation Subjects",
    joiningDate: "2020-04-01",
    committeeMembership: "Cultural Committee",
    teacherType: "section-homeroom",
  },
  {
    teacherId: "teach-020",
    id: "teach-020",
    employeeId: "EMP020",
    name: "Sunita Reddy",
    userId: "user-teach-20",
    homeroom: "class-lkgb",
    assignedClasses: ["class-lkgb"],
    assignedClassIds: ["class-lkgb"],
    assignedSections: ["B"],
    assignedLevels: ["LKG"],
    specializationSubjectId: "multi-subject",
    subjectId: "multi-subject",
    designation: "Primary Teacher",
    department: "Foundation Stage",
    phoneNumber: "+91 98765 43229",
    email: "sunita.reddy@school.edu",
    emergencyContact: "+91 98765 55561",
    address: "34, School Road, New Delhi, India",
    dob: "1987-12-25",
    gender: "Female",
    qualification: "D.El.Ed",
    experience: "8 Years of Early Childhood Education",
    certifications: "Early Childhood Education Certificate",
    subjectSpecialization: "All Foundation Subjects",
    joiningDate: "2017-04-01",
    committeeMembership: "Parent-Teacher Association",
    teacherType: "section-homeroom",
  },
  {
    teacherId: "teach-021",
    id: "teach-021",
    employeeId: "EMP021",
    name: "Lakshmi Iyer",
    userId: "user-teach-21",
    homeroom: "class-lkgc",
    assignedClasses: ["class-lkgc"],
    assignedClassIds: ["class-lkgc"],
    assignedSections: ["C"],
    assignedLevels: ["LKG"],
    specializationSubjectId: "multi-subject",
    subjectId: "multi-subject",
    designation: "Primary Teacher",
    department: "Foundation Stage",
    phoneNumber: "+91 98765 43230",
    email: "lakshmi.iyer@school.edu",
    emergencyContact: "+91 98765 55562",
    address: "56, School Road, New Delhi, India",
    dob: "1993-02-18",
    gender: "Female",
    qualification: "B.El.Ed",
    experience: "3 Years of Early Childhood Education",
    certifications: "NTT Certification",
    subjectSpecialization: "All Foundation Subjects",
    joiningDate: "2022-04-01",
    committeeMembership: "Cultural Committee",
    teacherType: "section-homeroom",
  },
  {
    teacherId: "teach-022",
    id: "teach-022",
    employeeId: "EMP022",
    name: "Savita Menon",
    userId: "user-teach-22",
    homeroom: "class-lkgd",
    assignedClasses: ["class-lkgd"],
    assignedClassIds: ["class-lkgd"],
    assignedSections: ["D"],
    assignedLevels: ["LKG"],
    specializationSubjectId: "multi-subject",
    subjectId: "multi-subject",
    designation: "Primary Teacher",
    department: "Foundation Stage",
    phoneNumber: "+91 98765 43231",
    email: "savita.menon@school.edu",
    emergencyContact: "+91 98765 55563",
    address: "78, School Road, New Delhi, India",
    dob: "1990-06-10",
    gender: "Female",
    qualification: "D.El.Ed with NTT",
    experience: "6 Years of Early Childhood Education",
    certifications: "Child Psychology Workshop",
    subjectSpecialization: "All Foundation Subjects",
    joiningDate: "2019-04-01",
    committeeMembership: "Parent-Teacher Association",
    teacherType: "section-homeroom",
  },
  // UKG Teachers
  {
    teacherId: "teach-023",
    id: "teach-023",
    employeeId: "EMP023",
    name: "Geeta Kumar",
    userId: "user-teach-23",
    homeroom: "class-ukga",
    assignedClasses: ["class-ukga"],
    assignedClassIds: ["class-ukga"],
    assignedSections: ["A"],
    assignedLevels: ["UKG"],
    specializationSubjectId: "multi-subject",
    subjectId: "multi-subject",
    designation: "Primary Teacher",
    department: "Foundation Stage",
    phoneNumber: "+91 98765 43232",
    email: "geeta.kumar@school.edu",
    emergencyContact: "+91 98765 55564",
    address: "90, School Road, New Delhi, India",
    dob: "1989-08-05",
    gender: "Female",
    qualification: "B.El.Ed",
    experience: "7 Years of Early Childhood Education",
    certifications: "Montessori Training",
    subjectSpecialization: "All Foundation Subjects",
    joiningDate: "2018-04-01",
    committeeMembership: "Cultural Committee",
    teacherType: "section-homeroom",
  },
  {
    teacherId: "teach-024",
    id: "teach-024",
    employeeId: "EMP024",
    name: "Seema Sharma",
    userId: "user-teach-24",
    homeroom: "class-ukgb",
    assignedClasses: ["class-ukgb"],
    assignedClassIds: ["class-ukgb"],
    assignedSections: ["B"],
    assignedLevels: ["UKG"],
    specializationSubjectId: "multi-subject",
    subjectId: "multi-subject",
    designation: "Primary Teacher",
    department: "Foundation Stage",
    phoneNumber: "+91 98765 43233",
    email: "seema.sharma@school.edu",
    emergencyContact: "+91 98765 55565",
    address: "21, School Road, New Delhi, India",
    dob: "1992-04-22",
    gender: "Female",
    qualification: "D.El.Ed",
    experience: "5 Years of Early Childhood Education",
    certifications: "Early Childhood Care",
    subjectSpecialization: "All Foundation Subjects",
    joiningDate: "2020-04-01",
    committeeMembership: "Parent-Teacher Association",
    teacherType: "section-homeroom",
  },
  {
    teacherId: "teach-025",
    id: "teach-025",
    employeeId: "EMP025",
    name: "Neeta Gupta",
    userId: "user-teach-25",
    homeroom: "class-ukgc",
    assignedClasses: ["class-ukgc"],
    assignedClassIds: ["class-ukgc"],
    assignedSections: ["C"],
    assignedLevels: ["UKG"],
    specializationSubjectId: "multi-subject",
    subjectId: "multi-subject",
    designation: "Primary Teacher",
    department: "Foundation Stage",
    phoneNumber: "+91 98765 43234",
    email: "neeta.gupta@school.edu",
    emergencyContact: "+91 98765 55566",
    address: "43, School Road, New Delhi, India",
    dob: "1991-11-30",
    gender: "Female",
    qualification: "B.El.Ed with NTT",
    experience: "4 Years of Early Childhood Education",
    certifications: "Child Development Certificate",
    subjectSpecialization: "All Foundation Subjects",
    joiningDate: "2021-04-01",
    committeeMembership: "Cultural Committee",
    teacherType: "section-homeroom",
  },
  {
    teacherId: "teach-026",
    id: "teach-026",
    employeeId: "EMP026",
    name: "Deepa Singh",
    userId: "user-teach-26",
    homeroom: "class-ukgd",
    assignedClasses: ["class-ukgd"],
    assignedClassIds: ["class-ukgd"],
    assignedSections: ["D"],
    assignedLevels: ["UKG"],
    specializationSubjectId: "multi-subject",
    subjectId: "multi-subject",
    designation: "Primary Teacher",
    department: "Foundation Stage",
    phoneNumber: "+91 98765 43235",
    email: "deepa.singh@school.edu",
    emergencyContact: "+91 98765 55567",
    address: "65, School Road, New Delhi, India",
    dob: "1988-03-17",
    gender: "Female",
    qualification: "D.El.Ed",
    experience: "8 Years of Early Childhood Education",
    certifications: "Montessori Training",
    subjectSpecialization: "All Foundation Subjects",
    joiningDate: "2017-04-01",
    committeeMembership: "Parent-Teacher Association",
    teacherType: "section-homeroom",
  },
  // Class 1 Teachers
  {
    teacherId: "teach-027",
    id: "teach-027",
    employeeId: "EMP027",
    name: "Suman Patel",
    userId: "user-teach-27",
    homeroom: "class-1a",
    assignedClasses: ["class-1a"],
    assignedClassIds: ["class-1a"],
    assignedSections: ["A"],
    assignedLevels: ["1"],
    specializationSubjectId: "multi-subject",
    subjectId: "multi-subject",
    designation: "Primary Teacher",
    department: "Primary School",
    phoneNumber: "+91 98765 43236",
    email: "suman.patel@school.edu",
    emergencyContact: "+91 98765 55568",
    address: "17, School Road, New Delhi, India",
    dob: "1990-07-09",
    gender: "Female",
    qualification: "B.El.Ed",
    experience: "6 Years of Primary Education",
    certifications: "Primary Teaching Certificate",
    subjectSpecialization: "All Class 1 Subjects (English, Hindi, Math, EVS)",
    joiningDate: "2019-04-01",
    committeeMembership: "Cultural Committee",
    teacherType: "section-homeroom",
  },
  {
    teacherId: "teach-028",
    id: "teach-028",
    employeeId: "EMP028",
    name: "Anjali Verma",
    userId: "user-teach-28",
    homeroom: "class-1b",
    assignedClasses: ["class-1b"],
    assignedClassIds: ["class-1b"],
    assignedSections: ["B"],
    assignedLevels: ["1"],
    specializationSubjectId: "multi-subject",
    subjectId: "multi-subject",
    designation: "Primary Teacher",
    department: "Primary School",
    phoneNumber: "+91 98765 43237",
    email: "anjali.verma@school.edu",
    emergencyContact: "+91 98765 55569",
    address: "39, School Road, New Delhi, India",
    dob: "1993-01-25",
    gender: "Female",
    qualification: "D.El.Ed",
    experience: "4 Years of Primary Education",
    certifications: "Primary Education Workshop",
    subjectSpecialization: "All Class 1 Subjects",
    joiningDate: "2022-04-01",
    committeeMembership: "Parent-Teacher Association",
    teacherType: "section-homeroom",
  },
  {
    teacherId: "teach-029",
    id: "teach-029",
    employeeId: "EMP029",
    name: "Pooja Sharma",
    userId: "user-teach-29",
    homeroom: "class-1c",
    assignedClasses: ["class-1c"],
    assignedClassIds: ["class-1c"],
    assignedSections: ["C"],
    assignedLevels: ["1"],
    specializationSubjectId: "multi-subject",
    subjectId: "multi-subject",
    designation: "Primary Teacher",
    department: "Primary School",
    phoneNumber: "+91 98765 43238",
    email: "pooja.sharma@school.edu",
    emergencyContact: "+91 98765 55570",
    address: "51, School Road, New Delhi, India",
    dob: "1991-10-12",
    gender: "Female",
    qualification: "B.El.Ed with NTT",
    experience: "5 Years of Primary Education",
    certifications: "Child Development Training",
    subjectSpecialization: "All Class 1 Subjects",
    joiningDate: "2020-04-01",
    committeeMembership: "Cultural Committee",
    teacherType: "section-homeroom",
  },
  {
    teacherId: "teach-030",
    id: "teach-030",
    employeeId: "EMP030",
    name: "Ritu Gupta",
    userId: "user-teach-30",
    homeroom: "class-1d",
    assignedClasses: ["class-1d"],
    assignedClassIds: ["class-1d"],
    assignedSections: ["D"],
    assignedLevels: ["1"],
    specializationSubjectId: "multi-subject",
    subjectId: "multi-subject",
    designation: "Primary Teacher",
    department: "Primary School",
    phoneNumber: "+91 98765 43239",
    email: "ritu.gupta@school.edu",
    emergencyContact: "+91 98765 55571",
    address: "73, School Road, New Delhi, India",
    dob: "1989-05-03",
    gender: "Female",
    qualification: "D.El.Ed",
    experience: "7 Years of Primary Education",
    certifications: "Primary Teaching Certificate",
    subjectSpecialization: "All Class 1 Subjects",
    joiningDate: "2018-04-01",
    committeeMembership: "Parent-Teacher Association",
    teacherType: "section-homeroom",
  },
  // Class 2-4 Teachers (Section-homeroom style)
  {
    teacherId: "teach-031",
    id: "teach-031",
    employeeId: "EMP031",
    name: "Neha Singh",
    userId: "user-teach-31",
    homeroom: "class-2a",
    assignedClasses: ["class-2a"],
    assignedClassIds: ["class-2a"],
    assignedSections: ["A"],
    assignedLevels: ["2"],
    specializationSubjectId: "multi-subject",
    subjectId: "multi-subject",
    designation: "Junior Teacher",
    department: "Primary School",
    phoneNumber: "+91 98765 43240",
    email: "neha.singh@school.edu",
    emergencyContact: "+91 98765 55572",
    address: "25, School Road, New Delhi, India",
    dob: "1992-08-19",
    gender: "Female",
    qualification: "B.El.Ed",
    experience: "5 Years of Primary Education",
    certifications: "Primary Education Certificate",
    subjectSpecialization:
      "All Class 2 Subjects (English, Hindi, Math, EVS, GK, Computer)",
    joiningDate: "2020-04-01",
    committeeMembership: "Cultural Committee",
    teacherType: "section-homeroom",
  },
  {
    teacherId: "teach-032",
    id: "teach-032",
    employeeId: "EMP032",
    name: "Shweta Kumar",
    userId: "user-teach-32",
    homeroom: "class-2b",
    assignedClasses: ["class-2b"],
    assignedClassIds: ["class-2b"],
    assignedSections: ["B"],
    assignedLevels: ["2"],
    specializationSubjectId: "multi-subject",
    subjectId: "multi-subject",
    designation: "Junior Teacher",
    department: "Primary School",
    phoneNumber: "+91 98765 43241",
    email: "shweta.kumar@school.edu",
    emergencyContact: "+91 98765 55573",
    address: "47, School Road, New Delhi, India",
    dob: "1990-12-07",
    gender: "Female",
    qualification: "D.El.Ed",
    experience: "7 Years of Primary Education",
    certifications: "Computer Literacy Training",
    subjectSpecialization: "All Class 2 Subjects",
    joiningDate: "2018-04-01",
    committeeMembership: "Parent-Teacher Association",
    teacherType: "section-homeroom",
  },
  {
    teacherId: "teach-033",
    id: "teach-033",
    employeeId: "EMP033",
    name: "Divya Verma",
    userId: "user-teach-33",
    homeroom: "class-2c",
    assignedClasses: ["class-2c"],
    assignedClassIds: ["class-2c"],
    assignedSections: ["C"],
    assignedLevels: ["2"],
    specializationSubjectId: "multi-subject",
    subjectId: "multi-subject",
    designation: "Junior Teacher",
    department: "Primary School",
    phoneNumber: "+91 98765 43242",
    email: "divya.verma@school.edu",
    emergencyContact: "+91 98765 55574",
    address: "69, School Road, New Delhi, India",
    dob: "1993-04-14",
    gender: "Female",
    qualification: "B.El.Ed",
    experience: "4 Years of Primary Education",
    certifications: "Primary Education Workshop",
    subjectSpecialization: "All Class 2 Subjects",
    joiningDate: "2021-04-01",
    committeeMembership: "Cultural Committee",
    teacherType: "section-homeroom",
  },
  {
    teacherId: "teach-034",
    id: "teach-034",
    employeeId: "EMP034",
    name: "Kiran Sharma",
    userId: "user-teach-34",
    homeroom: "class-2d",
    assignedClasses: ["class-2d"],
    assignedClassIds: ["class-2d"],
    assignedSections: ["D"],
    assignedLevels: ["2"],
    specializationSubjectId: "multi-subject",
    subjectId: "multi-subject",
    designation: "Junior Teacher",
    department: "Primary School",
    phoneNumber: "+91 98765 43243",
    email: "kiran.sharma@school.edu",
    emergencyContact: "+91 98765 55575",
    address: "81, School Road, New Delhi, India",
    dob: "1991-02-28",
    gender: "Female",
    qualification: "D.El.Ed",
    experience: "6 Years of Primary Education",
    certifications: "Child Development Certificate",
    subjectSpecialization: "All Class 2 Subjects",
    joiningDate: "2019-04-01",
    committeeMembership: "Parent-Teacher Association",
    teacherType: "section-homeroom",
  },
  // Class 3 Teachers
  {
    teacherId: "teach-035",
    id: "teach-035",
    employeeId: "EMP035",
    name: "Rashmi Gupta",
    userId: "user-teach-35",
    homeroom: "class-3a",
    assignedClasses: ["class-3a"],
    assignedClassIds: ["class-3a"],
    assignedSections: ["A"],
    assignedLevels: ["3"],
    specializationSubjectId: "multi-subject",
    subjectId: "multi-subject",
    designation: "Junior Teacher",
    department: "Primary School",
    phoneNumber: "+91 98765 43244",
    email: "rashmi.gupta@school.edu",
    emergencyContact: "+91 98765 55576",
    address: "33, School Road, New Delhi, India",
    dob: "1989-09-21",
    gender: "Female",
    qualification: "B.El.Ed",
    experience: "8 Years of Primary Education",
    certifications: "Primary Education Certificate",
    subjectSpecialization: "All Class 3 Subjects",
    joiningDate: "2017-04-01",
    committeeMembership: "Cultural Committee",
    teacherType: "section-homeroom",
  },
  {
    teacherId: "teach-036",
    id: "teach-036",
    employeeId: "EMP036",
    name: "Sangeeta Singh",
    userId: "user-teach-36",
    homeroom: "class-3b",
    assignedClasses: ["class-3b"],
    assignedClassIds: ["class-3b"],
    assignedSections: ["B"],
    assignedLevels: ["3"],
    specializationSubjectId: "multi-subject",
    subjectId: "multi-subject",
    designation: "Junior Teacher",
    department: "Primary School",
    phoneNumber: "+91 98765 43245",
    email: "sangeeta.singh@school.edu",
    emergencyContact: "+91 98765 55577",
    address: "55, School Road, New Delhi, India",
    dob: "1992-06-15",
    gender: "Female",
    qualification: "D.El.Ed",
    experience: "5 Years of Primary Education",
    certifications: "Computer Training Certificate",
    subjectSpecialization: "All Class 3 Subjects",
    joiningDate: "2020-04-01",
    committeeMembership: "Parent-Teacher Association",
    teacherType: "section-homeroom",
  },
  {
    teacherId: "teach-037",
    id: "teach-037",
    employeeId: "EMP037",
    name: "Archana Patel",
    userId: "user-teach-37",
    homeroom: "class-3c",
    assignedClasses: ["class-3c"],
    assignedClassIds: ["class-3c"],
    assignedSections: ["C"],
    assignedLevels: ["3"],
    specializationSubjectId: "multi-subject",
    subjectId: "multi-subject",
    designation: "Junior Teacher",
    department: "Primary School",
    phoneNumber: "+91 98765 43246",
    email: "archana.patel@school.edu",
    emergencyContact: "+91 98765 55578",
    address: "77, School Road, New Delhi, India",
    dob: "1990-11-03",
    gender: "Female",
    qualification: "B.El.Ed",
    experience: "6 Years of Primary Education",
    certifications: "Primary Education Workshop",
    subjectSpecialization: "All Class 3 Subjects",
    joiningDate: "2019-04-01",
    committeeMembership: "Cultural Committee",
    teacherType: "section-homeroom",
  },
  {
    teacherId: "teach-038",
    id: "teach-038",
    employeeId: "EMP038",
    name: "Sarita Verma",
    userId: "user-teach-38",
    homeroom: "class-3d",
    assignedClasses: ["class-3d"],
    assignedClassIds: ["class-3d"],
    assignedSections: ["D"],
    assignedLevels: ["3"],
    specializationSubjectId: "multi-subject",
    subjectId: "multi-subject",
    designation: "Junior Teacher",
    department: "Primary School",
    phoneNumber: "+91 98765 43247",
    email: "sarita.verma@school.edu",
    emergencyContact: "+91 98765 55579",
    address: "19, School Road, New Delhi, India",
    dob: "1993-03-26",
    gender: "Female",
    qualification: "D.El.Ed",
    experience: "4 Years of Primary Education",
    certifications: "Child Development Training",
    subjectSpecialization: "All Class 3 Subjects",
    joiningDate: "2021-04-01",
    committeeMembership: "Parent-Teacher Association",
    teacherType: "section-homeroom",
  },
  // Class 4 Teachers
  {
    teacherId: "teach-039",
    id: "teach-039",
    employeeId: "EMP039",
    name: "Geeta Kumar",
    userId: "user-teach-39",
    homeroom: "class-4a",
    assignedClasses: ["class-4a"],
    assignedClassIds: ["class-4a"],
    assignedSections: ["A"],
    assignedLevels: ["4"],
    specializationSubjectId: "multi-subject",
    subjectId: "multi-subject",
    designation: "Junior Teacher",
    department: "Primary School",
    phoneNumber: "+91 98765 43248",
    email: "geeta.kumar@school.edu",
    emergencyContact: "+91 98765 55580",
    address: "41, School Road, New Delhi, India",
    dob: "1988-07-31",
    gender: "Female",
    qualification: "B.El.Ed",
    experience: "9 Years of Primary Education",
    certifications: "Primary Education Certificate",
    subjectSpecialization: "All Class 4 Subjects",
    joiningDate: "2016-04-01",
    committeeMembership: "Cultural Committee",
    teacherType: "section-homeroom",
  },
  {
    teacherId: "teach-040",
    id: "teach-040",
    employeeId: "EMP040",
    name: "Seema Sharma",
    userId: "user-teach-40",
    homeroom: "class-4b",
    assignedClasses: ["class-4b"],
    assignedClassIds: ["class-4b"],
    assignedSections: ["B"],
    assignedLevels: ["4"],
    specializationSubjectId: "multi-subject",
    subjectId: "multi-subject",
    designation: "Junior Teacher",
    department: "Primary School",
    phoneNumber: "+91 98765 43249",
    email: "seema.sharma@school.edu",
    emergencyContact: "+91 98765 55581",
    address: "63, School Road, New Delhi, India",
    dob: "1991-05-18",
    gender: "Female",
    qualification: "D.El.Ed",
    experience: "6 Years of Primary Education",
    certifications: "Computer Literacy Certificate",
    subjectSpecialization: "All Class 4 Subjects",
    joiningDate: "2019-04-01",
    committeeMembership: "Parent-Teacher Association",
    teacherType: "section-homeroom",
  },
  {
    teacherId: "teach-041",
    id: "teach-041",
    employeeId: "EMP041",
    name: "Neeta Gupta",
    userId: "user-teach-41",
    homeroom: "class-4c",
    assignedClasses: ["class-4c"],
    assignedClassIds: ["class-4c"],
    assignedSections: ["C"],
    assignedLevels: ["4"],
    specializationSubjectId: "multi-subject",
    subjectId: "multi-subject",
    designation: "Junior Teacher",
    department: "Primary School",
    phoneNumber: "+91 98765 43250",
    email: "neeta.gupta@school.edu",
    emergencyContact: "+91 98765 55582",
    address: "85, School Road, New Delhi, India",
    dob: "1992-10-09",
    gender: "Female",
    qualification: "B.El.Ed",
    experience: "5 Years of Primary Education",
    certifications: "Primary Education Workshop",
    subjectSpecialization: "All Class 4 Subjects",
    joiningDate: "2020-04-01",
    committeeMembership: "Cultural Committee",
    teacherType: "section-homeroom",
  },
  {
    teacherId: "teach-042",
    id: "teach-042",
    employeeId: "EMP042",
    name: "Deepa Singh",
    userId: "user-teach-42",
    homeroom: "class-4d",
    assignedClasses: ["class-4d"],
    assignedClassIds: ["class-4d"],
    assignedSections: ["D"],
    assignedLevels: ["4"],
    specializationSubjectId: "multi-subject",
    subjectId: "multi-subject",
    designation: "Junior Teacher",
    department: "Primary School",
    phoneNumber: "+91 98765 43251",
    email: "deepa.singh@school.edu",
    emergencyContact: "+91 98765 55583",
    address: "27, School Road, New Delhi, India",
    dob: "1990-02-14",
    gender: "Female",
    qualification: "D.El.Ed",
    experience: "7 Years of Primary Education",
    certifications: "Child Development Certificate",
    subjectSpecialization: "All Class 4 Subjects",
    joiningDate: "2018-04-01",
    committeeMembership: "Parent-Teacher Association",
    teacherType: "section-homeroom",
  },
  // ============================================
  // CLASS 5-12: SUBJECT-SPECIALIZED TEACHERS
  // ONE teacher = ONE subject specialization ONLY
  // ============================================
  // English Teachers (Class 5-12)
  {
    teacherId: "teach-043",
    id: "teach-043",
    employeeId: "EMP043",
    name: "Mrs. Kavita Roy",
    userId: "user-teach-43",
    homeroom: "class-5a",
    assignedClasses: [
      "class-5a",
      "class-5b",
      "class-5c",
      "class-5d",
      "class-6a",
      "class-6b",
    ],
    assignedClassIds: [
      "class-5a",
      "class-5b",
      "class-5c",
      "class-5d",
      "class-6a",
      "class-6b",
    ],
    assignedSections: ["A", "B", "C", "D"],
    assignedLevels: ["5", "6"],
    specializationSubjectId: "sub-eng",
    subjectId: "sub-eng",
    designation: "Trained Graduate Teacher (TGT)",
    department: "Languages",
    phoneNumber: "+91 98765 43252",
    email: "kavita.roy@school.edu",
    emergencyContact: "+91 98765 55584",
    address: "15, Civil Lines, New Delhi, India",
    dob: "1985-03-22",
    gender: "Female",
    qualification: "M.A. in English, B.Ed. with NET",
    experience: "12 Years of English Teaching",
    certifications: "CBSE English Examiner, Creative Writing Workshop",
    subjectSpecialization: "English Literature, Grammar, Communication Skills",
    joiningDate: "2013-07-01",
    committeeMembership: "Literary Society, School Magazine Editorial Board",
    teacherType: "subject-specialized",
  },
  {
    teacherId: "teach-044",
    id: "teach-044",
    employeeId: "EMP044",
    name: "Mrs. Rina Das",
    userId: "user-teach-44",
    homeroom: null,
    assignedClasses: [
      "class-6c",
      "class-6d",
      "class-7a",
      "class-7b",
      "class-7c",
      "class-7d",
    ],
    assignedClassIds: [
      "class-6c",
      "class-6d",
      "class-7a",
      "class-7b",
      "class-7c",
      "class-7d",
    ],
    assignedSections: ["A", "B", "C", "D"],
    assignedLevels: ["6", "7"],
    specializationSubjectId: "sub-eng",
    subjectId: "sub-eng",
    designation: "Trained Graduate Teacher (TGT)",
    department: "Languages",
    phoneNumber: "+91 98765 43253",
    email: "rina.das@school.edu",
    emergencyContact: "+91 98765 55585",
    address: "38, Civil Lines, New Delhi, India",
    dob: "1987-08-11",
    gender: "Female",
    qualification: "M.A. in English, B.Ed.",
    experience: "10 Years of English Teaching",
    certifications: "English Language Teaching Certificate",
    subjectSpecialization: "English Literature, Grammar",
    joiningDate: "2015-07-01",
    committeeMembership: "Literary Society",
    teacherType: "subject-specialized",
  },
  {
    teacherId: "teach-045",
    id: "teach-045",
    employeeId: "EMP045",
    name: "Mr. Amit Bose",
    userId: "user-teach-45",
    homeroom: null,
    assignedClasses: [
      "class-8a",
      "class-8b",
      "class-8c",
      "class-8d",
      "class-9a",
      "class-9b",
    ],
    assignedClassIds: [
      "class-8a",
      "class-8b",
      "class-8c",
      "class-8d",
      "class-9a",
      "class-9b",
    ],
    assignedSections: ["A", "B", "C", "D"],
    assignedLevels: ["8", "9"],
    specializationSubjectId: "sub-eng",
    subjectId: "sub-eng",
    designation: "Post Graduate Teacher (PGT)",
    department: "Languages",
    phoneNumber: "+91 98765 43254",
    email: "amit.bose@school.edu",
    emergencyContact: "+91 98765 55586",
    address: "52, Civil Lines, New Delhi, India",
    dob: "1982-05-29",
    gender: "Male",
    qualification: "M.A. in English, B.Ed. with NET",
    experience: "15 Years of English Teaching",
    certifications: "CBSE English Examiner, Debate Coach",
    subjectSpecialization: "English Literature, Creative Writing, Drama",
    joiningDate: "2010-07-01",
    committeeMembership: "Literary Society President, Debate Club",
    teacherType: "subject-specialized",
  },
  {
    teacherId: "teach-046",
    id: "teach-046",
    employeeId: "EMP046",
    name: "Mrs. Sengupta",
    userId: "user-teach-46",
    homeroom: null,
    assignedClasses: [
      "class-9c",
      "class-9d",
      "class-10a",
      "class-10b",
      "class-10c",
      "class-10d",
    ],
    assignedClassIds: [
      "class-9c",
      "class-9d",
      "class-10a",
      "class-10b",
      "class-10c",
      "class-10d",
    ],
    assignedSections: ["A", "B", "C", "D"],
    assignedLevels: ["9", "10"],
    specializationSubjectId: "sub-eng",
    subjectId: "sub-eng",
    designation: "Post Graduate Teacher (PGT)",
    department: "Languages",
    phoneNumber: "+91 98765 43255",
    email: "sengupta@school.edu",
    emergencyContact: "+91 98765 55587",
    address: "64, Civil Lines, New Delhi, India",
    dob: "1984-12-04",
    gender: "Female",
    qualification: "M.A. in English, B.Ed. with Ph.D.",
    experience: "14 Years of English Teaching",
    certifications: "English Literature Specialist",
    subjectSpecialization: "Advanced English Literature, Poetry",
    joiningDate: "2011-07-01",
    committeeMembership: "School Magazine Chief Editor",
    teacherType: "subject-specialized",
  },
  // Mathematics Teachers (Class 5-12)
  {
    teacherId: "teach-047",
    id: "teach-047",
    employeeId: "EMP047",
    name: "Mr. Rajesh Malhotra",
    userId: "user-teach-47",
    homeroom: "class-5b",
    assignedClasses: [
      "class-5a",
      "class-5b",
      "class-5c",
      "class-5d",
      "class-6a",
      "class-6b",
    ],
    assignedClassIds: [
      "class-5a",
      "class-5b",
      "class-5c",
      "class-5d",
      "class-6a",
      "class-6b",
    ],
    assignedSections: ["A", "B", "C", "D"],
    assignedLevels: ["5", "6"],
    specializationSubjectId: "sub-math",
    subjectId: "sub-math",
    designation: "Trained Graduate Teacher (TGT)",
    department: "Mathematics",
    phoneNumber: "+91 98765 43256",
    email: "rajesh.malhotra@school.edu",
    emergencyContact: "+91 98765 55588",
    address: "29, Rajendra Nagar, New Delhi, India",
    dob: "1983-07-15",
    gender: "Male",
    qualification: "M.Sc. in Mathematics, B.Ed. with NET",
    experience: "16 Years of Mathematics Teaching",
    certifications: "Ramanujan Math Society Member, IMO Training",
    subjectSpecialization: "Arithmetic, Algebra, Geometry",
    joiningDate: "2009-07-01",
    committeeMembership: "Mathematics Club, Olympiad Training Cell",
    teacherType: "subject-specialized",
  },
  {
    teacherId: "teach-048",
    id: "teach-048",
    employeeId: "EMP048",
    name: "Mrs. Khanna",
    userId: "user-teach-48",
    homeroom: null,
    assignedClasses: [
      "class-6c",
      "class-6d",
      "class-7a",
      "class-7b",
      "class-7c",
      "class-7d",
    ],
    assignedClassIds: [
      "class-6c",
      "class-6d",
      "class-7a",
      "class-7b",
      "class-7c",
      "class-7d",
    ],
    assignedSections: ["A", "B", "C", "D"],
    assignedLevels: ["6", "7"],
    specializationSubjectId: "sub-math",
    subjectId: "sub-math",
    designation: "Trained Graduate Teacher (TGT)",
    department: "Mathematics",
    phoneNumber: "+91 98765 43257",
    email: "khanna@school.edu",
    emergencyContact: "+91 98765 55589",
    address: "41, Rajendra Nagar, New Delhi, India",
    dob: "1986-10-23",
    gender: "Female",
    qualification: "M.Sc. in Mathematics, B.Ed.",
    experience: "11 Years of Mathematics Teaching",
    certifications: "Mathematics Workshop Trainer",
    subjectSpecialization: "Algebra, Statistics",
    joiningDate: "2014-07-01",
    committeeMembership: "Mathematics Club",
    teacherType: "subject-specialized",
  },
  // Science Teachers (Class 5-10)
  {
    teacherId: "teach-049",
    id: "teach-049",
    employeeId: "EMP049",
    name: "Mr. Dinesh Mukherjee",
    userId: "user-teach-49",
    homeroom: "class-5c",
    assignedClasses: [
      "class-5a",
      "class-5b",
      "class-5c",
      "class-5d",
      "class-6a",
      "class-6b",
    ],
    assignedClassIds: [
      "class-5a",
      "class-5b",
      "class-5c",
      "class-5d",
      "class-6a",
      "class-6b",
    ],
    assignedSections: ["A", "B", "C", "D"],
    assignedLevels: ["5", "6"],
    specializationSubjectId: "sub-sci",
    subjectId: "sub-sci",
    designation: "Trained Graduate Teacher (TGT)",
    department: "Science",
    phoneNumber: "+91 98765 43258",
    email: "dinesh.mukherjee@school.edu",
    emergencyContact: "+91 98765 55590",
    address: "33, Laxmi Nagar, New Delhi, India",
    dob: "1984-04-08",
    gender: "Male",
    qualification: "M.Sc. in Science, B.Ed.",
    experience: "13 Years of Science Teaching",
    certifications: "Science Club Coordinator, Lab Safety Certified",
    subjectSpecialization: "Physics, Chemistry, Biology Integrated Science",
    joiningDate: "2012-07-01",
    committeeMembership: "Science Fair Committee, Eco Club",
    teacherType: "subject-specialized",
  },
  {
    teacherId: "teach-050",
    id: "teach-050",
    employeeId: "EMP050",
    name: "Mrs. Rakesh",
    userId: "user-teach-50",
    homeroom: null,
    assignedClasses: [
      "class-6c",
      "class-6d",
      "class-7a",
      "class-7b",
      "class-7c",
      "class-7d",
    ],
    assignedClassIds: [
      "class-6c",
      "class-6d",
      "class-7a",
      "class-7b",
      "class-7c",
      "class-7d",
    ],
    assignedSections: ["A", "B", "C", "D"],
    assignedLevels: ["6", "7"],
    specializationSubjectId: "sub-sci",
    subjectId: "sub-sci",
    designation: "Trained Graduate Teacher (TGT)",
    department: "Science",
    phoneNumber: "+91 98765 43259",
    email: "rakesh@school.edu",
    emergencyContact: "+91 98765 55591",
    address: "57, Laxmi Nagar, New Delhi, India",
    dob: "1987-09-16",
    gender: "Female",
    qualification: "M.Sc. in Science, B.Ed.",
    experience: "9 Years of Science Teaching",
    certifications: "Environmental Science Workshop",
    subjectSpecialization: "Integrated Science",
    joiningDate: "2016-07-01",
    committeeMembership: "Eco Club Coordinator",
    teacherType: "subject-specialized",
  },
];

export const baseFees = [
  {
    id: "fee-1",
    studentId: "stud-001",
    totalAmount: 45000,
    paidAmount: 32000,
    dueDate: "2024-06-01",
    status: "Partially Paid",
  },
  {
    id: "fee-2",
    studentId: "stud-002",
    totalAmount: 45000,
    paidAmount: 45000,
    dueDate: "2024-06-01",
    status: "Paid",
  },
  {
    id: "fee-3",
    studentId: "stud-003",
    totalAmount: 45000,
    paidAmount: 0,
    dueDate: "2024-06-01",
    status: "Unpaid",
  },
  {
    id: "fee-4",
    studentId: "stud-004",
    totalAmount: 42000,
    paidAmount: 42000,
    dueDate: "2024-06-01",
    status: "Paid",
  },
  {
    id: "fee-5",
    studentId: "stud-005",
    totalAmount: 38000,
    paidAmount: 15000,
    dueDate: "2024-06-01",
    status: "Partially Paid",
  },
  {
    id: "fee-6",
    studentId: "stud-006",
    totalAmount: 52000,
    paidAmount: 52000,
    dueDate: "2024-06-01",
    status: "Paid",
  },
  {
    id: "fee-7",
    studentId: "stud-007",
    totalAmount: 52000,
    paidAmount: 26000,
    dueDate: "2024-06-01",
    status: "Partially Paid",
  },
  {
    id: "fee-8",
    studentId: "stud-008",
    totalAmount: 42000,
    paidAmount: 42000,
    dueDate: "2024-06-01",
    status: "Paid",
  },
  {
    id: "fee-9",
    studentId: "stud-009",
    totalAmount: 38000,
    paidAmount: 38000,
    dueDate: "2024-06-01",
    status: "Paid",
  },
  {
    id: "fee-10",
    studentId: "stud-010",
    totalAmount: 42000,
    paidAmount: 10000,
    dueDate: "2024-06-01",
    status: "Partially Paid",
  },
];

export const baseExams = [
  {
    id: "exam-hy-2025",
    name: "Half-Yearly Examination 2025",
    type: "TERM",
    academicYear: "2025-26",
    applicableStages: ["primary", "middle", "secondary", "senior_secondary"],
    status: "published",
    startDate: "2025-07-18",
    endDate: "2025-07-28",
    instructions: [
      "Candidates must carry a physical copy of their Admit Card to the examination hall.",
      "Banned items include mobile phones, calculators, smartwatches, and loose paper sheets.",
      "Candidates must report to the examination center at least 30 minutes before the scheduled time.",
      "Grace period of 15 minutes is allowed, post which no entry is permitted.",
    ],
  },
  {
    id: "exam-ut-1",
    name: "Unit Test 1",
    type: "UNIT",
    academicYear: "2025-26",
    applicableStages: ["primary", "middle", "secondary", "senior_secondary"],
    status: "published",
    startDate: "2025-05-10",
    endDate: "2025-05-15",
    instructions: [
      "Candidates must report to the examination center at least 15 minutes before the scheduled time.",
      "Only blue or black ballpoint pens are allowed.",
    ],
  },
];

export const transportDriversSeed = [
  {
    driverId: "DR-501",
    name: "Ramesh Chand",
    rating: 4.9,
    experience: "12 Years",
    emergencyContact: "+91 98765 43210",
    shift: "Morning & Afternoon",
  },
  {
    driverId: "DR-502",
    name: "Satpal Singh",
    rating: 4.7,
    experience: "8 Years",
    emergencyContact: "+91 98112 34567",
    shift: "Morning & Afternoon",
  },
  {
    driverId: "DR-503",
    name: "Devinder Kumar",
    rating: 4.8,
    experience: "10 Years",
    emergencyContact: "+91 98991 23456",
    shift: "Morning & Afternoon",
  },
];

export const transportVehiclesSeed = [
  {
    vehicleId: "VH-301",
    routeId: "RT-101",
    driverId: "DR-501",
    attendantName: "Mr. Satish Mehra",
    model: "Tata Starbus AC 2023",
    capacity: "52 Seater",
    fuelType: "CNG",
    amenities: ["AC", "GPS Enabled", "CCTV Camera", "First Aid Kit"],
    vehicleNo: "DL-1PB-4521",
  },
  {
    vehicleId: "VH-302",
    routeId: "RT-102",
    driverId: "DR-502",
    attendantName: "Mrs. Sunita Devi",
    model: "Eicher Starline 2024",
    capacity: "42 Seater",
    fuelType: "Electric",
    amenities: [
      "AC",
      "GPS Enabled",
      "CCTV Camera",
      "First Aid Kit",
      "Emergency Exit",
    ],
    vehicleNo: "DL-1PC-7829",
  },
  {
    vehicleId: "VH-303",
    routeId: "RT-103",
    driverId: "DR-503",
    attendantName: "Mr. Rajesh Khanna",
    model: "Mahindra Cruzio 2022",
    capacity: "32 Seater",
    fuelType: "Diesel",
    amenities: [
      "GPS Enabled",
      "CCTV Camera",
      "First Aid Kit",
      "Emergency Exit",
    ],
    vehicleNo: "DL-1PD-1092",
  },
];

export const transportRoutesSeed = [
  {
    id: "RT-101",
    routeNo: "RT-101",
    routeCode: "RT-101",
    vehicleNo: "DL-1PB-4521",
    pickupTime: "07:15 AM",
    dropTime: "03:45 PM",
    driverName: "Ramesh Chand",
    driverPhone: "+91 98765 43210",
    zone: "West Zone",
    estimatedDuration: "55 mins",
    activeDirection: "PICKUP_ROUTE",
    stops: [
      {
        stopId: "ST-101-1",
        stopName: "Sector 15 Main Gate",
        sequence: 1,
        eta: "07:15 AM",
        afternoonEta: "04:40 PM",
      },
      {
        stopId: "ST-101-2",
        stopName: "HDFC Bank Square",
        sequence: 2,
        eta: "07:22 AM",
        afternoonEta: "04:33 PM",
      },
      {
        stopId: "ST-101-3",
        stopName: "Central Mall Road",
        sequence: 3,
        eta: "07:30 AM",
        afternoonEta: "04:25 PM",
      },
      {
        stopId: "ST-101-4",
        stopName: "Police Chowki Circle",
        sequence: 4,
        eta: "07:40 AM",
        afternoonEta: "04:15 PM",
      },
      {
        stopId: "ST-101-school",
        stopName: "Springdale Senior Secondary",
        sequence: 5,
        eta: "08:10 AM",
        afternoonEta: "03:45 PM",
        isSchool: true,
      },
    ],
  },
  {
    id: "RT-102",
    routeNo: "RT-102",
    routeCode: "RT-102",
    vehicleNo: "DL-1PC-7829",
    pickupTime: "07:05 AM",
    dropTime: "04:00 PM",
    driverName: "Satpal Singh",
    driverPhone: "+91 98112 34567",
    zone: "North Zone",
    estimatedDuration: "65 mins",
    activeDirection: "DROP_ROUTE",
    stops: [
      {
        stopId: "ST-102-1",
        stopName: "Metro Station Sector 21",
        sequence: 1,
        eta: "07:05 AM",
        afternoonEta: "04:55 PM",
      },
      {
        stopId: "ST-102-2",
        stopName: "Dwarka Crossing",
        sequence: 2,
        eta: "07:15 AM",
        afternoonEta: "04:45 PM",
      },
      {
        stopId: "ST-102-3",
        stopName: "Sector 6 Primary School",
        sequence: 3,
        eta: "07:25 AM",
        afternoonEta: "04:35 PM",
      },
      {
        stopId: "ST-102-4",
        stopName: "Janakpuri West Junction",
        sequence: 4,
        eta: "07:35 AM",
        afternoonEta: "04:25 PM",
      },
      {
        stopId: "ST-102-school",
        stopName: "Springdale Senior Secondary",
        sequence: 5,
        eta: "08:10 AM",
        afternoonEta: "04:00 PM",
        isSchool: true,
      },
    ],
  },
  {
    id: "RT-103",
    routeNo: "RT-103",
    routeCode: "RT-103",
    vehicleNo: "DL-1PD-1092",
    pickupTime: "07:20 AM",
    dropTime: "03:30 PM",
    driverName: "Devinder Kumar",
    driverPhone: "+91 98991 23456",
    zone: "Central Zone",
    estimatedDuration: "50 mins",
    activeDirection: "PICKUP_ROUTE",
    stops: [
      {
        stopId: "ST-103-1",
        stopName: "Rajouri Garden Metro",
        sequence: 1,
        eta: "07:20 AM",
        afternoonEta: "04:20 PM",
      },
      {
        stopId: "ST-103-2",
        stopName: "Connaught Place Circle",
        sequence: 2,
        eta: "07:32 AM",
        afternoonEta: "04:08 PM",
      },
      {
        stopId: "ST-103-3",
        stopName: "Pusa Road Circle",
        sequence: 3,
        eta: "07:42 AM",
        afternoonEta: "03:58 PM",
      },
      {
        stopId: "ST-103-4",
        stopName: "Karol Bagh Crossing",
        sequence: 4,
        eta: "07:50 AM",
        afternoonEta: "03:50 PM",
      },
      {
        stopId: "ST-103-school",
        stopName: "Springdale Senior Secondary",
        sequence: 5,
        eta: "08:10 AM",
        afternoonEta: "03:30 PM",
        isSchool: true,
      },
    ],
  },
];

export const transportAlertsSeed = [
  {
    alertId: "AL-901",
    routeId: "RT-101",
    vehicleId: "VH-301",
    type: "delay",
    messageEn: "Heavy traffic delay near City Center (approx. 12 mins delay)",
    messageHi: "सिटी सेंटर के पास भारी ट्रैफिक जाम (लगभग 12 मिनट की देरी)",
    severity: "warning",
  },
  {
    alertId: "AL-902",
    routeId: "RT-101",
    vehicleId: "VH-301",
    type: "breakdown",
    messageEn:
      "Minor engine fault check scheduled; standby backup coach active",
    messageHi: "इंजन में खराबी की आशंका; बैकअप बस स्टैंडबाय पर सक्रिय है",
    severity: "danger",
  },
  {
    alertId: "AL-903",
    routeId: "RT-102",
    vehicleId: "VH-302",
    type: "diversion",
    messageEn:
      "Route diversion active: Janakpuri Sector 21 flyover closed due to road reconstruction",
    messageHi:
      "मार्ग डायवर्जन सक्रिय: सड़क पुनर्निर्माण के कारण जनकपुरी सेक्टर 21 फ्लाईओवर बंद",
    severity: "danger",
  },
  {
    alertId: "AL-903b",
    routeId: "RT-102",
    vehicleId: "VH-302",
    type: "delay",
    messageEn:
      "Departure delayed by 8 minutes due to mandatory attendant verification",
    messageHi:
      "अटेंडेंट के अनिवार्य सत्यापन के कारण प्रस्थान में 8 मिनट की देरी",
    severity: "warning",
  },
  {
    alertId: "AL-904",
    routeId: "RT-103",
    vehicleId: "VH-303",
    type: "weather",
    messageEn:
      "Pickup delayed by 10 minutes due to low visibility fog near Karol Bagh",
    messageHi:
      "करोल बाग के पास कम दृश्यता वाले कोहरे के कारण पिकअप 10 मिनट विलंबित रहेगा",
    severity: "warning",
  },
  {
    alertId: "AL-905",
    routeId: "RT-103",
    vehicleId: "VH-303",
    type: "reassignment",
    messageEn:
      "Vehicle reassigned: standard coach replaced by luxury traveler coach today",
    messageHi:
      "वाहन पुनर्वितरित: आज मानक कोच के स्थान पर लक्जरी ट्रैवलर कोच लगाया गया",
    severity: "warning",
  },
];

export const transportAssignmentsSeed = [
  {
    id: "ta-1",
    studentId: "stud-001",
    assignedRouteId: "RT-101",
    routeId: "RT-101",
    assignedVehicleId: "VH-301",
    pickupStopId: "ST-101-1",
    dropStopId: "ST-101-1",
    pickupStop: "Sector 15 Main Gate",
    status: "Active",
  },
  {
    id: "ta-2",
    studentId: "stud-002",
    assignedRouteId: "RT-101",
    routeId: "RT-101",
    assignedVehicleId: "VH-301",
    pickupStopId: "ST-101-2",
    dropStopId: "ST-101-2",
    pickupStop: "HDFC Bank Square",
    status: "Active",
  },
  {
    id: "ta-3",
    studentId: "stud-003",
    assignedRouteId: "RT-101",
    routeId: "RT-101",
    assignedVehicleId: "VH-301",
    pickupStopId: "ST-101-3",
    dropStopId: "ST-101-3",
    pickupStop: "Central Mall Road",
    status: "Active",
  },
  {
    id: "ta-4",
    studentId: "stud-004",
    assignedRouteId: "RT-102",
    routeId: "RT-102",
    assignedVehicleId: "VH-302",
    pickupStopId: "ST-102-1",
    dropStopId: "ST-102-1",
    pickupStop: "Metro Station Sector 21",
    status: "Active",
  },
  {
    id: "ta-5",
    studentId: "stud-005",
    assignedRouteId: "RT-102",
    routeId: "RT-102",
    assignedVehicleId: "VH-302",
    pickupStopId: "ST-102-2",
    dropStopId: "ST-102-2",
    pickupStop: "Dwarka Crossing",
    status: "Active",
  },
  {
    id: "ta-6",
    studentId: "stud-006",
    assignedRouteId: "RT-102",
    routeId: "RT-102",
    assignedVehicleId: "VH-302",
    pickupStopId: "ST-102-3",
    dropStopId: "ST-102-3",
    pickupStop: "Sector 6 Primary School",
    status: "Active",
  },
  {
    id: "ta-7",
    studentId: "stud-007",
    assignedRouteId: "RT-102",
    routeId: "RT-102",
    assignedVehicleId: "VH-302",
    pickupStopId: "ST-102-4",
    dropStopId: "ST-102-4",
    pickupStop: "Janakpuri West Junction",
    status: "Active",
  },
  {
    id: "ta-8",
    studentId: "stud-008",
    assignedRouteId: "RT-103",
    routeId: "RT-103",
    assignedVehicleId: "VH-303",
    pickupStopId: "ST-103-1",
    dropStopId: "ST-103-1",
    pickupStop: "Rajouri Garden Metro",
    status: "Active",
  },
  {
    id: "ta-9",
    studentId: "stud-009",
    assignedRouteId: "RT-103",
    routeId: "RT-103",
    assignedVehicleId: "VH-303",
    pickupStopId: "ST-103-2",
    dropStopId: "ST-103-2",
    pickupStop: "Connaught Place Circle",
    status: "Active",
  },
  {
    id: "ta-10",
    studentId: "stud-010",
    assignedRouteId: "RT-103",
    routeId: "RT-103",
    assignedVehicleId: "VH-303",
    pickupStopId: "ST-103-3",
    dropStopId: "ST-103-3",
    pickupStop: "Pusa Road Circle",
    status: "Active",
  },
];

// Import canonical notice seed with full schema
import { noticeSeedData as noticesSeed } from "./notices";

// Re-export for use in initialData.js
export { noticesSeed };

export const eventsSeed = [
  {
    id: "eve-1",
    name: "Science Exhibition 2025",
    date: "12 July 2025",
    category: "Academic",
    bgGradient: "linear-gradient(135deg, #03045e, #0077b6)",
    status: "happening",
    daysLeft: 0,
    targetStreamId: null,
    targetClassId: null,
  },
  {
    id: "eve-2",
    name: "Annual Cultural Fest",
    date: "13 July 2025",
    category: "Cultural",
    bgGradient: "linear-gradient(135deg, #0077b6, #00b4d8)",
    status: "happening",
    daysLeft: 0,
    targetStreamId: null,
    targetClassId: null,
  },
  {
    id: "eve-3",
    name: "Inter-House Quiz",
    date: "14 July 2025",
    category: "Academic",
    bgGradient: "linear-gradient(135deg, #03045e, #00b4d8)",
    status: "happening",
    daysLeft: 0,
    targetStreamId: null,
    targetClassId: null,
  },
  {
    id: "eve-4",
    name: "Inter-School Debate",
    date: "17 July 2025",
    category: "Academic",
    bgGradient: "linear-gradient(135deg, #0077b6, #03045e)",
    status: "upcoming",
    daysLeft: 3,
    targetStreamId: null,
    targetClassId: null,
  },
  {
    id: "eve-5",
    name: "Workshop: Robotics Basics",
    date: "19 July 2025",
    category: "Tech",
    bgGradient: "linear-gradient(135deg, #03045e, #0077b6)",
    status: "upcoming",
    daysLeft: 5,
    targetStreamId: "SCIENCE_NON_MEDICAL",
    targetClassId: null,
  },
  {
    id: "eve-6",
    name: "Annual Sports Day",
    date: "21 July 2025",
    category: "Sports",
    bgGradient: "linear-gradient(135deg, #00b4d8, #0077b6)",
    status: "upcoming",
    daysLeft: 7,
    targetStreamId: null,
    targetClassId: null,
  },
];

export const clubsSeed = [
  {
    id: "club-robotics",
    name: "Robotics & AI Club",
    category: "Technical",
    coordinator: "Dr. Sarah Wilson",
    clubHeadTeacherId: "teach-001",
    description:
      "Arduino, microcontrollers, and competitive robotics projects.",
    logo: "cpu",
    allowedClasses: ["11-A", "11-B", "11-C", "11-D"],
    maxMembers: 30,
    createdAt: "2026-05-19T08:00:00Z",
    status: "ACTIVE",
  },
  {
    id: "club-debate",
    name: "Debate & Literary Society",
    category: "Literary",
    coordinator: "Mrs. Elena Gilbert",
    clubHeadTeacherId: "teach-003",
    description: "Declamation, model UN debates, and communication exercises.",
    logo: "mic",
    allowedClasses: ["11-A", "11-B", "11-C", "11-D"],
    maxMembers: 25,
    createdAt: "2026-05-19T08:00:00Z",
    status: "ACTIVE",
  },
  {
    id: "club-music",
    name: "Harmony Music Club & Band",
    category: "Performing Arts",
    coordinator: "Mrs. Sunita Rao",
    clubHeadTeacherId: "teach-002",
    description: "Vocal training, classical theory, and rock band rehearsals.",
    logo: "music",
    allowedClasses: ["11-A", "11-B", "11-C", "11-D"],
    maxMembers: 20,
    createdAt: "2026-05-19T08:00:00Z",
    status: "ACTIVE",
  },
  {
    id: "club-photo",
    name: "Shutter & Lens Photography Club",
    category: "Creative",
    coordinator: "Mr. Kiran Desai",
    clubHeadTeacherId: "teach-004",
    description: "DSLR settings, photo editing workshops, and photo walks.",
    logo: "camera",
    allowedClasses: ["11-A", "11-B", "11-C", "11-D"],
    maxMembers: 15,
    createdAt: "2026-05-19T08:00:00Z",
    status: "ACTIVE",
  },
  {
    id: "club-science",
    name: "Einstein Science Innovation Club",
    category: "Technical",
    coordinator: "Dr. Sarah Wilson",
    clubHeadTeacherId: "teach-001",
    description:
      "Scientific experimentation, logic building, and chemistry fairs.",
    logo: "code",
    allowedClasses: ["11-A", "11-B"],
    maxMembers: 30,
    createdAt: "2026-05-19T08:00:00Z",
    status: "ACTIVE",
  },
  {
    id: "club-literary",
    name: "Creative Writing & Literary Circle",
    category: "Literary",
    coordinator: "Mrs. Elena Gilbert",
    clubHeadTeacherId: "teach-003",
    description:
      "Creative writing prompts, book discussions, and poetry contests.",
    logo: "book-open",
    allowedClasses: ["11-A", "11-B", "11-C", "11-D"],
    maxMembers: 25,
    createdAt: "2026-05-19T08:00:00Z",
    status: "ACTIVE",
  },
];

export const clubCoordinatorsSeed = [
  {
    id: "fac-1",
    name: "Dr. Sarah Wilson",
    department: "Computer Science & Robotics",
    email: "s.wilson@edudash.edu",
    timings: "Mon-Fri: 3PM - 5PM",
  },
  {
    id: "fac-2",
    name: "Mrs. Elena Gilbert",
    department: "English Literature & Debating",
    email: "e.gilbert@edudash.edu",
    timings: "Tue, Thu: 4PM - 6PM",
  },
  {
    id: "fac-3",
    name: "Mrs. Sunita Rao",
    department: "Performing Arts & Vocal",
    email: "s.rao@edudash.edu",
    timings: "Mon, Wed: 3:30PM - 5:30PM",
  },
  {
    id: "fac-4",
    name: "Mr. Kiran Desai",
    department: "Geography & Photography",
    email: "k.desai@edudash.edu",
    timings: "Wed, Fri: 2PM - 4PM",
  },
];

export const clubActivitiesSeed = [
  {
    id: "act-1",
    clubId: "club-robotics",
    title: "National RoboCON Hackathon",
    date: "25 May 2025",
    time: "10:00 AM",
    venue: "Physics Lab 1",
    type: "Competition",
    status: "Upcoming",
  },
  {
    id: "act-2",
    clubId: "club-debate",
    title: "All-India Inter-School Model UN",
    date: "02 June 2025",
    time: "11:30 AM",
    venue: "Main Auditorium",
    type: "External Event",
    status: "Registration Open",
  },
  {
    id: "act-3",
    clubId: "club-music",
    title: "Annual Symphony Concert",
    date: "10 June 2025",
    time: "05:00 PM",
    venue: "Open Amphitheatre",
    type: "Performance",
    status: "Rehearsals Ongoing",
  },
  {
    id: "act-4",
    clubId: "club-photo",
    title: "Summer Landscape Photo Exhibition",
    date: "15 June 2025",
    time: "09:00 AM",
    venue: "Creative Arts Center",
    type: "Exhibition",
    status: "Submissions Open",
  },
  {
    id: "act-5",
    clubId: "club-science",
    title: "Science Innovation Fair & Lab Demo",
    date: "28 May 2025",
    time: "09:30 AM",
    venue: "Physics Lab 2",
    type: "Exhibition",
    status: "Upcoming",
  },
  {
    id: "act-6",
    clubId: "club-literary",
    title: "Creative Writing Workshop",
    date: "05 June 2025",
    time: "02:00 PM",
    venue: "Seminar Hall B",
    type: "Workshop",
    status: "Upcoming",
  },
];

export const mentorAssignmentsSeed = [
  {
    id: "mase-001",
    studentId: "stud-001", // Rohan Kumar (Homeroom 11-A)
    mentorTeacherId: "teach-001", // Dr. Sarah Wilson
    assignedBy: "admin",
    assignedAt: "2024-08-01T09:00:00Z",
    status: "Active",
  },
  {
    id: "mase-002",
    studentId: "stud-004", // Ananya Iyer (Homeroom 11-C, Mrs. Elena Gilbert class teacher)
    mentorTeacherId: "teach-003", // Mrs. Elena Gilbert (Override!)
    assignedBy: "admin",
    assignedAt: "2024-08-05T10:00:00Z",
    status: "Active",
  },
];

export const mentorSessionsSeed = [
  {
    id: "sess_001",
    studentId: "stud-001",
    studentName: "Rohan Kumar",
    mentorTeacherId: "teach-001",
    mentorTeacherName: "Dr. Sarah Wilson",
    topic: "Academic Guidance",
    scheduledAt: "2026-05-18T10:00:00Z",
    message: "Want to plan revisions for mid-term Physics exam.",
    status: "Completed",
    mentorNotes:
      "Drafted a detailed physics formula guide and revision timetable.",
    createdAt: "2026-05-17T09:00:00Z",
  },
  {
    id: "sess_002",
    studentId: "stud-002",
    studentName: "Priya Sharma",
    mentorTeacherId: "teach-002",
    mentorTeacherName: "Mrs. Priya Nair",
    topic: "Exam Stress",
    scheduledAt: "2026-05-20T14:30:00Z",
    message: "Feeling anxious about Biology lab presentations next week.",
    status: "Approved",
    createdAt: "2026-05-18T11:00:00Z",
  },
  {
    id: "sess_003",
    studentId: "stud-001",
    studentName: "Rohan Kumar",
    mentorTeacherId: "teach-001",
    mentorTeacherName: "Dr. Sarah Wilson",
    topic: "Career Path",
    scheduledAt: "2026-05-22T11:00:00Z",
    message: "Seeking advice on JEE entrance test books and guidance courses.",
    status: "Pending",
    createdAt: "2026-05-19T08:00:00Z",
  },
  {
    id: "sess_004",
    studentId: "stud-004",
    studentName: "Ananya Iyer",
    mentorTeacherId: "teach-003",
    mentorTeacherName: "Mrs. Elena Gilbert",
    topic: "Peer Challenges",
    scheduledAt: "2026-05-15T09:00:00Z",
    message: "Need a quick discussion on group assignments.",
    status: "Completed",
    mentorNotes:
      "Advised on peer delegation and resolved conflict in Science project group.",
    createdAt: "2026-05-14T10:30:00Z",
  },
];

// Helper functions for complex / dependent relational seeding
export const generateDocumentsSeed = (students) => {
  const documents = [];
  students.forEach((student, idx) => {
    // 1. Aadhaar ID Card (Mandatory)
    documents.push({
      id: `doc-${student.id}-aadhaar`,
      studentId: student.id,
      titleEn: "Aadhaar ID Card",
      category: "identity",
      isMandatory: true,
      status: "verified",
      uploadDate: "2024-04-12",
      fileSize: "1.2 MB",
    });

    // 2. Transfer Certificate (Mandatory - Missing for stud-002)
    const isMissingTC = student.id === "stud-002";
    documents.push({
      id: `doc-${student.id}-tc`,
      studentId: student.id,
      titleEn: "Transfer Certificate",
      category: "administrative",
      isMandatory: true,
      status: isMissingTC
        ? "missing"
        : idx % 4 === 0
          ? "pending"
          : idx % 5 === 0
            ? "rejected"
            : "verified",
      uploadDate: isMissingTC ? null : "2024-04-15",
      fileSize: isMissingTC ? null : "850 KB",
      remarks: idx % 5 === 0 ? "Signature not visible" : "",
    });

    // 3. Previous Marksheet (Mandatory)
    documents.push({
      id: `doc-${student.id}-marksheet`,
      studentId: student.id,
      titleEn: "Class 10 Mark Sheet",
      category: "academic",
      isMandatory: true,
      status: idx % 3 === 0 ? "uploaded" : "verified",
      uploadDate: "2024-04-02",
      fileSize: "2.1 MB",
    });

    // 4. Passport-size Photograph (Mandatory)
    documents.push({
      id: `doc-${student.id}-photo`,
      studentId: student.id,
      titleEn: "Passport-size Photograph",
      category: "identity",
      isMandatory: true,
      status: "verified",
      uploadDate: "2024-04-01",
      fileSize: "450 KB",
    });

    // 5. Birth Certificate (Mandatory - Missing for student idx 3)
    const isMissingBirth = idx === 3;
    documents.push({
      id: `doc-${student.id}-birth`,
      studentId: student.id,
      titleEn: "Birth Certificate",
      category: "administrative",
      isMandatory: true,
      status: isMissingBirth ? "missing" : "verified",
      uploadDate: isMissingBirth ? null : "2024-04-05",
      fileSize: isMissingBirth ? null : "1.4 MB",
    });

    // 6. Medical Form (Optional)
    documents.push({
      id: `doc-${student.id}-medical`,
      studentId: student.id,
      titleEn: "Medical Declaration Form",
      category: "administrative",
      isMandatory: false,
      status: idx % 2 === 0 ? "verified" : "missing",
      uploadDate: idx % 2 === 0 ? "2024-04-10" : null,
      fileSize: idx % 2 === 0 ? "920 KB" : null,
    });

    // 7. Extra-curricular Certificate (Optional)
    documents.push({
      id: `doc-${student.id}-extracurricular`,
      studentId: student.id,
      titleEn: "State Level Extracurricular Certificate",
      category: "extracurricular",
      isMandatory: false,
      status: idx % 3 === 0 ? "verified" : "missing",
      uploadDate: idx % 3 === 0 ? "2024-04-18" : null,
      fileSize: idx % 3 === 0 ? "1.8 MB" : null,
    });
  });
  return documents;
};

// ─── Teacher/Employee Document Types ──────────────────────────────────────────
export const TEACHER_DOCUMENT_TYPES = [
  {
    id: "aadhaar",
    label: "Aadhaar Card",
    category: "identity",
    isMandatory: true,
  },
  {
    id: "pan_card",
    label: "PAN Card",
    category: "identity",
    isMandatory: true,
  },
  {
    id: "qualification_degree",
    label: "Highest Qualification Degree",
    category: "academic",
    isMandatory: true,
  },
  {
    id: "b_ed_certificate",
    label: "B.Ed / Teaching Certificate",
    category: "professional",
    isMandatory: true,
  },
  {
    id: "experience_certificate",
    label: "Previous Experience Certificate",
    category: "professional",
    isMandatory: false,
  },
  {
    id: "police_verification",
    label: "Police Verification Certificate",
    category: "security",
    isMandatory: true,
  },
  {
    id: "medical_fitness",
    label: "Medical Fitness Certificate",
    category: "medical",
    isMandatory: true,
  },
  {
    id: "passport_photo",
    label: "Passport Size Photo",
    category: "identity",
    isMandatory: true,
  },
  {
    id: "appointment_letter",
    label: "Appointment Letter",
    category: "administrative",
    isMandatory: true,
  },
  {
    id: "bank_account_proof",
    label: "Bank Account Proof (Cancelled Cheque)",
    category: "financial",
    isMandatory: true,
  },
  {
    id: "epf_uan",
    label: "EPF UAN Details",
    category: "financial",
    isMandatory: true,
  },
  {
    id: "caste_certificate",
    label: "Caste Certificate (if applicable)",
    category: "administrative",
    isMandatory: false,
  },
  {
    id: "marriage_certificate",
    label: "Marriage Certificate (if name changed)",
    category: "identity",
    isMandatory: false,
  },
  {
    id: "references",
    label: "Professional References (2)",
    category: "professional",
    isMandatory: true,
  },
];

export const generateTeacherDocumentsSeed = (teachers) => {
  const documents = [];
  teachers.forEach((teacher, idx) => {
    TEACHER_DOCUMENT_TYPES.forEach((type) => {
      // Simulate document status - some verified, some pending, some missing
      const rand = (idx + type.id.length) % 10;
      let status = "missing";
      let uploadDate = null;
      let fileSize = null;

      if (rand < 6) {
        status = "verified";
        uploadDate = `2024-0${(rand % 6) + 1}-1${rand}`;
        fileSize = `${rand * 150 + 200} KB`;
      } else if (rand < 8) {
        status = "pending";
        uploadDate = `2024-0${(rand % 3) + 1}-2${rand}`;
        fileSize = `${rand * 200 + 300} KB`;
      }

      // Mandatory docs are more likely to be present
      if (type.isMandatory && status === "missing" && rand < 2) {
        status = "verified";
        uploadDate = "2024-03-15";
        fileSize = "450 KB";
      }

      documents.push({
        id: `tdoc-${teacher.id}-${type.id}`,
        teacherId: teacher.id,
        documentTypeId: type.id,
        titleEn: type.label,
        category: type.category,
        isMandatory: type.isMandatory,
        status,
        uploadDate,
        fileSize,
        remarks:
          status === "rejected" ? "Document unclear, please re-upload" : "",
      });
    });
  });
  return documents;
};

export const generateAchievementsSeed = (students) => {
  const achievements = [];
  const achievementsByStream = {
    SCIENCE_MEDICAL: [
      {
        titleEn: "Biology Symposium - Best Paper Award",
        category: "academic",
        rank: "gold",
      },
      {
        titleEn: "Regional Science Fair - Finalist",
        category: "academic",
        rank: "silver",
      },
      {
        titleEn: "Inter-School Football Championship Runner Up",
        category: "sports",
        rank: "silver",
      },
    ],
    SCIENCE_NON_MEDICAL: [
      {
        titleEn: "National Coding Contest - Top 5 Ranker",
        category: "technical",
        rank: "gold",
      },
      {
        titleEn: "Science Olympiad - Gold Medalist",
        category: "academic",
        rank: "gold",
      },
      {
        titleEn: "District Table Tennis Championship Winner",
        category: "sports",
        rank: "gold",
      },
    ],
    COMMERCE: [
      {
        titleEn: "Inter-School Business Pitch - Gold Medal",
        category: "academic",
        rank: "gold",
      },
      {
        titleEn: "State Level Chess Tournament - Runner Up",
        category: "sports",
        rank: "silver",
      },
      {
        titleEn: "Financial Literacy Essay - Best Writer",
        category: "academic",
        rank: "gold",
      },
    ],
    HUMANITIES: [
      {
        titleEn: "National Youth Parliament - Best Speaker",
        category: "cultural",
        rank: "gold",
      },
      {
        titleEn: "State Level Painting Competition Winner",
        category: "cultural",
        rank: "gold",
      },
      {
        titleEn: "Inter-School Debate Championship Winner",
        category: "cultural",
        rank: "gold",
      },
    ],
  };

  students.forEach((student, index) => {
    const list =
      achievementsByStream[student.streamId] ||
      achievementsByStream["SCIENCE_NON_MEDICAL"];
    const ach = list[index % list.length];
    achievements.push({
      id: `ach-${student.id}`,
      studentId: student.id,
      titleEn: ach.titleEn,
      category: ach.category,
      date: "2024-11-20",
      rank: ach.rank,
    });
  });
  return achievements;
};

export const generateInvoicesAndReceiptsSeed = (
  fees,
  feeStructures = [],
  students = [],
  classes = [],
) => {
  const invoices = [];
  const receipts = [];

  // Import helper inline to avoid circular deps
  const getFeeStructureForClass = (cls) => {
    if (!cls || !feeStructures.length) return null;
    const isSenior = cls.level === "11" || cls.level === "12";
    if (isSenior) {
      return (
        feeStructures.find(
          (fs) =>
            fs.level === cls.level &&
            fs.streamId === (cls.streamId || cls.stream),
        ) || null
      );
    }
    return (
      feeStructures.find((fs) => fs.level === cls.level && !fs.streamId) || null
    );
  };

  fees.forEach((fee) => {
    const sId = fee.studentId;
    const studNumber = sId.split("-")[1];

    // Resolve fee structure for this student's class
    const stu = students.find((s) => s.id === sId);
    const cls = stu ? classes.find((c) => c.id === stu.classId) : null;
    const feeStruct = getFeeStructureForClass(cls);

    const billingCycles = [
      {
        idSuffix: "1",
        billingMonth: "April 2025",
        dueDate: "2025-04-15",
        isVacation: false,
        vacationType: null,
      },
      {
        idSuffix: "2",
        billingMonth: "May 2025",
        dueDate: "2025-05-15",
        isVacation: false,
        vacationType: null,
      },
      {
        idSuffix: "3",
        billingMonth: "June 2025",
        dueDate: "2025-06-15",
        isVacation: true,
        vacationType: "SUMMER",
      },
      {
        idSuffix: "4",
        billingMonth: "July 2025",
        dueDate: "2025-07-15",
        isVacation: false,
        vacationType: null,
      },
      {
        idSuffix: "5",
        billingMonth: "August 2025",
        dueDate: "2025-08-15",
        isVacation: false,
        vacationType: null,
      },
      {
        idSuffix: "6",
        billingMonth: "September 2025",
        dueDate: "2025-09-15",
        isVacation: false,
        vacationType: null,
      },
      {
        idSuffix: "7",
        billingMonth: "October 2025",
        dueDate: "2025-10-15",
        isVacation: false,
        vacationType: null,
      },
      {
        idSuffix: "8",
        billingMonth: "November 2025",
        dueDate: "2025-11-15",
        isVacation: false,
        vacationType: null,
      },
      {
        idSuffix: "9",
        billingMonth: "December 2025",
        dueDate: "2025-12-15",
        isVacation: false,
        vacationType: null,
      },
      {
        idSuffix: "10",
        billingMonth: "January 2026",
        dueDate: "2026-01-15",
        isVacation: true,
        vacationType: "WINTER",
      },
      {
        idSuffix: "11",
        billingMonth: "February 2026",
        dueDate: "2026-02-15",
        isVacation: false,
        vacationType: null,
      },
      {
        idSuffix: "12",
        billingMonth: "March 2026",
        dueDate: "2026-03-15",
        isVacation: false,
        vacationType: null,
      },
    ];

    // Build monthly base amounts per fee head from fee structure or fallback to proportions
    const buildMonthlyHeads = (feeStructure, totalAmount) => {
      if (
        feeStructure &&
        feeStructure.feeHeads &&
        feeStructure.feeHeads.length
      ) {
        return feeStructure.feeHeads.map((h) => ({
          id: h.id,
          label: h.label,
          annualAmount: h.annualAmount,
          monthlyBase: Math.round(h.annualAmount / 12),
          applicableMonths: h.applicableMonths || null,
        }));
      }
      // Fallback proportions (legacy)
      const base = Math.round(totalAmount / 12);
      return [
        {
          id: "tuition",
          label: "Tuition Fee",
          annualAmount: Math.round(totalAmount * 0.6),
          monthlyBase: Math.round(base * 0.6),
          applicableMonths: null,
        },
        {
          id: "transport",
          label: "Transport Fee",
          annualAmount: Math.round(totalAmount * 0.15),
          monthlyBase: Math.round(base * 0.15),
          applicableMonths: null,
        },
        {
          id: "lab",
          label: "Laboratory Fee",
          annualAmount: Math.round(totalAmount * 0.1),
          monthlyBase: Math.round(base * 0.1),
          applicableMonths: null,
        },
        {
          id: "activity",
          label: "Activity Fee",
          annualAmount: Math.round(totalAmount * 0.08),
          monthlyBase: Math.round(base * 0.08),
          applicableMonths: null,
        },
        {
          id: "tech",
          label: "Technology Fee",
          annualAmount: Math.round(totalAmount * 0.07),
          monthlyBase: Math.round(base * 0.07),
          applicableMonths: null,
        },
      ];
    };

    const headDefs = buildMonthlyHeads(feeStruct, fee.totalAmount);
    let remainingPaid = fee.paidAmount;

    billingCycles.forEach((cycle, idx) => {
      // Apply Vacation Adjustments per head
      const isSummer = cycle.vacationType === "SUMMER";
      const isWinter = cycle.vacationType === "WINTER";

      const lineItems = headDefs
        .filter((h) => {
          // Only include one-time heads in their applicable months
          if (h.applicableMonths) return h.applicableMonths.includes(idx + 1);
          return true;
        })
        .map((h) => {
          let amt = h.applicableMonths ? h.annualAmount : h.monthlyBase;
          if (isSummer && (h.id === "transport" || h.id === "activity"))
            amt = 0;
          else if (isWinter && (h.id === "transport" || h.id === "activity"))
            amt = Math.round(amt * 0.5);
          return { label: h.label, amount: amt };
        });

      const monthlyAmount = lineItems.reduce((s, li) => s + li.amount, 0);
      const isPast = idx < 4; // April, May, June, July are active/past months
      let status = "Upcoming";
      let paidAmt = 0;
      let rcpId = null;

      if (isPast) {
        if (remainingPaid >= monthlyAmount) {
          status = "Paid";
          paidAmt = monthlyAmount;
          remainingPaid -= monthlyAmount;
          rcpId = `RCP-${sId}-${cycle.idSuffix}`;
          receipts.push({
            id: rcpId,
            invoiceId: `INV-${sId}-${cycle.idSuffix}`,
            studentId: sId,
            amount: monthlyAmount,
            date: cycle.dueDate,
            mode: "Online",
            targetLabel: `${cycle.billingMonth} Invoice`,
            receiptNo: `REC-2025-${cycle.idSuffix}-${studNumber}`,
            transactionId: `TXN${studNumber}${idx}48A2`,
          });
        } else if (remainingPaid > 0) {
          status = "Pending";
          paidAmt = remainingPaid;
          rcpId = `RCP-${sId}-${cycle.idSuffix}`;
          receipts.push({
            id: rcpId,
            invoiceId: `INV-${sId}-${cycle.idSuffix}`,
            studentId: sId,
            amount: remainingPaid,
            date: "2025-05-10",
            mode: "Online",
            targetLabel: `${cycle.billingMonth} Invoice`,
            receiptNo: `REC-2025-${cycle.idSuffix}-${studNumber}`,
            transactionId: `TXN${studNumber}${idx}91B7`,
          });
          remainingPaid = 0;
        } else {
          status = "Overdue";
        }
      } else {
        status = "Upcoming";
      }

      invoices.push({
        id: `INV-${sId}-${cycle.idSuffix}`,
        studentId: sId,
        invoiceNo: `BL-2025-${cycle.idSuffix}-${studNumber}`,
        billingMonth: cycle.billingMonth,
        amount: monthlyAmount,
        paidAmount: paidAmt,
        remainingAmount: monthlyAmount - paidAmt,
        dueDate: cycle.dueDate,
        status: status,
        targetLabel: `${cycle.billingMonth} Invoice`,
        receiptId: rcpId,
        isVacationMonth: cycle.isVacation,
        vacationType: cycle.vacationType,
        lineItems,
      });
    });
  });

  return { invoices, receipts };
};

export const generateClubEnrollmentsSeed = (students, clubs) => {
  const clubEnrollments = [];
  students.forEach((student, idx) => {
    const primaryClubIdx = idx % clubs.length;
    clubEnrollments.push({
      id: `enroll-${student.id}-1`,
      studentId: student.id,
      clubId: clubs[primaryClubIdx].id,
      role:
        idx % 3 === 0 ? "Core Member" : idx % 3 === 1 ? "Volunteer" : "Member",
      joinedDate: "2024-07-20",
      status: "Active",
      badges: idx % 3 === 0 ? ["Outstanding Contributor"] : [],
    });

    if (idx % 2 === 0) {
      const secondaryClubIdx = (idx + 2) % clubs.length;
      clubEnrollments.push({
        id: `enroll-${student.id}-2`,
        studentId: student.id,
        clubId: clubs[secondaryClubIdx].id,
        role: "Member",
        joinedDate: "2024-08-15",
        status: "Active",
        badges: [],
      });
    }
  });
  return clubEnrollments;
};

export const generateResultsSeed = (
  students,
  streams,
  subjects,
  teacherSubjectAssignments,
) => {
  const results = [];
  let resIdCounter = 1;

  students.forEach((student, studIndex) => {
    const stream = streams.find((s) => s.id === student.streamId);
    if (!stream) return;

    const studentSubjects = subjects.filter((sub) =>
      stream.subjectIds.includes(sub.id),
    );

    studentSubjects.forEach((subject, subIdx) => {
      const assignment = teacherSubjectAssignments.find(
        (a) => a.classId === student.classId && a.subjectId === subject.id,
      );
      const teacherId = assignment ? assignment.teacherId : "teach-001";

      // Unit Test 1 Result
      const basePercentage = 0.65 + ((studIndex * 7 + subIdx * 11) % 31) * 0.01;
      const utMarks = Math.round(100 * basePercentage);
      const utGrade =
        utMarks >= 90
          ? "A+"
          : utMarks >= 80
            ? "A"
            : utMarks >= 70
              ? "B"
              : utMarks >= 60
                ? "C"
                : "D";
      const utRemarks =
        utMarks >= 90
          ? "Outstanding Effort"
          : utMarks >= 80
            ? "Very Good Progress"
            : utMarks >= 70
              ? "Good"
              : "Needs Improvement";

      results.push({
        id: `res-ut-${resIdCounter++}`,
        studentId: student.id,
        examId: "exam-ut-1",
        subjectId: subject.id,
        marksObtained: utMarks,
        maxMarks: 100,
        remarks: utRemarks,
        grade: utGrade,
        teacherId: teacherId,
        classId: student.classId,
      });

      // Half-Yearly Result
      const hyPercentage =
        basePercentage + (studIndex % 2 === 0 ? 0.03 : -0.04);
      const hyMarks = Math.round(
        100 * Math.min(1.0, Math.max(0.4, hyPercentage)),
      );
      const hyGrade =
        hyMarks >= 90
          ? "A+"
          : hyMarks >= 80
            ? "A"
            : hyMarks >= 70
              ? "B"
              : hyMarks >= 60
                ? "C"
                : "D";
      const hyRemarks =
        hyMarks >= 90
          ? "Exceptional Performance"
          : hyMarks >= 80
            ? "Well Prepared"
            : hyMarks >= 70
              ? "Satisfactory"
              : "Scope for Improvement";

      results.push({
        id: `res-hy-${resIdCounter++}`,
        studentId: student.id,
        examId: "exam-hy-2025",
        subjectId: subject.id,
        marksObtained: hyMarks,
        maxMarks: 100,
        remarks: hyRemarks,
        grade: hyGrade,
        teacherId: teacherId,
        classId: student.classId,
      });
    });
  });
  return results;
};

export const generateAssignmentsAndSubmissionsSeed = (
  subjects,
  teacherSubjectAssignments,
  students,
  streams,
) => {
  const assignments = [];
  const submissions = [];

  const assignmentTemplates = {
    "sub-phy": {
      title: "Electromagnetism & Circuits Lab",
      desc: "Prepare a report on Faraday's Law experiments and simulation observations.",
      totalMarks: 25,
    },
    "sub-chem": {
      title: "Chemical Kinetics & Rate Constants",
      desc: "Determine the rate constant of the reaction between iodide ions and hydrogen peroxide.",
      totalMarks: 30,
    },
    "sub-bio": {
      title: "Genetics & Pedigree Chart Analysis",
      desc: "Draw a pedigree chart for a three-generation family showcasing recessive trait genetics.",
      totalMarks: 20,
    },
    "sub-math": {
      title: "Differential Equations Set #5",
      desc: "Solve exercises on first-order linear differential equations and boundary conditions.",
      totalMarks: 50,
    },
    "sub-cs": {
      title: "SQL Relational Queries & Database Design",
      desc: "Draft entity relation diagrams and write SELECT JOIN queries for a school database.",
      totalMarks: 100,
    },
    "sub-eng": {
      title: "Modernism & Literary Criticism",
      desc: "Submit a critical analysis essay of T.S. Eliot's poems in Hornbill.",
      totalMarks: 20,
    },
    "sub-pe": {
      title: "Yoga & Cardio Fitness Journal",
      desc: "Track your daily calorie expenditure, heart rate progression, and yoga poses for two weeks.",
      totalMarks: 15,
    },
    "sub-acc": {
      title: "Corporate Balance Sheets Analysis",
      desc: "Analyze the published balance sheet of a public limited company from the NSE.",
      totalMarks: 40,
    },
    "sub-bst": {
      title: "Business Environment & Trade Study",
      desc: "Analyze the impact of GST reforms on micro-retailers in your locality.",
      totalMarks: 30,
    },
    "sub-eco": {
      title: "Monetary Policies & Macroeconomic Analysis",
      desc: "Draft a report on recent repo rate changes and interest rate impacts in India.",
      totalMarks: 35,
    },
    "sub-his": {
      title: "Harappan Civilization Archival Project",
      desc: "Analyze archaeological excavation sites and pottery styles of Mohenjo-Daro.",
      totalMarks: 25,
    },
    "sub-pol": {
      title: "Federalism & Decentralization Study",
      desc: "Explore state-local relations and municipal finance patterns in metropolitan areas.",
      totalMarks: 25,
    },
    "sub-geo": {
      title: "Soil Mechanics & Topographical Mapping",
      desc: "Create a physical topographic profile of the Western Ghats region.",
      totalMarks: 30,
    },
    "sub-soc": {
      title: "Social Stratification Fieldwork Survey",
      desc: "Conduct a virtual survey on domestic labor and gendered division of work.",
      totalMarks: 25,
    },
    "sub-ip": {
      title: "SQL & Database Queries",
      desc: "Write SQL commands to insert, update and select data from the Student registry.",
      totalMarks: 40,
    },
  };

  let asgnIdCounter = 1;

  subjects.forEach((subject) => {
    const template = assignmentTemplates[subject.id];
    if (!template) return;

    const isSci = [
      "sub-phy",
      "sub-chem",
      "sub-bio",
      "sub-cs",
      "sub-math",
    ].includes(subject.id);
    const isComm = ["sub-acc", "sub-bst", "sub-eco", "sub-ip"].includes(
      subject.id,
    );
    const isHum = ["sub-his", "sub-pol", "sub-geo", "sub-soc"].includes(
      subject.id,
    );
    const isShared = ["sub-eng", "sub-pe"].includes(subject.id);

    let targetClasses = [];
    if (isShared)
      targetClasses = ["class-11a", "class-11b", "class-11c", "class-11d"];
    else if (isSci)
      targetClasses =
        subject.id === "sub-bio" ? ["class-11b"] : ["class-11a", "class-11b"];
    else if (isComm) targetClasses = ["class-11c"];
    else if (isHum) targetClasses = ["class-11d"];
    else targetClasses = ["class-11a"];

    targetClasses.forEach((classId) => {
      const assignment = teacherSubjectAssignments.find(
        (a) => a.classId === classId && a.subjectId === subject.id,
      );
      if (!assignment) return;

      assignments.push({
        id: `asgn-${asgnIdCounter++}`,
        subjectId: subject.id,
        title: template.title,
        description: template.desc,
        dueDate: "2025-05-25",
        totalMarks: template.totalMarks,
        type: "Assignment",
        teacherId: assignment.teacherId,
        classId: classId,
      });
    });
  });

  let submIdCounter = 1;

  students.forEach((student, studIndex) => {
    const studentAssignments = assignments.filter(
      (a) => a.classId === student.classId,
    );
    const stream = streams.find((s) => s.id === student.streamId);
    if (!stream) return;

    const validAssignments = studentAssignments.filter((a) =>
      stream.subjectIds.includes(a.subjectId),
    );

    validAssignments.forEach((asgn, asgnIdx) => {
      const key = (studIndex + asgnIdx) % 5;
      let status = "GRADED";
      let score = null;
      let submittedAt = "2025-05-20";

      if (key === 0) {
        status = "PENDING";
      } else if (key === 1) {
        status = "SUBMITTED";
        submittedAt = "2025-05-24";
      } else {
        status = "GRADED";
        const percentage = 0.7 + ((asgnIdx * 3 + studIndex * 2) % 28) * 0.01;
        score = Math.round(asgn.totalMarks * percentage);
      }

      submissions.push({
        id: `subm-${submIdCounter++}`,
        assignmentId: asgn.id,
        studentId: student.id,
        status: status,
        score: score,
        submittedAt: status !== "PENDING" ? submittedAt : undefined,
      });
    });
  });

  return { assignments, submissions };
};

export const generateExamPapersSeed = (
  classes,
  subjects,
  teacherSubjectAssignments,
) => {
  const papers = [];
  let paperIdCounter = 1;

  // Extract all available teachers to dynamically allocate invigilators without conflicts
  const allTeacherIds = [
    ...new Set(teacherSubjectAssignments.map((a) => a.teacherId)),
  ];

  classes.forEach((cls) => {
    // Get all subjects assigned to this class
    const classAssignments = teacherSubjectAssignments.filter(
      (a) => a.classId === cls.id,
    );

    classAssignments.forEach((asgn, idx) => {
      const subject = subjects.find((s) => s.id === asgn.subjectId);
      // Skip non-academic activity periods (like library, games, art, music, etc.)
      if (!subject || subject.id.startsWith("act-")) return;

      const isScienceCore =
        subject.id === "sub-phy" ||
        subject.id === "sub-chem" ||
        subject.id === "sub-bio" ||
        subject.id === "sub-cs";

      // 1. Dynamic Room Allocation: assign class to its designated homeroom classroom
      const classRoomId = `room-${cls.id.replace("class-", "")}`;

      const isPractical = isScienceCore && idx % 2 === 0;
      let seededRoomId = classRoomId;
      if (isPractical) {
        seededRoomId =
          subject.id === "sub-cs" ? "room-lab-comp" : "room-lab-phy";
      }

      // 2. Dynamic Invigilator Selection: rotate teachers to avoid same-time invigilation clashes (optional/empty for primary & foundation grades)
      const isPrimaryOrFoundation =
        cls.stage === "foundation" || cls.stage === "primary";
      let invigilatorTeacherIds = [];
      if (!isPrimaryOrFoundation) {
        const classIdx = classes.findIndex((c) => c.id === cls.id);
        let invigilator =
          allTeacherIds[(classIdx + idx) % allTeacherIds.length];
        if (invigilator === asgn.teacherId) {
          invigilator =
            allTeacherIds[(classIdx + idx + 1) % allTeacherIds.length];
        }
        invigilatorTeacherIds = [invigilator];
      }

      // 1. Unit Test 1 Paper
      // Date spread: 2025-05-10 + idx days. Skip Sunday (2025-05-11 is Sunday)
      let utDayOffset = idx;
      if (utDayOffset >= 1) utDayOffset += 1; // Skip May 11
      const utDateStr = `2025-05-${10 + utDayOffset}`;
      const utStartTime = idx % 2 === 0 ? "08:30" : "10:30";
      const utEndTime = idx % 2 === 0 ? "09:30" : "11:30";

      papers.push({
        id: `paper-ut-${paperIdCounter++}`,
        examSessionId: "exam-ut-1",
        classId: cls.id,
        subjectId: subject.id,
        date: utDateStr,
        startTime: utStartTime,
        endTime: utEndTime,
        duration: 60,
        maxMarks: 40,
        passingMarks: 13,
        theoryMarks: 40,
        practicalMarks: 0,
        roomId: seededRoomId,
        invigilatorTeacherIds: invigilatorTeacherIds,
        status: "published",
        examMode: "written",
      });

      // 2. Half-Yearly Paper
      // Date spread: 2025-07-18 + idx days. Skip Sunday (2025-07-20 is Sunday, 2025-07-27 is Sunday)
      let hyDayOffset = idx;
      if (hyDayOffset >= 2) hyDayOffset += 1; // Skip July 20
      if (hyDayOffset >= 9) hyDayOffset += 1; // Skip July 27
      const hyDateStr = `2025-07-${18 + hyDayOffset}`;

      papers.push({
        id: `paper-hy-${paperIdCounter++}`,
        examSessionId: "exam-hy-2025",
        classId: cls.id,
        subjectId: subject.id,
        date: hyDateStr,
        startTime: "09:00",
        endTime: isPractical ? "11:30" : "12:00",
        duration: isPractical ? 150 : 180,
        maxMarks: 100,
        passingMarks: 33,
        theoryMarks: isScienceCore ? 70 : 100,
        practicalMarks: isScienceCore ? 30 : 0,
        roomId: seededRoomId,
        invigilatorTeacherIds: invigilatorTeacherIds,
        status: "published",
        examMode: isPractical ? "practical" : "written",
      });
    });
  });

  return papers;
};
