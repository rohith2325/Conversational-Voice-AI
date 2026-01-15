import React, { useState } from 'react';
import { useLiveAPI } from './hooks/useLiveAPI';
import Visualizer from './components/Visualizer';
import SettingsControls from './components/SettingsControls';
import { Language, VoiceName } from './types';

// Icons
const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
  </svg>
);

const StopIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
  </svg>
);

const App: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(Language.English);
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>(VoiceName.Fenrir);
  
  const { 
    connect, 
    disconnect, 
    isConnected, 
    isConnecting, 
    volumeState, 
    error 
  } = useLiveAPI();

  const handleToggleConnect = async () => {
    if (isConnected) {
      disconnect();
    } else {
      await connect({
        language: selectedLanguage,
        voiceName: selectedVoice
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-between p-6 overflow-hidden">
      
      {/* Header */}
      <header className="w-full max-w-4xl flex justify-between items-center py-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
             <span className="font-bold text-lg">N</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Nova Voice AI
          </h1>
        </div>
        <div className="flex items-center gap-2">
           <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></span>
           <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
             {isConnected ? 'Live' : 'Offline'}
           </span>
        </div>
      </header>

      {/* Main Visualizer Area */}
      <main className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center relative min-h-[400px]">
        
        {/* Connection Loading State */}
        {isConnecting && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0f172a]/80 backdrop-blur-sm transition-all">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-blue-300 font-medium animate-pulse">Establishing secure connection...</p>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="absolute top-4 left-0 right-0 z-30 mx-auto w-fit">
            <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Visualizer */}
        <div className="relative w-full h-full flex items-center justify-center">
          <Visualizer 
            inputVolume={volumeState.input} 
            outputVolume={volumeState.output} 
            isActive={isConnected}
          />
          
          {/* Instruction when offline */}
          {!isConnected && !isConnecting && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-gray-500 text-lg font-light text-center max-w-md">
                Select your language and voice,<br/>then tap the microphone to start talking.
              </p>
            </div>
          )}
        </div>

      </main>

      {/* Bottom Controls */}
      <footer className="w-full max-w-4xl flex flex-col gap-8 pb-8 pt-4">
        
        <SettingsControls 
          selectedLanguage={selectedLanguage}
          selectedVoice={selectedVoice}
          onLanguageChange={setSelectedLanguage}
          onVoiceChange={setSelectedVoice}
          disabled={isConnected || isConnecting}
        />

        <div className="flex justify-center items-center">
          <button
            onClick={handleToggleConnect}
            disabled={isConnecting}
            className={`
              relative group flex items-center justify-center w-20 h-20 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-500/30
              ${isConnected 
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/50' 
                : 'bg-white text-gray-900 hover:bg-blue-50 shadow-white/20'
              }
              ${isConnecting ? 'opacity-50 cursor-not-allowed scale-95' : ''}
            `}
            aria-label={isConnected ? "End conversation" : "Start conversation"}
          >
            {isConnected ? <StopIcon /> : <MicIcon />}
            
            {/* Ping animation behind button when idle to encourage click */}
            {!isConnected && !isConnecting && (
              <span className="absolute -inset-1 rounded-full border border-white/30 animate-ping opacity-20 pointer-events-none"></span>
            )}
          </button>
        </div>
        
        <div className="text-center text-gray-500 text-xs">
          Powered by Gemini Multimodal Live API
        </div>
      </footer>
    </div>
  );
};

export default App;