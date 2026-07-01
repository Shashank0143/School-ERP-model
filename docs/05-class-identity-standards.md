# 05 - Class Identity Standards

**Version**: 1.0.0
**Status**: FROZEN - FINAL
**Purpose**: Establish canonical class identity contract for backend implementation and frontend guidelines.

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

**ALL class identity operations MUST go through `src/utils/classIdentity.js` ONLY.**
**NO manual class formatting, conversion, or parsing logic anywhere else.**

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

## REQUIRED PATTERNS (Frontend)

Always use the utilities provided by `classIdentity.js`:

✅ **Storage Normalization**: `const canonicalLevel = normalizeClassLevel(inputLevel);`
✅ **Display Formatting**: `const displayClass = formatClassName("11", "A"); // Returns "XI-A"`
✅ **Parsing**: `const level = extractLevel("class-11a");`
✅ **Construction**: `const classId = buildClassId("11", "A");`
✅ **Validation**: `if (isSeniorSecondary("11")) { ... }`

## PROHIBITED PATTERNS

❌ Manual Roman Numeral Conversion (`if (classLevel === "XI") classLevel = "11";`)
❌ Manual Class ID Parsing (`classId.split("-")`)
❌ Manual Class Name Formatting (`const className = \`XI-${section}\`;`)
❌ Hardcoded Checks (`if (classLevel === "11" || classLevel === "12")`)

---

## ENFORCEMENT & VIOLATIONS

Any code violating these guidelines will be rejected in code review.
All legacy data MUST be migrated to the canonical numeric formats. No Roman numerals should ever be saved to the database.

---

## ID CARD IDENTITY STANDARDS

The Identity Card Module (`src/components/common/id-card/`) establishes a unified format for all institutional identities. 

### Student ID Card
*   **Variant identifier**: `variant="student"`
*   **Required Fields**: Name, Student ID (Admission No), Class, Section, DOB, Blood Group, Father's Name, Mother's Name, Primary Contact, Address, Validity Year.
*   **Optional Fields**: House/Group, Bus Route.
*   **Display Rules**: The class display name must ALWAYS use Roman numerals generated via `formatClassName(level, section)`.

### Unified Employee Card (Staff/Teacher/Admin)
*   **Variant identifier**: `variant="staff"`
*   **Required Fields**: Name, Employee ID, Designation, Department, Role, DOB, Blood Group, Primary Contact, Address, Validity Year.
*   **Optional Fields**: Specialization/Subject.
*   **Display Rules**: Unifies all non-student roles (Teacher, Admin, HR, Operations) into a single standard layout.

### Shared Identity Conventions
*   **Avatar**: Initials generation (first letters of first and last name) with deterministic background color based on ID string.
*   **Institution Header**: Always displays canonical school logo, name, affiliation, and core contact details.
*   **Backend Contract**: ID Cards do not hit APIs. Data must be fully normalized by the parent Profile component before being passed to the `IDCard` component prop `data`.
