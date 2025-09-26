"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { 
  Building2, 
  Search, 
  Star, 
  Clock, 
  DollarSign, 
  Users, 
  Shield,
  CheckCircle,
  TrendingUp,
  Globe
} from 'lucide-react';

interface IndustryTemplate {
  id: string;
  name: string;
  industry: string;
  description: string;
  features: string[];
  aiTeam: string[];
  workflows: Array<{
    name: string;
    description: string;
    steps: string[];
    automation: string[];
  }>;
  integrations: string[];
  compliance: string[];
  pricing: {
    basic: number;
    professional: number;
    enterprise: number;
  };
  estimatedSetupTime: number;
  successRate: number;
}

export default function IndustryTemplatesDashboard() {
  const [templates, setTemplates] = useState<IndustryTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('ALL');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai/industry-templates?action=list');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const industries = [
    'ALL',
    'Financial Technology',
    'Healthcare',
    'E-commerce',
    'Education Technology'
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = selectedIndustry === 'ALL' || template.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-500';
    if (rate >= 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Industry Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-white/70">Загрузка шаблонов...</div>
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
            <Building2 className="h-5 w-5" />
            Industry Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70">
            Готовые решения для различных отраслей с предварительно настроенными AI-командами
          </p>
        </CardContent>
      </Card>

      {/* Search & Filters */}
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Search className="h-5 w-5" />
            Поиск и Фильтры
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Поиск шаблонов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
            />
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Выберите отрасль" />
              </SelectTrigger>
              <SelectContent>
                {industries.map(industry => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="bg-black/50 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-xl">{template.name}</CardTitle>
                <Badge variant="outline" className="text-blue-400 border-blue-400">
                  {template.industry}
                </Badge>
              </div>
              <p className="text-white/70 text-sm">{template.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Key Features */}
              <div>
                <h4 className="text-white font-medium mb-2">Ключевые возможности:</h4>
                <div className="flex flex-wrap gap-1">
                  {template.features.slice(0, 4).map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {template.features.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.features.length - 4}
                    </Badge>
                  )}
                </div>
              </div>

              {/* AI Team */}
              <div>
                <h4 className="text-white font-medium mb-2">AI Команда:</h4>
                <div className="flex flex-wrap gap-1">
                  {template.aiTeam.map((ai, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {ai}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Compliance */}
              <div>
                <h4 className="text-white font-medium mb-2">Соответствие стандартам:</h4>
                <div className="flex flex-wrap gap-1">
                  {template.compliance.map((standard, index) => (
                    <Badge key={index} variant="outline" className="text-xs text-green-400 border-green-400">
                      {standard}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-white/70 text-sm">{template.estimatedSetupTime} дней</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className={`text-sm font-medium ${getSuccessRateColor(template.successRate)}`}>
                    {template.successRate}%
                  </span>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-2">
                <h4 className="text-white font-medium">Ценообразование:</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center">
                    <div className="text-white/70">Basic</div>
                    <div className="text-white font-medium">${template.pricing.basic}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white/70">Professional</div>
                    <div className="text-white font-medium">${template.pricing.professional}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white/70">Enterprise</div>
                    <div className="text-white font-medium">${template.pricing.enterprise}</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Building2 className="h-4 w-4 mr-2" />
                  Выбрать шаблон
                </Button>
                <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
                  <Globe className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
          <CardContent className="text-center py-8">
            <Building2 className="h-12 w-12 text-white/30 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">Шаблоны не найдены</h3>
            <p className="text-white/70">Попробуйте изменить критерии поиска</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
