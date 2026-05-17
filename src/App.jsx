import React, { useRef, useState, useCallback, useMemo, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import HeroBanner from "./components/HeroBanner";
import ActionNeededSection from "./components/ActionNeededSection";
import AttendanceCard from "./components/AttendanceCard";
import FeeCard from "./components/FeeCard";
import SubjectAttendanceCards from "./components/SubjectAttendanceCards";
import TimetableCard from "./components/TimetableCard";
import CredentialsCard from "./components/CredentialsCard";
import AssignmentsSummaryCard from "./components/AssignmentsSummaryCard";
import VCMessageCard from "./components/VCMessageCard";
import NoticeBoard from "./components/NoticeBoard";
import EventBoard from "./components/EventBoard";
import ChildScopeSwitcher from "./components/parent/ChildScopeSwitcher";
import ErrorBoundary from "./components/ErrorBoundary";
import MainCard from "./components/MainCard";
import { Users, ShieldCheck } from "lucide-react";

// Lazy Loaded Pages
const CoursesPage = lazy(() => import("./pages/CoursesPage"));
const FacultyPage = lazy(() => import("./pages/FacultyPage"));
const WeeklyTimetablePage = lazy(() => import("./pages/WeeklyTimetablePage"));
const ExaminationPage = lazy(() => import("./pages/ExaminationPage"));
const SchoolCalendarPage = lazy(() => import("./pages/SchoolCalendarPage"));
const FeeDetailsPage = lazy(() => import("./pages/FeeDetailsPage"));
const SubjectDetailPage = lazy(() => import("./pages/SubjectDetailPage"));
const DocumentsPage = lazy(() => import("./pages/DocumentsPage"));
const AssignmentsPage = lazy(() => import("./pages/student/AssignmentsPage"));
const AchievementsPage = lazy(() => import("./pages/AchievementsPage"));
const MentorSupportPage = lazy(() => import("./pages/MentorSupportPage"));
const ClubsCommitteesPage = lazy(() => import("./pages/ClubsCommitteesPage"));
const TransportPage = lazy(() => import("./pages/TransportPage"));
const StudentProfilePage = lazy(() => import("./pages/StudentProfilePage"));

// Teacher Portal Pages
const TeacherDashboard = lazy(() => import("./pages/teacher/TeacherDashboard"));
const AttendanceMgmtPage = lazy(() => import("./pages/teacher/AttendanceMgmtPage"));
const AssignmentsManagementPage = lazy(() => import("./pages/teacher/AssignmentsManagementPage"));
const MarksExamsPage = lazy(() => import("./pages/teacher/MarksExamsPage"));
const ClassTimetablePage = lazy(() => import("./pages/teacher/ClassTimetablePage"));
const StudentPerfPage = lazy(() => import("./pages/teacher/StudentPerfPage"));
const AnnouncementsPage = lazy(() => import("./pages/teacher/AnnouncementsPage"));
const TeacherMentorSupportPage = lazy(() => import("./pages/teacher/MentorSupportPage"));
const ClubsActivitiesPage = lazy(() => import("./pages/teacher/ClubsActivitiesPage"));
const ReportsAnalyticsPage = lazy(() => import("./pages/teacher/ReportsAnalyticsPage"));
const ProfileSettingsPage = lazy(() => import("./pages/teacher/ProfileSettingsPage"));

const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

import { formatDate } from "./utils/attendanceHelpers";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import SkeletonCard from "./components/SkeletonCard";

// Auth & Routing
import { ROLES } from "./auth/roles";
import { ROLE_NAVIGATION } from "./auth/navigation";
import ProtectedRoute from "./routes/ProtectedRoute";
import LoginPage from "./pages/auth/LoginPage";

// Layouts
import StudentLayout from "./layouts/StudentLayout";
import ParentLayout from "./layouts/ParentLayout";
import TeacherLayout from "./layouts/TeacherLayout";
import AdminLayout from "./layouts/AdminLayout";

import { StudentProvider, useStudent } from "./context/StudentContext";

// Service Imports
import { getStudentProfile, getAttendance, getDocuments } from "./services/studentService";
import { getFeeDetails } from "./services/financeService";
import { getTimetable } from "./services/academicsService";
import { getBrandingInfo, getNoticesAndEvents, getNotifications } from "./services/sharedService";
import { getChildren } from "./services/parentService";
import { getAcademicProgress, getAcademicTimeline } from "./services/assignmentService";
import { getExamData } from "./services/examService";
import { useService } from "./hooks/useService";

const LAYOUT_MAP = {
  [ROLES.STUDENT]: StudentLayout,
  [ROLES.PARENT]: ParentLayout,
  [ROLES.TEACHER]: TeacherLayout,
  [ROLES.ADMIN]: AdminLayout,
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  return isMobile;
}

const CURRENT_DATE = formatDate(new Date());

// ── Home dashboard ────────────────────────────────────────────────────────────

const HomePage = React.memo(function HomePage({ onNavigatePage }) {
  const attendanceRef = useRef(null);
  const feeRef = useRef(null);
  const timetableRef = useRef(null);
  const assignmentsRef = useRef(null);

  const sectionRefs = useRef({
    "section-attendance": attendanceRef,
    "section-fee": feeRef,
    "section-timetable": timetableRef,
    "section-assignments": assignmentsRef,
  });

  const [highlightedSection, setHighlightedSection] = useState(null);
  const { isParent } = useAuth();
  const { activeStudentId, activeStudent, childrenList, setActiveStudentId } = useStudent();

  const { data: profile } = useService(getStudentProfile, [activeStudentId], [activeStudentId]);
  const { data: attendance } = useService(getAttendance, [activeStudentId], [activeStudentId]);
  const { data: finance } = useService(getFeeDetails, [activeStudentId], [activeStudentId]);
  const { data: timetable } = useService(getTimetable, [activeStudentId], [activeStudentId]);
  const { data: progress } = useService(getAcademicProgress, [activeStudentId], [activeStudentId]);
  const { data: timeline } = useService(getAcademicTimeline, [activeStudentId], [activeStudentId]);
  const { data: branding } = useService(getBrandingInfo);
  const { data: shared } = useService(getNoticesAndEvents, [activeStudentId], [activeStudentId]);
  const { data: documents } = useService(getDocuments, [activeStudentId], [activeStudentId]);
  const { data: examData } = useService(getExamData, [activeStudentId], [activeStudentId]);

  const handleNavigate = useCallback((sectionId) => {
    const ref = sectionRefs.current[sectionId];
    const el = ref?.current;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightedSection(sectionId);
    setTimeout(() => setHighlightedSection(null), 2000);
  }, []);

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

  const attendanceWarnings = useMemo(() => {
    return (attendance?.subjects || []).filter(s => s.percentage < 75);
  }, [attendance?.subjects]);

  const missingDocuments = useMemo(() => {
    return (documents || []).filter(doc => doc.isMandatory && doc.status === "missing");
  }, [documents]);

  const completionRate = useMemo(() => {
    const total = (progress || []).reduce((acc, curr) => acc + (curr.totalTasks || 0), 0);
    const completed = (progress || []).reduce((acc, curr) => acc + (curr.completedTasks || 0), 0);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [progress]);

  const pendingCount = useMemo(() => {
    return timeline?.upcoming?.length || 0;
  }, [timeline?.upcoming]);

  const overdueCount = useMemo(() => {
    return timeline?.overdue?.length || 0;
  }, [timeline?.overdue]);

  const nextExam = useMemo(() => {
    if (!examData?.schedule || examData.schedule.length === 0) return null;
    const firstExam = examData.schedule[0];
    return {
      name: firstExam.subject,
      date: firstExam.date
    };
  }, [examData]);

  const handleNavigateFeeDetails = useCallback(() => {
    onNavigatePage("feeDetails");
  }, [onNavigatePage]);

  const handleNavigateAssignments = useCallback(() => {
    onNavigatePage("assignments");
  }, [onNavigatePage]);

  if (!profile || !attendance || !finance || !timetable || !branding || !shared || !progress || !timeline || !documents || !examData) {
    return (
      <div className="space-y-6">
        <div className="h-40 w-full bg-gray-100/50 rounded-[2.5rem] animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard height="220px" />
          <SkeletonCard height="220px" />
          <SkeletonCard height="220px" />
        </div>
        <div className="h-72 w-full bg-gray-100/50 rounded-[2.5rem] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 items-start">

      <div className="w-full flex gap-6 items-start">
        <div className="flex-1 min-w-0">
          <HeroBanner student={profile.personal} />


          <div className="mt-6">
            <ActionNeededSection
              attendanceWarnings={attendanceWarnings}
              nextExam={nextExam}
              fees={finance.summary}
              pendingAssignments={pendingCount + overdueCount}
              missingDocuments={missingDocuments}
              onNavigate={handleNavigate}
            />
          </div>

          <div
            className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6"
            ref={attendanceRef}
            style={glowStyle("section-attendance")}
          >
            <AttendanceCard
              overall={attendance.overall.percentage}
              label="Overall Attendance"
            />
            <div ref={feeRef} style={glowStyle("section-fee")} className="h-full">
              <FeeCard
                amount={finance.summary.outstandingBalance}
                currency={finance.summary.currency}
                dueDate={finance.summary.dueDate}
                status={finance.summary.status}
                amountPaid={finance.summary.totalPaid}
                totalAmount={finance.summary.totalFees}
                onClick={handleNavigateFeeDetails}
              />
            </div>
          </div>

          <div className="mt-6">
            <SubjectAttendanceCards subjects={attendance.subjects} />
          </div>

          <div
            className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6"
            ref={timetableRef}
            style={glowStyle("section-timetable")}
          >
            <div className="lg:col-span-2 h-full">
              <TimetableCard weeklyTimetable={timetable.weekly} />
            </div>
            <div className="flex flex-col gap-4">
              <CredentialsCard 
                type="library"
                title="School Library"
                primaryLabel="Library Card No."
                primaryValue={profile.credentials?.library?.cardNumber || "LIB-11A-023"}
                passwordLabel="PIN"
                passwordValue={profile.credentials?.library?.pin || "lib@Ash2024"}
                accentColor="emerald"
                index={0} 
              />
              <CredentialsCard 
                type="email"
                title="School Email"
                primaryLabel="Email Address"
                primaryValue={profile.credentials?.email?.address || "ashish.kumar@springdale.edu.in"}
                passwordLabel="Password"
                passwordValue={profile.credentials?.email?.password || "Ash@Spring#24"}
                accentColor="blue"
                index={1} 
              />
            </div>
          </div>

          <div
            className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6"
            ref={assignmentsRef}
            style={glowStyle("section-assignments")}
          >
            <AssignmentsSummaryCard
              completionRate={completionRate}
              pendingCount={pendingCount}
              overdueCount={overdueCount}
              onViewAll={handleNavigateAssignments}
              index={0}
            />
            <VCMessageCard
              vcName={branding.principal.name}
              vcTitle={branding.principal.title}
              message={branding.principal.message}
              avatarColor={branding.principal.avatarColor}
              index={1}
            />
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NoticeBoard
              notices={shared.general}
              examNotices={shared.exam}
              index={0}
            />
            <EventBoard
              happenings={shared.events}
              upcoming={shared.upcoming}
              index={1}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

function LazyRoute({ Component, ...props }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <Component {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}

const PortalInDevelopment = ({ title }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
    <MainCard className="p-12 flex flex-col items-center max-w-md">
      <div className="w-20 h-20 bg-[#caf0f8] rounded-[2rem] flex items-center justify-center text-[#0077b6] mb-8">
        <ShieldCheck size={40} />
      </div>
      <h2 className="text-2xl font-black text-[#03045e] mb-4">{title}</h2>
      <p className="text-gray-500 font-bold mb-8 leading-relaxed">
        The {title} is currently under construction. Future updates will include system-wide fee management, transport logistics, and user administration.
      </p>
      <div className="flex gap-2">
        <div className="w-2 h-2 rounded-full bg-[#00b4d8] animate-bounce" style={{ animationDelay: "0s" }} />
        <div className="w-2 h-2 rounded-full bg-[#00b4d8] animate-bounce" style={{ animationDelay: "0.2s" }} />
        <div className="w-2 h-2 rounded-full bg-[#00b4d8] animate-bounce" style={{ animationDelay: "0.4s" }} />
      </div>
    </MainCard>
  </div>
);

function NavigateToDashboard() {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={`/${role?.toLowerCase()}/dashboard`} replace />;
}

function AppContent() {
  const { isAuthenticated, role } = useAuth();
  const { data: notifications } = useService(getNotifications);
  const navigate = useNavigate();

  const handlePageNavigation = useCallback((pageId) => {
    if (pageId.startsWith("subject_")) {
      const subjectId = pageId.split("_")[1];
      navigate(`/${role?.toLowerCase()}/subjects/${subjectId}`);
      return;
    }
    switch (pageId) {
      case "feeDetails":
        navigate(`/${role?.toLowerCase()}/fees`);
        break;
      case "assignments":
        navigate(`/${role?.toLowerCase()}/assignments`);
        break;
      case "courses":
        navigate(`/${role?.toLowerCase()}/subjects`);
        break;
      case "profile":
        navigate(`/${role?.toLowerCase()}/profile`);
        break;
      default:
        navigate(`/${role?.toLowerCase()}/dashboard`);
    }
  }, [navigate, role]);

  if (!isAuthenticated) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full"
        >
          <LoginPage />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <Routes>
      {/* Student Portal Routes */}
      <Route
        path="/student"
        element={
          <StudentLayout
            navItems={ROLE_NAVIGATION[ROLES.STUDENT]}
            notifications={notifications || []}
            currentDate={CURRENT_DATE}
          />
        }
      >
        <Route path="dashboard" element={<LazyRoute Component={HomePage} onNavigatePage={handlePageNavigation} />} />
        <Route path="assignments" element={<LazyRoute Component={AssignmentsPage} />} />
        <Route path="subjects" element={<LazyRoute Component={CoursesPage} onNavigatePage={handlePageNavigation} />} />
        <Route path="subjects/:subjectId" element={<LazyRoute Component={SubjectDetailPage} />} />
        <Route path="timetable" element={<LazyRoute Component={WeeklyTimetablePage} />} />
        <Route path="examinations" element={<LazyRoute Component={ExaminationPage} />} />
        <Route path="fees" element={<LazyRoute Component={FeeDetailsPage} />} />
        <Route path="transport" element={<LazyRoute Component={TransportPage} />} />
        <Route path="clubs" element={<LazyRoute Component={ClubsCommitteesPage} />} />
        <Route path="mentor-support" element={<LazyRoute Component={MentorSupportPage} />} />
        <Route path="documents" element={<LazyRoute Component={DocumentsPage} />} />
        <Route path="achievements" element={<LazyRoute Component={AchievementsPage} />} />
        <Route path="calendar" element={<LazyRoute Component={SchoolCalendarPage} />} />
        <Route path="profile" element={<LazyRoute Component={StudentProfilePage} onNavigatePage={handlePageNavigation} />} />
        <Route path="faculty" element={<LazyRoute Component={FacultyPage} />} />
      </Route>

      {/* Parent Portal Routes */}
      <Route
        path="/parent"
        element={
          <ParentLayout
            navItems={ROLE_NAVIGATION[ROLES.PARENT]}
            notifications={notifications || []}
            currentDate={CURRENT_DATE}
          />
        }
      >
        <Route path="dashboard" element={<LazyRoute Component={HomePage} onNavigatePage={handlePageNavigation} />} />
        <Route path="assignments" element={<LazyRoute Component={AssignmentsPage} />} />
        <Route path="subjects" element={<LazyRoute Component={CoursesPage} onNavigatePage={handlePageNavigation} />} />
        <Route path="subjects/:subjectId" element={<LazyRoute Component={SubjectDetailPage} />} />
        <Route path="timetable" element={<LazyRoute Component={WeeklyTimetablePage} />} />
        <Route path="examinations" element={<LazyRoute Component={ExaminationPage} />} />
        <Route path="fees" element={<LazyRoute Component={FeeDetailsPage} />} />
        <Route path="transport" element={<LazyRoute Component={TransportPage} />} />
        <Route path="mentor-support" element={<LazyRoute Component={MentorSupportPage} />} />
        <Route path="documents" element={<LazyRoute Component={DocumentsPage} />} />
        <Route path="achievements" element={<LazyRoute Component={AchievementsPage} />} />
        <Route path="profile" element={<LazyRoute Component={StudentProfilePage} onNavigatePage={handlePageNavigation} />} />
        <Route path="faculty" element={<LazyRoute Component={FacultyPage} />} />
      </Route>

      {/* Teacher Portal Routes */}
      <Route
        path="/teacher"
        element={
          <TeacherLayout
            navItems={ROLE_NAVIGATION[ROLES.TEACHER]}
            notifications={notifications || []}
            currentDate={CURRENT_DATE}
          />
        }
      >
        <Route path="dashboard" element={<LazyRoute Component={TeacherDashboard} />} />
        <Route path="attendance" element={<LazyRoute Component={AttendanceMgmtPage} />} />
        <Route path="assignments" element={<LazyRoute Component={AssignmentsManagementPage} />} />
        <Route path="marks" element={<LazyRoute Component={MarksExamsPage} />} />
        <Route path="timetable" element={<LazyRoute Component={ClassTimetablePage} />} />
        <Route path="students" element={<LazyRoute Component={StudentPerfPage} />} />
        <Route path="mentorship" element={<LazyRoute Component={TeacherMentorSupportPage} />} />
        <Route path="announcements" element={<LazyRoute Component={AnnouncementsPage} />} />
        <Route path="clubs" element={<LazyRoute Component={ClubsActivitiesPage} />} />
        <Route path="reports" element={<LazyRoute Component={ReportsAnalyticsPage} />} />
        <Route path="profile-settings" element={<LazyRoute Component={ProfileSettingsPage} />} />
      </Route>

      {/* Admin Portal Routes */}
      <Route
        path="/admin"
        element={
          <AdminLayout
            navItems={ROLE_NAVIGATION[ROLES.ADMIN]}
            notifications={notifications || []}
            currentDate={CURRENT_DATE}
          />
        }
      >
        <Route path="dashboard" element={<LazyRoute Component={AdminDashboard} />} />
        <Route path="fee-mgmt" element={<LazyRoute Component={PortalInDevelopment} title="Fee Management" />} />
        <Route path="transport-mgmt" element={<LazyRoute Component={PortalInDevelopment} title="Transport Management" />} />
        <Route path="announcements" element={<LazyRoute Component={PortalInDevelopment} title="Announcements" />} />
        <Route path="administration" element={<LazyRoute Component={PortalInDevelopment} title="Administration" />} />
        <Route path="profile" element={<LazyRoute Component={PortalInDevelopment} title="Profile Settings" />} />
      </Route>

      {/* Auth Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Global Fallback Route */}
      <Route path="*" element={<NavigateToDashboard />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <StudentProvider>
            <AppContent />
          </StudentProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
