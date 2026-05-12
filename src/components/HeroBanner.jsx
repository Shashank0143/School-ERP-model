import React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";

// FIX: variants defined outside component — stable references, never recreated
const heroVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const titleVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.08, duration: 0.4, ease: "easeOut" },
  },
};

function HeroBanner({ student }) {
  const { t } = useLanguage();
  return (
    <motion.div
      variants={heroVariants}
      initial="hidden"
      animate="visible"
      className="relative w-full rounded-3xl overflow-hidden shadow-xl mb-6"
      style={{ minHeight: "90px" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #03045e 0%, #0077b6 50%, #00b4d8 100%)",
        }}
        aria-hidden="true"
      />

      {/* Radial glow overlay — static, no animation */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            "radial-gradient(ellipse at 30% 50%, rgba(202,240,248,0.5) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 px-6 md:px-10 py-7">
        <motion.div
          variants={titleVariants}
          initial="hidden"
          animate="visible"
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight">
            {t("hero.welcome")}, {student?.name || "Student"}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="text-xs md:text-sm font-extrabold text-white/90 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-md">
              {student?.enrollmentNo}
            </span>
            <span className="text-xs md:text-sm font-bold text-white/70">
              {student?.email}
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default HeroBanner;
