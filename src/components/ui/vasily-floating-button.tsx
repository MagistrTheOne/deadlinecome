"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  X, 
  MessageCircle, 
  Settings,
  Mic,
  Volume2
} from "lucide-react";
import { VasilyChat } from "./vasily-chat";
import { VasilyMoodControl } from "./vasily-mood-control";
import { VasilyVoice } from "./vasily-voice";

interface VasilyFloatingButtonProps {
  className?: string;
}

export function VasilyFloatingButton({ className = "" }: VasilyFloatingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "mood" | "voice">("chat");

  return (
    <>
      {/* Плавающая кнопка */}
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-white text-black hover:bg-gray-200 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110"
          size="icon"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </div>

      {/* Модальное окно Василия */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <Card className="w-full max-w-4xl sm:max-w-6xl h-[95vh] sm:h-[90vh] bg-black/90 backdrop-blur-sm border border-white/20 flex flex-col">
            <CardHeader className="flex-shrink-0 border-b border-white/10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Bot className="h-6 w-6" />
                  Василий Team Lead AI
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Онлайн
                  </Badge>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              {/* Табы */}
              <div className="flex-shrink-0 border-b border-white/10">
                <div className="flex">
                  <Button
                    variant={activeTab === "chat" ? "default" : "ghost"}
                    onClick={() => setActiveTab("chat")}
                    className="rounded-none border-0 bg-transparent hover:bg-white/5 text-white"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Чат
                  </Button>
                  <Button
                    variant={activeTab === "mood" ? "default" : "ghost"}
                    onClick={() => setActiveTab("mood")}
                    className="rounded-none border-0 bg-transparent hover:bg-white/5 text-white"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Настроение
                  </Button>
                  <Button
                    variant={activeTab === "voice" ? "default" : "ghost"}
                    onClick={() => setActiveTab("voice")}
                    className="rounded-none border-0 bg-transparent hover:bg-white/5 text-white"
                  >
                    <Mic className="h-4 w-4 mr-2" />
                    Голос
                  </Button>
                </div>
              </div>

              {/* Контент */}
              <div className="flex-1 overflow-hidden">
                {activeTab === "chat" && (
                  <div className="h-full">
                    <VasilyChat />
                  </div>
                )}
                {activeTab === "mood" && (
                  <div className="h-full p-4 overflow-y-auto">
                    <VasilyMoodControl />
                  </div>
                )}
                {activeTab === "voice" && (
                  <div className="h-full p-4 overflow-y-auto">
                    <VasilyVoice />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
