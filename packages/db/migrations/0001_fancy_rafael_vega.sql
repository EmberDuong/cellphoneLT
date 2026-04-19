ALTER TABLE "staff" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "staff" ADD COLUMN "password_hash" varchar(255) NOT NULL;