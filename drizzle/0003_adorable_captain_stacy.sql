CREATE TABLE "ai_conversation" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"workspace_id" text,
	"query" text NOT NULL,
	"response" text NOT NULL,
	"context" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_task_suggestion" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"project_id" text,
	"title" text NOT NULL,
	"description" text,
	"priority" text,
	"estimated_hours" integer,
	"reasoning" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "issue" ADD COLUMN "embedding" text;--> statement-breakpoint
ALTER TABLE "issue" ADD COLUMN "ai_generated" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "issue" ADD COLUMN "estimated_hours" integer;--> statement-breakpoint
ALTER TABLE "issue" ADD COLUMN "actual_hours" integer;--> statement-breakpoint
ALTER TABLE "ai_conversation" ADD CONSTRAINT "ai_conversation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_conversation" ADD CONSTRAINT "ai_conversation_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_task_suggestion" ADD CONSTRAINT "ai_task_suggestion_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_task_suggestion" ADD CONSTRAINT "ai_task_suggestion_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;