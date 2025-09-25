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
    title: "AI Security Scanner",
    description: "Автоматическое сканирование уязвимостей, анализ безопасности кода и предсказание атак с Ольгой (AI Security Expert)",
    category: "AI Security"
  },
  {
    icon: Zap,
    title: "AI Performance Analyzer", 
    description: "Оптимизация производительности, анализ узких мест и автоматические рекомендации с Павлом (AI Performance Engineer)",
    category: "AI Performance"
  },
  {
    icon: Target,
    title: "AI Sprint Planning",
    description: "Умное планирование спринтов, автоматическое распределение задач и предсказание рисков с Михаилом (AI PM)",
    category: "AI Planning"
  },
  {
    icon: BarChart3,
    title: "AI Documentation Generator",
    description: "Автоматическая генерация документации, API docs и технических спецификаций с Татьяной (AI Documentation)",
    category: "AI Documentation"
  },
  {
    icon: Users,
    title: "AI Analytics Dashboard",
    description: "Продвинутая аналитика, предсказательные модели и инсайты для команды со Светланой (AI Analytics)",
    category: "AI Analytics"
  },
  {
    icon: Shield,
    title: "AI CI/CD Assistant",
    description: "Автоматизация CI/CD, умные пайплайны и предсказание сбоев с Андреем (AI DevOps)",
    category: "AI DevOps"
  }
];

const pricingPlans = [
  {
    name: "Starter",
    price: "49",
    period: "в месяц",
    description: "Идеально для стартапов и небольших команд",
    features: [
      "До 10 участников",
      "5 AI-специалистов",
      "Базовые AI-фичи",
      "AI Security Scanner",
      "AI Performance Analyzer",
      "AI Documentation",
      "Email поддержка",
      "Базовые интеграции"
    ],
    limitations: [
      "Ограниченная аналитика",
      "Нет кастомных AI",
      "Стандартная безопасность"
    ],
    buttonText: "Начать с Starter",
    popular: false,
    icon: Star
  },
  {
    name: "Professional",
    price: "149",
    period: "в месяц",
    description: "Для растущих команд с полной AI-командой",
    features: [
      "До 50 участников",
      "12 AI-специалистов",
      "Все AI-фичи",
      "AI Security Scanner",
      "AI Performance Analyzer", 
      "AI Sprint Planning",
      "AI Documentation Generator",
      "AI Analytics Dashboard",
      "AI CI/CD Assistant",
      "AI Meeting Assistant",
      "AI Burnout Detection",
      "AI Test Generation",
      "AI Cost Optimization",
      "Приоритетная поддержка",
      "Расширенные интеграции"
    ],
    limitations: [],
    buttonText: "Попробовать Professional",
    popular: true,
    icon: Rocket
  },
  {
    name: "Enterprise",
    price: "499",
    period: "в месяц",
    description: "Для крупных организаций с кастомными AI",
    features: [
      "Неограниченные участники",
      "12 AI-специалистов + кастомные",
      "Все AI-фичи",
      "Кастомные AI-модели",
      "On-premise развертывание",
      "SSO и LDAP",
      "Расширенная безопасность",
      "Dedicated AI-менеджер",
      "SLA 99.9%",
      "Кастомные отчеты",
      "API доступ",
      "White-label решение",
      "24/7 поддержка"
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
              <a href="/contact" className="text-white hover:text-white/80 transition-colors">Контакты</a>
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
              AI & Human Collaboration IT
            </h1>
            
            <p className="text-xl md:text-2xl text-white mb-8 leading-relaxed">
              Первая в мире платформа с полной AI-командой разработки. 
              <br />
              <span className="text-white font-semibold">12 AI-специалистов</span> + <span className="text-white font-semibold">Автоматизация процессов</span> + <span className="text-white font-semibold">Предиктивная аналитика</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                variant="default"
                className="px-8 py-4 text-lg font-semibold"
                asChild
              >
                <Link href="/sign-up">
                  УЛЬТАЙ РЫНОК С AI-КОМАНДОЙ!
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-4 text-lg"
                asChild
              >
                <Link href="/contact">
                  Связаться с MagistrTheOne
                </Link>
              </Button>
            </div>
            
            <p className="text-white/60 mt-4 text-sm">
              Автор: <span className="text-white font-medium">@MagistrTheOne</span> • 2025 • AI Revolution
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              <span className="text-white font-bold">12 AI-специалистов</span> работают для вашей команды
            </h2>
            <p className="text-xl text-white max-w-3xl mx-auto">
              От AI Security Scanner до AI Cost Optimization — полная AI-команда разработки, 
              которая автоматизирует весь цикл создания ПО
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
              Выберите <span className="text-white font-bold">AI-команду</span> для вашего проекта
            </h2>
            <p className="text-xl text-white max-w-2xl mx-auto">
              От 5 до 12 AI-специалистов работают 24/7 для автоматизации 
              ваших процессов разработки и достижения целей.
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

      {/* About Developer Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              О <span className="text-white font-bold">разработчике</span>
            </h2>
            <p className="text-xl text-white max-w-2xl mx-auto">
              MagistrTheOne — Full-Stack Developer & AI Engineer, создавший первую в мире 
              платформу с полной AI-командой разработки
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="bg-black/50 backdrop-blur-sm border-white/20">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-4xl font-bold">M</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold text-white mb-2">MagistrTheOne</h3>
                    <p className="text-white/80 text-lg mb-4">Full-Stack Developer & AI Engineer</p>
                    <p className="text-white/70 mb-6">
                      Создатель революционной платформы AI & Human Collaboration IT. 
                      Специализируется на разработке AI-решений, автоматизации процессов 
                      и создании инновационных технологий для команд разработки.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                      <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10" asChild>
                        <a href="mailto:maxonyushko71@gmail.com" target="_blank" rel="noopener noreferrer">
                          maxonyushko71@gmail.com
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10" asChild>
                        <a href="https://t.me/MagistrTheOne" target="_blank" rel="noopener noreferrer">
                          Telegram: @MagistrTheOne
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10" asChild>
                        <a href="https://github.com/MagistrTheOne" target="_blank" rel="noopener noreferrer">
                          GitHub: MagistrTheOne
                        </a>
                      </Button>
                    </div>
                    
                    <p className="text-white/50 text-sm mt-4">
                      Россия, Краснодар • 2025
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-20 bg-black">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Готовы <span className="text-white font-bold">ультануть рынок</span> с AI-командой?
          </h2>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            Присоединяйтесь к революции AI & Human Collaboration IT. 
            12 AI-специалистов работают 24/7 для автоматизации ваших процессов.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              variant="default"
              className="px-8 py-4 text-lg font-semibold"
              asChild
            >
              <Link href="/sign-up">
                УЛЬТАЙ РЫНОК С AI-КОМАНДОЙ!
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="px-8 py-4 text-lg"
              asChild
            >
              <Link href="/contact">
                Связаться с MagistrTheOne
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
                  <span className="text-black font-bold text-lg">AI</span>
                </div>
                <span className="text-xl font-bold text-white">AI & Human Collaboration IT</span>
              </div>
              <p className="text-white/70 mb-4 max-w-md">
                Первая в мире платформа с полной AI-командой разработки. 
                12 AI-специалистов работают 24/7 для автоматизации ваших процессов.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white" asChild>
                  <a href="https://t.me/MagistrTheOne" target="_blank" rel="noopener noreferrer">
                    Telegram
                  </a>
                </Button>
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white" asChild>
                  <a href="https://github.com/MagistrTheOne" target="_blank" rel="noopener noreferrer">
                    GitHub
                  </a>
                </Button>
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white" asChild>
                  <a href="https://www.linkedin.com/in/magistrtheoneboss/" target="_blank" rel="noopener noreferrer">
                    LinkedIn
                  </a>
                </Button>
              </div>
              <p className="text-white/50 text-sm mt-2">
                Автор: <span className="text-white font-medium">MagistrTheOne</span> • Full-Stack Developer & AI Engineer • 2025
              </p>
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
              © 2025 AI & Human Collaboration IT by MagistrTheOne (Full-Stack Developer & AI Engineer). Все права защищены.
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
