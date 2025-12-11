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
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { t } from "../locales/translations";
import { ErrorNotification } from "./ErrorNotification";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string) => void;
  language: 'EN' | 'VI';
}

export function AuthModal({
  isOpen,
  onClose,
  onLogin,
  language,
}: AuthModalProps) {
  const lang = language.toLowerCase() as 'en' | 'vi';
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError(t('enterEmailPassword', lang));
      return;
    }

    // Simple mock authentication
    if (isRegistering) {
      toast.success(
        t('accountCreated', lang),
      );
    } else {
      toast.success(t('loggedInSuccess', lang));
    }
    onLogin(email);
    setEmail("");
    setPassword("");
    setIsRegistering(false);
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
            {isRegistering ? t('createAccount', lang) : t('loginTitle', lang)}
          </DialogTitle>
          <DialogDescription>
            {isRegistering
              ? t('signupToStart', lang)
              : t('loginToAccount', lang)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('email', lang)}</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('password', lang)}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
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
              {t('cancel', lang)}
            </Button>
            <Button type="submit" className="flex-1">
              {isRegistering ? t('register', lang) : t('loginTitle', lang)}
            </Button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm text-[#004DB6] hover:underline"
            >
              {isRegistering
                ? t('alreadyHaveAccount', lang)
                : t('dontHaveAccount', lang)}
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