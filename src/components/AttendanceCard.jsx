import React, { useState } from "react";
import MainCard from "./MainCard";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart2 } from "lucide-react";
import { getAttendanceStatus } from "../utils/attendanceHelpers";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import HelperPopup from "./HelperPopup";
import HelperButton from "./HelperButton";

const RADIUS = 72;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

const HELPER_CONTENT_EN =
  "Attendance shows how many classes were attended out of the total scheduled. Regular attendance is important for learning and exam eligibility.";
const HELPER_CONTENT_HI =
  "उपस्थिति बताती है कि कुल निर्धारित कक्षाओं में से कितनी कक्षाओं में भाग लिया गया। नियमित उपस्थिति सीखने और परीक्षा पात्रता के लिए महत्वपूर्ण है।";

const ATTENDANCE_COLOR_LEGEND = [
  {
    color: "#00b4d8",
    labelEn: "Green (85%+) — Attendance is good. Keep it up.",
    labelHi: "हरा (85%+) — उपस्थिति अच्छी है। ऐसे ही जारी रखें।",
  },
  {
    color: "#F59E0B",
    labelEn: "Yellow (75–84%) — Attendance needs improvement.",
    labelHi: "पीला (75–84%) — उपस्थिति में सुधार की जरूरत है।",
  },
  {
    color: "#EF4444",
    labelEn: "Red (below 75%) — Attendance is very low. May affect exams.",
    labelHi:
      "लाल (75% से कम) — उपस्थिति बहुत कम है। परीक्षा पर असर पड़ सकता है।",
  },
];

function TrafficLight({ status }) {
  const colorMap = {
    excellent: "#00b4d8",
    moderate: "#F59E0B",
    warning: "#EF4444",
  };
  const color = colorMap[status] ?? colorMap.excellent;
  return (
    <div
      className="w-4 h-4 rounded-full flex-shrink-0"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  );
}

function StatusIcon({ status }) {
  if (status === "excellent") {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#00b4d8"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    );
  }
  if (status === "moderate") {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" stroke="#0077b6" strokeWidth="2" />
        <path
          d="M12 8v4M12 16h.01"
          stroke="#0077b6"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        stroke="#EF4444"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="12"
        y1="9"
        x2="12"
        y2="13"
        stroke="#EF4444"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="12"
        y1="17"
        x2="12.01"
        y2="17"
        stroke="#EF4444"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CircularRing({ percentage, strokeColor }) {
  const targetOffset = CIRCUMFERENCE - (percentage / 100) * CIRCUMFERENCE;
  return (
    <svg
      width="180"
      height="180"
      viewBox="0 0 180 180"
      className="drop-shadow-md"
      aria-hidden="true"
    >
      <circle
        cx="90"
        cy="90"
        r={RADIUS}
        fill="none"
        stroke="#caf0f8"
        strokeWidth="12"
      />
      <motion.circle
        cx="90"
        cy="90"
        r={RADIUS}
        fill="none"
        stroke={strokeColor}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        initial={{ strokeDashoffset: CIRCUMFERENCE }}
        animate={{ strokeDashoffset: targetOffset }}
        transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
        style={{ transformOrigin: "50% 50%", rotate: "-90deg" }}
      />
    </svg>
  );
}

function AttendanceCard({ overall, label }) {
  const { t, lang } = useLanguage();
  const { isParent: isParentMode } = useAuth();
  const [showHelper, setShowHelper] = useState(false);
  const [showLegend, setShowLegend] = useState(false);

  const percentage = (() => {
    const val = typeof overall === 'object' ? overall?.percentage : overall;
    return isNaN(val) || val === undefined || val === null ? 0 : val;
  })();
  const { status, colorClass, bgClass, strokeColor, messageKey } =
    getAttendanceStatus(percentage);

  const glowMap = {
    excellent: "2px solid #00b4d8",
    moderate: "2px solid #0077b6",
    warning: "2px solid #EF4444",
  };

  const parentMessageKey = {
    excellent: "attendance.parentExcellent",
    moderate: "attendance.parentModerate",
    warning: "attendance.parentWarning",
  };

  const statusLabelKey = {
    excellent: "attendance.statusExcellent",
    moderate: "attendance.statusModerate",
    warning: "attendance.statusWarning",
  };

  const trafficColor = {
    excellent: "#00b4d8",
    moderate: "#F59E0B",
    warning: "#EF4444",
  };

  const cardLabel = label || t("attendance.title");

  return (
    <>
      <MainCard
        variants={cardVariants}
        className="h-full p-6 items-center gap-4 cursor-default select-none relative"
        aria-label={`${cardLabel}: ${percentage}%`}
      >
        {/* Helper button */}
        <HelperButton onClick={() => setShowHelper(true)} className="absolute top-4 right-4" />

        {/* Heading */}
        <div className="flex items-center gap-2 self-start">
          <BarChart2
            size={26}
            style={{ color: "#03045e" }}
            aria-hidden="true"
          />
          <h2 className="text-lg font-bold" style={{ color: "#03045e" }}>
            {cardLabel}
          </h2>
        </div>

        {/* Ring */}
        <div className="relative flex items-center justify-center">
          <CircularRing percentage={percentage} strokeColor={strokeColor} />
          <div className="absolute flex flex-col items-center justify-center gap-1.5">
            <motion.span
              className={`text-4xl font-black ${colorClass}`}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
            >
              {percentage}%
            </motion.span>
            
            {/* Interactive Status Icon with Micro Legend */}
            <div className="relative">
              <motion.button
                onClick={() => setShowLegend(!showLegend)}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                className="focus:outline-none p-1 rounded-full hover:bg-white/40 transition-colors duration-200"
                aria-label="Show attendance legend"
              >
                <StatusIcon status={status} />
              </motion.button>

              <AnimatePresence>
                {showLegend && (
                  <>
                    {/* Invisible Backdrop to close on click outside */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowLegend(false)}
                      aria-hidden="true"
                    />
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 w-48 p-3 rounded-2xl bg-white shadow-[0_10px_40px_-10px_rgba(3,4,94,0.3)] border border-[#caf0f8]"
                    >
                      {/* Triangle Pointer */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white" />
                      
                      <div className="space-y-2.5">
                        {[
                          { color: "#00b4d8", label: "Green (85%+)", desc: "Safe Attendance" },
                          { color: "#F59E0B", label: "Yellow (75-84%)", desc: "Warning Zone" },
                          { color: "#EF4444", label: "Red (<75%)", desc: "Critical Attendance" }
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <div className="w-2.5 h-2.5 rounded-full mt-0.5 flex-shrink-0" style={{ backgroundColor: item.color }} />
                            <div>
                              <p className="text-[10px] font-extrabold text-[#03045e] leading-none mb-0.5">{item.label}</p>
                              <p className="text-[9px] font-bold text-gray-400 leading-tight">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Status pill */}
        <motion.div
          className={`px-4 py-1.5 rounded-full text-sm font-semibold ${bgClass} ${colorClass}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
        >
          {t(`status.${status}`)}
        </motion.div>


      </MainCard>

      <HelperPopup
        isOpen={showHelper}
        onClose={() => setShowHelper(false)}
        titleKey="attendance.title"
        contentEn={HELPER_CONTENT_EN}
        contentHi={HELPER_CONTENT_HI}
        colorLegend={ATTENDANCE_COLOR_LEGEND}
      />
    </>
  );
}

export default AttendanceCard;
