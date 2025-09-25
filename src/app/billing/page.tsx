"use client";

import { useSession } from "@/lib/auth-client";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { BillingSelector } from "@/components/ui/billing-selector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  ArrowLeft,
  Zap,
  Crown
} from "lucide-react";
import Link from "next/link";

export default function BillingPage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-white">Не авторизован</h1>
          <p className="text-white/60 mb-4">
            Войдите в систему, чтобы получить доступ к биллингу
          </p>
          <Button asChild>
            <Link href="/sign-in">Войти</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к панели управления
            </Link>
          </Button>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            Выберите план подписки
          </h1>
          <p className="text-xl text-white/80">
            Обновите свой план для доступа к расширенным возможностям DeadLine
          </p>
        </div>

        {/* Current Plan Info */}
        <Card className="bg-black/50 backdrop-blur-sm border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Текущий план: Free
            </CardTitle>
            <CardDescription className="text-white/70">
              Вы используете бесплатный план. Обновитесь для получения дополнительных возможностей.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge className="bg-white/10 text-white border-white/20">
                  Free Plan
                </Badge>
                <span className="text-white/60">До 5 участников</span>
              </div>
              <Button variant="outline" size="sm">
                Обновить план
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Billing Selector */}
        <BillingSelector />

        {/* Payment Methods */}
        <Card className="bg-black/50 backdrop-blur-sm border-white/20 mt-12">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Способы оплаты
            </CardTitle>
            <CardDescription className="text-white/70">
              Безопасная оплата с помощью популярных платежных систем
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                  <span className="text-black font-bold text-sm">💳</span>
                </div>
                <div>
                  <h4 className="text-white font-medium">Банковские карты</h4>
                  <p className="text-white/60 text-sm">Visa, MasterCard, МИР</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                  <span className="text-black font-bold text-sm">🏦</span>
                </div>
                <div>
                  <h4 className="text-white font-medium">Банковские переводы</h4>
                  <p className="text-white/60 text-sm">Для корпоративных клиентов</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                  <span className="text-black font-bold text-sm">💎</span>
                </div>
                <div>
                  <h4 className="text-white font-medium">Криптовалюты</h4>
                  <p className="text-white/60 text-sm">Bitcoin, Ethereum, USDT</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Guarantees */}
        <div className="grid md:grid-cols-2 gap-8 mt-12">
          <Card className="bg-black/50 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Безопасность
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-white" />
                  <span className="text-white/80">SSL шифрование</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-white" />
                  <span className="text-white/80">PCI DSS соответствие</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-white" />
                  <span className="text-white/80">Двухфакторная аутентификация</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-white" />
                  <span className="text-white/80">Регулярные бэкапы</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-black/50 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Гарантии
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-white" />
                  <span className="text-white/80">14 дней бесплатно</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-white" />
                  <span className="text-white/80">Отмена в любой момент</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-white" />
                  <span className="text-white/80">Возврат средств за 30 дней</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-white" />
                  <span className="text-white/80">SLA 99.9% доступности</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
