CREATE TYPE "public"."product_status" AS ENUM('draft', 'active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."condition_grade" AS ENUM('new', 'grade_a', 'grade_b', 'grade_c');--> statement-breakpoint
CREATE TYPE "public"."stock_status" AS ENUM('available', 'reserved', 'in_repair', 'sold', 'returned');--> statement-breakpoint
CREATE TYPE "public"."repair_priority" AS ENUM('normal', 'urgent', 'vip');--> statement-breakpoint
CREATE TYPE "public"."repair_status" AS ENUM('intake', 'diagnosing', 'awaiting_parts', 'in_progress', 'quality_check', 'done', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."trade_in_status" AS ENUM('pending', 'inspecting', 'offer_sent', 'accepted', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TABLE "brands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"logo_url" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "brands_name_unique" UNIQUE("name"),
	CONSTRAINT "brands_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"parent_id" uuid,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" varchar(255),
	"role" varchar(50) DEFAULT 'technician' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "staff_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"phone_number" varchar(20),
	"email" varchar(255),
	"zalo_oa_id" varchar(100),
	"loyalty_points" integer DEFAULT 0 NOT NULL,
	"total_lifetime_spend" numeric(16, 0) DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customers_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"sku" varchar(100),
	"brand_id" uuid,
	"category_id" uuid,
	"base_price" numeric(14, 0),
	"ai_specs" jsonb,
	"is_serialized" boolean DEFAULT false NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb,
	"status" "product_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug"),
	CONSTRAINT "products_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "inventory_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"imei_serial" varchar(50),
	"quantity" integer DEFAULT 1 NOT NULL,
	"condition_grade" "condition_grade" DEFAULT 'new' NOT NULL,
	"warehouse_location" varchar(100),
	"stock_status" "stock_status" DEFAULT 'available' NOT NULL,
	"trade_in_id" uuid,
	"cost_price" varchar(20),
	"notes" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repair_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"technician_id" uuid,
	"device_brand" varchar(100) NOT NULL,
	"device_model" varchar(150) NOT NULL,
	"device_imei" varchar(50),
	"device_color" varchar(50),
	"reported_issue" text NOT NULL,
	"technician_notes" text,
	"intake_condition" jsonb,
	"device_photos" jsonb DEFAULT '[]'::jsonb,
	"estimated_cost" numeric(12, 0),
	"final_cost" numeric(12, 0),
	"status" "repair_status" DEFAULT 'intake' NOT NULL,
	"priority" "repair_priority" DEFAULT 'normal' NOT NULL,
	"appointment_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_parts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"warranty_days" integer DEFAULT 90,
	"cost_applied" numeric(12, 0),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trade_in_appraisals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"device_brand" varchar(100) NOT NULL,
	"device_model" varchar(150) NOT NULL,
	"device_storage" varchar(50),
	"device_imei" varchar(50),
	"device_color" varchar(50),
	"physical_condition" jsonb NOT NULL,
	"functional_status" jsonb,
	"ai_offered_price" numeric(12, 0),
	"final_agreed_price" numeric(12, 0),
	"status" "trade_in_status" DEFAULT 'pending' NOT NULL,
	"appointment_at" timestamp,
	"accepted_at" timestamp,
	"notes" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_tickets" ADD CONSTRAINT "repair_tickets_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_tickets" ADD CONSTRAINT "repair_tickets_technician_id_staff_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_parts" ADD CONSTRAINT "ticket_parts_ticket_id_repair_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."repair_tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_in_appraisals" ADD CONSTRAINT "trade_in_appraisals_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;