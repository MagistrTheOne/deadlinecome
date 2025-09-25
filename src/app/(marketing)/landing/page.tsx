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
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-lg">D</span>
              </div>
              <span className="text-xl font-bold text-white">DeadLine</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-white hover:text-white/80 transition-colors">Возможности</a>
              <a href="#pricing" className="text-white hover:text-white/80 transition-colors">Тарифы</a>
              <a href="/billing" className="text-white hover:text-white/80 transition-colors">Биллинг</a>
              <a href="#contact" className="text-white hover:text-white/80 transition-colors">Контакты</a>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/sign-in">Войти</Link>
              </Button>
              <Button variant="default" asChild>
                <Link href="/sign-up">Начать бесплатно</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20">
        <div className="absolute inset-0 bg-black"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="bg-white/10 text-white border-white/20 mb-6 backdrop-blur-sm">
              <Sparkles className="w-3 h-3 mr-1" />
              Новая эра управления проектами
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
              DeadLine
            </h1>
            
            <p className="text-xl md:text-2xl text-white mb-8 leading-relaxed">
              AI-управляемая платформа для команд, которая превращает хаос в порядок. 
              <br />
              <span className="text-white font-semibold">Умная автоматизация</span> + <span className="text-white font-semibold">Предиктивная аналитика</span> + <span className="text-white font-semibold">Real-time коллаборация</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                variant="default"
                className="px-8 py-4 text-lg font-semibold"
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
                className="px-8 py-4 text-lg"
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
      <section id="features" className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Мощные возможности для <span className="text-white font-bold">современных команд</span>
            </h2>
            <p className="text-xl text-white max-w-3xl mx-auto">
              От AI-автоматизации до предиктивной аналитики — все инструменты, 
              которые нужны вашей команде для достижения целей
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-black/50 backdrop-blur-sm border-white/20 hover:border-white/40 transition-all duration-300 group hover:bg-black/70">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge className="bg-white/10 text-white border-white/20 text-xs">
                      {feature.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-white text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Простые и <span className="text-white font-bold">прозрачные</span> тарифы
            </h2>
            <p className="text-xl text-white max-w-2xl mx-auto">
              Выберите план, который подходит вашей команде. 
              Всегда можно изменить или отменить в любой момент.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative bg-black/50 backdrop-blur-sm border transition-all duration-300 hover:scale-105 ${
                  plan.popular 
                    ? 'border-white/50 shadow-2xl shadow-white/10' 
                    : 'border-white/20 hover:border-white/40'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-white text-black px-4 py-1">
                      <Crown className="w-3 h-3 mr-1" />
                      Популярный
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-full ${
                      plan.popular ? 'bg-white/20' : 'bg-white/10'
                    }`}>
                      <plan.icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                  <CardDescription className="text-white mb-4">
                    {plan.description}
                  </CardDescription>
                  
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-white">${plan.price}</span>
                    <span className="text-white/60 ml-2">/{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent>
                  <Button 
                    variant={plan.popular ? "default" : "glass"}
                    className="w-full mb-6"
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
                          <Check className="h-4 w-4 text-white mt-0.5 flex-shrink-0" />
                          <span className="text-white text-sm">{feature}</span>
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
      <section id="contact" className="py-20 bg-black">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Готовы <span className="text-white font-bold">революционизировать</span> управление проектами?
          </h2>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            Присоединяйтесь к тысячам команд, которые уже используют DeadLine 
            для достижения своих целей быстрее и эффективнее.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              variant="default"
              className="px-8 py-4 text-lg font-semibold"
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
              className="px-8 py-4 text-lg"
              asChild
            >
              <Link href="/demo">
                Запросить демо
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-white/10 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-black font-bold text-lg">D</span>
                </div>
                <span className="text-xl font-bold text-white">DeadLine</span>
              </div>
              <p className="text-white/70 mb-4 max-w-md">
                AI-управляемая платформа для команд, которая превращает хаос в порядок. 
                Умная автоматизация, предиктивная аналитика и real-time коллаборация.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                  Twitter
                </Button>
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                  LinkedIn
                </Button>
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                  GitHub
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Продукт</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-white/70 hover:text-white transition-colors">Возможности</a></li>
                <li><a href="#pricing" className="text-white/70 hover:text-white transition-colors">Тарифы</a></li>
                <li><a href="/billing" className="text-white/70 hover:text-white transition-colors">Биллинг</a></li>
                <li><a href="/demo" className="text-white/70 hover:text-white transition-colors">Демо</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Поддержка</h3>
              <ul className="space-y-2">
                <li><a href="/help" className="text-white/70 hover:text-white transition-colors">Помощь</a></li>
                <li><a href="/docs" className="text-white/70 hover:text-white transition-colors">Документация</a></li>
                <li><a href="/contact" className="text-white/70 hover:text-white transition-colors">Контакты</a></li>
                <li><a href="/status" className="text-white/70 hover:text-white transition-colors">Статус</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/60 text-sm">
              © 2024 DeadLine. Все права защищены.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/privacy" className="text-white/60 hover:text-white text-sm transition-colors">
                Политика конфиденциальности
              </a>
              <a href="/terms" className="text-white/60 hover:text-white text-sm transition-colors">
                Условия использования
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
