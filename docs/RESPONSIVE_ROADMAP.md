# RESPONSIVE STABILIZATION ROADMAP

## Philosophy

**Desktop is already correct.**

Never redesign desktop.

Rule:

```
Desktop (1024px+) = LOCKED

Tablet (768px–1023px) = ADAPT

Mobile (320px–767px) = STACK
```

The objective is:

```
Keep Desktop identical.
Fix Tablet.
Fix Mobile.
```

---

# PHASE 1

# Global Responsive Foundation

## Goal

Fix shared layouts that affect every page.

## Scope

```
Sidebar.jsx
Header.jsx
BaseLayout.jsx
DashboardCardSkeleton.jsx
Shared Page Containers
```

## Tasks

### Sidebar

Current:

```
Desktop = 240px
Tablet = 240px
```

Problem:

```
Tablet loses too much content width
```

Fix:

```
Mobile (<768):
Hidden Drawer

Tablet (768-1023):
Collapsed Icons Only

Desktop (1024+):
Full Sidebar
```

---

### Header

Fix:

```
Profile section wrapping
Notification overflow
Language switcher overflow
```

On mobile:

```
Move secondary actions into menu
```

---

### Global Container

Standardize:

```
max-w-full
overflow-hidden
px-4 sm:px-6 lg:px-8
```

---

### Dashboard Skeletons

Match:

```
Actual Dashboard Layout
```

instead of fixed:

```
grid-cols-3
```

---

## Deliverables

```
Responsive Foundation
Shared Layout Stability
```

---

# PHASE 2

# Table Responsiveness Standardization

## Goal

Fix every table in the ERP.

This is the biggest source of breakage.

---

## Scope

All:

```
Admin Tables
Teacher Tables
Student Tables
Support Tables
Transport Tables
Duty Tables
Clubs Tables
Exam Tables
```

---

## Standard

Every table:

```jsx
<div className="overflow-x-auto w-full">
   <table className="min-w-[800px]">
```

---

## Rules

Do NOT:

```
Hide columns
Remove data
Redesign tables
```

Just:

```
Allow horizontal scrolling
```

---

## Special Cases

Large operational tables:

```
Attendance
Marks
Transport
Support
```

may later receive:

```
Mobile Card View
```

but not in this phase.

---

## Deliverables

```
Zero page-breaking tables
```

---

# PHASE 3

# Grid System Standardization

## Goal

Fix every:

```
grid-cols-2
grid-cols-3
grid-cols-4
```

that breaks mobile.

---

## Standard

### Stats Cards

Replace:

```jsx
grid-cols-4
```

with:

```jsx
grid-cols-1
sm:grid-cols-2
xl:grid-cols-4
```

---

### Forms

Replace:

```jsx
grid-cols-2
```

with:

```jsx
grid-cols-1
md:grid-cols-2
```

---

### Detail Sections

Replace:

```jsx
grid-cols-3
```

with:

```jsx
grid-cols-1
md:grid-cols-2
lg:grid-cols-3
```

---

## Scope

Most affected:

```
Student Profile
Transport
Teacher Profile
Leave
Support
Clubs
```

---

## Deliverables

```
All cards and forms stack correctly
```

---

# PHASE 4

# Modal & Drawer Stabilization

## Goal

Fix every modal.

---

## Problems Found

```
Touches screen edges
Content overflow
Action buttons disappear
```

---

## Standard Modal Contract

Desktop:

```
max-w-4xl
```

Tablet:

```
90vw
```

Mobile:

```
95vw
max-h-[90vh]
overflow-y-auto
mx-4
```

---

## Scope

```
Support
Clubs
Exams
Transport
Assignments
Student Duty
Leave
```

---

## Deliverables

```
Every modal usable on phone
```

---

# PHASE 5

# Filter Bar Standardization

## Goal

Fix filter rows.

Current:

```
Class
Section
Date
Status
Teacher
```

all squeezed into one row.

---

## Standard

Desktop:

```
Single Row
```

Tablet:

```
2 Rows
```

Mobile:

```
Vertical Stack
```

---

## Scope

```
Attendance
Transport
Support
Analytics
Clubs
Duty
Leave
```

---

## Deliverables

```
No filter overflow
```

---

# PHASE 6

# Portal-Specific Mobile Optimization

## Goal

Fix remaining portal-specific issues.

---

## Student Portal

Check:

```
Assignments
Exams
Profile
Timetable
Transport
Clubs
```

---

## Teacher Portal

Check:

```
Attendance
Marks
Assignments
Student Duty
Leave
Clubs
```

---

## Parent Portal

Check:

```
Insights
Fees
Transport
Duty Records
Clubs
```

---

## Admin Portal

Check:

```
Users
Fees
Transport
Support
Academic Performance
Timetable
Clubs
```

---

## Deliverables

```
Portal-level responsiveness complete
```

---

# PHASE 7

# Mobile-Only Experience Improvements

## Goal

Improve usability without changing business logic.

---

## Calendar

Current:

```
7-column grid
```

Mobile:

```
Agenda View
```

---

## Analytics

Current:

```
Dense charts/tables
```

Mobile:

```
Stacked cards
```

---

## Large Rosters

Optional:

```
Card View
```

instead of:

```
Horizontal Table
```

---

## Deliverables

```
Premium mobile UX
```

---

# PHASE 8

# Final Device Validation

## Goal

Validate against real devices.

---

## Target Widths

```
320px
375px
390px
414px

768px
820px
912px

1024px
1280px
1440px
```

---

## Validation Checklist

```
No horizontal body scroll
No clipped modals
No hidden buttons
No broken grids
No overflowing cards
No unreadable tables
No inaccessible filters
```

---

# Recommended Execution Order

```
Phase 1 → Foundation

Phase 2 → Tables

Phase 3 → Grids

Phase 4 → Modals

Phase 5 → Filters

Phase 6 → Portal Fixes

Phase 7 → UX Enhancements

Phase 8 → Validation
```
