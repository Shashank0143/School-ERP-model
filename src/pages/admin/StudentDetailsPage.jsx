import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Edit3,
  UserX,
  Mail,
  Phone,
  MapPin,
  Car,
  FileText,
  User,
  Shield,
  Activity,
  Award
} from "lucide-react";

import AdminSectionCard from "../../components/admin/AdminSectionCard";
import AdminEditForm from "../../components/admin/AdminEditForm";
import ToastNotification from "../../shared/components/ToastNotification";
import LoadingSkeleton from "../../shared/components/LoadingSkeleton";
import { IDCard } from "../../components/common/id-card";
import IDCardPreviewModal from "../../components/common/id-card/IDCardPreviewModal";

// Services
import { getStudentProfile, updateStudentProfile, getDocuments } from "../../services/studentService";
import { getStudentResults } from "../../services/examService";
import { getAttendanceSummary } from "../../services/attendanceService";
import { getTransportSummary } from "../../services/transportService";

const StudentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [results, setResults] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [transport, setTransport] = useState(null);

  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [idCardModalOpen, setIdCardModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        profileData,
        resultsData,
        attendanceData,
        transportData
      ] = await Promise.all([
        getStudentProfile(id),
        getStudentResults(id).catch(() => []),
        getAttendanceSummary(id).catch(() => null),
        getTransportSummary(id).catch(() => null),
        getDocuments(id).catch(() => [])
      ]);

      setProfile(profileData);
      
      let finalResults = resultsData || [];
      // Fallback to embedded performance data if results are empty (e.g. mock DB missing)
      if (finalResults.length === 0 && profileData?.academic?.performance) {
        const perf = profileData.academic.performance;
        if (perf.subjectMarks) {
          finalResults = perf.subjectMarks.map(sm => ({
            subjectName: sm.subject,
            examName: perf.examName,
            marksObtained: sm.marksObtained,
            maxMarks: sm.maxMarks,
            grade: sm.grade,
          }));
        }
      }
      setResults(finalResults);
      setAttendance(attendanceData);
      setTransport(transportData);
    } catch (err) {
      console.error("Failed to load student details:", err);
      setToast({ show: true, message: "Failed to load details", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (formData) => {
    try {
      await updateStudentProfile(id, formData);
      setToast({ show: true, message: "Student updated successfully", type: "success" });
      fetchData(); // Refresh data
    } catch (e) {
      console.error(e);
      setToast({ show: true, message: "Failed to update student", type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <LoadingSkeleton variant="stat-card" />
        <LoadingSkeleton variant="stat-card" />
        <LoadingSkeleton variant="table-row" count={5} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center text-gray-500 font-bold">
        Student record not found.
      </div>
    );
  }

  // Student fields for Edit Form
  const studentFields = [
    { name: "name", label: "Student Full Name", type: "text", required: true },
    { name: "classLevel", label: "Class", type: "select", options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"] },
    { name: "section", label: "Section", type: "select", options: ["A", "B", "C", "D"] },
    { name: "phoneNumber", label: "Primary Contact", type: "text" },
    { name: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"] },
    { name: "category", label: "Category", type: "select", options: ["General", "OBC", "SC", "ST"] },
    { name: "dob", label: "Date of Birth", type: "text" },
    { name: "aadhar", label: "Aadhaar No", type: "text" },
    { name: "nationality", label: "Nationality", type: "text" },
    { name: "fatherName", label: "Father's Name", type: "text" },
    { name: "fatherPhone", label: "Father's Phone", type: "text" },
    { name: "motherName", label: "Mother's Name", type: "text" },
    { name: "motherPhone", label: "Mother's Phone", type: "text" }
  ];

  // Flatten profile for the form
  const flatProfile = {
    name: profile.personal?.fullName,
    classLevel: profile.academic?.class,
    section: profile.academic?.section,
    phoneNumber: profile.personal?.phoneNumber,
    gender: profile.personal?.gender,
    category: profile.personal?.category,
    dob: profile.personal?.dateOfBirth,
    aadhar: profile.personal?.aadhaarNumber,
    nationality: profile.personal?.nationality,
    fatherName: profile.family?.father?.name !== "N/A" ? profile.family?.father?.name : "",
    fatherPhone: profile.family?.father?.phoneNumber,
    motherName: profile.family?.mother?.name !== "N/A" ? profile.family?.mother?.name : "",
    motherPhone: profile.family?.mother?.phoneNumber,
  };

  const idCardData = profile ? {
    name: profile.personal?.fullName,
    photo: profile.personal?.photo || null,
    id: profile.personal?.admissionNumber || profile.personal?.studentId,
    class: profile.academic?.class,
    section: profile.academic?.section,
    role: "Student",
    bloodGroup: profile.personal?.bloodGroup,
    address: profile.personal?.address || profile.contact?.address?.permanent || profile.contact?.address?.current,
    emergencyContact: profile.family?.father?.phoneNumber || profile.family?.mother?.phoneNumber,
    parentName: profile.family?.father?.name !== "N/A" ? profile.family?.father?.name : profile.family?.mother?.name,
    status: profile.status || "Active",
    schoolName: "EduDash Academy"
  } : {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 pb-12"
    >
      {/* HEADER WITH ACTIONS */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-[#caf0f8]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/students')}
            className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-[#03045e]">{profile.personal?.fullName}</h1>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase rounded-full tracking-wider">
                Active
              </span>
            </div>
            <p className="text-xs text-gray-400 font-bold mt-1">
              {profile.academic?.class}-{profile.academic?.section} • Adm No: {profile.personal?.admissionNumber}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIdCardModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#03045e] hover:bg-[#020344] text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <User size={14} />
            View ID Card
          </button>
          <button 
            onClick={() => setEditModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#caf0f8]/50 hover:bg-[#caf0f8] text-[#0077b6] rounded-xl text-xs font-bold transition-colors"
          >
            <Edit3 size={14} />
            Edit Student
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-colors border border-rose-100">
            <UserX size={14} />
            Deactivate
          </button>
        </div>
      </div>

      {/* 1. OVERVIEW */}
      <AdminSectionCard title="Overview" icon={User}>
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Student ID</p>
            <p className="text-sm font-black text-[#03045e]">{profile.personal?.studentId}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Roll Number</p>
            <p className="text-sm font-black text-[#03045e]">{profile.personal?.rollNumber}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Class & Section</p>
            <p className="text-sm font-black text-[#03045e]">Class {profile.academic?.class} {profile.academic?.section}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Gender</p>
            <p className="text-sm font-black text-[#03045e]">{profile.personal?.gender}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Date of Birth</p>
            <p className="text-sm font-black text-[#03045e]">{profile.personal?.dateOfBirth}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Nationality</p>
            <p className="text-sm font-black text-[#03045e]">{profile.personal?.nationality}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Category</p>
            <p className="text-sm font-black text-[#03045e]">{profile.personal?.category}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Aadhaar No</p>
            <p className="text-sm font-black text-[#03045e]">{profile.personal?.aadhaarNumber}</p>
          </div>
        </div>
      </AdminSectionCard>

      {/* 2. ACADEMIC PERFORMANCE */}
      <AdminSectionCard title="Academic Performance (Exam-wise Report Cards)" icon={Award}>
        {results && results.length > 0 ? (
          <div className="space-y-8">
            {Object.entries(
              results.reduce((acc, curr) => {
                const exam = curr.examName || "Term Exam";
                if (!acc[exam]) acc[exam] = [];
                acc[exam].push(curr);
                return acc;
              }, {})
            ).map(([examName, subjects]) => {
              const totalMarks = subjects.reduce((sum, s) => sum + (s.marksObtained || 0), 0);
              const maxMarks = subjects.reduce((sum, s) => sum + (s.maxMarks || 100), 0);
              const percentage = Math.round((totalMarks / maxMarks) * 100);
              
              return (
                <div key={examName} className="border border-[#caf0f8] rounded-3xl overflow-hidden bg-white shadow-sm">
                  {/* Report Card Header */}
                  <div className="bg-[#caf0f8]/30 px-6 py-4 border-b border-[#caf0f8] flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-black text-[#03045e] uppercase tracking-wider">{examName}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Published Result</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-center bg-white px-4 py-2 rounded-xl shadow-sm border border-[#caf0f8]/50">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Total Marks</p>
                        <p className="text-lg font-black text-[#0077b6]">{totalMarks} / {maxMarks}</p>
                      </div>
                      <div className="text-center bg-white px-4 py-2 rounded-xl shadow-sm border border-[#caf0f8]/50">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Percentage</p>
                        <p className="text-lg font-black text-[#0077b6]">{percentage}%</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Report Card Body */}
                  <div className="p-0 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                          <th className="py-3 px-6">Subject</th>
                          <th className="py-3 px-6">Max Marks</th>
                          <th className="py-3 px-6">Marks Obtained</th>
                          <th className="py-3 px-6 text-center">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs font-bold text-gray-700">
                        {subjects.map((sub, idx) => (
                          <tr key={idx} className="border-b border-gray-50 hover:bg-[#caf0f8]/5 transition-colors">
                            <td className="py-3 px-6 text-[#03045e]">{sub.subjectName}</td>
                            <td className="py-3 px-6 text-gray-400">{sub.maxMarks}</td>
                            <td className="py-3 px-6">{sub.marksObtained}</td>
                            <td className="py-3 px-6 text-center">
                              <span className={`px-2 py-1 rounded-md ${
                                sub.grade?.startsWith('A') ? 'bg-emerald-50 text-emerald-700' :
                                sub.grade?.startsWith('B') ? 'bg-blue-50 text-blue-700' :
                                'bg-orange-50 text-orange-700'
                              }`}>
                                {sub.grade || "B+"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-8 bg-gray-50 rounded-3xl border border-gray-100">
            <Award className="mx-auto text-gray-300 mb-3" size={32} />
            <p className="text-xs text-gray-400 font-bold uppercase">No published exam results found for this student.</p>
          </div>
        )}
      </AdminSectionCard>

      {/* 3. ATTENDANCE */}
      <AdminSectionCard title="Attendance Summary" icon={Activity}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col justify-center items-center p-6 bg-[#caf0f8]/20 rounded-3xl border border-[#caf0f8]/50">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-gray-200 stroke-current" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-[#0077b6] stroke-current" strokeWidth="3" strokeDasharray={`${attendance?.percentage || 85}, 100`} fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-[#03045e]">{attendance?.percentage || 85}%</span>
              </div>
            </div>
          </div>
          <div className="md:col-span-2 flex flex-col justify-center gap-4">
            <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div>
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Present Days</p>
                <p className="text-xl font-black text-emerald-700">{attendance?.attended || 185}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Activity size={16} />
              </div>
            </div>
            <div className="flex justify-between items-center p-4 bg-rose-50 rounded-2xl border border-rose-100">
              <div>
                <p className="text-[10px] text-rose-600 font-bold uppercase tracking-wider">Absent Days</p>
                <p className="text-xl font-black text-rose-700">{attendance ? (attendance.totalClasses - attendance.attended) : 15}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                <UserX size={16} />
              </div>
            </div>
          </div>
        </div>
      </AdminSectionCard>

      {/* 4. PARENT INFORMATION */}
      <AdminSectionCard title="Parent & Contact" icon={Phone}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#caf0f8] text-[#0077b6] flex items-center justify-center"><User size={16} /></div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Father&apos;s Name</p>
                <p className="text-sm font-black text-[#03045e]">{profile.family?.father?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#caf0f8] text-[#0077b6] flex items-center justify-center"><User size={16} /></div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Mother&apos;s Name</p>
                <p className="text-sm font-black text-[#03045e]">{profile.family?.mother?.name}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center border border-gray-200"><Phone size={16} /></div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Primary Phone</p>
                <p className="text-sm font-black text-[#03045e]">{profile.family?.father?.phoneNumber || profile.personal?.phoneNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center border border-gray-200"><Mail size={16} /></div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Email Address</p>
                <p className="text-sm font-black text-[#03045e]">{profile.personal?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center border border-gray-200"><MapPin size={16} /></div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Residential Address</p>
                <p className="text-sm font-black text-[#03045e]">{profile.address?.current?.address}, {profile.address?.current?.city}</p>
              </div>
            </div>
          </div>
        </div>
      </AdminSectionCard>

      {/* 5. TRANSPORT */}
      <AdminSectionCard title="Transport" icon={Car}>
        {transport ? (
          <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Route</p>
              <p className="text-sm font-black text-[#03045e]">{transport.summary?.routeName || "Route 4A"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Vehicle</p>
              <p className="text-sm font-black text-[#03045e]">{transport.summary?.vehicleNo || "DL 1P 1234"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Driver</p>
              <p className="text-sm font-black text-[#03045e]">Ramesh Kumar</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Pickup Point</p>
              <p className="text-sm font-black text-[#03045e]">{transport.summary?.pickupStop || "Main Gate, Sector 4"}</p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400 font-bold">No transport data mapped.</p>
        )}
      </AdminSectionCard>

      {/* 6. DOCUMENTS */}
      <AdminSectionCard title="Documents" icon={FileText}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-[#00b4d8] transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center"><FileText size={16} /></div>
            <div>
              <p className="text-xs font-black text-[#03045e]">Birth Certificate</p>
              <p className="text-[10px] font-bold text-gray-400 mt-0.5">PDF • 1.2 MB</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-[#00b4d8] transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center"><FileText size={16} /></div>
            <div>
              <p className="text-xs font-black text-[#03045e]">Aadhaar Card</p>
              <p className="text-[10px] font-bold text-gray-400 mt-0.5">JPEG • 800 KB</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-[#00b4d8] transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center"><FileText size={16} /></div>
            <div>
              <p className="text-xs font-black text-[#03045e]">Transfer Certificate</p>
              <p className="text-[10px] font-bold text-gray-400 mt-0.5">PDF • 2.1 MB</p>
            </div>
          </div>
        </div>
      </AdminSectionCard>

      {/* 7. ACCOUNT INFORMATION */}
      <AdminSectionCard title="Account Information" icon={Shield}>
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-4 gap-6 bg-[#caf0f8]/10 p-6 rounded-3xl border border-[#caf0f8]/40">
          <div className="space-y-1">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Username</p>
            <p className="text-sm font-black text-[#03045e]">{profile.personal?.email?.split('@')[0] || "student123"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Role</p>
            <p className="text-sm font-black text-[#03045e] uppercase">STUDENT</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Account Status</p>
            <div className="mt-1">
              <span className="px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase rounded-full tracking-wider">Active</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Last Login</p>
            <p className="text-sm font-black text-[#03045e]">Today, 08:30 AM</p>
          </div>
        </div>
      </AdminSectionCard>

      <AdminEditForm
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Student Details"
        fields={studentFields}
        data={flatProfile}
        onSubmit={handleUpdateProfile}
      />

      {/* ID Card Modal */}
      <IDCardPreviewModal 
        isOpen={idCardModalOpen} 
        onClose={() => setIdCardModalOpen(false)}
      >
        <IDCard variant="student" data={idCardData} />
      </IDCardPreviewModal>

      {toast.show && (
        <ToastNotification
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </motion.div>
  );
};

export default StudentDetailsPage;
