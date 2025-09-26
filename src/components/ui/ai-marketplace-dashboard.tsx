"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { 
  Store, 
  Search, 
  Star, 
  Clock, 
  DollarSign, 
  Users, 
  Package,
  Filter,
  TrendingUp
} from 'lucide-react';

interface AISpecialist {
  id: string;
  name: string;
  specialization: string;
  description: string;
  skills: string[];
  experience: number;
  rating: number;
  price: number;
  availability: 'available' | 'busy' | 'offline';
}

interface AIPackage {
  id: string;
  name: string;
  description: string;
  specialists: string[];
  price: number;
  duration: number;
  features: string[];
  targetAudience: string[];
}

export default function AIMarketplaceDashboard() {
  const [specialists, setSpecialists] = useState<AISpecialist[]>([]);
  const [packages, setPackages] = useState<AIPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('ALL');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');

  useEffect(() => {
    fetchMarketplaceData();
  }, []);

  const fetchMarketplaceData = async () => {
    try {
      setLoading(true);
      
      // Fetch specialists
      const specialistsResponse = await fetch('/api/ai/marketplace?action=search');
      if (specialistsResponse.ok) {
        const specialistsData = await specialistsResponse.json();
        setSpecialists(specialistsData.specialists || []);
      }

      // Fetch packages
      const packagesResponse = await fetch('/api/ai/marketplace?action=packages');
      if (packagesResponse.ok) {
        const packagesData = await packagesResponse.json();
        setPackages(packagesData.packages || []);
      }
    } catch (error) {
      console.error('Error fetching marketplace data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('action', 'search');
      if (searchTerm) params.append('specialization', searchTerm);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (minRating) params.append('minRating', minRating);

      const response = await fetch(`/api/ai/marketplace?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setSpecialists(data.specialists || []);
      }
    } catch (error) {
      console.error('Error searching specialists:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'available': return 'Доступен';
      case 'busy': return 'Занят';
      case 'offline': return 'Офлайн';
      default: return 'Неизвестно';
    }
  };

  if (loading) {
    return (
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Store className="h-5 w-5" />
            AI Marketplace
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-white/70">Загрузка маркетплейса...</div>
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
            <Store className="h-5 w-5" />
            AI Marketplace
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70">
            Найдите и наймите дополнительных AI-специалистов для вашего проекта
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Специализация..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
            />
            <Input
              placeholder="Макс. цена ($)"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
            />
            <Input
              placeholder="Мин. рейтинг"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
            />
            <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
              <Search className="h-4 w-4 mr-2" />
              Поиск
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Specialists */}
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            AI Специалисты ({specialists.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {specialists.map((specialist) => (
              <Card key={specialist.id} className="bg-gray-800/50 border-gray-600">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg">{specialist.name}</CardTitle>
                    <div className={`w-3 h-3 rounded-full ${getAvailabilityColor(specialist.availability)}`} />
                  </div>
                  <p className="text-white/70 text-sm">{specialist.specialization}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-white/70 text-sm">{specialist.description}</p>
                  
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-white text-sm">{specialist.rating}</span>
                    <span className="text-white/70 text-sm">({specialist.experience} лет опыта)</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="text-white text-sm">${specialist.price}/час</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-white/70 text-sm">{getAvailabilityText(specialist.availability)}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {specialist.skills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {specialist.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{specialist.skills.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={specialist.availability !== 'available'}
                  >
                    {specialist.availability === 'available' ? 'Нанять' : 'Недоступен'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Packages */}
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Package className="h-5 w-5" />
            AI Пакеты ({packages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packages.map((package_) => (
              <Card key={package_.id} className="bg-gray-800/50 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    {package_.name}
                    <Badge variant="default" className="bg-green-600">
                      ${package_.price}
                    </Badge>
                  </CardTitle>
                  <p className="text-white/70 text-sm">{package_.description}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-white/70 text-sm">{package_.duration} дней</span>
                  </div>
                  
                  <div>
                    <h5 className="text-white font-medium mb-2">Включенные специалисты:</h5>
                    <div className="flex flex-wrap gap-1">
                      {package_.specialists.map((specialistId, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {specialistId}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-white font-medium mb-2">Возможности:</h5>
                    <ul className="text-white/70 text-sm space-y-1">
                      {package_.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-green-500 rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Приобрести пакет
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
