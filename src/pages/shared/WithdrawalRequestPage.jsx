import React, { useState, useEffect, useCallback } from "react";
import MainCard from "../../components/MainCard";
import { useStudent } from "../../context/StudentContext";
import ChildScopeSwitcher from "../../components/parent/ChildScopeSwitcher";
import { createRequest, getRequestsByStudent, getCompletionRecordByStudent } from "../../services/studentExitService";
import DocumentPreviewModal from "../../components/common/documents/DocumentPreviewModal";
import TransferCertificate from "../../components/common/documents/TransferCertificate";
import CharacterCertificate from "../../components/common/documents/CharacterCertificate";
import MigrationCertificate from "../../components/common/documents/MigrationCertificate";
import ClearanceForm from "../../components/common/documents/ClearanceForm";
import { generateMockCertificateNumber } from "../../utils/documentUtils";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileMinus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Paperclip, 
  FileText,
  Printer,
  Download,
  Eye,
  Info
} from "lucide-react";

const WithdrawalRequestPage = () => {
  const { activeStudentId, studentInfo } = useStudent();
  
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [remarks, setRemarks] = useState("");
  const [mockFile, setMockFile] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [requests, setRequests] = useState([]);
  const [completionRecord, setCompletionRecord] = useState(null);

  // TC Preview State
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDocType, setPreviewDocType] = useState(null);

  const loadRequests = useCallback(() => {
    if (!activeStudentId) return;
    setHistoryLoading(true);
    try {
      const data = getRequestsByStudent(activeStudentId);
      const sorted = [...data].sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));
      setRequests(sorted);
      
      const compRecord = getCompletionRecordByStudent(activeStudentId);
      setCompletionRecord(compRecord);
    } catch (err) {
      console.error("Failed to load requests:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, [activeStudentId]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const currentPendingRequest = requests.find(r => r.status === "Pending Review");
  const currentApprovedRequest = requests.find(r => r.status === "Approved");
  const activeRequest = currentPendingRequest || currentApprovedRequest || null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (activeRequest) {
       setError("You already have an active withdrawal request.");
       return;
    }

    const finalReason = reason === "Other" ? otherReason : reason;
    if (!finalReason) {
      setError("Please specify a reason.");
      return;
    }

    setLoading(true);

    try {
      createRequest({
        studentId: activeStudentId,
        reason: finalReason,
        remarks,
        attachment: mockFile ? mockFile.name : "",
      });

      setSuccessMsg("Withdrawal request submitted successfully!");
      setReason("");
      setOtherReason("");
      setRemarks("");
      setMockFile(null);
      
      loadRequests();
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      setError(err.message || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  const handleMockFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setMockFile({
        file: e.target.files[0],
        name: e.target.files[0].name,
        size: (e.target.files[0].size / 1024).toFixed(1) + " KB"
      });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const REASON_OPTIONS = [
    "Family Relocation",
    "Transfer to Another School",
    "Financial Reasons",
    "Medical Reasons",
    "Personal Reasons",
    "Other"
  ];

  const getProgressStage = (req) => {
    if (!req) return -1;
    if (req.status === "Rejected") return -1;
    if (req.status === "Approved") {
      if (req.documentsReadyForCollection) return 4;
      if (req.documentsPreparationStarted || req.originalClearanceReceived) return 3;
      if (req.clearanceFormIssued) return 2;
      return 1;
    }
    return 0;
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#03045e] text-white rounded-2xl shadow-md">
              <FileMinus size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#03045e]">Withdrawal Request</h1>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Apply for School Withdrawal & Track Status
              </p>
            </div>
          </div>
        </div>
        <ChildScopeSwitcher />
      </div>

      <div className="grid grid-cols-1 gap-8 items-start">
        <div className="space-y-6">
          
          {completionRecord && (
            <MainCard className="p-6 bg-emerald-50 border border-emerald-100 flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <CheckCircle2 size={24} className="text-emerald-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-sm font-black text-[#03045e]">School Completion Status</h3>
                  <p className="text-lg font-black text-emerald-600 mt-1 uppercase tracking-wider">
                    School Completed
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mt-4 mb-2">
                    <div>
                      <span className="block text-[9px] text-emerald-800/60 uppercase tracking-widest font-black">Completion Date</span>
                      <span className="text-xs font-bold text-emerald-900">{new Date(completionRecord.completedDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-emerald-800/60 uppercase tracking-widest font-black">Academic Year</span>
                      <span className="text-xs font-bold text-emerald-900">{completionRecord.academicYear}</span>
                    </div>
                  </div>
                  {completionRecord.remarks && (
                    <div className="mt-2">
                      <span className="block text-[9px] text-emerald-800/60 uppercase tracking-widest font-black">Remarks</span>
                      <span className="text-xs font-bold text-emerald-900 bg-emerald-100/50 px-3 py-2 rounded-lg inline-block mt-1">{completionRecord.remarks}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-emerald-200">
                <h4 className="text-xs font-black text-[#03045e] mb-4">Official Document Status</h4>
                {completionRecord.documentsReadyForCollection ? (
                  <div className="p-4 border border-emerald-200 bg-white rounded-xl flex items-start gap-3 shadow-sm">
                    <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest">Official Documents Ready for Collection</h4>
                      <p className="text-[10px] text-emerald-700 font-bold mt-1.5 leading-relaxed">
                        Your official school documents have been prepared, signed and sealed. Please visit the Administration Office during working hours to collect the original documents. Carry a valid identity proof if required.
                      </p>
                    </div>
                  </div>
                ) : completionRecord.documentsPreparationStarted ? (
                  <div className="p-4 border border-blue-200 bg-white rounded-xl flex items-start gap-3 shadow-sm">
                    <Clock size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-blue-800 uppercase tracking-widest">Official Documents Under Preparation</h4>
                      <p className="text-[10px] text-blue-700 font-bold mt-1.5 leading-relaxed">
                        Your clearance has been verified successfully. The Administration Office is preparing your official school documents. Once they have been printed, signed and sealed, you will be able to collect them from the Administration Office.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border border-gray-200 bg-gray-50 rounded-xl flex items-start gap-3">
                    <Info size={20} className="text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-gray-600 uppercase tracking-widest">Awaiting Verification</h4>
                      <p className="text-[10px] text-gray-500 font-bold mt-1.5">
                        Please wait for the administration to start preparing your official documents.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </MainCard>
          )}

          {activeRequest ? (
            <MainCard className="p-6 bg-blue-50 border border-blue-100 flex items-start gap-4">
              <Info size={24} className="text-[#00b4d8] flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-sm font-black text-[#03045e]">Request Under Review</h3>
                <p className="text-xs font-semibold text-[#03045e] mt-1">
                  You already have an active withdrawal request. You cannot submit another one at this time.
                </p>
              </div>
            </MainCard>
          ) : (
            <MainCard className="p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#caf0f8]/40 to-transparent rounded-bl-full pointer-events-none" />
              
              <h2 className="text-lg font-black text-[#03045e] mb-2 flex items-center gap-2">
                <FileMinus size={20} className="text-[#0077b6]" />
                Withdrawal Application
              </h2>
              <p className="text-xs font-semibold text-gray-400 mb-6 uppercase tracking-wider">
                Submit a new withdrawal request to administration.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-xs text-rose-600 font-bold"
                    >
                      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                  {successMsg && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2.5 text-xs text-emerald-600 font-bold"
                    >
                      <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
                      <span>{successMsg}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#03045e] uppercase tracking-wider">Reason</label>
                  <select
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold text-[#03045e] bg-gray-50 border border-gray-100 hover:border-gray-200 focus:border-[#00b4d8] focus:bg-white rounded-xl outline-none transition-all"
                  >
                    <option value="" disabled>Select a reason...</option>
                    {REASON_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>

                {reason === "Other" && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#03045e] uppercase tracking-wider">Specify Other Reason</label>
                    <input
                      type="text"
                      required
                      value={otherReason}
                      onChange={(e) => setOtherReason(e.target.value)}
                      placeholder="Please specify..."
                      className="w-full px-3 py-2 text-xs font-bold text-[#03045e] bg-gray-50 border border-gray-100 hover:border-gray-200 focus:border-[#00b4d8] focus:bg-white rounded-xl outline-none transition-all"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#03045e] uppercase tracking-wider">Remarks (Optional)</label>
                  <textarea
                    rows={4}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Provide any additional remarks..."
                    className="w-full px-3 py-2 text-xs font-bold text-[#03045e] bg-gray-50 border border-gray-100 hover:border-gray-200 focus:border-[#00b4d8] focus:bg-white rounded-xl outline-none resize-none transition-all placeholder:text-gray-300"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors relative cursor-pointer group">
                    <input
                      type="file"
                      onChange={handleMockFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Paperclip size={18} className="text-gray-400 group-hover:text-[#00b4d8] transition-colors" />
                    <span className="text-[10px] font-extrabold text-gray-400 group-hover:text-gray-500 uppercase tracking-wider">
                      {mockFile ? mockFile.name : "Attach Supporting Documents (Coming Soon)"}
                    </span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || !reason}
                  className="w-full mt-4 py-3 bg-gradient-to-r from-[#03045e] to-[#023e8a] hover:from-[#023e8a] hover:to-[#0077b6] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  Submit Application
                </motion.button>
              </form>
            </MainCard>
          )}

          {(activeRequest || (requests.length > 0 && requests[0].status === "Rejected")) && (
            <MainCard className="p-6">
              <h2 className="text-lg font-black text-[#03045e] mb-6 flex items-center gap-2">
                <FileText size={20} className="text-[#0077b6]" />
                Application Status
              </h2>

              {(() => {
                const reqToDisplay = activeRequest || requests[0];
                const stage = getProgressStage(reqToDisplay);
                
                return (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Applied Date</span>
                        <p className="text-sm font-black text-[#03045e]">{formatDate(reqToDisplay.appliedDate)}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Reason</span>
                        <p className="text-sm font-black text-[#03045e]">{reqToDisplay.reason}</p>
                      </div>
                      <div>
                        {reqToDisplay.status === "Pending Review" && (
                          <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                            <Clock size={12} /> Pending Review
                          </span>
                        )}
                        {reqToDisplay.status === "Approved" && (
                          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 size={12} /> Approved
                          </span>
                        )}
                        {reqToDisplay.status === "Rejected" && (
                          <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                            <XCircle size={12} /> Rejected
                          </span>
                        )}
                      </div>
                    </div>

                    {reqToDisplay.status === "Rejected" && (
                      <div className="space-y-3 mt-2">
                        {reqToDisplay.reasonCategory && (
                          <div>
                            <span className="text-[10px] font-black text-rose-400 uppercase tracking-wider">Reason</span>
                            <p className="text-xs font-semibold text-rose-600 mt-1 p-3 bg-rose-50/50 rounded-xl border border-rose-100/50">{reqToDisplay.reasonCategory}</p>
                          </div>
                        )}
                        {reqToDisplay.reviewRemarks && (
                          <div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Remarks</span>
                            <p className="text-xs font-semibold text-[#03045e] mt-1 p-3 bg-gray-50 rounded-xl">{reqToDisplay.reviewRemarks}</p>
                          </div>
                        )}
                      </div>
                    )}
                    {reqToDisplay.status !== "Rejected" && reqToDisplay.remarks && (
                      <div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Remarks</span>
                        <p className="text-xs font-semibold text-[#03045e] mt-1 p-3 bg-gray-50 rounded-xl">{reqToDisplay.remarks}</p>
                      </div>
                    )}

                    <div className="py-4 border-t border-gray-100">
                      <h3 className="text-xs font-black text-[#03045e] mb-4">Processing Progress</h3>
                      <div className="flex items-center justify-between relative max-w-3xl mx-auto">
                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -translate-y-1/2 z-0 rounded-full" />
                        <div className={`absolute top-1/2 left-0 h-1 bg-gradient-to-r from-[#03045e] to-[#00b4d8] -translate-y-1/2 z-0 rounded-full transition-all duration-500`} style={{ width: stage >= 4 ? '100%' : stage === 3 ? '75%' : stage === 2 ? '50%' : stage === 1 ? '25%' : '0%' }} />
                        
                        {[
                          { label: "Submitted", step: 0 },
                          { label: reqToDisplay.status === "Rejected" ? "Rejected" : "Approved", step: 1 },
                          { label: "Form Issued", step: 2 },
                          { label: "Clearance Verified", step: 3 },
                          { label: "Ready for Collection", step: 4 }
                        ].map((item, idx) => (
                          <div key={idx} className="relative z-10 flex flex-col items-center gap-2 bg-white px-2 min-w-[80px]">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black border-2 ${
                              stage >= item.step 
                                ? "bg-[#03045e] text-white border-[#03045e]" 
                                : reqToDisplay.status === "Rejected" && item.step === 1
                                ? "bg-rose-500 text-white border-rose-500"
                                : "bg-white text-gray-300 border-gray-200"
                            }`}>
                              {stage > item.step || (stage === 4 && item.step === 4) ? <CheckCircle2 size={12} /> : item.step + 1}
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-wider text-center ${stage >= item.step ? "text-[#03045e]" : "text-gray-400"}`}>
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {reqToDisplay.status === "Approved" && reqToDisplay.clearanceFormIssued && (
                      <div className="pt-4 border-t border-gray-100">
                        {!reqToDisplay.originalClearanceReceived ? (
                          <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl mb-6">
                            <h4 className="text-xs font-black text-amber-800 mb-2 uppercase tracking-widest flex items-center gap-2">
                              <AlertCircle size={14} /> Action Required: Clearance Form
                            </h4>
                            <p className="text-xs font-bold text-amber-700 leading-relaxed">
                              Your withdrawal request has been approved. However, to proceed with the generation of your Transfer Certificate and Character Certificate, you must first download and print the <strong>Clearance Form</strong>. Obtain signatures from all listed departments physically and submit the original copy to the Administration.
                            </p>
                            <button
                              onClick={() => {
                                setPreviewDocType("clearanceForm");
                                setPreviewOpen(true);
                              }}
                              className="mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm"
                            >
                              Preview Clearance Form
                            </button>
                          </div>
                        ) : (
                          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl mb-6">
                            <h4 className="text-xs font-black text-indigo-800 mb-2 uppercase tracking-widest flex items-center gap-2">
                              <CheckCircle2 size={14} /> Original Clearance Form Submitted
                            </h4>
                            <p className="text-xs font-bold text-indigo-700 leading-relaxed">
                              Your signed Clearance Form has been received by the Administration Office. Administrative verification is in progress. Official documents will be issued shortly.
                            </p>
                            <button
                              onClick={() => {
                                setPreviewDocType("clearanceForm");
                                setPreviewOpen(true);
                              }}
                              className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm"
                            >
                              View Clearance Form
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {reqToDisplay.status === "Approved" && (
                      <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-xs font-black text-[#03045e] mb-4">Official Document Status</h3>
                        {reqToDisplay.documentsReadyForCollection ? (
                          <div className="p-4 border border-emerald-200 bg-white rounded-xl flex items-start gap-3 shadow-sm">
                            <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest">Official Documents Ready for Collection</h4>
                              <p className="text-[10px] text-emerald-700 font-bold mt-1.5 leading-relaxed">
                                Your official school documents have been prepared, signed and sealed. Please visit the Administration Office during working hours to collect the original documents. Carry a valid identity proof if required.
                              </p>
                            </div>
                          </div>
                        ) : reqToDisplay.documentsPreparationStarted ? (
                          <div className="p-4 border border-blue-200 bg-white rounded-xl flex items-start gap-3 shadow-sm">
                            <Clock size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-xs font-black text-blue-800 uppercase tracking-widest">Official Documents Under Preparation</h4>
                              <p className="text-[10px] text-blue-700 font-bold mt-1.5 leading-relaxed">
                                Your clearance has been verified successfully. The Administration Office is preparing your official school documents. Once they have been printed, signed and sealed, you will be able to collect them from the Administration Office.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 border border-gray-200 bg-gray-50 rounded-xl flex items-start gap-3">
                            <Info size={20} className="text-gray-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-xs font-black text-gray-600 uppercase tracking-widest">Awaiting Verification</h4>
                              <p className="text-[10px] text-gray-500 font-bold mt-1.5">
                                Please wait for the administration to verify your clearance form and start preparing your official documents.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </MainCard>
          )}

          <div className="grid grid-cols-1 items-start mt-8">
            <MainCard className="p-6">
              <h2 className="text-lg font-black text-[#03045e] mb-2 flex items-center gap-2">
                <Clock size={20} className="text-[#0077b6]" />
                Request History
              </h2>
              <p className="text-xs font-semibold text-gray-400 mb-6 uppercase tracking-wider">
                Previous withdrawal applications.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-gray-100 text-[10px] uppercase font-black tracking-widest text-gray-400">
                      <th className="py-3 px-3">Applied Date</th>
                      <th className="py-3 px-3">Reason</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Reviewed Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {requests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-3 text-xs font-bold text-[#03045e]">
                          {formatDate(req.appliedDate)}
                        </td>
                        <td className="py-3 px-3 text-xs font-bold text-gray-600">
                          {req.reason}
                        </td>
                        <td className="py-3 px-3">
                          {req.status === "Pending Review" && (
                            <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[9px] font-black uppercase tracking-wider">Pending Review</span>
                          )}
                          {req.status === "Approved" && (
                            <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-black uppercase tracking-wider">Approved</span>
                          )}
                          {req.status === "Rejected" && (
                            <span className="px-2 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100 text-[9px] font-black uppercase tracking-wider">Rejected</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-xs font-bold text-gray-500">
                          {req.reviewedDate ? formatDate(req.reviewedDate) : "—"}
                        </td>
                      </tr>
                    ))}
                    {requests.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-xs font-black text-gray-400 uppercase tracking-widest">
                          No previous requests found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </MainCard>
          </div>
          <DocumentPreviewModal 
            isOpen={previewOpen} 
            onClose={() => setPreviewOpen(false)}
            title={
              previewDocType === "clearanceForm" ? "Clearance Form Preview" : 
              previewDocType === "characterCertificate" ? "Character Certificate Preview" : 
              previewDocType === "migrationCertificate" ? "Migration Certificate Preview" : 
              "Transfer Certificate Preview"
            }
          >
            {(completionRecord || activeRequest) && activeStudentId && previewDocType === "clearanceForm" && (
              <ClearanceForm
                student={studentInfo || { 
                  name: "Loading...", admissionNumber: "---", className: "---", section: "---", 
                  parentName: "---", motherName: "---", dateOfBirth: null, admissionDate: null 
                }}
                request={completionRecord || activeRequest}
                school={{ name: "EduDash International School", address: "123 Education Boulevard, Knowledge City", affiliation: "Affiliated to C.B.S.E, New Delhi" }}
              />
            )}
            {(completionRecord || activeRequest) && activeStudentId && previewDocType === "transferCertificate" && (
              <TransferCertificate
                student={studentInfo || { 
                  name: "Loading...", admissionNumber: "---", className: "---", section: "---", 
                  parentName: "---", motherName: "---", dateOfBirth: null, admissionDate: null 
                }}
                request={completionRecord || activeRequest}
                school={{ name: "EduDash International School", address: "123 Education Boulevard, Knowledge City", affiliation: "Affiliated to C.B.S.E, New Delhi" }}
                tcNumber={generateMockCertificateNumber("transferCertificate", (completionRecord?.id || activeRequest?.id))}
                issueDate={(completionRecord || activeRequest).generatedDocumentDates?.transferCertificate || new Date().toISOString()}
                generatedBy="System"
              />
            )}
            {(completionRecord || activeRequest) && activeStudentId && previewDocType === "characterCertificate" && (
              <CharacterCertificate
                student={studentInfo || { 
                  name: "Loading...", admissionNumber: "---", className: "---", section: "---", 
                  parentName: "---", motherName: "---", dateOfBirth: null, admissionDate: null 
                }}
                request={completionRecord || activeRequest}
                school={{ name: "EduDash International School", address: "123 Education Boulevard, Knowledge City", affiliation: "Affiliated to C.B.S.E, New Delhi" }}
                certificateNumber={generateMockCertificateNumber("characterCertificate", (completionRecord?.id || activeRequest?.id))}
                issueDate={(completionRecord || activeRequest).generatedDocumentDates?.characterCertificate || new Date().toISOString()}
                generatedBy="System"
              />
            )}
            {(completionRecord || activeRequest) && activeStudentId && previewDocType === "migrationCertificate" && (
              <MigrationCertificate
                student={studentInfo || { 
                  name: "Loading...", admissionNumber: "---", className: "---", section: "---", 
                  parentName: "---", motherName: "---", dateOfBirth: null, admissionDate: null 
                }}
                request={completionRecord || activeRequest}
                school={{ name: "EduDash International School", address: "123 Education Boulevard, Knowledge City", affiliation: "Affiliated to C.B.S.E, New Delhi" }}
                certificateNumber={generateMockCertificateNumber("migrationCertificate", (completionRecord?.id || activeRequest?.id))}
                issueDate={(completionRecord || activeRequest).generatedDocumentDates?.migrationCertificate || new Date().toISOString()}
                generatedBy="System"
              />
            )}
          </DocumentPreviewModal>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalRequestPage;
