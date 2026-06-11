# Support Center Backend Contract

This document outlines the architectural boundaries and canonical data contracts established during Phase 5 for the Support Center module. These contracts ensure the React UI is completely detached from the specific data storage layer.

## Architecture

```text
UI (React Pages & Components)
  ↓
Service (supportService.js)
  ↓
Provider Interface (supportProvider.js)
  ↓
Storage Implementation (e.g. localProvider.js -> apiProvider.js)
```

By ensuring that `supportService.js` strictly calls `supportProvider`, future API migration simply involves updating the implementations behind the `supportProvider` boundary without touching any UI code.

## Data Contracts

### 1. Support Request DTO

The canonical shape of a Support Request object expected by the frontend.

```javascript
{
  id: "string",                   // Unique identifier

  requesterType: "string",        // "Student" | "Parent" | "Teacher" | "Employee"
  requesterId: "string",          // Unique ID of the requester
  requesterName: "string",        // Display name

  category: "string",             // See Category Values below

  title: "string",                // Brief summary
  description: "string",          // Detailed context

  anonymous: "boolean",           // If true, hide requesterName in UI logic

  complaintAgainstType?: "string",// Optional: "Student" | "Teacher" | "Employee"
  complaintAgainstId?: "string",  // Optional: Target entity ID

  priority: "string",             // "High" | "Medium" | "Low"

  status: "string",               // See Status Values below

  remarks: [RemarkDTO],           // Timeline of remarks

  createdAt: "string",            // ISO-8601 Timestamp
  updatedAt: "string"             // ISO-8601 Timestamp
}
```

### 2. Remark DTO

Remarks represent append-only messages attached to a support request. They cannot be edited or deleted.

```javascript
{
  id: "string",                   // Unique identifier for the remark
  message: "string",              // Body content
  createdBy: "string",            // Employee ID who authored the remark
  createdAt: "string"             // ISO-8601 Timestamp
}
```

## Enumerated Values

### Status Values
Allowed values for the `status` field.
* `Open`
* `In Review`
* `Resolved`
* `Closed`

### Category Values
Allowed values for the `category` field.
* `Help Request`
* `Complaint`
* `Feedback`
* `Suggestion`
* `Technical Support`

## Provider Methods

The `supportProvider` exposes the following abstract methods:

```javascript
// Fetch all support requests (admin scope)
getSupportRequests() => Promise<SupportRequestDTO[]>

// Fetch a single request by ID
getSupportRequestById(id: string) => Promise<SupportRequestDTO | null>

// Create a new support request
createSupportRequest(data: Partial<SupportRequestDTO>) => Promise<SupportRequestDTO>

// Update the status of a request
updateSupportRequestStatus(id: string, status: string) => Promise<SupportRequestDTO>

// Add a remark to a request
addSupportRemark(id: string, remark: Partial<RemarkDTO>) => Promise<SupportRequestDTO>

// Fetch settings (e.g. current handler employee ID)
getSupportSettings() => Promise<{ module: string, handlerEmployeeId: string }>
```

## Future API Mapping (Example)

When transitioning to a real backend, `supportProvider.js` methods will map to these standard REST endpoints:

```http
GET    /api/v1/support
GET    /api/v1/support/:id
POST   /api/v1/support
PATCH  /api/v1/support/:id/status
POST   /api/v1/support/:id/remarks
GET    /api/v1/settings/support_center
```
