"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, Rocket } from "lucide-react";

interface BillingPlan {
  id: string;
  name: string;
  price: number;
  period: "monthly" | "yearly";
  description: string;
  features: string[];
  limitations: string[];
  popular: boolean;
  icon: any;
  yearlyDiscount?: number;
}

const billingPlans: BillingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "monthly",
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
    popular: false,
    icon: Star
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    period: "monthly",
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
    popular: true,
    icon: Rocket,
    yearlyDiscount: 20
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 99,
    period: "monthly",
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
    popular: false,
    icon: Crown,
    yearlyDiscount: 25
  }
];

export function BillingSelector() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const getPrice = (plan: BillingPlan) => {
    if (plan.id === "free") return 0;
    
    if (billingPeriod === "yearly" && plan.yearlyDiscount) {
      const yearlyPrice = plan.price * 12;
      const discount = (yearlyPrice * plan.yearlyDiscount) / 100;
      return Math.round((yearlyPrice - discount) / 12);
    }
    
    return plan.price;
  };

  const getPeriodText = (plan: BillingPlan) => {
    if (plan.id === "free") return "навсегда";
    return billingPeriod === "yearly" ? "в месяц (годовая оплата)" : "в месяц";
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Billing Toggle */}
      <div className="flex justify-center mb-12">
        <div className="bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg p-1">
          <Button
            variant={billingPeriod === "monthly" ? "default" : "ghost"}
            size="sm"
            onClick={() => setBillingPeriod("monthly")}
            className="px-6"
          >
            Ежемесячно
          </Button>
          <Button
            variant={billingPeriod === "yearly" ? "default" : "ghost"}
            size="sm"
            onClick={() => setBillingPeriod("yearly")}
            className="px-6"
          >
            Годовая оплата
            <Badge className="ml-2 bg-white text-black text-xs">-20%</Badge>
          </Button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8">
        {billingPlans.map((plan) => (
          <Card 
            key={plan.id}
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
                <span className="text-5xl font-bold text-white">${getPrice(plan)}</span>
                <span className="text-white/60 ml-2">/{getPeriodText(plan)}</span>
                {billingPeriod === "yearly" && plan.yearlyDiscount && (
                  <div className="text-sm text-white/60 mt-1">
                    Экономия {plan.yearlyDiscount}% при годовой оплате
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <Button 
                variant={plan.popular ? "default" : "glass"}
                className="w-full mb-6"
                size="lg"
              >
                {plan.id === "free" ? "Начать бесплатно" : 
                 plan.id === "pro" ? "Попробовать Pro" : 
                 "Связаться с нами"}
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
                          <span className="text-white/50 text-sm">• {limitation}</span>
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

      {/* Additional Info */}
      <div className="text-center mt-12">
        <p className="text-white/60 mb-4">
          Все планы включают 14-дневную бесплатную пробную версию
        </p>
        <p className="text-white/60 text-sm">
          Отмена в любой момент • Без скрытых комиссий • SSL шифрование
        </p>
      </div>
    </div>
  );
}
