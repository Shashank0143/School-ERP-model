# 08 - Backend Integration Contract

## Purpose
This document outlines the strict data structures and constraints the backend MUST adhere to, regardless of whether the final implementation is REST, GraphQL, or gRPC. 
The contract is more important than the API style.

## Immutable Rules
1. **API Agnosticism**: The frontend service layer is built with generic async promises. The backend must simply return the JSON payload exactly as the frontend expects it.
2. **Stateless Auth**: The frontend expects a JWT-style session token. Session persistence is the frontend's responsibility.
3. **Canonical Class IDs**: The backend MUST respond with canonical numeric class levels (e.g., `11`) and never Roman numerals (`XI`). The frontend handles all display conversions.

## Core Payloads

### User Object
Must include `role`, `linkedEntityId`, and `active` status.

### Student Entity
Must include `classId` (format: `class-{level}{section}`) and `admissionNo`.

### Timetable Entity
Must be returned as a nested structure or flat list filterable by `classId` or `teacherId`.

### Teacher Entity
```json
{
  "id": "string (UUID)",
  "employeeId": "string",
  "name": "string",
  "designation": "string",
  "department": "string",
  "email": "string",
  "phoneNumber": "string"
}
```

### Parent Entity
```json
{
  "id": "string (UUID)",
  "name": "string",
  "email": "string",
  "phone": "string",
  "occupation": "string",
  "childIds": ["string (UUID)"]
}
```

### Class Entity
```json
{
  "id": "string (UUID)",
  "name": "string",
  "level": "string",
  "section": "string",
  "classTeacherId": "string (UUID) | null"
}
```

### Attendance Record
```json
{
  "studentId": "string (UUID)",
  "classId": "string (UUID)",
  "date": "string (YYYY-MM-DD)",
  "status": "string (present | absent | late | excused)",
  "remarks": "string"
}
```

### Exam Cycle
```json
{
  "id": "string (UUID)",
  "name": "string",
  "type": "string",
  "startDate": "string (YYYY-MM-DD)",
  "endDate": "string (YYYY-MM-DD)",
  "status": "string (planned | scheduled | ongoing | completed)"
}
```

### Assessment Governance
```json
{
  "id": "string (UUID)",
  "categories": "array (JSON objects with weightages)",
  "grades": "array (JSON objects with boundaries)",
  "passingRules": "object (JSON object with pass thresholds)",
  "lastUpdated": "string (ISO-8601)"
}
```

### Academic Report Card
```json
{
  "id": "string (UUID)",
  "studentId": "string (UUID)",
  "classId": "string (UUID)",
  "sessionId": "string",
  "metrics": "object (JSON object with subject-wise results)",
  "totalPercentage": "number",
  "overallGrade": "string",
  "status": "string (draft | published | frozen)",
  "publishedAt": "string (ISO-8601) | null"
}
```

### Assignment
```json
{
  "id": "string (UUID)",
  "title": "string",
  "subjectId": "string (UUID)",
  "classId": "string (UUID)",
  "teacherId": "string (UUID)",
  "dueDate": "string (YYYY-MM-DD)",
  "maxMarks": "number"
}
```

### Fee Ledger
```json
{
  "id": "string (UUID)",
  "studentId": "string (UUID)",
  "totalAmount": "number",
  "paidAmount": "number",
  "balance": "number",
  "dueDate": "string (YYYY-MM-DD)",
  "status": "string (paid | partial | unpaid | overdue)"
}
```

### Transport Route
```json
{
  "id": "string (UUID)",
  "name": "string",
  "vehicleId": "string (UUID)",
  "driverId": "string (UUID)"
}
```

### Leave Request
```json
{
  "id": "string (UUID)",
  "requesterId": "string (UUID)",
  "requesterType": "string (student | teacher | employee)",
  "leaveType": "string (Sick | Casual | Maternity | Paternity | Other)",
  "fromDate": "string (YYYY-MM-DD)",
  "toDate": "string (YYYY-MM-DD)",
  "reason": "string",
  "status": "string (pending | approved | rejected)",
  "approvedBy": "string (UUID) | null",
  "adminRemarks": "string | null",
  "attachmentUrl": "string | null",
  "appliedAt": "string (ISO-8601)"
}
```

### Notice
```json
{
  "id": "string (UUID)",
  "title": "string",
  "content": "string",
  "status": "string (draft | Published)",
  "category": "string",
  "publishedAt": "string (ISO-8601)"
}
```

### Club Enrollment
```json
{
  "studentId": "string (UUID)",
  "clubId": "string (UUID)",
  "role": "string (member | captain)",
  "joinedAt": "string (ISO-8601)"
}
```

### Mentorship Session
```json
{
  "id": "string (UUID)",
  "mentorId": "string (UUID)",
  "studentId": "string (UUID)",
  "scheduledAt": "string (ISO-8601)",
  "status": "string (scheduled | completed | cancelled)"
}
```

### Support Request
```json
{
  "id": "string (UUID)",
  "requesterId": "string (UUID)",
  "category": "string",
  "title": "string",
  "description": "string",
  "status": "string (Open | In Review | Resolved)"
}
```

### Duty Request
```json
{
  "id": "string (UUID)",
  "title": "string",
  "dutyDate": "string (YYYY-MM-DD)",
  "requestedByTeacherId": "string (UUID)",
  "status": "string (Active | Completed)",
  "targetStudentIds": ["string (UUID)"]
}
```

## Special Cases

### Identity Card Module
- **Integration Rule**: None.
- **Contract**: The current implementation of the ID Card module is completely frontend-only. There is NO backend endpoint required, NO backend logic, and NO API payload expected. ID Cards render purely by mapping data from existing profile/student/teacher endpoints.

### Academic Operations Lifecycle
- **Integration Rule**: The backend must support the sequential lifecycle: `Teacher Submission` -> `Admin Evaluation` -> `Governance Configuration` -> `Report Card Generation` -> `Freeze/Publish`.
- **Contract**: Expected endpoints include Governance CRUD, Report Card Generation, and state transitions (Draft -> Published -> Frozen). See `11-api-contracts.md` for exact endpoints.

*(For detailed Schema configurations and exact field names, refer to `02-technical-reference.md` and `04-database-architecture.md`).*
