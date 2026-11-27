CREATE TABLE "inquiries" (
	"id" text PRIMARY KEY NOT NULL,
	"listing_id" text,
	"area" text,
	"user_id" text,
	"name" text,
	"phone" text,
	"message" text,
	"channel" text DEFAULT 'whatsapp' NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"name" text,
	"email" text,
	"category" text,
	"message" text NOT NULL,
	"page" text,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "search_events" (
	"id" text PRIMARY KEY NOT NULL,
	"area" text,
	"type" text,
	"max_rent" integer,
	"query" text,
	"user_id" text,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_events" ADD CONSTRAINT "search_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;