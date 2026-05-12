import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

// ── Inline language toggle ────────────────────────────────────────────────────
// NOTE: No layoutId animation here — layoutId caused Framer Motion lifecycle
// conflicts when the parent re-rendered during the popup exit animation.
function PopupLangToggle({ popupLang, setPopupLang }) {
  return (
    <div
      className="flex items-center rounded-full p-0.5 border gap-0.5"
      style={{ backgroundColor: "#caf0f8", borderColor: "#00b4d8" }}
      role="group"
      aria-label="Popup language selector"
    >
      {["en", "hi"].map((opt) => {
        const isActive = popupLang === opt;
        return (
          <button
            key={opt}
            onClick={() => setPopupLang(opt)}
            className="relative px-2.5 py-1 rounded-full text-[11px] font-extrabold transition-colors focus:outline-none"
            style={{
              backgroundColor: isActive ? "#03045e" : "transparent",
              color: isActive ? "#caf0f8" : "#03045e",
              transition: "background-color 0.18s ease, color 0.18s ease",
            }}
            aria-pressed={isActive}
            aria-label={opt === "en" ? "English" : "हिन्दी"}
          >
            {opt === "en" ? "EN" : "हि"}
          </button>
        );
      })}
    </div>
  );
}

// ── Mascot SVG ────────────────────────────────────────────────────────────────
function HelperMascot() {
  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-md"
      style={{ backgroundColor: "#03045e" }}
      aria-hidden="true"
    >
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="12" fill="#caf0f8" />
        <circle cx="10" cy="12" r="2" fill="#03045e" />
        <circle cx="18" cy="12" r="2" fill="#03045e" />
        <circle cx="11" cy="11" r="0.8" fill="white" />
        <circle cx="19" cy="11" r="0.8" fill="white" />
        <path
          d="M9.5 17 Q14 21 18.5 17"
          stroke="#03045e"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
        <rect x="8" y="5" width="12" height="3" rx="1" fill="#0077b6" />
        <polygon points="14,3 8,5 20,5" fill="#0077b6" />
        <line
          x1="20"
          y1="5"
          x2="22"
          y2="8"
          stroke="#00b4d8"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="22" cy="8.5" r="1" fill="#00b4d8" />
      </svg>
    </div>
  );
}

// ── Color legend row ──────────────────────────────────────────────────────────
function ColorLegend({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-col gap-2 mt-1">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2.5">
          <div
            className="w-3.5 h-3.5 rounded-full flex-shrink-0 mt-0.5"
            style={{ backgroundColor: item.color }}
            aria-hidden="true"
          />
          <p
            className="text-sm leading-snug font-medium"
            style={{ color: "#374151" }}
          >
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}

// ── Main HelperPopup ──────────────────────────────────────────────────────────
//
// ARCHITECTURE: "Always-mounted + CSS visibility" pattern.
//
// ROOT CAUSE OF FREEZE (solved here):
//   The previous implementation wrapped the modal in <AnimatePresence> with
//   a motion.div keyed on `titleKey`. When the user switched language inside
//   the popup, LanguageContext re-created its `t` function → AccordionSection
//   (the parent) re-rendered → HelperPopup component was unmounted and
//   remounted as a brand-new instance. AnimatePresence saw the old instance's
//   exit animation starting at the same time a new instance was mounting.
//   This race caused the exit animation to never complete, leaving a
//   `fixed inset-0 z-50` div permanently in the DOM with opacity:0 but
//   pointer-events:auto — silently intercepting every click on the page.
//
// FIX:
//   1. The modal wrapper is ALWAYS mounted (never conditionally rendered).
//      Visibility is controlled via CSS opacity + pointer-events, NOT by
//      mounting/unmounting DOM nodes. This completely eliminates the
//      AnimatePresence race condition.
//   2. Framer Motion is removed from the overlay wrapper entirely.
//      Only the modal card (inner panel) uses a lightweight motion.div
//      for the slide-up animation — and only when the popup is open.
//   3. PopupLangToggle no longer uses layoutId. A plain CSS transition
//      on background-color is used instead. layoutId was causing Framer
//      Motion's LayoutGroup to throw a "multiple elements with same id"
//      warning when multiple AccordionSections were on the same page.
//   4. Internal `popupLang` state is reset via useEffect (on isOpen → true),
//      so it always defaults to globalLang when opened fresh.
//
function HelperPopup({
  isOpen,
  onClose,
  titleKey,
  contentEn,
  contentHi,
  colorLegend,
}) {
  const { lang: globalLang, t } = useLanguage();
  // Stable internal language — independent from globalLang after open
  const [popupLang, setPopupLang] = useState(globalLang);
  const closeButtonRef = useRef(null);
  // Track whether we've ever been opened (for mount-time CSS transition)
  const hasOpenedRef = useRef(false);

  // Reset popup language to globalLang each time popup opens
  useEffect(() => {
    if (isOpen) {
      setPopupLang(globalLang);
      hasOpenedRef.current = true;
    }
  }, [isOpen]); // NOTE: intentionally NOT depending on globalLang here.
  // If the user has already switched to HI inside the popup and then the
  // global lang changes, we don't want to reset their in-popup choice.

  // Keyboard: Escape closes popup
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Focus management: move focus into popup when opened
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  const title = t(titleKey);
  const content = popupLang === "hi" ? contentHi || contentEn : contentEn;
  const legend = colorLegend?.map((item) => ({
    color: item.color,
    label: popupLang === "hi" ? item.labelHi || item.labelEn : item.labelEn,
  }));

  // ── CSS-controlled visibility ─────────────────────────────────────────────
  // The outer wrapper is always in the DOM. pointer-events:none when closed
  // guarantees it NEVER intercepts clicks regardless of opacity or animation
  // state. This is the single source of truth for interactability.
  const overlayStyle = {
    position: "fixed",
    inset: 0,
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    // CSS transitions — no JS animation involved
    opacity: isOpen ? 1 : 0,
    pointerEvents: isOpen ? "auto" : "none",
    transition: "opacity 0.18s ease",
  };

  const backdropStyle = {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
  };

  return (
    <div
      style={overlayStyle}
      role={isOpen ? "dialog" : undefined}
      aria-modal={isOpen ? "true" : undefined}
      aria-label={isOpen ? title : undefined}
      aria-hidden={!isOpen}
    >
      {/* Backdrop — click to close */}
      <div
        style={backdropStyle}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal card — Framer Motion only for the panel slide, not the overlay */}
      <motion.div
        className="relative bg-white w-full sm:max-w-sm rounded-3xl shadow-2xl overflow-hidden"
        style={{ zIndex: 10 }}
        initial={false}
        animate={
          isOpen
            ? { y: 0, opacity: 1 }
            : { y: 40, opacity: 0 }
        }
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
      >
        {/* Top accent bar */}
        <div
          className="h-1 w-full"
          style={{
            background: "linear-gradient(90deg, #03045e, #0077b6, #00b4d8)",
          }}
          aria-hidden="true"
        />

        <div className="p-5 sm:p-6">
          {/* Header row */}
          <div className="flex items-start gap-3 mb-4">
            <HelperMascot />

            <div className="flex-1 min-w-0">
              <p
                className="text-[11px] font-bold uppercase tracking-widest mb-0.5"
                style={{ color: "#0077b6" }}
              >
                {popupLang === "hi" ? "जानकारी" : "About this section"}
              </p>
              <h2
                className="text-base font-extrabold leading-snug"
                style={{ color: "#03045e" }}
              >
                {title}
              </h2>
            </div>

            {/* Language toggle */}
            <PopupLangToggle
              popupLang={popupLang}
              setPopupLang={setPopupLang}
            />

            {/* Close button */}
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1"
              style={{ backgroundColor: "#caf0f8", color: "#03045e" }}
              aria-label={t("helper.close")}
            >
              <X size={15} />
            </button>
          </div>

          {/* Divider */}
          <div
            className="h-px mb-4"
            style={{ backgroundColor: "#caf0f8" }}
            aria-hidden="true"
          />

          {/* Explanation text */}
          <p
            className="text-sm leading-relaxed font-medium mb-4"
            style={{ color: "#374151" }}
          >
            {content}
          </p>

          {/* Color legend */}
          {legend && legend.length > 0 && (
            <div
              className="rounded-2xl p-4 mb-4"
              style={{ backgroundColor: "#caf0f8" }}
            >
              <p
                className="text-[11px] font-extrabold uppercase tracking-wide mb-2.5"
                style={{ color: "#03045e" }}
              >
                {popupLang === "hi" ? "रंग का अर्थ" : "Color meaning"}
              </p>
              <ColorLegend items={legend} />
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl text-sm font-extrabold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1"
            style={{ backgroundColor: "#03045e", color: "#caf0f8" }}
          >
            {t("helper.close")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default HelperPopup;
