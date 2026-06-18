import React, { useState, memo } from "react";
import MainCard from "./MainCard";
import { motion } from "framer-motion";
import {
  BookOpen,
  Database,
  Network,
  Monitor,
  Cpu,
  FlaskConical,
  Calculator,
  Globe,
  Dumbbell,
} from "lucide-react";
import { getAttendanceStatus } from "../shared/utils/attendanceHelpers";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import HelperPopup from "./HelperPopup";
import HelperButton from "./HelperButton";

// All variants defined at module level — never recreated
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const SUBJECT_ICONS = {
  phy: FlaskConical,
  chem: FlaskConical,
  math: Calculator,
  cs: Monitor,
  eng: Globe,
  pe: Dumbbell,
  bio: FlaskConical,
  acc: BookOpen,
  bst: BookOpen,
  eco: Globe,
  his: BookOpen,
  pol: BookOpen,
  geo: Globe,
  soc: BookOpen,
  hs: BookOpen,
};

const HELPER_CONTENT_EN =
  "Subject-wise attendance shows how regularly each class was attended. Attendance below 75% in any subject may affect eligibility to sit in that subject's exam.";
const HELPER_CONTENT_HI =
  "विषय-वार उपस्थिति दिखाती है कि प्रत्येक कक्षा में कितनी नियमितता से भाग लिया गया। किसी भी विषय में 75% से कम उपस्थिति उस विषय की परीक्षा में बैठने की पात्रता को प्रभावित कर सकती है।";

const SUBJECT_LEGEND = [
  {
    color: "#00b4d8",
    labelEn: "Green (85%+) — Good attendance.",
    labelHi: "हरा (85%+) — अच्छी उपस्थिति।",
  },
  {
    color: "#F59E0B",
    labelEn: "Yellow (75–84%) — Needs improvement.",
    labelHi: "पीला (75–84%) — सुधार की जरूरत है।",
  },
  {
    color: "#EF4444",
    labelEn: "Red (below 75%) — Risk of exam ineligibility.",
    labelHi: "लाल (75% से कम) — परीक्षा अपात्रता का जोखिम।",
  },
];

const TRAFFIC_COLOR = {
  excellent: "#00b4d8",
  moderate: "#F59E0B",
  warning: "#EF4444",
};

const STATUS_LABEL_KEY = {
  excellent: "attendance.statusExcellent",
  moderate: "attendance.statusModerate",
  warning: "attendance.statusWarning",
};

function TrafficLight({ status }) {
  const color = TRAFFIC_COLOR[status] ?? TRAFFIC_COLOR.excellent;
  return (
    <div
      className="w-3 h-3 rounded-full flex-shrink-0"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  );
}

// FIX: memo prevents re-render when parent re-renders but props haven't changed.
// FIX: accept isParentMode and lang as props instead of calling context hooks
// directly — this means only SubjectAttendanceCards subscribes to context (once),
// not each of the 6 cards individually (6x subscriptions → 6x re-renders).
const SubjectCard = memo(function SubjectCard({
  id,
  name,
  percentage,
  isParentMode,
  lang,
  t,
}) {
  const { status, colorClass, bgClass, barClass, messageKey } =
    getAttendanceStatus(percentage);
  const IconComponent = SUBJECT_ICONS[id] ?? BookOpen;

  const parentLabel = t(STATUS_LABEL_KEY[status]);

  return (
    <MainCard
      variants={cardVariants}
      className="h-full p-5 flex flex-col gap-3"
      aria-label={`${name}: ${percentage}%`}
    >
      <div
        className={`p-2.5 rounded-2xl self-start ${bgClass}`}
        aria-hidden="true"
      >
        <IconComponent size={29} className={colorClass} />
      </div>
      <h3
        className="text-sm font-bold leading-tight"
        style={{ color: "#03045e" }}
      >
        {name}
      </h3>
      <div className="flex items-center justify-between gap-2">
        <span className={`text-2xl font-black ${colorClass}`}>
          {percentage}%
        </span>
        {isParentMode ? (
          <div className="flex items-center gap-1.5">
            <TrafficLight status={status} />
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: TRAFFIC_COLOR[status] + "22",
                color: TRAFFIC_COLOR[status],
              }}
            >
              {parentLabel}
            </span>
          </div>
        ) : (
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${bgClass} ${colorClass}`}
          >
            {t(`status.${status}`)}
          </span>
        )}
      </div>
      <div className="w-full h-3 bg-[#caf0f8] rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${barClass}`}
          initial={{ width: "0%" }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.0, ease: "easeOut", delay: 0.2 }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${name} attendance`}
        />
      </div>
      <p className={`text-xs font-semibold ${colorClass}`}>{t(messageKey)}</p>
    </MainCard>
  );
});

function SubjectAttendanceCards({ subjects = [] }) {
  const { t } = useLanguage();
  // FIX: read context once here and pass as props — not inside each card
  const { isParent: isParentMode } = useAuth();
  const { lang } = useLanguage();
  const [showHelper, setShowHelper] = useState(false);

  return (
    <>
      <section aria-label={t("attendance.subjects")}>
        <div className="flex items-center gap-2 mb-3 relative">
          <BookOpen size={23} style={{ color: "#03045e" }} aria-hidden="true" />
          <h2 className="text-base font-bold" style={{ color: "#03045e" }}>
            {t("attendance.subjects")}
          </h2>
          <HelperButton
            onClick={() => setShowHelper(true)}
            className="ml-auto"
          />
        </div>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              id={subject.id}
              name={subject.name}
              percentage={subject.percentage}
              isParentMode={isParentMode}
              lang={lang}
              t={t}
            />
          ))}
        </motion.div>
      </section>

      <HelperPopup
        isOpen={showHelper}
        onClose={() => setShowHelper(false)}
        titleKey="attendance.subjects"
        contentEn={HELPER_CONTENT_EN}
        contentHi={HELPER_CONTENT_HI}
        colorLegend={SUBJECT_LEGEND}
      />
    </>
  );
}

export default SubjectAttendanceCards;
