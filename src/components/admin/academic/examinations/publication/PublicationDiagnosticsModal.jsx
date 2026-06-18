import React from "react";
import { X, ShieldAlert, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";

export default function PublicationDiagnosticsModal({
  isOpen,
  onClose,
  diagnostics,
  onConfirmPublication,
}) {
  if (!isOpen) return null;

  const hasErrors = diagnostics.errors.length > 0;
  const hasWarnings = diagnostics.warnings.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4">
      <div className="w-full w-[95vw] md:w-[90vw] lg:max-w-2xl bg-white rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:bg-slate-50 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="space-y-6">
          <div className="flex gap-3 items-center">
            <div className="p-2.5 bg-rose-50 text-rose-500 rounded-2xl border border-rose-100 shrink-0">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h3 className="text-base font-black text-[#03045e] uppercase tracking-wider">
                Publication Precondition Diagnostics
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                Stateless validation engine results before declaration
              </p>
            </div>
          </div>

          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
            {/* Critical Errors Block */}
            {hasErrors && (
              <div className="space-y-2">
                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest block">
                  Critical Diagnostics Blocks ({diagnostics.errors.length})
                </span>
                <div className="space-y-2">
                  {diagnostics.errors.map((err, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-rose-50 border border-rose-150 text-rose-700 text-xs font-bold rounded-2xl flex gap-2.5 items-start"
                    >
                      <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-600" />
                      <span>{err.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings Block */}
            {hasWarnings && (
              <div className="space-y-2">
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest block">
                  Pedagogical Spacing & Performance Warnings ({diagnostics.warnings.length})
                </span>
                <div className="space-y-2">
                  {diagnostics.warnings.map((warn, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-amber-50 border border-amber-150 text-amber-700 text-xs font-bold rounded-2xl flex gap-2.5 items-start"
                    >
                      <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-500" />
                      <span>{warn.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!hasErrors && !hasWarnings && (
              <div className="p-6 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-3xl text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle size={18} />
                </div>
                <strong className="text-xs font-black uppercase tracking-wider block mt-2">
                  All Preconditions Met Successfully
                </strong>
                <p className="text-[10px] text-gray-500 font-semibold leading-relaxed max-w-xs mx-auto">
                  Stateless validation reports a clean audit. Results are ready for declaration.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-6 border-t border-gray-50 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-150 hover:bg-slate-50 text-slate-500 rounded-xl font-black text-xs uppercase tracking-wider transition-colors"
          >
            Cancel
          </button>
          
          <button
            disabled={hasErrors}
            onClick={onConfirmPublication}
            className="flex-1 py-3 bg-[#03045e] hover:bg-[#023e8a] text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-1.5"
          >
            <CheckCircle size={14} />
            <span>{hasWarnings ? "OVERRIDE & PUBLISH" : "APPROVE & DECLARE"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
