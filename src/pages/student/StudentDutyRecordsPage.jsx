import React, { useState, useEffect, useMemo } from "react";
import { useStudent } from "../../context/StudentContext";
import studentDutyService from "../../services/studentDutyService";
import MainCard from "../../components/MainCard";
import DutyDetailsModal from "../../components/DutyDetailsModal";
import { ClipboardCheck, CheckCircle, XCircle, Eye, Clock, ClipboardList } from "lucide-react";

export default function StudentDutyRecordsPage() {
  const { activeStudentId, isLoading: isStudentLoading } = useStudent();
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("Active & Completed");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (activeStudentId) {
      fetchRecords();
    }
  }, [activeStudentId]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const records = await studentDutyService.getStudentDutyRecords(activeStudentId);
      setRequests(records);
    } catch (error) {
      console.error("Error fetching student duty records:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    return {
      total: requests.length,
      active: requests.filter(r => r.status === "Active").length,
      completed: requests.filter(r => r.status === "Completed").length,
      cancelled: requests.filter(r => r.status === "Cancelled").length,
    };
  }, [requests]);

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      if (statusFilter === "Active & Completed") {
        return req.status === "Active" || req.status === "Completed";
      }
      if (statusFilter === "Cancelled") {
        return req.status === "Cancelled";
      }
      return true; // "All"
    });
  }, [requests, statusFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Completed": return "bg-green-100 text-green-800 border-green-200";
      case "Cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isStudentLoading) {
    return <div className="p-8 text-center text-gray-500">Loading student context...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#03045e] tracking-tight">My Duties</h1>
        <p className="text-gray-500 font-medium mt-1">View your assigned school duties and participation records.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MainCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <ClipboardCheck size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Duties</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
        </MainCard>
        <MainCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Active</p>
            <p className="text-2xl font-bold text-gray-800">{stats.active}</p>
          </div>
        </MainCard>
        <MainCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Completed</p>
            <p className="text-2xl font-bold text-gray-800">{stats.completed}</p>
          </div>
        </MainCard>
        <MainCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <XCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Cancelled</p>
            <p className="text-2xl font-bold text-gray-800">{stats.cancelled}</p>
          </div>
        </MainCard>
      </div>

      {/* Records Table */}
      <MainCard className="overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-lg font-bold text-[#03045e]">Duty Records</h2>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 outline-none focus:border-[#00b4d8] bg-white font-medium text-gray-600"
          >
            <option value="All">All Records</option>
            <option value="Active & Completed">Active & Completed</option>
            <option value="Cancelled">Cancelled Only</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Duty Name</th>
                <th className="p-4 font-bold">Category</th>
                <th className="p-4 font-bold">Requested By</th>
                <th className="p-4 font-bold">Date</th>
                <th className="p-4 font-bold">Time</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400">Loading duty records...</td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <ClipboardList size={40} className="text-gray-300 mb-3" />
                      <h3 className="text-lg font-bold text-gray-700">No Duty Records Found</h3>
                      <p className="text-sm text-gray-500 mt-1">You have not been assigned any school duties yet.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-bold text-gray-800">{req.title}</td>
                    <td className="p-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                        {req.category}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-700">{req.requestedByTeacherName}</td>
                    <td className="p-4 text-sm font-medium text-gray-600">{req.dutyDate}</td>
                    <td className="p-4 text-sm text-gray-500">{req.startTime} - {req.endTime}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedRequest(req);
                          setIsModalOpen(true);
                        }}
                        className="text-sm font-bold text-[#0077b6] hover:text-[#023e8a] flex items-center justify-end gap-1.5 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors ml-auto"
                      >
                        <Eye size={16} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </MainCard>

      {/* View Modal */}
      {isModalOpen && selectedRequest && (
        <DutyDetailsModal 
          request={selectedRequest} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
}
