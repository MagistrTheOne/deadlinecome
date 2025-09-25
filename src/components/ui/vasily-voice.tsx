"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Bot,
  Activity,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
  transcript: string;
  confidence: number;
}

export function VasilyVoice() {
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isSpeaking: false,
    isSupported: false,
    transcript: "",
    confidence: 0
  });

  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Проверяем поддержку Web Speech API
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const speechSynthesis = window.speechSynthesis;
      
      if (SpeechRecognition && speechSynthesis) {
        setVoiceState(prev => ({ ...prev, isSupported: true }));
        
        // Настраиваем распознавание речи
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'ru-RU';

        recognitionRef.current.onstart = () => {
          setVoiceState(prev => ({ ...prev, isListening: true }));
        };

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';
          let confidence = 0;

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            confidence = event.results[i][0].confidence;
            
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          setVoiceState(prev => ({
            ...prev,
            transcript: finalTranscript || interimTranscript,
            confidence: confidence * 100
          }));
        };

        recognitionRef.current.onend = () => {
          setVoiceState(prev => ({ ...prev, isListening: false }));
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setVoiceState(prev => ({ ...prev, isListening: false }));
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthesisRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !voiceState.isListening) {
      setVoiceState(prev => ({ ...prev, transcript: "", confidence: 0 }));
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && voiceState.isListening) {
      recognitionRef.current.stop();
    }
  };

  const speak = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // Останавливаем предыдущую речь
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ru-RU';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;

      utterance.onstart = () => {
        setVoiceState(prev => ({ ...prev, isSpeaking: true }));
      };

      utterance.onend = () => {
        setVoiceState(prev => ({ ...prev, isSpeaking: false }));
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setVoiceState(prev => ({ ...prev, isSpeaking: false }));
      };

      synthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setVoiceState(prev => ({ ...prev, isSpeaking: false }));
    }
  };

  const sendVoiceMessage = async () => {
    if (!voiceState.transcript.trim()) return;

    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: voiceState.transcript.trim()
        }),
      });

      if (response.ok) {
        const data = await response.json();
        speak(data.response);
      }
    } catch (error) {
      console.error('Ошибка отправки голосового сообщения:', error);
      speak("Извини, у меня технические трудности...");
    }
  };

  if (!voiceState.isSupported) {
    return (
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Голосовые команды
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-yellow-400">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Голосовые команды не поддерживаются в вашем браузере</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Голосовые команды
        </CardTitle>
        <CardDescription className="text-white/70">
          Говори с Василием голосом
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Статус распознавания */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {voiceState.isListening ? (
              <Activity className="h-4 w-4 text-green-400 animate-pulse" />
            ) : (
              <Mic className="h-4 w-4 text-white/60" />
            )}
            <span className="text-white text-sm">
              {voiceState.isListening ? "Слушаю..." : "Готов к прослушиванию"}
            </span>
          </div>
          
          {voiceState.confidence > 0 && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              {Math.round(voiceState.confidence)}% точность
            </Badge>
          )}
        </div>

        {/* Транскрипт */}
        {voiceState.transcript && (
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-white text-sm">
              "{voiceState.transcript}"
            </p>
          </div>
        )}

        {/* Кнопки управления */}
        <div className="flex gap-2">
          {!voiceState.isListening ? (
            <Button
              onClick={startListening}
              variant="default"
              className="flex-1"
            >
              <Mic className="h-4 w-4 mr-2" />
              Начать запись
            </Button>
          ) : (
            <Button
              onClick={stopListening}
              variant="destructive"
              className="flex-1"
            >
              <MicOff className="h-4 w-4 mr-2" />
              Остановить
            </Button>
          )}

          {voiceState.transcript && (
            <Button
              onClick={sendVoiceMessage}
              variant="outline"
              className="flex-1"
            >
              <Bot className="h-4 w-4 mr-2" />
              Отправить
            </Button>
          )}
        </div>

        {/* Управление речью */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="flex items-center gap-2">
            {voiceState.isSpeaking ? (
              <Volume2 className="h-4 w-4 text-blue-400 animate-pulse" />
            ) : (
              <VolumeX className="h-4 w-4 text-white/60" />
            )}
            <span className="text-white text-sm">
              {voiceState.isSpeaking ? "Василий говорит..." : "Речь отключена"}
            </span>
          </div>

          {voiceState.isSpeaking && (
            <Button
              onClick={stopSpeaking}
              variant="ghost"
              size="sm"
              className="text-white/60 hover:text-white"
            >
              <VolumeX className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Быстрые команды */}
        <div className="space-y-2">
          <p className="text-white/60 text-xs">Быстрые голосовые команды:</p>
          <div className="flex flex-wrap gap-1">
            {["/joke", "/mood", "/help", "расскажи шутку", "какое у тебя настроение"].map((command) => (
              <Button
                key={command}
                variant="ghost"
                size="sm"
                onClick={() => {
                  setVoiceState(prev => ({ ...prev, transcript: command }));
                }}
                className="text-xs h-6 px-2 bg-white/5 hover:bg-white/10 text-white/80"
              >
                {command}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Расширяем Window интерфейс для TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
