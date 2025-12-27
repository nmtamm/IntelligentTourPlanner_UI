import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { t } from "../locales/translations";
import { ErrorNotification } from "./ErrorNotification";
import { useThemeColors } from "../hooks/useThemeColors";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (
    email: string,
    username?: string,
    password?: string,
  ) => void;
  language: "EN" | "VI";
}

export function AuthModal({
  isOpen,
  onClose,
  onLogin,
  language,
}: AuthModalProps) {
  const lang = language.toLowerCase() as "en" | "vi";
  const { primary, secondary, accent, light } = useThemeColors();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitBtnHovered, setIsSubmitBtnHovered] =
    useState(false);
  const [isSubmitBtnPressed, setIsSubmitBtnPressed] =
    useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (isRegistering) {
      if (
        !username.trim() ||
        !email.trim() ||
        !password.trim()
      ) {
        setError(t("enterEmailPassword", lang));
        return;
      }
    } else {
      if (!username.trim() || !password.trim()) {
        setError(t("enterEmailPassword", lang));
        return;
      }
    }

    // Simple mock authentication
    if (isRegistering) {
      toast.success(t("accountCreated", lang));
    } else {
      toast.success(t("loggedInSuccess", lang));
    }
    onLogin(email || username, username, password);
    setUsername("");
    setEmail("");
    setPassword("");
    setIsRegistering(false);
  };

  // Helper function to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onClose();
        if (!open) setIsRegistering(false);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isRegistering
              ? t("createAccount", lang)
              : t("loginTitle", lang)}
          </DialogTitle>
          <DialogDescription>
            {isRegistering
              ? t("signupToStart", lang)
              : t("loginToAccount", lang)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Input - Always shown */}
          <div className="space-y-2">
            <Label
              htmlFor="username"
              style={{ color: accent }}
            >
              {t("username", lang)}
            </Label>
            <div className="relative">
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pr-12"
                style={{ borderColor: light }}
                required
              />
              <User
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5"
                style={{ color: accent }}
              />
            </div>
          </div>

          {/* Email Input - Only shown when registering */}
          {isRegistering && (
            <div className="space-y-2">
              <Label
                htmlFor="email"
                style={{ color: accent }}
              >
                {t("email", lang)}
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pr-12"
                  style={{ borderColor: light }}
                  required
                />
                <Mail
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5"
                  style={{ color: accent }}
                />
              </div>
            </div>
          )}

          {/* Password Input */}
          <div className="space-y-2">
            <Label
              htmlFor="password"
              style={{ color: accent }}
            >
              {t("password", lang)}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-12"
                style={{ borderColor: light }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: accent }}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              {t("cancel", lang)}
            </Button>
            <button
              type="submit"
              onMouseEnter={() => setIsSubmitBtnHovered(true)}
              onMouseLeave={() => {
                setIsSubmitBtnHovered(false);
                setIsSubmitBtnPressed(false);
              }}
              onMouseDown={() => setIsSubmitBtnPressed(true)}
              onMouseUp={() => setIsSubmitBtnPressed(false)}
              className="flex-1 text-white font-semibold rounded-md h-9"
              style={{
                background: isRegistering
                  ? `linear-gradient(135deg, ${secondary} 0%, ${accent} 100%)`
                  : `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
                padding: "0 16px",
                boxShadow: isSubmitBtnPressed
                  ? isRegistering
                    ? `0 2px 6px ${hexToRgba(secondary, 0.4)}`
                    : `0 2px 6px ${hexToRgba(primary, 0.4)}`
                  : isSubmitBtnHovered
                    ? isRegistering
                      ? `0 4px 12px ${hexToRgba(secondary, 0.3)}`
                      : `0 4px 12px ${hexToRgba(primary, 0.3)}`
                    : "none",
                transform: isSubmitBtnPressed
                  ? "scale(0.97)"
                  : isSubmitBtnHovered
                    ? "scale(1.02)"
                    : "scale(1.00)",
                transition: isSubmitBtnPressed
                  ? "all 120ms ease-out"
                  : "all 150ms cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              {isRegistering
                ? t("startExploring", lang)
                : t("loginTitle", lang)}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm hover:underline transition-colors"
              style={{ color: primary }}
            >
              {isRegistering
                ? t("alreadyHaveAccount", lang)
                : t("dontHaveAccount", lang)}
            </button>
          </div>
        </form>

        {/* Error Notification */}
        {error && (
          <ErrorNotification
            message={error}
            onClose={() => setError(null)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}