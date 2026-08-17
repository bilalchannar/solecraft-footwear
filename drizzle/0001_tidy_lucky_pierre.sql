CREATE TABLE `addresses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`publicId` varchar(36) NOT NULL,
	`userId` int NOT NULL,
	`label` varchar(64) NOT NULL,
	`fullName` varchar(160) NOT NULL,
	`phone` varchar(24) NOT NULL,
	`email` varchar(320),
	`province` varchar(96) NOT NULL,
	`city` varchar(96) NOT NULL,
	`area` varchar(128),
	`addressLine` text NOT NULL,
	`postalCode` varchar(20),
	`deliveryInstructions` varchar(500),
	`isDefault` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `addresses_id` PRIMARY KEY(`id`),
	CONSTRAINT `addresses_publicId_unique` UNIQUE(`publicId`)
);
--> statement-breakpoint
CREATE TABLE `analyticsEvents` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`userId` int,
	`eventType` varchar(96) NOT NULL,
	`entityType` varchar(64),
	`entityId` varchar(96),
	`payload` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analyticsEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `banners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`publicId` varchar(36) NOT NULL,
	`placement` varchar(64) NOT NULL,
	`title` varchar(160),
	`subtitle` varchar(320),
	`imageUrl` text NOT NULL,
	`mobileImageUrl` text,
	`href` varchar(512),
	`sortOrder` int NOT NULL DEFAULT 0,
	`active` int NOT NULL DEFAULT 1,
	`startsAt` timestamp,
	`endsAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `banners_id` PRIMARY KEY(`id`),
	CONSTRAINT `banners_publicId_unique` UNIQUE(`publicId`)
);
--> statement-breakpoint
CREATE TABLE `brands` (
	`id` int AUTO_INCREMENT NOT NULL,
	`publicId` varchar(36) NOT NULL,
	`name` varchar(128) NOT NULL,
	`slug` varchar(160) NOT NULL,
	`description` text,
	`logoUrl` text,
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `brands_id` PRIMARY KEY(`id`),
	CONSTRAINT `brands_publicId_unique` UNIQUE(`publicId`),
	CONSTRAINT `brands_name_unique` UNIQUE(`name`),
	CONSTRAINT `brands_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `cartItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cartId` int NOT NULL,
	`variantId` int NOT NULL,
	`quantity` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cartItems_id` PRIMARY KEY(`id`),
	CONSTRAINT `cart_variant_uq` UNIQUE(`cartId`,`variantId`)
);
--> statement-breakpoint
CREATE TABLE `carts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`publicId` varchar(36) NOT NULL,
	`userId` int NOT NULL,
	`couponCode` varchar(64),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `carts_id` PRIMARY KEY(`id`),
	CONSTRAINT `carts_publicId_unique` UNIQUE(`publicId`),
	CONSTRAINT `carts_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`publicId` varchar(36) NOT NULL,
	`parentId` int,
	`name` varchar(128) NOT NULL,
	`slug` varchar(160) NOT NULL,
	`description` text,
	`imageUrl` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`active` int NOT NULL DEFAULT 1,
	`seoTitle` varchar(160),
	`seoDescription` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_publicId_unique` UNIQUE(`publicId`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `couponUsage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`couponId` int NOT NULL,
	`userId` int NOT NULL,
	`orderId` int,
	`discountAmount` decimal(12,2) NOT NULL,
	`usedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `couponUsage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(64) NOT NULL,
	`kind` enum('percentage','fixed','free_shipping') NOT NULL,
	`value` decimal(12,2) NOT NULL,
	`minimumOrder` decimal(12,2),
	`maximumDiscount` decimal(12,2),
	`startsAt` timestamp,
	`expiresAt` timestamp,
	`usageLimit` int,
	`perUserLimit` int,
	`firstOrderOnly` int NOT NULL DEFAULT 0,
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coupons_id` PRIMARY KEY(`id`),
	CONSTRAINT `coupons_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `discountCategories` (
	`discountId` int NOT NULL,
	`categoryId` int NOT NULL,
	CONSTRAINT `discountCategories_discountId_categoryId_pk` PRIMARY KEY(`discountId`,`categoryId`)
);
--> statement-breakpoint
CREATE TABLE `discountProducts` (
	`discountId` int NOT NULL,
	`productId` int NOT NULL,
	CONSTRAINT `discountProducts_discountId_productId_pk` PRIMARY KEY(`discountId`,`productId`)
);
--> statement-breakpoint
CREATE TABLE `discounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`type` enum('product','category','storewide','flash_sale','buy_x_get_y','first_order') NOT NULL,
	`valueType` enum('percentage','fixed') NOT NULL,
	`value` decimal(12,2) NOT NULL,
	`minimumOrder` decimal(12,2),
	`startsAt` timestamp,
	`expiresAt` timestamp,
	`active` int NOT NULL DEFAULT 1,
	`stackable` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `discounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `homepageSections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(96) NOT NULL,
	`heading` varchar(160),
	`subheading` varchar(320),
	`content` json,
	`active` int NOT NULL DEFAULT 1,
	`sortOrder` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `homepageSections_id` PRIMARY KEY(`id`),
	CONSTRAINT `homepageSections_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `inventory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`variantId` int NOT NULL,
	`stockOnHand` int NOT NULL DEFAULT 0,
	`reservedStock` int NOT NULL DEFAULT 0,
	`lowStockThreshold` int NOT NULL DEFAULT 3,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventory_id` PRIMARY KEY(`id`),
	CONSTRAINT `inventory_variantId_unique` UNIQUE(`variantId`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`channel` enum('in_app','email','whatsapp') NOT NULL DEFAULT 'in_app',
	`type` varchar(96) NOT NULL,
	`title` varchar(160) NOT NULL,
	`body` text NOT NULL,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int,
	`variantId` int,
	`productName` varchar(255) NOT NULL,
	`productSlug` varchar(255) NOT NULL,
	`variantSku` varchar(96) NOT NULL,
	`size` varchar(32) NOT NULL,
	`color` varchar(64) NOT NULL,
	`imageUrl` text,
	`unitPrice` decimal(12,2) NOT NULL,
	`discountAmount` decimal(12,2) NOT NULL DEFAULT '0',
	`quantity` int NOT NULL,
	`lineTotal` decimal(12,2) NOT NULL,
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`publicId` varchar(36) NOT NULL,
	`orderNumber` varchar(40) NOT NULL,
	`userId` int NOT NULL,
	`addressId` int,
	`status` enum('pending','confirmed','processing','packed','shipped','out_for_delivery','delivered','cancelled','returned','refunded') NOT NULL DEFAULT 'pending',
	`paymentMethod` enum('cod','online') NOT NULL,
	`paymentStatus` enum('pending','paid','failed','cancelled','refunded','partially_refunded') NOT NULL DEFAULT 'pending',
	`subtotal` decimal(12,2) NOT NULL,
	`productDiscount` decimal(12,2) NOT NULL DEFAULT '0',
	`couponCode` varchar(64),
	`couponDiscount` decimal(12,2) NOT NULL DEFAULT '0',
	`shippingAmount` decimal(12,2) NOT NULL DEFAULT '0',
	`totalAmount` decimal(12,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'PKR',
	`shippingSnapshot` json NOT NULL,
	`trackingNumber` varchar(128),
	`customerNote` varchar(500),
	`placedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_publicId_unique` UNIQUE(`publicId`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`publicId` varchar(36) NOT NULL,
	`orderId` int NOT NULL,
	`provider` varchar(96) NOT NULL,
	`providerReference` varchar(160),
	`amount` decimal(12,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'PKR',
	`status` enum('pending','paid','failed','cancelled','refunded','partially_refunded') NOT NULL DEFAULT 'pending',
	`providerPayload` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_publicId_unique` UNIQUE(`publicId`)
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(96) NOT NULL,
	`description` text,
	CONSTRAINT `permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `permissions_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `productImages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`variantId` int,
	`storageKey` varchar(512),
	`url` text NOT NULL,
	`altText` varchar(255),
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `productImages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `productTags` (
	`productId` int NOT NULL,
	`tagId` int NOT NULL,
	CONSTRAINT `productTags_productId_tagId_pk` PRIMARY KEY(`productId`,`tagId`)
);
--> statement-breakpoint
CREATE TABLE `productVariants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`publicId` varchar(36) NOT NULL,
	`productId` int NOT NULL,
	`sku` varchar(96) NOT NULL,
	`size` varchar(32) NOT NULL,
	`color` varchar(64) NOT NULL,
	`colorHex` varchar(16),
	`priceOverride` decimal(12,2),
	`salePriceOverride` decimal(12,2),
	`imageUrl` text,
	`availability` enum('available','out_of_stock','discontinued') NOT NULL DEFAULT 'available',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `productVariants_id` PRIMARY KEY(`id`),
	CONSTRAINT `productVariants_publicId_unique` UNIQUE(`publicId`),
	CONSTRAINT `productVariants_sku_unique` UNIQUE(`sku`),
	CONSTRAINT `variants_product_size_color_uq` UNIQUE(`productId`,`size`,`color`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`publicId` varchar(36) NOT NULL,
	`categoryId` int,
	`brandId` int,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`sku` varchar(96) NOT NULL,
	`description` text,
	`shortDescription` varchar(400),
	`material` varchar(128),
	`specifications` json,
	`weightGrams` int,
	`basePrice` decimal(12,2) NOT NULL,
	`salePrice` decimal(12,2),
	`status` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
	`featured` int NOT NULL DEFAULT 0,
	`isNew` int NOT NULL DEFAULT 0,
	`bestSeller` int NOT NULL DEFAULT 0,
	`seoTitle` varchar(160),
	`seoDescription` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_publicId_unique` UNIQUE(`publicId`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`),
	CONSTRAINT `products_sku_unique` UNIQUE(`sku`)
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fullName` varchar(160),
	`phone` varchar(24),
	`avatarUrl` text,
	`marketingOptIn` int NOT NULL DEFAULT 0,
	`disabledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `reviewImages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reviewId` int NOT NULL,
	`storageKey` varchar(512),
	`url` text NOT NULL,
	CONSTRAINT `reviewImages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`userId` int NOT NULL,
	`orderItemId` int,
	`rating` int NOT NULL,
	`body` text NOT NULL,
	`status` enum('pending','approved','rejected','hidden') NOT NULL DEFAULT 'pending',
	`verifiedPurchase` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rolePermissions` (
	`roleId` int NOT NULL,
	`permissionId` int NOT NULL,
	CONSTRAINT `rolePermissions_roleId_permissionId_pk` PRIMARY KEY(`roleId`,`permissionId`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(64) NOT NULL,
	`label` varchar(96) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `roles_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `siteSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(96) NOT NULL,
	`value` json NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `siteSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `siteSettings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(96) NOT NULL,
	`slug` varchar(128) NOT NULL,
	CONSTRAINT `tags_id` PRIMARY KEY(`id`),
	CONSTRAINT `tags_name_unique` UNIQUE(`name`),
	CONSTRAINT `tags_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `userRoles` (
	`userId` int NOT NULL,
	`roleId` int NOT NULL,
	`grantedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userRoles_userId_roleId_pk` PRIMARY KEY(`userId`,`roleId`)
);
--> statement-breakpoint
CREATE TABLE `wishlistItems` (
	`wishlistId` int NOT NULL,
	`productId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wishlistItems_wishlistId_productId_pk` PRIMARY KEY(`wishlistId`,`productId`)
);
--> statement-breakpoint
CREATE TABLE `wishlists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wishlists_id` PRIMARY KEY(`id`),
	CONSTRAINT `wishlists_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','staff','admin','super_admin') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `addresses` ADD CONSTRAINT `addresses_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `analyticsEvents` ADD CONSTRAINT `analyticsEvents_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cartItems` ADD CONSTRAINT `cartItems_cartId_carts_id_fk` FOREIGN KEY (`cartId`) REFERENCES `carts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cartItems` ADD CONSTRAINT `cartItems_variantId_productVariants_id_fk` FOREIGN KEY (`variantId`) REFERENCES `productVariants`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `carts` ADD CONSTRAINT `carts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `couponUsage` ADD CONSTRAINT `couponUsage_couponId_coupons_id_fk` FOREIGN KEY (`couponId`) REFERENCES `coupons`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `couponUsage` ADD CONSTRAINT `couponUsage_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `discountCategories` ADD CONSTRAINT `discountCategories_discountId_discounts_id_fk` FOREIGN KEY (`discountId`) REFERENCES `discounts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `discountCategories` ADD CONSTRAINT `discountCategories_categoryId_categories_id_fk` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `discountProducts` ADD CONSTRAINT `discountProducts_discountId_discounts_id_fk` FOREIGN KEY (`discountId`) REFERENCES `discounts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `discountProducts` ADD CONSTRAINT `discountProducts_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory` ADD CONSTRAINT `inventory_variantId_productVariants_id_fk` FOREIGN KEY (`variantId`) REFERENCES `productVariants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orderItems` ADD CONSTRAINT `orderItems_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orderItems` ADD CONSTRAINT `orderItems_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orderItems` ADD CONSTRAINT `orderItems_variantId_productVariants_id_fk` FOREIGN KEY (`variantId`) REFERENCES `productVariants`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_addressId_addresses_id_fk` FOREIGN KEY (`addressId`) REFERENCES `addresses`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `productImages` ADD CONSTRAINT `productImages_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `productImages` ADD CONSTRAINT `productImages_variantId_productVariants_id_fk` FOREIGN KEY (`variantId`) REFERENCES `productVariants`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `productTags` ADD CONSTRAINT `productTags_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `productTags` ADD CONSTRAINT `productTags_tagId_tags_id_fk` FOREIGN KEY (`tagId`) REFERENCES `tags`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `productVariants` ADD CONSTRAINT `productVariants_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_categoryId_categories_id_fk` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_brandId_brands_id_fk` FOREIGN KEY (`brandId`) REFERENCES `brands`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviewImages` ADD CONSTRAINT `reviewImages_reviewId_reviews_id_fk` FOREIGN KEY (`reviewId`) REFERENCES `reviews`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_orderItemId_orderItems_id_fk` FOREIGN KEY (`orderItemId`) REFERENCES `orderItems`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rolePermissions` ADD CONSTRAINT `rolePermissions_roleId_roles_id_fk` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rolePermissions` ADD CONSTRAINT `rolePermissions_permissionId_permissions_id_fk` FOREIGN KEY (`permissionId`) REFERENCES `permissions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userRoles` ADD CONSTRAINT `userRoles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userRoles` ADD CONSTRAINT `userRoles_roleId_roles_id_fk` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wishlistItems` ADD CONSTRAINT `wishlistItems_wishlistId_wishlists_id_fk` FOREIGN KEY (`wishlistId`) REFERENCES `wishlists`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wishlistItems` ADD CONSTRAINT `wishlistItems_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wishlists` ADD CONSTRAINT `wishlists_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `addresses_owner_idx` ON `addresses` (`userId`,`isDefault`);--> statement-breakpoint
CREATE INDEX `analytics_event_time_idx` ON `analyticsEvents` (`eventType`,`createdAt`);--> statement-breakpoint
CREATE INDEX `banners_placement_idx` ON `banners` (`placement`,`active`,`sortOrder`);--> statement-breakpoint
CREATE INDEX `categories_parent_active_idx` ON `categories` (`parentId`,`active`);--> statement-breakpoint
CREATE INDEX `coupon_usage_customer_idx` ON `couponUsage` (`couponId`,`userId`);--> statement-breakpoint
CREATE INDEX `coupons_active_window_idx` ON `coupons` (`active`,`startsAt`,`expiresAt`);--> statement-breakpoint
CREATE INDEX `discount_active_window_idx` ON `discounts` (`active`,`startsAt`,`expiresAt`);--> statement-breakpoint
CREATE INDEX `inventory_stock_idx` ON `inventory` (`stockOnHand`,`lowStockThreshold`);--> statement-breakpoint
CREATE INDEX `notifications_user_idx` ON `notifications` (`userId`,`readAt`,`createdAt`);--> statement-breakpoint
CREATE INDEX `order_items_order_idx` ON `orderItems` (`orderId`);--> statement-breakpoint
CREATE INDEX `orders_customer_idx` ON `orders` (`userId`,`placedAt`);--> statement-breakpoint
CREATE INDEX `orders_status_idx` ON `orders` (`status`,`placedAt`);--> statement-breakpoint
CREATE INDEX `orders_payment_idx` ON `orders` (`paymentStatus`);--> statement-breakpoint
CREATE INDEX `payments_order_status_idx` ON `payments` (`orderId`,`status`);--> statement-breakpoint
CREATE INDEX `product_images_order_idx` ON `productImages` (`productId`,`sortOrder`);--> statement-breakpoint
CREATE INDEX `variants_product_availability_idx` ON `productVariants` (`productId`,`availability`);--> statement-breakpoint
CREATE INDEX `products_catalog_idx` ON `products` (`categoryId`,`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `products_discovery_idx` ON `products` (`status`,`featured`,`isNew`,`bestSeller`);--> statement-breakpoint
CREATE INDEX `products_brand_idx` ON `products` (`brandId`);--> statement-breakpoint
CREATE INDEX `profiles_phone_idx` ON `profiles` (`phone`);--> statement-breakpoint
CREATE INDEX `reviews_product_status_idx` ON `reviews` (`productId`,`status`);