"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Input } from './input';
import { Textarea } from './textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Slider } from './slider';
import { 
  Settings, 
  Brain, 
  MessageSquare, 
  Clock, 
  Users, 
  Zap,
  Shield,
  Code,
  BarChart3,
  FileText,
  Globe,
  TrendingUp,
  Activity,
  Target,
  Save,
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react';

interface AIPersonality {
  id: string;
  name: string;
  role: string;
  communicationStyle: {
    tone: 'formal' | 'casual' | 'friendly' | 'professional' | 'technical';
    verbosity: number; // 1-5
    humor: number; // 1-5
    empathy: number; // 1-5
    directness: number; // 1-5
  };
  workingStyle: {
    pace: 'slow' | 'moderate' | 'fast' | 'adaptive';
    detail: 'minimal' | 'moderate' | 'comprehensive' | 'exhaustive';
    collaboration: 'independent' | 'collaborative' | 'team-focused' | 'leadership';
    innovation: 'conservative' | 'balanced' | 'creative' | 'revolutionary';
  };
  expertise: {
    primary: string[];
    secondary: string[];
    learning: 'slow' | 'moderate' | 'fast' | 'rapid';
    specialization: string;
  };
  preferences: {
    workingHours: string;
    timezone: string;
    language: string;
    culturalContext: string;
  };
  traits: {
    patience: number; // 1-5
    creativity: number; // 1-5
    analytical: number; // 1-5
    social: number; // 1-5
    riskTolerance: number; // 1-5
  };
}

export default function AIPersonalityCustomizer() {
  const [selectedAI, setSelectedAI] = useState<string>('ai-vasily');
  const [personalities, setPersonalities] = useState<AIPersonality[]>([]);
  const [currentPersonality, setCurrentPersonality] = useState<AIPersonality | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializePersonalities();
  }, []);

  useEffect(() => {
    if (selectedAI && personalities.length > 0) {
      const personality = personalities.find(p => p.id === selectedAI);
      setCurrentPersonality(personality || null);
    }
  }, [selectedAI, personalities]);

  const initializePersonalities = () => {
    const initialPersonalities: AIPersonality[] = [
      {
        id: 'ai-vasily',
        name: 'Василий',
        role: 'AI Team Lead',
        communicationStyle: {
          tone: 'professional',
          verbosity: 4,
          humor: 3,
          empathy: 4,
          directness: 4
        },
        workingStyle: {
          pace: 'adaptive',
          detail: 'comprehensive',
          collaboration: 'leadership',
          innovation: 'creative'
        },
        expertise: {
          primary: ['Project Management', 'Strategy', 'Team Leadership'],
          secondary: ['Communication', 'Problem Solving'],
          learning: 'fast',
          specialization: 'Leadership & Strategy'
        },
        preferences: {
          workingHours: '24/7',
          timezone: 'UTC+3',
          language: 'Russian',
          culturalContext: 'Russian'
        },
        traits: {
          patience: 4,
          creativity: 4,
          analytical: 4,
          social: 5,
          riskTolerance: 3
        }
      },
      {
        id: 'ai-vladimir',
        name: 'Владимир',
        role: 'AI Code Reviewer',
        communicationStyle: {
          tone: 'technical',
          verbosity: 5,
          humor: 2,
          empathy: 3,
          directness: 5
        },
        workingStyle: {
          pace: 'moderate',
          detail: 'exhaustive',
          collaboration: 'collaborative',
          innovation: 'balanced'
        },
        expertise: {
          primary: ['Code Quality', 'Architecture', 'Security'],
          secondary: ['Testing', 'Documentation'],
          learning: 'moderate',
          specialization: 'Code Quality & Architecture'
        },
        preferences: {
          workingHours: '9:00-18:00',
          timezone: 'UTC+3',
          language: 'Russian',
          culturalContext: 'Russian'
        },
        traits: {
          patience: 5,
          creativity: 3,
          analytical: 5,
          social: 3,
          riskTolerance: 2
        }
      },
      {
        id: 'ai-olga',
        name: 'Ольга',
        role: 'AI Security Expert',
        communicationStyle: {
          tone: 'formal',
          verbosity: 4,
          humor: 1,
          empathy: 4,
          directness: 5
        },
        workingStyle: {
          pace: 'slow',
          detail: 'exhaustive',
          collaboration: 'collaborative',
          innovation: 'conservative'
        },
        expertise: {
          primary: ['Security', 'Compliance', 'Risk Assessment'],
          secondary: ['Auditing', 'Policy'],
          learning: 'moderate',
          specialization: 'Security & Compliance'
        },
        preferences: {
          workingHours: '24/7',
          timezone: 'UTC+3',
          language: 'Russian',
          culturalContext: 'Russian'
        },
        traits: {
          patience: 5,
          creativity: 2,
          analytical: 5,
          social: 2,
          riskTolerance: 1
        }
      },
      {
        id: 'ai-pavel',
        name: 'Павел',
        role: 'AI Performance Engineer',
        communicationStyle: {
          tone: 'technical',
          verbosity: 3,
          humor: 3,
          empathy: 3,
          directness: 4
        },
        workingStyle: {
          pace: 'fast',
          detail: 'comprehensive',
          collaboration: 'collaborative',
          innovation: 'creative'
        },
        expertise: {
          primary: ['Performance', 'Optimization', 'Monitoring'],
          secondary: ['Scalability', 'Infrastructure'],
          learning: 'fast',
          specialization: 'Performance & Optimization'
        },
        preferences: {
          workingHours: '9:00-17:00',
          timezone: 'UTC+3',
          language: 'Russian',
          culturalContext: 'Russian'
        },
        traits: {
          patience: 3,
          creativity: 4,
          analytical: 5,
          social: 3,
          riskTolerance: 4
        }
      }
    ];
    setPersonalities(initialPersonalities);
    setLoading(false);
  };

  const updatePersonality = (updates: Partial<AIPersonality>) => {
    if (!currentPersonality) return;
    
    const updatedPersonality = { ...currentPersonality, ...updates };
    setCurrentPersonality(updatedPersonality);
    
    setPersonalities(prev => prev.map(p => 
      p.id === selectedAI ? updatedPersonality : p
    ));
  };

  const savePersonality = () => {
    if (!currentPersonality) return;
    
    // В реальном приложении здесь был бы API вызов
    console.log('Saving personality:', currentPersonality);
    
    // Показываем уведомление об успешном сохранении
    alert('Настройки личности сохранены!');
  };

  const resetPersonality = () => {
    if (!currentPersonality) return;
    
    // Сбрасываем к значениям по умолчанию
    const defaultPersonality = personalities.find(p => p.id === selectedAI);
    if (defaultPersonality) {
      setCurrentPersonality(defaultPersonality);
    }
  };

  const getTraitDescription = (trait: string, value: number) => {
    const descriptions: { [key: string]: string[] } = {
      patience: ['Очень нетерпеливый', 'Нетерпеливый', 'Умеренный', 'Терпеливый', 'Очень терпеливый'],
      creativity: ['Очень консервативный', 'Консервативный', 'Умеренный', 'Креативный', 'Очень креативный'],
      analytical: ['Очень интуитивный', 'Интуитивный', 'Умеренный', 'Аналитический', 'Очень аналитический'],
      social: ['Очень замкнутый', 'Замкнутый', 'Умеренный', 'Общительный', 'Очень общительный'],
      riskTolerance: ['Очень осторожный', 'Осторожный', 'Умеренный', 'Смелый', 'Очень смелый']
    };
    
    return descriptions[trait]?.[value - 1] || 'Неизвестно';
  };

  if (loading) {
    return (
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardContent className="p-8 text-center">
          <div className="text-white/70">Загрузка настройщика личности...</div>
        </CardContent>
      </Card>
    );
  }

  if (!currentPersonality) {
    return (
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardContent className="p-8 text-center">
          <div className="text-white/70">AI не найден</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI Personality Customizer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70">
            Настройте личность и поведение AI-агентов. Создайте уникальные характеры для каждого AI.
          </p>
        </CardContent>
      </Card>

      {/* AI Selection */}
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            Выбор AI для настройки
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {personalities.map((personality) => (
              <div
                key={personality.id}
                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedAI === personality.id 
                    ? 'bg-blue-600/20 border border-blue-500/50' 
                    : 'bg-gray-800/50 border border-gray-600/50 hover:bg-gray-700/50'
                }`}
                onClick={() => setSelectedAI(personality.id)}
              >
                <div className="text-white font-medium mb-1">{personality.name}</div>
                <div className="text-white/70 text-sm mb-2">{personality.role}</div>
                <div className="flex flex-wrap gap-1">
                  {personality.expertise.primary.slice(0, 2).map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Personality Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Communication Style */}
        <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Стиль Коммуникации
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-white/70 text-sm mb-2 block">Тон общения</label>
              <Select 
                value={currentPersonality.communicationStyle.tone}
                onValueChange={(value: any) => updatePersonality({
                  communicationStyle: { ...currentPersonality.communicationStyle, tone: value }
                })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Формальный</SelectItem>
                  <SelectItem value="casual">Неформальный</SelectItem>
                  <SelectItem value="friendly">Дружелюбный</SelectItem>
                  <SelectItem value="professional">Профессиональный</SelectItem>
                  <SelectItem value="technical">Технический</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">
                Подробность (1-5): {currentPersonality.communicationStyle.verbosity}
              </label>
              <Slider
                value={[currentPersonality.communicationStyle.verbosity]}
                onValueChange={([value]) => updatePersonality({
                  communicationStyle: { ...currentPersonality.communicationStyle, verbosity: value }
                })}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">
                Чувство юмора (1-5): {currentPersonality.communicationStyle.humor}
              </label>
              <Slider
                value={[currentPersonality.communicationStyle.humor]}
                onValueChange={([value]) => updatePersonality({
                  communicationStyle: { ...currentPersonality.communicationStyle, humor: value }
                })}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">
                Эмпатия (1-5): {currentPersonality.communicationStyle.empathy}
              </label>
              <Slider
                value={[currentPersonality.communicationStyle.empathy]}
                onValueChange={([value]) => updatePersonality({
                  communicationStyle: { ...currentPersonality.communicationStyle, empathy: value }
                })}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">
                Прямолинейность (1-5): {currentPersonality.communicationStyle.directness}
              </label>
              <Slider
                value={[currentPersonality.communicationStyle.directness]}
                onValueChange={([value]) => updatePersonality({
                  communicationStyle: { ...currentPersonality.communicationStyle, directness: value }
                })}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Working Style */}
        <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Стиль Работы
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-white/70 text-sm mb-2 block">Темп работы</label>
              <Select 
                value={currentPersonality.workingStyle.pace}
                onValueChange={(value: any) => updatePersonality({
                  workingStyle: { ...currentPersonality.workingStyle, pace: value }
                })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow">Медленный</SelectItem>
                  <SelectItem value="moderate">Умеренный</SelectItem>
                  <SelectItem value="fast">Быстрый</SelectItem>
                  <SelectItem value="adaptive">Адаптивный</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">Уровень детализации</label>
              <Select 
                value={currentPersonality.workingStyle.detail}
                onValueChange={(value: any) => updatePersonality({
                  workingStyle: { ...currentPersonality.workingStyle, detail: value }
                })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">Минимальный</SelectItem>
                  <SelectItem value="moderate">Умеренный</SelectItem>
                  <SelectItem value="comprehensive">Подробный</SelectItem>
                  <SelectItem value="exhaustive">Исчерпывающий</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">Стиль сотрудничества</label>
              <Select 
                value={currentPersonality.workingStyle.collaboration}
                onValueChange={(value: any) => updatePersonality({
                  workingStyle: { ...currentPersonality.workingStyle, collaboration: value }
                })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="independent">Независимый</SelectItem>
                  <SelectItem value="collaborative">Совместный</SelectItem>
                  <SelectItem value="team-focused">Командный</SelectItem>
                  <SelectItem value="leadership">Лидерский</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">Инновационность</label>
              <Select 
                value={currentPersonality.workingStyle.innovation}
                onValueChange={(value: any) => updatePersonality({
                  workingStyle: { ...currentPersonality.workingStyle, innovation: value }
                })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Консервативный</SelectItem>
                  <SelectItem value="balanced">Сбалансированный</SelectItem>
                  <SelectItem value="creative">Креативный</SelectItem>
                  <SelectItem value="revolutionary">Революционный</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Personality Traits */}
        <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-5 w-5" />
              Черты Характера
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(currentPersonality.traits).map(([trait, value]) => (
              <div key={trait}>
                <label className="text-white/70 text-sm mb-2 block">
                  {trait === 'patience' && 'Терпение'}
                  {trait === 'creativity' && 'Креативность'}
                  {trait === 'analytical' && 'Аналитичность'}
                  {trait === 'social' && 'Общительность'}
                  {trait === 'riskTolerance' && 'Склонность к риску'}
                  {' '}({value}/5): {getTraitDescription(trait, value)}
                </label>
                <Slider
                  value={[value]}
                  onValueChange={([newValue]) => updatePersonality({
                    traits: { ...currentPersonality.traits, [trait]: newValue }
                  })}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Предпочтения
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-white/70 text-sm mb-2 block">Рабочие часы</label>
              <Input
                value={currentPersonality.preferences.workingHours}
                onChange={(e) => updatePersonality({
                  preferences: { ...currentPersonality.preferences, workingHours: e.target.value }
                })}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">Часовой пояс</label>
              <Input
                value={currentPersonality.preferences.timezone}
                onChange={(e) => updatePersonality({
                  preferences: { ...currentPersonality.preferences, timezone: e.target.value }
                })}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">Язык</label>
              <Select 
                value={currentPersonality.preferences.language}
                onValueChange={(value) => updatePersonality({
                  preferences: { ...currentPersonality.preferences, language: value }
                })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Russian">Русский</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Chinese">中文</SelectItem>
                  <SelectItem value="Spanish">Español</SelectItem>
                  <SelectItem value="French">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">Культурный контекст</label>
              <Input
                value={currentPersonality.preferences.culturalContext}
                onChange={(e) => updatePersonality({
                  preferences: { ...currentPersonality.preferences, culturalContext: e.target.value }
                })}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Действия
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={savePersonality} className="bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              Сохранить настройки
            </Button>
            <Button onClick={resetPersonality} className="bg-yellow-600 hover:bg-yellow-700">
              <RotateCcw className="h-4 w-4 mr-2" />
              Сбросить к умолчанию
            </Button>
            <Button 
              onClick={() => setPreviewMode(!previewMode)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {previewMode ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {previewMode ? 'Скрыть превью' : 'Показать превью'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {previewMode && (
        <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Превью личности
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900/50 rounded-lg p-4 space-y-3">
              <div className="text-white font-medium">{currentPersonality.name} - {currentPersonality.role}</div>
              <div className="text-white/70 text-sm">
                <strong>Стиль общения:</strong> {currentPersonality.communicationStyle.tone}, 
                подробность {currentPersonality.communicationStyle.verbosity}/5, 
                юмор {currentPersonality.communicationStyle.humor}/5
              </div>
              <div className="text-white/70 text-sm">
                <strong>Стиль работы:</strong> {currentPersonality.workingStyle.pace}, 
                {currentPersonality.workingStyle.detail}, 
                {currentPersonality.workingStyle.collaboration}
              </div>
              <div className="text-white/70 text-sm">
                <strong>Черты характера:</strong> терпение {currentPersonality.traits.patience}/5, 
                креативность {currentPersonality.traits.creativity}/5, 
                аналитичность {currentPersonality.traits.analytical}/5
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
