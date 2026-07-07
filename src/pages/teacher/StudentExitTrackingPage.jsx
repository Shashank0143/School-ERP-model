import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileMinus, CheckCircle2, XCircle, Clock, Search, X, Users, CheckSquare, 
  FileText, Printer
} from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import PageAuthorityBanner from "../../components/admin/PageAuthorityBanner";
import OperationsStatCard from "../../components/admin/operations/OperationsStatCard";
import AdminSectionCard from "../../components/admin/AdminSectionCard";
import { getAllRequests, getAllCompletionRecords } from "../../services/studentExitService";
import { getItem } from "../../persistence/storage";
import { STORAGE_KEYS } from "../../persistence/storageKeys";
import DocumentPreviewModal from "../../components/common/documents/DocumentPreviewModal";
import TransferCertificate from "../../components/common/documents/TransferCertificate";
import CharacterCertificate from "../../components/common/documents/CharacterCertificate";
import MigrationCertificate from "../../components/common/documents/MigrationCertificate";
import { generateMockCertificateNumber } from "../../utils/documentUtils";
import { useAuth } from "../../context/AuthContext";

const StudentExitTrackingPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [completionRecords, setCompletionRecords] = useState([]);
  const [parents, setParents] = useState([]);
  
  const [activeTab, setActiveTab] = useState("withdrawal");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  // Drawer state
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // TC Preview State
  const [previewOpen, setPreviewOpen] = useState(false);
  const [tcData, setTcData] = useState(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    try {
      const allReqs = getAllRequests();
      const allCompletions = getAllCompletionRecords();
      const allStudents = getItem(STORAGE_KEYS.STUDENTS, []);
      const allClasses = getItem(STORAGE_KEYS.CLASSES, []);
      const allParents = getItem(STORAGE_KEYS.PARENTS, []);
      
      const teacherClass = allClasses.find(c => c.classTeacherId === user?.id);
      if (!teacherClass) {
        setRequests([]);
        setCompletionRecords([]);
        setStudents([]);
        setClasses([]);
        return;
      }
      
      const classStudentIds = allStudents.filter(s => s.classId === teacherClass.id).map(s => s.id);
      
      setRequests(allReqs.filter(r => classStudentIds.includes(r.studentId)).sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate)));
      setCompletionRecords(allCompletions.filter(r => classStudentIds.includes(r.studentId)));
      setStudents(allStudents);
      setClasses(allClasses);
      setParents(allParents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh drawer data when requests state updates
  useEffect(() => {
    if (selectedRequest) {
      const updatedReq = requests.find(r => r.id === selectedRequest.id);
      if (updatedReq) {
        setSelectedRequest(updatedReq);
      }
    }
  }, [requests, selectedRequest?.id]);

  const handlePreviewDoc = (req, docKey) => {
    try { 
      if (docKey === "transferCertificate" || docKey === "characterCertificate" || docKey === "migrationCertificate") {
        setTcData({...req, previewDocType: docKey});
        setPreviewOpen(true);
      }
    } catch(e) { console.error(e); }
  };

  const filteredRequests = requests.filter(req => {
    const s = students.find(x => x.id === req.studentId);
    const searchMatch = !searchTerm || (s?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || req.id.toLowerCase().includes(searchTerm.toLowerCase()));
    const statusMatch = statusFilter === "All" || req.status === statusFilter;
    return searchMatch && statusMatch;
  });

  const filteredCompletionRecords = completionRecords.filter(req => {
    const s = students.find(x => x.id === req.studentId);
    const searchMatch = !searchTerm || (s?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || (s?.admissionNo || s?.admissionNumber || "").toLowerCase().includes(searchTerm.toLowerCase()));
    return searchMatch;
  });

  const stats = {
    pending: requests.filter(r => r.status === "Pending Review").length,
    approved: requests.filter(r => r.status === "Approved").length,
    rejected: requests.filter(r => r.status === "Rejected").length,
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
        title="Student Exit Tracking"
        description="Monitor withdrawal requests and school completion for your assigned class."
        breadcrumbs={["Teacher Portal", "Class Tracking", "Exit Tracking"]}
      />
      <PageAuthorityBanner moduleId="teacher_student_exit" moduleName="Student Exit Tracking" />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <OperationsStatCard title="Pending Requests" value={stats.pending.toString()} description="Awaiting review" icon={Clock} />
        <OperationsStatCard title="Approved" value={stats.approved.toString()} description="Requests approved" icon={CheckCircle2} color="#10b981" bg="#d1fae5" />
        <OperationsStatCard title="Rejected" value={stats.rejected.toString()} description="Requests rejected" icon={XCircle} color="#ef4444" bg="#fee2e2" />
        <OperationsStatCard title="School Completed" value={stats.completed.toString()} description="Students who completed schooling" icon={Users} color="#03045e" bg="#e0f2fe" />
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
                <option value="Rejected">Rejected</option>
              </>
            ) : (
              <>
                <option value="All">All Records</option>
              </>
            )}
          </select>
          {activeTab === "withdrawal" && (
            <select 
              value={exitTypeFilter} 
              onChange={e => setExitTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-[#03045e] focus:outline-none focus:border-[#00b4d8]"
            >
              <option value="All">All Exit Types</option>
              <option value="Withdrawal">Withdrawal</option>
              <option value="Completed School Education">Completed School Education</option>
            </select>
          )}
          <button onClick={() => { setSearchTerm(""); setStatusFilter("All"); setExitTypeFilter("All"); }} className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 bg-gray-50 rounded-xl border border-gray-200 transition-colors">
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
                      <tr key={req.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => setSelectedRequest({...req, _source: "withdrawal"})}>
                        <td className="py-3 px-3 text-xs font-black text-[#03045e]">{req.id.substring(0,8).toUpperCase()}</td>
                        <td className="py-3 px-3">
                          <span className="block text-xs font-black text-[#03045e]">{s ? s.name : "Unknown"}</span>
                          <span className="block text-[10px] text-gray-400 font-bold">{s ? `${s.className} | Admn: ${s.admissionNumber}` : ""}</span>
                        </td>
                        <td className="py-3 px-3 text-xs font-bold text-gray-600">{isCompleted ? "Completion" : "Withdrawal"}</td>
                        <td className="py-3 px-3 text-xs font-bold text-gray-500">{new Date(req.appliedDate).toLocaleDateString()}</td>
                        <td className="py-3 px-3">
                          {req.status === "Pending Review" && <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[9px] font-black uppercase tracking-wider">Pending Review</span>}
                          {req.status === "Approved" && <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-black uppercase tracking-wider">Approved</span>}
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
                            onClick={(e) => { e.stopPropagation(); setSelectedRequest({...req, _source: "withdrawal"}); }}
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
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No requests found matching filters.</p>
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
                    <th className="py-4 px-3">Completion Date</th>
                    <th className="py-4 px-3">Status</th>
                    <th className="py-4 px-3">Docs Generated</th>
                    <th className="py-4 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredCompletionRecords.map(req => {
                    const s = getStudentInfo(req.studentId);
                    const isDocsGen = req.documents?.transferCertificate && req.documents?.characterCertificate;
                    
                    return (
                      <tr key={req.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => setSelectedRequest({...req, _source: "completion"})}>
                        <td className="py-3 px-3">
                          <span className="block text-xs font-black text-[#03045e]">{s ? s.name : "Unknown"}</span>
                          <span className="block text-[10px] text-gray-400 font-bold">{s ? `Admn: ${s.admissionNo || s.admissionNumber}` : ""}</span>
                        </td>
                        <td className="py-3 px-3 text-xs font-bold text-gray-600">{s ? s.className : "N/A"}</td>
                        <td className="py-3 px-3 text-xs font-bold text-gray-500">{new Date(req.completedDate).toLocaleDateString()}</td>
                        <td className="py-3 px-3">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-black uppercase tracking-wider">School Completed</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`text-[10px] font-black uppercase tracking-wider ${isDocsGen ? "text-emerald-500" : "text-amber-500"}`}>
                            {isDocsGen ? "Yes" : "Pending"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedRequest({...req, _source: "completion"}); }}
                            className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest bg-[#caf0f8] text-[#03045e] hover:bg-[#00b4d8] hover:text-white rounded-lg transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredCompletionRecords.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No completion records found.</p>
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

                      {/* Card 2: Application Details (Withdrawal Only) */}
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
                              <div className="flex items-start gap-3">
                                <div className="mt-1 flex flex-col items-center">
                                  <div className="w-2 h-2 rounded-full bg-[#00b4d8] ring-4 ring-[#caf0f8]" />
                                  {req.documents?.transferCertificate && <div className="w-px h-6 bg-gray-200 mt-1" />}
                                </div>
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-[#03045e]">School Completed</p>
                                  <p className="text-[9px] font-bold text-gray-400">{new Date(req.completedDate).toLocaleString()}</p>
                                </div>
                              </div>
                              {(req.documents?.transferCertificate || req.documents?.characterCertificate || req.documents?.migrationCertificate) && (
                                <div className="flex items-start gap-3">
                                  <div className="mt-1 flex flex-col items-center">
                                    <div className="w-2 h-2 rounded-full ring-4 bg-emerald-500 ring-emerald-50" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#03045e]">Documents Issued</p>
                                    <p className="text-[9px] font-bold text-gray-400">Certificates have been successfully generated.</p>
                                  </div>
                                </div>
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
                                  {req.generatedDocuments?.transferCertificate && <div className="w-px h-6 bg-gray-200 mt-1" />}
                                </div>
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-[#03045e]">Original Form Received</p>
                                  <p className="text-[9px] font-bold text-gray-400">{new Date(req.originalClearanceReceivedDate).toLocaleString()}</p>
                                </div>
                              </div>
                            )}

                            {req.generatedDocuments?.transferCertificate && (
                              <div className="flex items-start gap-3">
                                <div className="mt-1 flex flex-col items-center">
                                  <div className="w-2 h-2 rounded-full ring-4 bg-emerald-500 ring-emerald-50" />
                                  {req.generatedDocuments?.characterCertificate && <div className="w-px h-6 bg-gray-200 mt-1" />}
                                </div>
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-[#03045e]">Transfer Certificate Issued</p>
                                  <p className="text-[9px] font-bold text-gray-400">{new Date(req.generatedDocumentDates?.transferCertificate).toLocaleString()}</p>
                                </div>
                              </div>
                            )}

                            {req.generatedDocuments?.characterCertificate && (
                              <div className="flex items-start gap-3">
                                <div className="mt-1 flex flex-col items-center">
                                  <div className="w-2 h-2 rounded-full ring-4 bg-emerald-500 ring-emerald-50" />
                                  {req.generatedDocuments?.migrationCertificate && <div className="w-px h-6 bg-gray-200 mt-1" />}
                                </div>
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-[#03045e]">Character Certificate Issued</p>
                                  <p className="text-[9px] font-bold text-gray-400">{new Date(req.generatedDocumentDates?.characterCertificate).toLocaleString()}</p>
                                </div>
                              </div>
                            )}

                            {req.generatedDocuments?.migrationCertificate && (
                              <div className="flex items-start gap-3">
                                <div className="mt-1 flex flex-col items-center">
                                  <div className="w-2 h-2 rounded-full ring-4 bg-emerald-500 ring-emerald-50" />
                                  {req.originalClearanceReceived && req.generatedDocuments?.transferCertificate && req.generatedDocuments?.characterCertificate && <div className="w-px h-6 bg-gray-200 mt-1" />}
                                </div>
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-[#03045e]">Migration Certificate Issued</p>
                                  <p className="text-[9px] font-bold text-gray-400">{new Date(req.generatedDocumentDates?.migrationCertificate).toLocaleString()}</p>
                                </div>
                              </div>
                            )}

                            {req.originalClearanceReceived && req.generatedDocuments?.transferCertificate && req.generatedDocuments?.characterCertificate && (
                              <div className="flex items-start gap-3">
                                <div className="mt-1 flex flex-col items-center">
                                  <CheckCircle2 size={16} className="text-[#03045e] bg-[#caf0f8] rounded-full ring-4 ring-[#caf0f8]" />
                                </div>
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-[#03045e]">Exit Process Completed</p>
                                </div>
                              </div>
                            )}
                          </div>
                          )}
                        </div>
                      )}

                      {/* Card 5: Issued Documents (If Approved or Completion) */}
                      {(req.status === "Approved" || req._source === "completion") && (
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                          <h4 className="text-xs font-black text-[#03045e] mb-4 flex items-center gap-2 border-b border-gray-50 pb-2">
                            <Printer size={16} className="text-gray-400" /> Issued Documents
                          </h4>
                          <div className="space-y-3">
                            {[
                              { key: "transferCertificate", label: "Transfer Certificate" },
                              { key: "characterCertificate", label: "Character Certificate" },
                              { key: "migrationCertificate", label: "Migration Certificate" },
                            ].map(doc => {
                              const isGen = req._source === "completion" ? req.documents?.[doc.key] : req.generatedDocuments?.[doc.key];
                              const genDate = req._source === "completion" ? req.generatedDocumentDates?.[doc.key] : req.generatedDocumentDates?.[doc.key];
                              if (!isGen) return null;
                              return (
                                <div key={doc.key} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-colors gap-3 bg-emerald-50/50 border-emerald-100`}>
                                  <div>
                                    <span className="block text-xs font-black text-[#03045e]">{doc.label}</span>
                                    <span className={`text-[9px] font-black uppercase tracking-widest mt-1 inline-block text-emerald-500`}>
                                      Issued {genDate ? `on ${new Date(genDate).toLocaleDateString()}` : ''}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => handlePreviewDoc(req, doc.key)}
                                    className="px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-sm bg-white text-[#03045e] border border-gray-200 hover:bg-gray-50"
                                  >
                                    Preview
                                  </button>
                                </div>
                              );
                            })}
                          </div>
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
        hidePrint={true}
        title={
          tcData?.previewDocType === "characterCertificate" ? "Character Certificate Preview" : 
          tcData?.previewDocType === "migrationCertificate" ? "Migration Certificate Preview" : 
          "Transfer Certificate Preview"
        }
      >
        {tcData && tcData.previewDocType === "transferCertificate" && (
          <TransferCertificate
            student={getStudentInfo(tcData.studentId)}
            request={tcData}
            school={{ name: "EduDash International School", address: "123 Education Boulevard, Knowledge City", affiliation: "Affiliated to C.B.S.E, New Delhi" }}
            tcNumber={generateMockCertificateNumber("transferCertificate", tcData.id)}
            issueDate={tcData._source === "completion" ? tcData.generatedDocumentDates?.transferCertificate : tcData.generatedDocumentDates?.transferCertificate || new Date().toISOString()}
            generatedBy="System"
          />
        )}
        {tcData && tcData.previewDocType === "characterCertificate" && (
          <CharacterCertificate
            student={getStudentInfo(tcData.studentId)}
            request={tcData}
            school={{ name: "EduDash International School", address: "123 Education Boulevard, Knowledge City", affiliation: "Affiliated to C.B.S.E, New Delhi" }}
            certificateNumber={generateMockCertificateNumber("characterCertificate", tcData.id)}
            issueDate={tcData._source === "completion" ? tcData.generatedDocumentDates?.characterCertificate : tcData.generatedDocumentDates?.characterCertificate || new Date().toISOString()}
            generatedBy="System"
          />
        )}
        {tcData && tcData.previewDocType === "migrationCertificate" && (
          <MigrationCertificate
            student={getStudentInfo(tcData.studentId)}
            request={tcData}
            school={{ name: "EduDash International School", address: "123 Education Boulevard, Knowledge City", affiliation: "Affiliated to C.B.S.E, New Delhi" }}
            certificateNumber={generateMockCertificateNumber("migrationCertificate", tcData.id)}
            issueDate={tcData._source === "completion" ? tcData.generatedDocumentDates?.migrationCertificate : tcData.generatedDocumentDates?.migrationCertificate || new Date().toISOString()}
            generatedBy="System"
          />
        )}
      </DocumentPreviewModal>
    </div>
  );
};

export default StudentExitTrackingPage;
