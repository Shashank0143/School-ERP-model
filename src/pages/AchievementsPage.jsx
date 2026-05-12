import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Trophy, Star, Medal, Plus, X, ChevronDown, ChevronUp,
  Award, Sparkles, Calendar, Building2, FileCheck, Filter,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import HelperButton from "../components/HelperButton";
import HelperPopup from "../components/HelperPopup";
import MainCard from "../components/MainCard";
import { MOCK_ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES } from "../data/achievementsData";

// ── Animation variants ────────────────────────────────────────────────────────
const pageVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.3, ease: "easeOut" },
  }),
};

// ── Rank badge config ─────────────────────────────────────────────────────────
const RANK_CONFIG = {
  gold:          { icon: Trophy,  bg: "#fef3c7", border: "#fde68a", text: "#b45309", labelEn: "Gold", labelHi: "स्वर्ण" },
  silver:        { icon: Medal,   bg: "#f1f5f9", border: "#cbd5e1", text: "#475569", labelEn: "Silver", labelHi: "रजत" },
  bronze:        { icon: Medal,   bg: "#fef0e7", border: "#fed7aa", text: "#c2410c", labelEn: "Bronze", labelHi: "कांस्य" },
  participation: { icon: Award,   bg: "#ede9fe", border: "#ddd6fe", text: "#6d28d9", labelEn: "Participant", labelHi: "प्रतिभागी" },
  certificate:   { icon: FileCheck, bg: "#d1fae5", border: "#a7f3d0", text: "#065f46", labelEn: "Certified", labelHi: "प्रमाणित" },
};

// ── Helper content ────────────────────────────────────────────────────────────
const HELPER_EN = "This section showcases all your academic, sports, cultural, technical, and competition achievements. Each card represents a verified accomplishment. You can filter by category and add new achievements as you earn them.";
const HELPER_HI = "यह अनुभाग आपकी सभी शैक्षणिक, खेल, सांस्कृतिक, तकनीकी और प्रतियोगिता उपलब्धियों को दर्शाता है। प्रत्येक कार्ड एक सत्यापित उपलब्धि को दर्शाता है।";

// ── Add Achievement Modal (CSS-visibility, stable) ────────────────────────────
const BLANK_FORM = { title: "", category: "academic", date: "", organization: "", description: "" };

function AddAchievementModal({ isOpen, onClose, onAdd, lang }) {
  const [form, setForm] = useState(BLANK_FORM);
  const [errors, setErrors] = useState({});

  const overlayStyle = {
    position: "fixed", inset: 0, zIndex: 60,
    display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
    opacity: isOpen ? 1 : 0,
    pointerEvents: isOpen ? "auto" : "none",
    transition: "opacity 0.18s ease",
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = true;
    if (!form.date.trim()) e.date = true;
    if (!form.organization.trim()) e.organization = true;
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onAdd({ ...form, id: `ach-new-${Date.now()}`, rank: "certificate", hasCertificate: false, iconEmoji: "🏅", color: "#0077b6", colorBg: "#dbeafe" });
    setForm(BLANK_FORM);
    setErrors({});
    onClose();
  };

  const field = (key, labelEn, labelHi, type = "text") => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold uppercase tracking-wide" style={{ color: "#0077b6" }}>
        {lang === "hi" ? labelHi : labelEn}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => { setForm((f) => ({ ...f, [key]: e.target.value })); setErrors((er) => ({ ...er, [key]: false })); }}
        className="w-full px-3 py-2.5 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#00b4d8]"
        style={{ backgroundColor: "#f8fafc", border: `1px solid ${errors[key] ? "#dc2626" : "#e2e8f0"}`, color: "#03045e" }}
      />
      {errors[key] && <span className="text-[10px] text-red-500 font-semibold">{lang === "hi" ? "यह फ़ील्ड आवश्यक है" : "This field is required"}</span>}
    </div>
  );

  return (
    <div style={overlayStyle} role={isOpen ? "dialog" : undefined} aria-modal={isOpen ? "true" : undefined} aria-hidden={!isOpen}>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={onClose} aria-hidden="true" />
      <motion.div
        className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
        style={{ zIndex: 10 }}
        initial={false}
        animate={isOpen ? { y: 0, opacity: 1 } : { y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
      >
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg,#03045e,#0077b6,#00b4d8)" }} aria-hidden="true" />
        <div className="p-6 max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-extrabold" style={{ color: "#03045e" }}>
              <Plus size={18} className="inline mr-2" />
              {lang === "hi" ? "उपलब्धि जोड़ें" : "Add Achievement"}
            </h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "#caf0f8", color: "#03045e" }} aria-label="Close">
              <X size={15} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {field("title", "Achievement Title", "उपलब्धि शीर्षक")}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wide" style={{ color: "#0077b6" }}>{lang === "hi" ? "श्रेणी" : "Category"}</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#00b4d8]"
                style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", color: "#03045e" }}
              >
                {ACHIEVEMENT_CATEGORIES.filter(c => c.id !== "all").map(c => (
                  <option key={c.id} value={c.id}>{lang === "hi" ? c.labelHi : c.labelEn}</option>
                ))}
              </select>
            </div>
            {field("date", "Date Achieved", "उपलब्धि की तारीख", "date")}
            {field("organization", "Issuing Organization", "जारी करने वाली संस्था")}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wide" style={{ color: "#0077b6" }}>{lang === "hi" ? "विवरण" : "Description"}</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#00b4d8] resize-none"
                style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", color: "#03045e" }}
              />
            </div>
            <div className="flex flex-col gap-2 p-3 rounded-xl border border-dashed" style={{ borderColor: "#00b4d8", backgroundColor: "#f0f9ff" }}>
              <p className="text-xs font-bold" style={{ color: "#0077b6" }}>{lang === "hi" ? "प्रमाणपत्र अपलोड (जल्द)" : "Certificate Upload (Coming Soon)"}</p>
              <p className="text-[10px] text-gray-400 font-medium">{lang === "hi" ? "बैकएंड तैयार होने पर सक्रिय होगा।" : "Will be active once backend is connected."}</p>
            </div>
            <button type="submit" className="w-full py-3 rounded-2xl text-sm font-extrabold text-white transition-colors" style={{ backgroundColor: "#03045e" }}>
              {lang === "hi" ? "उपलब्धि सहेजें" : "Save Achievement"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// ── Single Achievement Card ───────────────────────────────────────────────────
function AchievementCard({ ach, index, lang }) {
  const [expanded, setExpanded] = useState(false);
  const rank = RANK_CONFIG[ach.rank] || RANK_CONFIG.certificate;
  const RankIcon = rank.icon;
  const cat = ACHIEVEMENT_CATEGORIES.find(c => c.id === ach.category);
  const title = lang === "hi" ? ach.titleHi : ach.titleEn;
  const description = lang === "hi" ? ach.descriptionHi : ach.descriptionEn;
  const org = lang === "hi" ? ach.organizationHi : ach.organizationEn;

  return (
    <MainCard
      custom={index}
      variants={cardVariants}
      className="h-full flex flex-col transition-shadow duration-200 hover:shadow-lg"
      aria-label={title}
    >

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Icon + Title row */}
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
            style={{ backgroundColor: ach.colorBg }}
            aria-hidden="true"
          >
            <RankIcon size={24} style={{ color: ach.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-extrabold leading-tight line-clamp-1" style={{ color: "#03045e" }}>{title}</h3>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {/* Category badge */}
              {cat && (
                <span
                  className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wide"
                  style={{ backgroundColor: cat.color + "18", color: cat.color }}
                >
                  {lang === "hi" ? cat.labelHi : cat.labelEn}
                </span>
              )}
              {/* Rank badge */}
              <div
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full border"
                style={{ backgroundColor: rank.bg, color: rank.text, borderColor: rank.border }}
              >
                <RankIcon size={10} />
                <span className="text-[10px] font-extrabold uppercase tracking-wide">
                  {lang === "hi" ? rank.labelHi : rank.labelEn}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Meta info */}
        <div className="flex flex-col gap-2 mt-1">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg" style={{ backgroundColor: "#caf0f8" }}>
              <Calendar size={13} style={{ color: "#0077b6" }} />
            </div>
            <span className="text-xs font-semibold text-gray-600">{ach.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg" style={{ backgroundColor: "#caf0f8" }}>
              <Building2 size={13} style={{ color: "#00b4d8" }} />
            </div>
            <span className="text-xs font-semibold text-gray-600 truncate">{org}</span>
          </div>
        </div>

        {/* Expandable description */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1 text-[11px] font-bold transition-colors"
          style={{ color: "#0077b6" }}
          aria-expanded={expanded}
          aria-label={expanded ? "Show less" : "Show more"}
        >
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {expanded
            ? (lang === "hi" ? "कम दिखाएं" : "Show less")
            : (lang === "hi" ? "अधिक देखें" : "Read more")}
        </button>

        {expanded && (
          <p className="text-xs leading-relaxed font-medium text-gray-600">
            {description}
          </p>
        )}

        {/* Certificate badge */}
        {ach.hasCertificate && (
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl mt-auto" style={{ backgroundColor: "#d1fae5" }}>
            <FileCheck size={13} className="text-[#059669]" aria-hidden="true" />
            <span className="text-[10px] font-extrabold text-[#059669]">
              {lang === "hi" ? "प्रमाणपत्र उपलब्ध है" : "Certificate available"}
            </span>
          </div>
        )}
      </div>
    </MainCard>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AchievementsPage() {
  const { lang, t } = useLanguage();
  const { isParent: isParentMode } = useAuth();

  const [activeCategory, setActiveCategory] = useState("all");
  const [showHelper, setShowHelper] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [extraAchievements, setExtraAchievements] = useState([]);

  const handleAdd = useCallback((newAch) => {
    setExtraAchievements(prev => [
      { ...newAch, titleEn: newAch.title, titleHi: newAch.title, descriptionEn: newAch.description, descriptionHi: newAch.description, organizationEn: newAch.organization, organizationHi: newAch.organization },
      ...prev,
    ]);
  }, []);

  const allAchievements = useMemo(() => [...extraAchievements, ...MOCK_ACHIEVEMENTS], [extraAchievements]);

  const filtered = useMemo(() => {
    if (activeCategory === "all") return allAchievements;
    return allAchievements.filter(a => a.category === activeCategory);
  }, [activeCategory, allAchievements]);

  return (
    <>
      <motion.div variants={pageVariants} initial="hidden" animate="visible" className="space-y-6">
        {/* ── Page Header ── */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl shadow-sm flex-shrink-0" style={{ backgroundColor: "#03045e" }}>
            <Trophy size={31} className="text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-black" style={{ color: "#03045e" }}>
              {lang === "hi" ? t("achievements.title") : "Achievements"}
            </h1>
            <p className="text-sm text-gray-500">
              {isParentMode
                ? (lang === "hi" ? "आपके बच्चे की शैक्षणिक और पाठ्येतर उपलब्धियां।" : "Academic and extracurricular achievements of your child.")
                : (lang === "hi" ? "आपकी सभी उपलब्धियां और पुरस्कार यहां हैं।" : "Your awards, medals & milestones — all in one place.")}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <HelperButton onClick={() => setShowHelper(true)} />
            {!isParentMode && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#03045e" }}
                aria-label={lang === "hi" ? "उपलब्धि जोड़ें" : "Add Achievement"}
              >
                <Plus size={16} />
                {lang === "hi" ? "जोड़ें" : "Add"}
              </button>
            )}
          </div>
        </div>

        {/* ── Summary counts ── */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          {[
            { id: "gold", count: allAchievements.filter(a => a.rank === "gold").length, labelEn: "Gold", labelHi: "स्वर्ण", color: "#b45309", bg: "#fef3c7", icon: Trophy },
            { id: "silver", count: allAchievements.filter(a => a.rank === "silver").length, labelEn: "Silver", labelHi: "रजत", color: "#475569", bg: "#f1f5f9", icon: Medal },
            { id: "others", count: allAchievements.filter(a => ["bronze","participation"].includes(a.rank)).length, labelEn: "Medals", labelHi: "पदक", color: "#6d28d9", bg: "#ede9fe", icon: Award },
            { id: "certs", count: allAchievements.filter(a => a.hasCertificate).length, labelEn: "Certs", labelHi: "प्रमाण", color: "#059669", bg: "#d1fae5", icon: FileCheck },
          ].map(({ id, count, labelEn, labelHi, color, bg, icon: Icon }) => (
            <div
              key={id}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white shadow-sm border border-[#caf0f8]"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
                <Icon size={24} style={{ color }} />
              </div>
              <div>
                <span className="text-xl font-black block leading-none" style={{ color }}>{count}</span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1 block">
                  {lang === "hi" ? labelHi : labelEn}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Category Filter Chips ── */}
        <div className="flex gap-2 flex-wrap" role="group" aria-label="Filter by category">
          {ACHIEVEMENT_CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="px-3.5 py-2 rounded-full text-xs font-bold transition-colors whitespace-nowrap"
                style={isActive
                  ? { backgroundColor: cat.color, color: "white" }
                  : { backgroundColor: "white", color: "#6b7280", border: "1px solid #e5e7eb" }}
                aria-pressed={isActive}
              >
                {lang === "hi" ? cat.labelHi : cat.labelEn}
              </button>
            );
          })}
        </div>

        {/* ── Achievement Grid ── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 bg-white rounded-2xl" style={{ border: "1px solid #caf0f8" }}>
            <Star size={48} className="text-gray-300" aria-hidden="true" />
            <p className="text-sm font-bold text-gray-400">
              {lang === "hi" ? "इस श्रेणी में कोई उपलब्धि नहीं।" : "No achievements in this category yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((ach, i) => (
              <AchievementCard key={ach.id} ach={ach} index={i} lang={lang} />
            ))}
          </div>
        )}

        {/* ── Motivational footer ── */}
        <div
          className="flex items-center gap-4 p-5 rounded-2xl"
          style={{ background: "linear-gradient(135deg, #03045e, #0077b6)" }}
        >
          <Sparkles size={32} className="text-[#caf0f8] flex-shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-extrabold text-white">
              {lang === "hi" ? "हर उपलब्धि मायने रखती है!" : "Every achievement matters!"}
            </p>
            <p className="text-xs text-white/70 font-medium mt-0.5">
              {lang === "hi"
                ? "अपनी उपलब्धियां यहां जोड़ें और अपनी यात्रा दर्ज करें।"
                : "Keep adding your milestones here and track your incredible journey."}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Popups — always mounted (stable CSS-visibility) ── */}
      <HelperPopup
        isOpen={showHelper}
        onClose={() => setShowHelper(false)}
        titleKey="achievements.title"
        contentEn={HELPER_EN}
        contentHi={HELPER_HI}
      />
      <AddAchievementModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAdd}
        lang={lang}
      />
    </>
  );
}
