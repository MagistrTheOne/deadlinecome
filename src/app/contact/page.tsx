"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  MessageCircle, 
  Github, 
  Linkedin, 
  Send,
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Clock
} from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
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
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/landing">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Назад
                </Link>
              </Button>
              <Button variant="default" asChild>
                <Link href="/sign-up">Начать бесплатно</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="bg-white/10 text-white border-white/20 mb-6 backdrop-blur-sm">
            <MessageCircle className="w-3 h-3 mr-1" />
            Свяжитесь с нами
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            Давайте <span className="text-white font-bold">обсудим</span> ваш проект
          </h1>
          
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            Готовы ответить на любые вопросы и помочь с интеграцией DeadLine в вашу команду
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <Card className="bg-black/50 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Отправить сообщение</CardTitle>
                <CardDescription className="text-white/70">
                  Заполните форму, и мы свяжемся с вами в течение 24 часов
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-white text-sm font-medium">Имя</label>
                      <Input 
                        placeholder="Ваше имя"
                        className="bg-black/50 border-white/20 text-white placeholder-white/50 focus:border-white/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-white text-sm font-medium">Email</label>
                      <Input 
                        type="email"
                        placeholder="your@email.com"
                        className="bg-black/50 border-white/20 text-white placeholder-white/50 focus:border-white/40"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-white text-sm font-medium">Компания</label>
                    <Input 
                      placeholder="Название компании"
                      className="bg-black/50 border-white/20 text-white placeholder-white/50 focus:border-white/40"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-white text-sm font-medium">Сообщение</label>
                    <Textarea 
                      placeholder="Расскажите о вашем проекте..."
                      className="min-h-[120px] bg-black/50 border-white/20 text-white placeholder-white/50 focus:border-white/40 resize-none"
                    />
                  </div>
                  
                  <Button type="submit" variant="default" className="w-full">
                    <Send className="mr-2 h-4 w-4" />
                    Отправить сообщение
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-8">
              {/* Author Info */}
              <Card className="bg-black/50 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Автор проекта
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <span className="text-black font-bold text-lg">M</span>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">MagistrTheOne</h3>
                        <p className="text-white/70 text-sm">Full-Stack Developer & AI Engineer</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-white/60" />
                        <span className="text-white/80 text-sm">maxonyushko71@gmail.com</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-white/60" />
                        <span className="text-white/80 text-sm">+7 (XXX) XXX-XX-XX</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-white/60" />
                        <span className="text-white/80 text-sm">Россия, Москва</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card className="bg-black/50 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Социальные сети</CardTitle>
                  <CardDescription className="text-white/70">
                    Следите за обновлениями и новостями проекта
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3">
                    <Button variant="outline" className="justify-start" asChild>
                      <a href="https://t.me/MagistrTheOne" target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="mr-3 h-4 w-4" />
                        Telegram: @MagistrTheOne
                      </a>
                    </Button>
                    <Button variant="outline" className="justify-start" asChild>
                      <a href="https://github.com/MagistrTheOne" target="_blank" rel="noopener noreferrer">
                        <Github className="mr-3 h-4 w-4" />
                        GitHub: MagistrTheOne
                      </a>
                    </Button>
                    <Button variant="outline" className="justify-start" asChild>
                      <a href="https://linkedin.com/in/magistrtheone" target="_blank" rel="noopener noreferrer">
                        <Linkedin className="mr-3 h-4 w-4" />
                        LinkedIn: MagistrTheOne
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Response Time */}
              <Card className="bg-black/50 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Время ответа
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Email</span>
                      <Badge className="bg-white/10 text-white border-white/20">24 часа</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Telegram</span>
                      <Badge className="bg-white/10 text-white border-white/20">2-4 часа</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">GitHub Issues</span>
                      <Badge className="bg-white/10 text-white border-white/20">1-2 дня</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-white/10 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-lg">D</span>
            </div>
            <span className="text-xl font-bold text-white">DeadLine</span>
          </div>
          <p className="text-white/60 text-sm">
            © 2025 DeadLine. Разработано <span className="text-white font-medium">@MagistrTheOne</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
