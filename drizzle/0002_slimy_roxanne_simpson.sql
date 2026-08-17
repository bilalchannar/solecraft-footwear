CREATE TABLE `auditLogs` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`actorUserId` int,
	`action` varchar(128) NOT NULL,
	`entityType` varchar(64) NOT NULL,
	`entityId` varchar(96),
	`beforeData` json,
	`afterData` json,
	`ipAddress` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `checkoutRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`idempotencyKey` varchar(128) NOT NULL,
	`requestHash` varchar(128) NOT NULL,
	`orderId` int,
	`status` enum('started','completed','failed') NOT NULL DEFAULT 'started',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `checkoutRequests_id` PRIMARY KEY(`id`),
	CONSTRAINT `checkoutRequests_idempotencyKey_unique` UNIQUE(`idempotencyKey`)
);
--> statement-breakpoint
CREATE TABLE `inventoryAdjustments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`variantId` int NOT NULL,
	`actorUserId` int,
	`orderId` int,
	`kind` enum('receive','sale','return','manual','correction') NOT NULL,
	`delta` int NOT NULL,
	`beforeQuantity` int NOT NULL,
	`afterQuantity` int NOT NULL,
	`reason` varchar(500) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inventoryAdjustments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `newsletterSubscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`userId` int,
	`status` enum('subscribed','unsubscribed','bounced') NOT NULL DEFAULT 'subscribed',
	`source` varchar(64) NOT NULL DEFAULT 'storefront',
	`unsubscribeToken` varchar(96) NOT NULL,
	`subscribedAt` timestamp NOT NULL DEFAULT (now()),
	`unsubscribedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `newsletterSubscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `newsletterSubscribers_email_unique` UNIQUE(`email`),
	CONSTRAINT `newsletterSubscribers_unsubscribeToken_unique` UNIQUE(`unsubscribeToken`)
);
--> statement-breakpoint
CREATE TABLE `orderStatusHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`actorUserId` int,
	`fromStatus` varchar(40),
	`toStatus` varchar(40) NOT NULL,
	`note` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderStatusHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `returnItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`returnId` int NOT NULL,
	`orderItemId` int NOT NULL,
	`quantity` int NOT NULL,
	CONSTRAINT `returnItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `returns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`publicId` varchar(36) NOT NULL,
	`orderId` int NOT NULL,
	`userId` int NOT NULL,
	`reason` varchar(500) NOT NULL,
	`status` enum('requested','approved','rejected','received','cancelled') NOT NULL DEFAULT 'requested',
	`refundStatus` enum('not_requested','pending','partial','refunded','failed') NOT NULL DEFAULT 'not_requested',
	`refundAmount` decimal(12,2),
	`restock` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `returns_id` PRIMARY KEY(`id`),
	CONSTRAINT `returns_publicId_unique` UNIQUE(`publicId`)
);
--> statement-breakpoint
CREATE TABLE `shipments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`provider` varchar(96) NOT NULL,
	`trackingNumber` varchar(160),
	`status` enum('pending','label_created','in_transit','out_for_delivery','delivered','returned','failed') NOT NULL DEFAULT 'pending',
	`estimatedDeliveryAt` timestamp,
	`deliveredAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shipments_id` PRIMARY KEY(`id`),
	CONSTRAINT `shipments_orderId_unique` UNIQUE(`orderId`)
);
--> statement-breakpoint
ALTER TABLE `auditLogs` ADD CONSTRAINT `auditLogs_actorUserId_users_id_fk` FOREIGN KEY (`actorUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `checkoutRequests` ADD CONSTRAINT `checkoutRequests_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `checkoutRequests` ADD CONSTRAINT `checkoutRequests_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventoryAdjustments` ADD CONSTRAINT `inventoryAdjustments_variantId_productVariants_id_fk` FOREIGN KEY (`variantId`) REFERENCES `productVariants`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventoryAdjustments` ADD CONSTRAINT `inventoryAdjustments_actorUserId_users_id_fk` FOREIGN KEY (`actorUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventoryAdjustments` ADD CONSTRAINT `inventoryAdjustments_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `newsletterSubscribers` ADD CONSTRAINT `newsletterSubscribers_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orderStatusHistory` ADD CONSTRAINT `orderStatusHistory_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orderStatusHistory` ADD CONSTRAINT `orderStatusHistory_actorUserId_users_id_fk` FOREIGN KEY (`actorUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `returnItems` ADD CONSTRAINT `returnItems_returnId_returns_id_fk` FOREIGN KEY (`returnId`) REFERENCES `returns`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `returnItems` ADD CONSTRAINT `returnItems_orderItemId_orderItems_id_fk` FOREIGN KEY (`orderItemId`) REFERENCES `orderItems`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `returns` ADD CONSTRAINT `returns_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `returns` ADD CONSTRAINT `returns_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shipments` ADD CONSTRAINT `shipments_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `audit_logs_entity_idx` ON `auditLogs` (`entityType`,`entityId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `audit_logs_actor_idx` ON `auditLogs` (`actorUserId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `checkout_requests_user_idx` ON `checkoutRequests` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `inventory_adjustments_variant_idx` ON `inventoryAdjustments` (`variantId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `order_status_history_order_idx` ON `orderStatusHistory` (`orderId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `returns_order_customer_idx` ON `returns` (`orderId`,`userId`,`createdAt`);