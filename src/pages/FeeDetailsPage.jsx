import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import HelperButton from "../components/HelperButton";
import HelperPopup from "../components/HelperPopup";
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
  Calendar
} from "lucide-react";

const pageVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const tabContentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15, ease: "easeIn" } },
};

const HELPER_CONTENT_EN = "This module provides a complete breakdown of your fees, including past receipts, pending bills, and IT certificates for tax purposes.";
const HELPER_CONTENT_HI = "यह मॉड्यूल आपकी फीस का पूरा विवरण प्रदान करता है, जिसमें पिछली रसीदें, बकाया बिल और कर उद्देश्यों के लिए आईटी प्रमाणपत्र शामिल हैं।";

// ---- Subcomponents for Tabs ----

function FeeStructure({ structure }) {
  const { t, lang } = useLanguage();
  const [expandedId, setExpandedId] = useState(structure[0]?.id);

  return (
    <div className="space-y-4">
      {structure.map((item) => {
        const isExpanded = expandedId === item.id;
        const isPaid = item.status === "paid";
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
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isPaid ? "bg-[#d1fae5]" : "bg-[#fef3c7]"}`}>
                  <Wallet size={22} className={isPaid ? "text-[#059669]" : "text-[#d97706]"} />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-extrabold text-[#03045e]">{item.semester}</h3>
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide mt-1 self-start w-fit ${isPaid ? "bg-[#059669]/10 text-[#059669]" : "bg-[#d97706]/10 text-[#d97706]"}`}>
                    {item.status}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-black text-lg text-[#03045e]">₹{(item.total || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</span>
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
                  <div className="bg-white rounded-xl p-4 shadow-inner border border-gray-50">
                    <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100">
                      <span className="text-sm font-semibold text-gray-600">{t("feeDetails.structure.academicFee")}</span>
                      <span className="font-bold text-[#03045e]">₹{(item.academicFee || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</span>
                    </div>
                    <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-100">
                      <span className="text-sm font-semibold text-gray-600">{t("feeDetails.structure.hostelFee")}</span>
                      <span className="font-bold text-[#03045e]">₹{(item.hostelFee || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold text-[#03045e]">{t("feeDetails.structure.total")}</span>
                      <span className="text-base font-black text-[#00b4d8]">₹{(item.total || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</span>
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
      {bills.map(bill => {
        const isPaid = bill.status === "paid";
        return (
          <motion.div key={bill.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4 relative overflow-hidden">
            {isPaid && (
              <div className="absolute top-0 right-0 bg-[#00b4d8] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                {t("fees.paid").toUpperCase()}
              </div>
            )}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-[#03045e] text-sm">{t("feeDetails.bill.billNo")}: {bill.billNo}</h3>
                <p className="text-xs font-semibold text-gray-400 mt-0.5">{t("feeDetails.bill.dueDate")}: {bill.dueDate}</p>
              </div>
              <div className={`p-2 rounded-xl ${isPaid ? "bg-[#00b4d8]/10 text-[#00b4d8]" : "bg-[#EF4444]/10 text-[#EF4444]"}`}>
                {isPaid ? <CheckCircle size={22} /> : <AlertCircle size={22} />}
              </div>
            </div>
            
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-black text-[#03045e]">₹{(bill.amount || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-50 p-2.5 rounded-xl">
              <div className="flex-1">
                <span className="block text-gray-400 mb-0.5">{t("feeDetails.bill.paidAmount")}</span>
                <span className="text-[#00b4d8]">₹{(bill.paidAmount || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</span>
              </div>
              <div className="w-px h-6 bg-gray-200"></div>
              <div className="flex-1 text-right">
                <span className="block text-gray-400 mb-0.5">{t("feeDetails.bill.remainingAmount")}</span>
                <span className={isPaid ? "text-gray-500" : "text-[#EF4444]"}>₹{(bill.remainingAmount || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</span>
              </div>
            </div>

            {!isPaid && (
              <div className="mt-2 flex gap-2">
                <button className="flex-1 bg-[#00b4d8] hover:bg-[#0077b6] text-white font-bold py-2.5 rounded-xl transition-colors shadow-md shadow-[#00b4d8]/20">
                  {t("feeDetails.bill.payNow")}
                </button>
              </div>
            )}
            {bill.emiAvailable && !isPaid && (
              <p className="text-center text-[10px] font-bold text-[#0077b6]">{t("feeDetails.bill.emiAvailable")}</p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

function FeeReceipt({ receipts }) {
  const { t, lang } = useLanguage();
  return (
    <div className="space-y-3">
      {receipts.map(receipt => (
        <div key={receipt.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#00b4d8]/10 rounded-xl text-[#00b4d8]">
              <Receipt size={24} />
            </div>
            <div>
              <h3 className="font-bold text-[#03045e] text-sm">{receipt.receiptNo}</h3>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">{receipt.date} • {receipt.for}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between w-full sm:w-auto gap-4">
            <div className="text-left sm:text-right">
              <p className="font-black text-[#00b4d8]">₹{(receipt.amount || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</p>
              <p className="text-[10px] font-bold text-gray-400">{receipt.mode}</p>
            </div>
            <button className="flex items-center justify-center p-2 rounded-xl bg-gray-50 hover:bg-[#caf0f8] text-[#0077b6] transition-colors" aria-label={t("feeDetails.receipt.download")}>
              <Download size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ITCertificate({ cert }) {
  const { t, lang } = useLanguage();
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

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4 mb-8">
          <div>
            <p className="text-xs font-bold text-gray-400 mb-1">{t("feeDetails.itCertificate.studentName")}</p>
            <p className="font-bold text-[#03045e]">{cert.studentName}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 mb-1">{t("feeDetails.itCertificate.rollNo")}</p>
            <p className="font-bold text-[#03045e]">{cert.rollNo}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 mb-1">{t("feeDetails.itCertificate.year")}</p>
            <p className="font-bold text-[#03045e]">{cert.year}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 mb-1">{t("feeDetails.itCertificate.dateGenerated")}</p>
            <p className="font-bold text-[#03045e]">{cert.dateGenerated}</p>
          </div>
        </div>

        <div className="relative z-10 bg-[#caf0f8]/50 rounded-2xl p-5 flex justify-between items-center mb-8">
          <span className="font-bold text-[#03045e]">{t("feeDetails.itCertificate.totalPaid")}</span>
          <span className="text-2xl font-black text-[#00b4d8]">₹{(cert.totalPaid || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</span>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row gap-3">
          <button className="flex-1 bg-[#00b4d8] hover:bg-[#0077b6] text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md shadow-[#00b4d8]/20">
            <Download size={20} />
            {t("feeDetails.itCertificate.download")}
          </button>
          <button className="flex-1 bg-white hover:bg-gray-50 text-[#03045e] border-2 border-[#03045e]/10 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
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
        const isPaid = inv.status === "paid";
        return (
          <motion.div key={inv.id} 
            className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col transition-shadow duration-200 hover:shadow-lg"
            style={{ outline: "1px solid #caf0f8" }}>
            <div className={`h-1.5 w-full ${isPaid ? "bg-[#059669]" : "bg-[#d97706]"}`} />
            <div className="p-5 flex flex-col gap-4 flex-1">
              <div className="flex justify-between items-start">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${isPaid ? "bg-[#d1fae5] text-[#059669]" : "bg-[#fef3c7] text-[#d97706]"}`}>
                  {isPaid ? <CheckCircle size={14} /> : <Clock size={14} />}
                  <span className="text-[11px] font-extrabold uppercase tracking-wide">
                    {inv.status}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-gray-400">{inv.invoiceNo}</span>
              </div>
              
              <div>
                <h3 className="text-base font-extrabold text-[#03045e] leading-tight">{inv.type}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <div className="p-1 rounded-lg" style={{ backgroundColor: "#caf0f8" }}>
                    <Calendar size={12} style={{ color: "#0077b6" }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-600">{t("feeDetails.miscInvoice.dueDate")}: {inv.dueDate}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                <span className="text-xl font-black text-[#03045e]">₹{(inv.amount || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</span>
                {!isPaid && (
                  <button className="bg-[#03045e] text-white text-sm font-extrabold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all shadow-sm">
                    {t("feeDetails.miscInvoice.payNow")}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ---- Main Page Component ----

export default function FeeDetailsPage({ feeDetails }) {
  const { t, lang } = useLanguage();
  const [activeTab, setActiveTab] = useState("structure");
  const [showHelper, setShowHelper] = useState(false);

  const { isParent: isParentMode } = useAuth();

  const tabs = [
    { id: "structure", label: t("feeDetails.tab.structure"), icon: Wallet },
    { id: "bill", label: t("feeDetails.tab.bill"), icon: FileText },
    { id: "receipt", label: t("feeDetails.tab.receipt"), icon: Receipt },
    { id: "itCertificate", label: t("feeDetails.tab.itCertificate"), icon: Award },
    { id: "miscInvoice", label: t("feeDetails.tab.miscInvoice"), icon: FileSpreadsheet },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "structure": return <FeeStructure structure={feeDetails?.structure || []} />;
      case "bill": return <FeeBill bills={feeDetails?.bills || []} />;
      case "receipt": return <FeeReceipt receipts={feeDetails?.receipts || []} />;
      case "itCertificate": return <ITCertificate cert={feeDetails?.itCertificate || {}} />;
      case "miscInvoice": return <MiscInvoice invoices={feeDetails?.miscInvoices || []} />;
      default: return null;
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-2xl shadow-sm flex-shrink-0" style={{ backgroundColor: "#03045e" }}>
          <Wallet size={31} className="text-white" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-black" style={{ color: "#03045e" }}>
            {t("feeDetails.title")}
          </h1>
          <p className="text-sm text-gray-500">
            {isParentMode 
              ? t("feeDetails.desc.parent")
              : t("feeDetails.desc.student")}
          </p>
        </div>
        <div className="ml-auto">
          <HelperButton onClick={() => setShowHelper(true)} />
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white shadow-sm" style={{ outline: "1px solid #caf0f8" }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#fef3c7" }}>
            <Wallet size={24} style={{ color: "#d97706" }} />
          </div>
          <div>
            <span className="text-xl font-black block leading-none" style={{ color: "#03045e" }}>₹{(feeDetails?.balance || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1 block">{t("fees.summary.balance")}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white shadow-sm" style={{ outline: "1px solid #caf0f8" }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#d1fae5" }}>
            <CheckCircle size={24} style={{ color: "#059669" }} />
          </div>
          <div>
            <span className="text-xl font-black block leading-none" style={{ color: "#03045e" }}>₹{(feeDetails?.totalPaid || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1 block">{t("fees.summary.totalPaid")}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white shadow-sm" style={{ outline: "1px solid #caf0f8" }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#fee2e2" }}>
            <AlertCircle size={24} style={{ color: "#dc2626" }} />
          </div>
          <div>
            <span className="text-xl font-black block leading-none" style={{ color: "#03045e" }}>₹{(feeDetails?.pending || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1 block">{t("fees.summary.pending")}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-all ${
                  isActive 
                  ? "bg-[#03045e] text-white shadow-md" 
                  : "bg-white text-gray-500 hover:bg-[#caf0f8] hover:text-[#0077b6] border border-gray-100"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
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
        contentHi={HELPER_CONTENT_HI}
      />
    </motion.div>
  );
}
