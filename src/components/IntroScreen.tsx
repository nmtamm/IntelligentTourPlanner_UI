import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { MapPin, Mail, Lock, User, ArrowRight, Globe, Plane, Map } from "lucide-react";
import { useThemeColors } from "../hooks/useThemeColors";

interface IntroScreenProps {
  onContinue: (userEmail?: string) => void;
  language: 'EN' | 'VI';
  onLanguageChange: (lang: 'EN' | 'VI') => void;
}

export function IntroScreen({ onContinue, language, onLanguageChange }: IntroScreenProps) {
  const [mode, setMode] = useState<'intro' | 'login' | 'register'>('intro');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const { primary, secondary, accent, light, primaryDark, secondaryDark } = useThemeColors();

  const t = {
    en: {
      title: 'Intelligent Tour Planner',
      subtitle: 'Plan your perfect journey with AI-powered route optimization',
      login: 'Login',
      register: 'Register',
      continueAsGuest: 'Continue as Guest',
      email: 'Email',
      password: 'Password',
      fullName: 'Full Name',
      loginButton: 'Sign In',
      registerButton: 'Create Account',
      backToHome: 'Back',
      haveAccount: 'Already have an account?',
      noAccount: "Don't have an account?",
      feature1: 'Smart Route Optimization',
      feature2: 'Multi-Day Planning',
      feature3: 'Cost Tracking',
      feature4: 'GPS Integration',
      welcomeBack: 'Welcome Back',
      createAccount: 'Create Account',
      startPlanning: 'Start Planning Your Journey',
    },
    vi: {
      title: 'Lập Kế Hoạch Du Lịch Thông Minh',
      subtitle: 'Lên kế hoạch chuyến đi hoàn hảo với tối ưu hóa lộ trình AI',
      login: 'Đăng nhập',
      register: 'Đăng ký',
      continueAsGuest: 'Tiếp tục với tư cách khách',
      email: 'Email',
      password: 'Mật khẩu',
      fullName: 'Họ và tên',
      loginButton: 'Đăng nhập',
      registerButton: 'Tạo tài khoản',
      backToHome: 'Quay lại',
      haveAccount: 'Đã có tài khoản?',
      noAccount: 'Chưa có tài khoản?',
      feature1: 'Tối ưu hóa tuyến đường thông minh',
      feature2: 'Lập kế hoạch nhiều ngày',
      feature3: 'Theo dõi chi phí',
      feature4: 'Tích hợp GPS',
      welcomeBack: 'Chào mừng trở lại',
      createAccount: 'Tạo tài khoản',
      startPlanning: 'Bắt đầu lập kế hoạch chuyến đi',
    },
  };

  const lang = language.toLowerCase() as 'en' | 'vi';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - in real app, validate credentials
    onContinue(email);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock register - in real app, create account
    onContinue(email);
  };

  // Intro Screen
  if (mode === 'intro') {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{
          background: `linear-gradient(to bottom right, ${primary}, ${primaryDark}, ${primary}E6)`,
        }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse" />
          <div 
            className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse" 
            style={{ backgroundColor: `${secondary}1A`, animationDelay: '1s' }}
          />
          <div 
            className="absolute top-1/2 left-1/2 w-80 h-80 rounded-full blur-3xl animate-pulse" 
            style={{ backgroundColor: `${light}0D`, animationDelay: '2s' }}
          />
        </div>

        {/* Language Switcher */}
        <div className="absolute top-6 right-6 z-20">
          <button
            onClick={() => onLanguageChange(language === 'EN' ? 'VI' : 'EN')}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full transition-all duration-300 border border-white/20"
          >
            <Globe className="w-4 h-4" />
            <span className="text-sm font-medium">{language === 'EN' ? 'Tiếng Việt' : 'English'}</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-6xl w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side - Branding */}
            <div className="text-white space-y-8">
              {/* Logo & Title */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl text-white">{t[lang].title}</h1>
                  </div>
                </div>
                <p className="text-xl text-white/80">{t[lang].subtitle}</p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Map, text: t[lang].feature1 },
                  { icon: Plane, text: t[lang].feature2 },
                  { icon: Globe, text: t[lang].feature3 },
                  { icon: MapPin, text: t[lang].feature4 },
                ].map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
                  >
                    <feature.icon 
                      className="w-5 h-5 shrink-0 mt-0.5" 
                      style={{ color: secondary }}
                    />
                    <span className="text-sm text-white/90">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Auth Options */}
            <div className="bg-white rounded-3xl p-8 shadow-2xl space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl text-gray-900">{t[lang].startPlanning}</h2>
                <p className="text-gray-600">{language === 'EN' ? 'Choose how you want to get started' : 'Chọn cách bạn muốn bắt đầu'}</p>
              </div>

              <div className="space-y-3">
                {/* Login Button */}
                <button
                  onClick={() => setMode('login')}
                  style={{ 
                    backgroundColor: primary,
                    color: 'white',
                    transition: 'all 0.3s'
                  }}
                  className="w-full h-12 text-base rounded-md inline-flex items-center justify-center gap-2 font-medium shadow-sm hover:scale-[1.02] hover:shadow-lg"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = primaryDark}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = primary}
                >
                  <User className="w-5 h-5" />
                  {t[lang].login}
                </button>

                {/* Register Button */}
                <button
                  onClick={() => setMode('register')}
                  style={{ 
                    backgroundColor: secondary,
                    color: 'white',
                    transition: 'all 0.3s'
                  }}
                  className="w-full h-12 text-base rounded-md inline-flex items-center justify-center gap-2 font-medium shadow-sm hover:scale-[1.02] hover:shadow-lg"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = accent}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = secondary}
                >
                  <Mail className="w-5 h-5" />
                  {t[lang].register}
                </button>

                {/* Divider */}
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-4 text-sm text-gray-500">
                      {language === 'EN' ? 'or' : 'hoặc'}
                    </span>
                  </div>
                </div>

                {/* Continue as Guest */}
                <button
                  onClick={() => onContinue()}
                  style={{ 
                    borderColor: primary,
                    color: '#374151',
                    backgroundColor: 'white',
                    transition: 'all 0.3s'
                  }}
                  className="w-full h-12 text-base border-2 rounded-md inline-flex items-center justify-center gap-2 font-medium hover:scale-[1.02]"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = primary;
                    e.currentTarget.style.backgroundColor = `${primary}0D`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = primary;
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <ArrowRight className="w-5 h-5" />
                  {t[lang].continueAsGuest}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Login Screen
  if (mode === 'login') {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{
          background: `linear-gradient(to bottom right, ${primary}, ${primaryDark}, ${primary}E6)`,
        }}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse" />
          <div 
            className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse" 
            style={{ backgroundColor: `${secondary}1A`, animationDelay: '1s' }}
          />
        </div>

        {/* Language Switcher */}
        <div className="absolute top-6 right-6 z-20">
          <button
            onClick={() => onLanguageChange(language === 'EN' ? 'VI' : 'EN')}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full transition-all duration-300 border border-white/20"
          >
            <Globe className="w-4 h-4" />
            <span className="text-sm font-medium">{language === 'EN' ? 'Tiếng Việt' : 'English'}</span>
          </button>
        </div>

        {/* Login Form */}
        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center space-y-2 mb-8">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${primary}1A` }}
              >
                <User className="w-8 h-8" style={{ color: primary }} />
              </div>
              <h2 className="text-2xl text-gray-900">{t[lang].welcomeBack}</h2>
              <p className="text-gray-600">{language === 'EN' ? 'Sign in to continue your journey' : 'Đăng nhập để tiếp tục hành trình'}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-700">{t[lang].email}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={language === 'EN' ? 'Enter your email' : 'Nhập email của bạn'}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-700">{t[lang].password}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={language === 'EN' ? 'Enter your password' : 'Nhập mật khẩu'}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{ 
                  backgroundColor: primary,
                  color: 'white',
                  transition: 'all 0.3s'
                }}
                className="w-full h-12 text-base mt-6 rounded-md inline-flex items-center justify-center gap-2 font-medium shadow-sm hover:scale-[1.02] hover:shadow-lg"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = primaryDark}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = primary}
              >
                {t[lang].loginButton}
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center space-y-3">
              <p className="text-sm text-gray-600">
                {t[lang].noAccount}{' '}
                <button
                  onClick={() => setMode('register')}
                  style={{ color: primary }}
                  className="hover:underline font-medium"
                >
                  {t[lang].register}
                </button>
              </p>
              <button
                onClick={() => setMode('intro')}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← {t[lang].backToHome}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Register Screen
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: `linear-gradient(to bottom right, ${secondary}, ${accent}, ${secondaryDark})`,
      }}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div 
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse" 
          style={{ backgroundColor: `${light}1A`, animationDelay: '1s' }}
        />
      </div>

      {/* Language Switcher */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={() => onLanguageChange(language === 'EN' ? 'VI' : 'EN')}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full transition-all duration-300 border border-white/20"
        >
          <Globe className="w-4 h-4" />
          <span className="text-sm font-medium">{language === 'EN' ? 'Tiếng Việt' : 'English'}</span>
        </button>
      </div>

      {/* Register Form */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center space-y-2 mb-8">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: `${secondary}1A` }}
            >
              <Mail className="w-8 h-8" style={{ color: secondary }} />
            </div>
            <h2 className="text-2xl text-gray-900">{t[lang].createAccount}</h2>
            <p className="text-gray-600">{language === 'EN' ? 'Start planning your perfect journey' : 'Bắt đầu lập kế hoạch chuyến đi hoàn hảo'}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-700">{t[lang].fullName}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={language === 'EN' ? 'Enter your full name' : 'Nhập họ và tên'}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-700">{t[lang].email}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={language === 'EN' ? 'Enter your email' : 'Nhập email của bạn'}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-700">{t[lang].password}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={language === 'EN' ? 'Create a password' : 'Tạo mật khẩu'}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              style={{ 
                backgroundColor: secondary,
                color: 'white',
                transition: 'all 0.3s'
              }}
              className="w-full h-12 text-base mt-6 rounded-md inline-flex items-center justify-center gap-2 font-medium shadow-sm hover:scale-[1.02] hover:shadow-lg"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = accent}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = secondary}
            >
              {t[lang].registerButton}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-gray-600">
              {t[lang].haveAccount}{' '}
              <button
                onClick={() => setMode('login')}
                style={{ color: secondary }}
                className="hover:underline font-medium"
              >
                {t[lang].login}
              </button>
            </p>
            <button
              onClick={() => setMode('intro')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← {t[lang].backToHome}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}