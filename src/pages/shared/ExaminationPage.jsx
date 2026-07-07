import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  CalendarDays,
  ClipboardList,
  Award,
  CheckCircle,
  Clock,
  Info,
  Download,
  AlertCircle,
  ChevronDown
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import HelperButton from "../../components/HelperButton";
import HelperPopup from "../../components/HelperPopup";
import MainCard from "../../components/MainCard";
import { getExamData } from "../../services/examService";
import { useService } from "../../hooks/useService";
import { useAuth } from "../../context/AuthContext";
import { useStudent } from "../../context/StudentContext";
import ChildScopeSwitcher from "../../components/parent/ChildScopeSwitcher";
import EmptyState from "../../components/common/EmptyState";

const NAVY = "#03045e";
const TEAL = "#0077b6";
const SAGE = "#00b4d8";
const LIME = "#caf0f8";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: "easeOut" },
  },
};

function AdmitCardSection({ admitCard = {} }) {
  const { t } = useLanguage();
  return (
    <MainCard variants={cardVariants}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl" style={{ backgroundColor: LIME }}>
              <FileText size={26} style={{ color: NAVY }} aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-base font-extrabold" style={{ color: NAVY }}>
                {t("exam.admitCard")}
              </h3>
              <p className="text-xs text-gray-400">{admitCard?.examName || "N/A"}</p>
            </div>
          </div>
          {admitCard?.issued ? (
            <span
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ backgroundColor: SAGE + "25", color: SAGE }}
            >
              <CheckCircle size={16} aria-hidden="true" /> {t("exam.issued")}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-amber-100 text-amber-600">
              <Clock size={13} aria-hidden="true" /> {t("exam.pending")}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "exam.rollNumber", value: admitCard?.rollNo || "N/A" },
            { label: "exam.examCenter", value: admitCard?.examCenter || "N/A" },
            { label: "exam.reportingTime", value: admitCard?.reportingTime || "N/A" },
            { label: "exam.examDates", value: admitCard?.examDates || "N/A" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl px-4 py-3"
              style={{ backgroundColor: LIME }}
            >
              <p
                className="text-[10px] font-extrabold uppercase tracking-wide mb-0.5"
                style={{ color: TEAL }}
              >
                {t(item.label)}
              </p>
              <p className="text-sm font-bold" style={{ color: NAVY }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <button
          className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-extrabold transition-all hover:opacity-90"
          style={{ backgroundColor: NAVY, color: LIME }}
          aria-label={t("exam.downloadAdmitCard")}
        >
          <Download size={20} aria-hidden="true" />
          {t("exam.downloadAdmitCard")}
        </button>
      </div>
    </MainCard>
  );
}

function ScheduleSection({ schedule = [] }) {
  const { t } = useLanguage();
  return (
    <MainCard variants={cardVariants}>
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl" style={{ backgroundColor: LIME }}>
            <CalendarDays size={26} style={{ color: TEAL }} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-extrabold" style={{ color: NAVY }}>
              {t("exam.schedule")}
            </h3>
            <p className="text-xs text-gray-400">Half-Yearly Examination 2025</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {(schedule || []).map((exam, i) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className="flex items-center gap-3 rounded-xl px-4 py-2.5"
              style={{
                backgroundColor: i % 2 === 0 ? LIME : "white",
                outline: i % 2 !== 0 ? `1px solid ${LIME}` : "none",
              }}
            >
              <div className="flex-shrink-0 w-12 text-center">
                <p className="text-xs font-extrabold" style={{ color: TEAL }}>
                  {exam.date.split(" ")[1]}
                </p>
                <p
                  className="text-lg font-black leading-none"
                  style={{ color: NAVY }}
                >
                  {exam.date.split(" ")[0]}
                </p>
              </div>
              <div
                className="w-px h-10 flex-shrink-0"
                style={{ backgroundColor: TEAL + "40" }}
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: NAVY }}>
                  {exam.subject}
                </p>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={13} aria-hidden="true" />
                    {exam.time}
                  </span>
                  <span className="text-xs text-gray-400">{exam.room}</span>
                  <span className="text-xs text-gray-400">{exam.day}</span>
                </div>
              </div>
              <span
                className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: TEAL + "20", color: TEAL }}
              >
                {t("exam.upcoming")}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </MainCard>
  );
}



function InstructionsSection({ instructions }) {
  const { t } = useLanguage();
  return (
    <MainCard variants={cardVariants}>
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl" style={{ backgroundColor: LIME }}>
            <ClipboardList size={26} style={{ color: NAVY }} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-extrabold" style={{ color: NAVY }}>
              {t("exam.instructions")}
            </h3>
            <p className="text-xs text-gray-400">{t("exam.instructionDesc")}</p>
          </div>
        </div>
        <ol className="flex flex-col gap-2.5">
          {(instructions || []).map((inst, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold mt-0.5"
                style={{ backgroundColor: NAVY, color: LIME }}
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <p className="text-sm text-gray-600 leading-snug">{inst}</p>
            </li>
          ))}
        </ol>
      </div>
    </MainCard>
  );
}

function ExaminationPage() {
  const { t } = useLanguage();
  const { activeStudentId } = useStudent();
  const { isParent: isParentMode } = useAuth();
  const [showHelper, setShowHelper] = useState(false);
  
  const { data: examination, loading: examLoading, error: examError } = useService(getExamData, [activeStudentId], [activeStudentId]);

  if (examError) {
    throw examError;
  }

  const loading = examLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!examination || Object.keys(examination).length === 0) {
    return (
      <div className="relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl shadow-sm flex-shrink-0" style={{ backgroundColor: NAVY }}>
                <FileText size={26} className="text-white" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-black truncate" style={{ color: NAVY }}>
                  {t("exam.title")}
                </h1>
                <p className="text-sm text-gray-500 truncate">{t("exam.subtitle")}</p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <HelperButton onClick={() => setShowHelper(true)} className="relative" />
            </div>
          </div>
          <ChildScopeSwitcher />
        </div>
        
        <MainCard className="h-[400px] flex items-center justify-center bg-white border border-dashed border-gray-300">
          <EmptyState 
            icon={FileText}
            title="No Upcoming Examinations"
            description="No examinations are available for this student."
          />
        </MainCard>
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl shadow-sm flex-shrink-0" style={{ backgroundColor: NAVY }}>
                <FileText size={26} className="text-white" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-black truncate" style={{ color: NAVY }}>
                  {t("exam.title")}
                </h1>
                <p className="text-sm text-gray-500 truncate">{t("exam.subtitle")}</p>
              </div>
            </div>

            <div className="flex-shrink-0">
              <HelperButton
                onClick={() => setShowHelper(true)}
                className="relative"
              />
            </div>
          </div>
          <ChildScopeSwitcher />
        </div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex flex-col gap-6">
            <AdmitCardSection admitCard={examination.admitCard} />
            <InstructionsSection instructions={examination.instructions} />
          </div>

          <div className="flex flex-col gap-6">
            <ScheduleSection schedule={examination.schedule} />
          </div>
        </motion.div>
      </div>

      <HelperPopup
        isOpen={showHelper}
        onClose={() => setShowHelper(false)}
        titleKey="exam.title"
        contentEn="The Examinations section shows your admit card, upcoming exam schedule, past results, and important exam instructions. Download your admit card before the exam date."
        contentHi="परीक्षा अनुभाग आपका प्रवेश पत्र, आगामी परीक्षा कार्यक्रम, पिछले परिणाम और महत्वपूर्ण परीक्षा निर्देश दिखाता है। परीक्षा तिथि से पहले अपना प्रवेश पत्र डाउनलोड करें।"
      />
    </>
  );
}

export default ExaminationPage;

