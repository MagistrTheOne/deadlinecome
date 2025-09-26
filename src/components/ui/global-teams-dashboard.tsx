"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { 
  Globe, 
  Users, 
  MessageSquare, 
  Clock, 
  Languages,
  TrendingUp,
  MapPin,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface LanguageSupport {
  code: string;
  name: string;
  nativeName: string;
  aiSupport: boolean;
  translationQuality: number;
  culturalAdaptation: boolean;
}

interface GlobalTeamMember {
  id: string;
  name: string;
  role: string;
  languages: string[];
  timezone: string;
  culturalContext: string;
  workingHours: {
    start: string;
    end: string;
    days: string[];
  };
  communicationStyle: string;
  isActive: boolean;
}

interface GlobalTeamStatus {
  activeMembers: number;
  timezones: string[];
  languages: string[];
  coverage: {
    region: string;
    coverage: number;
    members: number;
  }[];
}

export default function GlobalTeamsDashboard() {
  const [languages, setLanguages] = useState<LanguageSupport[]>([]);
  const [members, setMembers] = useState<GlobalTeamMember[]>([]);
  const [status, setStatus] = useState<GlobalTeamStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('ALL');
  const [selectedRegion, setSelectedRegion] = useState('ALL');

  useEffect(() => {
    fetchGlobalTeamsData();
  }, []);

  const fetchGlobalTeamsData = async () => {
    try {
      setLoading(true);
      
      // Fetch languages
      const languagesResponse = await fetch('/api/ai/global-teams?action=languages');
      if (languagesResponse.ok) {
        const languagesData = await languagesResponse.json();
        setLanguages(languagesData.languages || []);
      }

      // Fetch members
      const membersResponse = await fetch('/api/ai/global-teams?action=members');
      if (membersResponse.ok) {
        const membersData = await membersResponse.json();
        setMembers(membersData.members || []);
      }

      // Fetch status
      const statusResponse = await fetch('/api/ai/global-teams?action=status');
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setStatus(statusData);
      }
    } catch (error) {
      console.error('Error fetching global teams data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 90) return 'text-green-500';
    if (quality >= 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getCoverageColor = (coverage: number) => {
    if (coverage >= 85) return 'text-green-500';
    if (coverage >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const filteredLanguages = languages.filter(lang => 
    selectedLanguage === 'ALL' || lang.code === selectedLanguage
  );

  const filteredMembers = members.filter(member => 
    selectedRegion === 'ALL' || member.culturalContext === selectedRegion
  );

  if (loading) {
    return (
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Global Teams
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-white/70">Загрузка глобальных команд...</div>
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
            <Globe className="h-5 w-5" />
            Global Teams
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70">
            Мультиязычная поддержка и глобальные AI-команды для международных проектов
          </p>
        </CardContent>
      </Card>

      {/* Global Status */}
      {status && (
        <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Глобальный Статус
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{status.activeMembers}</div>
                <div className="text-white/70 text-sm">Активных участников</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{status.timezones.length}</div>
                <div className="text-white/70 text-sm">Часовых поясов</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{status.languages.length}</div>
                <div className="text-white/70 text-sm">Языков</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{status.coverage.length}</div>
                <div className="text-white/70 text-sm">Регионов</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Regional Coverage */}
      {status && (
        <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Покрытие Регионов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {status?.coverage.map((region, index) => (
                <div key={index} className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-lg font-bold text-white">{region.region}</div>
                  <div className={`text-2xl font-bold ${getCoverageColor(region.coverage)}`}>
                    {region.coverage}%
                  </div>
                  <div className="text-white/70 text-sm">{region.members} участников</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Language Support */}
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Поддерживаемые Языки
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLanguages.map((language) => (
              <div key={language.code} className="p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white font-medium">{language.name}</div>
                  <Badge variant={language.aiSupport ? "default" : "secondary"}>
                    {language.aiSupport ? "AI" : "Manual"}
                  </Badge>
                </div>
                <div className="text-white/70 text-sm mb-2">{language.nativeName}</div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Качество:</span>
                  <span className={`font-medium ${getQualityColor(language.translationQuality)}`}>
                    {language.translationQuality}%
                  </span>
                </div>
                {language.culturalAdaptation && (
                  <div className="flex items-center gap-1 mt-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-green-500 text-xs">Культурная адаптация</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Global Team Members */}
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            Глобальная Команда
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMembers.map((member) => (
              <div key={member.id} className="p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-white font-medium">{member.name}</div>
                  <div className="flex items-center gap-2">
                    <Badge variant={member.isActive ? "default" : "secondary"}>
                      {member.isActive ? "Активен" : "Неактивен"}
                    </Badge>
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                </div>
                
                <div className="text-white/70 text-sm mb-2">{member.role}</div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Languages className="h-4 w-4 text-blue-500" />
                    <span className="text-white/70 text-sm">
                      {member.languages.length} языков
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-500" />
                    <span className="text-white/70 text-sm">
                      {member.workingHours.start} - {member.workingHours.end}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-purple-500" />
                    <span className="text-white/70 text-sm">
                      {member.timezone}
                    </span>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="text-white/70 text-sm mb-1">Стиль коммуникации:</div>
                  <div className="text-white text-sm">{member.communicationStyle}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Быстрые Действия
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <MessageSquare className="h-4 w-4 mr-2" />
              Перевести сообщение
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <Calendar className="h-4 w-4 mr-2" />
              Запланировать встречу
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Globe className="h-4 w-4 mr-2" />
              Адаптировать коммуникацию
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
