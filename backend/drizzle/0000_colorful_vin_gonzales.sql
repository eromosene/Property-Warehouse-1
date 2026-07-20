CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"role" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"password_hash" text NOT NULL,
	"area" text,
	"budget" text,
	"prop_type" text,
	"lga" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"joined_date" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" text PRIMARY KEY NOT NULL,
	"landlord_id" text NOT NULL,
	"landlord_name" text NOT NULL,
	"landlord_phone" text NOT NULL,
	"landlord_whatsapp" text NOT NULL,
	"title" text NOT NULL,
	"area" text NOT NULL,
	"lga" text NOT NULL,
	"address" text NOT NULL,
	"type" text NOT NULL,
	"rent_per_year" integer NOT NULL,
	"caution_fee" integer NOT NULL,
	"service_charge" integer NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_monthly" boolean DEFAULT false NOT NULL,
	"beds" integer NOT NULL,
	"baths" integer NOT NULL,
	"amenities_json" text DEFAULT '[]' NOT NULL,
	"description" text NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"ownership_doc_types_json" text DEFAULT '[]' NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_images" (
	"id" text PRIMARY KEY NOT NULL,
	"listing_id" text NOT NULL,
	"url" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_documents" (
	"id" text PRIMARY KEY NOT NULL,
	"listing_id" text NOT NULL,
	"url" text NOT NULL,
	"doc_type" text,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_landlord_id_users_id_fk" FOREIGN KEY ("landlord_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_images" ADD CONSTRAINT "listing_images_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_documents" ADD CONSTRAINT "listing_documents_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;