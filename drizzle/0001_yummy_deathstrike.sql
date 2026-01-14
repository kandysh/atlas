ALTER TABLE "tasks" ADD COLUMN "display_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "sequence_number" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "numeric_id" serial NOT NULL;--> statement-breakpoint
CREATE INDEX "workspace_sequence_idx" ON "tasks" USING btree ("workspace_id","sequence_number");--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_display_id_unique" UNIQUE("display_id");--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_numeric_id_unique" UNIQUE("numeric_id");