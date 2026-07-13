import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  X,
  FileText,
  Send,
  Printer,
  AlertCircle,
  TrendingUp,
  Users,
  IndianRupee,
  Download,
  Edit2,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  Calendar,
  Plus,
  Trash2,
  Settings2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import PageAuthorityBanner from "../../components/admin/PageAuthorityBanner";
import PermissionGate from "../../components/admin/PermissionGate";
import OperationsFilterBar from "../../components/admin/operations/OperationsFilterBar";
import AdminSectionCard from "../../components/admin/AdminSectionCard";
import AdminDataTable from "../../components/admin/AdminDataTable";
import AdminEditForm from "../../components/admin/AdminEditForm";
import StatusBadge from "../../components/admin/operations/StatusBadge";
import ConfirmationModal from "../../shared/components/ConfirmationModal";
import ToastNotification from "../../shared/components/ToastNotification";
import LoadingSkeleton from "../../shared/components/LoadingSkeleton";
import { getDataProvider } from "../../data";
import { formatClassLevel } from "../../shared/utils/classIdentity";
import {
  addFee,
  deleteFee,
  getFeeDependencies,
} from "../../services/financeService";

const LEVEL_DISPLAY = (level) => {
  if (!level) return "";
  const displayLevel = formatClassLevel(level);
  if (["Nursery", "LKG", "UKG"].includes(displayLevel)) return displayLevel;
  return `Class ${displayLevel}`;
};

// Fee months - monthly billing cycle (April-March academic year)
const FEE_MONTHS = [
  {
    id: "apr",
    name: "April 2026",
    label: "April 2026 Invoice",
    vacation: false,
  },
  { id: "may", name: "May 2026", label: "May 2026 Invoice", vacation: false },
  {
    id: "jun",
    name: "June 2026",
    label: "June 2026 Invoice",
    vacation: true,
    vacationType: "SUMMER",
  },
  { id: "jul", name: "July 2026", label: "July 2026 Invoice", vacation: false },
  {
    id: "aug",
    name: "August 2026",
    label: "August 2026 Invoice",
    vacation: false,
  },
  {
    id: "sep",
    name: "September 2026",
    label: "September 2026 Invoice",
    vacation: false,
  },
  {
    id: "oct",
    name: "October 2026",
    label: "October 2026 Invoice",
    vacation: false,
  },
  {
    id: "nov",
    name: "November 2026",
    label: "November 2026 Invoice",
    vacation: false,
  },
  {
    id: "dec",
    name: "December 2026",
    label: "December 2026 Invoice",
    vacation: true,
    vacationType: "WINTER",
  },
  {
    id: "jan",
    name: "January 2027",
    label: "January 2027 Invoice",
    vacation: false,
  },
  {
    id: "feb",
    name: "February 2027",
    label: "February 2027 Invoice",
    vacation: false,
  },
  {
    id: "mar",
    name: "March 2027",
    label: "March 2027 Invoice",
    vacation: false,
  },
];

const TABS = [
  { id: "dashboard", label: "Collection Dashboard" },
  { id: "feeHeads", label: "Fee Heads" },
  { id: "structure", label: "Fee Structure" },
  { id: "adjustments", label: "Student Adjustments" },
  { id: "demand", label: "Demand Generation" },
  { id: "receipts", label: "Receipts" },
  { id: "reports", label: "Reports" },
];

const STAGE_ORDER = [
  "foundation",
  "primary",
  "middle",
  "secondary",
  "senior_secondary",
];
const STAGE_LABEL = {
  foundation: "Foundation (Nursery–UKG)",
  primary: "Primary (Class 1–5)",
  middle: "Middle (Class 6–8)",
  secondary: "Secondary (Class 9–10)",
  senior_secondary: "Senior Secondary (Class 11–12)",
};

// ─── FeeHeadsTab component ────────────────────────────────────────────────
function FeeHeadsTab() {
  const [feeHeads, setFeeHeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newHeadName, setNewHeadName] = useState("");
  const [expandedConfigId, setExpandedConfigId] = useState(null);
  const provider = getDataProvider();

  const loadHeads = useCallback(async () => {
    setLoading(true);
    const heads = await provider.getFeeHeads();
    setFeeHeads(heads.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
    setLoading(false);
  }, [provider]);

  useEffect(() => {
    loadHeads();
  }, [loadHeads]);

  const handleAdd = async () => {
    if (!newHeadName.trim()) return;
    await provider.createFeeHead({
      name: newHeadName.trim(),
      active: true,
      displayOrder: feeHeads.length + 1
    });
    setNewHeadName("");
    setIsAdding(false);
    loadHeads();
  };

  const handleToggleActive = async (id, currentStatus) => {
    await provider.updateFeeHead(id, { active: !currentStatus });
    loadHeads();
  };

  const handleDelete = async (id) => {
    // Check if unused
    const structures = await provider.getFeeStructures();
    const isUsed = structures.some(fs => fs.feeHeads?.some(h => h.id === id || h.headId === id));
    
    if (isUsed) {
      alert("Cannot delete this fee head because it is currently used in one or more fee structures.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this fee head?")) {
      await provider.deleteFeeHead(id);
      loadHeads();
    }
  };

  const handleUpdateName = async (id, newName) => {
    if (!newName.trim()) return;
    await provider.updateFeeHead(id, { name: newName.trim() });
    loadHeads();
  };

  const handleUpdateConfig = async (id, field, value) => {
    await provider.updateFeeHead(id, { [field]: value });
    loadHeads();
  };

  const moveOrder = async (index, direction) => {
    if (direction === -1 && index === 0) return;
    if (direction === 1 && index === feeHeads.length - 1) return;
    
    const newHeads = [...feeHeads];
    const temp = newHeads[index];
    newHeads[index] = newHeads[index + direction];
    newHeads[index + direction] = temp;
    
    await Promise.all(newHeads.map((h, i) => provider.updateFeeHead(h.id, { displayOrder: i + 1 })));
    loadHeads();
  };

  if (loading) return <div className="p-8 text-center text-slate-400 font-bold">Loading Fee Heads...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border-2 border-slate-100">
        <div>
          <h3 className="text-sm font-black text-[#03045e]">Fee Heads Configuration</h3>
          <p className="text-xs text-slate-400 font-bold mt-1">Manage global fee categories and visibility.</p>
        </div>
        <PermissionGate moduleId="admin_fees" permission="edit" mode="hidden">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="bg-[#03045e] text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-[#020344] transition-colors flex items-center gap-2"
          >
            {isAdding ? <X size={14} /> : <Plus size={14} />}
            {isAdding ? "Cancel" : "Add Fee Head"}
          </button>
        </PermissionGate>
      </div>

      {isAdding && (
        <div className="bg-sky-50 border-2 border-[#0077b6] p-4 rounded-xl flex items-center gap-3">
          <input
            type="text"
            placeholder="e.g. Robotics Lab Fee"
            value={newHeadName}
            onChange={(e) => setNewHeadName(e.target.value)}
            className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold focus:outline-none focus:border-[#0077b6]"
            autoFocus
          />
          <button
            onClick={handleAdd}
            disabled={!newHeadName.trim()}
            className="bg-[#0077b6] text-white px-5 py-2 rounded-lg text-xs font-black disabled:opacity-50"
          >
            Create
          </button>
        </div>
      )}

      <div className="bg-white border-2 border-slate-100 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b-2 border-slate-100">
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider w-16 text-center">Order</th>
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Fee Head Name</th>
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">Status</th>
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {feeHeads.map((h, i) => (
              <React.Fragment key={h.id}>
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-4">
                  <PermissionGate moduleId="admin_fees" permission="edit" mode="disabled">
                    <div className="flex flex-col items-center gap-1 text-slate-300">
                      <button onClick={() => moveOrder(i, -1)} disabled={i === 0} className="hover:text-[#0077b6] disabled:opacity-30"><ArrowUp size={14}/></button>
                      <button onClick={() => moveOrder(i, 1)} disabled={i === feeHeads.length - 1} className="hover:text-[#0077b6] disabled:opacity-30"><ArrowDown size={14}/></button>
                    </div>
                  </PermissionGate>
                </td>
                <td className="px-5 py-4">
                  <PermissionGate moduleId="admin_fees" permission="edit" mode="disabled">
                    <input
                      type="text"
                      defaultValue={h.name}
                      onBlur={(e) => handleUpdateName(h.id, e.target.value)}
                      className="bg-transparent font-bold text-[#03045e] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0077b6]/20 rounded px-2 py-1 -ml-2 w-full"
                    />
                  </PermissionGate>
                </td>
                <td className="px-5 py-4 text-center">
                  <PermissionGate moduleId="admin_fees" permission="edit" mode="disabled">
                    <button
                      onClick={() => handleToggleActive(h.id, h.active)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-colors ${h.active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}
                    >
                      {h.active ? "Active" : "Disabled"}
                    </button>
                  </PermissionGate>
                </td>
                <td className="px-5 py-4 text-right">
                  <PermissionGate moduleId="admin_fees" permission="edit" mode="hidden">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setExpandedConfigId(expandedConfigId === h.id ? null : h.id)}
                        className={`p-2 rounded-lg transition-colors ${expandedConfigId === h.id ? "bg-[#0077b6] text-white" : "text-slate-400 hover:bg-slate-100"}`}
                        title="Billing Configuration"
                      >
                        <Settings2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(h.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-2"
                        title="Delete Fee Head"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </PermissionGate>
                </td>
              </tr>
              {expandedConfigId === h.id && (
                <tr key={`config-${h.id}`} className="bg-slate-50 border-b border-slate-200">
                  <td colSpan={4} className="px-5 py-4">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Billing Frequency</label>
                        <select 
                          className="w-full text-xs font-bold text-[#03045e] bg-white border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:border-[#0077b6]"
                          value={h.billingFrequency || "MONTHLY"}
                          onChange={(e) => handleUpdateConfig(h.id, "billingFrequency", e.target.value)}
                        >
                          <option value="MONTHLY">Monthly</option>
                          <option value="QUARTERLY">Quarterly</option>
                          <option value="HALF_YEARLY">Half Yearly</option>
                          <option value="ANNUAL">Annual</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Billing Type</label>
                        <select 
                          className="w-full text-xs font-bold text-[#03045e] bg-white border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:border-[#0077b6]"
                          value={h.billingType || "RECURRING"}
                          onChange={(e) => handleUpdateConfig(h.id, "billingType", e.target.value)}
                        >
                          <option value="RECURRING">Recurring</option>
                          <option value="ONE_TIME">One-Time</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Due Day</label>
                        <input 
                          type="number"
                          min="1" max="31"
                          className="w-full text-xs font-bold text-[#03045e] bg-white border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:border-[#0077b6]"
                          value={h.dueDay || 15}
                          onChange={(e) => handleUpdateConfig(h.id, "dueDay", parseInt(e.target.value) || 15)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Vacation Behavior</label>
                        <select 
                          className="w-full text-xs font-bold text-[#03045e] bg-white border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:border-[#0077b6]"
                          value={h.vacationBehavior || "CHARGE"}
                          onChange={(e) => handleUpdateConfig(h.id, "vacationBehavior", e.target.value)}
                        >
                          <option value="CHARGE">Charge</option>
                          <option value="WAIVE">Waive</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Optional Fee</label>
                        <select 
                          className="w-full text-xs font-bold text-[#03045e] bg-white border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:border-[#0077b6]"
                          value={h.optional ? "YES" : "NO"}
                          onChange={(e) => handleUpdateConfig(h.id, "optional", e.target.value === "YES")}
                        >
                          <option value="NO">Mandatory</option>
                          <option value="YES">Optional</option>
                        </select>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
            ))}
            {feeHeads.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-sm font-bold text-slate-400">
                  No fee heads configured. Add one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── FeeStructureTab component ────────────────────────────────────────────────
// eslint-disable-next-line react/prop-types
function FeeStructureTab({ feeStructures, onSave }) {
  const [expandedStage, setExpandedStage] = useState("foundation");
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(null);
  
  const [globalFeeHeads, setGlobalFeeHeads] = useState([]);
  const [feeConfig, setFeeConfig] = useState({ vacationMonths: [] });
  const [savingConfig, setSavingConfig] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);
  const provider = getDataProvider();

  useEffect(() => {
    provider.getFeeConfiguration().then((config) => {
      setFeeConfig(config);
    });
    provider.getFeeHeads().then((heads) => {
      setGlobalFeeHeads(heads);
    });
  }, []);

  const toggleVacationMonth = (monthId) => {
    setFeeConfig((prev) => {
      const current = prev.vacationMonths || [];
      const newMonths = current.includes(monthId)
        ? current.filter((m) => m !== monthId)
        : [...current, monthId];
      return { ...prev, vacationMonths: newMonths };
    });
  };

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    await provider.updateFeeConfiguration({ vacationMonths: feeConfig.vacationMonths });
    setSavingConfig(false);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2500);
  };

  const grouped = useMemo(() => {
    const map = {};
    STAGE_ORDER.forEach((s) => {
      map[s] = [];
    });
    feeStructures.forEach((fs) => {
      if (map[fs.stage]) map[fs.stage].push(fs);
    });
    return map;
  }, [feeStructures]);

  const startEdit = (fs) => {
    setEditingId(fs.id);
    const vals = {};
    fs.feeHeads.forEach((h) => {
      vals[h.id] = String(h.annualAmount);
    });
    setEditValues(vals);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const handleSave = async (fs) => {
    setSaving(true);
    const updatedHeads = fs.feeHeads.map((h) => ({
      ...h,
      annualAmount: parseInt(editValues[h.id] || "0", 10) || 0,
    }));
    await onSave(fs.id, { feeHeads: updatedHeads });
    setSaving(false);
    setEditingId(null);
    setEditValues({});
    setSavedId(fs.id);
    setTimeout(() => setSavedId(null), 2500);
  };

  const computeAnnual = (fs, vals) =>
    fs.feeHeads.reduce(
      (sum, h) =>
        sum + (parseInt((vals || {})[h.id] ?? h.annualAmount, 10) || 0),
      0,
    );

  return (
    <div className="space-y-4">
      {/* Billing Configuration */}
      <div className="border-2 border-slate-100 rounded-2xl p-5 bg-white mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-black text-[#03045e]">Vacation & Billing Configuration</h3>
            <p className="text-xs text-slate-400 font-bold mt-1">Define global billing rules, including vacation months for automated fee adjustments.</p>
          </div>
          <PermissionGate moduleId="admin_fees" permission="edit" mode="hidden">
            <button
              onClick={handleSaveConfig}
              disabled={savingConfig || configSaved}
              className={`${
                configSaved ? "bg-emerald-600 hover:bg-emerald-700" : "bg-[#03045e] hover:bg-[#020344]"
              } text-white px-4 py-2 rounded-xl text-[10px] font-black transition-colors disabled:opacity-60 shrink-0 flex items-center justify-center gap-1.5`}
            >
              {savingConfig ? "Saving..." : configSaved ? <><Check size={12} /> Configuration Saved</> : "Save Configuration"}
            </button>
          </PermissionGate>
        </div>
        
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
          <h4 className="text-xs font-black text-[#03045e] mb-3 flex items-center gap-2">
            <Calendar size={14} className="text-[#0077b6]" />
            Select Vacation Months
          </h4>
          <div className="flex flex-wrap gap-2">
            {FEE_MONTHS.map((m) => {
              const isSelected = (feeConfig.vacationMonths || []).includes(m.id);
              return (
                <PermissionGate key={m.id} moduleId="admin_fees" permission="edit" mode="disabled">
                  <button
                    onClick={() => toggleVacationMonth(m.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-colors ${
                      isSelected 
                        ? "border-[#0077b6] bg-sky-50 text-[#0077b6]" 
                        : "border-slate-200 text-slate-400 hover:border-slate-300 bg-white"
                    }`}
                  >
                    {m.name.split(" ")[0]}
                  </button>
                </PermissionGate>
              );
            })}
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-sky-50 border border-sky-100 rounded-2xl p-4">
        <Info size={15} className="text-[#0077b6] flex-shrink-0 mt-0.5" />
        <p className="text-xs font-bold text-[#0077b6]">
          Fee amounts set here are reflected immediately in the Student & Parent
          portals. All values are annual amounts (₹). Monthly invoices are
          auto-calculated as 1/12th of each head (with vacation adjustments
          applied automatically).
        </p>
      </div>

      {STAGE_ORDER.map((stage) => {
        const rows = grouped[stage] || [];
        if (!rows.length) return null;
        const isOpen = expandedStage === stage;
        return (
          <div
            key={stage}
            className="border-2 border-slate-100 rounded-2xl overflow-hidden"
          >
            <button
              onClick={() => setExpandedStage(isOpen ? null : stage)}
              className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <span className="text-xs font-black text-[#03045e] uppercase tracking-wider">
                {STAGE_LABEL[stage]}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-400">
                  {rows.length} template{rows.length > 1 ? "s" : ""}
                </span>
                {isOpen ? (
                  <ChevronUp size={16} className="text-slate-400" />
                ) : (
                  <ChevronDown size={16} className="text-slate-400" />
                )}
              </div>
            </button>

            {isOpen && (
              <div className="divide-y divide-slate-100">
                {rows.map((fs) => {
                  const isEditing = editingId === fs.id;
                  const justSaved = savedId === fs.id;
                  const annual = isEditing
                    ? computeAnnual(fs, editValues)
                    : fs.feeHeads.reduce((s, h) => s + h.annualAmount, 0);
                  const monthly = Math.round(annual / 12);

                  return (
                    <div key={fs.id} className="px-5 py-4">
                      {/* Header row */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-sm font-black text-[#03045e]">
                            {fs.label}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                            Annual:{" "}
                            <span className="text-[#0077b6]">
                              ₹{annual.toLocaleString()}
                            </span>
                            &nbsp;·&nbsp;Monthly avg:{" "}
                            <span className="text-[#0077b6]">
                              ₹{monthly.toLocaleString()}
                            </span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {justSaved && (
                            <span className="flex items-center gap-1 text-emerald-600 text-[10px] font-black">
                              <Check size={12} /> Saved
                            </span>
                          )}
                          {isEditing ? (
                            <PermissionGate moduleId="admin_fees" permission="edit" mode="hidden">
                              <button
                                onClick={cancelEdit}
                                className="border-2 border-slate-200 text-slate-500 px-3 py-1.5 rounded-xl text-[10px] font-black hover:bg-slate-50 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSave(fs)}
                                disabled={saving}
                                className="bg-[#0077b6] hover:bg-[#0096c7] text-white px-4 py-1.5 rounded-xl text-[10px] font-black transition-colors disabled:opacity-60"
                              >
                                {saving ? "Saving…" : "Save Changes"}
                              </button>
                            </PermissionGate>
                          ) : (
                            <PermissionGate moduleId="admin_fees" permission="edit" mode="hidden">
                              <button
                                onClick={() => startEdit(fs)}
                                className="flex items-center gap-1.5 border-2 border-[#0077b6]/20 text-[#0077b6] hover:bg-[#caf0f8]/40 px-3 py-1.5 rounded-xl text-[10px] font-black transition-colors"
                              >
                                <Edit2 size={11} /> Edit Amounts
                              </button>
                            </PermissionGate>
                          )}
                        </div>
                      </div>

                      {/* Fee heads grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {fs.feeHeads.map((head) => {
                          const val = isEditing
                            ? (editValues[head.id] ?? String(head.annualAmount))
                            : String(head.annualAmount);
                          const isOneTime = !!head.applicableMonths;
                          return (
                            <div
                              key={head.id}
                              className={`rounded-xl border-2 p-3 ${
                                isEditing
                                  ? "border-[#0077b6]/30 bg-[#caf0f8]/20"
                                  : "border-slate-100 bg-white"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider leading-tight">
                                  {globalFeeHeads.find(gh => gh.id === head.id)?.name || head.label || head.id}
                                </span>
                                {isOneTime && (
                                  <span className="text-[8px] font-black text-amber-600 bg-amber-50 border border-amber-100 px-1 py-0.5 rounded uppercase">
                                    1×
                                  </span>
                                )}
                              </div>
                              {isEditing ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs font-black text-slate-400">
                                    ₹
                                  </span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={val}
                                    onChange={(e) =>
                                      setEditValues((prev) => ({
                                        ...prev,
                                        [head.id]: e.target.value,
                                      }))
                                    }
                                    className="w-full border-2 border-[#0077b6]/40 rounded-lg px-2 py-1 text-xs font-black text-[#03045e] outline-none focus:border-[#0077b6] bg-white"
                                  />
                                </div>
                              ) : (
                                <p className="text-sm font-black text-[#03045e]">
                                  ₹{head.annualAmount.toLocaleString()}
                                </p>
                              )}
                              {!isOneTime && (
                                <p className="text-[9px] text-slate-400 font-bold mt-0.5">
                                  ≈ ₹
                                  {Math.round(
                                    (isEditing
                                      ? parseInt(val || "0", 10) || 0
                                      : head.annualAmount) / 12,
                                  ).toLocaleString()}
                                  /mo
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── StudentAdjustmentsTab component ────────────────────────────────────────────────
function StudentAdjustmentsTab() {
  const [adjustments, setAdjustments] = useState([]);
  const [students, setStudents] = useState([]);
  const [feeHeads, setFeeHeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const provider = getDataProvider();
  
  const [newAdj, setNewAdj] = useState({
    studentId: "",
    feeHeadId: "",
    adjustmentType: "FULL_WAIVER",
    adjustmentValue: 0,
    reason: "",
    effectiveFrom: "",
    effectiveTo: ""
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    const [adjs, stus, heads] = await Promise.all([
      provider.getStudentFeeAdjustments(),
      provider.getStudents(),
      provider.getFeeHeads()
    ]);
    setAdjustments(adjs);
    setStudents(stus || []);
    setFeeHeads(heads || []);
    setLoading(false);
  }, [provider]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAdd = async () => {
    if (!newAdj.studentId || !newAdj.feeHeadId || !newAdj.adjustmentType) return;
    await provider.createStudentFeeAdjustment({
      ...newAdj,
      adjustmentValue: parseFloat(newAdj.adjustmentValue) || 0
    });
    setNewAdj({ studentId: "", feeHeadId: "", adjustmentType: "FULL_WAIVER", adjustmentValue: 0, reason: "", effectiveFrom: "", effectiveTo: "" });
    setIsAdding(false);
    loadData();
  };

  const handleToggleActive = async (id, currentStatus) => {
    await provider.updateStudentFeeAdjustment(id, { active: !currentStatus });
    loadData();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this adjustment?")) {
      await provider.deleteStudentFeeAdjustment(id);
      loadData();
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400 font-bold">Loading Adjustments...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border-2 border-slate-100">
        <div>
          <h3 className="text-sm font-black text-[#03045e]">Student Fee Adjustments</h3>
          <p className="text-xs text-slate-400 font-bold mt-1">Manage waivers, concessions, and discounts for specific students.</p>
        </div>
        <PermissionGate moduleId="admin_fees" permission="edit" mode="hidden">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="bg-[#03045e] text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-[#020344] transition-colors flex items-center gap-2"
          >
            {isAdding ? <X size={14} /> : <Plus size={14} />}
            {isAdding ? "Cancel" : "Add Adjustment"}
          </button>
        </PermissionGate>
      </div>

      {isAdding && (
        <div className="bg-sky-50 border-2 border-[#0077b6] p-4 rounded-xl space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select value={newAdj.studentId} onChange={e => setNewAdj({...newAdj, studentId: e.target.value})} className="border border-slate-200 rounded p-2 text-xs font-bold">
              <option value="">Select Student</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.admissionNo})</option>)}
            </select>
            <select value={newAdj.feeHeadId} onChange={e => setNewAdj({...newAdj, feeHeadId: e.target.value})} className="border border-slate-200 rounded p-2 text-xs font-bold">
              <option value="">Select Fee Head</option>
              {feeHeads.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
            <select value={newAdj.adjustmentType} onChange={e => setNewAdj({...newAdj, adjustmentType: e.target.value})} className="border border-slate-200 rounded p-2 text-xs font-bold">
              <option value="FULL_WAIVER">Full Waiver</option>
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
            </select>
            <input type="number" placeholder="Value (0 for Full Waiver)" value={newAdj.adjustmentValue} onChange={e => setNewAdj({...newAdj, adjustmentValue: e.target.value})} className="border border-slate-200 rounded p-2 text-xs font-bold" />
            <input type="text" placeholder="Reason" value={newAdj.reason} onChange={e => setNewAdj({...newAdj, reason: e.target.value})} className="border border-slate-200 rounded p-2 text-xs font-bold" />
            <div className="flex gap-2">
              <input type="date" placeholder="Valid From" value={newAdj.effectiveFrom} onChange={e => setNewAdj({...newAdj, effectiveFrom: e.target.value})} className="border border-slate-200 rounded p-2 text-xs font-bold w-full" />
              <input type="date" placeholder="Valid To" value={newAdj.effectiveTo} onChange={e => setNewAdj({...newAdj, effectiveTo: e.target.value})} className="border border-slate-200 rounded p-2 text-xs font-bold w-full" />
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={handleAdd} disabled={!newAdj.studentId || !newAdj.feeHeadId} className="bg-[#0077b6] text-white px-5 py-2 rounded-lg text-xs font-black disabled:opacity-50">Save Adjustment</button>
          </div>
        </div>
      )}

      <div className="bg-white border-2 border-slate-100 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b-2 border-slate-100">
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Student</th>
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Fee Head</th>
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Type / Value</th>
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Reason</th>
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">Status</th>
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {adjustments.map(a => {
              const stu = students.find(s => s.id === a.studentId);
              const head = feeHeads.find(h => h.id === a.feeHeadId);
              return (
                <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 text-xs font-bold text-[#03045e]">{stu ? stu.name : a.studentId}</td>
                  <td className="px-5 py-4 text-xs font-bold text-slate-600">{head ? head.name : a.feeHeadId}</td>
                  <td className="px-5 py-4 text-xs font-bold text-[#0077b6]">
                    {a.adjustmentType === "FULL_WAIVER" ? "Full Waiver" : 
                     a.adjustmentType === "PERCENTAGE" ? `${a.adjustmentValue}%` : 
                     `₹${a.adjustmentValue}`}
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500">{a.reason}</td>
                  <td className="px-5 py-4 text-center">
                    <PermissionGate moduleId="admin_fees" permission="edit" mode="disabled">
                      <button onClick={() => handleToggleActive(a.id, a.active)} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-colors ${a.active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                        {a.active ? "Active" : "Disabled"}
                      </button>
                    </PermissionGate>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <PermissionGate moduleId="admin_fees" permission="edit" mode="hidden">
                      <button onClick={() => handleDelete(a.id)} className="text-slate-300 hover:text-red-500 p-2"><Trash2 size={16} /></button>
                    </PermissionGate>
                  </td>
                </tr>
              )
            })}
            {adjustments.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-xs font-bold text-slate-400">No adjustments configured.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const FeeManagementPage = () => {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [loading, setLoading] = useState(true);

  // Edit states
  const [editFee, setEditFee] = useState(null);
  const [addFeeOpen, setAddFeeOpen] = useState(false);

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    feeId: null,
    feeLabel: "",
    warning: "",
  });

  // Toast state
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const provider = getDataProvider();
      const [allFees, allStudents, allClasses, allStructures] =
        await Promise.all([
          provider.getFees(),
          provider.getStudents(),
          provider.getClasses(),
          provider.getFeeStructures(),
        ]);
      setFees(allFees || []);
      setStudents(allStudents || []);
      setClasses(allClasses || []);
      setFeeStructures(allStructures || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFeeStructure = useCallback(async (id, updates) => {
    try {
      const provider = getDataProvider();
      const updated = await provider.updateFeeStructure(id, updates);
      setFeeStructures((prev) =>
        prev.map((fs) => (fs.id === id ? { ...fs, ...updated } : fs)),
      );
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleUpdateFee = async (formData) => {
    if (!editFee) return;
    try {
      const feeId = editFee.id;
      const total = parseFloat(editFee.totalAmount);
      const paid = parseFloat(formData.paidAmount) || 0;
      let status = "Unpaid";
      if (paid >= total) status = "Paid";
      else if (paid > 0) status = "Partially Paid";

      const provider = getDataProvider();
      await provider.updateFee(feeId, { paidAmount: paid, status });
      const updatedFees = await provider.getFees();
      setFees(updatedFees || []);
      setEditFee(null);
      setToast({
        show: true,
        message: "Payment recorded successfully",
        type: "success",
      });
    } catch (e) {
      console.error(e);
      setToast({
        show: true,
        message: "Failed to record payment",
        type: "error",
      });
    }
  };

  const handleAddFee = async (formData) => {
    try {
      const newFee = await addFee(formData);
      // Optimistic update
      setFees((prev) => [...prev, newFee]);
      setAddFeeOpen(false);
      setToast({
        show: true,
        message: "Fee record created successfully",
        type: "success",
      });
    } catch (e) {
      console.error(e);
      setToast({
        show: true,
        message: "Failed to create fee record",
        type: "error",
      });
    }
  };

  const handleDeleteClick = async (fee) => {
    const dependencies = await getFeeDependencies(fee.id);
    const warnings = [];
    if (dependencies.hasPayments)
      warnings.push("This fee has payment records.");

    setDeleteConfirm({
      isOpen: true,
      feeId: fee.id,
      feeLabel: `${fee.studentName} - ${fee.monthLabel}`,
      warning: warnings.length > 0 ? warnings.join(" ") : "",
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteFee(deleteConfirm.feeId);
      // Optimistic update (hard delete)
      setFees((prev) => prev.filter((f) => f.id !== deleteConfirm.feeId));
      setDeleteConfirm({
        isOpen: false,
        feeId: null,
        feeLabel: "",
        warning: "",
      });
      setToast({
        show: true,
        message: "Fee record deleted successfully",
        type: "success",
      });
    } catch (e) {
      console.error(e);
      setToast({
        show: true,
        message: "Failed to delete fee record",
        type: "error",
      });
    }
  };

  // Form defaults (in page, NOT separate utils file)
  const feeFormDefaults = {
    studentId: "",
    totalAmount: "0",
    paidAmount: "0",
    status: "Unpaid",
  };

  // Derive fee records with student/class info — show consolidated monthly invoices
  const resolvedFees = useMemo(() => {
    return fees.map((fee, idx) => {
      const stu = students.find((s) => s.id === fee.studentId);
      const cls = classes.find((c) => c.id === stu?.classId);
      // Mock month based on index for variety
      const month = FEE_MONTHS[idx % FEE_MONTHS.length];
      // Mock due date based on month (last day of each month)
      const dueDate = new Date();
      const monthMap = {
        apr: 3,
        may: 4,
        jun: 5,
        jul: 6,
        aug: 7,
        sep: 8,
        oct: 9,
        nov: 10,
        dec: 11,
        jan: 0,
        feb: 1,
        mar: 2,
      };
      dueDate.setMonth(
        monthMap[month.id],
        new Date(dueDate.getFullYear(), monthMap[month.id] + 1, 0).getDate(),
      );
      return {
        ...fee,
        admissionNo:
          stu?.admissionNo || `ADM${String(idx + 1).padStart(4, "0")}`,
        studentName: stu?.name || "Unknown Student",
        classLevel: cls?.level || "",
        classSection: cls?.section || "",
        classId: stu?.classId || "",
        feeHead: "Monthly Fee", // ← Consolidated
        feeHeadId: "monthly",
        month: month.name,
        monthId: month.id,
        monthLabel: month.label,
        isVacationMonth: month.vacation,
        vacationType: month.vacationType,
        dueDate: dueDate.toISOString().split("T")[0],
        balance: fee.totalAmount - fee.paidAmount,
      };
    });
  }, [fees, students, classes]);

  // Available filter options
  const availableLevels = useMemo(() => {
    const ORDER = [
      "Nursery",
      "LKG",
      "UKG",
      ...Array.from({ length: 12 }, (_, i) => String(i + 1)),
    ];
    const seen = new Set(classes.map((c) => c.level).filter(Boolean));
    return ORDER.filter((l) => seen.has(l));
  }, [classes]);

  const availableSections = useMemo(() => {
    if (!selectedLevel) return [];
    const seen = new Set();
    classes
      .filter((c) => c.level === selectedLevel)
      .forEach((c) => {
        if (c.section) seen.add(c.section);
      });
    return [...seen].sort();
  }, [classes, selectedLevel]);

  const activeFiltersCount = [
    selectedLevel,
    selectedSection,
    selectedStatus,
    selectedMonth,
  ].filter(Boolean).length;

  const filteredFees = useMemo(() => {
    return resolvedFees.filter((fee) => {
      const searchStr =
        `${fee.admissionNo} ${fee.studentName} ${LEVEL_DISPLAY(fee.classLevel)} ${fee.classSection}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchesLevel =
        selectedLevel === "" || fee.classLevel === selectedLevel;
      const matchesSection =
        selectedSection === "" || fee.classSection === selectedSection;
      const matchesStatus =
        selectedStatus === "" || fee.status === selectedStatus;
      const matchesMonth =
        selectedMonth === "" || fee.monthId === selectedMonth;
      return (
        matchesSearch &&
        matchesLevel &&
        matchesSection &&
        matchesStatus &&
        matchesMonth
      );
    });
  }, [
    resolvedFees,
    searchTerm,
    selectedLevel,
    selectedSection,
    selectedStatus,
    selectedMonth,
  ]);

  // Dashboard metrics
  const totalStudents = students.length;
  const totalExpected = fees.reduce((sum, f) => sum + f.totalAmount, 0);
  const totalCollected = fees.reduce((sum, f) => sum + f.paidAmount, 0);
  const totalPending = fees.reduce(
    (sum, f) => sum + (f.totalAmount - f.paidAmount),
    0,
  );
  const collectionPercent =
    totalExpected > 0
      ? ((totalCollected / totalExpected) * 100).toFixed(1)
      : "0.0";

  // Component-level analytics (no service, read-only derivation)
  const analytics = useMemo(() => {
    const paidFees = fees.filter((f) => f.status === "Paid");
    const pendingFees = fees.filter((f) => f.status !== "Paid");
    const overdueFees = fees.filter((f) => f.status === "Overdue");

    // Status distribution
    const statusCounts = fees.reduce((acc, f) => {
      acc[f.status] = (acc[f.status] || 0) + 1;
      return acc;
    }, {});

    // Month distribution
    const monthCounts = fees.reduce((acc, f) => {
      acc[f.monthId] = (acc[f.monthId] || 0) + 1;
      return acc;
    }, {});

    // Class level distribution
    const levelCounts = fees.reduce((acc, f) => {
      acc[f.classLevel] = (acc[f.classLevel] || 0) + 1;
      return acc;
    }, {});

    return {
      total: fees.length,
      paid: paidFees.length,
      pending: pendingFees.length,
      overdue: overdueFees.length,
      totalExpected,
      totalCollected,
      totalPending,
      collectionRate: parseFloat(collectionPercent),
      statusCounts,
      monthCounts,
      levelCounts,
    };
  }, [fees, collectionPercent, totalCollected, totalExpected, totalPending]);



  const feeFields = [
    {
      name: "paidAmount",
      label: "Amount Paid (₹)",
      type: "text",
      required: true,
    },
  ];

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 pb-12"
      >
        <AdminPageHeader
          title="Fee Management"
          description="Manage fee structure, generate demand, track collections, and issue receipts."
          breadcrumbs={["Admin Portal", "Finance", "Fee Management"]}
        />
        <div className="grid grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <LoadingSkeleton variant="stat-card" />
          <LoadingSkeleton variant="stat-card" />
          <LoadingSkeleton variant="stat-card" />
        </div>
        <AdminSectionCard>
          <LoadingSkeleton variant="table-row" count={5} />
        </AdminSectionCard>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      <AdminPageHeader
        title="Fee Management"
        description="Manage fee structure, generate demand, track collections, and issue receipts."
        breadcrumbs={["Admin Portal", "Finance", "Fee Management"]}
        actionButton={
          <PermissionGate moduleId="admin_fees" permission="create" mode="hidden">
            <button
              onClick={() => setAddFeeOpen(true)}
              className="flex items-center gap-2 bg-[#0077b6] hover:bg-[#0096c7] text-white px-5 py-2.5 rounded-2xl shadow-sm text-xs font-black transition-colors"
            >
              <IndianRupee size={16} />
              <span>ADD FEE RECORD</span>
            </button>
          </PermissionGate>
        }
      />

      <PageAuthorityBanner moduleId="admin_fees" moduleName="Fee Management" />

      {/* Toast Notification */}
      <ToastNotification
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-t-xl text-xs font-black transition-all ${
              activeTab === tab.id
                ? "bg-[#0077b6] text-white"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "dashboard" && (
        <>
          {/* Collection Dashboard Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white border-2 border-slate-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-[#0077b6]" />
                <span className="text-[10px] font-black text-slate-500 uppercase">
                  Total Students
                </span>
              </div>
              <p className="text-2xl font-black text-[#03045e]">
                {totalStudents}
              </p>
            </div>
            <div className="bg-white border-2 border-slate-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <IndianRupee size={16} className="text-emerald-600" />
                <span className="text-[10px] font-black text-slate-500 uppercase">
                  Collected
                </span>
              </div>
              <p className="text-2xl font-black text-emerald-600">
                ₹{analytics.totalCollected.toLocaleString()}
              </p>
            </div>
            <div className="bg-white border-2 border-slate-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={16} className="text-rose-600" />
                <span className="text-[10px] font-black text-slate-500 uppercase">
                  Pending
                </span>
              </div>
              <p className="text-2xl font-black text-rose-600">
                ₹{analytics.totalPending.toLocaleString()}
              </p>
            </div>
            <div className="bg-white border-2 border-slate-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-[#0077b6]" />
                <span className="text-[10px] font-black text-slate-500 uppercase">
                  Collection %
                </span>
              </div>
              <p className="text-2xl font-black text-[#0077b6]">
                {analytics.collectionRate}%
              </p>
            </div>
            <div className="bg-white border-2 border-slate-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={16} className="text-amber-600" />
                <span className="text-[10px] font-black text-slate-500 uppercase">
                  Defaulters
                </span>
              </div>
              <p className="text-2xl font-black text-amber-600">
                {analytics.pending}
              </p>
            </div>
          </div>



          {/* Fee Collection Table */}
          <AdminSectionCard>
            <OperationsFilterBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Search by admission no or student name..."
              filterSlots={
                <div className="flex flex-wrap gap-2">
                  <select
                    value={selectedLevel}
                    onChange={(e) => {
                      setSelectedLevel(e.target.value);
                      setSelectedSection("");
                    }}
                    className="border-2 border-[#03045e]/10 hover:border-[#0077b6] px-3 py-2 rounded-2xl text-xs font-black text-[#03045e] transition-colors bg-white outline-none min-w-[100px]"
                  >
                    <option value="">All Classes</option>
                    {availableLevels.map((l) => (
                      <option key={l} value={l}>
                        {LEVEL_DISPLAY(l)}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    disabled={!selectedLevel}
                    className="border-2 border-[#03045e]/10 hover:border-[#0077b6] px-3 py-2 rounded-2xl text-xs font-black text-[#03045e] transition-colors bg-white outline-none min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">All Sections</option>
                    {availableSections.map((s) => (
                      <option key={s} value={s}>
                        Section {s}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="border-2 border-[#03045e]/10 hover:border-[#0077b6] px-3 py-2 rounded-2xl text-xs font-black text-[#03045e] transition-colors bg-white outline-none min-w-[120px]"
                  >
                    <option value="">All Months</option>
                    {FEE_MONTHS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="border-2 border-[#03045e]/10 hover:border-[#0077b6] px-3 py-2 rounded-2xl text-xs font-black text-[#03045e] transition-colors bg-white outline-none min-w-[110px]"
                  >
                    <option value="">All Status</option>
                    <option value="Paid">Paid</option>
                    <option value="Partially Paid">Partial</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={() => {
                        setSelectedLevel("");
                        setSelectedSection("");
                        setSelectedStatus("");
                        setSelectedMonth("");
                        setSearchTerm("");
                      }}
                      className="flex items-center gap-1 border-2 border-rose-200 text-rose-500 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-2xl text-xs font-black transition-colors"
                    >
                      <X size={11} /> Clear ({activeFiltersCount})
                    </button>
                  )}
                </div>
              }
            />

            <div className="mt-6">
              <AdminDataTable
                headers={[
                  "Adm No",
                  "Student Name",
                  "Class",
                  "Section",
                  "Fee Head",
                  "Month",
                  "Due Date",
                  "Total (₹)",
                  "Paid (₹)",
                  "Balance (₹)",
                  "Status",
                  "Actions",
                ]}
                items={filteredFees}
                isEmpty={filteredFees.length === 0}
                emptyTitle="No fee records found matching filters"
                renderRow={(fee, index) => (
                  <tr
                    key={fee.id || `${fee.studentId}-${index}`}
                    className="hover:bg-slate-50 transition-colors text-xs text-gray-700 font-bold border-b border-slate-100"
                  >
                    <td className="py-3 px-2 text-[#03045e] font-black first:pl-2">
                      {fee.admissionNo}
                    </td>
                    <td className="py-3 px-2 text-gray-800 font-extrabold">
                      {fee.studentName}
                    </td>
                    <td className="py-3 px-2 text-[#03045e] font-black">
                      {LEVEL_DISPLAY(fee.classLevel)}
                    </td>
                    <td className="py-3 px-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-sky-50 border border-sky-100 text-[#0077b6] text-[9px] font-black">
                        Section {fee.classSection}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-slate-600">{fee.feeHead}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-600">{fee.month}</span>
                        {fee.isVacationMonth && (
                          <span
                            className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                              fee.vacationType === "SUMMER"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : "bg-amber-50 text-amber-600 border border-amber-100"
                            }`}
                          >
                            {fee.vacationType === "SUMMER"
                              ? "Summer"
                              : "Winter"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-slate-500">{fee.dueDate}</td>
                    <td className="py-3 px-2 text-right font-black">
                      {(fee.totalAmount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-right text-emerald-600 font-black">
                      {(fee.paidAmount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-right text-rose-600 font-black">
                      {(fee.balance || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-2">
                      <StatusBadge status={fee.status} />
                    </td>
                    <td className="py-3 px-2 text-right last:pr-2">
                      <div className="flex items-center justify-end gap-1">
                        <PermissionGate moduleId="admin_fees" permission="create" mode="hidden">
                          <button
                            onClick={() => setEditFee(fee)}
                            className="text-[#0077b6] hover:text-[#03045e] bg-[#caf0f8]/40 px-2 py-1 rounded-lg text-[9px] font-black"
                            title="Record Payment"
                          >
                            PAY
                          </button>
                        </PermissionGate>
                        <PermissionGate moduleId="admin_fees" permission="delete" mode="hidden">
                          <button
                            onClick={() => handleDeleteClick(fee)}
                            className="text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded-lg text-[9px] font-black"
                            title="Delete Fee Record"
                          >
                            <X size={11} />
                          </button>
                        </PermissionGate>
                        <button
                          className="text-amber-600 hover:text-amber-700 bg-amber-50 px-2 py-1 rounded-lg text-[9px] font-black"
                          title="Send SMS"
                        >
                          <Send size={11} />
                        </button>
                        <button
                          className="text-slate-600 hover:text-slate-700 bg-slate-100 px-2 py-1 rounded-lg text-[9px] font-black"
                          title="Print Receipt"
                        >
                          <Printer size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              />
            </div>
          </AdminSectionCard>
        </>
      )}

      {activeTab === "feeHeads" && (
        <motion.div
          key="feeHeads"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <FeeHeadsTab />
        </motion.div>
      )}

      {activeTab === "structure" && (
        <AdminSectionCard>
          <FeeStructureTab
            feeStructures={feeStructures}
            onSave={handleSaveFeeStructure}
          />
        </AdminSectionCard>
      )}

      {activeTab === "adjustments" && (
        <motion.div
          key="adjustments"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <StudentAdjustmentsTab />
        </motion.div>
      )}

      {/* Add Fee Modal */}
      <AdminEditForm
        isOpen={addFeeOpen}
        onClose={() => setAddFeeOpen(false)}
        title="Add Fee Record"
        data={feeFormDefaults}
        fields={[
          {
            name: "studentId",
            label: "Student",
            type: "select",
            options: students.map((s) => s.id),
            required: true,
          },
          {
            name: "totalAmount",
            label: "Total Amount (₹)",
            type: "text",
            required: true,
          },
          { name: "paidAmount", label: "Paid Amount (₹)", type: "text" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: ["Unpaid", "Partially Paid", "Paid"],
          },
        ]}
        onSubmit={handleAddFee}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Fee Record"
        message={`Are you sure you want to delete ${deleteConfirm.feeLabel}? This action cannot be undone.`}
        warningText={deleteConfirm.warning}
        onConfirm={handleDeleteConfirm}
        onCancel={() =>
          setDeleteConfirm({
            isOpen: false,
            feeId: null,
            feeLabel: "",
            warning: "",
          })
        }
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
      />

      {activeTab === "demand" && (
        <AdminSectionCard>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider">
              Generate Fee Demand
            </h3>
            <PermissionGate moduleId="admin_fees" permission="bulk" mode="hidden">
              <button className="bg-[#0077b6] hover:bg-[#0096c7] text-white px-4 py-2 rounded-xl text-xs font-black transition-colors flex items-center gap-2">
                <FileText size={14} /> Generate Demand
              </button>
            </PermissionGate>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">
                Select Month
              </label>
              <select className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-[#0077b6]">
                {FEE_MONTHS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">
                Select Class
              </label>
              <select className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-[#0077b6]">
                <option value="">All Classes</option>
                {availableLevels.map((l) => (
                  <option key={l} value={l}>
                    {LEVEL_DISPLAY(l)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </AdminSectionCard>
      )}

      {activeTab === "receipts" && (
        <AdminSectionCard>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider">
              Recent Receipts
            </h3>
            <PermissionGate moduleId="admin_fees" permission="bulk" mode="hidden">
              <button className="border-2 border-slate-200 hover:border-[#0077b6] text-slate-700 px-4 py-2 rounded-xl text-xs font-black transition-colors flex items-center gap-2">
                <Download size={14} /> Export All
              </button>
            </PermissionGate>
          </div>
          <div className="text-center py-12 text-slate-400 text-xs font-semibold">
            No receipts generated yet. Use the Collection Dashboard to record
            payments.
          </div>
        </AdminSectionCard>
      )}

      {activeTab === "reports" && (
        <AdminSectionCard>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider">
              Fee Reports
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              {
                title: "Collection Report",
                desc: "Daily/Weekly/Monthly collection summary",
                icon: TrendingUp,
              },
              {
                title: "Defaulters Report",
                desc: "List of students with pending dues",
                icon: AlertCircle,
              },
              {
                title: "Class-wise Report",
                desc: "Fee collection by class and section",
                icon: Users,
              },
            ].map((report, idx) => (
              <button
                key={idx}
                className="border-2 border-slate-100 hover:border-[#0077b6] rounded-xl p-4 text-left transition-colors group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-[#0077b6]/10 transition-colors">
                    <report.icon
                      size={18}
                      className="text-slate-600 group-hover:text-[#0077b6]"
                    />
                  </div>
                  <span className="text-xs font-black text-[#03045e]">
                    {report.title}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">{report.desc}</p>
              </button>
            ))}
          </div>
        </AdminSectionCard>
      )}

      {/* Payment Modal */}
      <AdminEditForm
        isOpen={!!editFee}
        onClose={() => setEditFee(null)}
        title="Record Fee Payment"
        data={editFee}
        fields={feeFields}
        onSubmit={handleUpdateFee}
      />
    </motion.div>
  );
};

export default FeeManagementPage;
