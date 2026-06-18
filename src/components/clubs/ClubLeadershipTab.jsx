import React, { useState } from "react";
import { Award, Shield, Plus, X } from "lucide-react";
import { clubsService } from "../../services/clubsService";

export default function ClubLeadershipTab({ clubId, teacherId, members, onRolesUpdated, isReadOnly }) {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedRole, setSelectedRole] = useState("Core Member");
  const [errorBanner, setErrorBanner] = useState("");
  const [successBanner, setSuccessBanner] = useState("");

  const roles = ["President", "Vice President", "Secretary", "Core Member"];
  
  // Active members eligible for leadership
  const eligibleMembers = members.filter(m => m.status === "Active");

  const handleAssignRole = async () => {
    if (!selectedStudent || !selectedRole) {
      setErrorBanner("Please select both a student and a role.");
      setTimeout(() => setErrorBanner(""), 3000);
      return;
    }

    try {
      await clubsService.assignLeadershipRole({
        clubId,
        studentId: selectedStudent,
        role: selectedRole,
        assignedByTeacherId: teacherId
      });
      setSuccessBanner(`Successfully assigned ${selectedRole}!`);
      setTimeout(() => setSuccessBanner(""), 3000);
      setIsAssignModalOpen(false);
      setSelectedStudent("");
      setSelectedRole("Core Member");
      onRolesUpdated();
    } catch (e) {
      setErrorBanner(e.message);
      setTimeout(() => setErrorBanner(""), 4000);
    }
  };

  const handleDemote = async (studentId) => {
    try {
      await clubsService.demoteToMember(clubId, studentId);
      setSuccessBanner("Role removed. Student demoted to Member.");
      setTimeout(() => setSuccessBanner(""), 3000);
      onRolesUpdated();
    } catch (e) {
      setErrorBanner("Failed to demote member.");
      setTimeout(() => setErrorBanner(""), 3000);
    }
  };

  const leadershipPositions = roles.reduce((acc, role) => {
    acc[role] = members.filter((m) => m.role === role);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {errorBanner && (
        <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-black shadow-sm flex items-center gap-2">
          <Shield size={14} className="text-rose-500" />
          <span>{errorBanner}</span>
        </div>
      )}
      
      {successBanner && (
        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-xs font-black shadow-sm flex items-center gap-2">
          <Award size={14} className="text-emerald-500" />
          <span>{successBanner}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider flex items-center gap-2">
          <Award className="w-4 h-4 text-purple-500" />
          Leadership Structure
        </h3>
        {!isReadOnly && (
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="flex items-center gap-2 bg-[#00b4d8] hover:bg-[#0096c7] text-white px-4 py-2 rounded-xl text-xs font-black shadow-sm transition-colors"
          >
            <Plus size={14} />
            Assign Role
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((roleName) => {
          const occupants = leadershipPositions[roleName] || [];
          const isCore = roleName === "Core Member";
          
          return (
            <div key={roleName} className={`p-4 border rounded-2xl ${isCore ? "border-amber-100 bg-amber-50/20" : "border-purple-100 bg-purple-50/20"}`}>
              <h4 className={`text-[10px] font-black uppercase tracking-wider mb-3 ${isCore ? "text-amber-600" : "text-purple-600"}`}>
                {roleName}
              </h4>
              <div className="space-y-2">
                {occupants.length === 0 ? (
                  <div className="text-xs text-gray-400 font-bold italic">No {roleName} assigned</div>
                ) : (
                  occupants.map((member) => (
                    <div key={member.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                      <div>
                        <div className="text-xs font-black text-[#03045e]">{member.name}</div>
                        <div className="text-[10px] font-bold text-gray-400">Class {member.class}</div>
                      </div>
                      {!isReadOnly && (
                        <button
                          onClick={() => handleDemote(member.studentId)}
                          className="text-[9px] font-black text-rose-500 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-lg transition-colors"
                          title="Demote to Member"
                        >
                          Demote
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Assign Role Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-xl w-full w-[95vw] md:w-[90vw] lg:max-w-md overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-sm font-black text-[#03045e]">Assign Leadership Role</h3>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">Student Member</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-[#03045e] focus:outline-none focus:border-[#00b4d8]"
                >
                  <option value="">Select an enrolled member...</option>
                  {eligibleMembers.map(m => (
                    <option key={m.studentId} value={m.studentId}>
                      {m.name} ({m.class})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">Leadership Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-[#03045e] focus:outline-none focus:border-[#00b4d8]"
                >
                  {roles.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignRole}
                  className="px-4 py-2 bg-[#03045e] hover:bg-[#020344] text-white text-xs font-black rounded-xl transition-colors"
                >
                  Confirm Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
