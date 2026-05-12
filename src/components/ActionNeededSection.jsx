import React, { useMemo } from "react";
import MainCard from "./MainCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  BookOpen,
  CreditCard,
  ClipboardList,
  CheckCircle,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

// ─────────────────────────────────────────────────────────────────────────────
// Priority config — drives colour, animation, sort order
// ─────────────────────────────────────────────────────────────────────────────
const PRIORITY_CONFIG = {
  critical: {
    order: 0,
    badgeKey: "priority.urgent",
    badgeBg: "bg-red-50 text-red-600 border-red-100",
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    border: "border-red-200",
    bg: "bg-red-50/60",
    pulse: true,
  },
  important: {
    order: 1,
    badgeKey: "priority.important",
    badgeBg: "bg-orange-50 text-orange-600 border-orange-100",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    border: "border-orange-200",
    bg: "bg-orange-50/60",
    pulse: false,
  },
  reminder: {
    order: 2,
    badgeKey: "priority.reminder",
    badgeBg: "bg-[#caf0f8] text-[#0077b6] border-[#00b4d8]/20",
    iconBg: "bg-[#caf0f8]",
    iconColor: "text-[#0077b6]",
    border: "border-[#00b4d8]/30",
    bg: "bg-[#caf0f8]/60",
    pulse: false,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Build action items — all text comes from the translation function t()
// ─────────────────────────────────────────────────────────────────────────────
function buildActions({
  attendanceWarnings,
  nextExam,
  fees,
  pendingAssignments,
  isParentMode,
  t,
  lang,
}) {
  const voice = isParentMode ? "parent" : "student";
  const items = [];

  // ── Attendance ──────────────────────────────────────────────────────────────
  if (Array.isArray(attendanceWarnings) && attendanceWarnings.length > 0) {
    const lowestPct = Math.min(...attendanceWarnings.map((w) => w.percentage));
    const isMulti = attendanceWarnings.length > 1;
    const subjectList = attendanceWarnings.map((w) => t(w.name)).join(", ");
    const firstSubject = t(attendanceWarnings[0].name);

    const titleKey = isMulti
      ? `action.attendance.title.${voice}.multi`
      : `action.attendance.title.${voice}`;

    items.push({
      id: "attendance",
      sectionId: "section-attendance",
      Icon: AlertTriangle,
      title: t(titleKey, {
        subject: firstSubject,
        pct: lowestPct,
        subjects: subjectList,
      }),
      priority: lowestPct < 65 ? "critical" : "important",
    });
  }

  // ── Fee ─────────────────────────────────────────────────────────────────────
  if (fees && fees.status !== "paid") {
    const feeType = fees.status === "overdue" ? "overdue" : "unpaid";
    const titleKey = `action.fee.title.${voice}.${feeType}`;
    items.push({
      id: "fee",
      sectionId: "section-fee",
      Icon: CreditCard,
      title: t(titleKey, {
        date: fees.dueDate,
        currency: fees.currency,
        amount: (fees?.amount || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN"),
      }),
      priority: fees.status === "overdue" ? "critical" : "important",
    });
  }

  // ── Exam ────────────────────────────────────────────────────────────────────
  if (nextExam && nextExam.name) {
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

  // ── Assignments ─────────────────────────────────────────────────────────────
  if (pendingAssignments > 0) {
    const titleKey =
      pendingAssignments === 1
        ? `action.assignments.title.${voice}_one`
        : `action.assignments.title.${voice}_other`;
    items.push({
      id: "assignments",
      sectionId: "section-lms",
      Icon: ClipboardList,
      title: t(titleKey, { count: pendingAssignments }),
      priority: "reminder",
    });
  }

  // Sort: critical → important → reminder
  return items.sort(
    (a, b) =>
      PRIORITY_CONFIG[a.priority].order - PRIORITY_CONFIG[b.priority].order,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Single action item row — REFACTORED TO COMPACT ALERT CARD
// ─────────────────────────────────────────────────────────────────────────────
function ActionItem({ item, onNavigate, index, t }) {
  const p = PRIORITY_CONFIG[item.priority];

  return (
    <motion.li
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07, ease: "easeOut" }}
      className="h-full flex"
    >
      <motion.button
        onClick={() => onNavigate(item.sectionId)}
        whileHover={{ scale: 1.02, x: 2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`group w-full h-full text-left flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#00b4d8] ${p.bg} ${p.border}`}
        aria-label={`${item.title}`}
      >
        {/* Icon Area */}
        <div
          className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-110 ${p.iconBg}`}
        >
          <item.Icon
            size={22}
            className={`${p.iconColor} ${p.pulse ? "animate-pulse" : ""}`}
            aria-hidden="true"
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          {/* Badge (Supporting element) */}
          <span
            className={`self-start text-[9px] font-black px-2 py-0.5 rounded-full border whitespace-nowrap uppercase tracking-widest transition-colors duration-200 ${p.badgeBg}`}
          >
            {t(p.badgeKey)}
          </span>
          
          {/* Main Title (Primary content) */}
          <h3 className="text-[13px] font-extrabold text-gray-800 leading-[1.3] line-clamp-2">
            {item.title}
          </h3>
        </div>

        {/* CTA Arrow */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/50 flex items-center justify-center shadow-sm group-hover:bg-[#00b4d8] group-hover:text-white transition-all duration-200">
          <ChevronRight
            size={16}
            className="transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </div>
      </motion.button>
    </motion.li>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function ActionNeededSection({
  attendanceWarnings = [],
  nextExam = null,
  fees = null,
  pendingAssignments = 0,
  onNavigate,
}) {
  const { t, lang } = useLanguage();
  const { isParent: isParentMode } = useAuth();

  const actions = useMemo(
    () =>
      buildActions({
        attendanceWarnings,
        nextExam,
        fees,
        pendingAssignments,
        isParentMode,
        t,
        lang,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attendanceWarnings, nextExam, fees, pendingAssignments, isParentMode, t, lang],
  );

  const hasCritical = actions.some((a) => a.priority === "critical");
  const itemCountLabel =
    actions.length === 1
      ? t("action.itemCount_one")
      : t("action.itemCount_other", { count: actions.length });

  return (
    <MainCard
      as="section"
      className="overflow-hidden"
      aria-label={t("action.title")}
      aria-live="polite"
    >
      {/* Header bar */}
      <div
        className="flex items-center gap-2.5 px-6 py-4 border-b border-[#caf0f8]"
        style={{ background: "linear-gradient(90deg, #f0faff, #caf0f8)" }}
      >
        {hasCritical && (
          <span
            className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0 animate-ping"
            aria-hidden="true"
          />
        )}
        <h2 className="text-sm font-extrabold text-gray-800 tracking-tight flex-1">
          {actions.length === 0 ? t("action.summary") : t("action.title")}
        </h2>
        {actions.length > 0 && (
          <span className="bg-[#03045e] text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm ring-1 ring-white/20">
            {itemCountLabel}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-4 py-4">
        <AnimatePresence mode="wait">
          {actions.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 py-2"
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle
                  size={20}
                  className="text-green-600"
                  aria-hidden="true"
                />
              </div>
              <div>
                <p className="text-sm font-extrabold text-green-700">
                  {t("action.allClear")}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {t("action.allClearSub")}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.ul
              key="list"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              role="list"
              aria-label={t("action.title")}
            >
              {actions.map((item, i) => (
                <ActionItem
                  key={item.id}
                  item={item}
                  index={i}
                  onNavigate={onNavigate ?? (() => {})}
                  t={t}
                />
              ))}
            </motion.ul>
          )}
        </AnimatePresence>

        {actions.length > 0 && (
          <p className="text-[10px] text-gray-400 font-medium mt-3 text-center">
            {t("action.tapHint")}
          </p>
        )}
      </div>
    </MainCard>
  );
}
