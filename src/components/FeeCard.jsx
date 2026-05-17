import React, { useState } from "react";
import MainCard from "./MainCard";
import { motion } from "framer-motion";
import {
  Calendar,
  Wallet,
  CheckCircle,
  AlertOctagon,
  AlertTriangle,
  Clock,
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
  "This section shows the mathematically consistent fee status. Outstanding Balance = Total Fees - Total Paid. This reflects all verified invoices and receipts.";
const HELPER_CONTENT_HI =
  "यह अनुभाग गणितीय रूप से सुसंगत फीस स्थिति दिखाता है। बकाया शेष = कुल फीस - कुल भुगतान।";

const FEE_COLOR_LEGEND = [
  {
    color: "#059669",
    labelEn: "Green — All currently due fees have been fully paid.",
    labelHi: "हरा — वर्तमान में देय सभी फीस का पूर्ण भुगतान हो गया है।",
  },
  {
    color: "#D97706",
    labelEn: "Yellow — Fees are partially paid or pending.",
    labelHi: "पीला — फीस का आंशिक भुगतान हुआ है या बकाया है।",
  },
  {
    color: "#DC2626",
    labelEn: "Red — Fees are overdue. Immediate attention required.",
    labelHi: "लाल — फीस की देय तिथि निकल गई है। तुरंत ध्यान दें।",
  },
];

const TRAFFIC_COLOR = {
  Paid: "#059669",
  "Partially Paid": "#D97706",
  Pending: "#0077b6",
  Overdue: "#DC2626",
};

function TrafficLight({ status }) {
  const color = TRAFFIC_COLOR[status] ?? TRAFFIC_COLOR.Pending;
  return (
    <div
      className="w-4 h-4 rounded-full flex-shrink-0"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  );
}

const getFeeStatusDetails = (status) => {
  const map = {
    "Pending": {
      color: "text-[#0077b6]",
      bg: "bg-[#caf0f8]",
      messageKey: "fees.parentUnpaid",
      icon: Clock
    },
    "Partially Paid": {
      color: "text-orange-500",
      bg: "bg-orange-50",
      messageKey: "fees.parentUnpaid",
      icon: Clock
    },
    "Paid": {
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      messageKey: "fees.parentPaid",
      icon: CheckCircle
    },
    "Overdue": {
      color: "text-red-500",
      bg: "bg-red-50",
      messageKey: "fees.parentOverdue",
      icon: AlertOctagon
    },
  };
  return map[status] || map.Pending;
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
  const isPaid = status === "Paid";
  const details = getFeeStatusDetails(status);

  const formattedAmount = (amount || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN");
  const formattedPaid = (amountPaid || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN");
  const formattedTotal = (totalAmount || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN");

  const StatusIcon = details.icon;

  const parentStatusLabel = {
    Paid: t("fees.paid"),
    "Partially Paid": t("fees.actionNeeded"),
    Pending: t("fees.actionNeeded"),
    Overdue: t("fees.actionNeeded"),
  };

  return (
    <>
      <MainCard
        variants={cardVariants}
        onClick={onClick}
        className={`h-full p-7 flex flex-col select-none relative overflow-hidden ${onClick ? "cursor-pointer" : "cursor-default"}`}
        aria-label={`Fee status: ${status}. Outstanding: ${currency}${formattedAmount}`}
      >
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

        {!isPaid && (
          <div
            className="flex items-center gap-2 mb-6 ml-1"
            aria-label="Payment pending status"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status === "Overdue" ? "bg-red-400" : "bg-orange-400"}`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${status === "Overdue" ? "bg-red-500" : "bg-orange-500"}`} />
            </span>
            <span className={`text-[11px] font-black uppercase tracking-widest ${status === "Overdue" ? "text-red-500" : "text-orange-500"}`}>
              {t("fees.actionNeeded")}
            </span>
          </div>
        )}

        <div className="flex flex-col gap-1 mb-6">
          <div className="flex items-baseline gap-2">
            <motion.span
              className={`text-5xl font-black tracking-tight leading-none ${isPaid ? "text-emerald-600" : status === "Overdue" ? "text-red-600" : "text-[#03045e]"}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            >
              <span className="text-3xl mr-0.5">{currency}</span>
              {formattedAmount}
            </motion.span>
          </div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
            Outstanding Balance
          </span>
        </div>

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
            {status}
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
              {t(details.messageKey)}
            </p>
          </motion.div>
        )}

        <div className="space-y-3 mt-auto pt-4 border-t border-gray-50">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {t("fees.paid")}
              </p>
              <p className="text-base font-black text-emerald-600">
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
              style={{ backgroundColor: "#f1f5f9" }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <motion.div
                className={`h-full rounded-full shadow-sm ${isPaid ? "bg-emerald-500" : "bg-[#03045e]"}`}
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

export default React.memo(FeeCard);
