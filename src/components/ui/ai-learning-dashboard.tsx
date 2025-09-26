"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Progress } from './progress';
import { Badge } from './badge';
import { Brain, TrendingUp, BookOpen, Target, Lightbulb } from 'lucide-react';

interface LearningInsights {
  personality: {
    name: string;
    specialization: string;
    expertise: { [domain: string]: number };
  };
  recentLessons: string[];
  expertiseGrowth: { [domain: string]: number };
  recommendations: string[];
}

export default function AILearningDashboard() {
  const [insights, setInsights] = useState<LearningInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAI, setSelectedAI] = useState('ai-vasily');

  useEffect(() => {
    fetchLearningInsights();
  }, [selectedAI]);

  const fetchLearningInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ai/learning?aiId=${selectedAI}`);
      if (response.ok) {
        const data = await response.json();
        setInsights(data);
      }
    } catch (error) {
      console.error('Error fetching learning insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const aiOptions = [
    { id: 'ai-vasily', name: 'Василий (Team Lead)' },
    { id: 'ai-vladimir', name: 'Владимир (Code Reviewer)' },
    { id: 'ai-olga', name: 'Ольга (Security Expert)' },
    { id: 'ai-pavel', name: 'Павел (Performance Engineer)' }
  ];

  if (loading) {
    return (
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Learning System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-white/70">Загрузка данных обучения...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Selection */}
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Learning System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {aiOptions.map(ai => (
              <Button
                key={ai.id}
                variant={selectedAI === ai.id ? "default" : "outline"}
                onClick={() => setSelectedAI(ai.id)}
                className="text-sm"
              >
                {ai.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {insights && (
        <>
          {/* Personality & Expertise */}
          <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="h-5 w-5" />
                Личность и Экспертиза
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-white font-medium mb-2">{insights.personality.name}</h4>
                <p className="text-white/70 text-sm">{insights.personality.specialization}</p>
              </div>
              
              <div>
                <h5 className="text-white font-medium mb-2">Уровень экспертизы:</h5>
                <div className="space-y-2">
                  {Object.entries(insights.personality.expertise).map(([domain, level]) => (
                    <div key={domain} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">{domain}</span>
                        <span className="text-white">{level}%</span>
                      </div>
                      <Progress value={level} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Lessons */}
          <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Последние Уроки
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insights.recentLessons.length > 0 ? (
                <div className="space-y-2">
                  {insights.recentLessons.map((lesson, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-white/70 text-sm">{lesson}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/70 text-sm">Пока нет извлеченных уроков</p>
              )}
            </CardContent>
          </Card>

          {/* Expertise Growth */}
          <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Рост Экспертизы
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(insights.expertiseGrowth).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(insights.expertiseGrowth).map(([domain, growth]) => (
                    <div key={domain} className="flex justify-between items-center">
                      <span className="text-white/70 text-sm">{domain}</span>
                      <Badge variant={growth > 0 ? "default" : "secondary"}>
                        {growth > 0 ? `+${growth}` : growth}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/70 text-sm">Недостаточно данных для анализа роста</p>
              )}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Рекомендации
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insights.recommendations.length > 0 ? (
                <div className="space-y-2">
                  {insights.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-white/70 text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/70 text-sm">Нет активных рекомендаций</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
