import { pgTable, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Application-specific tables
export const workspace = pgTable("workspace", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  ownerId: text("owner_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const workspaceMember = pgTable("workspace_member", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspace.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role").notNull().$type<"OWNER" | "ADMIN" | "MEMBER" | "VIEWER">(),
  // IT-роли для проектов
  itRole: text("it_role").$type<"DEVELOPER" | "TEAM_LEAD" | "CTO" | "PM" | "QA" | "DEVOPS" | "DESIGNER" | "ANALYST">(),
  skills: text("skills"), // JSON array of skills
  experience: integer("experience"), // years of experience
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
}, (t) => ({
  uniqueWorkspaceUser: [t.workspaceId, t.userId],
}));

export const project = pgTable("project", {
  id: text("id").primaryKey(),
  key: text("key").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspace.id, { onDelete: "cascade" }),
  leadId: text("lead_id")
    .references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const issue = pgTable("issue", {
  id: text("id").primaryKey(),
  key: text("key").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().$type<"BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE">(),
  priority: text("priority").notNull().$type<"LOWEST" | "LOW" | "MEDIUM" | "HIGH" | "HIGHEST">(),
  type: text("type").notNull().$type<"BUG" | "TASK" | "STORY" | "EPIC">(),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  assigneeId: text("assignee_id")
    .references(() => user.id, { onDelete: "set null" }),
  reporterId: text("reporter_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  order: timestamp("order").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
  // AI-related fields
  embedding: text("embedding"), // JSON string of vector embedding
  aiGenerated: boolean("ai_generated").default(false),
  estimatedHours: integer("estimated_hours"),
  actualHours: integer("actual_hours"),
});

// AI Assistant conversation history
export const aiConversation = pgTable("ai_conversation", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  workspaceId: text("workspace_id")
    .references(() => workspace.id, { onDelete: "cascade" }),
  query: text("query").notNull(),
  response: text("response").notNull(),
  context: text("context"), // JSON string of context used
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// AI Task suggestions
export const aiTaskSuggestion = pgTable("ai_task_suggestion", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspace.id, { onDelete: "cascade" }),
  projectId: text("project_id")
    .references(() => project.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").$type<"LOWEST" | "LOW" | "MEDIUM" | "HIGH" | "HIGHEST">(),
  estimatedHours: integer("estimated_hours"),
  reasoning: text("reasoning"), // AI reasoning for the suggestion
  status: text("status").notNull().$type<"PENDING" | "ACCEPTED" | "REJECTED">().default("PENDING"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Project Status Management by Vasily
export const projectStatus = pgTable("project_status", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  status: text("status").notNull().$type<"ON_TRACK" | "AT_RISK" | "BEHIND" | "BLOCKED" | "COMPLETED">(),
  healthScore: integer("health_score").notNull(), // 0-100
  progress: integer("progress").notNull(), // 0-100
  aiAnalysis: text("ai_analysis"), // JSON with Vasily's analysis
  recommendations: text("recommendations"), // JSON array of recommendations
  lastAnalyzed: timestamp("last_analyzed").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

// Vasily AI Actions Log
export const vasilyAction = pgTable("vasily_action", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  actionType: text("action_type").notNull().$type<"TASK_ASSIGNED" | "DEADLINE_ALERT" | "STATUS_UPDATE" | "RECOMMENDATION" | "AUTO_CREATE_TASK">(),
  description: text("description").notNull(),
  targetUserId: text("target_user_id")
    .references(() => user.id, { onDelete: "set null" }),
  metadata: text("metadata"), // JSON with additional data
  executed: boolean("executed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// AI Team Members
export const aiTeamMember = pgTable("ai_team_member", {
  id: text("id").primaryKey(),
  name: text("name").notNull(), // Василий, Анна, Дмитрий, etc.
  role: text("role").notNull().$type<"AI_CTO" | "AI_HR" | "AI_PM" | "AI_QA" | "AI_DEVOPS" | "AI_DESIGNER" | "AI_ANALYST" | "AI_CODE_REVIEWER" | "AI_SECURITY" | "AI_PERFORMANCE" | "AI_DOCUMENTATION" | "AI_ANALYTICS" | "AI_MEETING_ASSISTANT" | "AI_BURNOUT_DETECTOR">(),
  specialization: text("specialization").notNull(),
  personality: text("personality"), // JSON with AI personality traits
  skills: text("skills"), // JSON array of AI skills
  isActive: boolean("is_active").default(true),
  lastActive: timestamp("last_active").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

// Bug Reports
export const bugReport = pgTable("bug_report", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  stepsToReproduce: text("steps_to_reproduce"),
  expectedBehavior: text("expected_behavior"),
  actualBehavior: text("actual_behavior"),
  status: text("status").notNull().$type<"NEW" | "ASSIGNED" | "IN_PROGRESS" | "TESTING" | "RESOLVED" | "CLOSED">().default("NEW"),
  priority: text("priority").notNull().$type<"CRITICAL" | "HIGH" | "MEDIUM" | "LOW">().default("MEDIUM"),
  category: text("category").notNull().$type<"FRONTEND" | "BACKEND" | "DATABASE" | "API" | "UI_UX" | "PERFORMANCE" | "SECURITY">(),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  reporterId: text("reporter_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  assigneeId: text("assignee_id")
    .references(() => user.id, { onDelete: "set null" }),
  aiQaId: text("ai_qa_id")
    .references(() => aiTeamMember.id, { onDelete: "set null" }),
  screenshots: text("screenshots"), // JSON array of screenshot URLs
  environment: text("environment"), // Browser, OS, etc.
  severity: text("severity").$type<"BLOCKER" | "CRITICAL" | "MAJOR" | "MINOR" | "TRIVIAL">(),
  estimatedFixTime: integer("estimated_fix_time"), // hours
  actualFixTime: integer("actual_fix_time"), // hours
  aiAnalysis: text("ai_analysis"), // JSON with AI QA analysis
  aiRecommendations: text("ai_recommendations"), // JSON array of AI recommendations
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

// AI QA Analysis
export const aiQaAnalysis = pgTable("ai_qa_analysis", {
  id: text("id").primaryKey(),
  bugReportId: text("bug_report_id")
    .notNull()
    .references(() => bugReport.id, { onDelete: "cascade" }),
  aiQaId: text("ai_qa_id")
    .notNull()
    .references(() => aiTeamMember.id, { onDelete: "cascade" }),
  analysisType: text("analysis_type").notNull().$type<"BUG_ANALYSIS" | "TEST_GENERATION" | "PREDICTION" | "QUALITY_CHECK">(),
  analysis: text("analysis").notNull(), // Detailed analysis
  confidence: integer("confidence").notNull(), // 0-100
  recommendations: text("recommendations"), // JSON array of recommendations
  testCases: text("test_cases"), // JSON array of generated test cases
  predictedRisk: text("predicted_risk").$type<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Code Reviews
export const codeReview = pgTable("code_review", {
  id: text("id").primaryKey(),
  pullRequestId: text("pull_request_id").notNull(),
  repositoryId: text("repository_id").notNull(),
  authorId: text("author_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  aiReviewerId: text("ai_reviewer_id")
    .notNull()
    .references(() => aiTeamMember.id, { onDelete: "cascade" }),
  status: text("status").notNull().$type<"PENDING" | "IN_PROGRESS" | "APPROVED" | "REJECTED" | "NEEDS_CHANGES">().default("PENDING"),
  qualityScore: integer("quality_score"), // 0-100
  securityScore: integer("security_score"), // 0-100
  performanceScore: integer("performance_score"), // 0-100
  maintainabilityScore: integer("maintainability_score"), // 0-100
  overallScore: integer("overall_score"), // 0-100
  issues: text("issues"), // JSON array of found issues
  suggestions: text("suggestions"), // JSON array of suggestions
  approved: boolean("approved").default(false),
  blockingIssues: text("blocking_issues"), // JSON array of blocking issues
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

// Quality Gates
export const qualityGate = pgTable("quality_gate", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  rules: text("rules").notNull(), // JSON array of quality rules
  isActive: boolean("is_active").default(true),
  minQualityScore: integer("min_quality_score").default(80),
  minSecurityScore: integer("min_security_score").default(90),
  minPerformanceScore: integer("min_performance_score").default(70),
  minMaintainabilityScore: integer("min_maintainability_score").default(75),
  autoBlock: boolean("auto_block").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

// AI Analytics
export const aiAnalytics = pgTable("ai_analytics", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  analyticsType: text("analytics_type").notNull().$type<"TEAM_PERFORMANCE" | "CODE_QUALITY" | "PRODUCTIVITY" | "BURNOUT_DETECTION" | "COST_OPTIMIZATION">(),
  data: text("data").notNull(), // JSON with analytics data
  insights: text("insights"), // JSON array of insights
  recommendations: text("recommendations"), // JSON array of recommendations
  confidence: integer("confidence").notNull(), // 0-100
  generatedBy: text("generated_by")
    .notNull()
    .references(() => aiTeamMember.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// AI Documentation
export const aiDocumentation = pgTable("ai_documentation", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  docType: text("doc_type").notNull().$type<"API_DOCS" | "CODE_COMMENTS" | "USER_GUIDE" | "TECHNICAL_SPEC" | "README">(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  generatedBy: text("generated_by")
    .notNull()
    .references(() => aiTeamMember.id, { onDelete: "cascade" }),
  autoGenerated: boolean("auto_generated").default(true),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
