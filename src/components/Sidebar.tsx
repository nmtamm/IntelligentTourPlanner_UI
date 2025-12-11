import { motion } from "motion/react";
import { Edit, Eye, Settings, HelpCircle, User, LogIn } from "lucide-react";
import { useThemeColors } from "../hooks/useThemeColors";

interface SidebarProps {
  mode: "custom" | "view";
  onModeChange: (mode: "custom" | "view") => void;
  onSettingsClick: () => void;
  onUserManualClick: () => void;
  onLoginClick: () => void;
  isLoggedIn: boolean;
  currentUser: string | null;
  language: "EN" | "VI";
}

export function Sidebar({
  mode,
  onModeChange,
  onSettingsClick,
  onUserManualClick,
  onLoginClick,
  isLoggedIn,
  currentUser,
  language,
}: SidebarProps) {
  const { primary, secondary, accent, light, primaryDark, secondaryDark } = useThemeColors();
  
  const getInitials = (email: string | null) => {
    if (!email) return "?";
    return email.charAt(0).toUpperCase();
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-20 bg-gradient-to-b from-[#2D2D2D] to-[#1F1F1F] border border-[#3B3B3B] rounded-r-2xl flex flex-col items-center py-4 z-40 shadow-xl">
      {/* Top Section - Avatar Button */}
      <div className="mb-6">
        <motion.button
          onClick={onLoginClick}
          className="relative w-12 h-12 rounded-full flex items-center justify-center group overflow-hidden"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title={isLoggedIn ? currentUser || "" : language === "EN" ? "Login" : "Đăng nhập"}
        >
          {isLoggedIn ? (
            <>
              {/* Avatar with gradient background - uses primary theme color */}
              <div
                className="absolute inset-0 flex items-center justify-center text-white font-semibold rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${primary} 0%, ${primaryDark} 100%)`,
                }}
              >
                {getInitials(currentUser)}
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-1 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </>
          ) : (
            <>
              {/* User Icon for not logged in - uses secondary theme color */}
              <div
                className="absolute inset-0 flex items-center justify-center rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${secondary} 0%, ${secondaryDark} 100%)`,
                }}
              >
                <User
                  className="w-5 h-5 stroke-[2.5] text-[#1F1F1F] relative z-10"
                />
              </div>
              <div className="absolute inset-1 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </>
          )}
        </motion.button>
      </div>

      {/* Divider */}
      <div className="w-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8" />

      {/* Mode Toggle Section */}
      <div className="flex flex-col gap-3 mb-8">
        {/* Custom Mode Button */}
        <div className="flex flex-col items-center gap-1">
          <motion.button
            onClick={() => onModeChange("custom")}
            className="relative w-16 h-16 rounded-2xl flex items-center justify-center group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={language === "EN" ? "Custom Mode" : "Chế độ Tùy chỉnh"}
          >
            {/* Active Indicator */}
            {mode === "custom" && (
              <motion.div
                className="absolute inset-2 rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${secondary} 0%, ${secondaryDark} 100%)`,
                  boxShadow: `0 4px 20px ${secondary}80, inset 0 1px 2px rgba(255, 255, 255, 0.3)`,
                }}
                layoutId="activeMode"
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 28,
                }}
              />
            )}
            
            {/* Icon */}
            <Edit
              className="relative z-10 w-7 h-7 stroke-[2]"
              style={{
                color: mode === "custom" ? "#2D2D2D" : "#9CA3AF",
                transition: "color 0.2s ease",
              }}
            />
            
            {/* Hover Effect */}
            {mode !== "custom" && (
              <div className="absolute inset-2 rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </motion.button>
          <span className="text-[10px] text-gray-400">
            {language === "EN" ? "Custom" : "Tùy chỉnh"}
          </span>
        </div>

        {/* View Mode Button */}
        <div className="flex flex-col items-center gap-1">
          <motion.button
            onClick={() => onModeChange("view")}
            className="relative w-16 h-16 rounded-2xl flex items-center justify-center group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={language === "EN" ? "View Mode" : "Chế độ Xem"}
          >
            {/* Active Indicator */}
            {mode === "view" && (
              <motion.div
                className="absolute inset-2 rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${secondary} 0%, ${secondaryDark} 100%)`,
                  boxShadow: `0 4px 20px ${secondary}80, inset 0 1px 2px rgba(255, 255, 255, 0.3)`,
                }}
                layoutId="activeMode"
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 28,
                }}
              />
            )}
            
            {/* Icon */}
            <Eye
              className="relative z-10 w-7 h-7 stroke-[2]"
              style={{
                color: mode === "view" ? "#2D2D2D" : "#9CA3AF",
                transition: "color 0.2s ease",
              }}
            />
            
            {/* Hover Effect */}
            {mode !== "view" && (
              <div className="absolute inset-2 rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </motion.button>
          <span className="text-[10px] text-gray-400">
            {language === "EN" ? "View" : "Xem"}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="w-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8" />

      {/* Bottom Section - User Manual & Settings */}
      <div className="mt-auto flex flex-col gap-3">
        {/* User Manual Button */}
        <div className="flex flex-col items-center gap-1">
          <motion.button
            onClick={onUserManualClick}
            className="relative w-16 h-16 rounded-2xl flex items-center justify-center group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={language === "EN" ? "User Manual" : "Hướng dẫn"}
          >
            <HelpCircle
              className="w-7 h-7 stroke-[2] text-[#9CA3AF] transition-colors"
              style={{
                // @ts-ignore - CSS variable will work
                '--hover-color': secondary,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = secondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#9CA3AF';
              }}
            />
            <div className="absolute inset-2 rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
          <span className="text-[10px] text-gray-400">
            {language === "EN" ? "Manual" : "Hướng dẫn"}
          </span>
        </div>

        {/* Settings Button */}
        <div className="flex flex-col items-center gap-1">
          <motion.button
            onClick={onSettingsClick}
            className="relative w-16 h-16 rounded-2xl flex items-center justify-center group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={language === "EN" ? "Settings" : "Cài đặt"}
          >
            <Settings
              className="w-7 h-7 stroke-[2] text-[#9CA3AF] transition-colors"
              onMouseEnter={(e) => {
                e.currentTarget.style.color = secondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#9CA3AF';
              }}
            />
            <div className="absolute inset-2 rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
          <span className="text-[10px] text-gray-400">
            {language === "EN" ? "Settings" : "Cài đặt"}
          </span>
        </div>
      </div>
    </aside>
  );
}