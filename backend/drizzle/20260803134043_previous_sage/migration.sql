CREATE TYPE "project_visibility" AS ENUM('PRIVATE', 'PUBLIC', 'UNLISTED');--> statement-breakpoint
CREATE TYPE "simulation_status" AS ENUM('PENDING', 'RUNNING', 'PAUSED', 'COMPLETED', 'FAILED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "architectures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"project_id" uuid NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text,
	"graph" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "architectures_project_id_name_unique" UNIQUE("project_id","name")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"owner_id" uuid NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text,
	"visibility" "project_visibility" DEFAULT 'PRIVATE'::"project_visibility" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scenarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"architecture_id" uuid NOT NULL,
	"name" varchar(150) NOT NULL,
	"events" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"refresh_token_hash" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"revoked_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "metrics" (
	"id" bigserial PRIMARY KEY,
	"simulation_id" uuid NOT NULL,
	"timestamp_ms" integer NOT NULL,
	"requests_per_sec" real NOT NULL,
	"avg_latency_ms" real NOT NULL,
	"error_rate" real NOT NULL,
	"queue_depth" integer NOT NULL,
	"cache_hit_rate" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE "simulation_events" (
	"id" bigserial PRIMARY KEY,
	"simulation_id" uuid NOT NULL,
	"timestamp_ms" integer NOT NULL,
	"event_type" varchar NOT NULL,
	"payload" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "simulations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"architecture_id" uuid NOT NULL,
	"status" "simulation_status" DEFAULT 'PENDING'::"simulation_status" NOT NULL,
	"config" jsonb,
	"snapshot" jsonb,
	"started_at" timestamp,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL UNIQUE,
	"password_hash" text NOT NULL,
	"avatar_url" text,
	"email_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "architectures_project_id_idx" ON "architectures" ("project_id");--> statement-breakpoint
CREATE INDEX "projects_owner_id_idx" ON "projects" ("owner_id");--> statement-breakpoint
CREATE INDEX "metrics_simulation_timestamp_idx" ON "metrics" ("simulation_id","timestamp_ms");--> statement-breakpoint
CREATE INDEX "simulation_events_simulation_timestamp_idx" ON "simulation_events" ("simulation_id","timestamp_ms");--> statement-breakpoint
CREATE INDEX "simulations_architecture_id_idx" ON "simulations" ("architecture_id");--> statement-breakpoint
ALTER TABLE "architectures" ADD CONSTRAINT "architectures_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_users_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "scenarios" ADD CONSTRAINT "scenarios_architecture_id_architectures_id_fkey" FOREIGN KEY ("architecture_id") REFERENCES "architectures"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "metrics" ADD CONSTRAINT "metrics_simulation_id_simulations_id_fkey" FOREIGN KEY ("simulation_id") REFERENCES "simulations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "simulation_events" ADD CONSTRAINT "simulation_events_simulation_id_simulations_id_fkey" FOREIGN KEY ("simulation_id") REFERENCES "simulations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "simulations" ADD CONSTRAINT "simulations_architecture_id_architectures_id_fkey" FOREIGN KEY ("architecture_id") REFERENCES "architectures"("id") ON DELETE CASCADE;