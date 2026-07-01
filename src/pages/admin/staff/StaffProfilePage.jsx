import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Briefcase, 
  Mail, 
  Phone, 
  Calendar, 
  Hash,
  ShieldCheck,
  Edit3,
  Download,
  Contact,
  Building2,
  ChevronLeft,
  MapPin,
  Save,
  X,
  LayoutGrid,
  FileText
} from 'lucide-react';
import MainCard from '../../../components/MainCard';
import { useStaffContext } from '../../../context/StaffContext';
import StaffExtensionRegistry from '../../../shared/registries/StaffExtensionRegistry';
import employeeService from '../../../services/employeeService';
import { toast } from 'react-toastify';
import { IDCard } from '../../../components/common/id-card';
import IDCardPreviewModal from '../../../components/common/id-card/IDCardPreviewModal';

// ── Reusable UI Components ──────────────────────────────────────────────────

const ProfileSection = ({ icon: Icon, title, children, className = "" }) => (
  <section className={`${className}`}>
    <div className="flex items-center justify-between mb-4 px-1">
      <h2 className="text-lg font-black text-[#03045e] flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-[#caf0f8] flex items-center justify-center text-[#0077b6]">
          <Icon size={16} />
        </div>
        {title}
      </h2>
    </div>
    {children}
  </section>
);

const InfoField = ({ label, value, icon: Icon, fullWidth = false, density = "normal" }) => {
  if (!value || value === 'Not Specified') return null; 
  
  return (
    <div className={`flex flex-col gap-0.5 ${fullWidth ? "col-span-full" : ""}`}>
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
        {Icon && <Icon size={12} className="text-gray-300" />}
        {label}
      </span>
      <span className={`${density === "compact" ? "text-sm" : "text-base"} font-bold text-[#03045e] break-words`}>
        {value}
      </span>
    </div>
  );
};

const StatusBadge = ({ type, text }) => {
  const styles = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    error: "bg-rose-50 text-rose-700 border-rose-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
    neutral: "bg-gray-100 text-gray-600 border-gray-200"
  };
  
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${styles[type] || styles.neutral}`}>
      {text}
    </span>
  );
};

// ── Main Page Component ─────────────────────────────────────────────────────

const StaffProfilePage = () => {
  const navigate = useNavigate();
  const staffContext = useStaffContext();
  const { staff, loading, error, refresh } = staffContext;

  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [idCardModalOpen, setIdCardModalOpen] = useState(false);

  const extensions = useMemo(() => {
    return StaffExtensionRegistry.getSidebarLinks(staffContext);
  }, [staffContext]);

  useEffect(() => {
    if (staff) {
      setFormData({
        fullName: staff.coreProfile.fullName || '',
        gender: staff.coreProfile.gender || '',
        dateOfBirth: staff.coreProfile.dateOfBirth || '',
        bloodGroup: staff.coreProfile.bloodGroup || '',
        address: staff.coreProfile.address || '',
        phone: staff.coreProfile.phone || '',
        email: staff.coreProfile.email || '',
        emergencyContact: staff.coreProfile.emergencyContact || '',
        category: staff.employment.category || '',
        employmentType: staff.employment.employmentType || '',
        designation: staff.employment.designation || '',
        joiningDate: staff.employment.joiningDate || '',
        status: staff.employment.status || 'Active',
      });
    }
  }, [staff]);

  const idCardData = useMemo(() => {
    if (!staff) return {};
    return {
      name: staff.coreProfile.fullName,
      photo: staff.coreProfile.photo || null,
      id: staff.id,
      designation: staff.employment.designation,
      department: staff.employment.departmentName || staff.employment.departmentId?.replace('dept-', '')?.toUpperCase(),
      phone: staff.coreProfile.phone,
      bloodGroup: staff.coreProfile.bloodGroup,
      joiningDate: staff.employment.joiningDate,
      status: staff.employment.status || 'Active',
      address: staff.coreProfile.address,
      emergencyContact: staff.coreProfile.emergencyContact,
      schoolName: "EduDash Academy"
    };
  }, [staff]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !staff) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl m-8">
        Failed to load staff profile.
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await employeeService.updateEmployee(staff.id, {
        employeeName: formData.fullName,
        gender: formData.gender,
        dob: formData.dateOfBirth,
        bloodGroup: formData.bloodGroup,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        emergencyContact: formData.emergencyContact,
        category: formData.category,
        employmentType: formData.employmentType,
        designation: formData.designation,
        joiningDate: formData.joiningDate,
        status: formData.status,
      });
      toast.success("Profile updated successfully");
      setIsEditMode(false);
      refresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: staff.coreProfile.fullName || '',
      gender: staff.coreProfile.gender || '',
      dateOfBirth: staff.coreProfile.dateOfBirth || '',
      bloodGroup: staff.coreProfile.bloodGroup || '',
      address: staff.coreProfile.address || '',
      phone: staff.coreProfile.phone || '',
      email: staff.coreProfile.email || '',
      emergencyContact: staff.coreProfile.emergencyContact || '',
      category: staff.employment.category || '',
      employmentType: staff.employment.employmentType || '',
      designation: staff.employment.designation || '',
      joiningDate: staff.employment.joiningDate || '',
      status: staff.employment.status || 'Active',
    });
    setIsEditMode(false);
  };

  const initials = staff.coreProfile.fullName
    ? staff.coreProfile.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)
    : 'U';

  const statusColor = staff.employment.status === 'Active' ? 'success' : 'error';

  return (
    <>
      {/* Sticky Edit Bar */}
      {isEditMode && (
        <div className="sticky top-0 z-50 bg-[#03045e] text-white px-6 py-3 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <Edit3 size={18} className="text-[#00b4d8]" />
            <span className="font-bold text-sm uppercase tracking-widest">Edit Mode Active</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleCancel}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white hover:bg-white/10 text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              <X size={14} /> Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#00b4d8] text-white hover:bg-[#0096c7] shadow-lg text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50"
            >
              <Save size={14} /> {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[1600px] mx-auto py-8 px-4 sm:px-6 lg:px-8"
      >
        {/* Navigation Bar */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/admin/employees')}
            className="flex items-center gap-2 text-gray-500 hover:text-[#03045e] font-bold text-sm transition-colors group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Staff Registry
          </button>
        </div>

        {/* ── Profile Header (Hero Section) ── */}
        <div className="relative mb-10 overflow-hidden rounded-[2.5rem] bg-white border border-gray-100 shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-[#03045e]/5 to-[#00b4d8]/5 -z-10" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 md:p-10">
            
            {/* Left Side: Identity */}
            <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
              <div className="relative group">
                <div className="w-32 h-32 md:w-36 md:h-36 rounded-[2.25rem] bg-gradient-to-br from-[#03045e] to-[#0077b6] flex items-center justify-center text-white text-5xl font-black shadow-xl border-4 border-white ring-4 ring-white overflow-hidden">
                  {initials}
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-2.5 mb-2.5">
                  <StatusBadge type={statusColor} text={staff.employment.status || 'Active'} />
                  <StatusBadge type="neutral" text={staff.employment.category} />
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-[#03045e] mb-2 tracking-tight">
                  {staff.coreProfile.fullName}
                </h1>
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-6 gap-y-2 text-gray-500 font-bold text-xs uppercase tracking-tight">
                  <span className="flex items-center gap-2"><Contact size={14} className="text-[#00b4d8]" /> ID: {staff.id}</span>
                  <span className="flex items-center gap-2"><Briefcase size={14} className="text-[#00b4d8]" /> {staff.employment.designation}</span>
                  <span className="flex items-center gap-2"><Building2 size={14} className="text-[#00b4d8]" /> {staff.employment.departmentName || staff.employment.departmentId?.replace('dept-', '')?.toUpperCase() || 'Unassigned'}</span>
                </div>
              </div>
            </div>

            {/* Right Side: Quick Actions */}
            <div className="flex items-center gap-3 w-full md:w-auto">
               {!isEditMode && (
                 <>
                   <button 
                      onClick={() => setIdCardModalOpen(true)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-white border border-gray-100 text-[#03045e] hover:border-[#00b4d8] hover:text-[#00b4d8] transition-all shadow-sm group"
                   >
                      <Contact size={18} />
                      <span className="text-[11px] font-black uppercase tracking-widest">View ID Card</span>
                   </button>
                   <button 
                      onClick={() => setIsEditMode(true)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-[#03045e] text-white hover:bg-[#0077b6] transition-all shadow-lg shadow-[#03045e]/20 group"
                   >
                      <Edit3 size={18} />
                      <span className="text-[11px] font-black uppercase tracking-widest">Edit Profile</span>
                   </button>
                 </>
               )}
            </div>
          </div>
        </div>

        {/* ── Main Grid Layout (65/35) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── LEFT COLUMN (65% approx) ── */}
          <div className="lg:col-span-8 flex flex-col gap-8 md:gap-10">
            
            {/* 1. Personal Information */}
            <ProfileSection icon={User} title="Personal Information">
              <MainCard borderColor="#00b4d8" className="p-6 md:p-8">
                {isEditMode ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                      <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#00b4d8] outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gender</label>
                      <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#00b4d8] outline-none">
                        <option value="">Select...</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date of Birth</label>
                      <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#00b4d8] outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Blood Group</label>
                      <input type="text" name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#00b4d8] outline-none" />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-6">
                    <InfoField label="Full Name" value={staff.coreProfile.fullName} />
                    <InfoField label="Gender" value={staff.coreProfile.gender} />
                    <InfoField label="Date of Birth" value={staff.coreProfile.dateOfBirth || staff.coreProfile.dob} />
                    <InfoField label="Blood Group" value={staff.coreProfile.bloodGroup} />
                  </div>
                )}
              </MainCard>
            </ProfileSection>

            {/* 2. Employment & HR */}
            <ProfileSection icon={Briefcase} title="Employment & HR">
              <MainCard borderColor="#caf0f8" className="p-6 md:p-8">
                {isEditMode ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Staff Category</label>
                      <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#00b4d8] outline-none">
                        <option value="Academic">Academic</option>
                        <option value="Administrative">Administrative</option>
                        <option value="Operational">Operational</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Designation</label>
                      <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#00b4d8] outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Employment Type</label>
                      <select name="employmentType" value={formData.employmentType} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#00b4d8] outline-none">
                        <option value="">Select...</option>
                        <option value="Full-Time">Full-Time</option>
                        <option value="Part-Time">Part-Time</option>
                        <option value="Contract">Contract</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Joining Date</label>
                      <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#00b4d8] outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</label>
                      <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#00b4d8] outline-none">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-6">
                    <InfoField label="Staff Category" value={staff.employment.category} />
                    <InfoField label="Designation" value={staff.employment.designation} />
                    <InfoField label="Employment Type" value={staff.employment.employmentType} />
                    <InfoField label="Joining Date" value={staff.employment.joiningDate} icon={Calendar} />
                    <InfoField label="Status" value={staff.employment.status} />
                  </div>
                )}
              </MainCard>
            </ProfileSection>

            {/* 3. Contact Details */}
            <ProfileSection icon={Phone} title="Contact Details">
              <MainCard borderColor="#caf0f8" className="p-6 md:p-8">
                {isEditMode ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#00b4d8] outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</label>
                      <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#00b4d8] outline-none" />
                    </div>
                    <div className="space-y-1 col-span-full">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Residential Address</label>
                      <textarea name="address" value={formData.address} onChange={handleInputChange} rows={3} className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#00b4d8] outline-none resize-none"></textarea>
                    </div>
                    <div className="space-y-1 col-span-full">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Emergency Contact</label>
                      <input type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#00b4d8] outline-none" />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-6">
                    <InfoField label="Email Address" value={staff.coreProfile.email} icon={Mail} />
                    <InfoField label="Phone Number" value={staff.coreProfile.phone} icon={Phone} />
                    <InfoField label="Residential Address" value={staff.coreProfile.address} icon={MapPin} fullWidth />
                    <InfoField label="Emergency Contact" value={staff.coreProfile.emergencyContact} fullWidth />
                  </div>
                )}
              </MainCard>
            </ProfileSection>
            
          </div>

          {/* ── RIGHT COLUMN (35% approx) ── */}
          <div className="lg:col-span-4 flex flex-col gap-8 md:gap-10">
            
            {/* Identity & Access */}
            <ProfileSection icon={ShieldCheck} title="Portal & Identity">
              <MainCard className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                        <ShieldCheck size={18} className={staff.identity.portalAccess ? "text-emerald-500" : "text-gray-400"} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#03045e]">System Access</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          {staff.identity.portalAccess ? 'Provisioned' : 'Not Provisioned'}
                        </p>
                      </div>
                    </div>
                    {isEditMode && (
                      <div className="w-10 h-6 bg-[#00b4d8] rounded-full relative cursor-pointer opacity-50" title="Manage in User Management">
                        <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                      </div>
                    )}
                  </div>

                  {!isEditMode && staff.identity.linkedAuthUserId && (
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <Hash size={14} />
                      Auth ID: {staff.identity.linkedAuthUserId}
                    </div>
                  )}
                </div>
              </MainCard>
            </ProfileSection>

            {/* Modules / Extensions */}
            {!isEditMode && extensions.length > 0 && (
              <ProfileSection icon={LayoutGrid} title="Modules">
                <div className="grid grid-cols-1 gap-3">
                  {extensions.map(ext => {
                    const IconComponent = ext.icon || FileText;
                    return (
                      <button 
                        key={ext.extId}
                        onClick={() => navigate(`/admin/staff/${staff.id}/${ext.route}`)}
                        className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-[#00b4d8] hover:shadow-md transition-all text-left group"
                      >
                        <div className="p-3 bg-[#caf0f8]/50 rounded-xl text-[#0077b6] group-hover:bg-[#00b4d8] group-hover:text-white transition-colors">
                          <IconComponent size={20} />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-[#03045e] mb-0.5">{ext.title}</h3>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Domain Extension</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </ProfileSection>
            )}
          </div>

        </div>
      </motion.div>

      {/* ID Card Modal */}
      <IDCardPreviewModal 
        isOpen={idCardModalOpen} 
        onClose={() => setIdCardModalOpen(false)}
      >
        <IDCard variant="staff" data={idCardData} />
      </IDCardPreviewModal>
    </>
  );
};

export default StaffProfilePage;
