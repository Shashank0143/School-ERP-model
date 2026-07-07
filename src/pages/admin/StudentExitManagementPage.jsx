import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileMinus, CheckCircle2, XCircle, Clock, Search, X, Users,
  FileText, Printer
} from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import PageAuthorityBanner from "../../components/admin/PageAuthorityBanner";
import OperationsStatCard from "../../components/admin/operations/OperationsStatCard";
import AdminSectionCard from "../../components/admin/AdminSectionCard";
import DocumentPreviewModal from "../../components/common/documents/DocumentPreviewModal";
import TransferCertificate from "../../components/common/documents/TransferCertificate";
import CharacterCertificate from "../../components/common/documents/CharacterCertificate";
import MigrationCertificate from "../../components/common/documents/MigrationCertificate";
import ClearanceForm from "../../components/common/documents/ClearanceForm";
import { generateMockCertificateNumber } from "../../utils/documentUtils";
import { 
  getAllRequests, approveRequest, rejectRequest, markDocumentGenerated, issueClearanceForm, markOriginalClearanceReceived,
  getAllCompletionRecords, isEligibleForSchoolCompletion, createCompletionRecord, markCompletionDocumentGenerated,
  getHighestAvailableClassLevel, undoSchoolCompletion,
  startDocumentPreparation, markDocumentsReadyForCollection,
  startCompletionDocumentPreparation, markCompletionDocumentsReadyForCollection
} from "../../services/studentExitService";
import { getItem } from "../../persistence/storage";
import { STORAGE_KEYS } from "../../persistence/storageKeys";

const StudentExitManagementPage = () => {
  const [requests, setRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [completionRecords, setCompletionRecords] = useState([]);
  const [parents, setParents] = useState([]);
  
  const [activeTab, setActiveTab] = useState("withdrawal"); // "withdrawal" | "completion"

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  // Drawer state
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // TC Preview State
  const [previewOpen, setPreviewOpen] = useState(false);
  const [tcData, setTcData] = useState(null);

  // Reject Panel State
  const [showRejectPanel, setShowRejectPanel] = useState(false);
  const [rejectCategory, setRejectCategory] = useState("Missing Documents");
  const [rejectRemarks, setRejectRemarks] = useState("");
  
  // Completion Form State
  const [completionDate, setCompletionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [completionRemarks, setCompletionRemarks] = useState("");

  const fetchData = useCallback(() => {
    try {
      const allReqs = getAllRequests();
      const allCompletions = getAllCompletionRecords();
      const allStudents = getItem(STORAGE_KEYS.STUDENTS, []);
      const allClasses = getItem(STORAGE_KEYS.CLASSES, []);
      const allParents = getItem(STORAGE_KEYS.PARENTS, []);
      setRequests(allReqs.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate)));
      setCompletionRecords(allCompletions);
      setStudents(allStudents);
      setClasses(allClasses);
      setParents(allParents);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh drawer data when requests state updates
  useEffect(() => {
    if (selectedRequest) {
      if (selectedRequest._source === "withdrawal") {
        const updatedReq = requests.find(r => r.id === selectedRequest.id);
        if (updatedReq) {
          setSelectedRequest(prev => ({ ...updatedReq, _source: prev._source }));
        }
      } else if (selectedRequest._source === "completion") {
        const updatedReq = completionRecords.find(r => r.studentId === selectedRequest.studentId);
        if (updatedReq) {
          setSelectedRequest(prev => ({ ...updatedReq, studentId: prev.studentId, _source: prev._source, _isNew: false }));
        }
      }
    }
  }, [requests, completionRecords, selectedRequest?.id, selectedRequest?.studentId]);

  const handleApprove = (req) => {
    try { approveRequest(req.id, "Admin"); fetchData(); } catch(e) { console.error(e); }
  };
  
  const handleReject = (id, category, remarks) => {
    try { rejectRequest(id, "Admin", category, remarks); fetchData(); } catch(e) { console.error(e); }
  };
  
  const handleIssueClearance = (id) => {
    try { issueClearanceForm(id, "Admin"); fetchData(); } catch(e) { console.error(e); }
  };
  
  const handleMarkReceived = (id) => {
    try { markOriginalClearanceReceived(id, "Admin"); fetchData(); } catch(e) { console.error(e); }
  };
  
  const handleGenerateDoc = (req, docKey) => {
    try { 
      markDocumentGenerated(req.id, docKey); 
      fetchData(); 
    } catch(e) { console.error(e); }
  };

  const handleStartPrep = (req) => {
    try {
      if (req._source === "completion") startCompletionDocumentPreparation(req.studentId, "Admin");
      else startDocumentPreparation(req.id, "Admin");
      fetchData();
    } catch(e) { console.error(e); }
  };

  const handleMarkReady = (req) => {
    try {
      if (req._source === "completion") markCompletionDocumentsReadyForCollection(req.studentId, "Admin");
      else markDocumentsReadyForCollection(req.id, "Admin");
      fetchData();
    } catch(e) { console.error(e); }
  };

  const handlePreviewDoc = (req, docKey) => {
    if (docKey === "transferCertificate" || docKey === "characterCertificate" || docKey === "migrationCertificate" || docKey === "clearanceForm") {
      setTcData({...req, previewDocType: docKey});
      setPreviewOpen(true);
    }
  };

  const handleMarkSchoolCompleted = (studentId) => {
    try {
      const data = {
        studentId,
        completedDate: completionDate ? new Date(completionDate).toISOString() : new Date().toISOString(),
        remarks: completionRemarks,
        academicYear: "2025-2026", // Prototype hardcoded academic year
      };
      createCompletionRecord(data);
      fetchData();
      const updatedRecords = getAllCompletionRecords();
      const newRec = updatedRecords.find(r => r.studentId === studentId);
      if (newRec) setSelectedRequest({ ...newRec, studentId, _source: "completion", _isNew: false });
    } catch (e) { console.error(e); }
  };

  const handleUndoCompletion = (studentId) => {
    if (window.confirm("Are you sure you want to undo this school completion? This will delete the completion record and issued documents.")) {
      try {
        undoSchoolCompletion(studentId);
        fetchData();
        setSelectedRequest(null);
      } catch (e) { console.error(e); }
    }
  };

  const handleGenerateCompletionDoc = (req, docKey) => {
    try { 
      markCompletionDocumentGenerated(req.id, docKey); 
      fetchData(); 
    } catch(e) { console.error(e); }
  };

  const filteredRequests = requests.filter(req => {
    const s = students.find(x => x.id === req.studentId);
    const searchMatch = !searchTerm || (s?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || req.id.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const derivedStatus = req.originalClearanceReceived ? "Original Form Received" : req.clearanceFormIssued ? "Clearance Form Issued" : req.status;
    const statusMatch = statusFilter === "All" || derivedStatus === statusFilter;
    
    return searchMatch && statusMatch;
  });

  const eligibleAndCompletedStudents = students.filter(s => isEligibleForSchoolCompletion(s) || s.status === "Alumni");

  const filteredCompletionStudents = eligibleAndCompletedStudents.filter(s => {
    const searchMatch = !searchTerm || (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || (s.admissionNumber || s.admissionNo || "").toLowerCase().includes(searchTerm.toLowerCase()));
    const isCompleted = completionRecords.some(r => r.studentId === s.id);
    const statusMatch = statusFilter === "All" || (statusFilter === "Completed" ? isCompleted : !isCompleted);
    return searchMatch && statusMatch;
  });

  const stats = {
    pending: requests.filter(r => r.status === "Pending Review").length,
    approved: requests.filter(r => r.status === "Approved").length,
    rejected: requests.filter(r => r.status === "Rejected").length,
    formsIssued: requests.filter(r => r.clearanceFormIssued).length,
    formsReceived: requests.filter(r => r.originalClearanceReceived).length,
    completed: completionRecords.length,
    total: requests.length
  };

  const getStudentInfo = (studentId) => {
    const s = students.find(x => x.id === studentId);
    if (!s) return null;
    const c = classes.find(x => x.id === s.classId);
    const p = parents.find(x => x.id === s.parentId);
    
    return { 
      ...s, 
      className: c ? c.name : "N/A",
      admissionNumber: s.admissionNo || s.admissionNumber || "N/A",
      parentName: p ? p.name : "N/A",
      phone: p ? p.phoneNumber || p.phone : "N/A",
      bloodGroup: s.bloodGroup || ["O+", "A+", "B+", "AB+", "O-", "A-"][(s.id.charCodeAt(s.id.length-1) % 6) || 0] || "N/A"
    };
  };

  return (
    <div className="space-y-6 pb-12">
      <AdminPageHeader
        title="Student Exit Management"
        description="Centralized module for processing student withdrawals and schooling completion requests."
        breadcrumbs={["Admin Portal", "Operations", "Student Exit Management"]}
      />
      <PageAuthorityBanner moduleId="admin_student_exit" moduleName="Student Exit Management" />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
        <OperationsStatCard title="Pending Requests" value={stats.pending.toString()} description="Awaiting review" icon={Clock} />
        <OperationsStatCard title="Approved" value={stats.approved.toString()} description="Requests approved" icon={CheckCircle2} color="#10b981" bg="#d1fae5" />
        <OperationsStatCard title="Forms Issued" value={stats.formsIssued.toString()} description="Clearance forms" icon={FileText} color="#3b82f6" bg="#eff6ff" />
        <OperationsStatCard title="Forms Received" value={stats.formsReceived.toString()} description="Originals received" icon={FileMinus} color="#4f46e5" bg="#e0e7ff" />
        <OperationsStatCard title="Rejected" value={stats.rejected.toString()} description="Requests rejected" icon={XCircle} color="#ef4444" bg="#fee2e2" />
        <OperationsStatCard title="School Completed" value={stats.completed.toString()} description="Alumni transitioned" icon={Users} color="#03045e" bg="#e0f2fe" />
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        <button 
          className={`pb-4 px-4 text-sm font-black tracking-widest uppercase transition-colors ${activeTab === "withdrawal" ? "text-[#03045e] border-b-2 border-[#03045e]" : "text-gray-400 hover:text-gray-600"}`}
          onClick={() => { setActiveTab("withdrawal"); setSearchTerm(""); setStatusFilter("All"); }}
        >
          Withdrawal Requests
        </button>
        <button 
          className={`pb-4 px-4 text-sm font-black tracking-widest uppercase transition-colors ${activeTab === "completion" ? "text-[#03045e] border-b-2 border-[#03045e]" : "text-gray-400 hover:text-gray-600"}`}
          onClick={() => { setActiveTab("completion"); setSearchTerm(""); setStatusFilter("All"); }}
        >
          School Completion
        </button>
      </div>

      <AdminSectionCard>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by student name or request ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-[#03045e] focus:outline-none focus:border-[#00b4d8]"
            />
          </div>
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-[#03045e] focus:outline-none focus:border-[#00b4d8]"
          >
            {activeTab === "withdrawal" ? (
              <>
                <option value="All">All Statuses</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Approved">Approved</option>
                <option value="Clearance Form Issued">Clearance Form Issued</option>
                <option value="Original Form Received">Original Form Received</option>
                <option value="Rejected">Rejected</option>
              </>
            ) : (
              <>
                <option value="All">All Eligibility</option>
                <option value="Pending">Pending Completion</option>
                <option value="Completed">Completed</option>
              </>
            )}
          </select>
          <button onClick={() => { setSearchTerm(""); setStatusFilter("All"); }} className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 bg-gray-50 rounded-xl border border-gray-200 transition-colors">
            Reset Filters
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            {activeTab === "withdrawal" ? (
              <>
                <thead>
                  <tr className="border-b border-gray-200 text-[10px] uppercase font-black tracking-widest text-gray-400">
                    <th className="py-4 px-3">Application ID</th>
                    <th className="py-4 px-3">Student</th>
                    <th className="py-4 px-3">Exit Type</th>
                    <th className="py-4 px-3">Applied Date</th>
                    <th className="py-4 px-3">Status</th>
                    <th className="py-4 px-3">Docs Generated</th>
                    <th className="py-4 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredRequests.map(req => {
                    const s = getStudentInfo(req.studentId);
                    const isCompleted = req.reason === "Completed School Education";
                    const isDocsGen = req.generatedDocuments?.transferCertificate && req.generatedDocuments?.characterCertificate;
                    
                    return (
                      <tr key={req.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => setSelectedRequest({ ...req, _source: "withdrawal" })}>
                        <td className="py-3 px-3 text-xs font-black text-[#03045e]">{req.id.substring(0,8).toUpperCase()}</td>
                        <td className="py-3 px-3">
                          <span className="block text-xs font-black text-[#03045e]">{s ? s.name : "Unknown"}</span>
                          <span className="block text-[10px] text-gray-400 font-bold">{s ? `${s.className} | Admn: ${s.admissionNumber}` : ""}</span>
                        </td>
                        <td className="py-3 px-3 text-xs font-bold text-gray-600">{isCompleted ? "Completion" : "Withdrawal"}</td>
                        <td className="py-3 px-3 text-xs font-bold text-gray-500">{new Date(req.appliedDate).toLocaleDateString()}</td>
                        <td className="py-3 px-3">
                          {req.status === "Pending Review" && <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[9px] font-black uppercase tracking-wider">Pending Review</span>}
                          {req.status === "Approved" && !req.clearanceFormIssued && <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-black uppercase tracking-wider">Approved</span>}
                          {req.clearanceFormIssued && !req.originalClearanceReceived && <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-black uppercase tracking-wider">Form Issued</span>}
                          {req.originalClearanceReceived && !isDocsGen && <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 text-[9px] font-black uppercase tracking-wider">Form Received</span>}
                          {req.originalClearanceReceived && isDocsGen && <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-black uppercase tracking-wider">Docs Generated</span>}
                          {req.status === "Rejected" && <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100 text-[9px] font-black uppercase tracking-wider">Rejected</span>}
                        </td>
                        <td className="py-3 px-3">
                          {req.status !== "Approved" ? (
                            <span className="text-[10px] font-bold text-gray-400">—</span>
                          ) : (
                            <span className={`text-[10px] font-black uppercase tracking-wider ${isDocsGen ? "text-emerald-500" : "text-amber-500"}`}>
                              {isDocsGen ? "Yes" : "Pending"}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedRequest({ ...req, _source: "withdrawal" }); }}
                            className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest bg-[#caf0f8] text-[#03045e] hover:bg-[#00b4d8] hover:text-white rounded-lg transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredRequests.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No withdrawal requests found.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </>
            ) : (
              <>
                <thead>
                  <tr className="border-b border-gray-200 text-[10px] uppercase font-black tracking-widest text-gray-400">
                    <th className="py-4 px-3">Student</th>
                    <th className="py-4 px-3">Current Class</th>
                    <th className="py-4 px-3">Eligibility</th>
                    <th className="py-4 px-3">Status</th>
                    <th className="py-4 px-3">Docs Generated</th>
                    <th className="py-4 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredCompletionStudents.map(s => {
                    const c = classes.find(x => x.id === s.classId);
                    const record = completionRecords.find(r => r.studentId === s.id);
                    const isCompleted = !!record;
                    const isDocsGen = record?.documents?.transferCertificate && record?.documents?.characterCertificate;
                    
                    return (
                      <tr key={s.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => setSelectedRequest({ ...record, studentId: s.id, _source: "completion", _isNew: !isCompleted })}>
                        <td className="py-3 px-3">
                          <span className="block text-xs font-black text-[#03045e]">{s.name}</span>
                          <span className="block text-[10px] text-gray-400 font-bold">Admn: {s.admissionNo || s.admissionNumber}</span>
                        </td>
                        <td className="py-3 px-3 text-xs font-bold text-gray-600">{c ? c.name : "N/A"}</td>
                        <td className="py-3 px-3">
                          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-black uppercase tracking-wider">Eligible Class {getHighestAvailableClassLevel()}</span>
                        </td>
                        <td className="py-3 px-3">
                          {isCompleted ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-black uppercase tracking-wider">School Completed</span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[9px] font-black uppercase tracking-wider">Pending</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {!isCompleted ? (
                            <span className="text-[10px] font-bold text-gray-400">—</span>
                          ) : (
                            <span className={`text-[10px] font-black uppercase tracking-wider ${isDocsGen ? "text-emerald-500" : "text-amber-500"}`}>
                              {isDocsGen ? "Yes" : "Pending"}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedRequest({ ...record, studentId: s.id, _source: "completion", _isNew: !isCompleted }); }}
                            className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest bg-[#caf0f8] text-[#03045e] hover:bg-[#00b4d8] hover:text-white rounded-lg transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredCompletionStudents.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No eligible students found.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </>
            )}
          </table>
        </div>
      </AdminSectionCard>

      {/* Details Side Panel Drawer */}
      <AnimatePresence>
        {selectedRequest && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedRequest(null)}
              className="fixed inset-0 bg-black/45 z-40 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="fixed right-0 top-0 h-full w-full w-[95vw] md:w-[90vw] lg:max-w-2xl bg-[#f8fafc] shadow-2xl z-50 flex flex-col border-l border-gray-200"
            >
              <div className="p-5 border-b border-gray-200 bg-white flex items-center justify-between shadow-sm z-10 shrink-0">
                <span className="text-xs font-black uppercase tracking-widest text-[#03045e] flex items-center gap-2">
                  <FileMinus size={16} className="text-[#00b4d8]" /> Request Details
                </span>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {(() => {
                  const req = selectedRequest;
                  const sInfo = getStudentInfo(req.studentId);
                  const isReadonly = req.status !== "Pending Review" && req._source === "withdrawal";

                  return (
                    <>
                      {/* Card 1: Student Summary */}
                      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-[#caf0f8] text-[#03045e] flex items-center justify-center text-xl font-black shrink-0">
                          {sInfo?.name?.charAt(0) || "S"}
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-4 text-xs font-bold">
                          <div>
                            <span className="block text-[9px] text-gray-400 uppercase tracking-wider">Student Name</span>
                            <span className="text-[#03045e]">{sInfo?.name}</span>
                          </div>
                          <div>
                            <span className="block text-[9px] text-gray-400 uppercase tracking-wider">Admission No</span>
                            <span className="text-[#03045e]">{sInfo?.admissionNumber}</span>
                          </div>
                          <div>
                            <span className="block text-[9px] text-gray-400 uppercase tracking-wider">Class / Section</span>
                            <span className="text-[#03045e]">{sInfo?.className} / {sInfo?.section || "N/A"}</span>
                          </div>
                          <div>
                            <span className="block text-[9px] text-gray-400 uppercase tracking-wider">Parent Name</span>
                            <span className="text-[#03045e]">{sInfo?.parentName || "N/A"}</span>
                          </div>
                          <div>
                            <span className="block text-[9px] text-gray-400 uppercase tracking-wider">Phone</span>
                            <span className="text-[#03045e]">{sInfo?.phone || "N/A"}</span>
                          </div>
                          <div>
                            <span className="block text-[9px] text-gray-400 uppercase tracking-wider">Blood Group</span>
                            <span className="text-[#03045e]">{sInfo?.bloodGroup || "N/A"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card 2: Application Details (Only for Withdrawal) */}
                      {req._source === "withdrawal" && (
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                          <h4 className="text-xs font-black text-[#03045e] mb-4 flex items-center gap-2 border-b border-gray-50 pb-2">
                            <FileText size={16} className="text-gray-400" /> Application Context
                          </h4>
                          <div className="space-y-4 text-xs font-bold">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="block text-[9px] text-gray-400 uppercase tracking-wider">Exit Type / Reason</span>
                                <span className="text-[#03045e]">{req.reason}</span>
                              </div>
                              <div>
                                <span className="block text-[9px] text-gray-400 uppercase tracking-wider">Applied Date</span>
                                <span className="text-[#03045e]">{new Date(req.appliedDate).toLocaleString()}</span>
                              </div>
                            </div>
                            <div>
                              <span className="block text-[9px] text-gray-400 uppercase tracking-wider">Remarks</span>
                              <div className="p-3 bg-gray-50 rounded-xl text-gray-600 mt-1 font-semibold">{req.remarks || "No remarks provided by applicant."}</div>
                            </div>
                            {req.attachment && (
                               <div>
                                 <span className="block text-[9px] text-gray-400 uppercase tracking-wider">Supporting Document</span>
                                 <span className="text-[#00b4d8] underline cursor-pointer">{req.attachment}</span>
                               </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Card 3: Timeline (Withdrawal or Completion) */}
                      {(req._source === "withdrawal" || req._source === "completion") && (
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                          <h4 className="text-xs font-black text-[#03045e] mb-4 flex items-center gap-2 border-b border-gray-50 pb-2">
                            <Clock size={16} className="text-gray-400" /> Processing Timeline
                          </h4>
                          {req._source === "completion" ? (
                            <div className="space-y-5">
                              {req._isNew ? (
                                <div className="p-3 mb-4 rounded-xl bg-blue-50 text-blue-800 text-xs font-bold border border-blue-100 flex items-center gap-2">
                                  <Clock size={14} /> Pending Administrative Action
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-start gap-3">
                                    <div className="mt-1 flex flex-col items-center">
                                      <div className="w-2 h-2 rounded-full bg-[#00b4d8] ring-4 ring-[#caf0f8]" />
                                      {req.documentsPreparationStarted && <div className="w-px h-6 bg-gray-200 mt-1" />}
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-black uppercase tracking-widest text-[#03045e]">School Completed</p>
                                      <p className="text-[9px] font-bold text-gray-400">{new Date(req.completedDate).toLocaleString()}</p>
                                    </div>
                                  </div>
                                  {req.documentsPreparationStarted && (
                                    <div className="flex items-start gap-3">
                                      <div className="mt-1 flex flex-col items-center">
                                        <div className="w-2 h-2 rounded-full ring-4 bg-blue-500 ring-blue-50" />
                                        {req.documentsReadyForCollection && <div className="w-px h-6 bg-gray-200 mt-1" />}
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#03045e]">Official Documents Under Preparation</p>
                                        <p className="text-[9px] font-bold text-gray-400">{new Date(req.documentsPreparationDate).toLocaleString()}</p>
                                      </div>
                                    </div>
                                  )}
                                  {req.documentsReadyForCollection && (
                                    <div className="flex items-start gap-3">
                                      <div className="mt-1 flex flex-col items-center">
                                        <CheckCircle2 size={16} className="text-[#03045e] bg-[#caf0f8] rounded-full ring-4 ring-[#caf0f8]" />
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#03045e]">Ready for Collection</p>
                                        <p className="text-[9px] font-bold text-gray-400">{new Date(req.documentsReadyDate).toLocaleString()}</p>
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-5">
                              <div className="flex items-start gap-3">
                              <div className="mt-1 flex flex-col items-center">
                                <div className="w-2 h-2 rounded-full bg-[#00b4d8] ring-4 ring-[#caf0f8]" />
                                {req.reviewedDate && <div className="w-px h-6 bg-gray-200 mt-1" />}
                              </div>
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#03045e]">Application Submitted</p>
                                <p className="text-[9px] font-bold text-gray-400">{new Date(req.appliedDate).toLocaleString()}</p>
                              </div>
                            </div>
                            
                            {req.reviewedDate && (
                              <div className="flex items-start gap-3">
                                <div className="mt-1 flex flex-col items-center">
                                  <div className={`w-2 h-2 rounded-full ring-4 ${req.status === "Approved" ? "bg-emerald-500 ring-emerald-50" : "bg-rose-500 ring-rose-50"}`} />
                                  {req.clearanceFormIssued && <div className="w-px h-8 bg-gray-200 mt-1" />}
                                </div>
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-[#03045e]">Request {req.status}</p>
                                  <p className="text-[9px] font-bold text-gray-400">{new Date(req.reviewedDate).toLocaleString()}</p>
                                  {req.status === "Rejected" && req.reasonCategory && (
                                    <p className="text-[10px] text-gray-500 font-semibold mt-1.5 bg-gray-50 p-2.5 rounded-lg border border-gray-100">Category: <span className="text-gray-800">{req.reasonCategory}</span></p>
                                  )}
                                  {req.status === "Rejected" && req.reviewRemarks && (
                                    <p className="text-[10px] text-gray-500 font-semibold mt-1 bg-gray-50 p-2.5 rounded-lg border border-gray-100">Remarks: {req.reviewRemarks}</p>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {req.clearanceFormIssued && (
                              <div className="flex items-start gap-3">
                                <div className="mt-1 flex flex-col items-center">
                                  <div className="w-2 h-2 rounded-full ring-4 bg-blue-500 ring-blue-50" />
                                  {req.originalClearanceReceived && <div className="w-px h-6 bg-gray-200 mt-1" />}
                                </div>
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-[#03045e]">Clearance Form Issued</p>
                                  <p className="text-[9px] font-bold text-gray-400">{new Date(req.clearanceIssuedDate).toLocaleString()}</p>
                                </div>
                              </div>
                            )}

                            {req.originalClearanceReceived && (
                              <div className="flex items-start gap-3">
                                <div className="mt-1 flex flex-col items-center">
                                  <div className="w-2 h-2 rounded-full ring-4 bg-indigo-500 ring-indigo-50" />
                                  {req.documentsPreparationStarted && <div className="w-px h-6 bg-gray-200 mt-1" />}
                                </div>
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-[#03045e]">Original Form Received</p>
                                  <p className="text-[9px] font-bold text-gray-400">{new Date(req.originalClearanceReceivedDate).toLocaleString()}</p>
                                </div>
                              </div>
                            )}

                            {req.documentsPreparationStarted && (
                              <div className="flex items-start gap-3">
                                <div className="mt-1 flex flex-col items-center">
                                  <div className="w-2 h-2 rounded-full ring-4 bg-blue-500 ring-blue-50" />
                                  {req.documentsReadyForCollection && <div className="w-px h-6 bg-gray-200 mt-1" />}
                                </div>
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-[#03045e]">Official Documents Under Preparation</p>
                                  <p className="text-[9px] font-bold text-gray-400">{new Date(req.documentsPreparationDate).toLocaleString()}</p>
                                </div>
                              </div>
                            )}

                            {req.documentsReadyForCollection && (
                              <div className="flex items-start gap-3">
                                <div className="mt-1 flex flex-col items-center">
                                  <CheckCircle2 size={16} className="text-[#03045e] bg-[#caf0f8] rounded-full ring-4 ring-[#caf0f8]" />
                                </div>
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-[#03045e]">Ready for Collection</p>
                                  <p className="text-[9px] font-bold text-gray-400">{new Date(req.documentsReadyDate).toLocaleString()}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                      {/* Undo Action for Completion */}
                      {req._source === "completion" && !req._isNew && !isReadonly && (
                         <div className="flex justify-end pt-2">
                           <button onClick={() => handleUndoCompletion(req.studentId)} className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-700 underline decoration-rose-200 underline-offset-4">
                             Undo School Completion
                           </button>
                         </div>
                      )}

                      {/* Card 4: Administrative Forms */}
                      {req._source === "withdrawal" && req.status === "Approved" && (
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                          <h4 className="text-xs font-black text-[#03045e] mb-4 flex items-center gap-2 border-b border-gray-50 pb-2">
                            <FileText size={16} className="text-gray-400" /> Administrative Forms
                          </h4>
                          <div className="flex flex-col gap-4">
                            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between">
                              <div>
                                <span className="block text-xs font-black text-[#03045e]">Withdrawal Clearance Form</span>
                                <span className={`text-[9px] font-black uppercase tracking-widest mt-1 inline-block ${req.clearanceFormIssued ? "text-emerald-500" : "text-amber-500"}`}>
                                  {req.clearanceFormIssued ? `Issued on ${new Date(req.clearanceIssuedDate).toLocaleDateString()}` : "Not Issued"}
                                </span>
                              </div>
                              {req.clearanceFormIssued ? (
                                <button
                                  onClick={() => handlePreviewDoc(req, "clearanceForm")}
                                  className="px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-sm bg-white text-[#03045e] border border-gray-200 hover:bg-gray-50"
                                >
                                  Preview Form
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleIssueClearance(req.id)}
                                  className="px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-sm bg-[#03045e] text-white hover:bg-[#0077b6]"
                                >
                                  Issue Form
                                </button>
                              )}
                            </div>
                            
                            {req.clearanceFormIssued && (
                              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
                                <div>
                                  <span className="block text-xs font-black text-[#03045e]">Original Clearance Form</span>
                                  <span className={`text-[9px] font-black uppercase tracking-widest mt-1 inline-block ${req.originalClearanceReceived ? "text-indigo-600" : "text-amber-500"}`}>
                                    {req.originalClearanceReceived ? `● Received on ${new Date(req.originalClearanceReceivedDate).toLocaleDateString()} by ${req.originalClearanceReceivedBy}` : "○ Not Received"}
                                  </span>
                                </div>
                                {req.originalClearanceReceived ? (
                                  <div className="px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-sm bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center gap-1.5">
                                    <CheckCircle2 size={12} /> Original Form Received
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleMarkReceived(req.id)}
                                    className="px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-sm bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1.5"
                                  >
                                    <CheckCircle2 size={12} /> Mark Original Form Received
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Panel (Withdrawal Only) */}
                      {req._source === "withdrawal" && !isReadonly && !showRejectPanel && (
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button onClick={() => handleApprove(req)} className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
                            <CheckCircle2 size={16} /> Approve Request
                          </button>
                          <button onClick={() => setShowRejectPanel(true)} className="flex-1 py-3 bg-white hover:bg-rose-50 text-rose-600 border-2 border-rose-100 hover:border-rose-200 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
                            <XCircle size={16} /> Reject Request
                          </button>
                        </div>
                      )}

                      {/* Reject Panel */}
                      {req._source === "withdrawal" && !isReadonly && showRejectPanel && (
                        <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100 shadow-sm space-y-4">
                          <h4 className="text-xs font-black text-rose-600 mb-2 flex items-center gap-2">
                            <XCircle size={16} /> Reject Request
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <label className="text-[10px] font-black text-rose-800 uppercase tracking-widest">Reason Category *</label>
                              <select 
                                value={rejectCategory}
                                onChange={(e) => setRejectCategory(e.target.value)}
                                className="w-full mt-1 px-3 py-2 border border-rose-200 rounded-xl text-xs font-bold text-rose-900 focus:outline-none focus:border-rose-400 bg-white"
                              >
                                <option value="Missing Documents">Missing Documents</option>
                                <option value="Fee Clearance Pending">Fee Clearance Pending</option>
                                <option value="Library Clearance Pending">Library Clearance Pending</option>
                                <option value="Transport Clearance Pending">Transport Clearance Pending</option>
                                <option value="Laboratory Clearance Pending">Laboratory Clearance Pending</option>
                                <option value="Principal Verification Pending">Principal Verification Pending</option>
                                <option value="Incorrect Information">Incorrect Information</option>
                                <option value="Duplicate Request">Duplicate Request</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] font-black text-rose-800 uppercase tracking-widest">Remarks *</label>
                              <textarea 
                                value={rejectRemarks}
                                onChange={(e) => setRejectRemarks(e.target.value)}
                                rows={3}
                                placeholder="Provide detailed remarks..."
                                className="w-full mt-1 px-3 py-2 border border-rose-200 rounded-xl text-xs font-bold text-rose-900 focus:outline-none focus:border-rose-400 bg-white resize-none"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => { setShowRejectPanel(false); setRejectRemarks(""); }} className="px-4 py-2 bg-white text-gray-500 hover:bg-gray-100 border border-gray-200 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm">
                              Cancel
                            </button>
                            <button onClick={() => {
                              if (!rejectRemarks.trim()) return alert("Remarks are required.");
                              handleReject(req.id, rejectCategory, rejectRemarks);
                              setShowRejectPanel(false);
                            }} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md">
                              Confirm Reject
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Card 6: Mark School Completed Action */}
                      {req._source === "completion" && req._isNew && (
                        <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 shadow-sm space-y-4">
                          <h4 className="text-xs font-black text-[#03045e] mb-2">
                            School Completion Action
                          </h4>
                          <div className="space-y-3 pb-3">
                            <div>
                              <label className="text-[10px] font-black text-blue-800 uppercase tracking-widest block mb-1">Completion Date *</label>
                              <input 
                                type="date"
                                value={completionDate}
                                onChange={(e) => setCompletionDate(e.target.value)}
                                className="w-full px-3 py-2 border border-blue-200 rounded-xl text-xs font-bold text-blue-900 focus:outline-none focus:border-blue-400 bg-white"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-black text-blue-800 uppercase tracking-widest block mb-1">Remarks (Optional)</label>
                              <textarea 
                                value={completionRemarks}
                                onChange={(e) => setCompletionRemarks(e.target.value)}
                                rows={2}
                                placeholder="Successfully completed schooling..."
                                className="w-full px-3 py-2 border border-blue-200 rounded-xl text-xs font-bold text-blue-900 focus:outline-none focus:border-blue-400 bg-white resize-none"
                              />
                            </div>
                          </div>
                          <p className="text-[10px] text-blue-700 font-bold">
                            By marking this student as &quot;School Completed&quot;, their status will change across the system and they will become eligible for final certificate issuance.
                          </p>
                          <button
                            onClick={() => handleMarkSchoolCompleted(req.studentId)}
                            className="w-full py-3 bg-[#03045e] hover:bg-[#0077b6] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 size={16} /> Mark School Completed
                          </button>
                        </div>
                      )}

                      {/* Card 5: Generated Documents (If Approved or Completion) */}
                      {(req.status === "Approved" || (req._source === "completion" && !req._isNew)) && (
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm opacity-90">
                          <h4 className="text-xs font-black text-[#03045e] mb-4 flex items-center gap-2 border-b border-gray-50 pb-2">
                            <Printer size={16} className="text-gray-400" /> Official Document Processing
                          </h4>
                          {req._source === "withdrawal" && !req.originalClearanceReceived && (
                             <div className="p-3 mb-4 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold border border-amber-100 flex items-center gap-2">
                               <Clock size={14} /> Waiting for original signed Clearance Form.
                             </div>
                          )}
                          
                          {(!req.documentsPreparationStarted) && (req._source === "completion" || req.originalClearanceReceived) ? (
                            <div className="p-4 border border-blue-100 bg-blue-50 rounded-xl mb-4">
                              <p className="text-xs font-bold text-blue-800 mb-3">Clearance has been verified. You can now start processing the official documents.</p>
                              <button
                                onClick={() => handleStartPrep(req)}
                                className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-sm bg-[#03045e] text-white hover:bg-[#0077b6]"
                              >
                                Start Document Preparation
                              </button>
                            </div>
                          ) : req.documentsPreparationStarted && !req.documentsReadyForCollection ? (
                             <div className="p-4 border border-amber-100 bg-amber-50 rounded-xl mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                               <div>
                                 <p className="text-xs font-black text-amber-800 uppercase tracking-widest">Processing Documents</p>
                                 <p className="text-[10px] text-amber-700 font-bold mt-1">Started on {new Date(req.documentsPreparationDate).toLocaleDateString()} by {req.documentsPreparationBy}</p>
                               </div>
                               <button
                                 onClick={() => handleMarkReady(req)}
                                 className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-sm bg-emerald-600 text-white hover:bg-emerald-700 whitespace-nowrap"
                               >
                                 Mark Ready For Collection
                               </button>
                             </div>
                          ) : req.documentsReadyForCollection ? (
                             <div className="p-4 border border-emerald-100 bg-emerald-50 rounded-xl mb-4 flex justify-between items-center">
                               <div>
                                 <p className="text-xs font-black text-emerald-800 uppercase tracking-widest">Ready for Collection</p>
                                 <p className="text-[10px] text-emerald-700 font-bold mt-1">Marked ready on {new Date(req.documentsReadyDate).toLocaleDateString()} by {req.documentsReadyBy}</p>
                               </div>
                             </div>
                          ) : null}

                          {req.documentsPreparationStarted && (
                            <div className="space-y-3">
                            {[
                              { key: "transferCertificate", label: "Transfer Certificate" },
                              { key: "characterCertificate", label: "Character Certificate" },
                              { key: "migrationCertificate", label: "Migration Certificate (Optional)" },
                            ].map(doc => {
                              const isGen = req._source === "completion" ? req.documents?.[doc.key] : req.generatedDocuments?.[doc.key];
                              const genDate = req._source === "completion" ? req.generatedDocumentDates?.[doc.key] : req.generatedDocumentDates?.[doc.key];
                              return (
                                <div key={doc.key} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-colors gap-3 ${isGen ? 'bg-emerald-50/50 border-emerald-100' : 'bg-gray-50 border-gray-100'}`}>
                                  <div>
                                    <span className="block text-xs font-black text-[#03045e]">{doc.label}</span>
                                    <span className={`text-[9px] font-black uppercase tracking-widest mt-1 inline-block ${isGen ? "text-emerald-500" : "text-amber-500"}`}>
                                      {isGen ? `Issued ${genDate ? `on ${new Date(genDate).toLocaleDateString()}` : ''}` : "Not Issued"}
                                    </span>
                                  </div>
                                  <div className="flex gap-2">
                                    {isGen ? (
                                      <>
                                        <div className="px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1.5 shadow-sm">
                                          <CheckCircle2 size={12} /> Issued
                                        </div>
                                        <button
                                          onClick={() => handlePreviewDoc(req, doc.key)}
                                          className="px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-sm bg-white text-[#03045e] border border-gray-200 hover:bg-gray-50"
                                        >
                                          Preview
                                        </button>
                                      </>
                                    ) : (
                                      <button
                                        onClick={() => req._source === "completion" ? handleGenerateCompletionDoc(req, doc.key) : handleGenerateDoc(req, doc.key)}
                                        disabled={req._source === "withdrawal" && !req.originalClearanceReceived}
                                        className="px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed bg-[#03045e] text-white hover:bg-[#0077b6]"
                                      >
                                        Issue Document
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          )}
                        </div>
                      )}
                      
                    </>
                  );
                })()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      <DocumentPreviewModal 
        isOpen={previewOpen} 
        onClose={() => setPreviewOpen(false)}
        title={
          tcData?.previewDocType === "clearanceForm" ? "Clearance Form Preview" : 
          tcData?.previewDocType === "characterCertificate" ? "Character Certificate Preview" : 
          tcData?.previewDocType === "migrationCertificate" ? "Migration Certificate Preview" : 
          "Transfer Certificate Preview"
        }
      >
        {tcData && tcData.previewDocType === "clearanceForm" && (
          <ClearanceForm
            student={getStudentInfo(tcData.studentId)}
            request={tcData}
            school={{ name: "EduDash International School", address: "123 Education Boulevard, Knowledge City", affiliation: "Affiliated to C.B.S.E, New Delhi" }}
          />
        )}
        {tcData && tcData.previewDocType === "transferCertificate" && (
          <TransferCertificate
            student={getStudentInfo(tcData.studentId)}
            request={tcData}
            school={{ name: "EduDash International School", address: "123 Education Boulevard, Knowledge City", affiliation: "Affiliated to C.B.S.E, New Delhi" }}
            tcNumber={generateMockCertificateNumber("transferCertificate", tcData.id)}
            issueDate={tcData._source === "completion" ? tcData.generatedDocumentDates?.transferCertificate : tcData.generatedDocumentDates?.transferCertificate || new Date().toISOString()}
            generatedBy="Administrator"
          />
        )}
        {tcData && tcData.previewDocType === "characterCertificate" && (
          <CharacterCertificate
            student={getStudentInfo(tcData.studentId)}
            request={tcData}
            school={{ name: "EduDash International School", address: "123 Education Boulevard, Knowledge City", affiliation: "Affiliated to C.B.S.E, New Delhi" }}
            certificateNumber={generateMockCertificateNumber("characterCertificate", tcData.id)}
            issueDate={tcData._source === "completion" ? tcData.generatedDocumentDates?.characterCertificate : tcData.generatedDocumentDates?.characterCertificate || new Date().toISOString()}
            generatedBy="Administrator"
          />
        )}
        {tcData && tcData.previewDocType === "migrationCertificate" && (
          <MigrationCertificate
            student={getStudentInfo(tcData.studentId)}
            request={tcData}
            school={{ name: "EduDash International School", address: "123 Education Boulevard, Knowledge City", affiliation: "Affiliated to C.B.S.E, New Delhi" }}
            certificateNumber={generateMockCertificateNumber("migrationCertificate", tcData.id)}
            issueDate={tcData._source === "completion" ? tcData.generatedDocumentDates?.migrationCertificate : tcData.generatedDocumentDates?.migrationCertificate || new Date().toISOString()}
            generatedBy="Administrator"
          />
        )}
      </DocumentPreviewModal>
    </div>
  );
};

export default StudentExitManagementPage;
