import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Settings as SettingsIcon, X, Globe, DollarSign, Palette, Check } from 'lucide-react';
import { useTheme, THEMES, ThemeType } from '../contexts/ThemeContext';
import { useThemeColors } from '../hooks/useThemeColors';

interface SettingsProps {
  currency: 'USD' | 'VND';
  language: 'EN' | 'VI';
  onCurrencyToggle: () => void;
  onLanguageToggle: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  asModal?: boolean;
}

export function Settings({
  currency,
  language,
  onCurrencyToggle,
  onLanguageToggle,
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  asModal = false,
}: SettingsProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const { themeType, setThemeType, currentTheme } = useTheme();
  const { primary, secondary, accent, light, primaryDark } = useThemeColors();
  
  const isOpen = asModal ? externalIsOpen : internalIsOpen;
  const setIsOpen = asModal ? (value: boolean) => {
    if (!value && externalOnClose) externalOnClose();
  } : setInternalIsOpen;

  // Get available theme options (exclude 'custom' for now - will be added in future)
  const availableThemes: ThemeType[] = ['default', 'ocean', 'forest', 'sunset', 'lavender'];

  // Modal version (from sidebar)
  if (asModal) {
    return (
      <>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Settings Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <Card 
                className="w-full max-w-md p-6 shadow-2xl border-2 bg-white"
                style={{ borderColor: `${primary}33` }}
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3 border-b">
                    <h3 className="text-xl font-semibold" style={{ color: primary }}>
                      {language === 'EN' ? 'Settings' : 'Cài đặt'}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Currency Setting */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 font-medium">
                      {language === 'EN' ? 'Currency' : 'Tiền tệ'}
                    </label>
                    <div className="flex gap-2">
                      <Button
                        variant={currency === 'USD' ? 'default' : 'outline'}
                        style={currency === 'USD' ? { backgroundColor: primary, color: 'white' } : { backgroundColor: `${light}40` }}
                        className="flex-1"
                        onClick={() => {
                          if (currency !== 'USD') onCurrencyToggle();
                        }}
                        onMouseEnter={(e) => currency === 'USD' && (e.currentTarget.style.backgroundColor = primaryDark)}
                        onMouseLeave={(e) => currency === 'USD' && (e.currentTarget.style.backgroundColor = primary)}
                      >
                        <DollarSign className="w-4 h-4 mr-1" />
                        USD
                      </Button>
                      <Button
                        variant={currency === 'VND' ? 'default' : 'outline'}
                        style={currency === 'VND' ? { backgroundColor: primary, color: 'white' } : { backgroundColor: `${light}40` }}
                        className="flex-1"
                        onClick={() => {
                          if (currency !== 'VND') onCurrencyToggle();
                        }}
                        onMouseEnter={(e) => currency === 'VND' && (e.currentTarget.style.backgroundColor = primaryDark)}
                        onMouseLeave={(e) => currency === 'VND' && (e.currentTarget.style.backgroundColor = primary)}
                      >
                        <span className="mr-1">₫</span>
                        VND
                      </Button>
                    </div>
                  </div>

                  {/* Language Setting */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 font-medium">
                      {language === 'EN' ? 'Language' : 'Ngôn ngữ'}
                    </label>
                    <div className="flex gap-2">
                      <Button
                        variant={language === 'EN' ? 'default' : 'outline'}
                        style={language === 'EN' ? { backgroundColor: primary, color: 'white' } : { backgroundColor: `${light}40` }}
                        className="flex-1"
                        onClick={() => {
                          if (language !== 'EN') onLanguageToggle();
                        }}
                        onMouseEnter={(e) => language === 'EN' && (e.currentTarget.style.backgroundColor = primaryDark)}
                        onMouseLeave={(e) => language === 'EN' && (e.currentTarget.style.backgroundColor = primary)}
                      >
                        <Globe className="w-4 h-4 mr-1" />
                        English
                      </Button>
                      <Button
                        variant={language === 'VI' ? 'default' : 'outline'}
                        style={language === 'VI' ? { backgroundColor: primary, color: 'white' } : { backgroundColor: `${light}40` }}
                        className="flex-1"
                        onClick={() => {
                          if (language !== 'VI') onLanguageToggle();
                        }}
                        onMouseEnter={(e) => language === 'VI' && (e.currentTarget.style.backgroundColor = primaryDark)}
                        onMouseLeave={(e) => language === 'VI' && (e.currentTarget.style.backgroundColor = primary)}
                      >
                        <Globe className="w-4 h-4 mr-1" />
                        Tiếng Việt
                      </Button>
                    </div>
                  </div>

                  {/* Theme Setting */}
                  <div className="space-y-3">
                    <label className="text-sm text-gray-600 font-medium flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      {language === 'EN' ? 'Color Theme' : 'Chủ đề màu sắc'}
                    </label>
                    
                    {/* Theme Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      {availableThemes.map((theme) => {
                        const themeConfig = THEMES[theme];
                        const isSelected = themeType === theme;
                        
                        return (
                          <button
                            key={theme}
                            onClick={() => setThemeType(theme)}
                            style={isSelected ? { 
                              borderColor: primary,
                              backgroundColor: `${primary}0D` // 5% opacity
                            } : {}}
                            className={`
                              relative p-3 rounded-lg border-2 transition-all duration-200
                              hover:scale-105 hover:shadow-md
                              ${isSelected 
                                ? '' 
                                : 'border-gray-200 hover:border-gray-300'
                              }
                            `}
                          >
                            {/* Color Preview Circles */}
                            <div className="flex gap-1.5 mb-2">
                              <div 
                                className="w-6 h-6 rounded-full border border-gray-200"
                                style={{ backgroundColor: themeConfig.colors.primary }}
                              />
                              <div 
                                className="w-6 h-6 rounded-full border border-gray-200"
                                style={{ backgroundColor: themeConfig.colors.secondary }}
                              />
                              <div 
                                className="w-6 h-6 rounded-full border border-gray-200"
                                style={{ backgroundColor: themeConfig.colors.accent }}
                              />
                            </div>
                            
                            {/* Theme Name */}
                            <div className="text-left">
                              <p className="text-sm font-medium text-gray-900">
                                {themeConfig.name[language.toLowerCase() as 'en' | 'vi']}
                              </p>
                            </div>

                            {/* Selected Check Mark */}
                            {isSelected && (
                              <div className="absolute top-2 right-2">
                                <div 
                                  className="w-5 h-5 rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: primary }}
                                >
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Coming Soon: Custom Theme */}
                    <div className="p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <p className="text-xs text-gray-500 text-center">
                        <Palette className="w-3 h-3 inline mr-1" />
                        {language === 'EN' 
                          ? 'Custom theme editor coming soon' 
                          : 'Trình chỉnh sửa chủ đề tùy chỉnh sẽ có sớm'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Info Text */}
                  <div className="pt-3 border-t">
                    <p className="text-xs text-gray-500 text-center">
                      {language === 'EN'
                        ? 'Changes will apply immediately to all components'
                        : 'Thay đổi sẽ được áp dụng ngay lập tức cho tất cả các thành phần'}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}
      </>
    );
  }

  // Dropdown version (from header)
  return (
    <div className="relative">
      {/* Settings Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={isOpen ? 'bg-[#DAF9D8]' : ''}
        data-tutorial="settings"
      >
        <SettingsIcon className="w-4 h-4 mr-2" />
        {language === 'EN' ? 'Settings' : 'Cài đặt'}
      </Button>

      {/* Settings Card Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Settings Card */}
          <Card className="absolute right-0 top-full mt-2 w-80 p-4 shadow-xl z-50 border-2 border-[#004DB6]/20">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b">
                <h3 className="text-[#004DB6]">
                  {language === 'EN' ? 'Settings' : 'Cài đặt'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Currency Setting */}
              <div className="space-y-2">
                <label className="text-sm text-gray-600">
                  {language === 'EN' ? 'Currency' : 'Tiền tệ'}
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={currency === 'USD' ? 'default' : 'outline'}
                    className={`flex-1 ${
                      currency === 'USD'
                        ? 'bg-[#004DB6] hover:bg-[#003d8f] text-white'
                        : 'hover:bg-[#DAF9D8]'
                    }`}
                    onClick={() => {
                      if (currency !== 'USD') onCurrencyToggle();
                    }}
                  >
                    <DollarSign className="w-4 h-4 mr-1" />
                    USD
                  </Button>
                  <Button
                    variant={currency === 'VND' ? 'default' : 'outline'}
                    className={`flex-1 ${
                      currency === 'VND'
                        ? 'bg-[#004DB6] hover:bg-[#003d8f] text-white'
                        : 'hover:bg-[#DAF9D8]'
                    }`}
                    onClick={() => {
                      if (currency !== 'VND') onCurrencyToggle();
                    }}
                  >
                    <span className="mr-1">₫</span>
                    VND
                  </Button>
                </div>
              </div>

              {/* Language Setting */}
              <div className="space-y-2">
                <label className="text-sm text-gray-600">
                  {language === 'EN' ? 'Language' : 'Ngôn ngữ'}
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={language === 'EN' ? 'default' : 'outline'}
                    className={`flex-1 ${
                      language === 'EN'
                        ? 'bg-[#004DB6] hover:bg-[#003d8f] text-white'
                        : 'hover:bg-[#DAF9D8]'
                    }`}
                    onClick={() => {
                      if (language !== 'EN') onLanguageToggle();
                    }}
                  >
                    <Globe className="w-4 h-4 mr-1" />
                    English
                  </Button>
                  <Button
                    variant={language === 'VI' ? 'default' : 'outline'}
                    className={`flex-1 ${
                      language === 'VI'
                        ? 'bg-[#004DB6] hover:bg-[#003d8f] text-white'
                        : 'hover:bg-[#DAF9D8]'
                    }`}
                    onClick={() => {
                      if (language !== 'VI') onLanguageToggle();
                    }}
                  >
                    <Globe className="w-4 h-4 mr-1" />
                    Tiếng Việt
                  </Button>
                </div>
              </div>

              {/* Theme Preview */}
              <div className="space-y-2">
                <label className="text-sm text-gray-600 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  {language === 'EN' ? 'Color Theme' : 'Chủ đề màu sắc'}
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-900">
                      {currentTheme.name[language.toLowerCase() as 'en' | 'vi']}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: primary }}
                    />
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: secondary }}
                    />
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: accent }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {language === 'EN' 
                      ? 'Open Settings to change theme' 
                      : 'Mở Cài đặt để thay đổi chủ đề'
                    }
                  </p>
                </div>
              </div>

              {/* Info Text */}
              <div className="pt-3 border-t">
                <p className="text-xs text-gray-500 text-center">
                  {language === 'EN'
                    ? 'Changes will apply immediately to all components'
                    : 'Thay đổi sẽ được áp dụng ngay lập tức cho tất cả các thành phần'}
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}