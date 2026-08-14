CREATE TABLE `commits` (
	`hash` text PRIMARY KEY NOT NULL,
	`note_id` text NOT NULL,
	`parent_hash` text,
	`message` text NOT NULL,
	`emoji` text NOT NULL,
	`deleted` integer DEFAULT false NOT NULL,
	`user_id` text NOT NULL,
	`device_id` text NOT NULL,
	`hlc` text NOT NULL,
	`created` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `commits_note_hlc` ON `commits` (`note_id`,`hlc`);--> statement-breakpoint
CREATE INDEX `commits_user_created` ON `commits` (`user_id`,`created`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`image` text,
	`created` text,
	`updated` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);