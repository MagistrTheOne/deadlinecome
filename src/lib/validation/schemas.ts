import { z } from 'zod';

// Пользовательские схемы
export const userSchema = z.object({
  name: z.string().min(1, 'Имя обязательно').max(255, 'Имя слишком длинное'),
  email: z.string().email('Некорректный email'),
  username: z.string().min(3, 'Никнейм минимум 3 символа').max(50, 'Никнейм слишком длинный').optional(),
  bio: z.string().max(1000, 'Биография слишком длинная').optional(),
  location: z.string().max(255, 'Местоположение слишком длинное').optional(),
  website: z.string().url('Некорректный URL').optional().or(z.literal('')),
  timezone: z.string().min(1, 'Часовой пояс обязателен').max(50, 'Часовой пояс слишком длинный'),
  language: z.enum(['ru', 'en', 'es', 'fr', 'de'], {
    errorMap: () => ({ message: 'Неподдерживаемый язык' })
  }),
  theme: z.enum(['LIGHT', 'DARK', 'AUTO'], {
    errorMap: () => ({ message: 'Неподдерживаемая тема' })
  }),
  status: z.enum(['ONLINE', 'OFFLINE', 'BUSY', 'AWAY'], {
    errorMap: () => ({ message: 'Неподдерживаемый статус' })
  }).optional(),
  statusMessage: z.string().max(255, 'Сообщение статуса слишком длинное').optional(),
});

export const userUpdateSchema = userSchema.partial();

// Рабочие пространства
export const workspaceSchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(255, 'Название слишком длинное'),
  slug: z.string().min(1, 'Slug обязателен').max(100, 'Slug слишком длинный')
    .regex(/^[a-z0-9-]+$/, 'Slug может содержать только строчные буквы, цифры и дефисы'),
  description: z.string().max(1000, 'Описание слишком длинное').optional(),
});

export const workspaceUpdateSchema = workspaceSchema.partial();

// Проекты
export const projectSchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(255, 'Название слишком длинное'),
  description: z.string().max(2000, 'Описание слишком длинное').optional(),
  workspaceId: z.string().min(1, 'ID рабочего пространства обязателен'),
});

export const projectUpdateSchema = projectSchema.partial().omit({ workspaceId: true });

// Задачи
export const issueSchema = z.object({
  title: z.string().min(1, 'Заголовок обязателен').max(255, 'Заголовок слишком длинный'),
  description: z.string().max(5000, 'Описание слишком длинное').optional(),
  status: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE'], {
    errorMap: () => ({ message: 'Неподдерживаемый статус задачи' })
  }),
  priority: z.enum(['LOWEST', 'LOW', 'MEDIUM', 'HIGH', 'HIGHEST'], {
    errorMap: () => ({ message: 'Неподдерживаемый приоритет' })
  }),
  type: z.enum(['BUG', 'TASK', 'STORY', 'EPIC'], {
    errorMap: () => ({ message: 'Неподдерживаемый тип задачи' })
  }),
  projectId: z.string().min(1, 'ID проекта обязателен'),
  assigneeId: z.string().optional(),
  reporterId: z.string().min(1, 'ID репортера обязателен'),
  estimatedHours: z.number().int().min(0, 'Часы не могут быть отрицательными').max(9999, 'Слишком много часов').optional(),
  actualHours: z.number().int().min(0, 'Часы не могут быть отрицательными').max(9999, 'Слишком много часов').optional(),
});

export const issueUpdateSchema = issueSchema.partial().omit({ projectId: true, reporterId: true });

// AI чат
export const aiChatSchema = z.object({
  message: z.string().min(1, 'Сообщение обязательно').max(4000, 'Сообщение слишком длинное'),
  workspaceId: z.string().optional(),
  projectId: z.string().optional(),
  context: z.object({
    previousMessages: z.array(z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
      timestamp: z.date()
    })).optional(),
    userActivity: z.string().optional(),
    timeOfDay: z.number().min(0).max(23).optional(),
  }).optional(),
});

// AI Team Chat - универсальный чат с любым специалистом
export const aiTeamChatSchema = z.object({
  message: z.string().min(1, 'Сообщение обязательно').max(4000, 'Сообщение слишком длинное'),
  specialist: z.enum([
    'vasily', 'olga', 'pavel', 'mikhail', 'tatyana', 'svetlana', 'andrey',
    'anna', 'dmitry', 'maria', 'alexey', 'irina', 'sergey'
  ], {
    errorMap: () => ({ message: 'Неподдерживаемый AI специалист' })
  }),
  workspaceId: z.string().optional(),
  projectId: z.string().optional(),
  context: z.object({
    userActivity: z.string().optional(),
    previousMessages: z.array(z.object({
      specialist: z.string(),
      role: z.enum(['user', 'assistant']),
      content: z.string(),
      timestamp: z.date()
    })).optional(),
  }).optional(),
});

// Уведомления
export const notificationSchema = z.object({
  type: z.enum(['info', 'success', 'warning', 'error', 'crisis'], {
    errorMap: () => ({ message: 'Неподдерживаемый тип уведомления' })
  }),
  title: z.string().min(1, 'Заголовок обязателен').max(255, 'Заголовок слишком длинный'),
  message: z.string().min(1, 'Сообщение обязательно').max(1000, 'Сообщение слишком длинное'),
  userId: z.string().min(1, 'ID пользователя обязателен'),
  workspaceId: z.string().optional(),
  projectId: z.string().optional(),
  actionUrl: z.string().url('Некорректный URL действия').optional(),
  metadata: z.record(z.any()).optional(),
});

// WebSocket события
export const websocketEventSchema = z.object({
  type: z.string().min(1, 'Тип события обязателен'),
  data: z.record(z.any()),
  userId: z.string().min(1, 'ID пользователя обязателен'),
  workspaceId: z.string().optional(),
  projectId: z.string().optional(),
  timestamp: z.date().optional(),
});

// Поиск
export const searchSchema = z.object({
  query: z.string().min(1, 'Поисковый запрос обязателен').max(255, 'Запрос слишком длинный'),
  type: z.enum(['all', 'projects', 'issues', 'users', 'workspaces']).optional(),
  workspaceId: z.string().optional(),
  limit: z.number().int().min(1, 'Лимит минимум 1').max(100, 'Лимит максимум 100').optional(),
  offset: z.number().int().min(0, 'Смещение не может быть отрицательным').optional(),
});

// Фильтры
export const filterSchema = z.object({
  status: z.array(z.string()).optional(),
  priority: z.array(z.string()).optional(),
  type: z.array(z.string()).optional(),
  assigneeId: z.array(z.string()).optional(),
  projectId: z.array(z.string()).optional(),
  workspaceId: z.array(z.string()).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  tags: z.array(z.string()).optional(),
});

// Пагинация
export const paginationSchema = z.object({
  page: z.number().int().min(1, 'Страница минимум 1').optional(),
  limit: z.number().int().min(1, 'Лимит минимум 1').max(100, 'Лимит максимум 100').optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Экспорт данных
export const exportSchema = z.object({
  format: z.enum(['csv', 'xlsx', 'pdf', 'json'], {
    errorMap: () => ({ message: 'Неподдерживаемый формат экспорта' })
  }),
  type: z.enum(['projects', 'issues', 'users', 'analytics'], {
    errorMap: () => ({ message: 'Неподдерживаемый тип экспорта' })
  }),
  filters: filterSchema.optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
});

// Настройки
export const settingsSchema = z.object({
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    inApp: z.boolean(),
    types: z.array(z.string()).optional(),
  }).optional(),
  privacy: z.object({
    profileVisibility: z.enum(['public', 'private', 'workspace']),
    activityVisibility: z.enum(['public', 'private', 'workspace']),
  }).optional(),
  preferences: z.object({
    language: z.string(),
    theme: z.string(),
    timezone: z.string(),
    dateFormat: z.string(),
    timeFormat: z.enum(['12h', '24h']),
  }).optional(),
});

// Валидация файлов
export const fileUploadSchema = z.object({
  type: z.enum(['image', 'document', 'video', 'audio'], {
    errorMap: () => ({ message: 'Неподдерживаемый тип файла' })
  }),
  size: z.number().max(10 * 1024 * 1024, 'Файл слишком большой (максимум 10MB)'),
  mimeType: z.string().regex(/^[a-z]+\/[a-z0-9-]+$/, 'Некорректный MIME тип'),
});

// API ответы
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
  timestamp: z.date(),
  requestId: z.string().optional(),
});

// Валидация ID
export const idSchema = z.string().min(1, 'ID обязателен').regex(/^[a-zA-Z0-9-_]+$/, 'Некорректный формат ID');

// Валидация email
export const emailSchema = z.string().email('Некорректный email');

// Валидация пароля
export const passwordSchema = z.string()
  .min(8, 'Пароль минимум 8 символов')
  .max(128, 'Пароль слишком длинный')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Пароль должен содержать строчные и заглавные буквы, а также цифры');

// Валидация токена
export const tokenSchema = z.string().min(1, 'Токен обязателен');

// Валидация URL
export const urlSchema = z.string().url('Некорректный URL');

// Валидация даты
export const dateSchema = z.date().or(z.string().datetime());

// Валидация JSON
export const jsonSchema = z.record(z.any());

// Валидация массива
export const arraySchema = z.array(z.any());

// Валидация объекта
export const objectSchema = z.object({}).passthrough();

// Экспорт всех схем
export const schemas = {
  user: userSchema,
  userUpdate: userUpdateSchema,
  workspace: workspaceSchema,
  workspaceUpdate: workspaceUpdateSchema,
  project: projectSchema,
  projectUpdate: projectUpdateSchema,
  issue: issueSchema,
  issueUpdate: issueUpdateSchema,
  aiChat: aiChatSchema,
  aiTeamChat: aiTeamChatSchema,
  notification: notificationSchema,
  websocketEvent: websocketEventSchema,
  search: searchSchema,
  filter: filterSchema,
  pagination: paginationSchema,
  export: exportSchema,
  settings: settingsSchema,
  fileUpload: fileUploadSchema,
  apiResponse: apiResponseSchema,
  id: idSchema,
  email: emailSchema,
  password: passwordSchema,
  token: tokenSchema,
  url: urlSchema,
  date: dateSchema,
  json: jsonSchema,
  array: arraySchema,
  object: objectSchema,
} as const;

export type UserInput = z.infer<typeof userSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type WorkspaceInput = z.infer<typeof workspaceSchema>;
export type WorkspaceUpdateInput = z.infer<typeof workspaceUpdateSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
export type IssueInput = z.infer<typeof issueSchema>;
export type IssueUpdateInput = z.infer<typeof issueUpdateSchema>;
export type AIChatInput = z.infer<typeof aiChatSchema>;
export type AITeamChatInput = z.infer<typeof aiTeamChatSchema>;
export type NotificationInput = z.infer<typeof notificationSchema>;
export type WebSocketEventInput = z.infer<typeof websocketEventSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type FilterInput = z.infer<typeof filterSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type ExportInput = z.infer<typeof exportSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type APIResponse = z.infer<typeof apiResponseSchema>;
