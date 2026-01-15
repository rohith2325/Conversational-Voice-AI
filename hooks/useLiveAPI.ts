import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createPcmBlob, base64ToUint8Array, decodeAudioData } from '../utils/audio';
import { LiveConfig } from '../types';

interface UseLiveAPIResult {
  connect: (config: LiveConfig) => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
  isConnecting: boolean;
  volumeState: { input: number; output: number };
  error: string | null;
}

export const useLiveAPI = (): UseLiveAPIResult => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volumeState, setVolumeState] = useState({ input: 0, output: 0 });

  // Refs for audio context and processing
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  // Analysers for visualization
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    // Stop animation loop
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Stop all playing sources
    sourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Ignore errors if source already stopped
      }
    });
    sourcesRef.current.clear();

    // Close media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // Close audio contexts
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }

    // Reset state
    sessionPromiseRef.current = null;
    nextStartTimeRef.current = 0;
    setIsConnected(false);
    setIsConnecting(false);
    setVolumeState({ input: 0, output: 0 });
  }, []);

  const updateVolumes = () => {
    let inputVol = 0;
    let outputVol = 0;

    if (inputAnalyserRef.current) {
      const dataArray = new Uint8Array(inputAnalyserRef.current.frequencyBinCount);
      inputAnalyserRef.current.getByteFrequencyData(dataArray);
      let sum = 0;
      for (const amplitude of dataArray) {
        sum += amplitude;
      }
      inputVol = sum / dataArray.length;
    }

    if (outputAnalyserRef.current) {
      const dataArray = new Uint8Array(outputAnalyserRef.current.frequencyBinCount);
      outputAnalyserRef.current.getByteFrequencyData(dataArray);
      let sum = 0;
      for (const amplitude of dataArray) {
        sum += amplitude;
      }
      outputVol = sum / dataArray.length;
    }

    // Normalize roughly to 0-100 range for UI
    setVolumeState({
      input: Math.min(100, (inputVol / 255) * 200),
      output: Math.min(100, (outputVol / 255) * 200),
    });

    animationFrameRef.current = requestAnimationFrame(updateVolumes);
  };

  const connect = async (config: LiveConfig) => {
    if (isConnecting || isConnected) return;
    
    setIsConnecting(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Initialize Audio Contexts
      // Input: 16kHz required by Gemini
      // Output: 24kHz required by Gemini
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      // Setup Visualizers
      inputAnalyserRef.current = inputAudioContextRef.current.createAnalyser();
      inputAnalyserRef.current.fftSize = 256;
      outputAnalyserRef.current = outputAudioContextRef.current.createAnalyser();
      outputAnalyserRef.current.fftSize = 256;
      
      // Start Volume Loop
      updateVolumes();

      // Get Mic Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const connectConfig = {
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            console.log('Gemini Live API Connected');
            setIsConnected(true);
            setIsConnecting(false);

            if (!inputAudioContextRef.current) return;

            // Stream audio from mic to model
            const source = inputAudioContextRef.current.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            
            // Connect for visualization
            source.connect(inputAnalyserRef.current!);

            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              
              if (sessionPromiseRef.current) {
                sessionPromiseRef.current.then((session) => {
                  try {
                    session.sendRealtimeInput({ media: pcmBlob });
                  } catch (e) {
                    console.error("Error sending audio input", e);
                  }
                });
              }
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (!outputAudioContextRef.current) return;

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            
            if (base64Audio) {
               // Ensure playback timing
              nextStartTimeRef.current = Math.max(
                nextStartTimeRef.current,
                outputAudioContextRef.current.currentTime
              );

              const audioBuffer = await decodeAudioData(
                base64ToUint8Array(base64Audio),
                outputAudioContextRef.current,
                24000,
                1
              );

              const source = outputAudioContextRef.current.createBufferSource();
              source.buffer = audioBuffer;
              
              const outputNode = outputAudioContextRef.current.createGain();
              source.connect(outputNode);
              outputNode.connect(outputAudioContextRef.current.destination);
              
              // Connect to visualizer
              outputNode.connect(outputAnalyserRef.current!);

              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
              console.log("Model interrupted");
              for (const source of sourcesRef.current.values()) {
                source.stop();
                sourcesRef.current.delete(source);
              }
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e: any) => {
            console.error('Session error:', e);
            setError("Connection error occurred.");
            cleanup();
          },
          onclose: (e: any) => {
            console.log('Session closed');
            cleanup();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: config.voiceName } },
          },
          systemInstruction: `You are a helpful, witty, and intelligent conversational AI assistant. You are currently speaking in ${config.language}. Keep responses concise and natural, like a human conversation.`,
        },
      };

      sessionPromiseRef.current = ai.live.connect(connectConfig);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to connect");
      setIsConnecting(false);
      cleanup();
    }
  };

  const disconnect = useCallback(() => {
    if (sessionPromiseRef.current) {
      // There isn't a direct "close" method on the promise, 
      // but usually the SDK handles cleanup when the object is garbage collected 
      // or we can just stop sending data and closing contexts.
      // Based on docs, we should assume the session closes if we stop interacting or if we trigger an error? 
      // Actually, standard WebSocket/WebRTC usually has a close. 
      // The provided examples show session.close() in text but not in the code block.
      // We will rely on our local cleanup to stop streams.
       sessionPromiseRef.current.then((session: any) => {
          if(session.close) session.close();
       }).catch(() => {});
    }
    cleanup();
  }, [cleanup]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    connect,
    disconnect,
    isConnected,
    isConnecting,
    volumeState,
    error
  };
};
