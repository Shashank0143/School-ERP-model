import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ClipboardEdit,
  BookOpen,
  CalendarClock,
  BookCheck,
  WalletCards,
  Bus,
  Palette,
  HeartHandshake,
  FolderOpen,
  Trophy,
  BadgeCheck,
  CalendarDays,
  Palmtree,
  LifeBuoy,
  UserCircle,
  LogOut,
  CheckSquare,
  FileQuestion,
  LineChart,
  Megaphone,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  CalendarRange,
  GraduationCap,
  FileMinus,
  Scale,
  Award
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

const iconMap = {
  LayoutDashboard,
  ClipboardEdit,
  BookOpen,
  CalendarClock,
  BookCheck,
  WalletCards,
  Bus,
  Palette,
  HeartHandshake,
  FolderOpen,
  Trophy,
  BadgeCheck,
  CalendarDays,
  Palmtree,
  LifeBuoy,
  UserCircle,
  LogOut,
  CheckSquare,
  FileQuestion,
  LineChart,
  Megaphone,
  CalendarRange,
  FileMinus,
  Scale,
  Award
};

const backdropVariants = {
  closed: { opacity: 0 },
  open: { opacity: 1 },
};
const drawerVariants = {
  closed: { x: "-100%" },
  open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
};

// ── Single nav item ───────────────────────────────────────────────────────────
const NavItem = React.memo(function NavItem({ item, onClick, isCollapsed, isMobileDrawer }) {
  const { t } = useLanguage();
  const IconComponent = iconMap[item.icon] || LayoutDashboard;
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onClick={() => onClick && onClick(item)}
        onMouseEnter={() => (isCollapsed || (!isMobileDrawer && window.innerWidth >= 768 && window.innerWidth < 1024)) && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`
          w-full flex items-center rounded-xl text-left transition-colors duration-200 font-medium text-sm
          ${isMobileDrawer 
             ? "gap-3 px-4 py-3" 
             : isCollapsed 
                ? "justify-center px-0 py-3" 
                : "justify-center lg:justify-start px-0 lg:px-4 py-3 lg:gap-3"
          }
          ${
            item.active
              ? "bg-[#caf0f8] text-[#03045e] font-bold border-l-4 border-[#03045e]"
              : "text-white/70 hover:bg-white/10 hover:text-white border-l-4 border-transparent"
          }
        `}
        aria-label={item.label}
      >
        <IconComponent
          size={20}
          className={item.active ? "text-[#03045e]" : "text-white/60"}
          aria-hidden="true"
        />
        {/* Label — hidden when collapsed or on tablet */}
        {isMobileDrawer ? (
          <span className="truncate overflow-hidden whitespace-nowrap">
            {item.label}
          </span>
        ) : (
          <span className={`truncate overflow-hidden whitespace-nowrap ${isCollapsed ? "hidden" : "hidden lg:block"}`}>
            {item.label}
          </span>
        )}
      </motion.button>

      {/* Tooltip — only in collapsed mode or tablet */}
      <AnimatePresence>
        {(isCollapsed || (!isMobileDrawer && showTooltip)) && showTooltip && (
          <motion.div
            key="tooltip"
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 pointer-events-none hidden md:block"
          >
            <div
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shadow-lg"
              style={{
                backgroundColor: "#03045e",
                color: "#caf0f8",
                border: "1px solid rgba(202,240,248,0.2)",
              }}
            >
              {item.label}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// ── Shared sidebar content ────────────────────────────────────────────────────
const SidebarContent = React.memo(function SidebarContent({
  navItems,
  onNavClick,
  isCollapsed,
  onToggleCollapse,
  isMobileDrawer = false,
}) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col h-full">
      {/* Logo + collapse toggle */}
      <div
        className={`flex items-center border-b border-white/10 ${
          isMobileDrawer 
             ? "gap-3 px-5 py-6" 
             : isCollapsed 
                ? "justify-center px-2 py-5" 
                : "justify-center lg:justify-start px-2 lg:px-5 py-5 lg:py-6 lg:gap-3"
        }`}
      >
        {/* Icon always visible */}
        <div className="w-10 h-10 bg-[#caf0f8] rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
          <GraduationCap
            size={22}
            className="text-[#03045e]"
            aria-hidden="true"
          />
        </div>

        {/* Text — hidden when collapsed or on tablet */}
        {isMobileDrawer ? (
          <div className="overflow-hidden">
            <h1 className="text-xl font-black text-white leading-tight whitespace-nowrap">
              EduDash
            </h1>
            <p className="text-xs text-white/50 font-medium whitespace-nowrap">
              {t("school.portal")}
            </p>
          </div>
        ) : (
          <div className={`overflow-hidden ${isCollapsed ? "hidden" : "hidden lg:block"}`}>
            <h1 className="text-xl font-black text-white leading-tight whitespace-nowrap">
              EduDash
            </h1>
            <p className="text-xs text-white/50 font-medium whitespace-nowrap">
              {t("school.portal")}
            </p>
          </div>
        )}

        {/* Collapse toggle — desktop only */}
        {onToggleCollapse && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleCollapse}
            className={`flex-shrink-0 w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 items-center justify-center text-white/70 hover:text-white transition-colors hidden lg:flex ${
              isCollapsed ? "mt-0" : "ml-auto"
            }`}
            aria-label={isCollapsed ? t("sidebar.expand") : t("sidebar.collapse")}
          >
            {isCollapsed ? (
              <ChevronRight size={14} />
            ) : (
              <ChevronLeft size={14} />
            )}
          </motion.button>
        )}
      </div>

      {/* Nav items */}
      <nav
        className={`sidebar-nav flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-1 ${isMobileDrawer ? "px-3" : isCollapsed ? "px-2" : "px-2 lg:px-3"}`}
        aria-label={t("common.mainNav") || "Main navigation"}
      >
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            onClick={onNavClick}
            isCollapsed={isCollapsed}
            isMobileDrawer={isMobileDrawer}
          />
        ))}
      </nav>

    </div>
  );
});


// ── Main Sidebar component ────────────────────────────────────────────────────
function Sidebar({ navItems = [], student, openRef, onNavClick, onCollapse }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useLanguage();
  const { logout } = useAuth();

  React.useEffect(() => {
    if (openRef) openRef.current = () => setIsMobileOpen(true);
  }, [openRef]);

  const handleNavClick = (item) => {
    setIsMobileOpen(false);
    if (item.id === "logout") {
      logout();
      return;
    }
    if (onNavClick) onNavClick(item);
  };

  const handleToggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    if (onCollapse) onCollapse(next);
  };

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className={`hidden md:flex flex-col flex-shrink-0 fixed left-0 top-0 h-full z-30 shadow-xl overflow-hidden transition-[width] duration-300 w-16 ${isCollapsed ? "lg:w-16" : "lg:w-60"}`}
        style={{ backgroundColor: "#03045e" }}
        aria-label={t("common.sidebarNav") || "Sidebar navigation"}
      >
        <SidebarContent
          navItems={navItems}
          onNavClick={handleNavClick}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
          isMobileDrawer={false}
        />
      </aside>

      {/* ── Mobile hamburger (shown by Header on mobile, but keep as fallback) ── */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
        style={{ color: "#03045e" }}
        onClick={() => setIsMobileOpen(true)}
        aria-label={t("sidebar.open")}
      >
        <Menu size={22} />
      </button>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 bg-black/40 z-40"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />
        )}
        {isMobileOpen && (
          <motion.div
            key="drawer"
            variants={drawerVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="md:hidden fixed left-0 top-0 h-full w-72 shadow-2xl z-50 flex flex-col"
            style={{ backgroundColor: "#03045e" }}
          >
            <button
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              onClick={() => setIsMobileOpen(false)}
              aria-label={t("sidebar.close")}
            >
              <X size={16} />
            </button>
            {/* Mobile drawer always shows full labels, no collapse toggle */}
            <SidebarContent
              navItems={navItems}
              onNavClick={handleNavClick}
              isCollapsed={false}
              onToggleCollapse={null}
              isMobileDrawer={true}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Sidebar;
