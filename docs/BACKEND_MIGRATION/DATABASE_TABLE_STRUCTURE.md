# Database Table Structure for Backend Migration

This document defines the recommended database schema for the notice system when migrating to a production backend.

## Table: `notices`

Stores the core notice data.

```sql
CREATE TABLE notices (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  source_module VARCHAR(50),
  requires_action BOOLEAN DEFAULT FALSE,
  action_type VARCHAR(50),
  action_deadline TIMESTAMP NULL,
  delivery_channels JSON,
  metadata JSON,
  created_by VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP NULL,
  expires_at TIMESTAMP NULL,
  auto_archive_after INT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_status (status),
  INDEX idx_category (category),
  INDEX idx_priority (priority),
  INDEX idx_published_at (published_at),
  INDEX idx_expires_at (expires_at),
  INDEX idx_source_module (source_module)
);
```

## Table: `notice_targets`

Stores audience targeting information for notices.

```sql
CREATE TABLE notice_targets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  notice_id VARCHAR(50) NOT NULL,
  target_type VARCHAR(20) NOT NULL,
  target_id VARCHAR(50) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (notice_id) REFERENCES notices(id) ON DELETE CASCADE,
  INDEX idx_notice_id (notice_id),
  INDEX idx_target_type (target_type),
  INDEX idx_target_id (target_id),
  UNIQUE KEY uk_notice_target (notice_id, target_type, target_id)
);
```

**Target Types:**
- `ALL` - No specific target_id needed
- `STUDENTS` - target_id = student_id
- `TEACHERS` - target_id = teacher_id
- `PARENTS` - target_id = parent_id
- `CLASS` - target_id = class_id
- `STREAM` - target_id = stream_id
- `SPECIFIC` - Multiple rows for specific user IDs

## Table: `notice_reads`

Stores read receipts for notices.

```sql
CREATE TABLE notice_reads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  notice_id VARCHAR(50) NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  user_role VARCHAR(20) NOT NULL,
  read_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (notice_id) REFERENCES notices(id) ON DELETE CASCADE,
  INDEX idx_notice_id (notice_id),
  INDEX idx_user_id (user_id),
  INDEX idx_user_role (user_role),
  UNIQUE KEY uk_notice_user (notice_id, user_id)
);
```

## Table: `notice_actions`

Stores user action responses (acknowledgements, RSVPs, form submissions, etc.).

```sql
CREATE TABLE notice_actions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  notice_id VARCHAR(50) NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  user_role VARCHAR(20) NOT NULL,
  response_type VARCHAR(20) NOT NULL,
  response_data JSON,
  response_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (notice_id) REFERENCES notices(id) ON DELETE CASCADE,
  INDEX idx_notice_id (notice_id),
  INDEX idx_user_id (user_id),
  INDEX idx_response_type (response_type),
  INDEX idx_response_at (response_at),
  UNIQUE KEY uk_notice_user_action (notice_id, user_id)
);
```

**Response Types:**
- `acknowledged` - User acknowledged the notice
- `accepted` - User accepted (RSVP)
- `declined` - User declined (RSVP)
- `submitted` - User submitted form/payment/document

## Table: `notice_delivery_logs`

Stores delivery logs for each notice across different channels.

```sql
CREATE TABLE notice_delivery_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  notice_id VARCHAR(50) NOT NULL,
  delivery_channel VARCHAR(20) NOT NULL,
  recipient_id VARCHAR(50) NOT NULL,
  recipient_role VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  error_message TEXT NULL,
  sent_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (notice_id) REFERENCES notices(id) ON DELETE CASCADE,
  INDEX idx_notice_id (notice_id),
  INDEX idx_delivery_channel (delivery_channel),
  INDEX idx_recipient_id (recipient_id),
  INDEX idx_status (status),
  INDEX idx_sent_at (sent_at)
);
```

**Delivery Channels:**
- `portal` - In-app notification
- `email` - Email delivery
- `sms` - SMS delivery
- `push` - Push notification
- `whatsapp` - WhatsApp message

**Delivery Status:**
- `pending` - Queued for delivery
- `sent` - Sent to provider
- `delivered` - Successfully delivered
- `failed` - Delivery failed
- `bounced` - Bounced back

## Table: `notice_templates`

Stores reusable notice templates.

```sql
CREATE TABLE notice_templates (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL,
  delivery_channels JSON,
  requires_action BOOLEAN DEFAULT FALSE,
  action_type VARCHAR(50),
  title_template TEXT,
  message_template TEXT,
  metadata_schema JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_by VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_category (category),
  INDEX idx_is_active (is_active)
);
```

## Table: `workflow_events`

Stores workflow event logs for audit trail.

```sql
CREATE TABLE workflow_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  event_data JSON,
  source_module VARCHAR(50),
  triggered_by VARCHAR(50),
  triggered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notice_id VARCHAR(50) NULL,
  
  INDEX idx_event_type (event_type),
  INDEX idx_source_module (source_module),
  INDEX idx_triggered_at (triggered_at),
  INDEX idx_notice_id (notice_id)
);
```

## Table: `notice_schedules`

Stores scheduled notice publication information.

```sql
CREATE TABLE notice_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  notice_id VARCHAR(50) NOT NULL,
  scheduled_at TIMESTAMP NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  executed_at TIMESTAMP NULL,
  error_message TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (notice_id) REFERENCES notices(id) ON DELETE CASCADE,
  INDEX idx_scheduled_at (scheduled_at),
  INDEX idx_status (status)
);
```

## Table: `notice_attachments`

Stores file attachments for notices.

```sql
CREATE TABLE notice_attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  notice_id VARCHAR(50) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  uploaded_by VARCHAR(50) NOT NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (notice_id) REFERENCES notices(id) ON DELETE CASCADE,
  INDEX idx_notice_id (notice_id)
);
```

## Migration Strategy

### Phase 1: Schema Creation
1. Create all tables in development database
2. Add foreign key constraints
3. Create indexes for performance
4. Test with sample data

### Phase 2: Data Migration
1. Export existing localStorage data
2. Transform data to match new schema
3. Import into database
4. Validate data integrity

### Phase 3: Application Updates
1. Update service layer to use database
2. Add connection pooling
4. Implement query optimization

### Phase 4: Production Deployment
1. Create production database
2. Run schema migrations
3. Deploy with zero downtime
4. Monitor performance

## Index Optimization

### Critical Indexes
- `notices(status, published_at)` - For filtering published notices
- `notice_reads(notice_id, user_id)` - For read receipt lookups
- `notice_actions(notice_id, user_id)` - For action response lookups
- `notice_delivery_logs(notice_id, status)` - For delivery tracking

### Composite Indexes
- `notices(status, category, priority)` - For multi-filter queries
- `notice_reads(user_id, read_at)` - For user's read history
- `notice_actions(user_id, response_at)` - For user's action history

## Data Validation

### Constraints
- `notices.status` must be one of: draft, scheduled, published, archived, expired, cancelled
- `notice_targets.target_type` must be one of: ALL, STUDENTS, TEACHERS, PARENTS, CLASS, STREAM, SPECIFIC
- `notice_actions.response_type` must be one of: acknowledged, accepted, declined, submitted
- `notice_delivery_logs.status` must be one of: pending, sent, delivered, failed, bounced

### Triggers
- Update `updated_at` timestamp on row modification
- Cascade delete related records when notice is deleted
- Log workflow events when notice status changes

## Backup Strategy

### Daily Backups
- Full database backup at midnight
- Retain 7 days of daily backups
- Store in secure cloud storage

### Weekly Backups
- Full database backup every Sunday
- Retain 4 weeks of weekly backups
- Archive to long-term storage

### Point-in-Time Recovery
- Enable binary logging
- Configure PITR for 30 days
- Test recovery procedures monthly

## Performance Considerations

### Query Optimization
- Use EXPLAIN to analyze slow queries
- Add indexes for frequently accessed columns
- Consider read replicas for high-traffic queries
- Implement query caching for common queries

### Connection Pooling
- Configure connection pool size based on traffic
- Set appropriate timeout values
- Monitor connection pool usage
- Implement connection health checks

### Partitioning
- Consider partitioning `notice_reads` by date for large datasets
- Partition `notice_delivery_logs` by delivery channel
- Archive old data to separate tables

## Security Considerations

### Access Control
- Implement row-level security (RLS)
- Restrict access based on user roles
- Audit all data access
- Encrypt sensitive data at rest

### SQL Injection Prevention
- Use parameterized queries
- Validate all input data
- Implement query whitelisting
- Regular security audits

### Data Encryption
- Encrypt sensitive metadata
- Use TLS for database connections
- Encrypt backups at rest
- Key management best practices

## Communication Center Module

### erp_campaigns
Stores active and historical communication campaigns (Email, SMS).
- id (PK, UUID)
- 
ame (VARCHAR)
- 	ype (ENUM: 'email', 'sms')
- udience (JSONB) - Defines target audience criteria
- status (ENUM: 'draft', 'queued', 'sending', 'completed')
- scheduled_for (TIMESTAMP)
- created_at (TIMESTAMP)

### erp_communication_templates
Stores templates for emails and SMS.
- id (PK, UUID)
- 
ame (VARCHAR)
- 	ype (ENUM: 'email', 'sms')
- content (TEXT)
- ariables (JSONB)
