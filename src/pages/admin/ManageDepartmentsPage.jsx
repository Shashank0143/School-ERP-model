import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Plus,
  Briefcase,
  Eye,
  Edit,
  Shield,
  Layers,
  Users,
  Phone,
  Mail,
  MapPin,
  X,
  Search,
  Trash2,
} from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import MainCard from "../../components/MainCard";

// Realistic School ERP Department Structure
const DEPARTMENTS_SEED = [
  {
    id: "dept-academics",
    name: "Academic Affairs",
    code: "ACAD",
    category: "Academic",
    head: {
      name: "Dr. Rajesh Sharma",
      id: "T001",
      designation: "Dean Academics",
    },
    contact: {
      phone: "+91-9876543210",
      email: "academics@school.edu",
      location: "Block A, Room 101",
    },
    members: 45,
    subDepartments: [
      "Curriculum Development",
      "Teacher Training",
      "Academic Planning",
    ],
    status: "active",
    established: "2015-03-15",
    description:
      "Oversees curriculum development, academic planning, and teacher training programs",
  },
  {
    id: "dept-examination",
    name: "Examination & Evaluation",
    code: "EXAM",
    category: "Academic",
    head: {
      name: "Prof. Amit Verma",
      id: "T002",
      designation: "Controller of Examinations",
    },
    contact: {
      phone: "+91-9876543211",
      email: "exams@school.edu",
      location: "Block B, Room 205",
    },
    members: 12,
    subDepartments: ["Exam Scheduling", "Result Processing", "Invigilation"],
    status: "active",
    established: "2015-06-01",
    description:
      "Manages examination scheduling, conduct, result processing, and academic assessments",
  },
  {
    id: "dept-student-affairs",
    name: "Student Affairs",
    code: "STUD",
    category: "Student Services",
    head: {
      name: "Mrs. Priya Gupta",
      id: "T003",
      designation: "Dean Student Affairs",
    },
    contact: {
      phone: "+91-9876543212",
      email: "student.affairs@school.edu",
      location: "Block C, Room 301",
    },
    members: 18,
    subDepartments: ["Counseling", "Discipline", "Student Welfare"],
    status: "active",
    established: "2016-01-10",
    description:
      "Handles student counseling, discipline, welfare programs, and extracurricular activities",
  },
  {
    id: "dept-administration",
    name: "Administration",
    code: "ADMN",
    category: "Administrative",
    head: {
      name: "Mr. Suresh Kumar",
      id: "T004",
      designation: "Administrative Officer",
    },
    contact: {
      phone: "+91-9876543213",
      email: "admin@school.edu",
      location: "Main Building, Ground Floor",
    },
    members: 25,
    subDepartments: ["HR", "Procurement", "General Administration"],
    status: "active",
    established: "2015-01-01",
    description:
      "Central administrative operations including HR, procurement, and general administration",
  },
  {
    id: "dept-finance",
    name: "Finance & Accounts",
    code: "FINC",
    category: "Administrative",
    head: {
      name: "Mr. Deepak Joshi",
      id: "T005",
      designation: "Finance Manager",
    },
    contact: {
      phone: "+91-9876543214",
      email: "finance@school.edu",
      location: "Main Building, First Floor",
    },
    members: 10,
    subDepartments: ["Fee Collection", "Payroll", "Auditing"],
    status: "active",
    established: "2015-02-15",
    description:
      "Manages financial operations, fee collection, payroll processing, and auditing",
  },
  {
    id: "dept-transport",
    name: "Transport Services",
    code: "TRAN",
    category: "Support Services",
    head: {
      name: "Mr. Vijay Patel",
      id: "T006",
      designation: "Transport Manager",
    },
    contact: {
      phone: "+91-9876543215",
      email: "transport@school.edu",
      location: "Transport Wing",
    },
    members: 35,
    subDepartments: ["Fleet Management", "Route Planning", "Driver Operations"],
    status: "active",
    established: "2016-04-01",
    description:
      "Manages school transport fleet, route planning, and driver operations",
  },
  {
    id: "dept-it",
    name: "IT Infrastructure",
    code: "ITSP",
    category: "Support Services",
    head: { name: "Mr. Krishna Reddy", id: "T007", designation: "IT Manager" },
    contact: {
      phone: "+91-9876543216",
      email: "it@school.edu",
      location: "Server Room, Block D",
    },
    members: 8,
    subDepartments: ["Network", "Hardware", "Software Support"],
    status: "active",
    established: "2017-01-20",
    description:
      "Maintains IT infrastructure, network systems, and provides technical support",
  },
  {
    id: "dept-facilities",
    name: "Facilities Management",
    code: "FACI",
    category: "Support Services",
    head: {
      name: "Mr. Ramesh Singh",
      id: "T008",
      designation: "Facilities Manager",
    },
    contact: {
      phone: "+91-9876543217",
      email: "facilities@school.edu",
      location: "Maintenance Office",
    },
    members: 22,
    subDepartments: ["Maintenance", "Housekeeping", "Security"],
    status: "active",
    established: "2015-05-10",
    description:
      "Oversees building maintenance, housekeeping, and campus security operations",
  },
  {
    id: "dept-sports",
    name: "Sports & Physical Education",
    code: "SPRT",
    category: "Co-Curricular",
    head: {
      name: "Mr. Vikram Das",
      id: "T009",
      designation: "Sports Director",
    },
    contact: {
      phone: "+91-9876543218",
      email: "sports@school.edu",
      location: "Sports Complex",
    },
    members: 15,
    subDepartments: ["Coaching", "Events", "Equipment"],
    status: "active",
    established: "2016-08-15",
    description:
      "Manages sports programs, coaching, tournaments, and physical education curriculum",
  },
  {
    id: "dept-library",
    name: "Library & Information Services",
    code: "LIBR",
    category: "Academic",
    head: {
      name: "Mrs. Lakshmi Mehta",
      id: "T010",
      designation: "Chief Librarian",
    },
    contact: {
      phone: "+91-9876543219",
      email: "library@school.edu",
      location: "Library Building",
    },
    members: 7,
    subDepartments: ["Circulation", "Digital Resources", "Reference"],
    status: "active",
    established: "2015-07-01",
    description:
      "Provides library services, digital resources, and reference materials to students and staff",
  },
];

const CATEGORIES = [
  "All",
  "Academic",
  "Administrative",
  "Student Services",
  "Support Services",
  "Co-Curricular",
];

// Helper to generate realistic members for a department
const generateMockMembers = (count, deptName) => {
  const firstNames = [
    "Amit", "Neha", "Rahul", "Priya", "Sanjay", "Deepa", "Vikram", "Kavita", 
    "Suresh", "Sunita", "Rajesh", "Meena", "Ravi", "Anjali", "Arun", "Pooja",
    "Kiran", "Divya", "Alok", "Shalini", "Sunil", "Ritu", "Harish", "Aarti"
  ];
  const lastNames = [
    "Sharma", "Verma", "Gupta", "Singh", "Kumar", "Patel", "Reddy", "Iyer", 
    "Nair", "Das", "Mehta", "Jain", "Saxena", "Joshi", "Bose", "Choudhury"
  ];
  const roles = [
    "Specialist", "Officer", "Coordinator", "Executive", "Assistant", 
    "Associate", "Supervisor", "Liaison", "Analyst"
  ];

  const list = [];
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[(i + deptName.charCodeAt(0) + count) % firstNames.length];
    const lastName = lastNames[(i * 3 + deptName.charCodeAt(deptName.length - 1)) % lastNames.length];
    const name = `${firstName} ${lastName}`;
    const role = i === 0 ? "Assistant Head" : `${deptName.replace(" & ", " ").split(" ")[0]} ${roles[i % roles.length]}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@school.edu`;
    const phone = `+91 98765 ${String(10000 + i * 147).substring(0, 5)}`;
    list.push({
      id: `mem-${deptName.toLowerCase().replace(/[^a-z0-9]/g, "")}-${i}`,
      name,
      role,
      email,
      phone,
      joinedDate: `20${19 + (i % 5)}-07-15`
    });
  }
  return list;
};

const ManageDepartmentsPage = () => {
  // Load initial departments from localStorage or seed
  const [departments, setDepartments] = useState(() => {
    const saved = localStorage.getItem("school_erp_departments");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing departments from localStorage:", e);
      }
    }
    const seeded = DEPARTMENTS_SEED.map((dept) => ({
      ...dept,
      memberList: generateMockMembers(dept.members, dept.name)
    }));
    localStorage.setItem("school_erp_departments", JSON.stringify(seeded));
    return seeded;
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // grid | list
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedDept, setExpandedDept] = useState(null);
  const [activeDeptDetails, setActiveDeptDetails] = useState(null); // Selected department object for detail view

  // For Adding new members inside details view
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");
  const [memberSearchTerm, setMemberSearchTerm] = useState("");
  const [memberError, setMemberError] = useState("");

  // Helper to persist state
  const saveDepartments = (updatedList) => {
    setDepartments(updatedList);
    localStorage.setItem("school_erp_departments", JSON.stringify(updatedList));
    // If active details are open, update the active details object to reflect changes
    if (activeDeptDetails) {
      const refreshedActive = updatedList.find(d => d.id === activeDeptDetails.id);
      setActiveDeptDetails(refreshedActive);
    }
  };

  const filteredDepartments = useMemo(() => {
    return departments.filter((dept) => {
      const matchesSearch =
        searchTerm === "" ||
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dept.head && dept.head.name && dept.head.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        categoryFilter === "All" || dept.category === categoryFilter;
      const matchesStatus =
        statusFilter === "all" || dept.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [departments, searchTerm, categoryFilter, statusFilter]);

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-emerald-50 text-emerald-700 border-emerald-200",
      inactive: "bg-gray-50 text-gray-600 border-gray-200",
      suspended: "bg-amber-50 text-amber-700 border-amber-200",
    };
    const labels = {
      active: "Active",
      inactive: "Inactive",
      suspended: "Suspended",
    };
    return (
      <span
        className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${styles[status] || styles.active}`}
      >
        {labels[status] || status}
      </span>
    );
  };

  const getCategoryColor = (category) => {
    const colors = {
      Academic: "bg-blue-50 text-blue-700 border-blue-200",
      Administrative: "bg-purple-50 text-purple-700 border-purple-200",
      "Student Services": "bg-green-50 text-green-700 border-green-200",
      "Support Services": "bg-orange-50 text-orange-700 border-orange-200",
      "Co-Curricular": "bg-pink-50 text-pink-700 border-pink-200",
    };
    return colors[category] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  // Add Member handler
  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberRole.trim() || !newMemberEmail.trim()) {
      setMemberError("Please fill in Name, Designation, and Email.");
      return;
    }
    setMemberError("");

    const updatedDepartments = departments.map((d) => {
      if (d.id === activeDeptDetails.id) {
        const currentMembers = d.memberList || [];
        const newMember = {
          id: `mem-${Date.now()}`,
          name: newMemberName,
          role: newMemberRole,
          email: newMemberEmail,
          phone: newMemberPhone || "N/A",
          joinedDate: new Date().toISOString().split("T")[0]
        };
        const updatedList = [newMember, ...currentMembers];
        return {
          ...d,
          memberList: updatedList,
          members: updatedList.length
        };
      }
      return d;
    });

    saveDepartments(updatedDepartments);

    // Reset Form
    setNewMemberName("");
    setNewMemberRole("");
    setNewMemberEmail("");
    setNewMemberPhone("");
  };

  // Remove Member handler
  const handleRemoveMember = (memberId) => {
    const updatedDepartments = departments.map((d) => {
      if (d.id === activeDeptDetails.id) {
        const currentMembers = d.memberList || [];
        const updatedList = currentMembers.filter(m => m.id !== memberId);
        return {
          ...d,
          memberList: updatedList,
          members: updatedList.length
        };
      }
      return d;
    });

    saveDepartments(updatedDepartments);
  };

  // Delete Department handler
  const handleDeleteDepartment = (deptId, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this department?")) {
      const updated = departments.filter(d => d.id !== deptId);
      saveDepartments(updated);
    }
  };

  // Create Department handler (Form inputs inside standard state can be added, or basic dynamic generation)
  const handleCreateDepartment = (e) => {
    e.preventDefault();
    const name = e.target.deptName.value;
    const code = e.target.deptCode.value;
    const category = e.target.deptCategory.value;
    const description = e.target.deptDescription.value;
    const headName = e.target.headName.value || "Not Assigned";
    const headDes = e.target.headDesignation.value || "TBD";
    const phone = e.target.phone.value || "N/A";
    const email = e.target.email.value || "N/A";
    const location = e.target.location.value || "N/A";
    const est = e.target.estDate.value || new Date().toISOString().split("T")[0];

    if (!name || !code || !category) {
      alert("Please fill in Name, Code, and Category.");
      return;
    }

    const newDept = {
      id: `dept-${Date.now()}`,
      name,
      code: code.toUpperCase(),
      category,
      head: { name: headName, designation: headDes, id: `T${Date.now().toString().slice(-3)}` },
      contact: { phone, email, location },
      members: 0,
      memberList: [],
      subDepartments: ["General Operations"],
      status: "active",
      established: est,
      description
    };

    const updated = [newDept, ...departments];
    saveDepartments(updated);
    setShowCreateModal(false);
  };

  // Filtered members inside detail view
  const filteredMemberList = useMemo(() => {
    if (!activeDeptDetails || !activeDeptDetails.memberList) return [];
    return activeDeptDetails.memberList.filter((m) => 
      m.name.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
      m.role.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(memberSearchTerm.toLowerCase())
    );
  }, [activeDeptDetails, memberSearchTerm]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      <AdminPageHeader
        title="Department Management"
        description="Manage institutional departments, their structure, and operational details"
        breadcrumbs={["Admin Portal", "Institutional", "Departments"]}
        actionButton={
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-[#0077b6] hover:bg-[#03045e] text-white px-5 py-2.5 rounded-2xl shadow-lg shadow-[#0077b6]/20 text-xs font-black transition-all"
          >
            <Plus size={16} />
            <span>Create Department</span>
          </button>
        }
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Departments",
            value: departments.length,
            icon: Building2,
            color: "text-[#0077b6]",
          },
          {
            label: "Active Departments",
            value: departments.filter((d) => d.status === "active").length,
            icon: Shield,
            color: "text-emerald-600",
          },
          {
            label: "Total Staff",
            value: departments.reduce((acc, d) => acc + (d.members || 0), 0),
            icon: Users,
            color: "text-[#03045e]",
          },
          {
            label: "Categories",
            value: CATEGORIES.length - 1,
            icon: Layers,
            color: "text-purple-600",
          },
        ].map((stat, i) => (
          <MainCard key={i} className="p-4 border border-[#caf0f8]/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-lg font-black text-[#03045e] mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl bg-[#caf0f8] ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
          </MainCard>
        ))}
      </div>

      {/* Filters */}
      <MainCard className="p-4 border border-[#caf0f8]/60">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search departments, codes, or heads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] bg-white transition-colors placeholder:font-normal placeholder:text-gray-300"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] bg-white transition-colors cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] bg-white transition-colors cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
            <div className="flex items-center bg-gray-50 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-white text-[#03045e] shadow-sm" : "text-gray-400"}`}
              >
                <Building2 size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-white text-[#03045e] shadow-sm" : "text-gray-400"}`}
              >
                <Briefcase size={16} />
              </button>
            </div>
          </div>
        </div>
      </MainCard>

      {/* Department Grid View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDepartments.map((dept) => (
            <MainCard
              key={dept.id}
              onClick={() => {
                setMemberSearchTerm("");
                setActiveDeptDetails(dept);
              }}
              className="border border-[#caf0f8]/60 hover:border-[#0077b6]/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
            >
              {/* Subtle visual brand line based on category */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#0077b6]/20 group-hover:bg-[#0077b6] transition-colors" />
              
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#03045e] text-white flex items-center justify-center text-lg font-black group-hover:scale-110 transition-transform">
                      {dept.code.substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#03045e] group-hover:text-[#0077b6] transition-colors">
                        {dept.name}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${getCategoryColor(dept.category)}`}
                      >
                        {dept.category}
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(dept.status)}
                </div>

                <p className="text-[10px] text-gray-500 mb-4 line-clamp-2">
                  {dept.description}
                </p>

                <div className="space-y-2 mb-4">
                  {dept.head && (
                    <div className="flex items-center gap-2 text-[10px]">
                      <Users size={12} className="text-gray-400" />
                      <span className="font-bold text-gray-600">
                        {dept.head.name}
                      </span>
                      <span className="text-gray-400">
                        • {dept.head.designation}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[10px]">
                    <Briefcase size={12} className="text-gray-400" />
                    <span className="font-bold text-gray-600">
                      {dept.members} Staff Members
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <MapPin size={12} className="text-gray-400" />
                    <span className="font-bold text-gray-600">
                      {dept.contact.location}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-black text-[#0077b6] group-hover:underline flex items-center gap-1">
                      <Eye size={12} />
                      View Members & Details
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={(e) => handleDeleteDepartment(dept.id, e)} 
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </MainCard>
          ))}
        </div>
      ) : (
        /* List View */
        <MainCard className="border border-[#caf0f8]/60 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  Department
                </th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  Head
                </th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  Staff
                </th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDepartments.map((dept) => (
                <tr
                  key={dept.id}
                  onClick={() => {
                    setMemberSearchTerm("");
                    setActiveDeptDetails(dept);
                  }}
                  className="border-b border-gray-50 hover:bg-[#caf0f8]/20 transition-colors cursor-pointer group"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#03045e] text-white flex items-center justify-center text-sm font-black group-hover:scale-105 transition-transform">
                        {dept.code.substring(0, 2)}
                      </div>
                      <div>
                        <p className="text-xs font-black text-[#03045e] group-hover:text-[#0077b6] transition-colors">
                          {dept.name}
                        </p>
                        <p className="text-[10px] text-gray-400">{dept.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {dept.head ? (
                      <>
                        <p className="text-xs font-bold text-gray-700">
                          {dept.head.name}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {dept.head.designation}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs font-bold text-gray-400">Unassigned</p>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border ${getCategoryColor(dept.category)}`}
                    >
                      {dept.category}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <Users size={12} className="text-gray-400" />
                      <span className="text-xs font-bold text-gray-700">
                        {dept.members}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">{getStatusBadge(dept.status)}</td>
                  <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => {
                          setMemberSearchTerm("");
                          setActiveDeptDetails(dept);
                        }} 
                        className="p-1.5 rounded-lg hover:bg-[#caf0f8] text-gray-400 hover:text-[#0077b6] transition-colors"
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        onClick={(e) => handleDeleteDepartment(dept.id, e)} 
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </MainCard>
      )}

      {/* DEPARTMENT DETAILS DRAWER / MODAL */}
      {createPortal(
        <AnimatePresence>
          {activeDeptDetails && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex justify-end"
              style={{
                backgroundColor: "rgba(3,4,94,0.3)",
                backdropFilter: "blur(5px)",
              }}
              onClick={(e) => e.target === e.currentTarget && setActiveDeptDetails(null)}
            >
              <motion.div
                initial={{ x: "100%", opacity: 0.9 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0.9 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="bg-white w-full max-w-4xl h-full shadow-2xl flex flex-col border-l border-[#caf0f8] overflow-hidden"
              >
                {/* Drawer Header */}
                <div className="bg-[#03045e] text-white px-6 h-16 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center text-base font-black border border-white/20 shrink-0">
                      {activeDeptDetails.code.substring(0, 2)}
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-sm font-black tracking-wide leading-none m-0">
                          {activeDeptDetails.name}
                        </h2>
                        <span className="px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider border bg-white/10 text-[#caf0f8] border-white/20 leading-none flex items-center">
                          {activeDeptDetails.code}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#caf0f8]/80 leading-none m-0">
                        Established: {activeDeptDetails.established}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveDeptDetails(null)}
                    className="p-2 rounded-xl hover:bg-white/10 text-[#caf0f8] hover:text-white transition-colors flex items-center justify-center"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Drawer Content */}
                <div className="p-6 flex-1 overflow-y-auto space-y-6">
                  
                  {/* Upper Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Department Metadata */}
                    <MainCard className="p-4 border border-[#caf0f8]/60 md:col-span-2 space-y-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xs font-black text-[#03045e] uppercase tracking-wider">
                          Department Overview
                        </h3>
                        {getStatusBadge(activeDeptDetails.status)}
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed font-bold">
                        {activeDeptDetails.description}
                      </p>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <span className="text-[9px] text-gray-400 font-bold block">CATEGORY</span>
                          <span className="text-xs font-black text-[#03045e]">{activeDeptDetails.category}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-400 font-bold block">LOCATION</span>
                          <span className="text-xs font-black text-[#03045e]">{activeDeptDetails.contact.location}</span>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-[9px] text-gray-400 font-bold block mb-1">SUB-DEPARTMENTS</span>
                        <div className="flex flex-wrap gap-1">
                          {activeDeptDetails.subDepartments && activeDeptDetails.subDepartments.map((sub, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-lg bg-[#caf0f8]/50 text-[#0077b6] text-[9px] font-black border border-[#caf0f8]">
                              {sub}
                            </span>
                          ))}
                        </div>
                      </div>
                    </MainCard>

                    {/* Department Head */}
                    <MainCard className="p-4 bg-gradient-to-br from-[#03045e] to-[#0077b6] border-none text-white flex flex-col">
                      <h3 className="text-[9px] font-black text-[#caf0f8] uppercase tracking-wider mb-4">
                        Department Head
                      </h3>
                      {activeDeptDetails.head ? (
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <p className="text-sm font-black mb-1">{activeDeptDetails.head.name}</p>
                            <p className="text-[10px] text-[#caf0f8]">{activeDeptDetails.head.designation}</p>
                          </div>
                          
                          <div className="space-y-2 mt-4 pt-4 border-t border-white/10">
                            <div className="flex items-center gap-2">
                              <Phone size={12} className="text-[#caf0f8]" />
                              <span className="text-[10px] text-[#caf0f8]">{activeDeptDetails.contact.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail size={12} className="text-[#caf0f8]" />
                              <span className="text-[10px] text-[#caf0f8] break-all">{activeDeptDetails.contact.email}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center flex-col gap-2 opacity-50">
                          <Users size={32} />
                          <span className="text-xs font-bold">Unassigned</span>
                        </div>
                      )}
                    </MainCard>
                  </div>

                  {/* Interactive Members Directory and Add Member Form */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    
                    {/* Add Member Column */}
                    <div className="lg:col-span-5 flex flex-col h-full">
                      <MainCard className="p-5 border-2 border-dashed border-[#00b4d8]/30 bg-[#caf0f8]/10 h-full flex flex-col">
                        <div className="flex items-center gap-2 mb-4 shrink-0">
                          <Plus size={16} className="text-[#0077b6]" />
                          <h3 className="text-xs font-black text-[#03045e] uppercase tracking-wider">
                            Add New Member
                          </h3>
                        </div>
                        <form onSubmit={handleAddMember} className="space-y-4 flex-1 flex flex-col">
                          {memberError && (
                            <div className="p-2 rounded-lg bg-red-50 border border-red-100 text-[10px] font-bold text-red-600 mb-2">
                              {memberError}
                            </div>
                          )}
                          <div className="space-y-3">
                            <div>
                              <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">
                                Full Name *
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Dr. Rajesh Verma"
                                value={newMemberName}
                                onChange={(e) => setNewMemberName(e.target.value)}
                                className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-[#caf0f8] text-[#03045e] focus:border-[#0077b6] outline-none transition-colors"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">
                                Designation / Role *
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Senior Specialist"
                                value={newMemberRole}
                                onChange={(e) => setNewMemberRole(e.target.value)}
                                className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-[#caf0f8] text-[#03045e] focus:border-[#0077b6] outline-none transition-colors"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">
                                Email Address *
                              </label>
                              <input
                                type="email"
                                placeholder="e.g. rajesh@school.edu"
                                value={newMemberEmail}
                                onChange={(e) => setNewMemberEmail(e.target.value)}
                                className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-[#caf0f8] text-[#03045e] focus:border-[#0077b6] outline-none transition-colors"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">
                                Phone Number
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. +91 98765 XXXXX"
                                value={newMemberPhone}
                                onChange={(e) => setNewMemberPhone(e.target.value)}
                                className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-[#caf0f8] text-[#03045e] focus:border-[#0077b6] outline-none transition-colors"
                              />
                            </div>
                          </div>
                          
                          <button
                            type="submit"
                            className="mt-2 w-full py-2.5 bg-[#0077b6] hover:bg-[#03045e] text-white rounded-lg text-xs font-black transition-colors"
                          >
                            Add to Department
                          </button>
                        </form>
                      </MainCard>
                    </div>

                    {/* Members Directory Column */}
                    <div className="lg:col-span-7 flex flex-col h-full">
                      <MainCard className="p-0 border border-[#caf0f8]/60 flex flex-col h-full">
                        <div className="p-4 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                          <div>
                            <h3 className="text-xs font-black text-[#03045e] uppercase tracking-wider">
                              Members Directory ({activeDeptDetails.memberList?.length || 0})
                            </h3>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              List of personnel assigned to this department
                            </p>
                          </div>
                          <div className="relative w-full sm:w-48">
                            <Search
                              size={14}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                              type="text"
                              placeholder="Search members..."
                              value={memberSearchTerm}
                              onChange={(e) => setMemberSearchTerm(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-100 text-xs font-bold text-[#03045e] focus:border-[#00b4d8] focus:bg-[#caf0f8]/10 outline-none transition-colors"
                            />
                          </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 min-h-[350px]">
                          {filteredMemberList.length > 0 ? (
                            <div className="space-y-2">
                              {filteredMemberList.map((member) => (
                                <div
                                  key={member.id}
                                  className="group flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-[#caf0f8] hover:bg-[#caf0f8]/20 transition-all cursor-pointer"
                                >
                                  <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-10 h-10 rounded-full bg-[#03045e] text-white flex items-center justify-center text-sm font-black flex-shrink-0">
                                      {member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 pr-4">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-sm font-black text-[#03045e] truncate">
                                          {member.name}
                                        </p>
                                        <span className="px-2 py-0.5 rounded-full bg-[#e0fbfc] text-[#0077b6] text-[8px] font-black uppercase tracking-wider whitespace-nowrap">
                                          {member.role}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                                        <div className="flex items-center gap-1 text-gray-400">
                                          <Mail size={10} />
                                          <span className="text-[10px] font-medium">{member.email}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-400">
                                          <Phone size={10} />
                                          <span className="text-[10px] font-medium">{member.phone}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveMember(member.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
                                    title="Remove Member"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3 min-h-[200px]">
                              <Users size={32} className="opacity-20" />
                              <p className="text-xs font-bold">
                                {memberSearchTerm
                                  ? "No members match your search."
                                  : "No members added to this department yet."}
                              </p>
                            </div>
                          )}
                        </div>
                      </MainCard>
                    </div>

                  </div>

                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Create Department Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              backgroundColor: "rgba(3,4,94,0.35)",
              backdropFilter: "blur(4px)",
            }}
            onClick={(e) =>
              e.target === e.currentTarget && setShowCreateModal(false)
            }
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            >
              <form onSubmit={handleCreateDepartment}>
                <div className="bg-[#03045e] px-6 py-5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-[#caf0f8]/70 uppercase tracking-widest">
                      New Department
                    </p>
                    <h3 className="text-base font-black text-white mt-1">
                      Create Department
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-160px)]">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                        Department Name *
                      </label>
                      <input
                        type="text"
                        name="deptName"
                        required
                        placeholder="e.g. Academic Affairs"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                        Department Code *
                      </label>
                      <input
                        type="text"
                        name="deptCode"
                        required
                        placeholder="e.g. ACAD"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] bg-white transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                      Category *
                    </label>
                    <select name="deptCategory" required className="w-full px-4 py-2.5 rounded-xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] bg-white transition-colors">
                      <option value="">Select Category</option>
                      {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                      Description
                    </label>
                    <textarea
                      name="deptDescription"
                      rows="3"
                      placeholder="Department description and responsibilities..."
                      className="w-full px-4 py-2.5 rounded-xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] bg-white transition-colors resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                        Department Head
                      </label>
                      <input
                        type="text"
                        name="headName"
                        placeholder="e.g. Dr. Rajesh Sharma"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                        Designation
                      </label>
                      <input
                        type="text"
                        name="headDesignation"
                        placeholder="e.g. Dean Academics"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] bg-white transition-colors"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                        Phone
                      </label>
                      <input
                        type="text"
                        name="phone"
                        placeholder="+91-XXXXXXXXXX"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder="dept@school.edu"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] bg-white transition-colors"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        placeholder="e.g. Block A, Room 101"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                        Established Date
                      </label>
                      <input
                        type="date"
                        name="estDate"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] bg-white transition-colors"
                      />
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-6 flex items-center gap-2">
                  <button type="submit" className="flex-1 py-2.5 rounded-xl text-xs font-black bg-[#03045e] text-white hover:bg-[#0077b6] transition-colors">
                    CREATE DEPARTMENT
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-black border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ManageDepartmentsPage;
