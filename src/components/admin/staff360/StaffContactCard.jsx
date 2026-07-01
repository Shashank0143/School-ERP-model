import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import AdminSectionCard from '../AdminSectionCard';

const StaffContactCard = ({ staff }) => {
  if (!staff) return null;
  const core = staff.coreProfile || {};
  const { email, phone, address } = core;

  return (
    <AdminSectionCard title="Contact & Address" icon={Phone}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#caf0f8]/30 text-[#0077b6] rounded-xl shrink-0">
            <Mail size={18} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Email Address</p>
            <p className="text-sm font-black text-[#03045e] mt-1 break-all">
              {email || "Not Provided"}
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#caf0f8]/30 text-[#0077b6] rounded-xl shrink-0">
            <Phone size={18} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Phone Number</p>
            <p className="text-sm font-black text-[#03045e] mt-1">
              {phone || "Not Provided"}
            </p>
          </div>
        </div>

        {address && (
          <div className="flex items-start gap-3 md:col-span-2">
            <div className="p-2 bg-[#caf0f8]/30 text-[#0077b6] rounded-xl shrink-0">
              <MapPin size={18} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Residential Address</p>
              <p className="text-sm font-black text-[#03045e] mt-1">
                {address}
              </p>
            </div>
          </div>
        )}
      </div>
    </AdminSectionCard>
  );
};

export default StaffContactCard;
