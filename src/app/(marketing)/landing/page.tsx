"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  X, 
  Star, 
  Zap, 
  Brain, 
  Users, 
  BarChart3, 
  Shield, 
  Clock, 
  Target,
  ArrowRight,
  Sparkles,
  Rocket,
  Crown,
  Building
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Smart Workflows",
    description: "Автоматическое создание задач на основе коммитов, умное назначение исполнителей и AI-анализ времени выполнения",
    category: "AI & Automation"
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics Dashboard", 
    description: "Живые метрики команды с WebSocket обновлениями, предиктивная аналитика и heatmap активности",
    category: "Analytics"
  },
  {
    icon: Zap,
    title: "Advanced Automation Rules",
    description: "Workflow automation с условными триггерами, автоматические уведомления и интеграции",
    category: "AI & Automation"
  },
  {
    icon: Users,
    title: "Enhanced Collaboration",
    description: "Real-time совместное редактирование, комментарии с упоминаниями и видеозвонки",
    category: "Collaboration"
  },
  {
    icon: Target,
    title: "Smart Sprint Planning",
    description: "AI-помощник для планирования спринтов, автоматическое распределение задач по приоритетам",
    category: "Planning"
  },
  {
    icon: Shield,
    title: "Advanced Security",
    description: "Роль-базированный доступ, audit log, двухфакторная аутентификация и SSO",
    category: "Security"
  }
];

const pricingPlans = [
  {
    name: "Free",
    price: "0",
    period: "навсегда",
    description: "Идеально для небольших команд и личных проектов",
    features: [
      "До 5 участников",
      "Неограниченные проекты",
      "Базовые доски задач",
      "AI-ассистент (10 запросов/день)",
      "Базовая аналитика",
      "Email поддержка"
    ],
    limitations: [
      "Нет интеграций",
      "Нет автоматизации",
      "Ограниченная аналитика"
    ],
    buttonText: "Начать бесплатно",
    popular: false,
    icon: Star
  },
  {
    name: "Pro",
    price: "29",
    period: "в месяц",
    description: "Для растущих команд, которым нужна мощная автоматизация",
    features: [
      "До 25 участников",
      "Неограниченные проекты",
      "Продвинутые доски и workflow",
      "AI-ассистент (безлимит)",
      "Полная аналитика и отчеты",
      "Интеграции с популярными сервисами",
      "Автоматизация и правила",
      "Приоритетная поддержка",
      "Экспорт данных"
    ],
    limitations: [],
    buttonText: "Попробовать Pro",
    popular: true,
    icon: Rocket
  },
  {
    name: "Enterprise",
    price: "99",
    period: "в месяц",
    description: "Для крупных организаций с особыми требованиями",
    features: [
      "Неограниченные участники",
      "Неограниченные проекты",
      "Все функции Pro",
      "Кастомные интеграции",
      "SSO и LDAP",
      "Расширенная безопасность",
      "Dedicated менеджер",
      "SLA 99.9%",
      "On-premise развертывание",
      "Кастомные отчеты",
      "API доступ"
    ],
    limitations: [],
    buttonText: "Связаться с нами",
    popular: false,
    icon: Crown
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-gray-900"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="bg-analytics-violet/20 text-analytics-violet border-analytics-violet/30 mb-6">
              <Sparkles className="w-3 h-3 mr-1" />
              Новая эра управления проектами
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent">
              DeadLine
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 mb-8 leading-relaxed">
              AI-управляемая платформа для команд, которая превращает хаос в порядок. 
              <br />
              <span className="text-analytics-cyan">Умная автоматизация</span> + <span className="text-analytics-emerald">Предиктивная аналитика</span> + <span className="text-analytics-violet">Real-time коллаборация</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-analytics-violet hover:bg-analytics-violet/80 text-white px-8 py-4 text-lg font-semibold"
                asChild
              >
                <Link href="/sign-up">
                  Начать бесплатно
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg"
                asChild
              >
                <Link href="#demo">
                  Посмотреть демо
                </Link>
              </Button>
            </div>
            
            <p className="text-white/60 mt-4 text-sm">
              Без кредитной карты • Настройка за 2 минуты • 14 дней бесплатно
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Мощные возможности для <span className="text-analytics-cyan">современных команд</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              От AI-автоматизации до предиктивной аналитики — все инструменты, 
              которые нужны вашей команде для достижения целей
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-glass-dark backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-analytics-violet/20 rounded-lg group-hover:bg-analytics-violet/30 transition-colors">
                      <feature.icon className="h-6 w-6 text-analytics-violet" />
                    </div>
                    <Badge className="bg-analytics-cyan/20 text-analytics-cyan border-analytics-cyan/30 text-xs">
                      {feature.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-white/70 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Простые и <span className="text-analytics-emerald">прозрачные</span> тарифы
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Выберите план, который подходит вашей команде. 
              Всегда можно изменить или отменить в любой момент.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative bg-glass-dark backdrop-blur-sm border transition-all duration-300 hover:scale-105 ${
                  plan.popular 
                    ? 'border-analytics-violet/50 shadow-2xl shadow-analytics-violet/20' 
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-analytics-violet text-white px-4 py-1">
                      <Crown className="w-3 h-3 mr-1" />
                      Популярный
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-full ${
                      plan.popular ? 'bg-analytics-violet/20' : 'bg-white/10'
                    }`}>
                      <plan.icon className={`h-8 w-8 ${
                        plan.popular ? 'text-analytics-violet' : 'text-white'
                      }`} />
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                  <CardDescription className="text-white/70 mb-4">
                    {plan.description}
                  </CardDescription>
                  
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-white">${plan.price}</span>
                    <span className="text-white/60 ml-2">/{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent>
                  <Button 
                    className={`w-full mb-6 ${
                      plan.popular 
                        ? 'bg-analytics-violet hover:bg-analytics-violet/80' 
                        : 'bg-white/10 hover:bg-white/20 border border-white/20'
                    } text-white`}
                    size="lg"
                    asChild
                  >
                    <Link href="/sign-up">
                      {plan.buttonText}
                    </Link>
                  </Button>

                  <div className="space-y-4">
                    <h4 className="text-white font-semibold mb-3">Что включено:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-analytics-emerald mt-0.5 flex-shrink-0" />
                          <span className="text-white/80 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {plan.limitations.length > 0 && (
                      <>
                        <h4 className="text-white/60 font-semibold mb-3 mt-6">Ограничения:</h4>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation, limitationIndex) => (
                            <li key={limitationIndex} className="flex items-start gap-2">
                              <X className="h-4 w-4 text-white/40 mt-0.5 flex-shrink-0" />
                              <span className="text-white/50 text-sm">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-white/60 mb-4">
              Нужен индивидуальный план для большой команды?
            </p>
            <Button 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10"
              asChild
            >
              <Link href="/contact">
                <Building className="w-4 h-4 mr-2" />
                Связаться с отделом продаж
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-analytics-violet/10 to-analytics-cyan/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Готовы <span className="text-analytics-emerald">революционизировать</span> управление проектами?
          </h2>
          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            Присоединяйтесь к тысячам команд, которые уже используют DeadLine 
            для достижения своих целей быстрее и эффективнее.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-analytics-violet hover:bg-analytics-violet/80 text-white px-8 py-4 text-lg font-semibold"
              asChild
            >
              <Link href="/sign-up">
                Начать бесплатно
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg"
              asChild
            >
              <Link href="/demo">
                Запросить демо
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
