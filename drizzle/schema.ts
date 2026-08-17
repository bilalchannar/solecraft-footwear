import {
  bigserial,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "user",
  "staff",
  "admin",
  "super_admin",
]);
export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "active",
  "archived",
]);
export const variantAvailabilityEnum = pgEnum("variant_availability", [
  "available",
  "out_of_stock",
  "discontinued",
]);
export const couponKindEnum = pgEnum("coupon_kind", [
  "percentage",
  "fixed",
  "free_shipping",
]);
export const discountTypeEnum = pgEnum("discount_type", [
  "product",
  "category",
  "storewide",
  "flash_sale",
  "buy_x_get_y",
  "first_order",
]);
export const discountValueTypeEnum = pgEnum("discount_value_type", [
  "percentage",
  "fixed",
]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
  "refunded",
]);
export const paymentMethodEnum = pgEnum("payment_method", ["cod", "online"]);
export const orderPaymentStatusEnum = pgEnum("order_payment_status", [
  "pending",
  "paid",
  "failed",
  "cancelled",
  "refunded",
  "partially_refunded",
]);
export const paymentRecordStatusEnum = pgEnum("payment_record_status", [
  "pending",
  "paid",
  "failed",
  "cancelled",
  "refunded",
  "partially_refunded",
]);
export const reviewStatusEnum = pgEnum("review_status", [
  "pending",
  "approved",
  "rejected",
  "hidden",
]);
export const notificationChannelEnum = pgEnum("notification_channel", [
  "in_app",
  "email",
  "whatsapp",
]);
export const checkoutStatusEnum = pgEnum("checkout_status", [
  "started",
  "completed",
  "failed",
]);
export const inventoryAdjustmentKindEnum = pgEnum("inventory_adj_kind", [
  "receive",
  "sale",
  "return",
  "manual",
  "correction",
]);
export const shipmentStatusEnum = pgEnum("shipment_status", [
  "pending",
  "label_created",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "returned",
  "failed",
]);
export const returnStatusEnum = pgEnum("return_status", [
  "requested",
  "approved",
  "rejected",
  "received",
  "cancelled",
]);
export const returnRefundStatusEnum = pgEnum("return_refund_status", [
  "not_requested",
  "pending",
  "partial",
  "refunded",
  "failed",
]);
export const subscriberStatusEnum = pgEnum("subscriber_status", [
  "subscribed",
  "unsubscribed",
  "bounced",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
  lastSignedIn: timestamp("lastSignedIn", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
});

export const profiles = pgTable(
  "profiles",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    fullName: varchar("fullName", { length: 160 }),
    phone: varchar("phone", { length: 24 }),
    avatarUrl: text("avatarUrl"),
    marketingOptIn: integer("marketingOptIn").default(0).notNull(),
    disabledAt: timestamp("disabledAt", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  table => [index("profiles_phone_idx").on(table.phone)]
);

export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  label: varchar("label", { length: 96 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
});

export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 96 }).notNull().unique(),
  description: text("description"),
});

export const userRoles = pgTable(
  "userRoles",
  {
    userId: integer("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: integer("roleId")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    grantedAt: timestamp("grantedAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  table => [primaryKey({ columns: [table.userId, table.roleId] })]
);

export const rolePermissions = pgTable(
  "rolePermissions",
  {
    roleId: integer("roleId")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: integer("permissionId")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
  },
  table => [primaryKey({ columns: [table.roleId, table.permissionId] })]
);

export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  publicId: varchar("publicId", { length: 36 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull().unique(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  description: text("description"),
  logoUrl: text("logoUrl"),
  active: integer("active").default(1).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
});

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    publicId: varchar("publicId", { length: 36 }).notNull().unique(),
    parentId: integer("parentId"),
    name: varchar("name", { length: 128 }).notNull(),
    slug: varchar("slug", { length: 160 }).notNull().unique(),
    description: text("description"),
    imageUrl: text("imageUrl"),
    sortOrder: integer("sortOrder").default(0).notNull(),
    active: integer("active").default(1).notNull(),
    seoTitle: varchar("seoTitle", { length: 160 }),
    seoDescription: varchar("seoDescription", { length: 320 }),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  table => [
    index("categories_parent_active_idx").on(table.parentId, table.active),
  ]
);

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    publicId: varchar("publicId", { length: 36 }).notNull().unique(),
    categoryId: integer("categoryId").references(() => categories.id, {
      onDelete: "set null",
    }),
    brandId: integer("brandId").references(() => brands.id, {
      onDelete: "set null",
    }),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    sku: varchar("sku", { length: 96 }).notNull().unique(),
    description: text("description"),
    shortDescription: varchar("shortDescription", { length: 400 }),
    material: varchar("material", { length: 128 }),
    specifications: jsonb("specifications"),
    weightGrams: integer("weightGrams"),
    basePrice: numeric("basePrice", { precision: 12, scale: 2 }).notNull(),
    salePrice: numeric("salePrice", { precision: 12, scale: 2 }),
    status: productStatusEnum("status").default("draft").notNull(),
    featured: integer("featured").default(0).notNull(),
    isNew: integer("isNew").default(0).notNull(),
    bestSeller: integer("bestSeller").default(0).notNull(),
    seoTitle: varchar("seoTitle", { length: 160 }),
    seoDescription: varchar("seoDescription", { length: 320 }),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  table => [
    index("products_catalog_idx").on(
      table.categoryId,
      table.status,
      table.createdAt
    ),
    index("products_discovery_idx").on(
      table.status,
      table.featured,
      table.isNew,
      table.bestSeller
    ),
    index("products_brand_idx").on(table.brandId),
  ]
);

export const productVariants = pgTable(
  "productVariants",
  {
    id: serial("id").primaryKey(),
    publicId: varchar("publicId", { length: 36 }).notNull().unique(),
    productId: integer("productId")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    sku: varchar("sku", { length: 96 }).notNull().unique(),
    size: varchar("size", { length: 32 }).notNull(),
    color: varchar("color", { length: 64 }).notNull(),
    colorHex: varchar("colorHex", { length: 16 }),
    priceOverride: numeric("priceOverride", { precision: 12, scale: 2 }),
    salePriceOverride: numeric("salePriceOverride", {
      precision: 12,
      scale: 2,
    }),
    imageUrl: text("imageUrl"),
    availability: variantAvailabilityEnum("availability")
      .default("available")
      .notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  table => [
    uniqueIndex("variants_product_size_color_uq").on(
      table.productId,
      table.size,
      table.color
    ),
    index("variants_product_availability_idx").on(
      table.productId,
      table.availability
    ),
  ]
);

export const inventory = pgTable(
  "inventory",
  {
    id: serial("id").primaryKey(),
    variantId: integer("variantId")
      .notNull()
      .unique()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    stockOnHand: integer("stockOnHand").default(0).notNull(),
    reservedStock: integer("reservedStock").default(0).notNull(),
    lowStockThreshold: integer("lowStockThreshold").default(3).notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  table => [
    index("inventory_stock_idx").on(table.stockOnHand, table.lowStockThreshold),
  ]
);

export const productImages = pgTable(
  "productImages",
  {
    id: serial("id").primaryKey(),
    productId: integer("productId")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variantId: integer("variantId").references(() => productVariants.id, {
      onDelete: "set null",
    }),
    storageKey: varchar("storageKey", { length: 512 }),
    url: text("url").notNull(),
    altText: varchar("altText", { length: 255 }),
    sortOrder: integer("sortOrder").default(0).notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  table => [
    index("product_images_order_idx").on(table.productId, table.sortOrder),
  ]
);

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 96 }).notNull().unique(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
});

export const productTags = pgTable(
  "productTags",
  {
    productId: integer("productId")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    tagId: integer("tagId")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  table => [primaryKey({ columns: [table.productId, table.tagId] })]
);

export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  publicId: varchar("publicId", { length: 36 }).notNull().unique(),
  userId: integer("userId")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  couponCode: varchar("couponCode", { length: 64 }),
  updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
});

export const cartItems = pgTable(
  "cartItems",
  {
    id: serial("id").primaryKey(),
    cartId: integer("cartId")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    variantId: integer("variantId")
      .notNull()
      .references(() => productVariants.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  table => [uniqueIndex("cart_variant_uq").on(table.cartId, table.variantId)]
);

export const wishlists = pgTable("wishlists", {
  id: serial("id").primaryKey(),
  userId: integer("userId")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
});

export const wishlistItems = pgTable(
  "wishlistItems",
  {
    wishlistId: integer("wishlistId")
      .notNull()
      .references(() => wishlists.id, { onDelete: "cascade" }),
    productId: integer("productId")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  table => [primaryKey({ columns: [table.wishlistId, table.productId] })]
);

export const addresses = pgTable(
  "addresses",
  {
    id: serial("id").primaryKey(),
    publicId: varchar("publicId", { length: 36 }).notNull().unique(),
    userId: integer("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 64 }).notNull(),
    fullName: varchar("fullName", { length: 160 }).notNull(),
    phone: varchar("phone", { length: 24 }).notNull(),
    email: varchar("email", { length: 320 }),
    province: varchar("province", { length: 96 }).notNull(),
    city: varchar("city", { length: 96 }).notNull(),
    area: varchar("area", { length: 128 }),
    addressLine: text("addressLine").notNull(),
    postalCode: varchar("postalCode", { length: 20 }),
    deliveryInstructions: varchar("deliveryInstructions", { length: 500 }),
    isDefault: integer("isDefault").default(0).notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  table => [index("addresses_owner_idx").on(table.userId, table.isDefault)]
);

export const coupons = pgTable(
  "coupons",
  {
    id: serial("id").primaryKey(),
    code: varchar("code", { length: 64 }).notNull().unique(),
    kind: couponKindEnum("kind").notNull(),
    value: numeric("value", { precision: 12, scale: 2 }).notNull(),
    minimumOrder: numeric("minimumOrder", { precision: 12, scale: 2 }),
    maximumDiscount: numeric("maximumDiscount", { precision: 12, scale: 2 }),
    startsAt: timestamp("startsAt", { withTimezone: true, mode: "date" }),
    expiresAt: timestamp("expiresAt", { withTimezone: true, mode: "date" }),
    usageLimit: integer("usageLimit"),
    usedCount: integer("usedCount").default(0).notNull(),
    perUserLimit: integer("perUserLimit"),
    firstOrderOnly: integer("firstOrderOnly").default(0).notNull(),
    active: integer("active").default(1).notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  table => [
    index("coupons_active_window_idx").on(
      table.active,
      table.startsAt,
      table.expiresAt
    ),
  ]
);

export const couponUsage = pgTable(
  "couponUsage",
  {
    id: serial("id").primaryKey(),
    couponId: integer("couponId")
      .notNull()
      .references(() => coupons.id, { onDelete: "restrict" }),
    userId: integer("userId")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    orderId: integer("orderId"),
    discountAmount: numeric("discountAmount", {
      precision: 12,
      scale: 2,
    }).notNull(),
    usedAt: timestamp("usedAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  table => [index("coupon_usage_customer_idx").on(table.couponId, table.userId)]
);

export const discounts = pgTable(
  "discounts",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 160 }).notNull(),
    type: discountTypeEnum("type").notNull(),
    valueType: discountValueTypeEnum("valueType").notNull(),
    value: numeric("value", { precision: 12, scale: 2 }).notNull(),
    minimumOrder: numeric("minimumOrder", { precision: 12, scale: 2 }),
    startsAt: timestamp("startsAt", { withTimezone: true, mode: "date" }),
    expiresAt: timestamp("expiresAt", { withTimezone: true, mode: "date" }),
    active: integer("active").default(1).notNull(),
    stackable: integer("stackable").default(0).notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  table => [
    index("discount_active_window_idx").on(
      table.active,
      table.startsAt,
      table.expiresAt
    ),
  ]
);

export const discountProducts = pgTable(
  "discountProducts",
  {
    discountId: integer("discountId")
      .notNull()
      .references(() => discounts.id, { onDelete: "cascade" }),
    productId: integer("productId")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
  },
  table => [primaryKey({ columns: [table.discountId, table.productId] })]
);

export const discountCategories = pgTable(
  "discountCategories",
  {
    discountId: integer("discountId")
      .notNull()
      .references(() => discounts.id, { onDelete: "cascade" }),
    categoryId: integer("categoryId")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  table => [primaryKey({ columns: [table.discountId, table.categoryId] })]
);

export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    publicId: varchar("publicId", { length: 36 }).notNull().unique(),
    orderNumber: varchar("orderNumber", { length: 40 }).notNull().unique(),
    userId: integer("userId")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    addressId: integer("addressId").references(() => addresses.id, {
      onDelete: "set null",
    }),
    status: orderStatusEnum("status").default("pending").notNull(),
    paymentMethod: paymentMethodEnum("paymentMethod").notNull(),
    paymentStatus: orderPaymentStatusEnum("paymentStatus")
      .default("pending")
      .notNull(),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
    productDiscount: numeric("productDiscount", { precision: 12, scale: 2 })
      .default("0")
      .notNull(),
    couponCode: varchar("couponCode", { length: 64 }),
    couponDiscount: numeric("couponDiscount", { precision: 12, scale: 2 })
      .default("0")
      .notNull(),
    shippingAmount: numeric("shippingAmount", { precision: 12, scale: 2 })
      .default("0")
      .notNull(),
    totalAmount: numeric("totalAmount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("PKR").notNull(),
    shippingSnapshot: jsonb("shippingSnapshot").notNull(),
    trackingNumber: varchar("trackingNumber", { length: 128 }),
    customerNote: varchar("customerNote", { length: 500 }),
    placedAt: timestamp("placedAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  table => [
    index("orders_customer_idx").on(table.userId, table.placedAt),
    index("orders_status_idx").on(table.status, table.placedAt),
    index("orders_payment_idx").on(table.paymentStatus),
  ]
);

export const orderItems = pgTable(
  "orderItems",
  {
    id: serial("id").primaryKey(),
    orderId: integer("orderId")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: integer("productId").references(() => products.id, {
      onDelete: "set null",
    }),
    variantId: integer("variantId").references(() => productVariants.id, {
      onDelete: "set null",
    }),
    productName: varchar("productName", { length: 255 }).notNull(),
    productSlug: varchar("productSlug", { length: 255 }).notNull(),
    variantSku: varchar("variantSku", { length: 96 }).notNull(),
    size: varchar("size", { length: 32 }).notNull(),
    color: varchar("color", { length: 64 }).notNull(),
    imageUrl: text("imageUrl"),
    unitPrice: numeric("unitPrice", { precision: 12, scale: 2 }).notNull(),
    discountAmount: numeric("discountAmount", { precision: 12, scale: 2 })
      .default("0")
      .notNull(),
    quantity: integer("quantity").notNull(),
    lineTotal: numeric("lineTotal", { precision: 12, scale: 2 }).notNull(),
  },
  table => [index("order_items_order_idx").on(table.orderId)]
);

export const payments = pgTable(
  "payments",
  {
    id: serial("id").primaryKey(),
    publicId: varchar("publicId", { length: 36 }).notNull().unique(),
    orderId: integer("orderId")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 96 }).notNull(),
    providerReference: varchar("providerReference", { length: 160 }),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("PKR").notNull(),
    status: paymentRecordStatusEnum("status").default("pending").notNull(),
    providerPayload: jsonb("providerPayload"),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  table => [index("payments_order_status_idx").on(table.orderId, table.status)]
);

export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    productId: integer("productId")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userId: integer("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    orderItemId: integer("orderItemId").references(() => orderItems.id, {
      onDelete: "set null",
    }),
    rating: integer("rating").notNull(),
    body: text("body").notNull(),
    status: reviewStatusEnum("status").default("pending").notNull(),
    verifiedPurchase: integer("verifiedPurchase").default(0).notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  table => [
    index("reviews_product_status_idx").on(table.productId, table.status),
  ]
);

export const reviewImages = pgTable("reviewImages", {
  id: serial("id").primaryKey(),
  reviewId: integer("reviewId")
    .notNull()
    .references(() => reviews.id, { onDelete: "cascade" }),
  storageKey: varchar("storageKey", { length: 512 }),
  url: text("url").notNull(),
});

export const banners = pgTable(
  "banners",
  {
    id: serial("id").primaryKey(),
    publicId: varchar("publicId", { length: 36 }).notNull().unique(),
    placement: varchar("placement", { length: 64 }).notNull(),
    title: varchar("title", { length: 160 }),
    subtitle: varchar("subtitle", { length: 320 }),
    imageUrl: text("imageUrl").notNull(),
    mobileImageUrl: text("mobileImageUrl"),
    href: varchar("href", { length: 512 }),
    sortOrder: integer("sortOrder").default(0).notNull(),
    active: integer("active").default(1).notNull(),
    startsAt: timestamp("startsAt", { withTimezone: true, mode: "date" }),
    endsAt: timestamp("endsAt", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  table => [
    index("banners_placement_idx").on(
      table.placement,
      table.active,
      table.sortOrder
    ),
  ]
);

export const homepageSections = pgTable("homepageSections", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 96 }).notNull().unique(),
  heading: varchar("heading", { length: 160 }),
  subheading: varchar("subheading", { length: 320 }),
  content: jsonb("content"),
  active: integer("active").default(1).notNull(),
  sortOrder: integer("sortOrder").default(0).notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
});

export const siteSettings = pgTable("siteSettings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 96 }).notNull().unique(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
});

export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    channel: notificationChannelEnum("channel").default("in_app").notNull(),
    type: varchar("type", { length: 96 }).notNull(),
    title: varchar("title", { length: 160 }).notNull(),
    body: text("body").notNull(),
    readAt: timestamp("readAt", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  table => [
    index("notifications_user_idx").on(
      table.userId,
      table.readAt,
      table.createdAt
    ),
  ]
);

export const analyticsEvents = pgTable(
  "analyticsEvents",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: integer("userId").references(() => users.id, {
      onDelete: "set null",
    }),
    eventType: varchar("eventType", { length: 96 }).notNull(),
    entityType: varchar("entityType", { length: 64 }),
    entityId: varchar("entityId", { length: 96 }),
    payload: jsonb("payload"),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  table => [
    index("analytics_event_time_idx").on(table.eventType, table.createdAt),
  ]
);

export const checkoutRequests = pgTable(
  "checkoutRequests",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    idempotencyKey: varchar("idempotencyKey", { length: 128 })
      .notNull()
      .unique(),
    requestHash: varchar("requestHash", { length: 128 }).notNull(),
    orderId: integer("orderId").references(() => orders.id, {
      onDelete: "set null",
    }),
    status: checkoutStatusEnum("status").default("started").notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  table => [
    index("checkout_requests_user_idx").on(table.userId, table.createdAt),
  ]
);

export const inventoryAdjustments = pgTable(
  "inventoryAdjustments",
  {
    id: serial("id").primaryKey(),
    variantId: integer("variantId")
      .notNull()
      .references(() => productVariants.id, { onDelete: "restrict" }),
    actorUserId: integer("actorUserId").references(() => users.id, {
      onDelete: "set null",
    }),
    orderId: integer("orderId").references(() => orders.id, {
      onDelete: "set null",
    }),
    kind: inventoryAdjustmentKindEnum("kind").notNull(),
    delta: integer("delta").notNull(),
    beforeQuantity: integer("beforeQuantity").notNull(),
    afterQuantity: integer("afterQuantity").notNull(),
    reason: varchar("reason", { length: 500 }).notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  table => [
    index("inventory_adjustments_variant_idx").on(
      table.variantId,
      table.createdAt
    ),
  ]
);

export const orderStatusHistory = pgTable(
  "orderStatusHistory",
  {
    id: serial("id").primaryKey(),
    orderId: integer("orderId")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    actorUserId: integer("actorUserId").references(() => users.id, {
      onDelete: "set null",
    }),
    fromStatus: varchar("fromStatus", { length: 40 }),
    toStatus: varchar("toStatus", { length: 40 }).notNull(),
    note: varchar("note", { length: 500 }),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  table => [
    index("order_status_history_order_idx").on(table.orderId, table.createdAt),
  ]
);

export const shipments = pgTable("shipments", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId")
    .notNull()
    .unique()
    .references(() => orders.id, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 96 }).notNull(),
  trackingNumber: varchar("trackingNumber", { length: 160 }),
  status: shipmentStatusEnum("status").default("pending").notNull(),
  estimatedDeliveryAt: timestamp("estimatedDeliveryAt", {
    withTimezone: true,
    mode: "date",
  }),
  deliveredAt: timestamp("deliveredAt", { withTimezone: true, mode: "date" }),
  createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
});

export const returns = pgTable(
  "returns",
  {
    id: serial("id").primaryKey(),
    publicId: varchar("publicId", { length: 36 }).notNull().unique(),
    orderId: integer("orderId")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    userId: integer("userId")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    reason: varchar("reason", { length: 500 }).notNull(),
    status: returnStatusEnum("status").default("requested").notNull(),
    refundStatus: returnRefundStatusEnum("refundStatus")
      .default("not_requested")
      .notNull(),
    refundAmount: numeric("refundAmount", { precision: 12, scale: 2 }),
    restock: integer("restock").default(1).notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  table => [
    index("returns_order_customer_idx").on(
      table.orderId,
      table.userId,
      table.createdAt
    ),
  ]
);

export const returnItems = pgTable("returnItems", {
  id: serial("id").primaryKey(),
  returnId: integer("returnId")
    .notNull()
    .references(() => returns.id, { onDelete: "cascade" }),
  orderItemId: integer("orderItemId")
    .notNull()
    .references(() => orderItems.id, { onDelete: "restrict" }),
  quantity: integer("quantity").notNull(),
});

export const auditLogs = pgTable(
  "auditLogs",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    actorUserId: integer("actorUserId").references(() => users.id, {
      onDelete: "set null",
    }),
    action: varchar("action", { length: 128 }).notNull(),
    entityType: varchar("entityType", { length: 64 }).notNull(),
    entityId: varchar("entityId", { length: 96 }),
    beforeData: jsonb("beforeData"),
    afterData: jsonb("afterData"),
    ipAddress: varchar("ipAddress", { length: 64 }),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  table => [
    index("audit_logs_entity_idx").on(
      table.entityType,
      table.entityId,
      table.createdAt
    ),
    index("audit_logs_actor_idx").on(table.actorUserId, table.createdAt),
  ]
);

export const newsletterSubscribers = pgTable("newsletterSubscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  userId: integer("userId").references(() => users.id, {
    onDelete: "set null",
  }),
  status: subscriberStatusEnum("status").default("subscribed").notNull(),
  source: varchar("source", { length: 64 }).default("storefront").notNull(),
  unsubscribeToken: varchar("unsubscribeToken", { length: 96 })
    .notNull()
    .unique(),
  subscribedAt: timestamp("subscribedAt", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
  unsubscribedAt: timestamp("unsubscribedAt", {
    withTimezone: true,
    mode: "date",
  }),
  updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Product = typeof products.$inferSelect;
export type ProductVariant = typeof productVariants.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type CheckoutRequest = typeof checkoutRequests.$inferSelect;
export type InventoryAdjustment = typeof inventoryAdjustments.$inferSelect;
export type ReturnRequest = typeof returns.$inferSelect;
