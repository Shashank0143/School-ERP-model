import React from "react";
import { Users, CheckSquare, Calendar, Award, ShieldAlert, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import MainCard from "../MainCard";

export default function HomeroomPanel({ responsibilities }) {
  if (!responsibilities || !responsibilities.isClassTeacher) return null;

  const {
    className,
    room,
    displayName,
    totalStudents,
    presentStudents,
    attendanceMarked,
    pendingLeavesCount,
    pendingMentorsCount
  } = responsibilities;

  const attendancePercentage = totalStudents > 0 
    ? Math.round((presentStudents / totalStudents) * 100) 
    : 0;

  return (
    <MainCard className="p-6 border border-blue-100 bg-gradient-to-br from-white via-white to-blue-50/10">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-5">
        <div>
          <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
            Class Teacher Responsibilities
          </span>
          <h3 className="text-lg font-black text-[#03045e] mt-1 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#03045e]" />
            {displayName}
          </h3>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Room Allocation</p>
          <p className="text-xs font-black text-[#00b4d8] uppercase tracking-wider">{room}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 items-center">
        {/* Attendance Circle Dial / Stat */}
        <div className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
          <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
            {/* SVG Circle Dial */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                className="stroke-gray-100"
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                className={attendanceMarked ? "stroke-emerald-400" : "stroke-rose-400"}
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - (attendanceMarked ? presentStudents : 0) / totalStudents)}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs font-black text-[#03045e]">{attendanceMarked ? `${attendancePercentage}%` : "0%"}</span>
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Attendance Status</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${attendanceMarked ? "bg-emerald-400" : "bg-rose-400 animate-ping"}`} />
              <span className="text-xs font-black text-[#03045e]">
                {attendanceMarked ? `${presentStudents}/${totalStudents} Present` : "Not Submitted Today"}
              </span>
            </div>
            <Link 
              to="/teacher/attendance" 
              className="text-[9px] font-black text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest flex items-center gap-0.5 mt-1"
            >
              Go to Roll Call <ArrowRight className="w-2.5 h-2.5" />
            </Link>
          </div>
        </div>

        {/* Action Widgets */}
        <div className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50">
          <div className={`p-2.5 rounded-xl flex-shrink-0 ${
            pendingLeavesCount > 0 
              ? "bg-rose-50 text-rose-500 border border-rose-100" 
              : "bg-gray-100 text-gray-400"
          }`}>
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Leave Requests</h4>
            <p className="text-xs font-black text-gray-700 mt-0.5">
              {pendingLeavesCount > 0 ? `${pendingLeavesCount} Pending Approvals` : "All Leaves Resolved"}
            </p>
            {pendingLeavesCount > 0 && (
              <Link 
                to="/teacher/leave" 
                className="text-[9px] font-black text-rose-600 hover:text-rose-800 transition-colors uppercase tracking-widest flex items-center gap-0.5 mt-1"
              >
                Review Requests <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Mentorship Widgets */}
        <div className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50">
          <div className={`p-2.5 rounded-xl flex-shrink-0 ${
            pendingMentorsCount > 0 
              ? "bg-amber-50 text-amber-500 border border-amber-100" 
              : "bg-gray-100 text-gray-400"
          }`}>
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Mentorship Charge</h4>
            <p className="text-xs font-black text-gray-700 mt-0.5">
              {pendingMentorsCount > 0 ? `${pendingMentorsCount} Sessions Waiting` : "Guidance Up To Date"}
            </p>
            {pendingMentorsCount > 0 && (
              <Link 
                to="/teacher/mentorship" 
                className="text-[9px] font-black text-amber-600 hover:text-amber-800 transition-colors uppercase tracking-widest flex items-center gap-0.5 mt-1"
              >
                Open Guidance Panel <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </MainCard>
  );
}
