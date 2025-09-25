"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings, 
  Plus, 
  Trash2, 
  Edit, 
  Play, 
  Pause, 
  Zap,
  Bell,
  Mail,
  MessageSquare,
  Calendar,
  GitBranch,
  Users,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  Filter,
  Search
} from "lucide-react";

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: "task_created" | "task_updated" | "status_changed" | "deadline_approaching" | "commit_pushed" | "comment_added";
    conditions: string[];
  };
  actions: {
    type: "send_notification" | "assign_user" | "update_status" | "create_task" | "send_email" | "add_comment";
    parameters: Record<string, any>;
  }[];
  isActive: boolean;
  executions: number;
  lastRun: Date;
  createdBy: string;
  createdAt: Date;
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: "email" | "slack" | "discord" | "webhook";
  template: string;
  variables: string[];
}

export function AdvancedAutomationRules() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    loadRules();
    loadTemplates();
  }, []);

  const loadRules = () => {
    const mockRules: AutomationRule[] = [
      {
        id: "1",
        name: "Уведомление о критических багах",
        description: "Отправляет уведомление в Slack при создании задачи с высоким приоритетом",
        trigger: {
          type: "task_created",
          conditions: ["priority = HIGH", "type = BUG"]
        },
        actions: [
          {
            type: "send_notification",
            parameters: {
              channel: "#bugs",
              message: "🚨 Новый критический баг: {{task.title}}",
              mention: "@qa-team"
            }
          }
        ],
        isActive: true,
        executions: 12,
        lastRun: new Date(Date.now() - 1000 * 60 * 30),
        createdBy: "Алексей Петров",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
      },
      {
        id: "2",
        name: "Автоназначение по навыкам",
        description: "Автоматически назначает задачи на основе навыков исполнителя",
        trigger: {
          type: "task_created",
          conditions: ["has_skills_requirement = true"]
        },
        actions: [
          {
            type: "assign_user",
            parameters: {
              criteria: "best_match_skills",
              fallback: "least_busy"
            }
          }
        ],
        isActive: true,
        executions: 45,
        lastRun: new Date(Date.now() - 1000 * 60 * 5),
        createdBy: "Мария Сидорова",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48)
      },
      {
        id: "3",
        name: "Напоминание о дедлайнах",
        description: "Отправляет email за 24 часа до дедлайна",
        trigger: {
          type: "deadline_approaching",
          conditions: ["hours_until_deadline <= 24"]
        },
        actions: [
          {
            type: "send_email",
            parameters: {
              template: "deadline_reminder",
              recipients: ["assignee", "reporter"]
            }
          }
        ],
        isActive: false,
        executions: 8,
        lastRun: new Date(Date.now() - 1000 * 60 * 60 * 2),
        createdBy: "Дмитрий Козлов",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72)
      },
      {
        id: "4",
        name: "Обновление статуса при коммите",
        description: "Автоматически обновляет статус задачи при коммите с соответствующим сообщением",
        trigger: {
          type: "commit_pushed",
          conditions: ["commit_message contains task_key"]
        },
        actions: [
          {
            type: "update_status",
            parameters: {
              status: "IN_PROGRESS",
              add_comment: true
            }
          }
        ],
        isActive: true,
        executions: 156,
        lastRun: new Date(Date.now() - 1000 * 60 * 2),
        createdBy: "Анна Волкова",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96)
      }
    ];
    
    setRules(mockRules);
  };

  const loadTemplates = () => {
    const mockTemplates: NotificationTemplate[] = [
      {
        id: "1",
        name: "Уведомление о баге",
        type: "slack",
        template: "🚨 Новый баг: {{task.title}}\nПриоритет: {{task.priority}}\nИсполнитель: {{task.assignee}}",
        variables: ["task.title", "task.priority", "task.assignee"]
      },
      {
        id: "2",
        name: "Напоминание о дедлайне",
        type: "email",
        template: "Напоминание: задача '{{task.title}}' должна быть выполнена до {{task.deadline}}",
        variables: ["task.title", "task.deadline"]
      }
    ];
    
    setTemplates(mockTemplates);
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case "task_created":
        return <Plus className="h-4 w-4" />;
      case "task_updated":
        return <Edit className="h-4 w-4" />;
      case "status_changed":
        return <Target className="h-4 w-4" />;
      case "deadline_approaching":
        return <Clock className="h-4 w-4" />;
      case "commit_pushed":
        return <GitBranch className="h-4 w-4" />;
      case "comment_added":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case "send_notification":
        return <Bell className="h-4 w-4" />;
      case "assign_user":
        return <Users className="h-4 w-4" />;
      case "update_status":
        return <Target className="h-4 w-4" />;
      case "create_task":
        return <Plus className="h-4 w-4" />;
      case "send_email":
        return <Mail className="h-4 w-4" />;
      case "add_comment":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getTriggerColor = (type: string) => {
    switch (type) {
      case "task_created":
        return "bg-analytics-emerald/20 text-analytics-emerald border-analytics-emerald/30";
      case "task_updated":
        return "bg-analytics-cyan/20 text-analytics-cyan border-analytics-cyan/30";
      case "status_changed":
        return "bg-analytics-violet/20 text-analytics-violet border-analytics-violet/30";
      case "deadline_approaching":
        return "bg-analytics-amber/20 text-analytics-amber border-analytics-amber/30";
      case "commit_pushed":
        return "bg-analytics-rose/20 text-analytics-rose border-analytics-rose/30";
      case "comment_added":
        return "bg-analytics-indigo/20 text-analytics-indigo border-analytics-indigo/30";
      default:
        return "bg-glass-medium text-white border-white/20";
    }
  };

  const toggleRule = (ruleId: string) => {
    setRules(prev => 
      prev.map(rule => 
        rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
      )
    );
  };

  const deleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
  };

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || 
                         (filterStatus === "active" && rule.isActive) ||
                         (filterStatus === "inactive" && !rule.isActive);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Advanced Automation Rules
          </h2>
          <p className="text-white/70">
            Создавайте сложные правила автоматизации с условными триггерами
          </p>
        </div>
        <Button 
          className="bg-analytics-violet hover:bg-analytics-violet/80 text-white"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Создать правило
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-glass-dark backdrop-blur-sm border-white/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
              <Input
                placeholder="Поиск правил..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-glass-medium border-white/20 text-white placeholder-white/50"
              />
            </div>
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-48 bg-glass-medium border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-white/20">
                <SelectItem value="all">Все правила</SelectItem>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="inactive">Неактивные</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rules List */}
      <div className="grid gap-6">
        {filteredRules.map((rule) => (
          <Card 
            key={rule.id} 
            className="bg-glass-dark backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-300"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-white text-xl">{rule.name}</CardTitle>
                    <Badge className={
                      rule.isActive 
                        ? "bg-analytics-emerald/20 text-analytics-emerald border-analytics-emerald/30"
                        : "bg-white/10 text-white/60 border-white/20"
                    }>
                      {rule.isActive ? "Активно" : "Неактивно"}
                    </Badge>
                  </div>
                  <CardDescription className="text-white/70 text-base">
                    {rule.description}
                  </CardDescription>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleRule(rule.id)}
                    className={`p-2 h-auto ${
                      rule.isActive 
                        ? 'text-analytics-emerald hover:bg-analytics-emerald/10' 
                        : 'text-white/40 hover:bg-white/10'
                    }`}
                  >
                    {rule.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 h-auto text-white/60 hover:text-white hover:bg-white/10"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteRule(rule.id)}
                    className="p-2 h-auto text-analytics-rose hover:bg-analytics-rose/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Trigger */}
                <div className="space-y-3">
                  <h4 className="text-white font-medium flex items-center gap-2">
                    <Filter className="h-4 w-4 text-analytics-cyan" />
                    Триггер
                  </h4>
                  <div className="bg-glass-medium backdrop-blur-sm border border-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getTriggerColor(rule.trigger.type)}>
                        {getTriggerIcon(rule.trigger.type)}
                      </Badge>
                      <span className="text-white/80 text-sm">
                        {rule.trigger.type.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {rule.trigger.conditions.map((condition, index) => (
                        <div key={index} className="text-white/70 text-sm">
                          • {condition}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="space-y-3">
                  <h4 className="text-white font-medium flex items-center gap-2">
                    <Zap className="h-4 w-4 text-analytics-amber" />
                    Действия
                  </h4>
                  <div className="space-y-2">
                    {rule.actions.map((action, index) => (
                      <div key={index} className="bg-glass-medium backdrop-blur-sm border border-white/10 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-analytics-amber/20 text-analytics-amber border-analytics-amber/30">
                            {getActionIcon(action.type)}
                          </Badge>
                          <span className="text-white/80 text-sm">
                            {action.type.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="text-white/60 text-xs">
                          {Object.entries(action.parameters).map(([key, value]) => (
                            <div key={key}>
                              {key}: {typeof value === 'object' ? JSON.stringify(value) : value}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Stats */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-white/60">
                      Выполнений: <span className="text-white">{rule.executions}</span>
                    </span>
                    <span className="text-white/60">
                      Создано: <span className="text-white">{rule.createdBy}</span>
                    </span>
                    <span className="text-white/60">
                      Последний запуск: <span className="text-white">
                        {rule.lastRun.toLocaleString()}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredRules.length === 0 && (
        <Card className="bg-glass-dark backdrop-blur-sm border-white/10">
          <CardContent className="p-12 text-center">
            <Settings className="h-12 w-12 mx-auto mb-4 text-white/40" />
            <h3 className="text-white font-medium mb-2">Правила не найдены</h3>
            <p className="text-white/60 mb-4">
              {searchQuery ? "Попробуйте изменить поисковый запрос" : "Создайте первое правило автоматизации"}
            </p>
            <Button 
              className="bg-analytics-violet hover:bg-analytics-violet/80 text-white"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Создать правило
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
