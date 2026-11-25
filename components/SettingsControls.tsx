import React from 'react';
import { Language, VoiceName } from '../types';

interface SettingsControlsProps {
  selectedLanguage: Language;
  selectedVoice: VoiceName;
  onLanguageChange: (lang: Language) => void;
  onVoiceChange: (voice: VoiceName) => void;
  disabled: boolean;
}

const SettingsControls: React.FC<SettingsControlsProps> = ({
  selectedLanguage,
  selectedVoice,
  onLanguageChange,
  onVoiceChange,
  disabled
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg justify-center items-center">
      <div className="w-full">
        <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">
          Language
        </label>
        <div className="relative">
          <select
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value as Language)}
            disabled={disabled}
            className="w-full appearance-none bg-gray-800 border border-gray-700 text-white py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-gray-700 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {Object.values(Language).map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="w-full">
        <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">
          Voice
        </label>
        <div className="relative">
          <select
            value={selectedVoice}
            onChange={(e) => onVoiceChange(e.target.value as VoiceName)}
            disabled={disabled}
            className="w-full appearance-none bg-gray-800 border border-gray-700 text-white py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-gray-700 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {Object.values(VoiceName).map((voice) => (
              <option key={voice} value={voice}>{voice}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsControls;