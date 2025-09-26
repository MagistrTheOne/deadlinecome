"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Eye, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Users, 
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Lightbulb,
  BarChart3,
  Zap,
  Shield,
  Globe
} from "lucide-react";

interface ProjectMetrics {
  projectId: string;
  complexity: number;
  teamSize: number;
  budget: number;
  timeline: number;
  technologyStack: string[];
  teamExperience: number;
  clientRequirements: string[];
  marketConditions: number;
  competition: number;
}

interface ProjectPrediction {
  id: string;
  projectId: string;
  prediction: {
    successProbability: number;
    estimatedDuration: number;
    riskLevel: string;
    budgetEstimate: number;
    teamSizeRecommendation: number;
    technologyStack: string[];
    potentialChallenges: string[];
    successFactors: string[];
    recommendations: string[];
  };
  confidence: number;
  timestamp: string;
  basedOn: {
    similarProjects: number;
    historicalData: number;
    teamExperience: number;
  };
}

interface RiskAssessment {
  id: string;
  projectId: string;
  risks: {
    category: string;
    risk: string;
    probability: number;
    impact: number;
    mitigation: string;
    priority: string;
  }[];
  overallRiskScore: number;
  recommendations: string[];
  timestamp: string;
}

interface TechnologyTrend {
  name: string;
  popularity: number;
  growthRate: number;
  adoptionRate: number;
  futurePotential: number;
  category: string;
  description: string;
}

export default function AIProjectPredictor() {
  const [metrics, setMetrics] = useState<ProjectMetrics>({
    projectId: '',
    complexity: 5,
    teamSize: 5,
    budget: 50000,
    timeline: 90,
    technologyStack: [],
    teamExperience: 6,
    clientRequirements: [],
    marketConditions: 7,
    competition: 5
  });
  
  const [prediction, setPrediction] = useState<ProjectPrediction | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [technologyTrends, setTechnologyTrends] = useState<TechnologyTrend[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("predict");

  useEffect(() => {
    fetchTechnologyTrends();
  }, []);

  const fetchTechnologyTrends = async () => {
    try {
      const response = await fetch('/api/ai/project-predictor?action=technology-trends');
      const data = await response.json();
      setTechnologyTrends(data.trends);
    } catch (error) {
      console.error('Ошибка загрузки трендов технологий:', error);
    }
  };

  const predictProject = async () => {
    if (!metrics.projectId.trim()) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/ai/project-predictor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'predict',
          projectId: metrics.projectId,
          metrics
        })
      });
      
      const data = await response.json();
      setPrediction(data.prediction);
      setActiveTab("result");
    } catch (error) {
      console.error('Ошибка предсказания проекта:', error);
    } finally {
      setLoading(false);
    }
  };

  const assessRisks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai/project-predictor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assess-risks',
          projectId: metrics.projectId,
          metrics
        })
      });
      
      const data = await response.json();
      setRiskAssessment(data.riskAssessment);
      setActiveTab("risks");
    } catch (error) {
      console.error('Ошибка оценки рисков:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-orange-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getRiskLevelBg = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Eye className="h-6 w-6 text-white" />
            AI Предсказатель Проектов
          </h2>
          <p className="text-white/60">Предсказание успеха и анализ рисков проектов</p>
        </div>
        <Button 
          onClick={() => setActiveTab("predict")}
          className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
        >
          <Zap className="h-4 w-4 mr-2" />
          Новое предсказание
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-black/50">
          <TabsTrigger value="predict" className="text-white">Предсказание</TabsTrigger>
          <TabsTrigger value="result" className="text-white">Результат</TabsTrigger>
          <TabsTrigger value="risks" className="text-white">Риски</TabsTrigger>
          <TabsTrigger value="trends" className="text-white">Тренды</TabsTrigger>
        </TabsList>

        {/* Форма предсказания */}
        <TabsContent value="predict" className="space-y-6">
          <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-400" />
                Параметры проекта
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-white/70 text-sm mb-2 block">ID проекта</label>
                  <Input
                    value={metrics.projectId}
                    onChange={(e) => setMetrics({ ...metrics, projectId: e.target.value })}
                    placeholder="project-123"
                    className="bg-black/50 border-white/20 text-white"
                  />
                </div>

                <div>
                  <label className="text-white/70 text-sm mb-2 block">Сложность (1-10)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={metrics.complexity}
                      onChange={(e) => setMetrics({ ...metrics, complexity: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-white font-medium w-8">{metrics.complexity}</span>
                  </div>
                </div>

                <div>
                  <label className="text-white/70 text-sm mb-2 block">Размер команды</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={metrics.teamSize}
                      onChange={(e) => setMetrics({ ...metrics, teamSize: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-white font-medium w-8">{metrics.teamSize}</span>
                  </div>
                </div>

                <div>
                  <label className="text-white/70 text-sm mb-2 block">Бюджет ($)</label>
                  <Input
                    type="number"
                    value={metrics.budget}
                    onChange={(e) => setMetrics({ ...metrics, budget: parseInt(e.target.value) })}
                    className="bg-black/50 border-white/20 text-white"
                  />
                </div>

                <div>
                  <label className="text-white/70 text-sm mb-2 block">Срок (дни)</label>
                  <Input
                    type="number"
                    value={metrics.timeline}
                    onChange={(e) => setMetrics({ ...metrics, timeline: parseInt(e.target.value) })}
                    className="bg-black/50 border-white/20 text-white"
                  />
                </div>

                <div>
                  <label className="text-white/70 text-sm mb-2 block">Опыт команды (1-10)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={metrics.teamExperience}
                      onChange={(e) => setMetrics({ ...metrics, teamExperience: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-white font-medium w-8">{metrics.teamExperience}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={predictProject}
                  disabled={loading || !metrics.projectId.trim()}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Анализ...
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Предсказать успех
                    </>
                  )}
                </Button>
                <Button 
                  onClick={assessRisks}
                  disabled={loading || !metrics.projectId.trim()}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Оценить риски
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Результат предсказания */}
        <TabsContent value="result" className="space-y-6">
          {prediction && (
            <div className="space-y-6">
              {/* Основные метрики */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      {prediction.prediction.successProbability}%
                    </div>
                    <div className="text-white/70 text-sm">Вероятность успеха</div>
                    <div className="mt-2">
                      <Progress 
                        value={prediction.prediction.successProbability} 
                        className="h-2 bg-white/20"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      {prediction.prediction.estimatedDuration}
                    </div>
                    <div className="text-white/70 text-sm">Дней до завершения</div>
                    <Clock className="h-4 w-4 text-blue-400 mx-auto mt-2" />
                  </CardContent>
                </Card>

                <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      ${prediction.prediction.budgetEstimate.toLocaleString()}
                    </div>
                    <div className="text-white/70 text-sm">Оценка бюджета</div>
                    <DollarSign className="h-4 w-4 text-green-400 mx-auto mt-2" />
                  </CardContent>
                </Card>

                <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      {prediction.confidence}%
                    </div>
                    <div className="text-white/70 text-sm">Уверенность</div>
                    <Shield className="h-4 w-4 text-purple-400 mx-auto mt-2" />
                  </CardContent>
                </Card>
              </div>

              {/* Уровень риска */}
              <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-400" />
                    Уровень риска
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Badge className={`${getRiskLevelBg(prediction.prediction.riskLevel)} text-white text-lg px-4 py-2`}>
                      {prediction.prediction.riskLevel.toUpperCase()}
                    </Badge>
                    <div className="flex-1">
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${
                            prediction.prediction.riskLevel === 'low' ? 'bg-green-500' :
                            prediction.prediction.riskLevel === 'medium' ? 'bg-yellow-500' :
                            prediction.prediction.riskLevel === 'high' ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ 
                            width: prediction.prediction.riskLevel === 'low' ? '25%' :
                                   prediction.prediction.riskLevel === 'medium' ? '50%' :
                                   prediction.prediction.riskLevel === 'high' ? '75%' : '100%'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Рекомендации по команде */}
              <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-400" />
                    Рекомендации по команде
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-white font-medium mb-3">Рекомендуемый размер команды</h4>
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-400" />
                        <span className="text-white text-lg font-bold">
                          {prediction.prediction.teamSizeRecommendation} человек
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-3">Рекомендуемые технологии</h4>
                      <div className="flex flex-wrap gap-2">
                        {prediction.prediction.technologyStack.map((tech, index) => (
                          <Badge key={index} className="bg-blue-500 text-white">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Потенциальные вызовы */}
              <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    Потенциальные вызовы
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {prediction.prediction.potentialChallenges.map((challenge, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                        <XCircle className="h-4 w-4 text-red-400 mt-0.5" />
                        <span className="text-white/80 text-sm">{challenge}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Факторы успеха */}
              <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    Факторы успеха
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {prediction.prediction.successFactors.map((factor, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                        <span className="text-white/80 text-sm">{factor}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Рекомендации */}
              <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-400" />
                    Рекомендации
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {prediction.prediction.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                        <Lightbulb className="h-4 w-4 text-yellow-400 mt-0.5" />
                        <span className="text-white/80 text-sm">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Анализ рисков */}
        <TabsContent value="risks" className="space-y-6">
          {riskAssessment && (
            <div className="space-y-6">
              {/* Общая оценка рисков */}
              <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-orange-400" />
                    Общая оценка рисков
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-white">
                      {riskAssessment.overallRiskScore}%
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-700 rounded-full h-4">
                        <div 
                          className="bg-white h-4 rounded-full"
                          style={{ width: `${riskAssessment.overallRiskScore}%` }}
                        ></div>
                      </div>
                      <div className="text-white/70 text-sm mt-2">
                        Уровень риска: {riskAssessment.overallRiskScore >= 80 ? 'Критический' :
                                       riskAssessment.overallRiskScore >= 60 ? 'Высокий' :
                                       riskAssessment.overallRiskScore >= 40 ? 'Средний' : 'Низкий'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Детальные риски */}
              <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    Детальные риски
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {riskAssessment.risks.map((risk, index) => (
                      <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-white font-medium">{risk.risk}</h4>
                            <div className="text-white/60 text-sm capitalize">{risk.category}</div>
                          </div>
                          <Badge className={`${getPriorityColor(risk.priority)} bg-transparent border`}>
                            {risk.priority.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <div className="text-white/70 text-sm">Вероятность</div>
                            <div className="flex items-center gap-2">
                              <Progress value={risk.probability * 100} className="flex-1 h-2 bg-white/20" />
                              <span className="text-white font-medium">{Math.round(risk.probability * 100)}%</span>
                            </div>
                          </div>
                          <div>
                            <div className="text-white/70 text-sm">Влияние</div>
                            <div className="flex items-center gap-2">
                              <Progress value={risk.impact * 100} className="flex-1 h-2 bg-white/20" />
                              <span className="text-white font-medium">{Math.round(risk.impact * 100)}%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-white/80 text-sm">
                          <strong>Смягчение:</strong> {risk.mitigation}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Рекомендации по управлению рисками */}
              <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-400" />
                    Рекомендации по управлению рисками
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {riskAssessment.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                        <Lightbulb className="h-4 w-4 text-yellow-400 mt-0.5" />
                        <span className="text-white/80 text-sm">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Тренды технологий */}
        <TabsContent value="trends" className="space-y-6">
          <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                Тренды технологий
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {technologyTrends.map((trend, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-medium">{trend.name}</h4>
                      <Badge className="bg-blue-500 text-white">{trend.category}</Badge>
                    </div>
                    
                    <p className="text-white/70 text-sm mb-4">{trend.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Популярность</span>
                        <span className="text-white">{trend.popularity}%</span>
                      </div>
                      <Progress value={trend.popularity} className="h-2 bg-white/20" />
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Рост</span>
                        <span className="text-white">{trend.growthRate}%</span>
                      </div>
                      <Progress value={trend.growthRate} className="h-2 bg-white/20" />
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Потенциал</span>
                        <span className="text-white">{trend.futurePotential}%</span>
                      </div>
                      <Progress value={trend.futurePotential} className="h-2 bg-white/20" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
