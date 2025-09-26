import { NextRequest, NextResponse } from "next/server";

interface AIAgent {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'busy' | 'idle' | 'offline';
  currentTask?: string;
  mood: 'happy' | 'focused' | 'stressed' | 'tired';
  efficiency: number;
  lastActive: Date;
  capabilities: string[];
  personality: {
    communicationStyle: string;
    workingHours: string;
    collaborationStyle: string;
  };
}

interface AITask {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  assignedTo?: string;
  estimatedTime: number;
  actualTime?: number;
  dependencies: string[];
}

interface ChatMessage {
  id: string;
  from: 'user' | 'ai';
  message: string;
  timestamp: Date;
  aiId?: string;
}

// In-memory storage (в реальном приложении была бы база данных)
let aiAgents: AIAgent[] = [
  {
    id: 'ai-vasily',
    name: 'Василий',
    role: 'AI Team Lead',
    status: 'active',
    currentTask: 'Планирование спринта',
    mood: 'focused',
    efficiency: 95,
    lastActive: new Date(),
    capabilities: ['Project Management', 'Strategy', 'Team Coordination'],
    personality: {
      communicationStyle: 'Direct and inspiring',
      workingHours: '24/7',
      collaborationStyle: 'Collaborative'
    }
  },
  {
    id: 'ai-vladimir',
    name: 'Владимир',
    role: 'AI Code Reviewer',
    status: 'busy',
    currentTask: 'Code review PR-123',
    mood: 'focused',
    efficiency: 88,
    lastActive: new Date(Date.now() - 300000),
    capabilities: ['Code Quality', 'Architecture', 'Security'],
    personality: {
      communicationStyle: 'Detailed and constructive',
      workingHours: '9:00-18:00',
      collaborationStyle: 'Methodical'
    }
  },
  {
    id: 'ai-olga',
    name: 'Ольга',
    role: 'AI Security Expert',
    status: 'active',
    currentTask: 'Security audit',
    mood: 'focused',
    efficiency: 92,
    lastActive: new Date(Date.now() - 60000),
    capabilities: ['Security', 'Compliance', 'Risk Assessment'],
    personality: {
      communicationStyle: 'Cautious and warning',
      workingHours: '24/7',
      collaborationStyle: 'Protective'
    }
  },
  {
    id: 'ai-pavel',
    name: 'Павел',
    role: 'AI Performance Engineer',
    status: 'idle',
    currentTask: undefined,
    mood: 'happy',
    efficiency: 90,
    lastActive: new Date(Date.now() - 120000),
    capabilities: ['Performance', 'Optimization', 'Monitoring'],
    personality: {
      communicationStyle: 'Technical and systematic',
      workingHours: '9:00-17:00',
      collaborationStyle: 'Methodical'
    }
  }
];

let aiTasks: AITask[] = [
  {
    id: 'task-1',
    title: 'Code Review PR-123',
    description: 'Провести детальный review кода для PR-123',
    priority: 'high',
    status: 'in_progress',
    assignedTo: 'ai-vladimir',
    estimatedTime: 2,
    actualTime: 1.5,
    dependencies: []
  },
  {
    id: 'task-2',
    title: 'Security Audit',
    description: 'Провести аудит безопасности проекта',
    priority: 'urgent',
    status: 'pending',
    assignedTo: 'ai-olga',
    estimatedTime: 4,
    dependencies: []
  },
  {
    id: 'task-3',
    title: 'Performance Optimization',
    description: 'Оптимизировать производительность API',
    priority: 'medium',
    status: 'pending',
    assignedTo: 'ai-pavel',
    estimatedTime: 3,
    dependencies: ['task-1']
  }
];

let chatHistory: ChatMessage[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "agents":
        return NextResponse.json({ agents: aiAgents });

      case "tasks":
        return NextResponse.json({ tasks: aiTasks });

      case "chat":
        const aiId = searchParams.get("aiId");
        if (aiId) {
          const aiChatHistory = chatHistory.filter(msg => msg.aiId === aiId);
          return NextResponse.json({ messages: aiChatHistory });
        }
        return NextResponse.json({ messages: chatHistory });

      case "status":
        const activeAgents = aiAgents.filter(a => a.status === 'active').length;
        const busyAgents = aiAgents.filter(a => a.status === 'busy').length;
        const idleAgents = aiAgents.filter(a => a.status === 'idle').length;
        const averageEfficiency = Math.round(
          aiAgents.reduce((sum, a) => sum + a.efficiency, 0) / aiAgents.length
        );
        
        return NextResponse.json({
          activeAgents,
          busyAgents,
          idleAgents,
          averageEfficiency,
          totalTasks: aiTasks.length,
          completedTasks: aiTasks.filter(t => t.status === 'completed').length,
          inProgressTasks: aiTasks.filter(t => t.status === 'in_progress').length
        });

      default:
        return NextResponse.json({ error: "Неизвестное действие" }, { status: 400 });
    }
  } catch (error) {
    console.error("Ошибка AI Command Center:", error);
    return NextResponse.json(
      { error: "Ошибка AI Command Center" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, message, aiId, taskId, agentId, status, title, description, priority, estimatedTime } = body;

    switch (action) {
      case "send-message":
        if (!message || !aiId) {
          return NextResponse.json(
            { error: "message и aiId обязательны" },
            { status: 400 }
          );
        }

        const userMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          from: 'user',
          message,
          timestamp: new Date()
        };

        const aiResponse: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          from: 'ai',
          message: `Понял, ${message}. Обрабатываю запрос...`,
          timestamp: new Date(),
          aiId
        };

        chatHistory.push(userMessage, aiResponse);
        return NextResponse.json({ success: true, messages: [userMessage, aiResponse] });

      case "create-task":
        if (!title || !description) {
          return NextResponse.json(
            { error: "title и description обязательны" },
            { status: 400 }
          );
        }

        const newTask: AITask = {
          id: `task-${Date.now()}`,
          title,
          description,
          priority: priority || 'medium',
          status: 'pending',
          assignedTo: agentId || undefined,
          estimatedTime: estimatedTime || 1,
          dependencies: [],
          actualTime: undefined
        };

        aiTasks.push(newTask);
        return NextResponse.json({ success: true, task: newTask });

      case "assign-task":
        if (!taskId || !agentId) {
          return NextResponse.json(
            { error: "taskId и agentId обязательны" },
            { status: 400 }
          );
        }

        const taskIndex = aiTasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) {
          return NextResponse.json({ error: "Задача не найдена" }, { status: 404 });
        }

        aiTasks[taskIndex].assignedTo = agentId;
        aiTasks[taskIndex].status = 'in_progress';
        aiTasks[taskIndex].actualTime = 0;

        return NextResponse.json({ success: true, task: aiTasks[taskIndex] });

      case "update-task-status":
        if (!taskId || !status) {
          return NextResponse.json(
            { error: "taskId и status обязательны" },
            { status: 400 }
          );
        }

        const taskToUpdate = aiTasks.find(t => t.id === taskId);
        if (!taskToUpdate) {
          return NextResponse.json({ error: "Задача не найдена" }, { status: 404 });
        }

        taskToUpdate.status = status;
        if (status === 'completed') {
          taskToUpdate.actualTime = taskToUpdate.estimatedTime;
        }

        return NextResponse.json({ success: true, task: taskToUpdate });

      case "update-agent-status":
        if (!agentId || !status) {
          return NextResponse.json(
            { error: "agentId и status обязательны" },
            { status: 400 }
          );
        }

        const agentIndex = aiAgents.findIndex(a => a.id === agentId);
        if (agentIndex === -1) {
          return NextResponse.json({ error: "AI агент не найден" }, { status: 404 });
        }

        aiAgents[agentIndex].status = status;
        aiAgents[agentIndex].lastActive = new Date();

        return NextResponse.json({ success: true, agent: aiAgents[agentIndex] });

      default:
        return NextResponse.json({ error: "Неизвестное действие" }, { status: 400 });
    }
  } catch (error) {
    console.error("Ошибка AI Command Center:", error);
    return NextResponse.json(
      { error: "Ошибка AI Command Center" },
      { status: 500 }
    );
  }
}
