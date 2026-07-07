import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  BookOpen,
  PieChart,
  Medal,
  CheckCircle,
  Download,
  Eye,
  X,
  FileText,
  Printer
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import HelperButton from "../../components/HelperButton";
import HelperPopup from "../../components/HelperPopup";
import MainCard from "../../components/MainCard";
import { getAllExams, getStudentResults } from "../../services/examService";
import { getReportCardsForStudent } from "../../services/reportCardService";
import PrintableReportCard from "../admin/examinations/academic-report-cards/components/PrintableReportCard";
import { useService } from "../../hooks/useService";
import { useAuth } from "../../context/AuthContext";
import { useStudent } from "../../context/StudentContext";
import ChildScopeSwitcher from "../../components/parent/ChildScopeSwitcher";
import EmptyState from "../../components/common/EmptyState";

const NAVY = "#03045e";
const TEAL = "#0077b6";
const SAGE = "#00b4d8";
const LIME = "#caf0f8";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: "easeOut" },
  },
};

function AcademicResultsPage() {
  const { t } = useLanguage();
  const { activeStudentId } = useStudent();
  const [showHelper, setShowHelper] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState("");
  const [reportCardPreviewOpen, setReportCardPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("exam-wise"); // 'exam-wise' | 'report-card'

  const { data: allExams, loading: allExamsLoading, error: examError } = useService(getAllExams, []);
  const { data: results, loading: resultsLoading, error: resultsError } = useService(
    getStudentResults, 
    [activeStudentId], 
    [activeStudentId]
  );
  const { data: reportCards, loading: reportCardsLoading } = useService(
    getReportCardsForStudent,
    [activeStudentId],
    [activeStudentId]
  );

  if (examError || resultsError) {
    throw examError || resultsError;
  }

  const loading = allExamsLoading || resultsLoading || reportCardsLoading;

  // Filter only published exams
  const publishedExams = useMemo(() => {
    return (allExams || [])
      .filter(e => e.status === 'published')
      .sort((a, b) => new Date(b.publishedAt || b.startDate) - new Date(a.publishedAt || a.startDate));
  }, [allExams]);

  // Set default active session
  React.useEffect(() => {
    if (publishedExams.length > 0 && !activeSessionId) {
      setActiveSessionId(publishedExams[0].id);
    }
  }, [publishedExams, activeSessionId]);

  const activeExam = useMemo(() => publishedExams.find(e => e.id === activeSessionId), [publishedExams, activeSessionId]);
  
  const currentResults = useMemo(() => {
    if (!activeSessionId) return [];
    return (results || []).filter(r => r.examId === activeSessionId || r.examId === activeExam?.examId);
  }, [results, activeSessionId, activeExam]);

  const performanceSummary = useMemo(() => {
    if (!currentResults.length) return null;
    let totalMax = 0;
    let totalObtained = 0;
    currentResults.forEach(r => {
      totalMax += Number(r.maxMarks || 0);
      totalObtained += Number(r.marksObtained || 0);
    });
    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
    
    let grade = "F";
    let isPass = false;
    if (percentage >= 91) { grade = "A1"; isPass = true; }
    else if (percentage >= 81) { grade = "A2"; isPass = true; }
    else if (percentage >= 71) { grade = "B1"; isPass = true; }
    else if (percentage >= 61) { grade = "B2"; isPass = true; }
    else if (percentage >= 51) { grade = "C1"; isPass = true; }
    else if (percentage >= 41) { grade = "C2"; isPass = true; }
    else if (percentage >= 33) { grade = "D"; isPass = true; }

    return {
      subjects: currentResults.length,
      percentage: percentage.toFixed(1),
      grade,
      isPass,
      totalMax,
      totalObtained
    };
  }, [currentResults]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="relative print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl shadow-sm flex-shrink-0" style={{ backgroundColor: NAVY }}>
              <Award size={26} className="text-white" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-black truncate" style={{ color: NAVY }}>
                Academic Results
              </h1>
              <p className="text-sm text-gray-500 truncate">View your published examination results and report cards</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
             <ChildScopeSwitcher />
             <div className="bg-white rounded-xl border border-gray-200 px-3 py-2 shadow-sm flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Exam:</span>
                <select 
                  className="bg-transparent text-sm font-black text-[#03045e] focus:outline-none"
                  value={activeSessionId}
                  onChange={(e) => setActiveSessionId(e.target.value)}
                  disabled={publishedExams.length === 0}
                >
                  {publishedExams.length === 0 ? (
                    <option value="">No published exams</option>
                  ) : (
                    publishedExams.map(e => (
                      <option key={e.id} value={e.id}>{e.name} ({e.academicYear})</option>
                    ))
                  )}
                </select>
             </div>
             <HelperButton onClick={() => setShowHelper(true)} />
          </div>
        </div>

        <div className="flex items-center gap-4 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("exam-wise")}
            className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "exam-wise"
                ? "border-[#0077b6] text-[#0077b6]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Exam-wise Results
          </button>
          <button
            onClick={() => setActiveTab("report-card")}
            className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "report-card"
                ? "border-[#0077b6] text-[#0077b6]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Final Report Cards
          </button>
        </div>

        {activeTab === 'exam-wise' ? (
          publishedExams.length === 0 ? (
            <MainCard className="h-[400px] flex items-center justify-center bg-white border border-dashed border-gray-300">
              <EmptyState 
                icon={Award}
                title="No Results Published"
                description="No published results are currently available."
              />
            </MainCard>
          ) : currentResults.length === 0 ? (
            <MainCard className="h-[300px] flex items-center justify-center bg-white border border-dashed border-gray-300">
              <EmptyState 
                icon={FileText}
                title="No Results Found"
                description="No results found for this examination."
              />
            </MainCard>
          ) : (
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* LEFT COLUMN: SUBJECT MARKS */}
            <div className="lg:col-span-2 space-y-6">
               <MainCard variants={cardVariants} className="bg-white border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50">
                    <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                      <BookOpen size={18} />
                    </div>
                    <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider">
                      Subject Results
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-black tracking-wider border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-4">Subject</th>
                          <th className="px-6 py-4 text-center">Marks</th>
                          <th className="px-6 py-4 text-center">Grade</th>
                          <th className="px-6 py-4 text-right">Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {currentResults.map(r => {
                          const isPass = r.grade && !r.grade.includes('F') && !r.grade.includes('E');
                          return (
                            <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-bold text-[#03045e]">{r.subjectName}</div>
                                {r.remarks && <div className="text-[10px] text-gray-400 italic mt-0.5">{r.remarks}</div>}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="font-black text-[#0077b6]">{r.marksObtained}</span>
                                <span className="text-[10px] text-gray-400 font-bold ml-1">/ {r.maxMarks}</span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="px-2.5 py-1 bg-gray-100 text-gray-700 font-black text-[11px] rounded-lg">{r.grade}</span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded ${
                                  isPass ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                }`}>
                                  {isPass ? 'Pass' : 'Fail'}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
               </MainCard>
            </div>

            {/* RIGHT COLUMN: PERFORMANCE SUMMARY & DOWNLOADS */}
            <div className="space-y-6">
              
              {/* Performance Summary */}
              {performanceSummary && (
                <MainCard variants={cardVariants} className="bg-white border border-gray-100 overflow-hidden">
                   <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50">
                     <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                       <PieChart size={18} />
                     </div>
                     <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider">
                       Performance Summary
                     </h3>
                   </div>
                   <div className="p-5">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                         <div className="p-4 bg-gray-50 rounded-2xl text-center border border-gray-100">
                            <div className="text-2xl font-black text-[#03045e]">{performanceSummary.subjects}</div>
                            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Subjects</div>
                         </div>
                         <div className="p-4 bg-gray-50 rounded-2xl text-center border border-gray-100">
                            <div className="text-2xl font-black text-[#0077b6]">{performanceSummary.percentage}%</div>
                            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Percentage</div>
                         </div>
                      </div>
                      
                      <div className="p-4 rounded-2xl flex items-center justify-between" style={{ backgroundColor: LIME }}>
                         <div>
                           <div className="text-[10px] font-bold text-[#0077b6] uppercase tracking-widest">Overall Grade</div>
                           <div className="text-xl font-black text-[#03045e]">{performanceSummary.grade}</div>
                         </div>
                         <div className="text-right">
                           <div className="text-[10px] font-bold text-[#0077b6] uppercase tracking-widest">Final Result</div>
                           <div className={`text-lg font-black uppercase tracking-wider ${performanceSummary.isPass ? 'text-emerald-600' : 'text-red-600'}`}>
                             {performanceSummary.isPass ? 'PASS' : 'FAIL'}
                           </div>
                         </div>
                      </div>
                   </div>
                </MainCard>
              )}

              {/* Downloads & Actions */}
              <MainCard variants={cardVariants} className="bg-white border border-gray-100 overflow-hidden">
                 <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50">
                   <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
                     <Download size={18} />
                   </div>
                   <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider">
                     Downloads & Reports
                   </h3>
                 </div>
                 <div className="p-5 space-y-3">
                    <button 
                      onClick={() => setReportCardPreviewOpen(true)}
                      className="w-full p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                    >
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                           <Eye size={18} />
                         </div>
                         <div className="text-left">
                           <div className="text-sm font-black text-[#03045e]">Preview Report Card</div>
                           <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">View institutional format</div>
                         </div>
                       </div>
                    </button>
                    <button 
                      onClick={() => {
                        setReportCardPreviewOpen(true);
                        setTimeout(() => window.print(), 300);
                      }}
                      className="w-full p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                    >
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                           <FileText size={18} />
                         </div>
                         <div className="text-left">
                           <div className="text-sm font-black text-[#03045e]">Download PDF</div>
                           <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Save official marksheet</div>
                         </div>
                       </div>
                    </button>
                 </div>
              </MainCard>
            </div>
          </motion.div>
          )
        ) : (
          /* REPORT CARD TAB */
          <div className="space-y-8">
            {reportCards && reportCards.filter(c => c.status === "Published" || c.status === "Frozen").length > 0 ? (
              reportCards.filter(c => c.status === "Published" || c.status === "Frozen").map((card, idx) => (
                <div key={card.id} className="relative">
                  <div className="absolute top-4 right-8 z-10 print:hidden flex gap-2">
                    <button
                      onClick={() => window.print()}
                      className="bg-white/80 backdrop-blur text-[#03045e] border border-gray-200 shadow hover:bg-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"
                    >
                      <Printer size={16} /> Print Card
                    </button>
                  </div>
                  <PrintableReportCard card={card} />
                </div>
              ))
            ) : (
              <MainCard className="h-[400px] flex items-center justify-center bg-white border border-dashed border-gray-300">
                <EmptyState 
                  icon={Award}
                  title="No Report Cards"
                  description="No final academic report cards have been published yet."
                />
              </MainCard>
            )}
          </div>
        )}
      </div>

      {/* REPORT CARD PREVIEW MODAL */}
      <AnimatePresence>
        {reportCardPreviewOpen && activeExam && performanceSummary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-[95vw] md:w-[90vw] lg:max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden border border-[#caf0f8]/30 flex flex-col"
            >
              <div className="p-6 bg-[#03045e] text-white flex justify-between items-center border-b border-white/10">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">
                    Institutional Report Card Preview
                  </h3>
                  <p className="text-[10px] text-[#ade8f4] font-bold uppercase mt-0.5">
                    {activeExam.name}
                  </p>
                </div>
                <button
                  onClick={() => setReportCardPreviewOpen(false)}
                  className="p-1 rounded-xl hover:bg-white/10 text-white/80 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Printable sheet container */}
              <div className="p-8 space-y-6 overflow-y-auto max-h-[60vh] bg-neutral-50/50 custom-scrollbar print:p-0 print:bg-white print:max-h-none print:overflow-visible">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 font-serif text-[#03045e] print:border-none print:shadow-none print:p-0">
                  <div className="text-center space-y-1 pb-4 border-b border-double border-gray-300">
                    <h2 className="text-base font-black uppercase tracking-widest font-sans">
                      SPRINGDALE SENIOR SECONDARY SCHOOL
                    </h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-sans">
                      Affiliated with CBSE, New Delhi | Institutional Campus
                    </p>
                    <h3 className="text-xs font-black uppercase tracking-widest underline pt-2 text-[#0077b6] font-sans">
                      REPORT SHEET: {activeExam.name.toUpperCase()}
                    </h3>
                  </div>

                  <div className="overflow-x-auto w-full">
                    <table className="w-full border-collapse text-left text-xs font-sans">
                      <thead>
                        <tr className="bg-gray-50 border-b border-t border-gray-200 text-gray-500 uppercase tracking-widest font-black text-[10px]">
                          <th className="py-3 px-4">Subject</th>
                          <th className="py-3 px-4 text-center">Max Marks</th>
                          <th className="py-3 px-4 text-center">Obtained</th>
                          <th className="py-3 px-4 text-center">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {currentResults.map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="py-3 px-4 font-bold text-gray-800">{row.subjectName}</td>
                            <td className="py-3 px-4 text-center font-medium text-gray-500">{row.maxMarks}</td>
                            <td className="py-3 px-4 text-center font-black text-[#0077b6]">{row.marksObtained}</td>
                            <td className="py-3 px-4 text-center">
                              <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-black">{row.grade}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-b border-gray-200 bg-gray-50">
                          <td className="py-3 px-4 font-black text-[#03045e] uppercase tracking-wider">Grand Total</td>
                          <td className="py-3 px-4 text-center font-black text-gray-700">{performanceSummary.totalMax}</td>
                          <td className="py-3 px-4 text-center font-black text-[#03045e]">{performanceSummary.totalObtained}</td>
                          <td className="py-3 px-4 text-right">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mr-2">Overall %</span>
                            <span className="text-lg font-black text-emerald-600">{performanceSummary.percentage}%</span>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  
                  <div className="flex justify-between items-end pt-12 pb-4 font-sans text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <div className="border-t border-gray-300 w-32 text-center pt-2">Class Teacher</div>
                    <div className="border-t border-gray-300 w-32 text-center pt-2">Principal</div>
                    <div className="border-t border-gray-300 w-32 text-center pt-2">Parent/Guardian</div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="px-6 py-2.5 rounded-xl bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 transition-colors text-sm flex items-center gap-2"
                >
                  <FileText size={16} /> Print Report
                </button>
                <button
                  onClick={() => setReportCardPreviewOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition-colors text-sm"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <HelperPopup
        isOpen={showHelper}
        onClose={() => setShowHelper(false)}
        titleKey="Academic Results"
        contentEn="The Academic Results module displays your finalized grades for completed examinations. Select a published exam to view subject-wise marks, overall performance, and download your official report card."
        contentHi="अकादमिक परिणाम मॉड्यूल पूर्ण परीक्षाओं के लिए आपके अंतिम ग्रेड प्रदर्शित करता है। विषय-वार अंक, समग्र प्रदर्शन देखने और अपना आधिकारिक रिपोर्ट कार्ड डाउनलोड करने के लिए एक प्रकाशित परीक्षा का चयन करें।"
      />
    </>
  );
}

export default AcademicResultsPage;
