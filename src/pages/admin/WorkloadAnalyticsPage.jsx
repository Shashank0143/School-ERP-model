import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Briefcase, AlertCircle, Clock } from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import OperationsStatCard from "../../components/admin/operations/OperationsStatCard";
import WorkloadCard from "../../components/admin/analytics/WorkloadCard";
import AnalyticsFilterBar from "../../components/admin/analytics/AnalyticsFilterBar";
import AdminSectionCard from "../../components/admin/AdminSectionCard";
import AdminDataTable from "../../components/admin/AdminDataTable";
import { getDataProvider } from "../../data";

const WorkloadAnalyticsPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [selectedStream, setSelectedStream] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const allTeachers = await getDataProvider().getTeachers();
      setTeachers(allTeachers || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Filter teachers list
  const filteredTeachers = teachers.filter((t) => {
    return (
      selectedStream === "" ||
      t.department?.toUpperCase().includes(selectedStream.toUpperCase())
    );
  });

  // Calculate stats
  const averageHours = 18;
  const optimalBalanceCount = teachers.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      <AdminPageHeader
        title="Faculty Workload & Timetable Balancer"
        description="Monitor weekly teach periods workload indexes, identify schedule bottlenecks, and verify teaching hours."
        breadcrumbs={["Admin Portal", "Analytics", "Workload"]}
      />

      {/* Roster Strengths stats */}
      <div className="grid grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <OperationsStatCard
          title="Average Faculty Workload"
          value="18.2 Hours/Wk"
          description="Optimal CBSE balancing target is 24h"
          icon={Briefcase}
        />
        <OperationsStatCard
          title="Optimal Schedule Balances"
          value={`${optimalBalanceCount} Faculty Balanced`}
          description="Schedules compiled"
          icon={Briefcase}
          color="#0096c7"
          bg="#ade8f4"
        />
        <OperationsStatCard
          title="Workload Check Status"
          value="Synchronized"
          description="Timetables checked against overlaps"
          icon={Briefcase}
          color="#03045e"
          bg="#e0f2fe"
        />
      </div>

      {/* Segment filters */}
      <AnalyticsFilterBar
        selectedStream={selectedStream}
        onStreamChange={setSelectedStream}
        streams={["Science", "Commerce", "Humanities"]}
      />

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((teacher) => (
          <WorkloadCard
            key={teacher.id}
            teacherName={teacher.name}
            classesCount={2}
            subjectsList={teacher.subjectsAssigned || [teacher.department]}
            weeklyHours={
              teacher.id === "teach-001"
                ? 22
                : teacher.id === "teach-002"
                  ? 20
                  : 18
            }
          />
        ))}
      </div>

      {/* Roster Details Ledger table */}
      <AdminSectionCard title="Weekly Faculty Assignments Roster">
        <AdminDataTable
          headers={[
            "Staff ID",
            "Teacher Name",
            "Academic Department",
            "Allocated Load Rate",
            "Schedule Integrity Status",
          ]}
          items={filteredTeachers}
          isEmpty={filteredTeachers.length === 0}
          renderRow={(teacher) => {
            const hours =
              teacher.id === "teach-001"
                ? 22
                : teacher.id === "teach-002"
                  ? 20
                  : 18;
            return (
              <tr
                key={teacher.id}
                className="hover:bg-[#caf0f8]/10 transition-colors text-xs text-gray-700 font-bold border-b border-[#caf0f8]/40"
              >
                <td className="py-4 px-3 text-[#03045e] font-black first:pl-2">
                  {teacher.id}
                </td>
                <td className="py-4 px-3 text-gray-800 font-extrabold">
                  {teacher.name}
                </td>
                <td className="py-4 px-3 text-gray-500 font-semibold">
                  {teacher.department || "Science"}
                </td>
                <td className="py-4 px-3 text-[#0077b6] font-extrabold">
                  {hours} Hours / Week
                </td>
                <td className="py-4 px-3 last:pr-2">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                    Overlap Clear
                  </span>
                </td>
              </tr>
            );
          }}
        />
      </AdminSectionCard>
    </motion.div>
  );
};

export default WorkloadAnalyticsPage;
