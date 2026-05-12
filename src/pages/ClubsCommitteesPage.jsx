import React, { useState, useEffect } from "react";
import {
  Users,
  Code,
  Mic,
  Cpu,
  Camera,
  Music,
  Theater,
  Leaf,
  Calendar,
  Award,
  ChevronRight,
  UserCheck,
  Mail,
  Clock,
  ExternalLink
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { clubService } from "../services/clubService";
import MainCard from "../components/MainCard";
import HelperButton from "../components/HelperButton";
import HelperPopup from "../components/HelperPopup";

const logoMap = {
  code: Code,
  mic: Mic,
  cpu: Cpu,
  camera: Camera,
  music: Music,
  theater: Theater,
  leaf: Leaf,
};

const NAVY = "#03045e";
const CYAN = "#00b4d8";

export default function ClubsCommitteesPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [showHelper, setShowHelper] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);
  
  const [stats, setStats] = useState(null);
  const [joinedClubs, setJoinedClubs] = useState([]);
  const [availableClubs, setAvailableClubs] = useState([]);
  const [activities, setActivities] = useState([]);
  const [coordinators, setCoordinators] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, j, a, act, c] = await Promise.all([
          clubService.getStats(),
          clubService.getJoinedClubs(),
          clubService.getAvailableClubs(),
          clubService.getUpcomingActivities(),
          clubService.getCoordinators(),
        ]);
        setStats(s);
        setJoinedClubs(j);
        setAvailableClubs(a);
        setActivities(act);
        setCoordinators(c);
      } catch (err) {
        console.error("Failed to fetch clubs data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00b4d8]"></div>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto pb-12 px-4 sm:px-0">
      {/* Standard EduDash Page Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-2xl shadow-sm flex-shrink-0" style={{ backgroundColor: NAVY }}>
          <Users size={31} className="text-white" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-black" style={{ color: NAVY }}>
            {t("clubs.title")}
          </h1>
          <p className="text-sm text-gray-500">
            {t("clubs.subtitle")}
          </p>
        </div>
        <div className="ml-auto">
          <HelperButton onClick={() => setShowHelper(true)} />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Left Column: Primary Content (68%) */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          
          {/* Section: My Joined Clubs */}
          <section>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-lg font-black text-[#03045e] flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#caf0f8] flex items-center justify-center text-[#0077b6]">
                  <Award size={16} />
                </div>
                {t("clubs.memberships")}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {joinedClubs.map((club) => {
                const Icon = logoMap[club.logo] || Award;
                return (
                  <MainCard key={club.id} className="p-5 hover:translate-y-[-4px] transition-all duration-300 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-2xl bg-[#caf0f8]/30 text-[#0077b6] shadow-sm flex-shrink-0">
                        <Icon size={22} />
                      </div>
                      <span className="text-[9px] font-black px-2.5 py-1 rounded-lg bg-[#00b4d8]/10 text-[#00b4d8] uppercase tracking-wider">
                        {club.category}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-black text-[#03045e] mb-0.5">{club.name}</h3>
                      <p className="text-[10px] font-black text-[#00b4d8] mb-3 uppercase tracking-[0.1em]">{club.role}</p>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-5 leading-relaxed font-medium">
                        {club.description}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50 mt-auto">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase">Coordinator</span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span className="text-[10px] font-bold text-gray-700 truncate">{club.coordinator}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase">Next Session</span>
                        <div className="flex items-center gap-1.5">
                          <Clock size={10} className="text-[#00b4d8]" />
                          <span className="text-[10px] font-bold text-gray-700 truncate">{club.nextMeeting.split(',')[0]}</span>
                        </div>
                      </div>
                    </div>
                  </MainCard>
                );
              })}
            </div>
          </section>

          {/* Section: Available Clubs */}
          <section className="pt-2">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-lg font-black text-[#03045e] flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#caf0f8] flex items-center justify-center text-[#0077b6]">
                  <ExternalLink size={16} />
                </div>
                {t("clubs.discover")}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableClubs.map((club) => {
                const Icon = logoMap[club.logo] || ChevronRight;
                return (
                  <div key={club.id} className="bg-white border border-[#caf0f8] rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#caf0f8] group-hover:text-[#0077b6] transition-colors flex-shrink-0">
                        <Icon size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-[#03045e] group-hover:text-[#0077b6] transition-colors leading-tight mb-1">{club.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-gray-400">{club.memberCount} Members</span>
                          <div className="w-1 h-1 rounded-full bg-gray-200" />
                          <span className="text-[9px] font-bold text-[#00b4d8] uppercase tracking-tighter">{club.frequency}</span>
                        </div>
                      </div>
                    </div>
                    <button className="h-7 px-3 rounded-lg text-[10px] font-black text-[#0077b6] hover:bg-[#0077b6] hover:text-white border border-[#0077b6]/20 transition-all uppercase tracking-tighter flex-shrink-0 ml-2">
                      Join
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right Column: Activities & Faculty (32%) */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          
          {/* Section: Upcoming Activities */}
          <section>
            <div className="flex items-center gap-2.5 mb-4 px-1">
              <div className="w-7 h-7 rounded-lg bg-[#caf0f8] flex items-center justify-center text-[#0077b6]">
                <Calendar size={16} />
              </div>
              <h2 className="text-lg font-black text-[#03045e]">
                {t("clubs.activities")}
              </h2>
            </div>
            <MainCard borderColor="#0077b6" className="p-6">
              <div className="space-y-5">
                {(showAllActivities ? [...activities, ...activities] : activities).map((act, idx) => (
                  <div key={`${act.id}-${idx}`} className="relative pl-5 border-l-2 border-[#caf0f8] pb-1 last:pb-0">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-[#00b4d8]" />
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-[10px] font-black text-[#00b4d8] uppercase tracking-[0.1em]">{act.date}</span>
                      <span className="text-[8px] font-bold px-2 py-0.5 rounded-md bg-gray-50 text-gray-400 border border-gray-100 uppercase">
                        {act.type}
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-[#03045e] leading-snug mb-1">{act.title}</h4>
                    <div className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-gray-200" />
                      {act.club}
                    </div>
                  </div>
                ))}
                {showAllActivities && (
                  <p className="text-[10px] font-bold text-gray-400 italic text-center pt-2">
                    No more activities scheduled for this month.
                  </p>
                )}
              </div>
              <button 
                onClick={() => setShowAllActivities(!showAllActivities)}
                className="w-full mt-6 py-2.5 rounded-xl bg-gray-50 text-[10px] font-black text-[#0077b6] uppercase tracking-widest hover:bg-[#caf0f8] transition-colors border border-dashed border-[#00b4d8]/30"
              >
                {showAllActivities ? "Show Less" : "View All Activities"}
              </button>
            </MainCard>
          </section>

          {/* Section: Faculty Coordinators */}
          <section>
            <div className="flex items-center gap-2 mb-3 px-2">
              <Users size={16} className="text-[#00b4d8]" />
              <h2 className="text-md font-black text-[#03045e]">{t("clubs.coordinators")}</h2>
            </div>
            <div className="space-y-3">
              {coordinators.map((fac) => (
                <div key={fac.id} className="bg-white border border-[#caf0f8] rounded-[1.25rem] p-3.5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#03045e] flex items-center justify-center text-white font-black text-md shadow-md shadow-[#03045e]/20 flex-shrink-0">
                      {fac.name.split(" ").pop()[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-black text-[#03045e] leading-tight truncate">{fac.name}</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter truncate mt-0.5">{fac.department}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 pt-2 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600">
                      <div className="w-5 h-5 rounded-md bg-[#caf0f8]/30 flex items-center justify-center text-[#0077b6] flex-shrink-0">
                        <Mail size={10} />
                      </div>
                      <span className="truncate">{fac.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600">
                      <div className="w-5 h-5 rounded-md bg-[#caf0f8]/30 flex items-center justify-center text-[#0077b6] flex-shrink-0">
                        <Clock size={10} />
                      </div>
                      <span className="truncate">{fac.timings}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <HelperPopup
        isOpen={showHelper}
        onClose={() => setShowHelper(false)}
        titleKey="Clubs & Committees"
        contentEn="The Clubs & Committees section provides a central hub for all your extracurricular engagements. Monitor your active memberships, discover new interest groups, and stay updated with upcoming events and faculty office hours."
        contentHi="क्लब और समितियाँ अनुभाग आपकी सभी पाठ्येतर व्यस्तताओं के लिए एक केंद्रीय केंद्र प्रदान करता है। अपनी सक्रिय सदस्यताओं की निगरानी करें, नए रुचि समूहों की खोज करें और आगामी कार्यक्रमों और संकाय कार्यालय घंटों के साथ अपडेट रहें।"
      />
    </div>
  );
}
