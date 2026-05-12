import React, { useRef, useState, useCallback, useMemo } from "react";
import { dummyData } from "./data/dummyData";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import HeroBanner from "./components/HeroBanner";
import ActionNeededSection from "./components/ActionNeededSection";
import AttendanceCard from "./components/AttendanceCard";
import FeeCard from "./components/FeeCard";
import SubjectAttendanceCards from "./components/SubjectAttendanceCards";
import TimetableCard from "./components/TimetableCard";
import CredentialsCard from "./components/CredentialsCard";
import LMSCard from "./components/LMSCard";
import VCMessageCard from "./components/VCMessageCard";
import NoticeBoard from "./components/NoticeBoard";
import EventBoard from "./components/EventBoard";
import CoursesPage from "./pages/CoursesPage";
import FacultyPage from "./pages/FacultyPage";
import WeeklyTimetablePage from "./pages/WeeklyTimetablePage";
import ExaminationPage from "./pages/ExaminationPage";
import SchoolCalendarPage from "./pages/SchoolCalendarPage";
import FeeDetailsPage from "./pages/FeeDetailsPage";
import SubjectDetailPage from "./pages/SubjectDetailPage";
import DocumentsPage from "./pages/DocumentsPage";
import AchievementsPage from "./pages/AchievementsPage";
import MentorSupportPage from "./pages/MentorSupportPage";
import ClubsCommitteesPage from "./pages/ClubsCommitteesPage";
import TransportPage from "./pages/TransportPage";
import { formatDate } from "./utils/attendanceHelpers";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  return isMobile;
}

// FIX: compute once at module level — never changes at runtime
const CURRENT_DATE = formatDate(new Date());

// Pre-filter attendance warnings once — dummyData is static
const ATTENDANCE_WARNINGS = dummyData.attendance.subjects.filter(
  (s) => s.percentage < 75,
);

// ── Home dashboard ────────────────────────────────────────────────────────────
function HomePage({ onNavigatePage }) {
  // FIX: use individual refs instead of a plain object literal.
  // A plain object `{ key: useRef() }` is recreated every render, making
  // handleNavigate's closure always capture a fresh (but correct) object.
  // Using a single stable ref-of-object avoids the recreation entirely.
  const attendanceRef = useRef(null);
  const feeRef = useRef(null);
  const timetableRef = useRef(null);
  const lmsRef = useRef(null);

  // Stable map — created once, never changes
  const sectionRefs = useRef({
    "section-attendance": attendanceRef,
    "section-fee": feeRef,
    "section-timetable": timetableRef,
    "section-lms": lmsRef,
  });

  const [highlightedSection, setHighlightedSection] = useState(null);

  // FIX: dependency array now correctly lists sectionRefs (stable ref object)
  const handleNavigate = useCallback((sectionId) => {
    const ref = sectionRefs.current[sectionId];
    const el = ref?.current;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightedSection(sectionId);
    setTimeout(() => setHighlightedSection(null), 2000);
  }, []); // sectionRefs.current is stable — no deps needed

  const glowStyle = useCallback(
    (id) =>
      highlightedSection === id
        ? {
            outline: "3px solid #0077b6",
            outlineOffset: "3px",
            borderRadius: "16px",
            transition: "outline 0.2s ease",
          }
        : {},
    [highlightedSection],
  );

  return (
    <div className="flex gap-6 items-start">
      <div className="flex-1 min-w-0">
        <HeroBanner student={dummyData.student} />

        <div className="mt-6">
          <ActionNeededSection
            attendanceWarnings={ATTENDANCE_WARNINGS}
            nextExam={dummyData.widgets.nextExam}
            fees={dummyData.fees}
            pendingAssignments={dummyData.lms.pendingAssignments}
            onNavigate={handleNavigate}
          />
        </div>

        {/* Attendance + Fee */}
        <div
          className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6"
          ref={attendanceRef}
          style={glowStyle("section-attendance")}
        >
          <AttendanceCard
            overall={dummyData.attendance.overall}
            label="Overall Attendance"
          />
          <div ref={feeRef} style={glowStyle("section-fee")} className="h-full">
            <FeeCard
              amount={dummyData.fees.amount}
              currency={dummyData.fees.currency}
              dueDate={dummyData.fees.dueDate}
              status={dummyData.fees.status}
              amountPaid={dummyData.fees.amountPaid}
              totalAmount={dummyData.fees.totalAmount}
              onClick={() => onNavigatePage("feeDetails")}
            />
          </div>
        </div>

        <div className="mt-6">
          <SubjectAttendanceCards subjects={dummyData.attendance.subjects} />
        </div>

        {/* Timetable + Credentials */}
        <div
          className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6"
          ref={timetableRef}
          style={glowStyle("section-timetable")}
        >
          <div className="lg:col-span-2 h-full">
            <TimetableCard weeklyTimetable={dummyData.weeklyTimetable} />
          </div>
          <div className="flex flex-col gap-4">
            <CredentialsCard {...dummyData.credentials.library} index={0} />
            <CredentialsCard {...dummyData.credentials.email} index={1} />
          </div>
        </div>

        {/* LMS + VC Message */}
        <div
          className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6"
          ref={lmsRef}
          style={glowStyle("section-lms")}
        >
          <LMSCard
            courseCompletion={dummyData.lms.courseCompletion}
            pendingAssignments={dummyData.lms.pendingAssignments}
            learningStreak={dummyData.lms.learningStreak}
            lmsUrl={dummyData.lms.lmsUrl}
            index={0}
          />
          <VCMessageCard
            vcName={dummyData.vcMessage.vcName}
            vcTitle={dummyData.vcMessage.vcTitle}
            message={dummyData.vcMessage.message}
            avatarColor={dummyData.vcMessage.avatarColor}
            index={1}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NoticeBoard
            notices={dummyData.notices}
            examNotices={dummyData.examNotices}
            index={0}
          />
          <EventBoard
            happenings={dummyData.happenings}
            upcoming={dummyData.upcoming}
            index={1}
          />
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { user } = useAuth();
  const { navItems, notifications } = dummyData;
  const [activePage, setActivePage] = useState("home");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const sidebarOpenRef = useRef(null);
  const isMobile = useIsMobile();

  // FIX: memoize so Sidebar doesn't re-render on every AppContent render
  const handleMenuClick = useCallback(() => {
    if (sidebarOpenRef.current) sidebarOpenRef.current();
  }, []);

  // FIX: memoize so Sidebar doesn't re-render on every AppContent render
  const handleNavClick = useCallback((item) => {
    setActivePage(item.id);
  }, []);

  const { lang, t } = useLanguage();
  const navWithActive = useMemo(
    () => navItems.map((item) => ({ 
      ...item, 
      label: t(`nav.${item.id}`),
      active: item.id === activePage 
    })),
    [navItems, activePage, t],
  );

  const renderPage = () => {
    if (activePage.startsWith("subject_")) {
      const subjectId = activePage.split("_")[1];
      return <SubjectDetailPage subjectId={subjectId} onBack={() => setActivePage("courses")} />;
    }

    switch (activePage) {
      case "courses":
        return <CoursesPage courses={dummyData.courses} onNavigatePage={setActivePage} />;
      case "faculty":
        return <FacultyPage faculty={dummyData.faculty} />;
      case "timetable":
        return (
          <WeeklyTimetablePage weeklyTimetable={dummyData.weeklyTimetable} />
        );
      case "examination":
        return <ExaminationPage examination={dummyData.examination} />;
      case "calendar":
        return <SchoolCalendarPage schoolCalendar={dummyData.schoolCalendar} />;
      case "feeDetails":
        return <FeeDetailsPage feeDetails={dummyData.feeDetails} />;
      case "documents":
        return <DocumentsPage />;
      case "achievements":
        return <AchievementsPage />;
      case "mentorSupport":
        return <MentorSupportPage />;
      case "clubsCommittees":
        return <ClubsCommitteesPage />;
      case "transport":
        return <TransportPage />;
      default:
        return <HomePage onNavigatePage={setActivePage} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#caf0f8]">
      <Sidebar
        navItems={navWithActive}
        student={user}
        openRef={sidebarOpenRef}
        onNavClick={handleNavClick}
        onCollapse={setSidebarCollapsed}
      />

      {/* Main content — margin animates in sync with sidebar width */}
      <motion.div
        animate={{ marginLeft: isMobile ? 0 : (sidebarCollapsed ? 64 : 240) }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex-1 flex flex-col min-w-0"
      >
        <Header
          student={user}
          notifications={notifications}
          currentDate={CURRENT_DATE}
          onMenuClick={handleMenuClick}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
