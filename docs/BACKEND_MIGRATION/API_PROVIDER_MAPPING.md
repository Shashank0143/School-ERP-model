# API Provider Mapping for Backend Migration

This document maps the current notice service methods to future REST API endpoints for clean backend migration.

## Current Service Methods → API Endpoints

### Notice Service (`src/services/noticeService.js`)

| Current Method | API Endpoint | HTTP Method | Description |
|----------------|--------------|-------------|-------------|
| `getNotices()` | `GET /api/notices` | GET | Fetch all notices with optional filters |
| `getNoticeById(id)` | `GET /api/notices/:id` | GET | Fetch single notice by ID |
| `createNotice(data)` | `POST /api/notices` | POST | Create new notice |
| `updateNotice(id, data)` | `PUT /api/notices/:id` | PUT | Update existing notice |
| `deleteNotice(id)` | `DELETE /api/notices/:id` | DELETE | Delete notice |
| `markNoticeRead(noticeId, userId)` | `POST /api/notices/:id/read` | POST | Mark notice as read by user |

### Notice Action Service (`src/services/noticeActionService.js`)

| Current Method | API Endpoint | HTTP Method | Description |
|----------------|--------------|-------------|-------------|
| `getUserActionResponse(noticeId, userId)` | `GET /api/notices/:id/actions/:userId` | GET | Get user's action response |
| `hasUserResponded(noticeId, userId)` | `GET /api/notices/:id/actions/:userId/status` | GET | Check if user responded |
| `getActionStatus(noticeId, userId)` | `GET /api/notices/:id/actions/:userId/status` | GET | Get action status |
| `acknowledgeNotice(noticeId, userId)` | `POST /api/notices/:id/actions/acknowledge` | POST | Acknowledge notice |
| `rsvpNotice(noticeId, userId, response, data)` | `POST /api/notices/:id/actions/rsvp` | POST | RSVP to notice |
| `submitNoticeForm(noticeId, userId, formData)` | `POST /api/notices/:id/actions/submit` | POST | Submit form response |
| `submitNoticePayment(noticeId, userId, paymentData)` | `POST /api/notices/:id/actions/payment` | POST | Submit payment |
| `uploadNoticeDocument(noticeId, userId, documentData)` | `POST /api/notices/:id/actions/upload` | POST | Upload document |
| `getNoticeActionStats(noticeId)` | `GET /api/notices/:id/actions/stats` | GET | Get action statistics |
| `getPendingActionsForUser(userId)` | `GET /api/users/:userId/actions/pending` | GET | Get pending actions for user |
| `getOverdueActionsForUser(userId)` | `GET /api/users/:userId/actions/overdue` | GET | Get overdue actions for user |
| `getNoticeResponses(noticeId)` | `GET /api/notices/:id/actions` | GET | Get all responses for notice |
| `getResponsesByType(noticeId, responseType)` | `GET /api/notices/:id/actions?type=...` | GET | Get responses by type |
| `deleteActionResponse(noticeId, userId)` | `DELETE /api/notices/:id/actions/:userId` | DELETE | Delete user response |

### Notice Scheduler Service (`src/services/noticeScheduler.js`)

| Current Method | API Endpoint | HTTP Method | Description |
|----------------|--------------|-------------|-------------|
| `scheduleNotice(noticeId, scheduledTime, expiryTime, autoArchiveAfter)` | `POST /api/notices/:id/schedule` | POST | Schedule notice publication |
| `setNoticeExpiry(noticeId, expiryTime, autoArchiveAfter)` | `POST /api/notices/:id/expire` | POST | Set notice expiry |
| `getUpcomingScheduledNotices()` | `GET /api/notices/scheduled/upcoming` | GET | Get upcoming scheduled notices |
| `getExpiringNotices()` | `GET /api/notices/expiring` | GET | Get notices expiring soon |
| `getNoticesNeedingArchive()` | `GET /api/notices/archive/pending` | GET | Get notices needing archive |

### Notice Orchestrator Service (`src/services/noticeOrchestrator.js`)

| Current Method | API Endpoint | HTTP Method | Description |
|----------------|--------------|-------------|-------------|
| `generateNoticeFromEvent(eventType, eventData)` | `POST /api/notices/orchestrator/generate` | POST | Generate notice from event |
| `createNoticeFromEvent(eventType, eventData)` | `POST /api/notices/orchestrator/create` | POST | Create notice from event |
| `triggerNoticeGeneration(eventType, eventData)` | `POST /api/notices/orchestrator/trigger` | POST | Manual trigger |
| `batchGenerateNotices(events)` | `POST /api/notices/orchestrator/batch` | POST | Batch generate notices |

## API Request/Response Examples

### GET /api/notices

**Query Parameters:**
- `status`: Filter by status (published, draft, scheduled, archived, expired)
- `category`: Filter by category
- `priority`: Filter by priority
- `userId`: Filter notices for specific user
- `unreadOnly`: Filter only unread notices
- `pendingActionOnly`: Filter only notices requiring action

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "notice-001",
      "title": "Half-Yearly Examination Schedule Released",
      "message": "...",
      "category": "examination",
      "priority": "important",
      "status": "published",
      "requiresAction": false,
      "actionType": "none",
      "createdAt": "2025-01-15T10:00:00Z",
      "publishedAt": "2025-01-15T10:00:00Z",
      "expiresAt": null,
      "readReceipts": [
        { "userId": "student-001", "readAt": "2025-01-15T10:30:00Z" }
      ],
      "actionResponses": []
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50
  }
}
```

### POST /api/notices

**Request Body:**
```json
{
  "title": "School Holiday Announcement",
  "message": "School will remain closed on...",
  "category": "holiday",
  "priority": "important",
  "status": "scheduled",
  "publishedAt": "2025-02-01T08:00:00Z",
  "expiresAt": "2025-02-02T23:59:59Z",
  "autoArchiveAfter": 30,
  "targetAudience": {
    "type": "ALL"
  },
  "deliveryChannels": ["portal", "email", "sms"],
  "requiresAction": false,
  "actionType": "none",
  "actionDeadline": null,
  "metadata": {}
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "notice-002",
    "title": "School Holiday Announcement",
    "message": "School will remain closed on...",
    "category": "holiday",
    "priority": "important",
    "status": "scheduled",
    "createdAt": "2025-01-20T14:00:00Z",
    "publishedAt": "2025-02-01T08:00:00Z",
    "expiresAt": "2025-02-02T23:59:59Z",
    "autoArchiveAfter": 30,
    "targetAudience": {
      "type": "ALL"
    },
    "deliveryChannels": ["portal", "email", "sms"],
    "requiresAction": false,
    "actionType": "none",
    "actionDeadline": null,
    "readReceipts": [],
    "actionResponses": [],
    "metadata": {},
    "createdBy": "admin-001"
  }
}
```

### POST /api/notices/:id/actions/acknowledge

**Request Body:**
```json
{
  "userId": "parent-001"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "noticeId": "notice-001",
    "userId": "parent-001",
    "responseType": "acknowledged",
    "responseAt": "2025-01-20T15:30:00Z"
  }
}
```

## Migration Strategy

### Phase 1: Service Layer Abstraction
1. Create `apiProvider.js` that wraps all API calls
2. Update service methods to use `apiProvider` instead of direct localStorage
3. Keep localStorage as fallback for offline mode

### Phase 2: Backend Implementation
1. Implement REST API endpoints on backend
2. Deploy to staging environment
3. Test all endpoints with Postman/Insomnia

### Phase 3: Frontend Integration
1. Update `apiProvider.js` to use REST API
2. Remove localStorage fallback (or keep for offline sync)
3. Add error handling for network failures

### Phase 4: Production Deployment
1. Deploy backend to production
2. Update frontend API base URL
3. Monitor API performance and errors

## Authentication & Authorization

All API endpoints should include:
- JWT token in `Authorization: Bearer <token>` header
- Role-based access control (RBAC)
- Rate limiting per user
- Request validation and sanitization

## Error Handling

Standard error response format:
```json
{
  "success": false,
  "error": {
    "code": "NOTICE_NOT_FOUND",
    "message": "Notice with ID notice-001 not found",
    "details": {}
  }
}
```

Common error codes:
- `NOTICE_NOT_FOUND` - Notice does not exist
- `UNAUTHORIZED` - User not authenticated
- `FORBIDDEN` - User lacks permission
- `VALIDATION_ERROR` - Invalid request data
- `ALREADY_RESPONDED` - User already responded to notice
- `DEADLINE_PASSED` - Action deadline has passed

### Communication Center Service (src/services/communicationCenterService.js / Stub)

| Current Method | API Endpoint | HTTP Method | Description |
|----------------|--------------|-------------|-------------|
| getCampaigns() | GET /api/communication/campaigns | GET | Fetch all campaigns |
| getCampaignById(id) | GET /api/communication/campaigns/:id | GET | Fetch single campaign |
| createCampaign(data) | POST /api/communication/campaigns | POST | Create and queue new campaign |
| getTemplates() | GET /api/communication/templates | GET | Fetch communication templates |

### Timetable Services (src/services/timetable/*)

| Current Method | API Endpoint | HTTP Method | Description |
|----------------|--------------|-------------|-------------|
| initializeTimetables() | POST /api/timetable/initialize | POST | Bulk initialize timetables |
| saveTimetableSlot() | PUT /api/timetable/slot | PUT | Save or update specific slot |
| clearTimetableSlot() | DELETE /api/timetable/slot | DELETE | Clear a specific slot |
| alidateTimetables() | POST /api/timetable/validate | POST | Validate timetable for conflicts |

### Workflow Event Bus (src/services/workflowEvents.js)

| Current Method | API Endpoint | HTTP Method | Description |
|----------------|--------------|-------------|-------------|
| emitEvent(type, payload) | POST /api/events/emit | POST | Emit a system event to queue |
