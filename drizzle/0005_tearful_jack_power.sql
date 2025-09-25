CREATE TABLE "ai_analytics" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"analytics_type" text NOT NULL,
	"data" text NOT NULL,
	"insights" text,
	"recommendations" text,
	"confidence" integer NOT NULL,
	"generated_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_documentation" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"doc_type" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"generated_by" text NOT NULL,
	"auto_generated" boolean DEFAULT true,
	"last_updated" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_qa_analysis" (
	"id" text PRIMARY KEY NOT NULL,
	"bug_report_id" text NOT NULL,
	"ai_qa_id" text NOT NULL,
	"analysis_type" text NOT NULL,
	"analysis" text NOT NULL,
	"confidence" integer NOT NULL,
	"recommendations" text,
	"test_cases" text,
	"predicted_risk" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_team_member" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"specialization" text NOT NULL,
	"personality" text,
	"skills" text,
	"is_active" boolean DEFAULT true,
	"last_active" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bug_report" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"steps_to_reproduce" text,
	"expected_behavior" text,
	"actual_behavior" text,
	"status" text DEFAULT 'NEW' NOT NULL,
	"priority" text DEFAULT 'MEDIUM' NOT NULL,
	"category" text NOT NULL,
	"project_id" text NOT NULL,
	"reporter_id" text NOT NULL,
	"assignee_id" text,
	"ai_qa_id" text,
	"screenshots" text,
	"environment" text,
	"severity" text,
	"estimated_fix_time" integer,
	"actual_fix_time" integer,
	"ai_analysis" text,
	"ai_recommendations" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "code_review" (
	"id" text PRIMARY KEY NOT NULL,
	"pull_request_id" text NOT NULL,
	"repository_id" text NOT NULL,
	"author_id" text NOT NULL,
	"ai_reviewer_id" text NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"quality_score" integer,
	"security_score" integer,
	"performance_score" integer,
	"maintainability_score" integer,
	"overall_score" integer,
	"issues" text,
	"suggestions" text,
	"approved" boolean DEFAULT false,
	"blocking_issues" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quality_gate" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"rules" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"min_quality_score" integer DEFAULT 80,
	"min_security_score" integer DEFAULT 90,
	"min_performance_score" integer DEFAULT 70,
	"min_maintainability_score" integer DEFAULT 75,
	"auto_block" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_analytics" ADD CONSTRAINT "ai_analytics_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_analytics" ADD CONSTRAINT "ai_analytics_generated_by_ai_team_member_id_fk" FOREIGN KEY ("generated_by") REFERENCES "public"."ai_team_member"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_documentation" ADD CONSTRAINT "ai_documentation_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_documentation" ADD CONSTRAINT "ai_documentation_generated_by_ai_team_member_id_fk" FOREIGN KEY ("generated_by") REFERENCES "public"."ai_team_member"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_qa_analysis" ADD CONSTRAINT "ai_qa_analysis_bug_report_id_bug_report_id_fk" FOREIGN KEY ("bug_report_id") REFERENCES "public"."bug_report"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_qa_analysis" ADD CONSTRAINT "ai_qa_analysis_ai_qa_id_ai_team_member_id_fk" FOREIGN KEY ("ai_qa_id") REFERENCES "public"."ai_team_member"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bug_report" ADD CONSTRAINT "bug_report_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bug_report" ADD CONSTRAINT "bug_report_reporter_id_user_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bug_report" ADD CONSTRAINT "bug_report_assignee_id_user_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bug_report" ADD CONSTRAINT "bug_report_ai_qa_id_ai_team_member_id_fk" FOREIGN KEY ("ai_qa_id") REFERENCES "public"."ai_team_member"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "code_review" ADD CONSTRAINT "code_review_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "code_review" ADD CONSTRAINT "code_review_ai_reviewer_id_ai_team_member_id_fk" FOREIGN KEY ("ai_reviewer_id") REFERENCES "public"."ai_team_member"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quality_gate" ADD CONSTRAINT "quality_gate_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;