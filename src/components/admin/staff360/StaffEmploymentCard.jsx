import React from 'react';
import { Briefcase } from 'lucide-react';
import AdminSectionCard from '../AdminSectionCard';

const StaffEmploymentCard = ({ staff }) => {
  if (!staff) return null;
  const employment = staff.employment || {};
  const { category, department, designation, roleName, joiningDate, qualifications } = employment;

  return (
    <AdminSectionCard title="Employment Summary" icon={Briefcase}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-1">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Category</p>
          <p className="text-sm font-black text-[#03045e]">{category || "Uncategorized"}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Department</p>
          <p className="text-sm font-black text-[#03045e]">{department || "Unassigned"}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Designation</p>
          <p className="text-sm font-black text-[#03045e]">{designation || "Not Specified"}</p>
        </div>
        {roleName && (
          <div className="space-y-1">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">System Role</p>
            <p className="text-sm font-black text-[#03045e]">{roleName}</p>
          </div>
        )}
        {joiningDate && (
          <div className="space-y-1">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Joining Date</p>
            <p className="text-sm font-black text-[#03045e]">{joiningDate}</p>
          </div>
        )}
        {qualifications && qualifications.length > 0 && (
          <div className="space-y-1 md:col-span-2">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Qualifications</p>
            <p className="text-sm font-black text-[#03045e]">{qualifications.join(", ")}</p>
          </div>
        )}
      </div>
    </AdminSectionCard>
  );
};

export default StaffEmploymentCard;
