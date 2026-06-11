import React, { useState, useEffect } from "react";
import {
  Users,
  Code,
  Mic,
  Cpu,
  Camera,
  Music,
  BookOpen,
  Calendar,
  Award,
  ChevronRight,
  Mail,
  Clock,
  ExternalLink,
  PlusCircle,
  MinusCircle,
  AlertCircle,
  Megaphone
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { clubsService } from "../../services/clubsService";
import { useStudent } from "../../context/StudentContext";
import MainCard from "../../components/MainCard";
import HelperButton from "../../components/HelperButton";
import HelperPopup from "../../components/HelperPopup";
import ClubDetailPanel from "../../components/clubs/ClubDetailPanel";

const logoMap = {
  cpu: Cpu,
  mic: Mic,
  music: Music,
  camera: Camera,
  code: Code,
  "book-open": BookOpen
};

const NAVY = "#03045e";

export default function ClubsCommitteesPage() {
  const { t } = useLanguage();
  const [showHelper, setShowHelper] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [studentClubs, setStudentClubs] = useState([]);
  const [activities, setActivities] = useState([]);
  const [coordinators, setCoordinators] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [myProposals, setMyProposals] = useState([]);
  const [activityHistory, setActivityHistory] = useState([]);
  const [feedAnnouncements, setFeedAnnouncements] = useState([]);
  const [activeTab, setActiveTab] = useState("memberships"); // "memberships", "discover", "requests", "feed", "proposals"
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedClub, setSelectedClub] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isProposeModalOpen, setIsProposeModalOpen] = useState(false);
  const [proposalForm, setProposalForm] = useState({ clubName: "", category: "Academic", purpose: "" });
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [proposing, setProposing] = useState(false);
  
  const { activeStudentId } = useStudent();
  const studentId = activeStudentId || 'stud-001';

  const loadStudentData = async () => {
    setLoading(true);
    try {
      // 1. Get clubs with membership status
      const clubs = await clubsService.getStudentClubs(studentId);
      setStudentClubs(clubs);

      // 2. Aggregate recent events
      let allEvents = [];
      for (const club of clubs) {
        if (club.membershipStatus === 'Active') {
          const evs = await clubsService.getClubEvents(club.id);
          allEvents = [...allEvents, ...evs];
        }
        // Calculate counts for badges
        const evs = await clubsService.getClubEvents(club.id);
        const updates = await clubsService.getClubAnnouncements(club.id);
        
        const clubObj = clubs.find(c => c.id === club.id);
        if (clubObj) {
          clubObj.activitiesCount = evs.length;
          clubObj.advisoriesCount = updates.length;
        }
      }
      setActivities(allEvents);

      // 3. Get student's membership requests
      const requests = await clubsService.getStudentClubRequests(studentId);
      setMyRequests(requests);

      // 4. Get Feed Announcements
      const feed = await clubsService.getClubAnnouncementFeed(studentId);
      setFeedAnnouncements(feed);

      // 5. Get Student Proposals
      const proposals = await clubsService.getStudentClubProposals(studentId);
      setMyProposals(proposals);

      // 6. Get Activity History
      const history = await clubsService.getStudentActivityHistory(studentId);
      setActivityHistory(history);

      // 7. Populate fallback faculty coordinators list for all clubs
      const validClubsWithCoords = clubs.filter(
        c => c.coordinator && 
             !c.coordinator.toLowerCase().includes('faculty member') && 
             !c.coordinator.toLowerCase().includes('faculty coordinator')
      );
      
      const uniqueNames = new Set();
      const resolvedCoordinators = [];
      
      validClubsWithCoords.forEach(c => {
        if (!uniqueNames.has(c.coordinator)) {
          uniqueNames.add(c.coordinator);
          resolvedCoordinators.push({
            id: `fac-${c.id}`,
            name: c.coordinator,
            department: c.category || 'Co-Curricular',
            email: `${c.coordinator.toLowerCase().replace(/\s/g, '.').replace(/[^a-z.]/g, '')}@edudash.edu`,
            timings: 'Mon, Wed: 3:30 PM - 5:00 PM'
          });
        }
      });
      
      setCoordinators(resolvedCoordinators);
    } catch (err) {
      console.error("Failed to load student club dataset:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, [studentId]);

  const handleRequestMembership = async (clubId) => {
    setErrorMsg("");
    try {
      const club = studentClubs.find(c => c.id === clubId);
      await clubsService.createClubMembershipRequest({
        studentId,
        studentName: "Current Student",
        className: "10-A",
        section: "A",
        clubId,
        clubName: club.name,
        coordinatorTeacherId: club.clubHeadTeacherId || "teach-001",
        coordinatorTeacherName: club.coordinator || "Coordinator"
      });
      await loadStudentData();
      setActiveTab("requests");
    } catch (err) {
      setErrorMsg(err.message || "Failed to submit request.");
    }
  };

  const handleWithdrawRequest = async (requestId) => {
    setErrorMsg("");
    try {
      await clubsService.withdrawClubMembershipRequest(requestId);
      await loadStudentData();
    } catch (err) {
      setErrorMsg(err.message || "Failed to withdraw request.");
    }
  };

  const handleLeaveClub = async (clubId) => {
    setErrorMsg("");
    try {
      await clubsService.leaveClub(studentId, clubId);
      await loadStudentData();
    } catch (err) {
      setErrorMsg(err.message || "Failed to leave club.");
    }
  };

  const handleCreateProposal = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setProposing(true);
    try {
      await clubsService.createClubProposal({
        proposedByStudentId: studentId,
        proposedByStudentName: "Current Student", // In real app, fetch from auth context
        clubName: proposalForm.clubName,
        category: proposalForm.category,
        purpose: proposalForm.purpose
      });
      await loadStudentData();
      setIsProposeModalOpen(false);
      setProposalForm({ clubName: "", category: "Academic", purpose: "" });
      setActiveTab("proposals");
    } catch (err) {
      setErrorMsg(err.message || "Failed to submit proposal.");
    } finally {
      setProposing(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00b4d8]"></div>
    </div>
  );

  const joinedClubs = studentClubs.filter(c => c.isMember);
  const discoverClubs = studentClubs.filter(c => !c.isMember);

  return (
    <div className="max-w-[1600px] mx-auto pb-12 px-4 sm:px-0">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-2xl shadow-sm flex-shrink-0" style={{ backgroundColor: NAVY }}>
          <Users size={31} className="text-white" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-black" style={{ color: NAVY }}>
            {t("clubs.title") || "Clubs & Committees"}
          </h1>
          <p className="text-sm text-gray-500">
            {t("clubs.subtitle") || "Discover, join, and manage your co-curricular engagement."}
          </p>
        </div>
        <div className="ml-auto">
          <HelperButton onClick={() => setShowHelper(true)} />
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-black text-rose-700 flex items-center gap-3 animate-bounce">
          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6 items-start">
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {selectedClub ? (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <ClubDetailPanel 
                club={selectedClub} 
                onBack={() => setSelectedClub(null)} 
                isReadOnly={true}
              />
            </div>
          ) : (
            <>
              {/* Tabs Navigation */}
              <div className="flex items-center gap-6 border-b border-gray-100 mb-6 overflow-x-auto pb-1">
                {[
                  { id: "memberships", label: "My Memberships" },
                  { id: "discover", label: "Discover Clubs" },
                  { id: "requests", label: "My Requests" },
                  { id: "history", label: "Activity History" },
                  { id: "feed", label: "Club Feed" },
                  { id: "proposals", label: "My Proposals" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 text-sm font-black transition-colors relative ${
                      activeTab === tab.id
                        ? "text-[#0077b6]"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <span className="absolute bottom-0 left-0 w-full h-1 bg-[#0077b6] rounded-t-full" />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              {activeTab === "memberships" && (
                <section>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-lg font-black text-[#03045e] flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#caf0f8] flex items-center justify-center text-[#0077b6]">
                  <Award size={16} />
                </div>
                {t("clubs.memberships") || "My Memberships"}
              </h2>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-xl">
                {joinedClubs.length} / 2 Active
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {joinedClubs.length === 0 ? (
                <div className="col-span-2 p-8 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 text-center font-bold text-xs text-gray-400 italic">
                  You are not enrolled in any clubs. Discover and join up to 2 clubs below!
                </div>
              ) : (
                joinedClubs.map((club) => {
                  const Icon = logoMap[club.logo] || Award;
                  return (
                    <MainCard key={club.id} className="p-5 hover:translate-y-[-4px] transition-all duration-300 flex flex-col h-full relative group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-2xl bg-[#caf0f8]/30 text-[#0077b6] shadow-sm flex-shrink-0">
                          <Icon size={22} />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedClub(club)}
                            className="text-[9px] font-black px-2.5 py-1.5 rounded-lg bg-[#03045e] text-white uppercase tracking-wider hover:bg-[#0077b6] shadow-sm transition-colors"
                          >
                            View Details
                          </button>
                          <span className="text-[9px] font-black px-2.5 py-1.5 rounded-lg bg-[#00b4d8]/10 text-[#00b4d8] uppercase tracking-wider hidden sm:inline-block">
                            {club.category}
                          </span>
                          <button
                            onClick={() => handleLeaveClub(club.id)}
                            title="Leave Club"
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <MinusCircle size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-black text-[#03045e]">{club.name}</h3>
                          {club.role && club.role !== "Member" && (
                            <span className="text-[10px] px-2.5 py-0.5 rounded-md font-black uppercase tracking-widest bg-amber-100 text-amber-700 border border-amber-200 shadow-sm flex items-center gap-1">
                              🏆 {club.role}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-[0.1em]">Status: {club.status || "Active"}</p>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed font-medium">
                          {club.description}
                        </p>
                        
                        <div className="flex items-center gap-5 mb-4">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={15} color="#8C9EB5" strokeWidth={2.5} />
                            <span className="text-[11px] font-black text-[#8C9EB5] uppercase tracking-wider pt-[2px]">Activities</span>
                            <span className="flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-slate-50 text-[10px] font-black text-[#8C9EB5] border border-slate-100 ml-1">
                              {club.activitiesCount || 0}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Megaphone size={15} color="#8C9EB5" strokeWidth={2.5} />
                            <span className="text-[11px] font-black text-[#8C9EB5] uppercase tracking-wider pt-[2px]">Advisories</span>
                            <span className="flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-slate-50 text-[10px] font-black text-[#8C9EB5] border border-slate-100 ml-1">
                              {club.advisoriesCount || 0}
                            </span>
                          </div>
                        </div>
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
                          <span className="text-[9px] font-black text-gray-400 uppercase">Joined Date</span>
                          <div className="flex items-center gap-1.5">
                            <Clock size={10} className="text-[#00b4d8]" />
                            <span className="text-[10px] font-bold text-gray-700 truncate">{club.joinedAt || '2024-07-20'}</span>
                          </div>
                        </div>
                      </div>
                    </MainCard>
                  );
                })
              )}
            </div>
          </section>


              )}

              {activeTab === "discover" && (
          <section className="pt-2">
            {/* Discover Clubs */}
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-lg font-black text-[#03045e] flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#caf0f8] flex items-center justify-center text-[#0077b6]">
                  <ExternalLink size={16} />
                </div>
                {t("clubs.discover") || "Discover Clubs"}
              </h2>
              <button
                onClick={() => setIsProposeModalOpen(true)}
                className="h-8 px-4 bg-[#00b4d8] text-white rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-[#0096c7] transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <PlusCircle size={14} />
                Propose New Club
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {discoverClubs.length === 0 ? (
                <div className="col-span-2 p-8 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 text-center font-bold text-xs text-gray-400 italic">
                  No other clubs available to join at this time.
                </div>
              ) : (
                discoverClubs.map((club) => {
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
                            <span className="text-[9px] font-bold text-gray-400">{30 + (club.id.charCodeAt(club.id.length - 1) % 15)} Members</span>
                            <div className="w-1 h-1 rounded-full bg-gray-200" />
                            <span className="text-[9px] font-bold text-[#00b4d8] uppercase tracking-tighter">{club.category}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRequestMembership(club.id)}
                        disabled={joinedClubs.length >= 2}
                        className="h-7 px-3 rounded-lg text-[10px] font-black text-[#0077b6] hover:bg-[#0077b6] hover:text-white border border-[#0077b6]/20 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#0077b6] transition-all uppercase tracking-tighter flex-shrink-0 ml-2"
                      >
                        Request Membership
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </section>
              )}

              {activeTab === "requests" && (
                <section className="pt-2">
                  <div className="bg-white border border-[#caf0f8] rounded-3xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50/50">
                            <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100">Request ID</th>
                            <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100">Club</th>
                            <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100">Date</th>
                            <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100">Status</th>
                            <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {myRequests.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="py-8 text-center text-xs font-bold text-gray-400 italic">No membership requests found.</td>
                            </tr>
                          ) : (
                            myRequests.map((req) => (
                              <tr key={req.requestId} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                                <td className="py-4 px-5 text-xs font-bold text-gray-500">{req.requestId}</td>
                                <td className="py-4 px-5">
                                  <span className="text-xs font-black text-[#03045e]">{req.clubName}</span>
                                  <div className="text-[10px] font-bold text-gray-400 mt-0.5">{req.coordinatorTeacherName}</div>
                                </td>
                                <td className="py-4 px-5 text-xs font-bold text-gray-600">
                                  {new Date(req.requestDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                </td>
                                <td className="py-4 px-5">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                                    req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                    req.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                    req.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                    'bg-gray-100 text-gray-500 border border-gray-200'
                                  }`}>
                                    {req.status}
                                  </span>
                                </td>
                                <td className="py-4 px-5 text-right">
                                  {req.status === 'Pending' ? (
                                    <button
                                      onClick={() => handleWithdrawRequest(req.requestId)}
                                      className="text-[10px] font-black text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors uppercase tracking-wider"
                                    >
                                      Withdraw
                                    </button>
                                  ) : (
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                                      Closed
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              )}

              {activeTab === "history" && (
                <section>
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="text-lg font-black text-[#03045e] flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Award size={16} />
                      </div>
                      Activity History
                    </h2>
                  </div>

                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    {activityHistory.length === 0 ? (
                      <div className="p-8 text-center text-xs font-bold text-gray-400 italic">
                        No activity participation history found.
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {activityHistory.map(item => (
                          <div key={item.participationId} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-[#03045e]">{item.activityTitle}</span>
                              <span className="text-[10px] font-bold text-gray-400">{item.clubName} • {item.participationDate}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col text-right">
                                <span className="text-[9px] font-bold text-gray-400 uppercase">Coordinator</span>
                                <span className="text-[11px] font-black text-gray-700">{item.markedByTeacherName}</span>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                item.participationStatus === "Participated" 
                                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                                  : "bg-gray-100 text-gray-500 border border-gray-200"
                              }`}>
                                {item.participationStatus}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {activeTab === "feed" && (
                <section>
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="text-lg font-black text-[#03045e] flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#caf0f8] flex items-center justify-center text-[#0077b6]">
                        <Megaphone size={16} />
                      </div>
                      Club Feed
                    </h2>
                  </div>
                  
                  <div className="space-y-4">
                    {feedAnnouncements.length === 0 ? (
                      <div className="p-8 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 text-center font-bold text-xs text-gray-400 italic">
                        No announcements available.
                      </div>
                    ) : (
                      feedAnnouncements.map((ann) => {
                        const getCategoryColor = (cat) => {
                          switch(cat) {
                            case "Meeting": return "bg-blue-50 text-blue-600 border-blue-100";
                            case "Competition": return "bg-purple-50 text-purple-600 border-purple-100";
                            case "Practice Session": return "bg-orange-50 text-orange-600 border-orange-100";
                            case "Achievement": return "bg-green-50 text-green-600 border-green-100";
                            case "Registration": return "bg-cyan-50 text-cyan-600 border-cyan-100";
                            case "Notice": return "bg-rose-50 text-rose-600 border-rose-100";
                            case "Event Reminder": return "bg-indigo-50 text-indigo-600 border-indigo-100";
                            default: return "bg-gray-50 text-gray-600 border-gray-100";
                          }
                        };
                        return (
                          <div key={ann.announcementId} className={`p-5 rounded-2xl border transition-colors relative ${ann.isPinned ? "bg-amber-50/30 border-amber-100" : "bg-white border-gray-100 hover:bg-gray-50/30"}`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider border ${getCategoryColor(ann.category)}`}>
                                  {ann.category}
                                </span>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider border border-gray-100 px-2 py-0.5 rounded bg-gray-50">
                                  {ann.clubName}
                                </span>
                              </div>
                              <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                                <Clock size={12} />
                                {new Date(ann.createdAt).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <h5 className="font-black text-sm text-[#03045e] mb-2">{ann.title}</h5>
                            <p className="text-xs text-gray-600 font-medium leading-relaxed whitespace-pre-wrap line-clamp-2">{ann.content}</p>
                            <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                              <span className="text-[10px] font-bold text-gray-400">
                                Posted by: {ann.createdByTeacherName || "Coordinator"}
                              </span>
                              <button
                                onClick={() => setSelectedAnnouncement(ann)}
                                className="text-[10px] font-black text-[#00b4d8] hover:text-[#0077b6] flex items-center gap-1 uppercase tracking-wider transition-colors"
                              >
                                Read More <ChevronRight size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>
              )}
            </>
          )}
        </div>

      {/* Propose New Club Modal */}
      {isProposeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100">
            <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#00b4d8]" />
                <h3 className="font-black text-sm text-[#03045e] uppercase tracking-wider">
                  Propose New Club
                </h3>
              </div>
              <button 
                onClick={() => setIsProposeModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-rose-500 hover:border-rose-100 hover:bg-rose-50 transition-colors"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleCreateProposal} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Club Name</label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    value={proposalForm.clubName}
                    onChange={(e) => setProposalForm({...proposalForm, clubName: e.target.value})}
                    className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-[#03045e] focus:outline-none focus:border-[#00b4d8] focus:ring-1 focus:ring-[#00b4d8] transition-all"
                    placeholder="e.g. AI Club"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Category</label>
                  <select
                    required
                    value={proposalForm.category}
                    onChange={(e) => setProposalForm({...proposalForm, category: e.target.value})}
                    className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-[#03045e] focus:outline-none focus:border-[#00b4d8] focus:ring-1 focus:ring-[#00b4d8] transition-all"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Technology">Technology</option>
                    <option value="Sports">Sports</option>
                    <option value="Arts">Arts</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Science & Tech">Science & Tech</option>
                    <option value="Literary & Debate">Literary & Debate</option>
                    <option value="Community Service">Community Service</option>
                    <option value="Leadership">Leadership</option>
                    <option value="STEM">STEM</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Purpose</label>
                  <textarea
                    required
                    maxLength={300}
                    rows={4}
                    value={proposalForm.purpose}
                    onChange={(e) => setProposalForm({...proposalForm, purpose: e.target.value})}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:border-[#00b4d8] focus:ring-1 focus:ring-[#00b4d8] transition-all resize-none"
                    placeholder="Describe the club's objectives and activities..."
                  />
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsProposeModalOpen(false)}
                  className="flex-1 h-10 rounded-xl bg-gray-100 text-gray-500 font-black text-[11px] uppercase tracking-wider hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={proposing || !proposalForm.clubName.trim() || !proposalForm.purpose.trim()}
                  className="flex-1 h-10 rounded-xl bg-[#00b4d8] text-white font-black text-[11px] uppercase tracking-wider hover:bg-[#0096c7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {proposing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : "Submit Proposal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Proposal Details Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100">
            <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#00b4d8]" />
                <h3 className="font-black text-sm text-[#03045e] uppercase tracking-wider">
                  Proposal Details
                </h3>
              </div>
              <button 
                onClick={() => setSelectedProposal(null)}
                className="w-7 h-7 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-rose-500 hover:border-rose-100 hover:bg-rose-50 transition-colors"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Proposal ID</span>
                <p className="text-sm font-bold text-[#03045e] mt-0.5">{selectedProposal.proposalId}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Club Name</span>
                  <p className="text-sm font-black text-[#03045e] mt-0.5">{selectedProposal.clubName}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Category</span>
                  <p className="text-xs font-bold text-gray-600 mt-1">{selectedProposal.category}</p>
                </div>
              </div>

              <div className="mb-4">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Purpose</span>
                <p className="text-xs font-medium text-gray-700 mt-1 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {selectedProposal.purpose}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Submitted On</span>
                  <p className="text-xs font-bold text-gray-600 mt-0.5">
                    {new Date(selectedProposal.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Status</span>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                      selectedProposal.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      selectedProposal.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                      'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {selectedProposal.status}
                    </span>
                  </div>
                </div>
              </div>

              {selectedProposal.remarks && (
                <div className="mb-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Decision Remarks</span>
                  <p className="text-xs font-bold text-gray-700 mt-1 bg-[#caf0f8]/30 p-3 rounded-xl border border-[#caf0f8]">
                    {selectedProposal.remarks}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Announcement Details Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#00b4d8]" />
                <h3 className="font-black text-xs text-[#03045e] uppercase tracking-wider">
                  Announcement Details
                </h3>
              </div>
              <button 
                onClick={() => setSelectedAnnouncement(null)}
                className="w-7 h-7 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-rose-500 hover:border-rose-100 hover:bg-rose-50 transition-colors"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-[10px] font-black text-[#00b4d8] bg-[#caf0f8] px-2.5 py-1 rounded-lg uppercase tracking-wider border border-[#90e0ef]">
                  {selectedAnnouncement.category}
                </span>
                <span className="text-[10px] font-black text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg uppercase tracking-wider border border-gray-200">
                  {selectedAnnouncement.clubName}
                </span>
              </div>
              
              <h2 className="text-xl font-black text-[#03045e] mb-4">
                {selectedAnnouncement.title}
              </h2>
              
              <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-6 pb-4 border-b border-gray-50">
                <span className="flex items-center gap-1.5">
                  <Users size={12} /> {selectedAnnouncement.createdByTeacherName || "Coordinator"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={12} /> 
                  {new Date(selectedAnnouncement.createdAt).toLocaleDateString(undefined, {
                    month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
              
              <div className="text-sm text-gray-700 font-medium leading-relaxed whitespace-pre-wrap">
                {selectedAnnouncement.content}
              </div>
            </div>
          </div>
        </div>
      )}

        {/* Sidebar Activities and Coordinators */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <section>
            <div className="flex items-center gap-2.5 mb-4 px-1">
              <div className="w-7 h-7 rounded-lg bg-[#caf0f8] flex items-center justify-center text-[#0077b6]">
                <Calendar size={16} />
              </div>
              <h2 className="text-lg font-black text-[#03045e]">
                {t("clubs.activities") || "Upcoming Activities"}
              </h2>
            </div>
            <MainCard borderColor="#0077b6" className="p-6">
              {activities.length === 0 ? (
                <div className="text-center py-6 text-xs font-bold text-gray-400 italic">
                  No upcoming activities scheduled for your active memberships.
                </div>
              ) : (
                <div className="space-y-5">
                  {activities.slice(0, showAllActivities ? undefined : 3).map((act, idx) => (
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
                        <Clock size={10} className="text-[#00b4d8] flex-shrink-0" />
                        <span>{act.time}</span>
                        <div className="w-1 h-1 rounded-full bg-gray-200" />
                        <span>{act.venue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activities.length > 3 && (
                <button 
                  onClick={() => setShowAllActivities(!showAllActivities)}
                  className="w-full mt-6 py-2.5 rounded-xl bg-gray-50 text-[10px] font-black text-[#0077b6] uppercase tracking-widest hover:bg-[#caf0f8] transition-colors border border-dashed border-[#00b4d8]/30"
                >
                  {showAllActivities ? "Show Less" : "View All Activities"}
                </button>
              )}
            </MainCard>
          </section>

          {/* Coordinators */}
          <section>
            <div className="flex items-center gap-2 mb-3 px-2">
              <Users size={16} className="text-[#00b4d8]" />
              <h2 className="text-md font-black text-[#03045e]">{t("clubs.coordinators") || "Faculty Coordinators"}</h2>
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
        titleKey="clubs.title"
        contentEn="The Clubs & Committees section provides a central hub for all your extracurricular engagements."
        contentHi="क्लब और समितियाँ अनुभाग आपकी सभी पाठ्येतर व्यस्तताओं के लिए एक केंद्रीय केंद्र प्रदान करता है।"
      />
    </div>
  );
}

