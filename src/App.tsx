import { useState } from "react";
import { CustomMode } from "./components/CustomMode";
import { AuthModal } from "./components/AuthModal";
import { AccountProfile } from "./components/AccountProfile";
import { SavedPlans } from "./components/SavedPlans";
import { UserManual } from "./components/UserManual";
import { Settings } from "./components/Settings";
import { Sidebar } from "./components/Sidebar";
import { IntroScreen } from "./components/IntroScreen";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { Button } from "./components/ui/button";
import {
  LogIn,
  LogOut,
  Map,
  Globe,
  MapPinPen,
  HelpCircle,
  Edit,
  Eye,
  Settings as SettingsIcon,
} from "lucide-react";
import { DayPlan } from "./types";
import { t } from "./locales/translations";
import { motion } from "motion/react";

type Currency = "USD" | "VND";
type Language = "EN" | "VI";
type Mode = "custom" | "view";

interface UserProfile {
  username: string;
  email: string;
  password: string;
  avatar?: string;
}

function AppContent() {
  const [showIntro, setShowIntro] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAccountProfileOpen, setIsAccountProfileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(
    null,
  );
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showSavedPlans, setShowSavedPlans] = useState(false);
  const [currency, setCurrency] = useState<"USD" | "VND">(
    "USD",
  );
  const [language, setLanguage] = useState<Language>("EN");
  const [mode, setMode] = useState<Mode>("custom");
  const [tripData, setTripData] = useState<{
    name: string;
    days: DayPlan[];
  } | null>(null);
  const [currentPlanId, setCurrentPlanId] = useState<
    string | null
  >(null);
  const [isUserManualOpen, setIsUserManualOpen] = useState(false);
  const [resetViewsToDefault, setResetViewsToDefault] = useState(false);
  const [showAllDaysOnLoad, setShowAllDaysOnLoad] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Use theme hook
  const { currentTheme } = useTheme();

  const handleLogin = (email: string, username?: string, password?: string) => {
    setIsLoggedIn(true);
    setCurrentUser(email);
    
    // Create user profile
    setUserProfile({
      username: username || email.split('@')[0],
      email: email,
      password: password || 'defaultPassword123', // In real app, this would be hashed
      avatar: undefined
    });
    
    setIsAuthModalOpen(false);
    setShowIntro(false);
  };

  const handleContinueFromIntro = (userEmail?: string, username?: string, password?: string) => {
    if (userEmail) {
      // User logged in or registered
      setIsLoggedIn(true);
      setCurrentUser(userEmail);
      
      // Create user profile
      setUserProfile({
        username: username || userEmail.split('@')[0],
        email: userEmail,
        password: password || 'defaultPassword123',
        avatar: undefined
      });
    } else {
      // Guest user - automatically open user manual
      setIsUserManualOpen(true);
    }
    // Close intro screen
    setShowIntro(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setUserProfile(null);
    setShowSavedPlans(false);
    setIsAccountProfileOpen(false);
  };

  const handleUpdateProfile = (updates: {
    username?: string;
    email?: string;
    password?: string;
    avatar?: string;
  }) => {
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        ...updates
      });
      
      // Update currentUser if email changed
      if (updates.email) {
        setCurrentUser(updates.email);
      }
    }
  };

  const handleLoadPlan = (plan: SavedPlan) => {
    setTripData({ name: plan.name, days: plan.days });
    setCurrentPlanId(plan.id);
    setShowSavedPlans(false);
    
    // Switch to View mode when loading a plan
    setMode("view");
    
    // Trigger View All Days mode when a plan is loaded
    setShowAllDaysOnLoad(true);
    
    // Reset the trigger after a brief moment
    setTimeout(() => {
      setShowAllDaysOnLoad(false);
    }, 100);
  };

  const handleCreateNewPlan = () => {
    setTripData({
      name: "",
      days: [
        {
          id: "1",
          dayNumber: 1,
          destinations: [],
          optimizedRoute: [],
        },
      ],
    });
    setCurrentPlanId(null);
    setShowSavedPlans(false);
  };

  const handleOpenUserManual = () => {
    // Navigate back to Custom Mode view (default screen)
    // Keep all user data intact - don't clear anything
    setShowSavedPlans(false);
    
    // Trigger reset to default views in CustomMode
    setResetViewsToDefault(true);
    
    // Open the User Manual
    setIsUserManualOpen(true);
    
    // Reset the trigger after a brief moment
    setTimeout(() => {
      setResetViewsToDefault(false);
    }, 100);
  };

  const handleCloseUserManual = () => {
    // Navigate back to Custom Mode view (default screen)
    // Keep all user data intact - don't clear anything
    setShowSavedPlans(false);
    
    // Trigger reset to default views in CustomMode
    setResetViewsToDefault(true);
    
    // Close the User Manual
    setIsUserManualOpen(false);
    
    // Reset the trigger after a brief moment
    setTimeout(() => {
      setResetViewsToDefault(false);
    }, 100);
  };

  return (
    <div 
      className="min-h-screen" 
      style={{ background: showIntro ? undefined : currentTheme.colors.background }}
    >
      {/* Sidebar - Hidden on Intro Screen */}
      {!showIntro && (
        <Sidebar
          mode={mode}
          onModeChange={setMode}
          onSettingsClick={() => setIsSettingsOpen(true)}
          onUserManualClick={handleOpenUserManual}
          onMyPlansClick={() => {
            if (isLoggedIn) {
              setShowSavedPlans(true);
            } else {
              setIsAuthModalOpen(true);
            }
          }}
          onLoginClick={() => {
            if (isLoggedIn) {
              // Show account profile modal
              setIsAccountProfileOpen(true);
            } else {
              setIsAuthModalOpen(true);
            }
          }}
          isLoggedIn={isLoggedIn}
          currentUser={currentUser}
          language={language}
          isMyPlansActive={showSavedPlans && isLoggedIn}
        />
      )}

      {/* Main Content */}
      <main className={showIntro ? "min-h-screen" : "pl-24 pr-4 pt-4 pb-4 max-w-[100vw] mx-auto"}>
        {showIntro ? (
          <IntroScreen
            onContinue={handleContinueFromIntro}
            language={language}
            onLanguageChange={setLanguage}
          />
        ) : showSavedPlans && isLoggedIn ? (
          <SavedPlans
            currentUser={currentUser!}
            onBack={() => setShowSavedPlans(false)}
            onLoadPlan={handleLoadPlan}
            onCreateNew={handleCreateNewPlan}
            language={language}
          />
        ) : (
          <CustomMode
            tripData={
              tripData || {
                name: "",
                days: [
                  {
                    id: "1",
                    dayNumber: 1,
                    destinations: [],
                    optimizedRoute: [],
                  },
                ],
              }
            }
            onUpdate={setTripData}
            currency={currency}
            onCurrencyToggle={() =>
              setCurrency(currency === "USD" ? "VND" : "USD")
            }
            language={language}
            mode={mode}
            isLoggedIn={isLoggedIn}
            currentUser={currentUser}
            planId={currentPlanId}
            resetToDefault={resetViewsToDefault}
            showAllDaysOnLoad={showAllDaysOnLoad}
          />
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        language={language}
      />

      {/* Account Profile Modal */}
      {userProfile && (
        <AccountProfile
          isOpen={isAccountProfileOpen}
          onClose={() => setIsAccountProfileOpen(false)}
          onLogout={handleLogout}
          currentUser={userProfile}
          onUpdateProfile={handleUpdateProfile}
          language={language}
        />
      )}

      {/* User Manual */}
      <UserManual
        isOpen={isUserManualOpen}
        onClose={handleCloseUserManual}
        language={language}
        currentMode={mode}
        onModeChange={setMode}
      />

      {/* Settings Modal */}
      <Settings
        currency={currency}
        language={language}
        onCurrencyToggle={() => setCurrency(currency === "USD" ? "VND" : "USD")}
        onLanguageToggle={() => setLanguage(language === "EN" ? "VI" : "EN")}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        asModal={true}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}