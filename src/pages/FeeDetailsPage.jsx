import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { useStudent } from "../context/StudentContext";
import ChildScopeSwitcher from "../components/parent/ChildScopeSwitcher";
import HelperButton from "../components/HelperButton";
import HelperPopup from "../components/HelperPopup";
import MainCard from "../components/MainCard";
import {
  Wallet,
  FileText,
  Receipt,
  Award,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  Clock,
  Calendar,
  Layers,
  Info
} from "lucide-react";
import { getFeeDetails } from "../services/financeService";
import { useService } from "../hooks/useService";

const pageVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const tabContentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15, ease: "easeIn" } },
};

const HELPER_CONTENT_EN = "This module provides a mathematically consistent breakdown of your school fees. 'Total Fees Due' represents the sum of Term 1 Fees, Term 2 Fees, Transport Fees, and any Clubs & Activities Fees. Your 'Outstanding Balance' is calculated in real-time as Total Fees Due minus all Payments to Date.";
const HELPER_HI = "यह मॉड्यूल आपकी स्कूल फीस का गणितीय रूप से सुसंगत विवरण प्रदान करता है। 'कुल देय शुल्क' (Total Fees Due) टर्म 1, टर्म 2, परिवहन शुल्क और क्लब तथा गतिविधियों के शुल्क का योग दर्शाता है। आपका 'बकाया शेष' कुल देय शुल्क में से सभी भुगतान घटाकर निकाला जाता है।";

const STATUS_STYLE = {
  "Paid": { color: "#059669", bg: "#d1fae5", icon: CheckCircle },
  "Partially Paid": { color: "#d97706", bg: "#fef3c7", icon: Clock },
  "Pending": { color: "#dc2626", bg: "#fee2e2", icon: AlertCircle },
  "Overdue": { color: "#991b1b", bg: "#fef2f2", icon: AlertCircle },
  "Upcoming": { color: "#6b7280", bg: "#f3f4f6", icon: Calendar },
};

function FeeStructure({ structure }) {
  const { t, lang } = useLanguage();
  const [expandedId, setExpandedId] = useState(structure[0]?.id);

  return (
    <div className="space-y-4">
      {(structure || []).map((item) => {
        const isExpanded = expandedId === item.id;
        const style = STATUS_STYLE[item.status] || STATUS_STYLE.Upcoming;
        const Icon = style.icon;

        return (
          <motion.div
            key={item.id}
            className="bg-white rounded-2xl shadow-md overflow-hidden"
            style={{ outline: "1px solid #caf0f8" }}
            initial={false}
            animate={{ backgroundColor: isExpanded ? "#f8fafc" : "#ffffff" }}
          >
            <button
              onClick={() => setExpandedId(isExpanded ? null : item.id)}
              className="w-full px-5 py-5 flex items-center justify-between focus:outline-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: style.bg }}>
                  <Icon size={22} style={{ color: style.color }} />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-extrabold text-[#03045e]">{item.label}</h3>
                  <div 
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide mt-1 self-start w-fit"
                    style={{ backgroundColor: `${style.color}15`, color: style.color }}
                  >
                    {item.status}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block mr-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Planned Total</p>
                  <p className="font-black text-sm text-[#03045e]">₹{(item.total || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</p>
                </div>
                {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
              </div>
            </button>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-5 pb-5 pt-1"
                >
                  <div className="bg-white rounded-xl p-4 shadow-inner border border-gray-50 space-y-3">
                    {(item.components || []).map((comp, idx) => (
                      <div key={idx} className="flex justify-between items-center pb-2 border-b border-gray-50 last:border-0">
                        <span className="text-sm font-semibold text-gray-600">{comp.head}</span>
                        <span className="font-bold text-[#03045e]">₹{(comp.amount || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</span>
                      </div>
                    ))}
                    <div className="pt-3 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-400 uppercase">Amount Already Paid</span>
                        <span className="text-sm font-bold text-emerald-600">₹{(item.paidAmount || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-200">
                        <span className="text-base font-bold text-[#03045e]">Total Semester Fee</span>
                        <span className="text-lg font-black text-[#00b4d8]">₹{(item.total || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

function FeeBill({ bills }) {
  const { t, lang } = useLanguage();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {(bills || []).map(bill => {
        const isPaid = bill.status === "Paid";
        const style = STATUS_STYLE[bill.status] || STATUS_STYLE.Pending;
        
        return (
          <MainCard key={bill.id} className="p-5 flex flex-col gap-4 relative">
            {isPaid && (
              <div className="absolute top-0 right-0 bg-[#059669] text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase">
                {bill.status}
              </div>
            )}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-[#03045e] text-sm">{bill.targetLabel}</h3>
                <p className="text-[10px] font-black text-gray-400 mt-0.5 uppercase tracking-widest">{bill.invoiceNo}</p>
                <div className="flex items-center gap-1.5 mt-2">
                   <Clock size={12} className="text-gray-400" />
                   <p className="text-[11px] font-bold text-gray-500">{t("feeDetails.bill.dueDate")}: {bill.dueDate}</p>
                </div>
              </div>
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${style.color}15`, color: style.color }}>
                {isPaid ? <CheckCircle size={22} /> : <AlertCircle size={22} />}
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-gray-400 uppercase">Invoice Amount</span>
              <span className="text-3xl font-black text-[#03045e]">₹{(bill.amount || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-50/80 p-3 rounded-2xl border border-gray-100">
              <div className="flex-1">
                <span className="block text-[10px] font-black text-gray-400 uppercase mb-0.5">Amount Paid</span>
                <span className="text-emerald-600 font-black">₹{(bill.paidAmount || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</span>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="flex-1 text-right">
                <span className="block text-[10px] font-black text-gray-400 uppercase mb-0.5">Outstanding</span>
                <span className={`font-black ${isPaid ? "text-gray-400" : "text-[#dc2626]"}`}>₹{(bill.remainingAmount || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</span>
              </div>
            </div>

            {!isPaid && (
              <button className="w-full bg-[#03045e] hover:bg-[#0077b6] text-white text-sm font-black py-3 rounded-xl transition-all shadow-lg shadow-[#03045e]/10 mt-1">
                {t("feeDetails.bill.payNow") || "Pay Outstanding Amount"}
              </button>
            )}
          </MainCard>
        );
      })}
    </div>
  );
}

function FeeReceipt({ receipts }) {
  const { t, lang } = useLanguage();
  return (
    <div className="space-y-3">
      {(receipts || []).map(receipt => (
        <MainCard key={receipt.id} className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#059669]/10 rounded-xl text-[#059669]">
              <Receipt size={24} />
            </div>
            <div>
              <h3 className="font-bold text-[#03045e] text-sm">{receipt.receiptNo}</h3>
              <p className="text-[11px] font-bold text-gray-500 mt-0.5">{receipt.date} • {receipt.targetLabel} • {receipt.mode}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between w-full sm:w-auto gap-6">
            <div className="text-left sm:text-right">
              <p className="text-lg font-black text-[#059669]">₹{(receipt.amount || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</p>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{receipt.transactionId}</p>
            </div>
            <button className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 hover:bg-[#caf0f8] text-[#0077b6] transition-colors shadow-sm" aria-label={t("feeDetails.receipt.download")}>
              <Download size={18} />
            </button>
          </div>
        </MainCard>
      ))}
    </div>
  );
}

function ITCertificate({ cert }) {
  const { t, lang } = useLanguage();
  if (!cert || !cert.studentName) return null;
  return (
    <div className="flex justify-center">
      <motion.div 
        className="bg-white max-w-2xl w-full rounded-3xl p-6 md:p-8 shadow-md border border-gray-100 relative overflow-hidden"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
      >
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#caf0f8] rounded-full blur-2xl opacity-50"></div>
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#0077b6] rounded-full blur-2xl opacity-10"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center border-b-2 border-dashed border-gray-100 pb-6 mb-6">
          <div className="p-3 bg-[#03045e] rounded-2xl text-white mb-4 shadow-lg shadow-[#03045e]/20">
            <Award size={32} />
          </div>
          <h2 className="text-xl md:text-2xl font-black text-[#03045e]">{t("feeDetails.tab.itCertificate")}</h2>
          <p className="text-sm font-semibold text-gray-500 mt-1">{t("feeDetails.itCertificate.desc")}</p>
        </div>

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4 mb-8 text-left">
          <div>
            <p className="text-xs font-black text-gray-400 mb-1 uppercase tracking-tighter">{t("feeDetails.itCertificate.studentName")}</p>
            <p className="font-bold text-[#03045e]">{cert.studentName}</p>
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 mb-1 uppercase tracking-tighter">{t("feeDetails.itCertificate.rollNo")}</p>
            <p className="font-bold text-[#03045e]">{cert.rollNo}</p>
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 mb-1 uppercase tracking-tighter">{t("feeDetails.itCertificate.year")}</p>
            <p className="font-bold text-[#03045e]">{cert.year}</p>
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 mb-1 uppercase tracking-tighter">{t("feeDetails.itCertificate.dateGenerated")}</p>
            <p className="font-bold text-[#03045e]">{cert.dateGenerated}</p>
          </div>
        </div>

        <div className="relative z-10 bg-[#f8fafc] rounded-2xl p-5 flex justify-between items-center mb-8 border border-gray-100">
          <span className="font-bold text-[#03045e] uppercase text-sm tracking-tight">{t("feeDetails.itCertificate.totalPaid")}</span>
          <span className="text-2xl font-black text-[#059669]">₹{(cert.totalPaid || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</span>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row gap-3">
          <button className="flex-1 bg-[#00b4d8] hover:bg-[#0077b6] text-white font-black py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#00b4d8]/20">
            <Download size={20} />
            {t("feeDetails.itCertificate.download")}
          </button>
          <button className="flex-1 bg-white hover:bg-gray-50 text-[#03045e] border-2 border-[#03045e]/10 font-black py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
            <Printer size={20} />
            {t("feeDetails.itCertificate.print")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function MiscInvoice({ invoices }) {
  const { t, lang } = useLanguage();
  
  if (!invoices || invoices.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center">
        <div className="p-4 bg-[#caf0f8] rounded-full text-[#00b4d8] mb-4">
          <FileSpreadsheet size={32} />
        </div>
        <p className="font-bold text-[#03045e]">{t("feeDetails.miscInvoice.empty")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {invoices.map(inv => {
        const isPaid = inv.status === "Paid";
        const style = STATUS_STYLE[inv.status] || STATUS_STYLE.Pending;
        return (
          <MainCard key={inv.id} 
            className="overflow-hidden flex flex-col transition-shadow duration-200 hover:shadow-lg">
            <div className="p-5 flex flex-col gap-4 flex-1">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ backgroundColor: style.bg, color: style.color }}>
                  <span className="text-[11px] font-extrabold uppercase tracking-wide">
                    {inv.status}
                  </span>
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{inv.invoiceNo}</span>
              </div>
              
              <div>
                <h3 className="text-base font-extrabold text-[#03045e] leading-tight">{inv.targetLabel}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <div className="p-1 rounded-lg" style={{ backgroundColor: "#caf0f8" }}>
                    <Calendar size={12} style={{ color: "#0077b6" }} />
                  </div>
                  <span className="text-[11px] font-bold text-gray-500 uppercase">Due: {inv.dueDate}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                <span className="text-xl font-black text-[#03045e]">₹{(inv.amount || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</span>
                {!isPaid && (
                  <button className="bg-[#03045e] text-white text-[11px] font-black px-4 py-2 rounded-xl hover:opacity-90 transition-all shadow-sm uppercase tracking-wider">
                    {t("feeDetails.miscInvoice.payNow") || "Pay Now"}
                  </button>
                )}
              </div>
            </div>
          </MainCard>
        );
      })}
    </div>
  );
}

export default function FeeDetailsPage() {
  const { t, lang } = useLanguage();
  const { activeStudentId } = useStudent();
  const [activeTab, setActiveTab] = useState("structure");
  const [showHelper, setShowHelper] = useState(false);
  const [showFeeBreakdown, setShowFeeBreakdown] = useState(false);
  const { data: feeDetails, loading, error } = useService(getFeeDetails, [activeStudentId], [activeStudentId]);

  if (error) throw error;

  const { isParent: isParentMode } = useAuth();

  const tabs = [
    { id: "structure", label: "Fee Structure", icon: Layers },
    { id: "bill", label: "Pending Bills", icon: FileText },
    { id: "receipt", label: "Fee Receipts", icon: Receipt },
    { id: "itCertificate", label: "IT Certificate", icon: Award },
    { id: "miscInvoice", label: "Misc Invoices", icon: FileSpreadsheet },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "structure": return <FeeStructure structure={feeDetails?.structure || []} />;
      case "bill": return <FeeBill bills={feeDetails?.pendingBills || []} />;
      case "receipt": return <FeeReceipt receipts={feeDetails?.receipts || []} />;
      case "itCertificate": return <ITCertificate cert={feeDetails?.itCertificate || {}} />;
      case "miscInvoice": return <MiscInvoice invoices={feeDetails?.miscInvoices || []} />;
      default: return null;
    }
  };

  const summary = feeDetails?.summary || { totalFees: 0, totalPaid: 0, outstandingBalance: 0 };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl shadow-sm flex-shrink-0" style={{ backgroundColor: "#03045e" }}>
            <Wallet size={31} className="text-white" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-black truncate" style={{ color: "#03045e" }}>
              {t("feeDetails.title")}
            </h1>
            <p className="text-sm text-gray-500 truncate">
              {isParentMode 
                ? t("feeDetails.desc.parent")
                : t("feeDetails.desc.student")}
            </p>
          </div>
        </div>

        <div className="flex-shrink-0 ml-auto">
          <HelperButton onClick={() => setShowHelper(true)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="flex flex-col gap-3 p-5 rounded-2xl bg-white shadow-sm transition-all" style={{ outline: "1px solid #caf0f8" }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#f1f5f9" }}>
              <Layers size={24} style={{ color: "#475569" }} />
            </div>
            <div>
              <span className="text-xl font-black block leading-none text-[#03045e]">₹{(summary.totalFees || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</span>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Total Fees Due</span>
                <button 
                  onClick={() => setShowFeeBreakdown(!showFeeBreakdown)} 
                  className="text-gray-400 hover:text-[#00b4d8] transition-colors p-0.5"
                  title="View fee breakdown"
                  aria-label="View fee breakdown"
                >
                  <Info size={13} />
                </button>
              </div>
            </div>
          </div>
          <AnimatePresence>
            {showFeeBreakdown && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden border-t border-gray-100 pt-3 mt-1 text-xs text-[#03045e] space-y-2"
              >
                <p className="font-extrabold text-[9px] text-gray-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Relational Bill Components</span>
                  <span className="text-[#00b4d8] normal-case">Verified MockDB</span>
                </p>
                {(feeDetails?.structure || []).map((item) => (
                  <div key={item.id} className="flex justify-between font-semibold">
                    <span className="text-gray-500">{item.label}</span>
                    <span className="font-bold text-[#03045e]">₹{item.total.toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-dashed border-gray-200 flex justify-between font-black text-[#00b4d8]">
                  <span>Total Calculated</span>
                  <span>₹{summary.totalFees.toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-white shadow-sm" style={{ outline: "1px solid #caf0f8" }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#d1fae5" }}>
            <CheckCircle size={24} style={{ color: "#059669" }} />
          </div>
          <div>
            <span className="text-xl font-black block leading-none text-emerald-600">₹{(summary.totalPaid || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1.5 block">Total Paid to Date</span>
          </div>
        </div>
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-white shadow-sm" style={{ outline: "1px solid #dc262620" }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#fee2e2" }}>
            <AlertCircle size={24} style={{ color: "#dc2626" }} />
          </div>
          <div>
            <span className="text-xl font-black block leading-none text-[#dc2626]">₹{(summary.outstandingBalance || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1.5 block">Outstanding Balance</span>
          </div>
        </div>
      </div>

      <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-[11px] uppercase tracking-wider transition-all ${
                  isActive 
                  ? "bg-[#03045e] text-white shadow-lg shadow-[#03045e]/20" 
                  : "bg-white text-gray-500 hover:bg-[#caf0f8] hover:text-[#0077b6] border border-gray-100"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={tabContentVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="min-h-[400px]"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>

      <HelperPopup
        isOpen={showHelper}
        onClose={() => setShowHelper(false)}
        titleKey="feeDetails.title"
        contentEn={HELPER_CONTENT_EN}
        contentHi={HELPER_HI}
      />
    </motion.div>
  );
}
