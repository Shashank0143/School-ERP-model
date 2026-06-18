import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import studentDutyService from "../../services/studentDutyService";
import localProvider from "../../data/providers/localProvider";
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  Eye,
  Edit3,
  Search,
  Filter,
  Plus,
  Users,
  Calendar,
  MapPin,
  Clock,
  X,
  ListTodo
} from "lucide-react";
import MainCard from "../../components/MainCard";
import DutyDetailsModal from "../../components/DutyDetailsModal";

const CATEGORIES = ["Sports", "Assembly", "Competition", "Academic", "Administrative"];

export default function StudentDutyManagementPage() {
  const { user } = useAuth();
  
  // Tab State
  const [activeTab, setActiveTab] = useState("my-requests"); // "my-requests" or "verification-board"

  // --- MY REQUESTS STATE ---
  const [myRequests, setMyRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [loadingMyRequests, setLoadingMyRequests] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    category: "Sports",
    reason: "",
    location: "",
    dutyDate: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "10:00",
    targetStudents: []
  });

  // Filters for Student Selection in Modal
  const [studentSearch, setStudentSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");

  // --- VERIFICATION BOARD STATE ---
  const [boardRequests, setBoardRequests] = useState([]);
  const [loadingBoard, setLoadingBoard] = useState(true);
  
  // Filters for Board
  const [boardCategory, setBoardCategory] = useState("All");
  const [boardClass, setBoardClass] = useState("All");
  const [boardTeacherSearch, setBoardTeacherSearch] = useState("");
  const [boardStudentSearch, setBoardStudentSearch] = useState("");
  const [boardDateFilter, setBoardDateFilter] = useState(""); // empty means no date filter

  const teacherId = user?.linkedEntityId || user?.username || user?.id;
  const teacherName = user?.name || user?.username || "Teacher";

  useEffect(() => {
    if (activeTab === "my-requests") {
      fetchMyRequests();
    } else {
      fetchBoardRequests();
    }
  }, [teacherId, activeTab]);

  const fetchMyRequests = async () => {
    setLoadingMyRequests(true);
    try {
      const allRequests = await studentDutyService.getTeacherDutyRequests(teacherId);
      setMyRequests(allRequests);

      // Fetch students for the selection list
      if (students.length === 0) {
        const allStudents = await localProvider.getStudents();
        setStudents(allStudents);
      }
    } catch (error) {
      console.error("Error fetching my requests:", error);
    } finally {
      setLoadingMyRequests(false);
    }
  };

  const fetchBoardRequests = async () => {
    setLoadingBoard(true);
    try {
      const activeOnly = await studentDutyService.getActiveDutyBoard();
      setBoardRequests(activeOnly);
    } catch (error) {
      console.error("Error fetching board requests:", error);
    } finally {
      setLoadingBoard(false);
    }
  };

  // --- MY REQUESTS COMPUTATIONS ---
  const myStats = useMemo(() => {
    return {
      total: myRequests.length,
      active: myRequests.filter((r) => r.status === "Active").length,
      completed: myRequests.filter((r) => r.status === "Completed").length,
      cancelled: myRequests.filter((r) => r.status === "Cancelled").length,
    };
  }, [myRequests]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.admissionNo?.toLowerCase().includes(studentSearch.toLowerCase());
      const level = s.classLevel || s.className?.split('-')[0];
      const matchClass = classFilter ? level === classFilter : true;
      const matchSection = sectionFilter ? s.section === sectionFilter : true;
      return matchSearch && matchClass && matchSection;
    });
  }, [students, studentSearch, classFilter, sectionFilter]);

  const classes = useMemo(() => {
    const levels = new Set();
    students.forEach(s => {
      const level = s.classLevel || s.className?.split('-')[0];
      if (level) levels.add(level);
    });
    return Array.from(levels).sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      return isNaN(numA) || isNaN(numB) ? a.localeCompare(b) : numA - numB;
    });
  }, [students]);

  const sections = useMemo(() => {
    if (!classFilter) return [];
    const classSections = new Set();
    students.forEach(s => {
      const level = s.classLevel || s.className?.split('-')[0];
      if (level === classFilter && s.section) classSections.add(s.section);
    });
    return Array.from(classSections).sort();
  }, [students, classFilter]);

  // --- VERIFICATION BOARD COMPUTATIONS ---
  const boardClasses = useMemo(() => {
    const classSet = new Set();
    boardRequests.forEach(req => {
      req.targetStudents?.forEach(s => {
        const level = s.classLevel || s.className?.split('-')[0];
        if (level && level !== "N/A") classSet.add(level);
      });
    });
    return Array.from(classSet).sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      return isNaN(numA) || isNaN(numB) ? a.localeCompare(b) : numA - numB;
    });
  }, [boardRequests]);

  const filteredBoardRequests = useMemo(() => {
    return boardRequests.filter(req => {
      // Category Filter
      if (boardCategory !== "All" && req.category !== boardCategory) return false;
      
      // Date Filter
      if (boardDateFilter && req.dutyDate !== boardDateFilter) return false;

      // Teacher Search
      if (boardTeacherSearch && !req.requestedByTeacherName.toLowerCase().includes(boardTeacherSearch.toLowerCase())) return false;

      // Class Filter
      if (boardClass !== "All") {
        const hasClass = req.targetStudents?.some(s => {
          const level = s.classLevel || s.className?.split('-')[0];
          return level === boardClass;
        });
        if (!hasClass) return false;
      }

      // Student Search
      if (boardStudentSearch) {
        const hasStudent = req.targetStudents?.some(s => 
          s.studentName.toLowerCase().includes(boardStudentSearch.toLowerCase())
        );
        if (!hasStudent) return false;
      }

      return true;
    });
  }, [boardRequests, boardCategory, boardClass, boardTeacherSearch, boardDateFilter, boardStudentSearch]);

  const boardStats = useMemo(() => {
    const teachers = new Set(filteredBoardRequests.map(r => r.requestedByTeacherId));
    let studentCount = 0;
    filteredBoardRequests.forEach(r => { studentCount += (r.targetStudents?.length || 0); });
    return {
      totalDuties: filteredBoardRequests.length,
      teachers: teachers.size,
      students: studentCount
    };
  }, [filteredBoardRequests]);


  // --- HANDLERS ---
  const handleOpenCreate = () => {
    setFormData({
      title: "",
      category: "Sports",
      reason: "",
      location: "",
      dutyDate: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "10:00",
      targetStudents: []
    });
    setSelectedRequest(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (request) => {
    setFormData({
      ...request
    });
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleOpenView = (request) => {
    setSelectedRequest(request);
    setIsViewModalOpen(true);
  };

  const handleCancel = async (id) => {
    if (window.confirm("Are you sure you want to cancel this request?")) {
      await studentDutyService.cancelDutyRequest(id);
      fetchMyRequests();
    }
  };

  const handleComplete = async (id) => {
    if (window.confirm("Mark this duty as completed?")) {
      await studentDutyService.completeDutyRequest(id);
      fetchMyRequests();
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        requestedByTeacherId: teacherId,
        requestedByTeacherName: teacherName
      };

      if (selectedRequest) {
        await studentDutyService.updateDutyRequest(selectedRequest.id, payload);
      } else {
        await studentDutyService.createDutyRequest(payload);
      }
      setIsModalOpen(false);
      if (activeTab === "my-requests") fetchMyRequests();
      else fetchBoardRequests();
    } catch (error) {
      alert(error.message);
    }
  };

  const toggleStudentSelection = (student) => {
    const isSelected = formData.targetStudents.find((s) => s.studentId === student.id || s.studentId === student.studentId);
    if (isSelected) {
      setFormData({
        ...formData,
        targetStudents: formData.targetStudents.filter((s) => s.studentId !== student.id && s.studentId !== student.studentId)
      });
    } else {
      setFormData({
        ...formData,
        targetStudents: [
          ...formData.targetStudents,
          {
            studentId: student.id || student.studentId,
            studentName: student.name || `${student.firstName} ${student.lastName}`.trim(),
            className: student.className,
            section: student.section
          }
        ]
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Completed": return "bg-green-100 text-green-800 border-green-200";
      case "Cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-[#03045e] tracking-tight">Student Duty Management</h1>
          <p className="text-gray-500 font-medium mt-1">
            {activeTab === "my-requests" ? "Create and manage official student duty requests." : "Verify official student duty requests before releasing students from class."}
          </p>
        </div>
        {activeTab === "my-requests" && (
          <button
            onClick={handleOpenCreate}
            className="bg-[#0077b6] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-[#023e8a] transition-colors"
          >
            <Plus size={18} />
            Create Request
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("my-requests")}
          className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "my-requests" ? "border-[#0077b6] text-[#0077b6]" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <ClipboardCheck size={18} />
          My Requests
        </button>
        <button
          onClick={() => setActiveTab("verification-board")}
          className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "verification-board" ? "border-[#0077b6] text-[#0077b6]" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <ListTodo size={18} />
          Active Duty Board
        </button>
      </div>

      {/* --- MY REQUESTS TAB CONTENT --- */}
      {activeTab === "my-requests" && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <MainCard className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <ClipboardCheck size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Requests</p>
                <p className="text-2xl font-bold text-gray-800">{myStats.total}</p>
              </div>
            </MainCard>
            <MainCard className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Active</p>
                <p className="text-2xl font-bold text-gray-800">{myStats.active}</p>
              </div>
            </MainCard>
            <MainCard className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Completed</p>
                <p className="text-2xl font-bold text-gray-800">{myStats.completed}</p>
              </div>
            </MainCard>
            <MainCard className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <XCircle size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Cancelled</p>
                <p className="text-2xl font-bold text-gray-800">{myStats.cancelled}</p>
              </div>
            </MainCard>
          </div>

          {/* Table */}
          <MainCard className="overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#03045e]">My Duty Requests</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-bold">Title</th>
                    <th className="p-4 font-bold">Category</th>
                    <th className="p-4 font-bold">Date & Time</th>
                    <th className="p-4 font-bold">Location</th>
                    <th className="p-4 font-bold">Requested Students</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loadingMyRequests ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-400">Loading...</td>
                    </tr>
                  ) : myRequests.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-400 font-medium">No duty requests found.</td>
                    </tr>
                  ) : (
                    myRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-gray-800">{req.title}</p>
                          <p className="text-xs text-gray-500 truncate w-full flex-1 min-w-0 md:max-w-[200px]" title={req.reason}>{req.reason}</p>
                        </td>
                        <td className="p-4 text-sm font-medium text-gray-600">{req.category}</td>
                        <td className="p-4">
                          <p className="text-sm font-bold text-gray-700">{req.dutyDate}</p>
                          <p className="text-xs text-gray-500">{req.startTime} - {req.endTime}</p>
                        </td>
                        <td className="p-4 text-sm font-medium text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin size={14} className="text-gray-400" />
                            {req.location}
                          </div>
                        </td>
                        <td className="p-4">
                          <span 
                            className="inline-block text-sm font-bold text-[#0077b6] bg-blue-50 px-2.5 py-1 rounded-md"
                          >
                            {req.targetStudents?.length || 0} Students
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getStatusColor(req.status)}`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenView(req)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            
                            {req.status === "Active" && (
                              <>
                                <button
                                  onClick={() => handleOpenEdit(req)}
                                  className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button
                                  onClick={() => handleComplete(req.id)}
                                  className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Mark Completed"
                                >
                                  <CheckCircle size={16} />
                                </button>
                                <button
                                  onClick={() => handleCancel(req.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Cancel Request"
                                >
                                  <XCircle size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </MainCard>
        </>
      )}

      {/* --- VERIFICATION BOARD TAB CONTENT --- */}
      {activeTab === "verification-board" && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <MainCard className="p-4 flex items-center gap-4 border-l-4 border-l-yellow-500">
              <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Active Duties</p>
                <p className="text-2xl font-bold text-gray-800">{boardStats.totalDuties}</p>
              </div>
            </MainCard>
            <MainCard className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Students Requested</p>
                <p className="text-2xl font-bold text-gray-800">{boardStats.students}</p>
              </div>
            </MainCard>
            <MainCard className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <ClipboardCheck size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Teachers Requesting</p>
                <p className="text-2xl font-bold text-gray-800">{boardStats.teachers}</p>
              </div>
            </MainCard>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <span className="text-sm font-bold text-gray-600">Filters:</span>
            </div>
            
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search Student..." 
                value={boardStudentSearch}
                onChange={(e) => setBoardStudentSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 outline-none focus:border-[#00b4d8]"
              />
            </div>
            
            <input 
              type="date"
              value={boardDateFilter}
              onChange={(e) => setBoardDateFilter(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 outline-none focus:border-[#00b4d8] text-gray-600"
            />

            <select 
              value={boardCategory}
              onChange={(e) => setBoardCategory(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 outline-none focus:border-[#00b4d8] bg-white"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={boardClass}
              onChange={(e) => setBoardClass(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-[#0077b6] transition-all min-w-[140px]"
            >
              <option value="All">All Class Levels</option>
              {boardClasses.map(c => <option key={c} value={c}>Class {c}</option>)}
            </select>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search Teacher..." 
                value={boardTeacherSearch}
                onChange={(e) => setBoardTeacherSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 outline-none focus:border-[#00b4d8]"
              />
            </div>
            
            {(boardCategory !== "All" || boardClass !== "All" || boardTeacherSearch || boardDateFilter || boardStudentSearch) && (
              <button 
                onClick={() => {
                  setBoardCategory("All");
                  setBoardClass("All");
                  setBoardTeacherSearch("");
                  setBoardDateFilter("");
                  setBoardStudentSearch("");
                }}
                className="text-sm text-red-500 hover:text-red-700 font-medium ml-auto"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Board Cards */}
          {loadingBoard ? (
            <div className="p-8 text-center text-gray-400">Loading board...</div>
          ) : filteredBoardRequests.length === 0 ? (
            <MainCard className="p-12 text-center flex flex-col items-center justify-center bg-gray-50/50">
              <ClipboardCheck size={48} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-700 mb-1">No Active Duty Requests</h3>
              <p className="text-gray-500 text-sm">There are currently no active student duty requests requiring verification.</p>
            </MainCard>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredBoardRequests.map(req => (
                <div key={req.id} className="bg-white border border-yellow-200 shadow-sm shadow-yellow-100 rounded-2xl overflow-hidden flex flex-col transition-all hover:shadow-md hover:border-yellow-300">
                  <div className="p-4 bg-yellow-50/50 border-b border-yellow-100 flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded mb-1 inline-block">
                        {req.category}
                      </span>
                      <h3 className="font-black text-gray-800 text-lg leading-tight mt-1">{req.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">Req by: <span className="font-bold text-gray-700">{req.requestedByTeacherName}</span></p>
                    </div>
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200 whitespace-nowrap">
                      Active
                    </span>
                  </div>
                  
                  <div className="p-4 flex-1 flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="font-medium">{req.dutyDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-gray-400" />
                        <span className="font-medium">{req.startTime} - {req.endTime}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <MapPin size={14} className="text-gray-400" />
                      <span className="truncate">{req.location || "No location specified"}</span>
                    </div>

                    <div className="mt-2">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Students Assigned</p>
                      <ul className="space-y-1.5 max-h-32 overflow-y-auto pr-2">
                        {req.targetStudents?.map(s => (
                          <li key={s.studentId} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                            <span className="font-medium text-gray-800">{s.studentName}</span>
                            <span className="text-gray-400 text-xs">({s.className})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button 
                      onClick={() => handleOpenView(req)}
                      className="text-sm font-bold text-[#0077b6] hover:text-[#023e8a] flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <Eye size={16} /> View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create / Edit Modal (Only for My Requests) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <MainCard className="w-full w-[95vw] md:w-[90vw] lg:max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-3xl">
              <h2 className="text-xl font-bold text-[#03045e]">
                {selectedRequest ? "Edit Duty Request" : "Create Duty Request"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-8">
              {/* Left side: Basic Info */}
              <div className="flex-1 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">1. Duty Details</h3>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Duty Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 transition-all font-medium"
                    placeholder="e.g. Football Practice"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 transition-all font-medium"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 transition-all font-medium"
                      placeholder="e.g. Ground A"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Duty Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={formData.dutyDate}
                    onChange={(e) => setFormData({ ...formData, dutyDate: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 transition-all font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">End Time</label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Reason</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 transition-all font-medium resize-none"
                    rows="3"
                    placeholder="Brief description of the duty..."
                  ></textarea>
                </div>
              </div>

              {/* Right side: Student Selection */}
              <div className="flex-1 flex flex-col gap-4 border-l border-gray-100 pl-8">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">2. Student Selection <span className="text-red-500">*</span></h3>
                
                {/* Filters */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="Search name or adm no..."
                      className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#00b4d8] transition-all font-medium"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={classFilter}
                    onChange={(e) => {
                      setClassFilter(e.target.value);
                      setSectionFilter(""); // Reset section
                    }}
                    className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none font-medium"
                  >
                    <option value="">All Class Levels</option>
                    {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
                  </select>
                  <select
                    value={sectionFilter}
                    onChange={(e) => setSectionFilter(e.target.value)}
                    disabled={!classFilter}
                    className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">All Sections</option>
                    {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
                  </select>
                </div>

                {/* List */}
                <div className="flex-1 border border-gray-200 rounded-xl overflow-y-auto max-h-48 bg-white p-2">
                  {filteredStudents.length === 0 ? (
                    <p className="text-center text-sm text-gray-500 p-4">No students found.</p>
                  ) : (
                    filteredStudents.map(student => {
                      const studentId = student.id || student.studentId;
                      const isSelected = formData.targetStudents.some(s => s.studentId === studentId);
                      return (
                        <div 
                          key={studentId} 
                          onClick={() => toggleStudentSelection(student)}
                          className={`p-2 flex items-center justify-between rounded-lg cursor-pointer transition-colors mb-1 ${isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'}`}
                        >
                          <div>
                            <p className={`text-sm font-bold ${isSelected ? 'text-[#0077b6]' : 'text-gray-700'}`}>
                              {student.name || `${student.firstName} ${student.lastName}`.trim()} <span className="text-xs text-gray-500 font-normal">({student.className})</span>
                            </p>
                            <p className="text-xs text-gray-400">{student.admissionNo}</p>
                          </div>
                          <div className={`w-5 h-5 rounded flex items-center justify-center border ${isSelected ? 'bg-[#0077b6] border-[#0077b6] text-white' : 'border-gray-300'}`}>
                            {isSelected && <CheckCircle size={14} />}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Selected Count / Tokens */}
                <div className="mt-2 bg-gray-50 border border-gray-200 rounded-xl p-3">
                  <p className="text-sm font-bold text-gray-700 mb-2">Selected Students ({formData.targetStudents.length})</p>
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                    {formData.targetStudents.map(s => (
                      <div key={s.studentId} className="bg-white border border-gray-200 rounded-md px-2 py-1 flex items-center gap-1 text-xs font-medium text-gray-700">
                        {s.studentName} <span className="text-gray-400">({s.className})</span>
                        <button 
                          onClick={() => setFormData({ ...formData, targetStudents: formData.targetStudents.filter(ts => ts.studentId !== s.studentId) })}
                          className="text-gray-400 hover:text-red-500 ml-1"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {formData.targetStudents.length === 0 && (
                      <p className="text-xs text-gray-400 italic">None selected.</p>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 rounded-b-3xl">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 text-sm font-bold text-white bg-[#0077b6] hover:bg-[#023e8a] rounded-xl transition-colors"
              >
                {selectedRequest ? "Save Changes" : "Create Request"}
              </button>
            </div>
          </MainCard>
        </div>
      )}

      {/* View Modal (Shared) */}
      {isViewModalOpen && selectedRequest && (
        <DutyDetailsModal 
          request={selectedRequest} 
          onClose={() => setIsViewModalOpen(false)} 
        />
      )}
    </div>
  );
}
