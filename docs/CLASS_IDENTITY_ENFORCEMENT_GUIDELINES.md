# Class Identity Enforcement Guidelines

**Version**: 1.0.0  
**Status**: FROZEN - FINAL  
**Effective**: Immediately  
**Purpose**: Enforce strict usage of classIdentity.js for all class identity operations

---

## CRITICAL RULE

**ALL class identity operations MUST go through `src/utils/classIdentity.js` ONLY.**

**NO manual class formatting, conversion, or parsing logic anywhere else.**

---

## PROHIBITED PATTERNS

### ❌ Manual Roman Numeral Conversion
```javascript
// FORBIDDEN
if (classLevel === "XI") classLevel = "11";
if (classLevel === "XII") classLevel = "12";

// FORBIDDEN
const displayLevel = classLevel === "11" ? "XI" : classLevel === "12" ? "XII" : classLevel;

// FORBIDDEN
const romanMap = { 11: "XI", 12: "XII" };
const display = romanMap[classLevel];
```

### ❌ Manual Class ID Parsing
```javascript
// FORBIDDEN
const parts = classId.split("-");
const level = parts[1].slice(0, -1);
const section = parts[1].slice(-1).toUpperCase();

// FORBIDDEN
const match = classId.match(/class-(\w+)([a-d])/i);
const level = match[1];
const section = match[2].toUpperCase();

// FORBIDDEN
const level = classId.replace("class-", "").slice(0, -1);
const section = classId.slice(-1).toUpperCase();
```

### ❌ Manual Class Name Formatting
```javascript
// FORBIDDEN
const className = `${classLevel}-${section}`;

// FORBIDDEN
const displayClass = classLevel === "11" ? `XI-${section}` : classLevel === "12" ? `XII-${section}` : `${classLevel}-${section}`;

// FORBIDDEN
const displayName = `Class ${classLevel === "11" ? "XI" : classLevel === "12" ? "XII" : classLevel}-${section}`;
```

### ❌ Hardcoded Class Level Checks
```javascript
// FORBIDDEN
if (classLevel === "11" || classLevel === "12") {
  // Senior secondary logic
}

// FORBIDDEN
if (["11", "12"].includes(classLevel)) {
  // Senior secondary logic
}

// FORBIDDEN
const isSenior = classLevel >= 11;
```

---

## REQUIRED PATTERNS

### ✅ Use normalizeClassLevel for Storage
```javascript
import { normalizeClassLevel } from "../../utils/classIdentity";

// CORRECT
const canonicalLevel = normalizeClassLevel(inputLevel);
// "XI" → "11"
// "XII" → "12"
// "11" → "11"
// "Nursery" → "Nursery"
```

### ✅ Use formatClassLevel for Display
```javascript
import { formatClassLevel } from "../../utils/classIdentity";

// CORRECT
const displayLevel = formatClassLevel(canonicalLevel);
// "11" → "XI"
// "12" → "XII"
// "5" → "5"
// "Nursery" → "Nursery"
```

### ✅ Use formatClassName for Display
```javascript
import { formatClassName } from "../../utils/classIdentity";

// CORRECT
const displayClass = formatClassName(canonicalLevel, section);
// "11", "A" → "XI-A"
// "12", "B" → "XII-B"
// "5", "C" → "5-C"
// "Nursery", "A" → "Nursery-A"
```

### ✅ Use extractLevel for Parsing
```javascript
import { extractLevel } from "../../utils/classIdentity";

// CORRECT
const level = extractLevel(classId);
// "class-11a" → "11"
// "class-xia" → "XI" (legacy, will be normalized)
// "class-nurserya" → "Nursery"
```

### ✅ Use extractSection for Parsing
```javascript
import { extractSection } from "../../utils/classIdentity";

// CORRECT
const section = extractSection(classId);
// "class-11a" → "A"
// "class-xia" → "A"
// "class-nurserya" → "A"
```

### ✅ Use buildClassId for Construction
```javascript
import { buildClassId } from "../../utils/classIdentity";

// CORRECT
const classId = buildClassId(canonicalLevel, section);
// "11", "A" → "class-11a"
// "12", "B" → "class-12b"
// "Nursery", "A" → "class-nurserya"
```

### ✅ Use isSeniorSecondary for Validation
```javascript
import { isSeniorSecondary } from "../../utils/classIdentity";

// CORRECT
if (isSeniorSecondary(classLevel)) {
  // Senior secondary logic
}
```

### ✅ Use isFoundationClass for Validation
```javascript
import { isFoundationClass } from "../../utils/classIdentity";

// CORRECT
if (isFoundationClass(classLevel)) {
  // Foundation class logic
}
```

---

## COMPONENT USAGE PATTERNS

### ✅ Correct Component Usage
```jsx
import { formatClassLevel, formatClassName } from "../../utils/classIdentity";

function StudentCard({ student }) {
  // CORRECT: Use canonical data, format for display
  return (
    <div>
      <h3>Class {formatClassLevel(student.classLevel)}-{student.section}</h3>
      <p>{formatClassName(student.classLevel, student.section)}</p>
    </div>
  );
}
```

### ❌ Incorrect Component Usage
```jsx
function StudentCard({ student }) {
  // INCORRECT: Manual formatting
  const displayLevel = student.classLevel === "11" ? "XI" : student.classLevel === "12" ? "XII" : student.classLevel;
  
  return (
    <div>
      <h3>Class {displayLevel}-{student.section}</h3>
    </div>
  );
}
```

---

## SERVICE USAGE PATTERNS

### ✅ Correct Service Usage
```javascript
import { normalizeClassLevel, isSeniorSecondary } from "../../utils/classIdentity";

export function createStudent(studentData) {
  // CORRECT: Normalize before storage
  const canonicalLevel = normalizeClassLevel(studentData.classLevel);
  
  const student = {
    ...studentData,
    classLevel: canonicalLevel,
    classId: buildClassId(canonicalLevel, studentData.section),
  };
  
  // Check if senior secondary
  if (isSeniorSecondary(canonicalLevel) && !student.stream) {
    throw new Error("Stream required for senior secondary classes");
  }
  
  return db.students.create(student);
}
```

### ❌ Incorrect Service Usage
```javascript
export function createStudent(studentData) {
  // INCORRECT: Manual conversion
  let classLevel = studentData.classLevel;
  if (classLevel === "XI") classLevel = "11";
  if (classLevel === "XII") classLevel = "12";
  
  // INCORRECT: Manual check
  if (classLevel === "11" || classLevel === "12") {
    if (!studentData.stream) {
      throw new Error("Stream required");
    }
  }
  
  return db.students.create(studentData);
}
```

---

## FILTER USAGE PATTERNS

### ✅ Correct Filter Usage
```javascript
import { normalizeClassLevel } from "../../utils/classIdentity";

export function filterStudents(students, filter) {
  // CORRECT: Normalize filter value
  const canonicalFilter = normalizeClassLevel(filter.classLevel);
  
  return students.filter(student => {
    if (canonicalFilter) {
      return normalizeClassLevel(student.classLevel) === canonicalFilter;
    }
    return true;
  });
}
```

### ❌ Incorrect Filter Usage
```javascript
export function filterStudents(students, filter) {
  // INCORRECT: Manual comparison
  return students.filter(student => {
    if (filter.classLevel === "XI" || filter.classLevel === "XII") {
      return student.classLevel === filter.classLevel;
    }
    return student.classLevel === filter.classLevel;
  });
}
```

---

## API USAGE PATTERNS

### ✅ Correct API Usage
```javascript
import { normalizeClassLevel } from "../../utils/classIdentity";

export async function createStudentAPI(studentData) {
  // CORRECT: Normalize before API call
  const payload = {
    ...studentData,
    classLevel: normalizeClassLevel(studentData.classLevel),
  };
  
  const response = await api.post('/students', payload);
  return response.data;
}
```

### ❌ Incorrect API Usage
```javascript
export async function createStudentAPI(studentData) {
  // INCORRECT: Send raw data without normalization
  const response = await api.post('/students', studentData);
  return response.data;
}
```

---

## CODE REVIEW CHECKLIST

Before approving any code that deals with class identity, verify:

### Storage Operations
- [ ] All class levels are normalized before storage
- [ ] No manual XI ↔ 11 conversion
- [ ] Uses `normalizeClassLevel()` from classIdentity.js
- [ ] Uses `buildClassId()` for class ID construction

### Display Operations
- [ ] All display formatting uses `formatClassLevel()` or `formatClassName()`
- [ ] No manual Roman numeral conversion for display
- [ ] Uses classIdentity.js utilities

### Parsing Operations
- [ ] All class ID parsing uses `extractLevel()` and `extractSection()`
- [ ] No manual string splitting or regex parsing
- [ ] Uses classIdentity.js utilities

### Validation Operations
- [ ] All class level checks use `isSeniorSecondary()`, `isFoundationClass()`, etc.
- [ ] No hardcoded "11" || "12" checks
- [ ] No hardcoded ["11", "12"].includes() checks
- [ ] Uses classIdentity.js utilities

### Import Statements
- [ ] Imports from classIdentity.js are present
- [ ] No duplicate conversion logic
- [ ] All identity operations go through classIdentity.js

---

## LINTING RULES

### ESLint Rules (Recommended)
```javascript
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "BinaryExpression[operator='||'][left.left.name='classLevel'][left.right.value='11'][right.left.name='classLevel'][right.right.value='12']",
        "message": "Use isSeniorSecondary() from classIdentity.js instead of hardcoded 11/12 check"
      }
    ],
    "no-restricted-globals": [
      "error",
      {
        "name": "XI",
        "message": "Use normalizeClassLevel() from classIdentity.js instead of manual Roman numeral conversion"
      },
      {
        "name": "XII",
        "message": "Use normalizeClassLevel() from classIdentity.js instead of manual Roman numeral conversion"
      }
    ]
  }
}
```

---

## TESTING REQUIREMENTS

### Unit Tests
```javascript
// Test that all code uses classIdentity.js
describe('Class Identity Enforcement', () => {
  it('should use normalizeClassLevel for storage', () => {
    const result = service.createStudent({ classLevel: "XI" });
    expect(result.classLevel).toBe("11");
  });
  
  it('should use formatClassLevel for display', () => {
    const display = component.render({ classLevel: "11" });
    expect(display).toContain("XI");
  });
  
  it('should use isSeniorSecondary for validation', () => {
    const result = service.isSeniorSecondary("11");
    expect(result).toBe(true);
  });
});
```

### Integration Tests
```javascript
// Test that no manual conversion exists
describe('No Manual Conversion', () => {
  it('should not contain manual XI conversion', () => {
    const code = fs.readFileSync('src/services/studentService.js', 'utf8');
    expect(code).not.toMatch(/classLevel === "XI"/);
    expect(code).not.toMatch(/classLevel === "XII"/);
  });
});
```

---

## ENFORCEMENT TOOLS

### Pre-commit Hook
```bash
#!/bin/bash
# Check for manual class identity conversion
if git diff --cached --name-only | xargs grep -l 'classLevel === "XI"\|classLevel === "XII"'; then
  echo "ERROR: Manual class level conversion detected. Use classIdentity.js utilities instead."
  exit 1
fi

if git diff --cached --name-only | xargs grep -l '=== "11" || === "12"'; then
  echo "ERROR: Hardcoded 11/12 check detected. Use isSeniorSecondary() from classIdentity.js instead."
  exit 1
fi
```

### CI/CD Pipeline
```yaml
# Check for manual conversion in CI
- name: Check Class Identity Enforcement
  run: |
    if grep -r 'classLevel === "XI"' src/; then
      echo "ERROR: Manual class level conversion detected"
      exit 1
    fi
    if grep -r '=== "11" || === "12"' src/; then
      echo "ERROR: Hardcoded 11/12 check detected"
      exit 1
    fi
```

---

## VIOLATION CONSEQUENCES

### Code Review
- Any code violating these guidelines will be rejected in code review
- Violations must be fixed before merge

### Runtime
- Violations will be logged as errors in production
- Violations will trigger alerts for architectural review

### Technical Debt
- Violations will be tracked as technical debt
- Violations must be addressed in next sprint

---

## EXCEPTION PROCESS

### When to Request Exception
- Performance critical path where classIdentity.js is proven bottleneck
- Legacy system integration requiring different format
- External API requiring different format

### Exception Request Process
1. Create architectural review ticket
2. Provide performance profiling data
3. Propose alternative solution
4. Get approval from architecture team
5. Document exception with justification

### Exception Documentation
```javascript
// EXCEPTION: External API requires Roman numerals
// APPROVED: ARCH-2024-001
// JUSTIFICATION: External vendor API only accepts XI/XII format
// TODO: Migrate to canonical format when vendor API is updated
export function formatForVendorAPI(classLevel) {
  // Exception: Manual conversion for external API
  return classLevel === "11" ? "XI" : classLevel === "12" ? "XII" : classLevel;
}
```

---

## TRAINING REQUIREMENTS

### Developer Onboarding
- All developers must review this document
- All developers must complete class identity training
- All developers must pass class identity quiz

### Code Review Training
- All code reviewers must enforce these guidelines
- All code reviewers must complete enforcement training
- All code reviewers must pass enforcement quiz

---

## CONTACT

For questions about these guidelines, contact the architecture team.

**These guidelines are FROZEN and FINAL.** Any changes require architectural review and approval.
