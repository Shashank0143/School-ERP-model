import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bus,
  MapPin,
  Clock,
  User,
  ShieldCheck,
  AlertCircle,
  Navigation,
  Info,
  ChevronRight,
  Phone,
  Calendar,
  Zap,
  Map
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { transportService } from "../services/transportService";
import MainCard from "../components/MainCard";
import HelperButton from "../components/HelperButton";
import HelperPopup from "../components/HelperPopup";

const NAVY = "#03045e";
const TEAL = "#0077b6";
const CYAN = "#00b4d8";
const LIME = "#caf0f8";

/* ── Reusable section header (matches FacultyPage / Achievements) ── */
function SectionHeader({ icon, title, aside }) {
  return (
    <div className="flex items-center justify-between mb-4 px-1">
      <h2 className="text-lg font-black text-[#03045e] flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-[#caf0f8] flex items-center justify-center text-[#0077b6] flex-shrink-0">
          {icon}
        </div>
        {title}
      </h2>
      {aside && <div>{aside}</div>}
    </div>
  );
}

/* ── Metadata row (label + value) used inside cards ── */
function MetaRow({ label, value, valueClass = "" }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-[9px] font-black uppercase tracking-wide text-gray-400">
        {label}
      </span>
      <span className={`text-xs font-bold text-right ${valueClass || "text-[#03045e]"}`}>
        {value}
      </span>
    </div>
  );
}

export default function TransportPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [showHelper, setShowHelper] = useState(false);
  const [summary, setSummary] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [personnel, setPersonnel] = useState(null);
  const [route, setRoute] = useState([]);
  const [notices, setNotices] = useState([]);
  const [guidelines, setGuidelines] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, v, p, r, n, g] = await Promise.all([
          transportService.getTransportSummary(),
          transportService.getVehicleDetails(),
          transportService.getPersonnelInfo(),
          transportService.getRouteTimeline(),
          transportService.getTransportNotices(),
          transportService.getSafetyGuidelines(),
        ]);
        setSummary(s);
        setVehicle(v);
        setPersonnel(p);
        setRoute(r);
        setNotices(n);
        setGuidelines(g);
      } catch (err) {
        console.error("Failed to fetch transport data", err);
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

  const currentIdx = route.findIndex(item => item.current);
  const progressPct = route.length > 1
    ? (currentIdx / (route.length - 1)) * 100
    : 0;

  return (
    <div className="max-w-[1600px] mx-auto pb-12 px-2 sm:px-0">

      {/* ── Page Header (matches FacultyPage exactly) ── */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-2xl shadow-sm flex-shrink-0" style={{ backgroundColor: NAVY }}>
          <Bus size={28} className="text-white" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-black" style={{ color: NAVY }}>
            {t("transport.title")}
          </h1>
          <p className="text-sm text-gray-500">{t("transport.subtitle")}</p>
        </div>
        <div className="ml-auto">
          <HelperButton onClick={() => setShowHelper(true)} />
        </div>
      </div>

      {/* ── Dashboard Grid ── */}
      <div className="space-y-10">

        {/* ROW 1 ── Assigned Route + Vehicle Details */}
        <div className="grid grid-cols-12 gap-6 items-stretch">

          {/* LEFT 65% – Assigned Route */}
          <div className="col-span-12 lg:col-span-8">
            <SectionHeader
              icon={<Map size={16} />}
              title={t("transport.assigned_route")}
            />
            <MainCard
              className="p-6 flex flex-col gap-5 h-[calc(100%-3.25rem)]"
              borderColor={CYAN}
            >
              {/* Hero row */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#00b4d8] mb-1">
                    Designated Express Route
                  </p>
                  <h2 className="text-4xl font-black leading-none" style={{ color: NAVY }}>
                    {summary?.routeNo}
                  </h2>
                </div>
                <div className="flex gap-6">
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-wide text-gray-400 mb-1">
                      {t("transport.pickup")}
                    </p>
                    <p className="text-sm font-bold" style={{ color: NAVY }}>
                      {summary?.pickupStop}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-wide text-gray-400 mb-1">
                      {t("transport.departure")}
                    </p>
                    <p className="text-sm font-bold" style={{ color: NAVY }}>
                      {summary?.pickupTime}
                    </p>
                  </div>
                </div>
              </div>

              {/* Meta chips */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Vehicle No", value: summary?.vehicleNo },
                  { label: "Pass ID",    value: summary?.passId,    accent: true },
                  { label: "Status",     value: "Active • On Track", green: true },
                ].map(({ label, value, accent, green }) => (
                  <div
                    key={label}
                    className="rounded-xl p-3 border border-gray-100"
                    style={{ backgroundColor: "#f8fafc" }}
                  >
                    <p className="text-[9px] font-black uppercase tracking-wide text-gray-400 mb-1">
                      {label}
                    </p>
                    <p className={`text-xs font-bold ${green ? "text-emerald-600" : accent ? "text-[#0077b6]" : "text-[#03045e]"}`}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Status strip */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
                <div className="flex gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wide">
                    <Zap size={10} /> GPS Active
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0077b6] text-[10px] font-black uppercase tracking-wide">
                    <Clock size={10} /> On Time
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400">
                    Next: <span className="font-black" style={{ color: NAVY }}>Main Gate</span>
                  </span>
                  <button
                    className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest opacity-60"
                    style={{ backgroundColor: NAVY, color: LIME }}
                  >
                    Track
                  </button>
                </div>
              </div>
            </MainCard>
          </div>

          {/* RIGHT 35% – Vehicle Details */}
          <div className="col-span-12 lg:col-span-4">
            <SectionHeader icon={<Bus size={16} />} title={t("transport.details")} />
            <MainCard borderColor={CYAN} className="p-6 flex flex-col gap-4 h-[calc(100%-3.25rem)]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wide text-gray-400 mb-0.5">Model / Type</p>
                  <p className="text-sm font-black" style={{ color: NAVY }}>{vehicle?.model}</p>
                  <p className="text-[10px] font-bold uppercase" style={{ color: CYAN }}>{vehicle?.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black uppercase tracking-wide text-gray-400 mb-0.5">Capacity</p>
                  <p className="text-sm font-black" style={{ color: NAVY }}>52 Seats</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wide text-gray-400 mb-0.5">Fuel Type</p>
                  <p className="text-xs font-bold" style={{ color: NAVY }}>Electric (EV)</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wide text-gray-400 mb-0.5">Route Zone</p>
                  <p className="text-xs font-bold" style={{ color: NAVY }}>North Campus</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {vehicle?.features.map((f, i) => (
                  <span
                    key={i}
                    className="text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider"
                    style={{ backgroundColor: `${CYAN}15`, color: TEAL }}
                  >
                    {f}
                  </span>
                ))}
              </div>

              <div className="pt-3 mt-auto border-t border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wide text-gray-400">Supervisor</p>
                  <p className="text-xs font-bold" style={{ color: NAVY }}>{vehicle?.coordinator}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                  <ShieldCheck size={16} />
                </div>
              </div>
            </MainCard>
          </div>
        </div>

        {/* ROW 2 ── Route Timeline + Driver Info */}
        <div className="grid grid-cols-12 gap-6 items-stretch">

          {/* LEFT 65% – Route Timeline */}
          <div className="col-span-12 lg:col-span-8">
            <SectionHeader
              icon={<Map size={16} />}
              title={t("transport.timeline")}
              aside={
                <span
                  className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg"
                  style={{ backgroundColor: LIME, color: TEAL }}
                >
                  ETA 08:10 AM
                </span>
              }
            />
            <MainCard borderColor={TEAL} className="p-6 h-[calc(100%-3.25rem)] flex flex-col justify-center">
              {/* ── Horizontal metro-line tracker ── */}
              <div className="relative w-full">
                {/* Connector base */}
                <div className="absolute top-5 left-0 right-0 h-[2px] bg-gray-100 rounded-full" />
                {/* Active progress */}
                <div
                  className="absolute top-5 left-0 h-[2px] bg-[#00b4d8] rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />

                {/* Stops grid – equal columns, no overflow */}
                <div
                  className="relative z-10 grid w-full"
                  style={{ gridTemplateColumns: `repeat(${route.length}, 1fr)` }}
                >
                  {route.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      {/* Node */}
                      <div className="h-10 flex items-center justify-center">
                        <div
                          className={[
                            "rounded-full flex items-center justify-center transition-all duration-300 relative",
                            item.isPickup || item.isSchool
                              ? "w-5 h-5 shadow-md"
                              : "w-3.5 h-3.5",
                            item.isPickup
                              ? "ring-4 ring-[#caf0f8]"
                              : "",
                          ].join(" ")}
                          style={{
                            backgroundColor: item.isPickup
                              ? NAVY
                              : item.isSchool
                              ? CYAN
                              : item.current
                              ? CYAN
                              : "#e5e7eb",
                          }}
                        >
                          {item.isSchool && (
                            <Bus size={9} className="text-white" />
                          )}
                          {item.current && (
                            <div className="absolute inset-0 rounded-full bg-[#00b4d8] animate-ping opacity-60" />
                          )}
                        </div>
                      </div>

                      {/* Label */}
                      <p
                        className="text-center text-xs font-bold leading-tight mt-3 px-1 line-clamp-2"
                        style={{ color: item.current ? TEAL : NAVY, opacity: item.current ? 1 : 0.75 }}
                      >
                        {item.stop}
                      </p>
                      <p className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-tight">
                        {item.time}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </MainCard>
          </div>

          {/* RIGHT 35% – Driver Info */}
          <div className="col-span-12 lg:col-span-4">
            <SectionHeader icon={<User size={16} />} title={t("transport.driver")} />
            <MainCard borderColor={CYAN} className="p-6 flex flex-col gap-5 h-[calc(100%-3.25rem)]">
              {/* Driver identity */}
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-md flex-shrink-0"
                  style={{ backgroundColor: NAVY }}
                >
                  {personnel?.driver.name[0]}
                </div>
                <div className="min-w-0">
                  <h4 className="text-base font-black truncate" style={{ color: NAVY }}>
                    {personnel?.driver.name}
                  </h4>
                  <p className="text-xs text-gray-400 font-bold flex items-center gap-1 mt-0.5">
                    <Zap size={10} className="text-emerald-500" />
                    4.8 Rating • Morning Shift
                  </p>
                </div>
              </div>

              {/* Metadata rows */}
              <div className="flex flex-col gap-0">
                <MetaRow label="Emergency" value="+91 98765 43210" />
                <MetaRow label="License Valid" value="Dec 2028" />
                <MetaRow label="Experience" value={personnel?.driver.experience} />
              </div>

              {/* Attendant footer */}
              <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wide text-gray-400">Attendant</p>
                  <p className="text-xs font-bold mt-0.5" style={{ color: NAVY }}>
                    {personnel?.attendant.name}
                  </p>
                </div>
                <button
                  className="p-2 rounded-xl transition-colors hover:opacity-90"
                  style={{ backgroundColor: LIME, color: TEAL }}
                  aria-label="Call attendant"
                >
                  <Phone size={14} />
                </button>
              </div>
            </MainCard>
          </div>
        </div>

        {/* ROW 3 ── Safety + Alerts */}
        <div className="grid grid-cols-12 gap-6 items-stretch">

          {/* LEFT 65% – Safety First */}
          <div className="col-span-12 lg:col-span-8">
            <SectionHeader icon={<ShieldCheck size={16} />} title={t("transport.safety")} />
            <div
              className="rounded-3xl p-7 text-white shadow-xl relative overflow-hidden h-[calc(100%-3.25rem)]"
              style={{ backgroundColor: NAVY }}
            >
              <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-5">
                <ShieldCheck size={120} />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-extrabold uppercase tracking-widest mb-5" style={{ color: CYAN }}>
                  Security Protocol Checklist
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                  {guidelines.map((g) => (
                    <div key={g.id} className="flex gap-3 items-start text-xs font-semibold leading-relaxed text-white/75">
                      <div
                        className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: `${CYAN}25`, color: CYAN }}
                      >
                        <Zap size={8} />
                      </div>
                      {g.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 35% – Transport Alerts */}
          <div className="col-span-12 lg:col-span-4">
            <SectionHeader icon={<AlertCircle size={16} />} title={t("transport.alerts")} />
            <MainCard borderColor={CYAN} className="p-6 flex flex-col h-[calc(100%-3.25rem)]">
              <div className="flex-1 space-y-0">
                {notices.map((n) => (
                  <div
                    key={n.id}
                    className="flex gap-3 items-start py-3 border-b border-gray-50 last:border-0"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        n.priority === "high" ? "bg-red-500 animate-pulse" : "bg-[#00b4d8]"
                      }`}
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-black leading-tight" style={{ color: NAVY }}>
                        {n.title}
                      </h4>
                      <p className="text-xs font-medium text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="w-full mt-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors hover:opacity-90"
                style={{ backgroundColor: LIME, color: TEAL }}
              >
                View All Alerts
              </button>
            </MainCard>
          </div>
        </div>

      </div>{/* end space-y-10 */}

      <HelperPopup
        isOpen={showHelper}
        onClose={() => setShowHelper(false)}
        titleKey="Student Transport"
        contentEn="The Student Transport dashboard provides real-time information regarding your assigned route, vehicle, and personnel. Monitor pickup timings, track the route timeline, and stay updated with safety guidelines and service alerts."
        contentHi="छात्र परिवहन डैशबोर्ड आपके असाइन किए गए मार्ग, वाहन और कर्मियों के संबंध में वास्तविक समय की जानकारी प्रदान करता है। पिकअप समय की निगरानी करें, मार्ग समयरेखा को ट्रैक करें और सुरक्षा दिशानिर्देशों और सेवा अलर्ट के साथ अपडेट रहें।"
      />
    </div>
  );
}
