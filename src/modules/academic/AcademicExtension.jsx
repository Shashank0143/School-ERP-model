import React, { useState, useEffect } from 'react';
import { useStaffContext } from '../../context/StaffContext';
import * as teacherService from '../../services/teacherService';
import { toast } from 'react-toastify';
import { Save, BookOpen, Clock, Users, GraduationCap } from 'lucide-react';

const AcademicExtension = () => {
  const { staff } = useStaffContext();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State separated by Feature Blocks
  const [teachingCredentials, setTeachingCredentials] = useState('');
  const [certifications, setCertifications] = useState('');
  
  const [subjects, setSubjects] = useState('');
  const [preferredGrades, setPreferredGrades] = useState(''); // Kept in state but won't be exposed per instruction
  
  const [classTeacher, setClassTeacher] = useState('');
  const [sections, setSections] = useState('');
  const [clubs, setClubs] = useState('');
  
  const [weeklyLimit, setWeeklyLimit] = useState('');

  useEffect(() => {
    const fetchAcademicProfile = async () => {
      try {
        setLoading(true);
        // We use the ID from the StaffProjection to fetch local domain data
        const data = await teacherService.getTeacherProfileByEmployeeId(staff.id);
        
        if (data) {
          setProfile(data);
          // Hydrate forms
          setTeachingCredentials(data.qualifications || '');
          setCertifications(data.certifications || '');
          setSubjects(data.subjectsTaught || '');
          setClassTeacher(data.classTeacher || '');
          setSections(data.sectionsHandled || '');
          setClubs(data.clubs || '');
          setWeeklyLimit(data.weeklyWorkloadLimit || '24');
        } else {
          // No profile found, initialize empty
          setProfile({ employeeId: staff.id });
        }
      } catch (err) {
        console.error("Failed to load academic profile", err);
      } finally {
        setLoading(false);
      }
    };

    if (staff && staff.capabilities.includes('ACADEMIC')) {
      fetchAcademicProfile();
    }
  }, [staff]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        qualifications: teachingCredentials,
        certifications,
        subjectsTaught: subjects,
        classTeacher,
        sectionsHandled: sections,
        clubs,
        weeklyWorkloadLimit: weeklyLimit,
      };

      if (profile && profile.id) {
        await teacherService.updateTeacherProfile(profile.id, payload);
      } else {
        await teacherService.createTeacherProfile({ ...payload, employeeId: staff.id });
      }

      toast.success("Academic details updated successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update academic profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading Academic Profile...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-indigo-600" />
              Academic & Teaching Profile
            </h2>
            <p className="text-sm text-gray-500 mt-1">Manage teaching credentials, subjects, assignments, and workload.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Feature Block: Profile & Credentials */}
          <div className="space-y-4">
            <h3 className="text-md font-semibold text-gray-800 flex items-center border-b pb-2">
              <GraduationCap className="w-4 h-4 mr-2 text-blue-500" />
              Teaching Credentials
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Licenses & Degrees (e.g. B.Ed, CTET)</label>
              <input
                type="text"
                value={teachingCredentials}
                onChange={(e) => setTeachingCredentials(e.target.value)}
                placeholder="Comma separated"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">General education (M.Sc, B.Tech) is managed in the Core Profile.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Other Certifications</label>
              <input
                type="text"
                value={certifications}
                onChange={(e) => setCertifications(e.target.value)}
                placeholder="Google Educator, Microsoft IE"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Feature Block: Teaching */}
          <div className="space-y-4">
            <h3 className="text-md font-semibold text-gray-800 flex items-center border-b pb-2">
              <BookOpen className="w-4 h-4 mr-2 text-green-500" />
              Teaching
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subjects Qualified to Teach</label>
              <input
                type="text"
                value={subjects}
                onChange={(e) => setSubjects(e.target.value)}
                placeholder="Mathematics, Physics"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            {/* Preferred Grades postponed to Timetable v2 as per instructions */}
          </div>

          {/* Feature Block: Assignments */}
          <div className="space-y-4">
            <h3 className="text-md font-semibold text-gray-800 flex items-center border-b pb-2">
              <Users className="w-4 h-4 mr-2 text-purple-500" />
              Current Assignments
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class Teacher</label>
              <input
                type="text"
                value={classTeacher}
                onChange={(e) => setClassTeacher(e.target.value)}
                placeholder="e.g. 10th Grade"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sections Handled</label>
              <input
                type="text"
                value={sections}
                onChange={(e) => setSections(e.target.value)}
                placeholder="A, B, C"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Clubs & Committees</label>
              <input
                type="text"
                value={clubs}
                onChange={(e) => setClubs(e.target.value)}
                placeholder="Science Club, Debate Team"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Feature Block: Workload */}
          <div className="space-y-4">
            <h3 className="text-md font-semibold text-gray-800 flex items-center border-b pb-2">
              <Clock className="w-4 h-4 mr-2 text-orange-500" />
              Workload Constraints
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Weekly Classes (Limit)</label>
              <input
                type="number"
                value={weeklyLimit}
                onChange={(e) => setWeeklyLimit(e.target.value)}
                min="0"
                max="50"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AcademicExtension;
