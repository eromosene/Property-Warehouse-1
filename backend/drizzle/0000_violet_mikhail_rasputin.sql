CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`role` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`password_hash` text NOT NULL,
	`area` text,
	`budget` text,
	`prop_type` text,
	`lga` text,
	`is_verified` integer DEFAULT false NOT NULL,
	`joined_date` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `listings` (
	`id` text PRIMARY KEY NOT NULL,
	`landlord_id` text NOT NULL,
	`landlord_name` text NOT NULL,
	`landlord_phone` text NOT NULL,
	`landlord_whatsapp` text NOT NULL,
	`title` text NOT NULL,
	`area` text NOT NULL,
	`lga` text NOT NULL,
	`address` text NOT NULL,
	`type` text NOT NULL,
	`rent_per_year` integer NOT NULL,
	`caution_fee` integer NOT NULL,
	`service_charge` integer NOT NULL,
	`is_verified` integer DEFAULT false NOT NULL,
	`is_monthly` integer DEFAULT false NOT NULL,
	`beds` integer NOT NULL,
	`baths` integer NOT NULL,
	`amenities_json` text DEFAULT '[]' NOT NULL,
	`description` text NOT NULL,
	`views` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`ownership_doc_types_json` text DEFAULT '[]' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`landlord_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `listing_images` (
	`id` text PRIMARY KEY NOT NULL,
	`listing_id` text NOT NULL,
	`url` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `listing_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`listing_id` text NOT NULL,
	`url` text NOT NULL,
	`doc_type` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON UPDATE no action ON DELETE cascade
);
