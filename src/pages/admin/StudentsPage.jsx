import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  UserPlus,
  Filter,
  Mail,
  Phone,
  ChevronRight,
  Users,
  Trash,
} from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminStatCard from "../../components/admin/AdminStatCard";
import AdminFilterBar from "../../components/admin/AdminFilterBar";
import AdminDataTable from "../../components/admin/AdminDataTable";
import AdminSectionCard from "../../components/admin/AdminSectionCard";
import AdminProfilePreview from "../../components/admin/AdminProfilePreview";
import AdminEditForm from "../../components/admin/AdminEditForm";
import {
  getAllStudents,
  updateStudentProfile,
} from "../../services/studentService";
import { formatClassName, isSeniorSecondary } from "../../utils/classIdentity";

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [filterStream, setFilterStream] = useState("");
  const [loading, setLoading] = useState(true);

  // Preview & Edit states
  const [previewStudent, setPreviewStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getAllStudents();
      setStudents(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStudent = async (formData) => {
    if (!editStudent) return;
    try {
      const updated = await updateStudentProfile(editStudent.id, formData);
      if (updated) {
        // Sync local list
        setStudents((prev) =>
          prev.map((s) => (s.id === editStudent.id ? { ...s, ...updated } : s)),
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sectionToStream = {
    A: "Science Non-Medical",
    B: "Science Medical",
    C: "Commerce",
    D: "Humanities",
  };

  const handleClassChange = (cls) => {
    setFilterClass(cls);
    if ((cls === "11" || cls === "12") && filterSection) {
      setFilterStream(sectionToStream[filterSection] || "");
    } else {
      setFilterStream("");
    }
  };

  const handleSectionChange = (sec) => {
    setFilterSection(sec);
    if ((filterClass === "11" || filterClass === "12") && sec) {
      setFilterStream(sectionToStream[sec] || "");
    }
  };

  const filteredStudents = students.filter((stu) => {
    const matchesSearch =
      stu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stu.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stu.admissionNo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = filterClass === "" || stu.classLevel === filterClass;
    const matchesSection =
      filterSection === "" || stu.section === filterSection;
    const matchesStream =
      !isSeniorSecondary(stu.classLevel) ||
      filterStream === "" ||
      stu.stream === filterStream;

    return matchesSearch && matchesClass && matchesSection && matchesStream;
  });

  const studentFields = [
    { name: "name", label: "Student Full Name", type: "text", required: true },
    {
      name: "classLevel",
      label: "Class",
      type: "select",
      options: [
        "Nursery",
        "LKG",
        "UKG",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
      ],
      required: true,
    },
    {
      name: "section",
      label: "Section",
      type: "select",
      options: ["A", "B", "C", "D"],
      required: true,
    },
    {
      name: "stream",
      label: "Academic Stream (Classes 11 & 12 only)",
      type: "select",
      options: [
        "Science Non-Medical",
        "Science Medical",
        "Commerce",
        "Humanities",
      ],
      hidden: (formState) => !isSeniorSecondary(formState.classLevel),
    },
    {
      name: "phoneNumber",
      label: "Primary Contact Number",
      type: "text",
      required: true,
    },
    {
      name: "gender",
      label: "Gender",
      type: "select",
      options: ["Male", "Female", "Other"],
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      options: ["General", "OBC", "SC", "ST"],
    },
    { name: "nationality", label: "Nationality", type: "text" },
    { name: "dob", label: "Date of Birth (YYYY-MM-DD)", type: "text" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      <AdminPageHeader
        title="Student Directory"
        description="Manage institutional student records, admission statuses, and parent mappings."
        breadcrumbs={["Admin Portal", "User Management", "Students"]}
        actionButton={
          <button className="flex items-center gap-2 bg-[#0077b6] hover:bg-[#0096c7] text-white px-5 py-2.5 rounded-2xl shadow-sm text-xs font-black transition-colors">
            <UserPlus size={16} />
            <span>ADMIT STUDENT</span>
          </button>
        }
      />

      {/* Stats Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <AdminStatCard
          title="Active Admissions"
          value={students.length.toString()}
          badgeText="All Clear"
          badgeType="success"
          icon={Users}
        />
        <AdminStatCard
          title="Senior Secondary Students"
          value={students
            .filter((s) => isSeniorSecondary(s.classLevel))
            .length.toString()}
          badgeText="Class XI & XII"
          badgeType="info"
          icon={Users}
          color="#0096c7"
          bg="#ade8f4"
        />
        <AdminStatCard
          title="Administrative Mappings"
          value="100%"
          badgeText="Fully Synced"
          badgeType="neutral"
          icon={Users}
          color="#03045e"
          bg="#e0f2fe"
        />
      </div>

      {/* Directory Table inside Section Card */}
      <AdminSectionCard>
        {/* Search and filter bar */}
        <AdminFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search by name, admission no or id..."
          filterButton={
            <div className="flex flex-wrap gap-2">
              <select
                value={filterClass}
                onChange={(e) => handleClassChange(e.target.value)}
                className="flex items-center gap-2 border border-[#caf0f8] hover:border-[#00b4d8] px-4 py-2.5 rounded-2xl text-xs font-bold text-[#03045e] transition-colors bg-white outline-none"
              >
                <option value="">All Classes</option>
                <option value="Nursery">Nursery</option>
                <option value="LKG">LKG</option>
                <option value="UKG">UKG</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num.toString()}>
                    {num === 11
                      ? "Class XI"
                      : num === 12
                        ? "Class XII"
                        : `Class ${num}`}
                  </option>
                ))}
              </select>

              <select
                value={filterSection}
                onChange={(e) => handleSectionChange(e.target.value)}
                className="flex items-center gap-2 border border-[#caf0f8] hover:border-[#00b4d8] px-4 py-2.5 rounded-2xl text-xs font-bold text-[#03045e] transition-colors bg-white outline-none"
              >
                <option value="">All Sections</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
                <option value="D">Section D</option>
              </select>

              {(filterClass === "11" || filterClass === "12") && (
                <select
                  value={filterStream}
                  onChange={(e) => setFilterStream(e.target.value)}
                  className="flex items-center gap-2 border border-[#caf0f8] hover:border-[#00b4d8] px-4 py-2.5 rounded-2xl text-xs font-bold text-[#03045e] transition-colors bg-white outline-none"
                >
                  <option value="">All Streams</option>
                  <option value="Science Non-Medical">
                    Science Non-Medical
                  </option>
                  <option value="Science Medical">Science Medical</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Humanities">Humanities</option>
                </select>
              )}
            </div>
          }
        />

        {/* Modular Table Shell */}
        <div className="mt-6">
          <AdminDataTable
            headers={[
              "Adm No.",
              "Student Name",
              "Class & Section",
              "Contact Info",
              "Status",
              "Actions",
            ]}
            items={filteredStudents}
            isEmpty={filteredStudents.length === 0}
            emptyTitle="No students found matching current query"
            renderRow={(stu) => {
              const displayClassSec = formatClassName(
                stu.classLevel,
                stu.section,
              );
              return (
                <tr
                  key={stu.id}
                  className="hover:bg-[#caf0f8]/10 transition-colors text-xs text-gray-700 font-bold"
                >
                  <td className="py-4 px-3 text-[#03045e] font-black first:pl-2">
                    {stu.admissionNo}
                  </td>
                  <td className="py-4 px-3">
                    <button
                      onClick={() => setPreviewStudent(stu)}
                      className="hover:text-[#0077b6] text-left transition-colors font-extrabold focus:outline-none"
                    >
                      {stu.name}
                    </button>
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#caf0f8]/70 text-[#03045e] border border-[#caf0f8]">
                        {displayClassSec}
                      </span>
                      {isSeniorSecondary(stu.classLevel) && stu.stream && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                          {stu.stream}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-3">
                    <div className="space-y-1 text-[10px] text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Phone size={10} />
                        <span>{stu.phoneNumber || "+91 98765 43210"}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-3">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 uppercase tracking-wider">
                      Active
                    </span>
                  </td>
                  <td className="py-4 px-3 text-right last:pr-2">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setPreviewStudent(stu)}
                        className="text-[#0077b6] hover:text-[#03045e] transition-colors p-1.5 hover:bg-[#caf0f8]/40 rounded-lg"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }}
          />
        </div>
      </AdminSectionCard>

      {/* Sliding Profile Drawer */}
      <AdminProfilePreview
        isOpen={!!previewStudent}
        onClose={() => setPreviewStudent(null)}
        type="student"
        data={previewStudent}
        onEdit={(studentData) => setEditStudent(studentData)}
      />

      {/* Centred Edit Modal */}
      <AdminEditForm
        isOpen={!!editStudent}
        onClose={() => setEditStudent(null)}
        title="Edit Student Record"
        data={editStudent}
        fields={studentFields}
        onChange={(name, value, currentState) => {
          const updated = { ...currentState };
          // If classLevel changes to anything other than 11 or 12, clear stream
          if (name === "classLevel") {
            if (value !== "11" && value !== "12") {
              updated.stream = "";
            } else if (updated.section) {
              // Auto-suggest stream based on section if changing to 11/12
              updated.stream = sectionToStream[updated.section] || "";
            }
          }
          // If section changes and classLevel is 11 or 12, auto-populate stream
          if (
            name === "section" &&
            (updated.classLevel === "11" || updated.classLevel === "12")
          ) {
            updated.stream = sectionToStream[value] || "";
          }
          return updated;
        }}
        onSubmit={handleUpdateStudent}
      />
    </motion.div>
  );
};

export default StudentsPage;
