"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Code, 
  Sparkles,
  Send,
  Loader2,
  Copy,
  Download,
  RefreshCw
} from "lucide-react";
import AICodeGenerator from "@/components/ui/ai-code-generator";

export default function AIGeneratorPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">AI Генератор</h1>
                <p className="text-white/60 text-sm">Генерация кода и компонентов</p>
              </div>
            </div>
            
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              <Sparkles className="h-3 w-3 mr-1" />
              PRO
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AICodeGenerator />
      </div>
    </div>
  );
}
