# EduDash — College ERP Dashboard

A modern, gamified college ERP dashboard built with **React + Vite + JavaScript**. EduDash features a premium UI with multilingual support (English & Hindi), smooth Framer Motion animations, and a comprehensive suite of student-facing modules.

---

## ✨ Features

- 🎓 **Premium UI** — modern glassmorphism design with a playful, vibrant aesthetic
- 🌐 **Multilingual** — full English / Hindi (EN/HI) toggle via React Context
- ⚡ **Fast Development** — Vite for lightning-fast HMR and builds
- 🎨 **Tailwind CSS** — utility-first styling with a custom design token theme
- 🎭 **Framer Motion** — smooth page transitions and micro-animations
- 🎯 **Lucide React** — consistent, beautiful icon system
- 🧭 **SPA Navigation** — custom client-side router (no external router dependency)
- 📱 **Responsive** — desktop-first layout that adapts to mobile via collapsible sidebar
- 🔒 **Auth Context** — lightweight mock authentication layer
- 🧪 **Testing** — Vitest + React Testing Library + fast-check (property-based tests)

---

## 🗂️ Modules & Pages

| Route Key         | Page Component            | Description                                      |
|-------------------|---------------------------|--------------------------------------------------|
| `home`            | `HomePage`                | Dashboard overview with all summary widgets      |
| `courses`         | `CoursesPage`             | Enrolled courses list with drill-down navigation |
| `subject_<id>`    | `SubjectDetailPage`       | Per-subject detail view (accessed from Courses)  |
| `faculty`         | `FacultyPage`             | Faculty directory with contact info              |
| `timetable`       | `WeeklyTimetablePage`     | Full weekly class timetable                      |
| `examination`     | `ExaminationPage`         | Exam schedule, results, and grading              |
| `calendar`        | `SchoolCalendarPage`      | Academic calendar with events                    |
| `feeDetails`      | `FeeDetailsPage`          | Detailed fee ledger and payment history          |
| `documents`       | `DocumentsPage`           | Student document repository                      |
| `achievements`    | `AchievementsPage`        | Badges, awards, and milestones                   |
| `mentorSupport`   | `MentorSupportPage`       | Mentor profiles, anonymous requests, sessions    |
| `clubsCommittees` | `ClubsCommitteesPage`     | Student clubs and committee memberships          |
| `transport`       | `TransportPage`           | Bus routes, schedule, and transport details      |

---

## 🧩 Component Library

| Component                | Description                                              |
|--------------------------|----------------------------------------------------------|
| `Sidebar`                | Collapsible navigation sidebar with custom scrollbar     |
| `Header`                 | Top bar with notifications, date, language toggle        |
| `HeroBanner`             | Welcome banner with student info                         |
| `ActionNeededSection`    | Quick-action cards (attendance warnings, due fees, etc.) |
| `AttendanceCard`         | Overall attendance circular progress                     |
| `SubjectAttendanceCards` | Per-subject attendance breakdown                         |
| `FeeCard`                | Fee summary with due date and status badge               |
| `TimetableCard`          | Today's timetable with period slots                      |
| `CredentialsCard`        | Library / email credential display                       |
| `LMSCard`                | LMS stats — streak, completion, pending assignments      |
| `VCMessageCard`          | Vice-Chancellor's message card                           |
| `NoticeBoard`            | Notices and exam alerts board                            |
| `EventBoard`             | Upcoming events and happenings                           |
| `MainCard`               | Reusable card shell used across dashboard modules        |
| `FloatingWidgets`        | Floating UI helper widgets                               |
| `HelperButton`           | Floating help trigger button                             |
| `HelperPopup`            | Help/FAQ popup panel                                     |

---

## 🌐 Multilingual Support

Translation files live in `src/translations/`:

| File            | Scope                                   |
|-----------------|-----------------------------------------|
| `common.js`     | Shared UI strings (buttons, labels)     |
| `homepage.js`   | Home dashboard strings                  |
| `exam.js`       | Examination module strings              |
| `mentor.js`     | Mentor Support module strings           |
| `newSections.js`| Newer module labels                     |
| `index.js`      | Translation registry / export barrel    |

Language state is managed via `LanguageContext` (`src/context/LanguageContext.jsx`). Toggle between **EN** and **HI** from the header.

---

## 🏗️ Tech Stack

| Layer        | Technology                              |
|--------------|-----------------------------------------|
| Frontend     | React 18 + JavaScript (no TypeScript)   |
| Build Tool   | Vite 5                                  |
| Styling      | Tailwind CSS 3 with custom theme        |
| Animations   | Framer Motion 11                        |
| Icons        | Lucide React                            |
| State        | React Context (Auth + Language)         |
| Testing      | Vitest + React Testing Library + fast-check |
| Font         | Nunito (Google Fonts)                   |

---

## 📁 Project Structure

```
school-erp-dashboard/
├── public/
│   └── vite.svg
├── src/
│   ├── components/              # Reusable UI components (17 components)
│   │   ├── MainCard.jsx         # Shared card shell
│   │   ├── Sidebar.jsx          # Collapsible navigation sidebar
│   │   ├── Header.jsx           # Top navigation bar
│   │   ├── AttendanceCard.jsx
│   │   ├── FeeCard.jsx
│   │   ├── TimetableCard.jsx
│   │   └── ...                  # Other dashboard widgets
│   ├── pages/                   # Full-page views (12 pages)
│   │   ├── CoursesPage.jsx
│   │   ├── FeeDetailsPage.jsx
│   │   ├── MentorSupportPage.jsx
│   │   ├── ExaminationPage.jsx
│   │   └── ...
│   ├── context/                 # React Context providers
│   │   ├── AuthContext.jsx      # Mock auth state
│   │   └── LanguageContext.jsx  # EN/HI language toggle
│   ├── data/                    # Static dummy data (no API/backend)
│   ├── translations/            # EN + HI string maps
│   ├── services/                # Service layer (mock)
│   ├── utils/                   # Utility helpers
│   ├── test/                    # Test setup and utilities
│   ├── App.jsx                  # Root component + SPA router
│   ├── main.jsx                 # App entry point
│   ├── index.css                # Global base styles
│   └── App.css                  # App-level styles
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **npm** (or yarn / pnpm)

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd school-erp-dashboard

# 2. Install dependencies
npm install
```

### Development

```bash
npm run dev
```

App runs at **`http://localhost:5173`** with hot module replacement.

### Production Build

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## 🧪 Testing

```bash
# Run all tests (headless)
npm run test

# Run tests with interactive UI
npm run test:ui
```

Tests use **Vitest** + **React Testing Library** + **fast-check** for property-based testing.

---

## 🔍 Linting

```bash
npm run lint
```

---

## 🎨 Design System

### Color Palette

| Token            | Value       | Usage                          |
|------------------|-------------|--------------------------------|
| Background       | `#caf0f8`   | App background (sky blue)      |
| Primary Accent   | `#0077b6`   | Focus highlights, CTAs         |
| Card Background  | `#ffffff`   | Card shells                    |
| Sidebar BG       | Custom dark | Collapsible sidebar            |

### Typography

- **Font**: [Nunito](https://fonts.google.com/specimen/Nunito) (Google Fonts)
- **Weights**: 400, 600, 700, 800, 900

### Animation Patterns

- **Page transitions** — `AnimatePresence` with `opacity` + `y` fade-slide (250ms)
- **Sidebar** — Spring-animated `marginLeft` on main content (`stiffness: 300, damping: 30`)
- **Component entrance** — Staggered `motion.div` reveals per card/section
- **Highlight glow** — Outline pulse on scroll-to-section navigation

---

## 📌 Architecture Notes

- **No external router** — page navigation is managed via `activePage` state + a `switch` in `App.jsx`
- **Static data only** — all data comes from `src/data/dummyData.js`; no API calls
- **Always-mounted modal pattern** — modals/popups use CSS visibility (`opacity`/`pointer-events`) rather than conditional rendering to avoid unmount/remount animation glitches
- **Sidebar scroll** — custom-styled scrollbar aligned to EduDash palette; layout-stable with no shifting
- **Performance** — Stable ref patterns (`useRef`, `useCallback`, `useMemo`) prevent unnecessary re-renders in `App.jsx` and `HomePage`

---

## 📄 License

This project is for **educational purposes** only.
