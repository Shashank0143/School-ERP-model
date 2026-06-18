import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Award, Plus, Star } from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import OperationsStatCard from "../../components/admin/operations/OperationsStatCard";
import AchievementCard from "../../components/admin/institutional/AchievementCard";
import InstitutionalFilterBar from "../../components/admin/institutional/InstitutionalFilterBar";
import AdminEditForm from "../../components/admin/AdminEditForm";
import { getDataProvider } from "../../data";

const AchievementsPage = () => {
  const [achievements, setAchievements] = useState([]);
  const [students, setStudents] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedRank, setSelectedRank] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [successBanner, setSuccessBanner] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const provider = getDataProvider();
      const [allAchievements, allStudents] = await Promise.all([
        provider.getAchievements(),
        provider.getStudents(),
      ]);

      setAchievements(allAchievements || []);
      setStudents(allStudents || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordAchievement = async (formData) => {
    try {
      const newAch = {
        studentId: formData.studentId,
        titleEn: formData.title,
        category: formData.category,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        rank: formData.rank || "gold",
      };

      const provider = getDataProvider();
      await provider.createAchievement(newAch);
      const allAchievements = await provider.getAchievements();
      setAchievements(allAchievements || []);

      const stu = students.find((s) => s.id === formData.studentId);
      setSuccessBanner(
        `Successfully recorded achievement honor for ${stu ? stu.name : "Student"}!`,
      );
      setTimeout(() => setSuccessBanner(""), 4000);
      setCreateOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  // Helper resolver to format achievements display
  const resolvedAchievements = achievements.map((ach) => {
    const stu = students.find((s) => s.id === ach.studentId);

    // Format category
    let catStr = "Co-Curricular";
    if (ach.category === "academic") catStr = "Academic";
    else if (ach.category === "technical") catStr = "Technical";
    else if (ach.category === "sports") catStr = "Sports";
    else if (ach.category === "cultural") catStr = "Cultural & MUN";

    // Format rank
    let rankStr = "Gold Medal";
    if (ach.rank === "silver") rankStr = "Silver Medal";
    else if (ach.rank === "bronze") rankStr = "Bronze Medal";

    return {
      ...ach,
      studentName: stu ? stu.name : "Student Name",
      categoryStr: catStr,
      rankStr: rankStr,
      description: `Secured the highest honors during the state level ${ach.category} competitions representing the school.`,
    };
  });

  const filteredAchievements = resolvedAchievements.filter((ach) => {
    const matchesSearch =
      ach.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ach.studentName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat =
      selectedCategory === "" || ach.category === selectedCategory;
    const matchesRank = selectedRank === "" || ach.rank === selectedRank;

    return matchesSearch && matchesCat && matchesRank;
  });

  const achievementFields = [
    {
      name: "studentId",
      label: "Select Mapped Student",
      type: "select",
      options: students.map((s) => s.id),
    },
    {
      name: "title",
      label: "Competition / Event Title",
      type: "text",
      required: true,
    },
    {
      name: "category",
      label: "Achievement Category",
      type: "select",
      options: ["academic", "technical", "sports", "cultural"],
    },
    {
      name: "rank",
      label: "Award Rank Medal",
      type: "select",
      options: ["gold", "silver", "bronze"],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      <AdminPageHeader
        title="Student Achievements Board"
        description="Celebrate and record student laurels, olympiad medals, and athletic competition rankings."
        breadcrumbs={["Admin Portal", "Institutional", "Achievements"]}
        actionButton={
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 bg-[#0077b6] hover:bg-[#0096c7] text-white px-5 py-2.5 rounded-2xl shadow-sm text-xs font-black transition-colors"
          >
            <Plus size={16} />
            <span>RECORD NEW HONOR</span>
          </button>
        }
      />

      {/* Success Notification Alert */}
      {successBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-3xl text-emerald-700 text-xs font-black shadow-sm transition-all animate-bounce">
          {successBanner}
        </div>
      )}

      {/* Roster Strengths stats */}
      <div className="grid grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <OperationsStatCard
          title="Total Medals Awarded"
          value={achievements.length.toString()}
          description="Verified institutional laurels"
          icon={Award}
        />
        <OperationsStatCard
          title="Gold Medal Honors"
          value={achievements
            .filter((a) => a.rank === "gold")
            .length.toString()}
          description="First-place competition wins"
          icon={Award}
          color="#0096c7"
          bg="#ade8f4"
        />
        <OperationsStatCard
          title="Spotlight Nominees"
          value="4 Students"
          description="Schedules compiled"
          icon={Award}
          color="#03045e"
          bg="#e0f2fe"
        />
      </div>

      {/* Roster Filter tools */}
      <InstitutionalFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search achievements by student name or competition..."
        filterSlots={
          <>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex items-center gap-2 border border-[#caf0f8] hover:border-[#00b4d8] px-4 py-2.5 rounded-2xl text-xs font-bold text-[#03045e] transition-colors bg-white outline-none"
            >
              <option value="">Filter Categories...</option>
              <option value="academic">Academic Honors</option>
              <option value="technical">Technical Coding</option>
              <option value="sports">Athletic Sports</option>
              <option value="cultural">Cultural Debate/Arts</option>
            </select>
            <select
              value={selectedRank}
              onChange={(e) => setSelectedRank(e.target.value)}
              className="flex items-center gap-2 border border-[#caf0f8] hover:border-[#00b4d8] px-4 py-2.5 rounded-2xl text-xs font-bold text-[#03045e] transition-colors bg-white outline-none"
            >
              <option value="">Filter Medals...</option>
              <option value="gold">Gold Medal</option>
              <option value="silver">Silver Medal</option>
              <option value="bronze">Bronze Medal</option>
            </select>
          </>
        }
      />

      {/* Achievements Cards Grid */}
      {filteredAchievements.length === 0 ? (
        <div className="p-8 text-center text-gray-400 font-bold uppercase tracking-wider">
          No honors posted matching active filter criteria
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((ach) => (
            <AchievementCard
              key={ach.id}
              title={ach.titleEn}
              studentName={ach.studentName}
              category={ach.categoryStr}
              rank={ach.rankStr}
              description={ach.description}
              date={ach.date}
            />
          ))}
        </div>
      )}

      {/* Record Achievement Modal */}
      <AdminEditForm
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Record Student Honor Medal"
        data={{ studentId: "", title: "", category: "academic", rank: "gold" }}
        fields={achievementFields}
        onSubmit={handleRecordAchievement}
      />
    </motion.div>
  );
};

export default AchievementsPage;
