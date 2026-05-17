import React, { useState } from "react";
import MainCard from "./MainCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  BookOpen,
  Trophy,
  AlertCircle,
  Database,
  Brain,
  Network,
  Bell,
  ClipboardList,
} from "lucide-react";
import { getNoticePriorityStyle } from "../utils/attendanceHelpers";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import HelperPopup from "./HelperPopup";
import HelperButton from "./HelperButton";
import ParentInsight from "./ParentInsight";

const ICON_MAP = {
  FileText,
  BookOpen,
  Trophy,
  AlertCircle,
  Database,
  Brain,
  Network,
  Bell,
  ClipboardList,
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" },
  }),
};
const tabContentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" },
  },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15, ease: "easeIn" } },
};

const HELPER_CONTENT_EN =
  "The notice board shows important announcements from the college — such as exam schedules, holidays, and general updates. High priority notices need immediate attention.";
const HELPER_CONTENT_HI =
  "सूचना पट्ट कॉलेज की महत्वपूर्ण घोषणाएं दिखाता है — जैसे परीक्षा कार्यक्रम, छुट्टियां और सामान्य अपडेट। उच्च प्राथमिकता वाली सूचनाओं पर तुरंत ध्यान देना जरूरी है।";

const NOTICE_LEGEND = [
  {
    color: "#EF4444",
    labelEn: "Red — High priority. Needs immediate attention.",
    labelHi: "लाल — उच्च प्राथमिकता। तुरंत ध्यान देना जरूरी है।",
  },
  {
    color: "#F59E0B",
    labelEn: "Yellow — Medium priority. Read when possible.",
    labelHi: "पीला — मध्यम प्राथमिकता। जल्द पढ़ें।",
  },
  {
    color: "#00b4d8",
    labelEn: "Green — Low priority. General information.",
    labelHi: "हरा — कम प्राथमिकता। सामान्य जानकारी।",
  },
];

function NoticeItem({ notice, index, isParentMode }) {
  const { t } = useLanguage();
  const { title, date, priority, icon } = notice;
  const IconComponent = ICON_MAP[icon] ?? Bell;
  const { bgClass, textClass } = getNoticePriorityStyle(priority);

  const priorityLabel = t(`priority.${priority}`) || priority;

  return (
    <motion.li
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.015, x: 4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="flex items-start gap-3 p-3 rounded-2xl transition-colors duration-150 cursor-default hover:bg-[#caf0f8]"
      role="listitem"
      aria-label={`${priorityLabel} priority notice: ${t(title)} on ${date}`}
    >
      <div
        className={`flex-shrink-0 p-2 rounded-xl ${bgClass}`}
        aria-hidden="true"
      >
        <IconComponent size={23} className={textClass} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <span
            className={`inline-block font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${bgClass} ${textClass} ${isParentMode ? "text-xs" : "text-[10px]"}`}
          >
            {priorityLabel}
          </span>
        </div>
        <p
          className={`font-semibold leading-snug line-clamp-2 ${isParentMode ? "text-base" : "text-sm"}`}
          style={{ color: "#03045e" }}
        >
          {t(title)}
        </p>
        <p className="text-xs text-gray-400 mt-0.5 font-medium">{date}</p>
      </div>
    </motion.li>
  );
}

function NoticeBoard({ notices = [], examNotices = [], index = 0 }) {
  const { t } = useLanguage();
  const { isParent: isParentMode } = useAuth();
  const [showHelper, setShowHelper] = useState(false);

  const combinedData = React.useMemo(() => {
    const combined = [...notices, ...examNotices];
    return combined.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [notices, examNotices]);

  return (
    <>
      <MainCard
        custom={index}
        variants={cardVariants}
        className="h-full flex flex-col relative"
        aria-label={t("notice.title")}
      >
        <HelperButton onClick={() => setShowHelper(true)} className="absolute top-4 right-4" />

        <div className="px-6 pt-5 pb-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-2xl"
              style={{ backgroundColor: "#03045e15" }}
            >
              <Bell size={26} style={{ color: "#03045e" }} aria-hidden="true" />
            </div>
            <div>
              <h2
                className="text-lg font-extrabold leading-tight"
                style={{ color: "#03045e" }}
              >
                {t("notice.title")}
              </h2>
              <span className="text-xs font-semibold text-gray-400">
                {t("notice.subtitle")}
              </span>
            </div>
          </div>
        </div>

        {isParentMode && combinedData.length > 0 && (
          <div className="px-6 mt-4">
            <ParentInsight 
              text={t("insight.notices", { count: combinedData.length })} 
            />
          </div>
        )}

        <div className="flex-1 px-4 py-3 min-h-0 mt-2">
          {combinedData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              {t("notice.empty")}
            </p>
          ) : (
            <ul className="space-y-1" aria-label={t("notice.list")}>
              {combinedData.map((notice, i) => (
                <NoticeItem
                  key={notice.id}
                  notice={notice}
                  index={i}
                  isParentMode={isParentMode}
                />
              ))}
            </ul>
          )}
        </div>
      </MainCard>

      <HelperPopup
        isOpen={showHelper}
        onClose={() => setShowHelper(false)}
        titleKey="notice.title"
        contentEn={HELPER_CONTENT_EN}
        contentHi={HELPER_CONTENT_HI}
        colorLegend={NOTICE_LEGEND}
      />
    </>
  );
}

export default React.memo(NoticeBoard);
