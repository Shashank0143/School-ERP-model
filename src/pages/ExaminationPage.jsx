import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  CalendarDays,
  ClipboardList,
  Award,
  CheckCircle,
  Clock,
  AlertCircle,
  Info,
  Download,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import HelperButton from "../components/HelperButton";
import HelperPopup from "../components/HelperPopup";
import MainCard from "../components/MainCard";

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

// ── Admit Card ────────────────────────────────────────────────────────────────
function AdmitCardSection({ admitCard }) {
  const { t } = useLanguage();
  return (
    <MainCard
      variants={cardVariants}
      className="h-full"
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-2xl"
              style={{ backgroundColor: LIME }}
            >
              <FileText size={26} style={{ color: NAVY }} aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-base font-extrabold" style={{ color: NAVY }}>
                {t("exam.admitCard")}
              </h3>
              <p className="text-xs text-gray-400">{t(admitCard.examName)}</p>
            </div>
          </div>
          {admitCard.issued ? (
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
            { label: "exam.rollNumber", value: admitCard.rollNo },
            { label: "exam.examCenter", value: admitCard.examCenter },
            { label: "exam.reportingTime", value: admitCard.reportingTime },
            { label: "exam.examDates", value: admitCard.examDates },
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

// ── Exam Schedule ─────────────────────────────────────────────────────────────
function ScheduleSection({ schedule }) {
  const { t } = useLanguage();
  return (
    <MainCard
      variants={cardVariants}
      className="h-full"
    >
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl" style={{ backgroundColor: LIME }}>
            <CalendarDays
              size={26}
              style={{ color: TEAL }}
              aria-hidden="true"
            />
          </div>
          <div>
            <h3 className="text-base font-extrabold" style={{ color: NAVY }}>
              {t("exam.schedule")}
            </h3>
            <p className="text-xs text-gray-400">
              {t("Half-Yearly Examination 2025")}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {schedule.map((exam, i) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{
                backgroundColor: i % 2 === 0 ? LIME : "white",
                outline: i % 2 !== 0 ? `1px solid ${LIME}` : "none",
              }}
            >
              {/* Date block */}
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
              {/* Divider */}
              <div
                className="w-px h-10 flex-shrink-0"
                style={{ backgroundColor: TEAL + "40" }}
                aria-hidden="true"
              />
              {/* Details */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-bold truncate"
                  style={{ color: NAVY }}
                >
                  {t(exam.subject)}
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
              {/* Status */}
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

// ── Results ───────────────────────────────────────────────────────────────────
function ResultsSection({ results }) {
  const { t } = useLanguage();
  return (
    <MainCard
      variants={cardVariants}
      className="h-full"
    >
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl" style={{ backgroundColor: LIME }}>
            <Award size={26} style={{ color: SAGE }} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-extrabold" style={{ color: NAVY }}>
              {t("exam.results")}
            </h3>
            <p className="text-xs text-gray-400">{t("exam.pastResults")}</p>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: LIME }}
            >
              <Info size={31} style={{ color: TEAL }} aria-hidden="true" />
            </div>
            <p className="text-sm font-bold" style={{ color: NAVY }}>
              {t("exam.noResults")}
            </p>
            <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
              {t("exam.noResultsDetail")}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {results.map((r) => (
              <div
                key={r.id}
                className="rounded-xl px-4 py-3"
                style={{ backgroundColor: LIME }}
              >
                <p className="text-sm font-bold" style={{ color: NAVY }}>
                  {t(r.examName)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{r.date}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainCard>
  );
}

// ── Instructions ──────────────────────────────────────────────────────────────
function InstructionsSection({ instructions }) {
  const { t } = useLanguage();
  return (
    <MainCard
      variants={cardVariants}
      className="h-full"
    >
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl" style={{ backgroundColor: LIME }}>
            <ClipboardList
              size={26}
              style={{ color: NAVY }}
              aria-hidden="true"
            />
          </div>
          <div>
            <h3 className="text-base font-extrabold" style={{ color: NAVY }}>
              {t("exam.instructions")}
            </h3>
            <p className="text-xs text-gray-400">
              {t("exam.instructionDesc")}
            </p>
          </div>
        </div>
        <ol className="flex flex-col gap-2.5">
          {instructions.map((inst, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold mt-0.5"
                style={{ backgroundColor: NAVY, color: LIME }}
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <p className="text-sm text-gray-600 leading-snug">{t(inst)}</p>
            </li>
          ))}
        </ol>
      </div>
    </MainCard>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
function ExaminationPage({ examination }) {
  const { t } = useLanguage();
  const [showHelper, setShowHelper] = useState(false);

  if (!examination) return null;

  return (
    <>
      <div className="relative">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl" style={{ backgroundColor: NAVY }}>
            <FileText size={26} className="text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-black" style={{ color: NAVY }}>
              {t("exam.title")}
            </h1>
            <p className="text-sm text-gray-500">
              {t("exam.subtitle")}
            </p>
          </div>
          <div className="ml-auto">
            <HelperButton
              onClick={() => setShowHelper(true)}
              className="relative"
            />
          </div>
        </div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left column */}
          <div className="flex flex-col gap-6">
            <AdmitCardSection admitCard={examination.admitCard} />
            <ResultsSection results={examination.results} />
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            <ScheduleSection schedule={examination.schedule} />
            <InstructionsSection instructions={examination.instructions} />
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
