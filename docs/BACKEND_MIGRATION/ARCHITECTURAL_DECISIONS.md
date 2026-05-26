# Architectural Decisions and Constraints

This document captures the critical architectural decisions, constraints, and design principles that guide the notice system implementation.

## Core Architectural Principle

### The Single Most Important Decision

**Notice Orchestrator + Workflow Events**

This is the fundamental difference between:
- A **school dashboard** (simple data display)
- An **institution operating system** (event-driven workflow automation)

**Why This Matters:**
- Workflow modules emit events, not notices
- Orchestrator maps events to notice templates
- Centralized audience resolution ensures consistency
- Scalable to any number of workflow types
- Testable in isolation from UI
- Migratable to backend without UI changes

**Without This Decision:**
- Each module generates its own notices
- Duplicated audience logic across modules
- Tight coupling between workflow and communication
- Difficult to maintain and extend
- Backend migration requires rewriting every module

## Critical DO NOTs

### 1. DO NOT Directly Couple Notices with UI

**Wrong:**
```javascript
// Component directly creates notice
const handleExamCreated = () => {
  const notice = {
    title: "Exam Created",
    message: "...",
    targetAudience: { type: "CLASS", classIds: ["class-1a"] }
  };
  createNotice(notice);
};
```

**Right:**
```javascript
// Component emits workflow event
const handleExamCreated = () => {
  emitEvent('EXAM_CREATED', {
    examId: 'exam-001',
    classIds: ['class-1a'],
    subject: 'Mathematics'
  });
};

// Orchestrator handles notice generation
onEvent('EXAM_CREATED', async (eventData) => {
  const notice = await generateNoticeFromEvent('EXAM_CREATED', eventData);
  await createNotice(notice);
});
```

### 2. DO NOT Hardcode Audience Logic in Components

**Wrong:**
```javascript
// Component determines audience
const targetStudents = students.filter(s => s.classId === 'class-1a');
const targetParents = parents.filter(p => p.children.includes(studentId));
```

**Right:**
```javascript
// Use centralized audience resolver
const audience = await resolveExamAudience({
  classIds: ['class-1a'],
  subjectId: 'subject-001'
});
```

### 3. DO NOT Create Separate Notice Systems per Portal

**Wrong:**
```javascript
// Separate notice systems
const studentNotices = [];
const teacherNotices = [];
const parentNotices = [];
```

**Right:**
```javascript
// Single canonical notice system
const notices = [];
// Audience targeting handles role-based delivery
const targetAudience = {
  type: 'CLASS',
  classIds: ['class-1a']
};
```

### 4. DO NOT Mutate localStorage Directly in Components

**Wrong:**
```javascript
// Component directly mutates localStorage
localStorage.setItem('notices', JSON.stringify(updatedNotices));
```

**Right:**
```javascript
// Use service layer
await updateNotice(noticeId, updates);
```

### 5. DO NOT Let Workflow Modules Generate Notices Themselves

**Wrong:**
```javascript
// Exam service generates notice
export const createExam = async (examData) => {
  const exam = await createExamSession(examData);
  const notice = {
    title: `Exam Created: ${exam.name}`,
    message: `...`,
    targetAudience: { type: 'CLASS', classIds: exam.classIds }
  };
  await createNotice(notice);
  return exam;
};
```

**Right:**
```javascript
// Exam service emits event
export const createExam = async (examData) => {
  const exam = await createExamSession(examData);
  emitEvent('EXAM_CREATED', {
    examId: exam.id,
    examName: exam.name,
    classIds: exam.classIds,
    sourceModule: 'examinations',
    createdBy: examData.createdBy
  });
  return exam;
};
```

## Architectural Constraints

### 1. Service Layer Abstraction

**Constraint:** All data access must go through service layer.

**Rationale:**
- Enables backend migration without UI changes
- Centralizes business logic
- Enables testing and mocking
- Provides consistent error handling

**Implementation:**
```javascript
// Service layer
export const getNotices = async (filters = {}) => {
  if (USE_API) {
    return apiProvider.get('/notices', filters);
  }
  // Fallback to localStorage
  return getItem(STORAGE_KEYS.NOTICES, []);
};
```

### 2. Event-Driven Architecture

**Constraint:** Workflow modules emit events, not create notices.

**Rationale:**
- Decouples workflow from communication
- Enables multiple listeners per event
- Facilitates testing and debugging
- Supports future extensions (webhooks, integrations)

**Implementation:**
```javascript
// Event emitter
class EventEmitter {
  constructor() {
    this.listeners = {};
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }
}
```

### 3. Template-Based Notice Generation

**Constraint:** Notices are generated from templates, not hardcoded.

**Rationale:**
- Consistent messaging across events
- Easy to update notice content
- Supports multi-language
- Centralized content management

**Implementation:**
```javascript
const NOTICE_TEMPLATES = {
  EXAM_CREATED: {
    generateTitle: (data) => `Exam Created - ${data.examName}`,
    generateMessage: (data) => `...`,
    category: NOTICE_CATEGORIES.EXAMINATION,
    priority: NOTICE_PRIORITIES.IMPORTANT
  }
};
```

### 4. Centralized Audience Resolution

**Constraint:** All audience targeting uses centralized resolver.

**Rationale:**
- Consistent audience logic
- Supports complex targeting rules
- Easy to extend with new audience types
- Prevents duplicate logic

**Implementation:**
```javascript
export async function resolveExamAudience(examData) {
  const { classIds, subjectId, examType } = examData;
  
  if (examType === 'practical' && subjectId) {
    return {
      type: AUDIENCE_TYPES.CLASS,
      classIds,
      subjectIds: [subjectId]
    };
  }
  
  return {
    type: AUDIENCE_TYPES.CLASS,
    classIds
  };
}
```

### 5. Single Canonical Notice System

**Constraint:** One notice system for all portals and roles.

**Rationale:**
- Single source of truth
- Consistent data model
- Simplifies maintenance
- Enables cross-portal analytics

**Implementation:**
```javascript
// Single notice collection
const notices = [];

// Audience targeting handles role-based delivery
const userNotices = notices.filter(n => 
  isUserInAudience(n.targetAudience, user)
);
```

## Data Model Constraints

### 1. Immutable Notice IDs

**Constraint:** Notice IDs never change after creation.

**Rationale:**
- Stable references for read receipts
- Reliable action tracking
- Consistent delivery logs

**Implementation:**
```javascript
const notice = {
  id: `notice_${Date.now()}`, // Generated once, never changed
  title: "...",
  // ... other fields
};
```

### 2. Append-Only Read Receipts

**Constraint:** Read receipts are only added, never removed.

**Rationale:**
- Audit trail of who read what
- Analytics on read rates
- No data loss

**Implementation:**
```javascript
const readReceipts = notice.readReceipts || [];
readReceipts.push({
  userId: 'user-001',
  readAt: new Date().toISOString()
});
// Never remove read receipts
```

### 3. Single Action Response Per User

**Constraint:** Each user can respond to a notice only once.

**Rationale:**
- Prevents duplicate responses
- Simplifies action tracking
- Clear compliance status

**Implementation:**
```javascript
const existingResponse = notice.actionResponses?.find(
  r => r.userId === userId
);
if (existingResponse) {
  throw new Error('Already responded');
}
```

### 4. Status State Machine

**Constraint:** Notice status follows defined transitions.

**Rationale:**
- Predictable lifecycle
- Prevents invalid states
- Enables scheduled operations

**Valid Transitions:**
- draft → scheduled
- draft → published
- scheduled → published
- published → expired
- published → archived
- expired → archived
- any → cancelled

**Implementation:**
```javascript
const VALID_TRANSITIONS = {
  draft: ['scheduled', 'published', 'cancelled'],
  scheduled: ['published', 'cancelled'],
  published: ['expired', 'archived', 'cancelled'],
  expired: ['archived'],
  archived: [],
  cancelled: []
};

function canTransition(from, to) {
  return VALID_TRANSITIONS[from]?.includes(to);
}
```

## Performance Constraints

### 1. Pagination for Large Datasets

**Constraint:** All list queries must support pagination.

**Rationale:**
- Prevents memory issues
- Improves response times
- Enables incremental loading

**Implementation:**
```javascript
export const getNotices = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  return apiProvider.get('/notices', { page, limit, offset });
};
```

### 2. Indexing for Common Queries

**Constraint:** Database indexes for frequently accessed fields.

**Rationale:**
- Fast query performance
- Scalable to large datasets
- Prevents full table scans

**Required Indexes:**
- `notices(status, published_at)`
- `notice_reads(notice_id, user_id)`
- `notice_actions(notice_id, user_id)`
- `notice_delivery_logs(notice_id, status)`

### 3. Caching for Repeated Queries

**Constraint:** Cache frequently accessed data.

**Rationale:**
- Reduces database load
- Improves response times
- Better user experience

**Implementation:**
```javascript
const cache = new Map();

export const getNotices = async (filters = {}) => {
  const cacheKey = JSON.stringify(filters);
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  const notices = await apiProvider.get('/notices', filters);
  cache.set(cacheKey, notices);
  return notices;
};
```

## Security Constraints

### 1. Role-Based Access Control

**Constraint:** All API endpoints enforce RBAC.

**Rationale:**
- Prevents unauthorized access
- Protects sensitive data
- Enables audit trails

**Implementation:**
```javascript
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, JWT_SECRET);
  
  if (!hasPermission(decoded.role, req.path, req.method)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  req.user = decoded;
  next();
};
```

### 2. Input Validation

**Constraint:** All user inputs are validated and sanitized.

**Rationale:**
- Prevents injection attacks
- Ensures data integrity
- Provides clear error messages

**Implementation:**
```javascript
const validateNoticeData = (data) => {
  const schema = {
    title: { type: 'string', required: true, maxLength: 500 },
    message: { type: 'string', required: true },
    category: { type: 'string', required: true, enum: Object.values(NOTICE_CATEGORIES) },
    priority: { type: 'string', required: true, enum: Object.values(NOTICE_PRIORITIES) }
  };
  
  const errors = validate(data, schema);
  if (errors.length > 0) {
    throw new ValidationError(errors);
  }
};
```

### 3. Audit Logging

**Constraint:** All notice operations are logged.

**Rationale:**
- Accountability
- Debugging
- Compliance

**Implementation:**
```javascript
async function logAudit(action, userId, noticeId, details) {
  await AuditLog.create({
    action,
    userId,
    noticeId,
    details,
    timestamp: new Date()
  });
}
```

## Scalability Constraints

### 1. Horizontal Scalability

**Constraint:** System must support horizontal scaling.

**Rationale:**
- Handle increased load
- High availability
- Fault tolerance

**Implementation:**
- Stateless API servers
- Load balancer
- Shared database
- Redis for session/cache

### 2. Queue-Based Delivery

**Constraint:** All delivery operations use queues.

**Rationale:**
- Prevents blocking
- Enables retry logic
- Handles high volume

**Implementation:**
```javascript
const deliveryQueue = new Queue('notice-delivery');

deliveryQueue.add({
  noticeId: 'notice-001',
  channel: 'email',
  recipientId: 'user-001'
});
```

### 3. Database Sharding Readiness

**Constraint:** Database schema supports sharding.

**Rationale:**
- Scale to large datasets
- Distribute load
- Geographic distribution

**Implementation:**
- Include `created_at` timestamp in all tables
- Use consistent sharding keys
- Avoid cross-shard queries

## Maintainability Constraints

### 1. Single Responsibility Principle

**Constraint:** Each service/module has one responsibility.

**Rationale:**
- Easy to understand
- Easy to test
- Easy to modify

**Examples:**
- `noticeService.js` - CRUD operations
- `noticeActionService.js` - Action responses
- `noticeScheduler.js` - Scheduled operations
- `noticeOrchestrator.js` - Event-to-notice mapping

### 2. Dependency Injection

**Constraint:** Dependencies are injected, not hardcoded.

**Rationale:**
- Easy to test
- Easy to swap implementations
- Flexible configuration

**Implementation:**
```javascript
class NoticeService {
  constructor(dataProvider) {
    this.dataProvider = dataProvider;
  }
  
  async getNotices() {
    return this.dataProvider.getNotices();
  }
}

// Use with localStorage
const localStorageProvider = new LocalStorageProvider();
const noticeService = new NoticeService(localStorageProvider);

// Use with API
const apiProvider = new ApiProvider();
const noticeService = new NoticeService(apiProvider);
```

### 3. Comprehensive Testing

**Constraint:** All code has tests.

**Rationale:**
- Prevents regressions
- Documents behavior
- Enables refactoring

**Test Coverage:**
- Unit tests for services
- Integration tests for API
- E2E tests for critical flows
- Performance tests for bottlenecks

## Migration Path Constraints

### 1. Zero Downtime Migration

**Constraint:** Migration must not require downtime.

**Rationale:**
- Continuous availability
- User experience
- Business continuity

**Implementation:**
- Feature flags for API mode
- Gradual rollout
- Rollback capability

### 2. Data Consistency

**Constraint:** Data must remain consistent during migration.

**Rationale:**
- No data loss
- No corruption
- Accurate analytics

**Implementation:**
- Transactional data migration
- Validation scripts
- Backup before migration
- Post-migration verification

### 3. Backward Compatibility

**Constraint:** Old versions must work during migration.

**Rationale:**
- Gradual migration
- Testing in production
- Rollback safety

**Implementation:**
- Versioned API
- Deprecation warnings
- Graceful degradation

## Technology Stack Constraints

### 1. Framework Agnostic

**Constraint:** Notice system must work with any frontend framework.

**Rationale:**
- Future flexibility
- Technology independence
- Reusability

**Implementation:**
- Pure JavaScript services
- No framework-specific code
- Standard REST API

### 2. Database Agnostic

**Constraint:** Must work with PostgreSQL, MySQL, or MongoDB.

**Rationale:**
- Flexibility in deployment
- Cost optimization
- Team expertise

**Implementation:**
- ORM abstraction layer
- Standard SQL queries
- No database-specific features

### 3. Cloud Agnostic

**Constraint:** Must deploy to AWS, GCP, or Azure.

**Rationale:**
- Avoid vendor lock-in
- Cost optimization
- Geographic distribution

**Implementation:**
- Containerized deployment
- Infrastructure as code
- No cloud-specific services

## Compliance Constraints

### 1. Data Privacy

**Constraint:** User data must be protected.

**Rationale:**
- GDPR compliance
- User trust
- Legal requirements

**Implementation:**
- Encryption at rest
- Encryption in transit
- Data minimization
- Right to deletion

### 2. Audit Trail

**Constraint:** All operations must be auditable.

**Rationale:**
- Accountability
- Compliance
- Debugging

**Implementation:**
- Immutable audit logs
- User attribution
- Timestamp records
- Tamper-evident storage

### 3. Retention Policy

**Constraint:** Data must be retained per policy.

**Rationale:**
- Legal requirements
- Storage optimization
- Compliance

**Implementation:**
- Automatic archival
- Configurable retention
- Secure deletion
- Compliance reporting

## Future-Proofing Constraints

### 1. Extensibility

**Constraint:** Easy to add new notice types and actions.

**Rationale:**
- Business evolution
- New requirements
- Competitive advantage

**Implementation:**
- Template-based generation
- Plugin architecture
- Configuration-driven
- No hardcoded logic

### 2. Internationalization

**Constraint:** Support multiple languages.

**Rationale:**
- Global deployment
- User preference
- Accessibility

**Implementation:**
- Separate content from logic
- Translation system
- Locale-aware formatting
- RTL support

### 3. Accessibility

**Constraint:** Accessible to users with disabilities.

**Rationale:**
- Legal requirements
- Inclusive design
- User experience

**Implementation:**
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support

## Decision Log

### Decision 1: Event-Driven Architecture

**Date:** 2025-01-20
**Decision:** Use event-driven architecture for notice generation
**Rationale:** Decouples workflow from communication, enables extensibility
**Impact:** High - fundamental architecture decision
**Status:** Implemented

### Decision 2: Single Notice System

**Date:** 2025-01-20
**Decision:** Use single canonical notice system for all portals
**Rationale:** Consistency, maintainability, analytics
**Impact:** High - data model decision
**Status:** Implemented

### Decision 3: Template-Based Generation

**Date:** 2025-01-20
**Decision:** Use templates for notice content generation
**Rationale:** Consistency, maintainability, multi-language support
**Impact:** Medium - content management decision
**Status:** Implemented

### Decision 4: Centralized Audience Resolution

**Date:** 2025-01-20
**Decision:** Centralize audience resolution logic
**Rationale:** Consistency, prevent duplication, enable complex targeting
**Impact:** High - business logic decision
**Status:** Implemented

### Decision 5: Service Layer Abstraction

**Date:** 2025-01-20
**Decision:** Abstract data access through service layer
**Rationale:** Backend migration readiness, testability
**Impact:** High - architecture decision
**Status:** Implemented

## Anti-Patterns to Avoid

### 1. God Object

**Anti-Pattern:** Single service does everything.

**Solution:** Split into focused services (notice, action, scheduler, orchestrator).

### 2. Tight Coupling

**Anti-Pattern:** Components directly depend on implementation details.

**Solution:** Use interfaces and dependency injection.

### 3. Magic Numbers

**Anti-Pattern:** Hardcoded values throughout code.

**Solution:** Use constants and configuration.

### 4. Global State

**Anti-Pattern:** Global variables for state management.

**Solution:** Use React Context or state management library.

### 5. Premature Optimization

**Anti-Pattern:** Optimizing before measuring.

**Solution:** Profile first, optimize bottlenecks.

## Success Metrics

### Technical Metrics
- API response time < 200ms (p95)
- Database query time < 50ms (p95)
- Error rate < 0.1%
- Uptime > 99.9%

### Business Metrics
- Notice delivery rate > 98%
- Read rate > 80% (within 24 hours)
- Action response rate > 70% (for action-required notices)
- User satisfaction > 4.5/5

### Development Metrics
- Test coverage > 80%
- Code review approval rate > 95%
- Deployment success rate > 99%
- Mean time to resolution < 4 hours

## Conclusion

The notice system is designed as an **institution operating system**, not just a school dashboard. The event-driven architecture with centralized orchestration enables:

- **Scalability** to any number of workflow types
- **Maintainability** through clear separation of concerns
- **Migratability** to production backend without UI changes
- **Extensibility** to new communication channels and action types
- **Reliability** through robust error handling and retry logic

The most critical decision is the **Notice Orchestrator + Workflow Events** pattern. This is what transforms a simple dashboard into a powerful, event-driven operating system for institutional communication.

## AD-005: Decoupling of Timetable Services
**Context**: Timetable generation and validation became too complex for a single service.
**Decision**: Split into domain-specific sub-services (dmin, alidation, student, override).
**Consequence**: Backend should mirror this modularity.

## AD-006: Separation of Notices and Communications
**Context**: Notice Management was overloaded with both passive announcements and active email/SMS workflows.
**Decision**: Created a distinct Communication Center for active outbound marketing/alerts.
**Consequence**: Backend needs separate tables (erp_notices vs erp_campaigns) and separate processing queues.
