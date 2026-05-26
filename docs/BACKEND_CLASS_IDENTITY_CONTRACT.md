# Backend Class Identity Contract

**Version**: 1.0.0  
**Status**: FROZEN - FINAL  
**Effective**: Immediately  
**Purpose**: Establish canonical class identity contract for backend implementation

---

## CRITICAL ARCHITECTURAL RULE

**ALL backend systems MUST use ONLY canonical numeric class levels (11, 12) for:**

- Database rows
- API payloads
- Relational joins
- Filters
- Analytics
- Indexes
- Foreign keys

**UI Layer ONLY may render Roman numerals (XI, XII) for display purposes.**

---

## STORAGE FORMAT (Canonical)

### Class Level
```
Foundation: "Nursery", "LKG", "UKG"
Primary → Senior Secondary: "1", "2", "3", ..., "10", "11", "12"
```

### Section
```
Always: "A", "B", "C", "D"
```

### Class Identifier
```
Format: "class-{level}{section}"
Examples: "class-11a", "class-12b", "class-nurserya"
```

### Display Name (UI Only)
```
Format: "Class {formattedLevel}-{section}"
Examples: "Class XI-A", "Class XII-B", "Class Nursery-A"
```

---

## DATABASE SCHEMA CONTRACT

### Students Table
```sql
CREATE TABLE students (
  id VARCHAR(50) PRIMARY KEY,
  admission_no VARCHAR(20) NOT NULL,
  student_name VARCHAR(100) NOT NULL,
  class_level VARCHAR(20) NOT NULL,  -- "11", "12", NOT "XI", "XII"
  section VARCHAR(1) NOT NULL,       -- "A", "B", "C", "D"
  class_id VARCHAR(50) NOT NULL,    -- "class-11a", NOT "class-xia"
  stream VARCHAR(50),                -- For 11/12 only
  -- ... other fields
  INDEX idx_class_level (class_level),
  INDEX idx_class_id (class_id)
);
```

### Classes Table
```sql
CREATE TABLE classes (
  id VARCHAR(50) PRIMARY KEY,        -- "class-11a"
  class_level VARCHAR(20) NOT NULL,  -- "11", "12", NOT "XI", "XII"
  section VARCHAR(1) NOT NULL,       -- "A", "B", "C", "D"
  stage VARCHAR(30) NOT NULL,         -- "senior_secondary"
  -- ... other fields
  INDEX idx_level (class_level),
  INDEX idx_section (section)
);
```

### Teachers Table
```sql
CREATE TABLE teachers (
  id VARCHAR(50) PRIMARY KEY,
  employee_id VARCHAR(20) NOT NULL,
  teacher_name VARCHAR(100) NOT NULL,
  assigned_levels JSON,               -- ["11", "12"], NOT ["XI", "XII"]
  homeroom VARCHAR(50),              -- "class-11a", NOT "class-xia"
  -- ... other fields
);
```

### Exams Table
```sql
CREATE TABLE exams (
  id VARCHAR(50) PRIMARY KEY,
  exam_name VARCHAR(100) NOT NULL,
  class_level VARCHAR(20),           -- "11", "12", NOT "XI", "XII"
  applicable_classes JSON,           -- ["11-A", "12-B"], NOT ["XI-A", "XII-B"]
  -- ... other fields
  INDEX idx_class_level (class_level)
);
```

---

## API CONTRACT

### Request Payloads
```json
{
  "student": {
    "classLevel": "11",      // NOT "XI"
    "section": "A",
    "classId": "class-11a"   // NOT "class-xia"
  }
}
```

### Response Payloads
```json
{
  "student": {
    "classLevel": "11",      // NOT "XI"
    "section": "A",
    "classId": "class-11a",  // NOT "class-xia"
    "displayClass": "XI-A"   // OPTIONAL: UI-only display field
  }
}
```

### Filter Parameters
```
GET /api/students?classLevel=11&section=A
GET /api/exams?classLevel=11
GET /api/teachers?assignedLevels=11,12
```

**FORBIDDEN:**
```
GET /api/students?classLevel=XI      // INVALID
GET /api/exams?classLevel=XII       // INVALID
```

---

## RELATIONAL JOIN CONTRACT

### Student-Class Join
```sql
SELECT s.*, c.class_level, c.section
FROM students s
JOIN classes c ON s.class_id = c.id
WHERE c.class_level = '11'  -- NOT 'XI'
```

### Teacher-Class Join
```sql
SELECT t.*, c.class_level, c.section
FROM teachers t
JOIN classes c ON t.homeroom = c.id
WHERE c.class_level = '12'  -- NOT 'XII'
```

### Exam-Student Join
```sql
SELECT e.*, s.class_level
FROM exams e
JOIN students s ON s.class_level = e.class_level
WHERE e.class_level = '11'  -- NOT 'XI'
```

---

## ANALYTICS CONTRACT

### Aggregation Queries
```sql
-- Count students by class level
SELECT class_level, COUNT(*) as student_count
FROM students
GROUP BY class_level
-- Results: [{"class_level": "11", "student_count": 120}, ...]
-- NOT: [{"class_level": "XI", "student_count": 120}, ...]

-- Performance by class level
SELECT class_level, AVG(score) as avg_score
FROM results
GROUP BY class_level
-- Results: [{"class_level": "11", "avg_score": 85.5}, ...]
-- NOT: [{"class_level": "XI", "avg_score": 85.5}, ...]
```

### Reporting
```json
{
  "report": {
    "classLevel": "11",      // Canonical
    "displayName": "XI-A",   // Display only
    "metrics": {
      "studentCount": 120,
      "attendanceRate": 95.5,
      "avgScore": 85.5
    }
  }
}
```

---

## INDEX CONTRACT

### Class Level Index
```sql
CREATE INDEX idx_class_level ON students(class_level);
CREATE INDEX idx_class_level ON classes(class_level);
CREATE INDEX idx_class_level ON exams(class_level);
```

### Class ID Index
```sql
CREATE INDEX idx_class_id ON students(class_id);
CREATE INDEX idx_class_id ON teachers(homeroom);
```

**NO INDEXES on Roman numerals (XI, XII) - they don't exist in storage.**

---

## MIGRATION CONTRACT

### Legacy Data Migration
```javascript
// BEFORE MIGRATION
{
  "classLevel": "XI",
  "classId": "class-xia"
}

// AFTER MIGRATION
{
  "classLevel": "11",
  "classId": "class-11a"
}
```

### Migration Rules
1. **ALL** legacy "XI" → "11"
2. **ALL** legacy "XII" → "12"
3. **ALL** legacy "class-xi*" → "class-11*"
4. **ALL** legacy "class-xii*" → "class-12*"
5. Migration is idempotent - safe to run multiple times
6. Migration is version-tracked - only runs once per version

---

## VALIDATION CONTRACT

### Input Validation
```javascript
// VALID
validateClassLevel("11")    // ✓
validateClassLevel("12")    // ✓
validateClassLevel("Nursery") // ✓

// INVALID
validateClassLevel("XI")    // ✗ - Must be normalized first
validateClassLevel("XII")   // ✗ - Must be normalized first
```

### Normalization
```javascript
// ALWAYS normalize before storage
const canonicalLevel = normalizeClassLevel(inputLevel);
// "XI" → "11"
// "XII" → "12"
// "11" → "11"
```

---

## UI DISPLAY CONTRACT

### Display Layer (Frontend Only)
```javascript
// Frontend ONLY converts for display
const displayLevel = formatClassLevel("11");  // "XI"
const displayClass = formatClassName("11", "A");  // "XI-A"

// Backend NEVER converts
const storageLevel = "11";  // Always canonical
```

### Component Display
```jsx
// CORRECT
<StudentCard classLevel={student.classLevel} />  // "11"
// Component internally: formatClassLevel(student.classLevel) → "XI"

// INCORRECT
<StudentCard classLevel="XI" />  // Never pass Roman numerals
```

---

## ENFORCEMENT RULES

### MUST
- ✅ Store numeric levels (11, 12) in database
- ✅ Use numeric levels in API payloads
- ✅ Use numeric levels in relational joins
- ✅ Use numeric levels in filters
- ✅ Use numeric levels in analytics
- ✅ Normalize legacy data before storage
- ✅ Validate input format
- ✅ Use classIdentity.js utilities

### MUST NOT
- ❌ Store Roman numerals (XI, XII) in database
- ❌ Use Roman numerals in API payloads
- ❌ Use Roman numerals in relational joins
- ❌ Use Roman numerals in filters
- ❌ Use Roman numerals in analytics
- ❌ Manual XI ↔ 11 conversion anywhere
- ❌ Bypass classIdentity.js utilities
- ❌ Create duplicate conversion logic

---

## TESTING CONTRACT

### Unit Tests
```javascript
// Test canonical storage
expect(student.classLevel).toBe("11");  // NOT "XI"
expect(student.classId).toBe("class-11a");  // NOT "class-xia"

// Test normalization
expect(normalizeClassLevel("XI")).toBe("11");
expect(normalizeClassLevel("XII")).toBe("12");

// Test display formatting
expect(formatClassLevel("11")).toBe("XI");
expect(formatClassName("11", "A")).toBe("XI-A");
```

### Integration Tests
```javascript
// Test API endpoints
const response = await api.getStudents({ classLevel: "11" });
expect(response.data[0].classLevel).toBe("11");  // NOT "XI"

// Test database queries
const students = await db.query("SELECT * FROM students WHERE class_level = ?", ["11"]);
expect(students[0].class_level).toBe("11");  // NOT "XI"
```

---

## MONITORING CONTRACT

### Data Integrity Checks
```sql
-- Check for legacy Roman numerals
SELECT COUNT(*) FROM students WHERE class_level IN ('XI', 'XII');
-- MUST return 0

-- Check for legacy class IDs
SELECT COUNT(*) FROM students WHERE class_id LIKE 'class-xi%' OR class_id LIKE 'class-xii%';
-- MUST return 0
```

### Alerting
- Alert if any legacy Roman numerals detected in storage
- Alert if manual conversion logic detected in code
- Alert if classIdentity.js not used for identity operations

---

## FINAL ARCHITECTURE RESULT

### Storage
```
classLevel: "11"
className: "11-A"
section: "A"
```

### UI Display
```
Class XI-A
```

### API Payload
```json
{
  "classLevel": "11",
  "section": "A",
  "classId": "class-11a"
}
```

---

## FINAL BENEFITS

After this refactor:

✅ No duplicated conversion logic  
✅ No broken filters  
✅ No exam mismatches  
✅ No timetable drift  
✅ No analytics inconsistencies  
✅ Backend-ready identity system  
✅ Stable relational joins  
✅ Proper enterprise architecture  
✅ Clean multi-portal synchronization  
✅ Future-safe database schema  

---

## MOST IMPORTANT FINAL RULE

**After completion:**

**NEVER AGAIN**

**allow:**

- Manual class formatting logic
- Direct XI ↔ 11 conversion
- Bypassing classIdentity.js utilities

**inside:**

- Components
- Services
- Filters
- Portals
- Backend systems

**ALL identity handling MUST go through:**

**classIdentity.js**

**ONLY.**

---

## CONTACT

For questions or clarifications about this contract, contact the architecture team.

**This contract is FROZEN and FINAL.** Any changes require architectural review and approval.
