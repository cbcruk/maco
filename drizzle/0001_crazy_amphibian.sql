-- `root_note_id`는 NOT NULL 이므로 `ALTER TABLE ADD COLUMN` 으로는 넣을 수 없다
-- (기존 행에 채울 값이 없어 SQLite 가 거부한다). 그래서 새 테이블을 만들어
-- 옮겨 담으면서 백필한다 — 기존 리비전은 전부 뿌리이므로 `root_note_id = note_id`,
-- `depth = 0` 이다.
CREATE TABLE `__new_commits` (
	`hash` text PRIMARY KEY NOT NULL,
	`note_id` text NOT NULL,
	`parent_hash` text,
	`message` text NOT NULL,
	`emoji` text NOT NULL,
	`deleted` integer DEFAULT false NOT NULL,
	`reply_to_note_id` text,
	`reply_to_hash` text,
	`root_note_id` text NOT NULL,
	`depth` integer DEFAULT 0 NOT NULL,
	`user_id` text NOT NULL,
	`device_id` text NOT NULL,
	`hlc` text NOT NULL,
	`created` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_commits` (
	`hash`, `note_id`, `parent_hash`, `message`, `emoji`, `deleted`,
	`reply_to_note_id`, `reply_to_hash`, `root_note_id`, `depth`,
	`user_id`, `device_id`, `hlc`, `created`
)
SELECT
	`hash`, `note_id`, `parent_hash`, `message`, `emoji`, `deleted`,
	NULL, NULL, `note_id`, 0,
	`user_id`, `device_id`, `hlc`, `created`
FROM `commits`;
--> statement-breakpoint
DROP TABLE `commits`;
--> statement-breakpoint
ALTER TABLE `__new_commits` RENAME TO `commits`;
--> statement-breakpoint
CREATE INDEX `commits_note_hlc` ON `commits` (`note_id`,`hlc`);
--> statement-breakpoint
CREATE INDEX `commits_user_created` ON `commits` (`user_id`,`created`);
--> statement-breakpoint
CREATE INDEX `commits_root` ON `commits` (`root_note_id`,`created`);
--> statement-breakpoint
CREATE INDEX `commits_reply_to` ON `commits` (`reply_to_note_id`);
