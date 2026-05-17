import { AlertTriangle, CreditCard, BookOpen, ClipboardList, FileWarning } from "lucide-react";

/**
 * Enterprise Derived Action Center Selector
 * Resolves, filters, and prioritizes critical/actionable ERP items.
 */
export const getActionCenterItems = ({
  attendanceWarnings = [],
  nextExam = null,
  fees = null,
  pendingAssignments = 0,
  missingDocuments = [],
  isParentMode = false,
  t,
  lang,
}) => {
  const voice = isParentMode ? "parent" : "student";
  const items = [];

  // 1. Attendance: Actionable warnings (strictly < 85%)
  if (Array.isArray(attendanceWarnings) && attendanceWarnings.length > 0) {
    const lowestPct = Math.min(...attendanceWarnings.map((w) => w.percentage));
    const isMulti = attendanceWarnings.length > 1;
    const subjectList = attendanceWarnings.map((w) => t(w.name)).join(", ");
    const firstSubject = t(attendanceWarnings[0].name);

    const titleKey = isMulti
      ? `action.attendance.title.${voice}.multi`
      : `action.attendance.title.${voice}`;

    // Critical: < 75% | Warning/Important: 75% to 84%
    items.push({
      id: "attendance",
      sectionId: "section-attendance",
      Icon: AlertTriangle,
      title: t(titleKey, {
        subject: firstSubject,
        pct: lowestPct,
        subjects: subjectList,
      }),
      priority: lowestPct < 75 ? "critical" : "warning",
    });
  }

  // 2. Fee: Actionable unpaid bills (only if there is an actual outstanding balance > 0 and status is not paid)
  if (fees && fees.status && fees.status.toLowerCase() !== "paid" && fees.outstandingBalance > 0) {
    const feeType = fees.status.toLowerCase() === "overdue" ? "overdue" : "unpaid";
    const titleKey = `action.fee.title.${voice}.${feeType}`;
    items.push({
      id: "fee",
      sectionId: "section-fee",
      Icon: CreditCard,
      title: t(titleKey, {
        date: fees.dueDate,
        currency: fees.currency || "₹",
        amount: (fees.outstandingBalance || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN"),
      }),
      priority: fees.status.toLowerCase() === "overdue" ? "critical" : "warning",
    });
  }

  // 3. Exam: Upcoming Actionable Deadlines (Only if exam name exists)
  if (nextExam && nextExam.name && nextExam.date) {
    items.push({
      id: "exam",
      sectionId: "section-timetable",
      Icon: BookOpen,
      title: t(`action.exam.title.${voice}`, {
        name: nextExam.name,
        date: nextExam.date,
      }),
      priority: "reminder",
    });
  }

  // 4. Assignments: Actionable pending tasks
  if (pendingAssignments > 0) {
    const titleKey =
      pendingAssignments === 1
        ? `action.assignments.title.${voice}_one`
        : `action.assignments.title.${voice}_other`;
    items.push({
      id: "assignments",
      sectionId: "section-assignments",
      Icon: ClipboardList,
      title: t(titleKey, { count: pendingAssignments }),
      priority: "reminder",
    });
  }

  // 5. Profile/Document Validation: Critical missing documents
  if (Array.isArray(missingDocuments) && missingDocuments.length > 0) {
    missingDocuments.forEach((doc) => {
      const docTitle = lang === "hi" ? (doc.titleHi || doc.titleEn) : doc.titleEn;
      items.push({
        id: `doc-${doc.id}`,
        sectionId: "section-documents",
        Icon: FileWarning,
        title: isParentMode 
          ? `Missing document for your child: ${docTitle}. Please upload immediately.`
          : `Mandatory document required: ${docTitle}. Please upload immediately.`,
        priority: "critical",
      });
    });
  }

  // Sort: Critical (0) -> Warning (1) -> Reminder (2)
  const priorityOrder = { critical: 0, warning: 1, reminder: 2 };
  return items.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
};
