CREATE TABLE "project_status" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"status" text NOT NULL,
	"health_score" integer NOT NULL,
	"progress" integer NOT NULL,
	"ai_analysis" text,
	"recommendations" text,
	"last_analyzed" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vasily_action" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"action_type" text NOT NULL,
	"description" text NOT NULL,
	"target_user_id" text,
	"metadata" text,
	"executed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workspace_member" ADD COLUMN "it_role" text;--> statement-breakpoint
ALTER TABLE "workspace_member" ADD COLUMN "skills" text;--> statement-breakpoint
ALTER TABLE "workspace_member" ADD COLUMN "experience" integer;--> statement-breakpoint
ALTER TABLE "project_status" ADD CONSTRAINT "project_status_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vasily_action" ADD CONSTRAINT "vasily_action_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vasily_action" ADD CONSTRAINT "vasily_action_target_user_id_user_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;