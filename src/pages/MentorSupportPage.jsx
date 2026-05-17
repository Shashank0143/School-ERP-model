import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle, Shield, CheckCircle, Clock, Calendar,
  ChevronDown, ChevronUp, Send, Eye, EyeOff, BookOpen, Users,
  Brain, Target, Smile, ScrollText, Handshake,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import HelperButton from "../components/HelperButton";
import HelperPopup from "../components/HelperPopup";
import MainCard from "../components/MainCard";
import { getMentors, getMentorResources, getMentorSessions } from "../services/teacherService";
import { useService } from "../hooks/useService";

const ICON_MAP = {
  BookOpen, Brain, Calendar, ScrollText, MessageSquare: MessageCircle, Target, Smile, Shield, Users, Send
};

const fade = { hidden: { opacity: 0, y: 14 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.3, ease: "easeOut" } }) };

const HELPER_EN = "Mentor Support is a safe, confidential space where students can seek academic guidance, discuss personal concerns, and connect with their assigned school mentor.";
const HELPER_HI = "मेंटर सपोर्ट एक सुरक्षित, गोपनीय स्थान है जहाँ छात्र शैक्षणिक मार्गदर्शन ले सकते हैं, व्यक्तिगत चिंताओं पर चर्चा कर सकते हैं और अपने नियुक्त स्कूल मेंटर से जुड़ सकते हैं।";

const BLANK = { category: "Academic Guidance", title: "", message: "", contact: "email", urgency: "normal", anonymous: false };

const SUPPORT_CATEGORIES = [
  { id: "academic", titleEn: "Academic Guidance", titleHi: "शैक्षणिक मार्गदर्शन", icon: "BookOpen", color: "#0077b6", colorBg: "#caf0f8", descEn: "Subjects, study plans, or goals.", descHi: "विषय, अध्ययन योजना, या लक्ष्य।" },
  { id: "personal", titleEn: "Personal Support", titleHi: "व्यक्तिगत सहायता", icon: "Smile", color: "#6d28d9", colorBg: "#f5f3ff", descEn: "Stress, balance, or mental health.", descHi: "तनाव, संतुलन, या मानसिक स्वास्थ्य।" },
  { id: "career", titleEn: "Career Advice", titleHi: "करियर सलाह", icon: "Target", color: "#059669", colorBg: "#ecfdf5", descEn: "Future path and entrance exams.", descHi: "भविष्य का रास्ता और प्रवेश परीक्षाएं।" },
  { id: "social", titleEn: "Peer Interaction", titleHi: "सहकर्मी संवाद", icon: "Users", color: "#dc2626", colorBg: "#fef2f2", descEn: "School life and social challenges.", descHi: "स्कूल जीवन और सामाजिक चुनौतियां।" },
  { id: "other", titleEn: "Other Concerns", titleHi: "अन्य चिंताएं", icon: "MessageSquare", color: "#d97706", colorBg: "#fffbeb", descEn: "Anything else you need help with.", descHi: "कुछ भी जिसमें आपको सहायता चाहिए।" },
];

function MentorCard({ mentor }) {
  const { t, lang } = useLanguage();
  if (!mentor) return null;
  const statusKey = `status.${mentor.status}`;
  
  return (
    <MainCard variants={fade} className="overflow-hidden flex flex-col transition-shadow duration-200 hover:shadow-lg">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="flex-shrink-0 flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-md"
              style={{ backgroundColor: mentor.avatarColor }}>
              {mentor.avatarInitials}
            </div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-700" 
              style={mentor.status === 'available' ? {backgroundColor: '#d1fae5', color: '#059669'} : mentor.status === 'busy' ? {backgroundColor: '#fef3c7', color: '#d97706'} : {}}>
              {t(statusKey) || mentor.status}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-extrabold" style={{ color: "#03045e" }}>{mentor.name}</h2>
            <p className="text-sm font-semibold" style={{ color: "#0077b6" }}>{mentor.designation}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{mentor.department}</p>
            <p className="text-sm text-gray-600 font-medium mt-3 leading-relaxed">
              {lang === "hi" ? mentor.bioHi : mentor.bio}
            </p>
            <div className="flex flex-col gap-1.5 mt-4">
              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                <Clock size={13} style={{ color: "#0077b6" }} />
                {lang === "hi" ? mentor.officeHoursHi : mentor.officeHours}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                <BookOpen size={13} style={{ color: "#0077b6" }} />
                {lang === "hi" ? mentor.roomHi : mentor.room}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-gray-100">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-80 bg-[#03045e] text-white">
            <Calendar size={15} />
            {t("mentor.requestMeeting") || "Request Meeting"}
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-80 bg-[#caf0f8] text-[#03045e]">
            <MessageCircle size={15} />
            {t("mentor.sendMessage") || "Send Message"}
          </button>
          <p className="w-full text-[10px] text-gray-400 font-medium mt-1">
            {t("mentor.backendNote") || "Note: This is a prototype interface."}
          </p>
        </div>
      </div>
    </MainCard>
  );
}

function CategoryGrid({ onSelect }) {
  const { lang } = useLanguage();
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {SUPPORT_CATEGORIES.map((cat, i) => {
        const Icon = ICON_MAP[cat.icon] || MessageCircle;
        const title = lang === "hi" ? cat.titleHi : cat.titleEn;
        return (
          <motion.button key={cat.id} custom={i} variants={fade} initial="hidden" animate="visible"
            onClick={() => onSelect(title)}
            className="flex flex-col gap-3 p-5 rounded-2xl text-left transition-all hover:shadow-md bg-white"
            style={{ outline: `1px solid ${cat.color}20` }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: cat.colorBg }}>
              <Icon size={24} style={{ color: cat.color }} />
            </div>
            <div>
              <p className="text-base font-extrabold leading-tight" style={{ color: cat.color }}>
                {title}
              </p>
              <p className="text-[11px] font-semibold text-gray-400 mt-1 leading-snug">
                {lang === "hi" ? cat.descHi : cat.descEn}
              </p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

function RequestForm({ prefillCategory }) {
  const { t, lang } = useLanguage();
  const [form, setForm] = useState({ ...BLANK, category: prefillCategory || "Academic Guidance" });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: false })); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.title.trim()) errs.title = true;
    if (!form.message.trim()) errs.message = true;
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div variants={fade} initial="hidden" animate="visible"
        className="flex flex-col items-center gap-4 py-12 px-6 bg-white rounded-2xl text-center"
        style={{ border: "1px solid #d1fae5" }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "#d1fae5" }}>
          <CheckCircle size={32} style={{ color: "#059669" }} />
        </div>
        <div>
          <p className="text-lg font-extrabold" style={{ color: "#03045e" }}>
            {t("mentor.form.success") || "Request Submitted"}
          </p>
          <p className="text-sm text-gray-500 font-medium mt-1">
            {t("mentor.form.successDetail") || "Your mentor will be notified."}
          </p>
        </div>
        <button onClick={() => { setSubmitted(false); setForm(BLANK); }}
          className="px-6 py-2.5 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: "#0077b6" }}>
          {t("mentor.form.submitAnother") || "Submit Another"}
        </button>
      </motion.div>
    );
  }

  const inputStyle = (err) => ({
    backgroundColor: "#f8fafc",
    border: `1px solid ${err ? "#dc2626" : "#e2e8f0"}`,
    color: "#03045e",
    borderRadius: "12px",
    padding: "10px 14px",
    width: "100%",
    fontSize: "14px",
    fontWeight: 500,
    outline: "none",
  });
  
  const label = (key) => (
    <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#0077b6" }}>
      {t(key) || key}
    </span>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm space-y-4"
      style={{ border: "1px solid #caf0f8" }} noValidate>

      <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: "#f0f9ff" }}>
        <div className="flex items-center gap-2">
          {form.anonymous ? <EyeOff size={16} style={{ color: "#0077b6" }} /> : <Eye size={16} style={{ color: "#0077b6" }} />}
          <span className="text-sm font-bold" style={{ color: "#03045e" }}>
            {t("mentor.form.anonymous") || "Anonymous Mode"}
          </span>
        </div>
        <button type="button" role="switch" aria-checked={form.anonymous}
          onClick={() => set("anonymous", !form.anonymous)}
          className="relative w-11 h-6 rounded-full transition-colors"
          style={{ backgroundColor: form.anonymous ? "#0077b6" : "#d1d5db" }}>
          <span className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all"
            style={{ left: form.anonymous ? "calc(100% - 20px)" : "4px" }} />
        </button>
      </div>
      {form.anonymous && (
        <p className="text-xs font-medium text-gray-500 -mt-2 px-1">
          🔒 {t("mentor.form.anonymousHint") || "Identity hidden from mentor."}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        {label("mentor.form.category")}
        <select value={form.category} onChange={e => set("category", e.target.value)} style={inputStyle(false)}>
          {SUPPORT_CATEGORIES.map((c, i) => (
            <option key={i} value={lang === 'hi' ? c.titleHi : c.titleEn}>
              {lang === 'hi' ? c.titleHi : c.titleEn}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        {label("mentor.form.title")}
        <input type="text" value={form.title}
          onChange={e => set("title", e.target.value)}
          placeholder={t("mentor.form.titlePlaceholder")}
          style={inputStyle(errors.title)} />
        {errors.title && <span className="text-[10px] text-red-500 font-semibold">{t("mentor.form.required")}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        {label("mentor.form.message")}
        <textarea rows={4} value={form.message}
          onChange={e => set("message", e.target.value)}
          placeholder={t("mentor.form.messagePlaceholder")}
          style={{ ...inputStyle(errors.message), resize: "none" }} />
        {errors.message && <span className="text-[10px] text-red-500 font-semibold">{t("mentor.form.required")}</span>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          {label("mentor.form.contact")}
          <select value={form.contact} onChange={e => set("contact", e.target.value)} style={inputStyle(false)}>
            <option value="email">{t("contact.email") || "Email"}</option>
            <option value="meeting">{t("contact.meeting") || "Meeting"}</option>
            <option value="phone">{t("contact.phone") || "Phone"}</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          {label("mentor.form.urgency")}
          <select value={form.urgency} onChange={e => set("urgency", e.target.value)} style={inputStyle(false)}>
            <option value="normal">{t("priority.normal") || "Normal"}</option>
            <option value="soon">{t("priority.soon") || "Soon"}</option>
            <option value="urgent">{t("priority.urgent") || "Urgent"}</option>
          </select>
        </div>
      </div>

      <button type="submit"
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-extrabold text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: "#03045e" }}>
        <Send size={16} />
        {t("mentor.form.submit") || "Send Request"}
      </button>
    </form>
  );
}

function SessionHistory({ sessions }) {
  const { t, lang } = useLanguage();
  return (
    <div className="flex flex-col gap-3">
      {(sessions || []).map((s, i) => {
        const Icon = ICON_MAP[s.icon] || MessageCircle;
        return (
          <motion.div key={s.id} custom={i} variants={fade} initial="hidden" animate="visible"
            className="bg-white rounded-2xl p-5 flex items-start gap-4 shadow-sm border border-[#caf0f8]">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: s.colorBg }}>
              <Icon size={22} style={{ color: s.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-extrabold" style={{ color: "#03045e" }}>
                {lang === "hi" ? s.categoryHi : s.categoryEn}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs font-semibold text-gray-400">{s.mentorName}</p>
                <span className="text-gray-300">•</span>
                <p className="text-xs font-semibold text-gray-400">{s.date}</p>
              </div>
              <p className="text-xs text-gray-600 font-medium mt-2 leading-relaxed">
                {lang === "hi" ? s.noteHi : s.noteEn}
              </p>
            </div>
            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full flex-shrink-0 uppercase tracking-wide"
              style={{ backgroundColor: "#d1fae5", color: "#059669" }}>
              {t("session.completed") || "Completed"}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function MentorSupportPage() {
  const { lang, t } = useLanguage();
  const { isParent: isParentMode } = useAuth();
  const [showHelper, setShowHelper] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [prefillCategory, setPrefillCategory] = useState(null);

  const { data: mentors, loading: mLoading } = useService(getMentors);
  const { data: resources, loading: rLoading } = useService(getMentorResources);
  const { data: sessions, loading: sLoading } = useService(getMentorSessions);

  const handleCategorySelect = useCallback((catName) => {
    setPrefillCategory(catName);
    setActiveSection("request");
    setTimeout(() => document.getElementById("mentor-request-section")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }, []);

  const toggleSection = (id) => setActiveSection(v => v === id ? null : id);

  const SectionToggle = ({ id, labelKey, icon: Icon }) => (
    <button onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between px-5 py-4 bg-white rounded-2xl shadow-sm transition-colors hover:bg-gray-50"
      style={{ border: "1px solid #caf0f8" }}>
      <div className="flex items-center gap-3">
        <Icon size={18} style={{ color: "#0077b6" }} />
        <span className="text-sm font-extrabold" style={{ color: "#03045e" }}>
          {t(labelKey) || labelKey}
        </span>
      </div>
      {activeSection === id ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
    </button>
  );

  if (mLoading || rLoading || sLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const mentorProfile = mentors?.[0]; // Assume first mentor for now

  return (
    <>
      <motion.div variants={fade} initial="hidden" animate="visible" className="space-y-5">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl shadow-sm flex-shrink-0" style={{ backgroundColor: "#03045e" }}>
            <MessageCircle size={31} className="text-white" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-black truncate" style={{ color: "#03045e" }}>
              {t("mentor.title") || "Mentor Support"}
            </h1>
            <p className="text-sm text-gray-500 truncate">
              {isParentMode ? (t("mentor.subtitle.parent") || "Academic and personal guidance for your child.") : (t("mentor.subtitle.student") || "Seek guidance from your assigned school mentor.")}
            </p>
          </div>
          <div className="flex-shrink-0">
            <HelperButton onClick={() => setShowHelper(true)} />
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ backgroundColor: "#f0fdf4", outline: "1px solid #bbf7d0" }}>
          <Shield size={20} style={{ color: "#059669" }} className="flex-shrink-0" />
          <p className="text-xs font-bold leading-relaxed" style={{ color: "#065f46" }}>
            {t("mentor.privacyBanner") || "Your privacy is our priority. All conversations are confidential."}
          </p>
        </div>

        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest mb-2 px-1" style={{ color: "#0077b6" }}>
            {t("mentor.assignedMentor") || "Assigned Mentor"}
          </p>
          <MentorCard mentor={mentors} />
        </div>

        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest mb-3 px-1" style={{ color: "#0077b6" }}>
            {t("mentor.supportCategories") || "Support Categories"}
          </p>
          <CategoryGrid onSelect={handleCategorySelect} />
        </div>

        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest mb-3 px-1" style={{ color: "#0077b6" }}>
            {t("mentor.quickGuidance") || "Quick Resources"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(resources || []).map((r, i) => {
              const Icon = ICON_MAP[r.icon] || MessageCircle;
              const title = lang === 'hi' ? r.titleHi : r.titleEn;
              const tip = lang === 'hi' ? r.tipHi : r.tipEn;
              return (
                <motion.div key={r.id} custom={i} variants={fade} initial="hidden" animate="visible"
                  className="p-5 rounded-2xl flex flex-col gap-3 bg-white shadow-sm border border-[#caf0f8]">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: r.colorBg || "#f3f4f6" }}>
                    <Icon size={24} style={{ color: r.color || "#4b5563" }} />
                  </div>
                  <div>
                    <p className="text-base font-extrabold" style={{ color: r.color || "#03045e" }}>
                      {title}
                    </p>
                    <p className="text-[11px] font-semibold text-gray-400 mt-1 leading-relaxed">
                      {tip}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div id="mentor-request-section">
          <SectionToggle id="request" labelKey="mentor.requestSupport" icon={Send} />
          {activeSection === "request" && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="mt-3">
              <RequestForm prefillCategory={prefillCategory} />
            </motion.div>
          )}
        </div>

        {!isParentMode && (
          <div>
            <SectionToggle id="history" labelKey="mentor.mySessions" icon={Users} />
            {activeSection === "history" && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="mt-3">
                <SessionHistory sessions={sessions} />
              </motion.div>
            )}
          </div>
        )}

        <div className="flex items-center gap-5 p-6 rounded-2xl shadow-sm"
          style={{ background: "linear-gradient(135deg,#03045e,#0077b6)" }}>
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm">
            <Handshake size={34} className="text-[#caf0f8]" aria-hidden="true" />
          </div>
          <div>
            <p className="text-lg font-black text-white">
              {t("mentor.youAreNotAlone") || "You're Not Alone"}
            </p>
            <p className="text-sm text-white/70 font-semibold mt-0.5">
              {t("mentor.mentorIsHere") || "Your mentor is here to help you navigate through challenges."}
            </p>
          </div>
        </div>
      </motion.div>

      <HelperPopup
        isOpen={showHelper}
        onClose={() => setShowHelper(false)}
        titleKey="mentor.title"
        contentEn={HELPER_EN}
        contentHi={HELPER_HI}
      />
    </>
  );
}
