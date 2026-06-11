# 12 - Provider Contracts & Implementation Gap Analysis

This document maps the exact state of the Data Provider methods across the three critical layers:
1. `providerInterface.js` (The Formal Contract)
2. `src/services/*` (The Consumer)
3. `localProvider.js` (The Current Implementation)

When migrating to the backend, the future `apiProvider` MUST satisfy the **Implemented + Contracted** and **Implemented + Not Contracted** methods, or the frontend will break.

## Classification Legend
- 🟢 **Implemented + Contracted**: Exists in localProvider, used by Services, and explicitly defined in `providerInterface.js`.
- 🔴 **Implemented + Not Contracted**: Exists in localProvider, used by Services, but **MISSING** from `providerInterface.js`. (Architectural gap).
- ⚪ **Planned + Not Implemented**: Does not exist in localProvider or Services. Exists only as UI stubs or theoretical requirements.

---

## 1. Authentication & Users
| Method | Classification | Status |
|---|---|---|
| `login` | 🟢 Implemented + Contracted | Active |
| `getCurrentUser` | 🟢 Implemented + Contracted | Active |
| `logout` | 🟢 Implemented + Contracted | Active |

## 2. Students, Teachers & Parents
| Method | Classification | Status |
|---|---|---|
| `getStudents`, `getStudentById` | 🟢 Implemented + Contracted | Active |
| `updateStudent` | 🟢 Implemented + Contracted | Active |
| `getTeachers`, `getTeacherById` | 🟢 Implemented + Contracted | Active |
| `getParents`, `getParentById` | 🟢 Implemented + Contracted | Active |
| `getEmployees` | 🔴 Implemented + Not Contracted | Used by `EmployeeDirectoryPage.jsx` directly |

## 3. Academics (Classes, Subjects, Timetable)
| Method | Classification | Status |
|---|---|---|
| `getClasses`, `getClassById` | 🟢 Implemented + Contracted | Active |
| `getSubjects`, `getStreams` | 🟢 Implemented + Contracted | Active |
| `getTimetables`, `setTimetables` | 🟢 Implemented + Contracted | Active |

## 4. Attendance
| Method | Classification | Status |
|---|---|---|
| `getDailyAttendance` | 🟢 Implemented + Contracted | Active |
| `markAttendance` | 🟢 Implemented + Contracted | Active |
| `getAttendanceSessions` | 🟢 Implemented + Contracted | Active |

## 5. Assignments & Exams
| Method | Classification | Status |
|---|---|---|
| `getAssignments`, `createAssignment` | 🟢 Implemented + Contracted | Active |
| `getSubmissions`, `updateSubmission` | 🟢 Implemented + Contracted | Active |
| `getExams`, `createExam` | 🟢 Implemented + Contracted | Active |
| `getResults`, `createResult` | 🟢 Implemented + Contracted | Active |

## 6. Finance
| Method | Classification | Status |
|---|---|---|
| `getFees`, `getFeesByStudent` | 🟢 Implemented + Contracted | Active |
| `getInvoices`, `getReceipts` | 🟢 Implemented + Contracted | Active |

## 7. Transport
| Method | Classification | Status |
|---|---|---|
| `getTransportRoutes`, `getTransportVehicles` | 🟢 Implemented + Contracted | Active |
| `getTransportAlerts` | 🟢 Implemented + Contracted | Active |

## 8. Support Center
| Method | Classification | Status |
|---|---|---|
| `getSupportRequests` | 🔴 Implemented + Not Contracted | Used heavily by `supportService.js` |
| `createSupportRequest` | 🔴 Implemented + Not Contracted | Used heavily by `supportService.js` |
| `updateSupportRequest` | 🔴 Implemented + Not Contracted | Used heavily by `supportService.js` |
| `addSupportRemark` | 🔴 Implemented + Not Contracted | Used heavily by `supportService.js` |
| `getSupportSettings` | 🔴 Implemented + Not Contracted | Used heavily by `supportService.js` |

## 9. Student Duty Management
| Method | Classification | Status |
|---|---|---|
| `getStudentDutyRequests` | 🔴 Implemented + Not Contracted | Used heavily by `studentDutyService.js` |
| `createStudentDutyRequest` | 🔴 Implemented + Not Contracted | Used heavily by `studentDutyService.js` |
| `updateStudentDutyRequest` | 🔴 Implemented + Not Contracted | Used heavily by `studentDutyService.js` |
| `cancelStudentDutyRequest` | 🔴 Implemented + Not Contracted | Used heavily by `studentDutyService.js` |
| `completeStudentDutyRequest`| 🔴 Implemented + Not Contracted | Used heavily by `studentDutyService.js` |

## 10. Clubs & Committees
| Method | Classification | Status |
|---|---|---|
| `getClubs`, `getClubById` | 🟢 Implemented + Contracted | Active |
| `getClubEnrollments` | 🟢 Implemented + Contracted | Active |
| `getClubAnnouncements` | 🔴 Implemented + Not Contracted | Used by `clubsService.js` |
| `getClubCreationProposals` | 🔴 Implemented + Not Contracted | Used by `clubsService.js` |
| `assignClubRole`, `demote` | 🔴 Implemented + Not Contracted | Used by `clubsService.js` |

## 11. Departments & Access Control
| Method | Classification | Status |
|---|---|---|
| `getDepartments`, `createDepartment`, `updateDepartment`, `deleteDepartment` | 🔴 Implemented + Not Contracted | Bypasses service layer, used by `ManageDepartmentsPage.jsx` directly |
| `getApprovalSettings`, `updateApprovalSetting` | 🔴 Implemented + Not Contracted | Bypasses service layer, used by `AccessControlPage.jsx` directly |
| `getCampaigns`, `createCampaign` | ⚪ Planned + Not Implemented | UI Stub Only in `CommunicationCenterPage.jsx` |

---

## Action Plan for Backend Migration
The backend team MUST ensure that the future `apiProvider.js` implements all 🟢 **and** 🔴 methods. Before backend work begins, the frontend team should backport all 🔴 methods into `providerInterface.js` to properly formally document the expected signatures.
