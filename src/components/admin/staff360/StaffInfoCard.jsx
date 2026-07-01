import React from 'react';
import { User } from 'lucide-react';
import AdminSectionCard from '../AdminSectionCard';

const StaffInfoCard = ({ staff }) => {
  if (!staff) return null;
  const core = staff.coreProfile || {};
  const { firstName, lastName, fullName, gender, dateOfBirth, bloodGroup } = core;

  return (
    <AdminSectionCard title="Core Information" icon={User}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-1">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Employee ID</p>
          <p className="text-sm font-black text-[#03045e]">{staff.id}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Full Name</p>
          <p className="text-sm font-black text-[#03045e]">{fullName || `${firstName} ${lastName}`}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Gender</p>
          <p className="text-sm font-black text-[#03045e]">{gender || "Not Specified"}</p>
        </div>
        {dateOfBirth && (
          <div className="space-y-1">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Date of Birth</p>
            <p className="text-sm font-black text-[#03045e]">{dateOfBirth}</p>
          </div>
        )}
        {bloodGroup && (
          <div className="space-y-1">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Blood Group</p>
            <p className="text-sm font-black text-[#03045e]">{bloodGroup}</p>
          </div>
        )}
      </div>
    </AdminSectionCard>
  );
};

export default StaffInfoCard;
