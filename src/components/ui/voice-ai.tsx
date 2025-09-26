"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Settings,
  Play,
  Pause,
  Square,
  Waveform,
  Radio
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AISpecialistType, aiTeamManager } from "@/lib/ai/core/ai-team-manager";
import { useSession } from "@/lib/auth-client";

interface VoiceAIFeaturesProps {
  specialist: AISpecialistType;
  onVoiceResponse: (response: string) => void;
  className?: string;
}

export function VoiceAIFeatures({ specialist, onVoiceResponse, className }: VoiceAIFeaturesProps) {
  const { data: session } = useSession();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({
    voice: 'female',
    speed: 1.0,
    pitch: 1.0,
    volume: 0.8
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Speech Recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'ru-RU';

        recognitionRef.current.onstart = () => {
          setIsListening(true);
          startVolumeMonitoring();
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          stopVolumeMonitoring();
        };

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          setTranscript(finalTranscript || interimTranscript);
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };
      }

      // Speech Synthesis
      synthesisRef.current = window.speechSynthesis;

      // Audio Context for volume monitoring
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.warn('Web Audio API not supported');
      }
    }

    return () => {
      cleanup();
    };
  }, []);

  const startVolumeMonitoring = async () => {
    try {
      if (!audioContextRef.current || !analyserRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        if (audioContextRef.current) {
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 256;
          microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
          microphoneRef.current.connect(analyserRef.current);

          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

          const updateVolume = () => {
            if (analyserRef.current && isListening) {
              analyserRef.current.getByteFrequencyData(dataArray);
              const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
              setVolumeLevel((average / 255) * 100);
              requestAnimationFrame(updateVolume);
            }
          };

          updateVolume();
        }
      }
    } catch (error) {
      console.warn('Could not access microphone for volume monitoring');
    }
  };

  const stopVolumeMonitoring = () => {
    setVolumeLevel(0);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
      microphoneRef.current = null;
    }
  };

  const cleanup = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
    stopVolumeMonitoring();
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript("");
      recognitionRef.current.start();
    }
  };

  const speakResponse = async (text: string) => {
    if (!synthesisRef.current || !isVoiceEnabled) return;

    setIsSpeaking(true);

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ru-RU';
      utterance.rate = voiceSettings.speed;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;

      // Try to use a female voice if available
      const voices = synthesisRef.current.getVoices();
      const preferredVoice = voices.find(voice =>
        voice.lang.startsWith('ru') &&
        (voiceSettings.voice === 'female' ? voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('жен') : true)
      ) || voices.find(voice => voice.lang.startsWith('ru')) || voices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      synthesisRef.current.speak(utterance);
    } catch (error) {
      console.error('Speech synthesis error:', error);
      setIsSpeaking(false);
    }
  };

  const handleVoiceCommand = async () => {
    if (!transcript.trim() || !session?.user?.id) return;

    try {
      const response = await aiTeamManager.chat({
        message: transcript,
        specialist,
        context: {
          userId: session.user.id,
          userActivity: 'voice_command'
        }
      });

      onVoiceResponse(response.message);

      // Speak the response
      if (isVoiceEnabled) {
        await speakResponse(response.message);
      }

    } catch (error) {
      console.error('Voice command error:', error);
      onVoiceResponse('Извините, произошла ошибка при обработке голосовой команды.');
    }

    setTranscript("");
  };

  const toggleVoiceResponse = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    if (isSpeaking) {
      synthesisRef.current?.cancel();
      setIsSpeaking(false);
    }
  };

  const specialistInfo = aiTeamManager.getSpecialist(specialist);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className={cn(
              "h-5 w-5",
              isVoiceEnabled ? "text-green-500" : "text-muted-foreground"
            )} />
            <CardTitle className="text-lg">Голосовое взаимодействие</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleVoiceResponse}
              className={cn(
                "transition-colors",
                isVoiceEnabled ? "bg-green-500/10 border-green-500/20" : ""
              )}
            >
              {isVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              {isVoiceEnabled ? 'Голос вкл' : 'Голос выкл'}
            </Button>
          </div>
        </div>
        <CardDescription>
          Говорите с {specialistInfo?.name} голосом. AI услышит и ответит!
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Voice Controls */}
        <div className="flex items-center gap-3">
          <Button
            onClick={toggleListening}
            variant={isListening ? "destructive" : "default"}
            size="lg"
            className={cn(
              "flex-1 transition-all duration-200",
              isListening && "animate-pulse bg-red-500 hover:bg-red-600"
            )}
          >
            {isListening ? (
              <>
                <MicOff className="h-5 w-5 mr-2" />
                Остановить запись
              </>
            ) : (
              <>
                <Mic className="h-5 w-5 mr-2" />
                Начать запись
              </>
            )}
          </Button>

          {transcript && (
            <Button
              onClick={handleVoiceCommand}
              variant="secondary"
              size="lg"
            >
              <Waveform className="h-5 w-5 mr-2" />
              Отправить
            </Button>
          )}
        </div>

        {/* Volume Indicator */}
        {isListening && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Уровень звука</span>
              <Badge variant="outline">{Math.round(volumeLevel)}%</Badge>
            </div>
            <Progress value={volumeLevel} className="h-2" />
          </div>
        )}

        {/* Transcript */}
        {transcript && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Mic className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Распознано:</span>
            </div>
            <p className="text-sm">{transcript}</p>
          </div>
        )}

        {/* Speaking Indicator */}
        {isSpeaking && (
          <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <Volume2 className="h-4 w-4 text-blue-500 animate-pulse" />
            <span className="text-sm text-blue-500">
              {specialistInfo?.name} говорит...
            </span>
          </div>
        )}

        {/* Voice Settings */}
        <div className="pt-4 border-t">
          <details className="group">
            <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium hover:text-primary transition-colors">
              <Settings className="h-4 w-4" />
              Настройки голоса
            </summary>
            <div className="mt-3 space-y-3 pl-6">
              <div className="flex items-center justify-between">
                <span className="text-sm">Скорость речи</span>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={voiceSettings.speed}
                  onChange={(e) => setVoiceSettings(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                  className="w-24"
                />
                <span className="text-xs text-muted-foreground w-8">{voiceSettings.speed}x</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Тон голоса</span>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={voiceSettings.pitch}
                  onChange={(e) => setVoiceSettings(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))}
                  className="w-24"
                />
                <span className="text-xs text-muted-foreground w-8">{voiceSettings.pitch}x</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Громкость</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={voiceSettings.volume}
                  onChange={(e) => setVoiceSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                  className="w-24"
                />
                <span className="text-xs text-muted-foreground w-8">{Math.round(voiceSettings.volume * 100)}%</span>
              </div>
            </div>
          </details>
        </div>

        {/* Voice Commands Help */}
        <div className="text-xs text-muted-foreground">
          <p className="font-medium mb-1">Примеры голосовых команд:</p>
          <ul className="space-y-1 pl-4">
            <li>• "Создай новую задачу по рефакторингу"</li>
            <li>• "Покажи аналитику проекта"</li>
            <li>• "Проверь безопасность кода"</li>
            <li>• "Оптимизируй производительность"</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

// Extend Window interface for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
