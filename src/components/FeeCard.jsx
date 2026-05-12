import React, { useState } from "react";
import MainCard from "./MainCard";
import { motion } from "framer-motion";
import {
  Calendar,
  Wallet,
  CheckCircle,
  AlertOctagon,
  AlertTriangle,
} from "lucide-react";
import { getFeeStatusStyle, getFeeProgress } from "../utils/attendanceHelpers";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import HelperPopup from "./HelperPopup";
import HelperButton from "./HelperButton";

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

const HELPER_CONTENT_EN =
  "This section shows the fee payment status for the semester. Fees must be paid by the due date to avoid penalties or academic holds.";
const HELPER_CONTENT_HI =
  "यह अनुभाग सेमेस्टर की फीस भुगतान स्थिति दिखाता है। जुर्माने या शैक्षणिक रोक से बचने के लिए नियत तारीख तक फीस का भुगतान करना आवश्यक है।";

const FEE_COLOR_LEGEND = [
  {
    color: "#00b4d8",
    labelEn: "Green — Fees have been paid. No action needed.",
    labelHi: "हरा — फीस का भुगतान हो गया है। कोई कार्रवाई आवश्यक नहीं।",
  },
  {
    color: "#F59E0B",
    labelEn: "Yellow — Fees are pending. Please pay before the due date.",
    labelHi: "पीला — फीस बकाया है। कृपया नियत तारीख से पहले भुगतान करें।",
  },
  {
    color: "#EF4444",
    labelEn: "Red — Fees are overdue. Immediate payment required.",
    labelHi: "लाल — फीस की अंतिम तिथि निकल गई है। तुरंत भुगतान आवश्यक है।",
  },
];

const TRAFFIC_COLOR = {
  paid: "#00b4d8",
  unpaid: "#F59E0B",
  overdue: "#EF4444",
};

function TrafficLight({ status }) {
  const color = TRAFFIC_COLOR[status] ?? TRAFFIC_COLOR.unpaid;
  return (
    <div
      className="w-4 h-4 rounded-full flex-shrink-0"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  );
}

const getFeeStatus = (status) => {
  const map = {
    unpaid: {
      color: "text-orange-500",
      bg: "bg-orange-50",
      messageKey: "fees.parentUnpaid",
    },
    paid: {
      color: "text-green-500",
      bg: "bg-green-50",
      messageKey: "fees.parentPaid",
    },
    overdue: {
      color: "text-red-500",
      bg: "bg-red-50",
      messageKey: "fees.parentOverdue",
    },
  };
  return map[status] || map.unpaid;
};

function FeeCard({
  amount,
  currency = "₹",
  dueDate,
  status,
  amountPaid,
  totalAmount,
  onClick,
}) {
  const { t, lang } = useLanguage();
  const { isParent: isParentMode } = useAuth();
  const [showHelper, setShowHelper] = useState(false);

  const { bgClass, textClass } = getFeeStatusStyle(status);
  const progress = getFeeProgress(amountPaid, totalAmount);
  const isPaid = status === "paid";
  const feeStatus = getFeeStatus(status);

  const formattedAmount = amount.toLocaleString(lang === "hi" ? "hi-IN" : "en-IN");
  const formattedPaid = amountPaid.toLocaleString(lang === "hi" ? "hi-IN" : "en-IN");
  const formattedTotal = totalAmount.toLocaleString(lang === "hi" ? "hi-IN" : "en-IN");

  const amountColorMap = {
    paid: "text-[#00b4d8]",
    unpaid: "text-[#0077b6]",
    overdue: "text-red-500",
  };
  const amountColor = amountColorMap[status] ?? "text-[#0077b6]";

  const barColorMap = {
    paid: "bg-[#00b4d8]",
    unpaid: "bg-[#0077b6]",
    overdue: "bg-red-400",
  };
  const barColor = barColorMap[status] ?? "bg-[#0077b6]";

  const StatusIcon = isPaid
    ? CheckCircle
    : status === "overdue"
      ? AlertOctagon
      : AlertTriangle;

  const parentStatusLabel = {
    paid: t("fees.paid"),
    unpaid: t("fees.actionNeeded"),
    overdue: t("fees.actionNeeded"),
  };

  return (
    <>
      <MainCard
        variants={cardVariants}
        onClick={onClick}
        className={`h-full p-7 flex flex-col select-none relative overflow-hidden ${onClick ? "cursor-pointer" : "cursor-default"}`}
        aria-label={`Fee status: ${status}. Amount due: ${currency}${formattedAmount}`}
      >
        {/* Header Row: Title on Left, Helper on Right */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-2xl"
              style={{ backgroundColor: "#caf0f8" }}
            >
              <Wallet size={26} style={{ color: "#03045e" }} aria-hidden="true" />
            </div>
            <h2 className="text-lg font-extrabold" style={{ color: "#03045e" }}>
              {t("fees.title")}
            </h2>
          </div>
          <HelperButton onClick={(e) => { e.stopPropagation(); setShowHelper(true); }} />
        </div>

        {/* Status Row (Action Needed Indicator) */}
        {!isPaid && (
          <div
            className="flex items-center gap-2 mb-6 ml-1"
            aria-label="Payment pending status"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-widest text-red-500/80">
              {t("fees.actionNeeded")}
            </span>
          </div>
        )}

        {/* Amount Section (PRIMARY) */}
        <div className="flex flex-col gap-1 mb-6">
          <div className="flex items-baseline gap-2">
            <motion.span
              className={`text-5xl font-black ${amountColor} tracking-tight leading-none`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            >
              <span className="text-3xl mr-0.5">{currency}</span>
              {formattedAmount}
            </motion.span>
          </div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
            {t("fees.outstanding")}
          </span>
        </div>

        {/* Metadata Row: Due Date + Badge */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
          <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
            <Calendar size={18} className="text-[#0077b6]" aria-hidden="true" />
            <span className="text-xs font-extrabold">
              {t("fees.due")}: <span className="text-gray-800">{dueDate}</span>
            </span>
          </div>

          <motion.div
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${bgClass} ${textClass}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <StatusIcon size={14} aria-hidden="true" />
            {t(`status.${status}`)}
          </motion.div>
        </div>

        {isParentMode && (
          <motion.div
            className="flex flex-col gap-3 mb-8"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.5 }}
          >
            <div className="flex items-center gap-2 px-1">
              <TrafficLight status={status} />
              <span
                className="text-xs font-black uppercase tracking-wider"
                style={{ color: TRAFFIC_COLOR[status] }}
              >
                {parentStatusLabel[status]}
              </span>
            </div>
            <p
              className="text-xs font-bold leading-relaxed rounded-2xl px-4 py-3 border border-[#00b4d8]/20"
              style={{ backgroundColor: "#caf0f8", color: "#03045e" }}
            >
              {t(feeStatus.messageKey)}
            </p>
          </motion.div>
        )}

        {/* Progress Area */}
        <div className="space-y-3 mt-auto pt-4 border-t border-gray-50">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {t("fees.paid")}
              </p>
              <p className="text-base font-black text-[#03045e]">
                {currency}{formattedPaid}
              </p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {t("fees.total")}
              </p>
              <p className="text-sm font-extrabold text-gray-500">
                {currency}{formattedTotal}
              </p>
            </div>
          </div>

          <div className="relative">
            <div
              className="w-full h-3 rounded-full overflow-hidden"
              style={{ backgroundColor: "#caf0f8" }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <motion.div
                className={`h-full rounded-full shadow-sm ${barColor}`}
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.6 }}
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-[#0077b6] uppercase tracking-widest">
              {progress}% {t("fees.paid")}
            </span>
          </div>
        </div>
      </MainCard>

      <HelperPopup
        isOpen={showHelper}
        onClose={() => setShowHelper(false)}
        titleKey="fees.title"
        contentEn={HELPER_CONTENT_EN}
        contentHi={HELPER_CONTENT_HI}
        colorLegend={FEE_COLOR_LEGEND}
      />
    </>
  );
}

export default FeeCard;
