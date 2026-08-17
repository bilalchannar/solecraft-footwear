import { createHash } from "node:crypto";
import {
  and,
  asc,
  desc,
  eq,
  gte,
  inArray,
  like,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  addresses,
  analyticsEvents,
  auditLogs,
  banners,
  brands,
  cartItems,
  carts,
  categories,
  checkoutRequests,
  couponUsage,
  coupons,
  discounts,
  homepageSections,
  inventory,
  inventoryAdjustments,
  newsletterSubscribers,
  orderStatusHistory,
  orderItems,
  orders,
  payments,
  productImages,
  productVariants,
  products,
  profiles,
  reviews,
  returns,
  returnItems,
  siteSettings,
  users,
  wishlistItems,
  wishlists,
  type InsertUser,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import {
  MOCK_BANNERS,
  MOCK_CATEGORIES,
  MOCK_PRODUCTS,
} from "./mockData";
import { getProviderStatus } from "./services/providerStatus";

let _client: ReturnType<typeof postgres> | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _client = postgres(process.env.DATABASE_URL, { prepare: false });
      _db = drizzle(_client);
    } catch (error) {
      console.warn(
        "[Database] Failed to connect to Supabase PostgreSQL:",
        error
      );
      _db = null;
    }
  }
  return _db;
}

async function requireDb() {
  const db = await getDb();
  if (!db)
    throw new Error(
      "The commerce database is not available. Please verify your Supabase connection in .env."
    );
  return db;
}

const uid = () => crypto.randomUUID();
const money = (value: unknown) => Number(value ?? 0);

export type CheckoutStockLine = {
  productName: string;
  available: number;
  quantity: number;
};

export function assertCheckoutStock(lines: CheckoutStockLine[]) {
  if (lines.length === 0) throw new Error("Your cart is empty.");
  for (const line of lines) {
    if (line.available < line.quantity)
      throw new Error(
        `${line.productName} no longer has the selected quantity available.`
      );
  }
}

import { hashPassword, verifyPassword } from "./_core/password";

const MEMORY_USERS: Map<string, typeof users.$inferSelect & { passwordHash?: string }> = new Map();
const MEMORY_PROFILES: Map<number, typeof profiles.$inferSelect> = new Map();
let mockUserIdSeq = 100;

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert.");
  try {
    const db = await getDb();
    if (db) {
      const isOwner = user.openId === ENV.ownerOpenId;
      await db
        .insert(users)
        .values({
          openId: user.openId,
          name: user.name ?? null,
          email: user.email ?? null,
          loginMethod: user.loginMethod ?? null,
          role: isOwner ? "super_admin" : (user.role ?? "user"),
          lastSignedIn: new Date(),
        })
        .onConflictDoUpdate({
          target: users.openId,
          set: {
            name: user.name ?? null,
            email: user.email ?? null,
            loginMethod: user.loginMethod ?? null,
            role: isOwner
              ? "super_admin"
              : sql`COALESCE(${users.role}, ${user.role ?? "user"})`,
            lastSignedIn: new Date(),
          },
        });
      return;
    }
  } catch (error) {
    console.warn("[upsertUser] DB offline, storing user in memory:", error);
  }

  const existing = MEMORY_USERS.get(user.openId);
  const memUser: typeof users.$inferSelect = {
    id: existing?.id ?? ++mockUserIdSeq,
    openId: user.openId,
    name: user.name ?? null,
    email: user.email ?? null,
    loginMethod: user.loginMethod ?? null,
    role: user.role ?? "user",
    createdAt: existing?.createdAt ?? new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  MEMORY_USERS.set(user.openId, memUser);
}

export async function getUserByOpenId(openId: string) {
  try {
    const db = await getDb();
    if (db) {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.openId, openId))
        .limit(1);
      if (result && result.length > 0) return result[0];
    }
  } catch (error) {
    console.warn("[getUserByOpenId] DB error, checking memory:", error);
  }
  return MEMORY_USERS.get(openId);
}

export async function getUserByEmail(email: string) {
  const normalized = email.toLowerCase().trim();
  try {
    const db = await getDb();
    if (db) {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, normalized))
        .limit(1);
      if (result && result.length > 0) return result[0];
    }
  } catch (error) {
    console.warn("[getUserByEmail] DB error, checking memory:", error);
  }
  return Array.from(MEMORY_USERS.values()).find(
    u => u.email?.toLowerCase().trim() === normalized
  );
}

export async function registerUserAccount(data: {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}) {
  const normalizedEmail = data.email.toLowerCase().trim();
  const existing = await getUserByEmail(normalizedEmail);
  if (existing) {
    throw new Error("An account with this email already exists. Please log in.");
  }

  const passHash = hashPassword(data.password);
  const userOpenId = `usr_${uid().replace(/-/g, "")}`;
  const isOwner = normalizedEmail === "admin@solecraft.pk" || userOpenId === ENV.ownerOpenId;

  try {
    const db = await getDb();
    if (db) {
      const [insertedUser] = await db
        .insert(users)
        .values({
          openId: userOpenId,
          name: data.fullName.trim(),
          email: normalizedEmail,
          loginMethod: passHash,
          role: isOwner ? "super_admin" : "user",
          lastSignedIn: new Date(),
        })
        .returning();

      if (insertedUser) {
        // Create profile
        await db.insert(profiles).values({
          userId: insertedUser.id,
          fullName: data.fullName.trim(),
          phone: data.phone?.trim() ?? null,
          marketingOptIn: 1,
        }).onConflictDoNothing();

        // Initialize cart
        await db.insert(carts).values({
          publicId: uid(),
          userId: insertedUser.id,
        }).onConflictDoNothing();

        return insertedUser;
      }
    }
  } catch (error) {
    console.warn("[registerUserAccount] DB offline, saving user to memory store:", error);
  }

  // Memory store fallback
  const mockId = ++mockUserIdSeq;
  const memUser: typeof users.$inferSelect & { passwordHash?: string } = {
    id: mockId,
    openId: userOpenId,
    name: data.fullName.trim(),
    email: normalizedEmail,
    loginMethod: passHash,
    role: isOwner ? "super_admin" : "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    passwordHash: passHash,
  };
  MEMORY_USERS.set(userOpenId, memUser);

  const memProfile: typeof profiles.$inferSelect = {
    id: mockId,
    userId: mockId,
    fullName: data.fullName.trim(),
    phone: data.phone?.trim() ?? null,
    avatarUrl: null,
    marketingOptIn: 1,
    disabledAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  MEMORY_PROFILES.set(mockId, memProfile);

  return memUser;
}

export async function loginUserWithPassword(credentials: {
  email: string;
  password: string;
}) {
  const normalizedEmail = credentials.email.toLowerCase().trim();
  const user = await getUserByEmail(normalizedEmail);
  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const storedHash = user.loginMethod;
  if (!storedHash || !verifyPassword(credentials.password, storedHash)) {
    throw new Error("Invalid email or password.");
  }

  // Update last signed in
  try {
    const db = await getDb();
    if (db) {
      await db
        .update(users)
        .set({ lastSignedIn: new Date() })
        .where(eq(users.id, user.id));
    }
  } catch (err) {
    // Ignore error
  }

  return user;
}

export async function listCategories() {
  try {
    const db = await getDb();
    if (db) {
      const rows = await db
        .select()
        .from(categories)
        .where(eq(categories.active, 1))
        .orderBy(asc(categories.sortOrder), asc(categories.name));
      if (rows && rows.length > 0) return rows;
    }
  } catch (error) {
    console.warn("[listCategories] DB unavailable, serving mock categories:", error);
  }
  return MOCK_CATEGORIES;
}

export type CatalogFilters = {
  query?: string;
  categorySlug?: string;
  brand?: string;
  material?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  isNew?: boolean;
  bestSeller?: boolean;
  limit?: number;
  sort?:
    | "newest"
    | "price_asc"
    | "price_desc"
    | "best_selling"
    | "discount"
    | "relevance";
};

export async function listCatalogProducts(filters: CatalogFilters = {}) {
  try {
    const db = await getDb();
    if (db) {
      const conditions = [eq(products.status, "active")];
      if (filters.categorySlug)
        conditions.push(eq(categories.slug, filters.categorySlug));
      if (filters.brand) conditions.push(eq(brands.slug, filters.brand));
      if (filters.material)
        conditions.push(eq(products.material, filters.material));
      if (filters.featured !== undefined)
        conditions.push(eq(products.featured, filters.featured ? 1 : 0));
      if (filters.isNew !== undefined)
        conditions.push(eq(products.isNew, filters.isNew ? 1 : 0));
      if (filters.bestSeller !== undefined)
        conditions.push(eq(products.bestSeller, filters.bestSeller ? 1 : 0));
      if (filters.query) {
        const pattern = `%${filters.query.trim()}%`;
        conditions.push(
          or(
            like(products.name, pattern),
            like(products.sku, pattern),
            like(brands.name, pattern)
          )!
        );
      }
      if (filters.minPrice !== undefined)
        conditions.push(gte(products.basePrice, String(filters.minPrice)));
      if (filters.maxPrice !== undefined)
        conditions.push(lte(products.basePrice, String(filters.maxPrice)));

      const orderBy =
        filters.sort === "price_asc"
          ? asc(products.basePrice)
          : filters.sort === "price_desc"
            ? desc(products.basePrice)
            : filters.sort === "best_selling"
              ? desc(products.bestSeller)
              : filters.sort === "discount"
                ? desc(
                    sql`COALESCE(${products.basePrice} - ${products.salePrice}, 0)`
                  )
                : desc(products.createdAt);

      const limitCount = filters.limit ?? 48;

      const rows = await db
        .select({
          id: products.id,
          publicId: products.publicId,
          name: products.name,
          slug: products.slug,
          shortDescription: products.shortDescription,
          material: products.material,
          basePrice: products.basePrice,
          salePrice: products.salePrice,
          featured: products.featured,
          isNew: products.isNew,
          bestSeller: products.bestSeller,
          categoryName: categories.name,
          categorySlug: categories.slug,
          brandName: brands.name,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(brands, eq(products.brandId, brands.id))
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(limitCount);

      if (rows && rows.length > 0) {
        const images = await db
          .select()
          .from(productImages)
          .where(
            inArray(
              productImages.productId,
              rows.map(row => row.id)
            )
          )
          .orderBy(asc(productImages.sortOrder));
        return rows.map(row => ({
          ...row,
          image: images.find(image => image.productId === row.id)?.url ?? null,
        }));
      }
    }
  } catch (error) {
    console.warn("[listCatalogProducts] DB unavailable, serving mock products:", error);
  }

  // Fallback to rich mock catalog
  let filtered = [...MOCK_PRODUCTS];
  if (filters.categorySlug) {
    const targetSlug = filters.categorySlug.toLowerCase().trim();
    filtered = filtered.filter(p => {
      const pCat = p.categorySlug.toLowerCase();
      if (pCat === targetSlug) return true;
      if (targetSlug === "peshawari" && pCat.includes("peshawari")) return true;
      if (targetSlug === "khussa" && pCat.includes("khussa")) return true;
      if ((targetSlug === "norozi" || targetSlug === "kaptaan" || targetSlug === "kaptaan-norozi") && (pCat.includes("norozi") || pCat.includes("kaptaan"))) return true;
      if ((targetSlug === "loafers" || targetSlug === "oxford" || targetSlug === "modern-loafers" || targetSlug === "formal") && (pCat.includes("loafers") || pCat.includes("modern"))) return true;
      if ((targetSlug === "sandals" || targetSlug === "kolhapuri" || targetSlug === "sandals-kolhapuri") && (pCat.includes("sandal") || pCat.includes("kolhapuri") || pCat.includes("mule"))) return true;
      return false;
    });
  }
  if (filters.material) {
    const mat = filters.material.toLowerCase().trim();
    filtered = filtered.filter(p => p.material.toLowerCase().includes(mat));
  }
  if (filters.minPrice !== undefined) {
    filtered = filtered.filter(p => Number(p.salePrice ?? p.basePrice) >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter(p => Number(p.salePrice ?? p.basePrice) <= filters.maxPrice!);
  }
  if (filters.featured !== undefined) {
    filtered = filtered.filter(p => (filters.featured ? p.featured === 1 : true));
  }
  if (filters.isNew !== undefined) {
    filtered = filtered.filter(p => (filters.isNew ? p.isNew === 1 : true));
  }
  if (filters.bestSeller !== undefined) {
    filtered = filtered.filter(p => (filters.bestSeller ? p.bestSeller === 1 : true));
  }
  if (filters.query) {
    const q = filters.query.toLowerCase().trim();
    filtered = filtered.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q)
    );
  }
  if (filters.sort === "price_asc") {
    filtered.sort((a, b) => Number(a.salePrice ?? a.basePrice) - Number(b.salePrice ?? b.basePrice));
  } else if (filters.sort === "price_desc") {
    filtered.sort((a, b) => Number(b.salePrice ?? b.basePrice) - Number(a.salePrice ?? a.basePrice));
  } else if (filters.sort === "best_selling") {
    filtered.sort((a, b) => b.bestSeller - a.bestSeller);
  } else if (filters.sort === "newest") {
    filtered.sort((a, b) => b.isNew - a.isNew);
  }
  if (filters.limit) {
    filtered = filtered.slice(0, filters.limit);
  }
  return filtered.map(p => ({
    id: p.id,
    publicId: p.publicId,
    name: p.name,
    slug: p.slug,
    shortDescription: p.shortDescription,
    material: p.material,
    basePrice: p.basePrice,
    salePrice: p.salePrice,
    featured: p.featured,
    isNew: p.isNew,
    bestSeller: p.bestSeller,
    categoryName: p.categoryName,
    categorySlug: p.categorySlug,
    brandName: p.brandName,
    image: p.image,
  }));
}

export async function getProductBySlug(slug: string) {
  try {
    const db = await getDb();
    if (db) {
      const records = await db
        .select({ product: products, category: categories, brand: brands })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(brands, eq(products.brandId, brands.id))
        .where(and(eq(products.slug, slug), eq(products.status, "active")))
        .limit(1);
      const record = records[0];
      if (record) {
        const variants = await db
          .select({
            variant: productVariants,
            stock: inventory.stockOnHand,
            reserved: inventory.reservedStock,
          })
          .from(productVariants)
          .leftJoin(inventory, eq(productVariants.id, inventory.variantId))
          .where(eq(productVariants.productId, record.product.id));
        const images = await db
          .select()
          .from(productImages)
          .where(eq(productImages.productId, record.product.id))
          .orderBy(asc(productImages.sortOrder));
        const approvedReviews = await db
          .select({ review: reviews, reviewer: profiles.fullName })
          .from(reviews)
          .leftJoin(profiles, eq(reviews.userId, profiles.userId))
          .where(
            and(
              eq(reviews.productId, record.product.id),
              eq(reviews.status, "approved")
            )
          )
          .orderBy(desc(reviews.createdAt));
        return { ...record, variants, images, reviews: approvedReviews };
      }
    }
  } catch (error) {
    console.warn("[getProductBySlug] DB unavailable, serving mock product:", error);
  }

  const mock = MOCK_PRODUCTS.find(p => p.slug === slug);
  if (!mock) return null;
  return {
    product: {
      id: mock.id,
      publicId: mock.publicId,
      name: mock.name,
      slug: mock.slug,
      description: mock.description,
      shortDescription: mock.shortDescription,
      material: mock.material,
      basePrice: mock.basePrice,
      salePrice: mock.salePrice,
      featured: mock.featured,
      isNew: mock.isNew,
      bestSeller: mock.bestSeller,
      status: mock.status,
    },
    category: {
      id: 1,
      name: mock.categoryName,
      slug: mock.categorySlug,
    },
    brand: {
      id: 1,
      name: mock.brandName,
      slug: "solecraft",
    },
    variants: mock.variants,
    images: mock.images,
    reviews: mock.reviews,
  };
}

export async function getHomepageContent() {
  try {
    const db = await getDb();
    if (db) {
      const now = new Date();
      const [
        content,
        heroBanners,
        featured,
        newArrivals,
        bestSellers,
        categoryList,
      ] = await Promise.all([
        db
          .select()
          .from(homepageSections)
          .where(eq(homepageSections.active, 1))
          .orderBy(asc(homepageSections.sortOrder)),
        db
          .select()
          .from(banners)
          .where(
            and(
              eq(banners.placement, "hero"),
              eq(banners.active, 1),
              or(lte(banners.startsAt, now), sql`${banners.startsAt} IS NULL`)!,
              or(gte(banners.endsAt, now), sql`${banners.endsAt} IS NULL`)!
            )
          )
          .orderBy(asc(banners.sortOrder)),
        listCatalogProducts({ featured: true, limit: 8 }),
        listCatalogProducts({ isNew: true, sort: "newest", limit: 8 }),
        listCatalogProducts({ bestSeller: true, sort: "best_selling", limit: 8 }),
        listCategories(),
      ]);

      if (featured && featured.length > 0) {
        return {
          sections: content,
          heroBanners: heroBanners.length > 0 ? heroBanners : MOCK_BANNERS,
          featured,
          newArrivals,
          bestSellers,
          categories: categoryList.filter((category: any) => !category.parentId).slice(0, 8),
        };
      }
    }
  } catch (error) {
    console.warn("[getHomepageContent] DB unavailable, serving complete mock content:", error);
  }

  return {
    sections: [
      {
        id: 1,
        key: "hero",
        heading: "Steps crafted for your everyday journey.",
        subheading: "Grounded in authentic Pakistani craft, refined for every direction you take.",
        active: 1,
        sortOrder: 1,
      },
    ],
    heroBanners: MOCK_BANNERS,
    featured: await listCatalogProducts({ featured: true, limit: 8 }),
    newArrivals: await listCatalogProducts({ isNew: true, sort: "newest", limit: 8 }),
    bestSellers: await listCatalogProducts({ bestSeller: true, sort: "best_selling", limit: 8 }),
    categories: MOCK_CATEGORIES,
  };
}

export async function getCartForUser(userId: number) {
  try {
    const db = await getDb();
    if (!db) return { cart: null, items: [], subtotal: 0, savings: 0 };
    const cart = (
      await db.select().from(carts).where(eq(carts.userId, userId)).limit(1)
    )[0];
    if (!cart) return { cart: null, items: [], subtotal: 0, savings: 0 };
  const rows = await db
    .select({
      item: cartItems,
      variant: productVariants,
      product: products,
      stockOnHand: inventory.stockOnHand,
    })
    .from(cartItems)
    .innerJoin(productVariants, eq(cartItems.variantId, productVariants.id))
    .innerJoin(products, eq(productVariants.productId, products.id))
    .leftJoin(inventory, eq(productVariants.id, inventory.variantId))
    .where(eq(cartItems.cartId, cart.id));
  const imageRows = rows.length
    ? await db
        .select()
        .from(productImages)
        .where(
          inArray(
            productImages.productId,
            rows.map(row => row.product.id)
          )
        )
        .orderBy(asc(productImages.sortOrder))
    : [];
  const items = rows.map(row => {
    const regularPrice = money(
      row.variant.priceOverride ?? row.product.basePrice
    );
    const finalPrice = money(
      row.variant.salePriceOverride ??
        row.product.salePrice ??
        row.variant.priceOverride ??
        row.product.basePrice
    );
    return {
      ...row,
      image:
        row.variant.imageUrl ??
        imageRows.find(image => image.productId === row.product.id)?.url ??
        null,
      regularPrice,
      finalPrice,
      available: Math.max(0, row.stockOnHand ?? 0),
    };
  });
    return {
      cart,
      items,
      subtotal: items.reduce(
        (sum, item) => sum + item.finalPrice * item.item.quantity,
        0
      ),
      savings: items.reduce(
        (sum, item) =>
          sum +
          Math.max(0, item.regularPrice - item.finalPrice) * item.item.quantity,
        0
      ),
    };
  } catch (error) {
    console.warn("[getCartForUser] DB error:", error);
    return { cart: null, items: [], subtotal: 0, savings: 0 };
  }
}

export async function addCartItem(
  userId: number,
  variantId: number,
  quantity: number
) {
  const db = await requireDb();
  const variantStock = (
    await db
      .select({
        variant: productVariants,
        stock: inventory.stockOnHand,
        reserved: inventory.reservedStock,
      })
      .from(productVariants)
      .leftJoin(inventory, eq(productVariants.id, inventory.variantId))
      .where(eq(productVariants.id, variantId))
      .limit(1)
  )[0];
  if (!variantStock || variantStock.variant.availability !== "available")
    throw new Error("This variant is unavailable.");
  if ((variantStock.stock ?? 0) - (variantStock.reserved ?? 0) < quantity)
    throw new Error("The requested quantity is not in stock.");
  let cart = (
    await db.select().from(carts).where(eq(carts.userId, userId)).limit(1)
  )[0];
  if (!cart) {
    await db.insert(carts).values({ publicId: uid(), userId });
    cart = (
      await db.select().from(carts).where(eq(carts.userId, userId)).limit(1)
    )[0]!;
  }
  const existing = (
    await db
      .select()
      .from(cartItems)
      .where(
        and(eq(cartItems.cartId, cart.id), eq(cartItems.variantId, variantId))
      )
      .limit(1)
  )[0];
  const nextQuantity = (existing?.quantity ?? 0) + quantity;
  if ((variantStock.stock ?? 0) - (variantStock.reserved ?? 0) < nextQuantity)
    throw new Error("The requested cart quantity is not in stock.");
  if (existing)
    await db
      .update(cartItems)
      .set({ quantity: nextQuantity })
      .where(eq(cartItems.id, existing.id));
  else
    await db.insert(cartItems).values({ cartId: cart.id, variantId, quantity });
  await db
    .update(carts)
    .set({ updatedAt: new Date() })
    .where(eq(carts.id, cart.id));
  return getCartForUser(userId);
}

export async function changeCartItemQuantity(
  userId: number,
  itemId: number,
  quantity: number
) {
  const db = await requireDb();
  const cart = (
    await db.select().from(carts).where(eq(carts.userId, userId)).limit(1)
  )[0];
  if (!cart) throw new Error("Cart not found.");
  const item = (
    await db
      .select({
        item: cartItems,
        stock: inventory.stockOnHand,
        reserved: inventory.reservedStock,
      })
      .from(cartItems)
      .leftJoin(inventory, eq(cartItems.variantId, inventory.variantId))
      .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cart.id)))
      .limit(1)
  )[0];
  if (!item) throw new Error("Cart item not found.");
  if (quantity <= 0)
    await db.delete(cartItems).where(eq(cartItems.id, item.item.id));
  else {
    if ((item.stock ?? 0) - (item.reserved ?? 0) < quantity)
      throw new Error("The requested quantity is not in stock.");
    await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, item.item.id));
  }
  return getCartForUser(userId);
}

export async function toggleWishlistItem(userId: number, productId: number) {
  const db = await requireDb();
  let wishlist = (
    await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.userId, userId))
      .limit(1)
  )[0];
  if (!wishlist) {
    await db.insert(wishlists).values({ userId });
    wishlist = (
      await db
        .select()
        .from(wishlists)
        .where(eq(wishlists.userId, userId))
        .limit(1)
    )[0]!;
  }
  const existing = (
    await db
      .select()
      .from(wishlistItems)
      .where(
        and(
          eq(wishlistItems.wishlistId, wishlist.id),
          eq(wishlistItems.productId, productId)
        )
      )
      .limit(1)
  )[0];
  if (existing)
    await db
      .delete(wishlistItems)
      .where(
        and(
          eq(wishlistItems.wishlistId, wishlist.id),
          eq(wishlistItems.productId, productId)
        )
      );
  else
    await db
      .insert(wishlistItems)
      .values({ wishlistId: wishlist.id, productId });
  return { saved: !existing };
}

export async function getWishlistForUser(userId: number) {
  const db = await requireDb();
  const wishlist = (
    await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.userId, userId))
      .limit(1)
  )[0];
  if (!wishlist) return [];
  const rows = await db
    .select({ product: products, item: wishlistItems })
    .from(wishlistItems)
    .innerJoin(products, eq(wishlistItems.productId, products.id))
    .where(eq(wishlistItems.wishlistId, wishlist.id));
  const images = rows.length
    ? await db
        .select()
        .from(productImages)
        .where(
          inArray(
            productImages.productId,
            rows.map(row => row.product.id)
          )
        )
        .orderBy(asc(productImages.sortOrder))
    : [];
  return rows.map(row => ({
    ...row.product,
    image:
      images.find(image => image.productId === row.product.id)?.url ?? null,
  }));
}

export type AddressInput = {
  label: string;
  fullName: string;
  phone: string;
  email?: string;
  province: string;
  city: string;
  area?: string;
  addressLine: string;
  postalCode?: string;
  deliveryInstructions?: string;
  isDefault?: boolean;
};

export async function listAddresses(userId: number) {
  const db = await requireDb();
  return db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, userId))
    .orderBy(desc(addresses.isDefault), desc(addresses.updatedAt));
}

export async function getCustomerProfile(userId: number) {
  const db = await requireDb();
  const row = (
    await db
      .select({ profile: profiles, user: users })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(users.id, userId))
      .limit(1)
  )[0];
  return row ?? null;
}

export async function saveCustomerProfile(
  userId: number,
  input: { fullName: string; phone?: string; marketingOptIn?: boolean }
) {
  const db = await requireDb();
  await db
    .insert(profiles)
    .values({
      userId,
      fullName: input.fullName,
      phone: input.phone ?? null,
      marketingOptIn: input.marketingOptIn ? 1 : 0,
    })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: {
        fullName: input.fullName,
        phone: input.phone ?? null,
        marketingOptIn: input.marketingOptIn ? 1 : 0,
      },
    });
  return getCustomerProfile(userId);
}

export async function saveAddress(
  userId: number,
  input: AddressInput,
  addressId?: number
) {
  const db = await requireDb();
  if (input.isDefault)
    await db
      .update(addresses)
      .set({ isDefault: 0 })
      .where(eq(addresses.userId, userId));
  if (addressId) {
    await db
      .update(addresses)
      .set({ ...input, isDefault: input.isDefault ? 1 : 0 })
      .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)));
  } else {
    await db
      .insert(addresses)
      .values({
        publicId: uid(),
        userId,
        ...input,
        isDefault: input.isDefault ? 1 : 0,
      });
  }
  return listAddresses(userId);
}

type DiscountCoupon = Pick<
  typeof coupons.$inferSelect,
  "kind" | "value" | "maximumDiscount"
>;

export function calculateCouponDiscount(
  subtotal: number,
  coupon: DiscountCoupon | undefined
) {
  if (!coupon) return 0;
  if (coupon.kind === "free_shipping") return 0;
  const raw =
    coupon.kind === "percentage"
      ? (subtotal * money(coupon.value)) / 100
      : money(coupon.value);
  return Math.min(
    raw,
    coupon.maximumDiscount ? money(coupon.maximumDiscount) : raw
  );
}

async function getShippingAmount(
  db: NonNullable<Awaited<ReturnType<typeof getDb>>>
) {
  const setting = (
    await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, "shipping.standard"))
      .limit(1)
  )[0];
  const record = setting?.value as { amount?: number } | undefined;
  return typeof record?.amount === "number" ? record.amount : 250;
}

export async function quoteCheckout(userId: number, couponCode?: string) {
  const db = await requireDb();
  const cartData = await getCartForUser(userId);
  assertCheckoutStock(
    cartData.items.map(item => ({
      productName: item.product.name,
      available: item.available,
      quantity: item.item.quantity,
    }))
  );
  const code = couponCode?.trim().toUpperCase();
  const coupon = code
    ? (
        await db
          .select()
          .from(coupons)
          .where(and(eq(coupons.code, code), eq(coupons.active, 1)))
          .limit(1)
      )[0]
    : undefined;
  if (code && !coupon) throw new Error("This coupon is not valid.");
  const now = new Date();
  if (
    coupon &&
    ((coupon.startsAt && coupon.startsAt > now) ||
      (coupon.expiresAt && coupon.expiresAt < now))
  )
    throw new Error("This coupon is not currently active.");
  if (coupon?.minimumOrder && cartData.subtotal < money(coupon.minimumOrder))
    throw new Error(
      "The cart does not meet this coupon's minimum order value."
    );
  const usage = coupon
    ? await db
        .select()
        .from(couponUsage)
        .where(
          and(
            eq(couponUsage.couponId, coupon.id),
            eq(couponUsage.userId, userId)
          )
        )
    : [];
  if (coupon?.perUserLimit && usage.length >= coupon.perUserLimit)
    throw new Error(
      "You have already used this coupon the permitted number of times."
    );
  if (coupon?.usageLimit && coupon.usedCount >= coupon.usageLimit)
    throw new Error("This coupon has reached its total usage limit.");
  if (coupon?.firstOrderOnly) {
    const priorOrders = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.userId, userId))
      .limit(1);
    if (priorOrders.length > 0)
      throw new Error("This coupon is available for a first order only.");
  }
  const shippingAmount =
    coupon?.kind === "free_shipping" ? 0 : await getShippingAmount(db);
  const couponDiscount = calculateCouponDiscount(cartData.subtotal, coupon);
  return {
    ...cartData,
    coupon,
    couponCode: code,
    shippingAmount,
    couponDiscount,
    total: Math.max(0, cartData.subtotal - couponDiscount + shippingAmount),
  };
}

export async function createOrder(
  userId: number,
  addressId: number,
  paymentMethod: "cod" | "online",
  couponCode?: string,
  customerNote?: string
) {
  const db = await requireDb();
  const quote = await quoteCheckout(userId, couponCode);
  const address = (
    await db
      .select()
      .from(addresses)
      .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)))
      .limit(1)
  )[0];
  if (!address) throw new Error("Choose a valid saved delivery address.");
  const publicId = uid();
  const orderNumber = `SC-${Date.now().toString().slice(-8)}-${Math.floor(100 + Math.random() * 900)}`;
  await db.transaction(async tx => {
    for (const row of quote.items) {
      const latest = (
        await tx
          .select({
            stock: inventory.stockOnHand,
            reserved: inventory.reservedStock,
          })
          .from(inventory)
          .where(eq(inventory.variantId, row.variant.id))
          .limit(1)
      )[0];
      if (!latest || latest.stock - latest.reserved < row.item.quantity)
        throw new Error(
          `${row.product.name} is no longer available in the selected quantity.`
        );
    }
    await tx.insert(orders).values({
      publicId,
      orderNumber,
      userId,
      addressId,
      status: "pending",
      paymentMethod,
      paymentStatus: "pending",
      subtotal: String(quote.subtotal),
      productDiscount: String(quote.savings),
      couponCode: quote.couponCode ?? null,
      couponDiscount: String(quote.couponDiscount),
      shippingAmount: String(quote.shippingAmount),
      totalAmount: String(quote.total),
      shippingSnapshot: {
        fullName: address.fullName,
        phone: address.phone,
        province: address.province,
        city: address.city,
        area: address.area,
        addressLine: address.addressLine,
        postalCode: address.postalCode,
        deliveryInstructions: address.deliveryInstructions,
      },
      customerNote: customerNote ?? null,
    });
    const created = (
      await tx
        .select()
        .from(orders)
        .where(eq(orders.publicId, publicId))
        .limit(1)
    )[0]!;
    for (const row of quote.items) {
      const lineTotal = row.finalPrice * row.item.quantity;
      await tx
        .insert(orderItems)
        .values({
          orderId: created.id,
          productId: row.product.id,
          variantId: row.variant.id,
          productName: row.product.name,
          productSlug: row.product.slug,
          variantSku: row.variant.sku,
          size: row.variant.size,
          color: row.variant.color,
          imageUrl: row.image,
          unitPrice: String(row.finalPrice),
          discountAmount: String(
            Math.max(0, row.regularPrice - row.finalPrice)
          ),
          quantity: row.item.quantity,
          lineTotal: String(lineTotal),
        });
      const before =
        (
          await tx
            .select({ stock: inventory.stockOnHand })
            .from(inventory)
            .where(eq(inventory.variantId, row.variant.id))
            .limit(1)
        )[0]?.stock ?? 0;
      const deduction = await tx
        .update(inventory)
        .set({
          stockOnHand: sql`${inventory.stockOnHand} - ${row.item.quantity}`,
        })
        .where(
          and(
            eq(inventory.variantId, row.variant.id),
            gte(inventory.stockOnHand, row.item.quantity)
          )
        )
        .returning({ id: inventory.id });
      if (deduction.length === 0)
        throw new Error(
          `${row.product.name} sold out while your order was being placed.`
        );
      await tx
        .insert(inventoryAdjustments)
        .values({
          variantId: row.variant.id,
          actorUserId: userId,
          orderId: created.id,
          kind: "sale",
          delta: -row.item.quantity,
          beforeQuantity: before,
          afterQuantity: before - row.item.quantity,
          reason: `Order ${orderNumber}`,
        });
    }
    await tx
      .insert(payments)
      .values({
        publicId: uid(),
        orderId: created.id,
        provider:
          paymentMethod === "cod" ? "cash_on_delivery" : "online_pending",
        amount: String(quote.total),
        status: "pending",
      });
    await tx
      .insert(orderStatusHistory)
      .values({
        orderId: created.id,
        actorUserId: userId,
        fromStatus: null,
        toStatus: "pending",
        note: "Order created",
      });
    if (quote.coupon) {
      const lockedUsage = await tx
        .select()
        .from(couponUsage)
        .where(eq(couponUsage.couponId, quote.coupon.id));
      if (
        quote.coupon.perUserLimit &&
        lockedUsage.filter(row => row.userId === userId).length >=
          quote.coupon.perUserLimit
      )
        throw new Error(
          "This coupon reached your usage limit while checkout was processing."
        );
      const usageUpdate = await tx
        .update(coupons)
        .set({ usedCount: sql`${coupons.usedCount} + 1` })
        .where(
          and(
            eq(coupons.id, quote.coupon.id),
            sql`(${coupons.usageLimit} IS NULL OR ${coupons.usedCount} < ${coupons.usageLimit})`
          )
        )
        .returning({ id: coupons.id });
      if (usageUpdate.length === 0)
        throw new Error(
          "This coupon reached its usage limit while checkout was processing."
        );
      await tx
        .insert(couponUsage)
        .values({
          couponId: quote.coupon.id,
          userId,
          orderId: created.id,
          discountAmount: String(quote.couponDiscount),
        });
    }
    await tx.delete(cartItems).where(eq(cartItems.cartId, quote.cart!.id));
  });
  return { publicId, orderNumber, total: quote.total, paymentMethod };
}

export async function listOrdersForUser(userId: number) {
  const db = await requireDb();
  return db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.placedAt));
}

export async function getOrderForUser(userId: number, publicId: string) {
  const db = await requireDb();
  const order = (
    await db
      .select()
      .from(orders)
      .where(and(eq(orders.userId, userId), eq(orders.publicId, publicId)))
      .limit(1)
  )[0];
  if (!order) return null;
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));
  return { order, items };
}

export type ProductInput = {
  name: string;
  slug: string;
  sku: string;
  categoryId?: number;
  brandId?: number;
  description?: string;
  shortDescription?: string;
  material?: string;
  basePrice: number;
  salePrice?: number;
  status: "draft" | "active" | "archived";
  featured?: boolean;
  isNew?: boolean;
  bestSeller?: boolean;
  variants: Array<{
    sku: string;
    size: string;
    color: string;
    colorHex?: string;
    priceOverride?: number;
    salePriceOverride?: number;
    imageUrl?: string;
    stockOnHand: number;
    lowStockThreshold?: number;
  }>;
};

export async function createProduct(input: ProductInput) {
  const db = await requireDb();
  const publicId = uid();
  await db.transaction(async tx => {
    await tx
      .insert(products)
      .values({
        publicId,
        name: input.name,
        slug: input.slug,
        sku: input.sku,
        categoryId: input.categoryId ?? null,
        brandId: input.brandId ?? null,
        description: input.description ?? null,
        shortDescription: input.shortDescription ?? null,
        material: input.material ?? null,
        basePrice: String(input.basePrice),
        salePrice: input.salePrice ? String(input.salePrice) : null,
        status: input.status,
        featured: input.featured ? 1 : 0,
        isNew: input.isNew ? 1 : 0,
        bestSeller: input.bestSeller ? 1 : 0,
      });
    const product = (
      await tx
        .select()
        .from(products)
        .where(eq(products.publicId, publicId))
        .limit(1)
    )[0]!;
    for (const variant of input.variants) {
      const variantId = uid();
      await tx
        .insert(productVariants)
        .values({
          publicId: variantId,
          productId: product.id,
          sku: variant.sku,
          size: variant.size,
          color: variant.color,
          colorHex: variant.colorHex ?? null,
          priceOverride: variant.priceOverride
            ? String(variant.priceOverride)
            : null,
          salePriceOverride: variant.salePriceOverride
            ? String(variant.salePriceOverride)
            : null,
          imageUrl: variant.imageUrl ?? null,
        });
      const createdVariant = (
        await tx
          .select()
          .from(productVariants)
          .where(eq(productVariants.publicId, variantId))
          .limit(1)
      )[0]!;
      await tx
        .insert(inventory)
        .values({
          variantId: createdVariant.id,
          stockOnHand: variant.stockOnHand,
          lowStockThreshold: variant.lowStockThreshold ?? 3,
        });
    }
  });
  return publicId;
}

export async function updateInventory(
  variantId: number,
  stockOnHand: number,
  lowStockThreshold?: number
) {
  const db = await requireDb();
  await db
    .update(inventory)
    .set({
      stockOnHand,
      ...(lowStockThreshold !== undefined ? { lowStockThreshold } : {}),
    })
    .where(eq(inventory.variantId, variantId));
}

export async function listAdminProducts() {
  const db = await requireDb();
  return db
    .select({
      product: products,
      category: categories.name,
      brand: brands.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(brands, eq(products.brandId, brands.id))
    .orderBy(desc(products.updatedAt));
}

export async function listAdminInventory() {
  const db = await requireDb();
  return db
    .select({
      variant: productVariants,
      productName: products.name,
      productSlug: products.slug,
      stockOnHand: inventory.stockOnHand,
      reservedStock: inventory.reservedStock,
      lowStockThreshold: inventory.lowStockThreshold,
    })
    .from(productVariants)
    .innerJoin(products, eq(productVariants.productId, products.id))
    .innerJoin(inventory, eq(productVariants.id, inventory.variantId))
    .orderBy(asc(products.name), asc(productVariants.size));
}

export async function createCategory(input: {
  name: string;
  slug: string;
  parentId?: number;
  description?: string;
  imageUrl?: string;
  sortOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
}) {
  const db = await requireDb();
  await db
    .insert(categories)
    .values({
      publicId: uid(),
      name: input.name,
      slug: input.slug,
      parentId: input.parentId ?? null,
      description: input.description ?? null,
      imageUrl: input.imageUrl ?? null,
      sortOrder: input.sortOrder ?? 0,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
    });
}

export async function listAdminCategories() {
  const db = await requireDb();
  return db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function updateCategory(
  categoryId: number,
  input: {
    name: string;
    slug: string;
    parentId?: number;
    description?: string;
    imageUrl?: string;
    sortOrder?: number;
    seoTitle?: string;
    seoDescription?: string;
  }
) {
  const db = await requireDb();
  await db
    .update(categories)
    .set({
      name: input.name,
      slug: input.slug,
      parentId: input.parentId ?? null,
      description: input.description ?? null,
      imageUrl: input.imageUrl ?? null,
      sortOrder: input.sortOrder ?? 0,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
    })
    .where(eq(categories.id, categoryId));
}

export async function archiveCategory(categoryId: number) {
  const db = await requireDb();
  await db
    .update(categories)
    .set({ active: 0 })
    .where(eq(categories.id, categoryId));
}

export async function getAdminMetrics() {
  const db = await requireDb();
  const [orderMetrics, productCountRow, lowStockRow] = await Promise.all([
    db
      .select({
        totalOrders: sql<number>`count(*)`,
        pendingOrders: sql<number>`coalesce(sum(case when ${orders.status} = 'pending' then 1 else 0 end), 0)`,
        deliveredOrders: sql<number>`coalesce(sum(case when ${orders.status} = 'delivered' then 1 else 0 end), 0)`,
        totalRevenue: sql<number>`coalesce(sum(case when ${orders.status} = 'delivered' then cast(${orders.totalAmount} as decimal(12,2)) else 0 end), 0)`,
      })
      .from(orders),
    db.select({ count: sql<number>`count(*)` }).from(products),
    db
      .select({
        lowStock: sql<number>`coalesce(sum(case when ${inventory.stockOnHand} <= ${inventory.lowStockThreshold} then 1 else 0 end), 0)`,
        outOfStock: sql<number>`coalesce(sum(case when ${inventory.stockOnHand} <= 0 then 1 else 0 end), 0)`,
      })
      .from(inventory),
  ]);

  return {
    totalRevenue: Number(orderMetrics[0]?.totalRevenue ?? 0),
    orders: Number(orderMetrics[0]?.totalOrders ?? 0),
    pendingOrders: Number(orderMetrics[0]?.pendingOrders ?? 0),
    deliveredOrders: Number(orderMetrics[0]?.deliveredOrders ?? 0),
    products: Number(productCountRow[0]?.count ?? 0),
    lowStock: Number(lowStockRow[0]?.lowStock ?? 0),
    outOfStock: Number(lowStockRow[0]?.outOfStock ?? 0),
  };
}

export async function trackEvent(
  userId: number | null,
  eventType: string,
  entityType?: string,
  entityId?: string
) {
  try {
    const db = await getDb();
    if (db) {
      await db
        .insert(analyticsEvents)
        .values({
          userId,
          eventType,
          entityType: entityType ?? null,
          entityId: entityId ?? null,
        });
    }
  } catch (err) {
    // Silently ignore tracking errors in offline/mock mode
  }
}

export async function createVerifiedReview(
  userId: number,
  productId: number,
  rating: number,
  body: string
) {
  const db = await requireDb();
  const matchingItem = (
    await db
      .select({ item: orderItems, orderStatus: orders.status })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(
        and(
          eq(orders.userId, userId),
          eq(orderItems.productId, productId),
          eq(orders.status, "delivered")
        )
      )
      .limit(1)
  )[0];
  if (!matchingItem)
    throw new Error(
      "Reviews can only be submitted for footwear in a delivered order."
    );
  const prior = (
    await db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.userId, userId),
          eq(reviews.orderItemId, matchingItem.item.id)
        )
      )
      .limit(1)
  )[0];
  if (prior)
    throw new Error(
      "A review for this purchased item has already been submitted."
    );
  await db
    .insert(reviews)
    .values({
      productId,
      userId,
      orderItemId: matchingItem.item.id,
      rating,
      body,
      verifiedPurchase: 1,
      status: "pending",
    });
  return { submitted: true };
}

export async function listAdminOrders() {
  const db = await requireDb();
  return db
    .select({
      order: orders,
      customerName: profiles.fullName,
      customerPhone: profiles.phone,
      customerEmail: users.email,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .orderBy(desc(orders.placedAt));
}

export const permittedOrderTransitions: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["out_for_delivery", "returned"],
  out_for_delivery: ["delivered", "returned"],
  delivered: ["returned", "refunded"],
  returned: ["refunded"],
  cancelled: [],
  refunded: [],
};

export function canTransitionOrder(currentStatus: string, nextStatus: string) {
  return (
    permittedOrderTransitions[currentStatus]?.includes(nextStatus) ?? false
  );
}

export async function updateOrderStatus(
  orderId: number,
  status: NonNullable<typeof orders.$inferInsert.status>,
  trackingNumber?: string,
  actorUserId?: number
) {
  const db = await requireDb();
  const current = (
    await db.select().from(orders).where(eq(orders.id, orderId)).limit(1)
  )[0];
  if (!current) throw new Error("Order not found.");
  if (!canTransitionOrder(current.status, status))
    throw new Error(
      `An order cannot move from ${current.status} to ${status}.`
    );
  await db.transaction(async tx => {
    await tx
      .update(orders)
      .set({ status, ...(trackingNumber ? { trackingNumber } : {}) })
      .where(eq(orders.id, orderId));
    await tx
      .insert(orderStatusHistory)
      .values({
        orderId,
        actorUserId: actorUserId ?? null,
        fromStatus: current.status,
        toStatus: status,
        note: trackingNumber ? `Tracking ${trackingNumber}` : null,
      });
    await tx
      .insert(auditLogs)
      .values({
        actorUserId: actorUserId ?? null,
        action: "order.status_changed",
        entityType: "order",
        entityId: String(orderId),
        beforeData: { status: current.status },
        afterData: { status, trackingNumber: trackingNumber ?? null },
      });
    if (status === "cancelled") {
      const items = await tx
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, orderId));
      for (const item of items)
        if (item.variantId) {
          const before =
            (
              await tx
                .select({ stock: inventory.stockOnHand })
                .from(inventory)
                .where(eq(inventory.variantId, item.variantId))
                .limit(1)
            )[0]?.stock ?? 0;
          await tx
            .update(inventory)
            .set({
              stockOnHand: sql`${inventory.stockOnHand} + ${item.quantity}`,
            })
            .where(eq(inventory.variantId, item.variantId));
          await tx
            .insert(inventoryAdjustments)
            .values({
              variantId: item.variantId,
              actorUserId: actorUserId ?? null,
              orderId,
              kind: "correction",
              delta: item.quantity,
              beforeQuantity: before,
              afterQuantity: before + item.quantity,
              reason: `Cancelled order ${orderId}`,
            });
        }
    }
  });
}

export const permittedPaymentTransitions: Record<string, string[]> = {
  pending: ["paid", "failed", "cancelled"],
  paid: ["partially_refunded", "refunded"],
  failed: [],
  cancelled: [],
  partially_refunded: ["refunded"],
  refunded: [],
};

export function canTransitionPayment(
  currentStatus: string,
  nextStatus: string
) {
  return (
    permittedPaymentTransitions[currentStatus]?.includes(nextStatus) ?? false
  );
}

export async function updatePaymentStatus(
  paymentId: number,
  status: NonNullable<typeof payments.$inferInsert.status>,
  providerReference?: string
) {
  const db = await requireDb();
  const payment = (
    await db.select().from(payments).where(eq(payments.id, paymentId)).limit(1)
  )[0];
  if (!payment) throw new Error("Payment record not found.");
  if (!permittedPaymentTransitions[payment.status].includes(status))
    throw new Error(
      `A payment cannot move from ${payment.status} to ${status}.`
    );
  await db.transaction(async tx => {
    await tx
      .update(payments)
      .set({ status, ...(providerReference ? { providerReference } : {}) })
      .where(eq(payments.id, paymentId));
    await tx
      .update(orders)
      .set({ paymentStatus: status })
      .where(eq(orders.id, payment.orderId));
  });
}

export async function listAdminCustomers() {
  const db = await requireDb();
  return db
    .select({ user: users, profile: profiles })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .orderBy(desc(users.lastSignedIn));
}

export async function listAdminReviews() {
  const db = await requireDb();
  return db
    .select({
      review: reviews,
      productName: products.name,
      customerName: profiles.fullName,
    })
    .from(reviews)
    .innerJoin(products, eq(reviews.productId, products.id))
    .leftJoin(profiles, eq(reviews.userId, profiles.userId))
    .orderBy(desc(reviews.createdAt));
}

export async function updateReviewStatus(
  reviewId: number,
  status: "approved" | "rejected" | "hidden"
) {
  const db = await requireDb();
  await db.update(reviews).set({ status }).where(eq(reviews.id, reviewId));
}

export async function listCoupons() {
  const db = await requireDb();
  return db.select().from(coupons).orderBy(desc(coupons.createdAt));
}

export type CouponInput = {
  code: string;
  kind: "percentage" | "fixed" | "free_shipping";
  value: number;
  minimumOrder?: number;
  maximumDiscount?: number;
  startsAt?: Date;
  expiresAt?: Date;
  usageLimit?: number;
  perUserLimit?: number;
  firstOrderOnly?: boolean;
  active?: boolean;
};

export async function saveCoupon(input: CouponInput, couponId?: number) {
  const db = await requireDb();
  const values = {
    code: input.code.toUpperCase(),
    kind: input.kind,
    value: String(input.value),
    minimumOrder: input.minimumOrder ? String(input.minimumOrder) : null,
    maximumDiscount: input.maximumDiscount
      ? String(input.maximumDiscount)
      : null,
    startsAt: input.startsAt ?? null,
    expiresAt: input.expiresAt ?? null,
    usageLimit: input.usageLimit ?? null,
    perUserLimit: input.perUserLimit ?? null,
    firstOrderOnly: input.firstOrderOnly ? 1 : 0,
    active: input.active === false ? 0 : 1,
  };
  if (couponId)
    await db.update(coupons).set(values).where(eq(coupons.id, couponId));
  else await db.insert(coupons).values(values);
}

export async function updateProductCore(
  productId: number,
  input: Omit<ProductInput, "variants">
) {
  const db = await requireDb();
  await db
    .update(products)
    .set({
      name: input.name,
      slug: input.slug,
      sku: input.sku,
      categoryId: input.categoryId ?? null,
      brandId: input.brandId ?? null,
      description: input.description ?? null,
      shortDescription: input.shortDescription ?? null,
      material: input.material ?? null,
      basePrice: String(input.basePrice),
      salePrice: input.salePrice ? String(input.salePrice) : null,
      status: input.status,
      featured: input.featured ? 1 : 0,
      isNew: input.isNew ? 1 : 0,
      bestSeller: input.bestSeller ? 1 : 0,
    })
    .where(eq(products.id, productId));
}

export async function archiveProduct(productId: number) {
  const db = await requireDb();
  await db
    .update(products)
    .set({ status: "archived" })
    .where(eq(products.id, productId));
}

export async function getCmsContent() {
  const db = await requireDb();
  const [sections, heroBanners, settings] = await Promise.all([
    db.select().from(homepageSections).orderBy(asc(homepageSections.sortOrder)),
    db
      .select()
      .from(banners)
      .orderBy(asc(banners.placement), asc(banners.sortOrder)),
    db.select().from(siteSettings).orderBy(asc(siteSettings.key)),
  ]);
  return { sections, banners: heroBanners, settings };
}

export async function saveHomepageSection(input: {
  key: string;
  heading?: string;
  subheading?: string;
  content?: Record<string, unknown>;
  active?: boolean;
  sortOrder?: number;
}) {
  const db = await requireDb();
  await db
    .insert(homepageSections)
    .values({
      key: input.key,
      heading: input.heading ?? null,
      subheading: input.subheading ?? null,
      content: input.content ?? null,
      active: input.active === false ? 0 : 1,
      sortOrder: input.sortOrder ?? 0,
    })
    .onConflictDoUpdate({
      target: homepageSections.key,
      set: {
        heading: input.heading ?? null,
        subheading: input.subheading ?? null,
        content: input.content ?? null,
        active: input.active === false ? 0 : 1,
        sortOrder: input.sortOrder ?? 0,
      },
    });
}

export async function saveBanner(input: {
  publicId?: string;
  placement: string;
  title?: string;
  subtitle?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  href?: string;
  sortOrder?: number;
  active?: boolean;
  startsAt?: Date;
  endsAt?: Date;
}) {
  const db = await requireDb();
  const values = {
    placement: input.placement,
    title: input.title ?? null,
    subtitle: input.subtitle ?? null,
    imageUrl: input.imageUrl,
    mobileImageUrl: input.mobileImageUrl ?? null,
    href: input.href ?? null,
    sortOrder: input.sortOrder ?? 0,
    active: input.active === false ? 0 : 1,
    startsAt: input.startsAt ?? null,
    endsAt: input.endsAt ?? null,
  };
  if (input.publicId)
    await db
      .update(banners)
      .set(values)
      .where(eq(banners.publicId, input.publicId));
  else await db.insert(banners).values({ publicId: uid(), ...values });
}

export type DiscountInput = {
  name: string;
  type:
    | "product"
    | "category"
    | "storewide"
    | "flash_sale"
    | "buy_x_get_y"
    | "first_order";
  valueType: "percentage" | "fixed";
  value: number;
  minimumOrder?: number;
  startsAt?: Date;
  expiresAt?: Date;
  active?: boolean;
  stackable?: boolean;
};

export async function listDiscounts() {
  const db = await requireDb();
  return db.select().from(discounts).orderBy(desc(discounts.updatedAt));
}

export async function saveDiscount(input: DiscountInput, discountId?: number) {
  const db = await requireDb();
  const values = {
    name: input.name,
    type: input.type,
    valueType: input.valueType,
    value: String(input.value),
    minimumOrder: input.minimumOrder ? String(input.minimumOrder) : null,
    startsAt: input.startsAt ?? null,
    expiresAt: input.expiresAt ?? null,
    active: input.active === false ? 0 : 1,
    stackable: input.stackable ? 1 : 0,
  };
  if (discountId)
    await db.update(discounts).set(values).where(eq(discounts.id, discountId));
  else await db.insert(discounts).values(values);
}

export async function listBanners() {
  const db = await requireDb();
  return db
    .select()
    .from(banners)
    .orderBy(asc(banners.placement), asc(banners.sortOrder));
}

export async function getAnalyticsOverview() {
  const db = await requireDb();
  const [events, allOrders, allProducts] = await Promise.all([
    db
      .select()
      .from(analyticsEvents)
      .orderBy(desc(analyticsEvents.createdAt))
      .limit(30),
    db.select().from(orders),
    db.select().from(products),
  ]);
  const eventTotals = events.reduce<Record<string, number>>((total, event) => {
    total[event.eventType] = (total[event.eventType] ?? 0) + 1;
    return total;
  }, {});
  return {
    recentEvents: events,
    eventTotals,
    orderCount: allOrders.length,
    productCount: allProducts.length,
  };
}

export async function listSiteSettings() {
  const db = await requireDb();
  return db.select().from(siteSettings).orderBy(asc(siteSettings.key));
}

export async function saveSiteSetting(
  key: string,
  value: Record<string, unknown>
) {
  const db = await requireDb();
  await db.insert(siteSettings).values({ key, value }).onConflictDoUpdate({
    target: siteSettings.key,
    set: { value },
  });
}

export async function createOrderIdempotent(
  userId: number,
  idempotencyKey: string,
  addressId: number,
  paymentMethod: "cod" | "online",
  couponCode?: string,
  customerNote?: string
) {
  const providerStatus = getProviderStatus();
  if (paymentMethod === "online" && !providerStatus.payment.available)
    throw new Error(
      "Online payment is currently unavailable. Please choose cash on delivery until a payment provider is configured."
    );
  const db = await requireDb();
  const requestHash = createHash("sha256")
    .update(
      JSON.stringify({
        userId,
        addressId,
        paymentMethod,
        couponCode: couponCode ?? null,
        customerNote: customerNote ?? null,
      })
    )
    .digest("hex");
  try {
    await db
      .insert(checkoutRequests)
      .values({ userId, idempotencyKey, requestHash, status: "started" });
  } catch {
    const existing = (
      await db
        .select()
        .from(checkoutRequests)
        .where(
          and(
            eq(checkoutRequests.userId, userId),
            eq(checkoutRequests.idempotencyKey, idempotencyKey)
          )
        )
        .limit(1)
    )[0];
    if (!existing)
      throw new Error("Checkout could not be initialized. Please try again.");
    if (existing.requestHash !== requestHash)
      throw new Error(
        "This checkout key was already used for a different order."
      );
    if (existing.status === "completed" && existing.orderId) {
      const previous = (
        await db
          .select()
          .from(orders)
          .where(eq(orders.id, existing.orderId))
          .limit(1)
      )[0];
      if (previous)
        return {
          publicId: previous.publicId,
          orderNumber: previous.orderNumber,
          total: money(previous.totalAmount),
          paymentMethod: previous.paymentMethod,
        };
    }
    if (existing.status === "started")
      throw new Error("This checkout request is already being processed.");
    await db
      .update(checkoutRequests)
      .set({ status: "started", updatedAt: new Date() })
      .where(eq(checkoutRequests.id, existing.id));
  }
  try {
    const result = await createOrder(
      userId,
      addressId,
      paymentMethod,
      couponCode,
      customerNote
    );
    const created = (
      await db
        .select()
        .from(orders)
        .where(eq(orders.publicId, result.publicId))
        .limit(1)
    )[0];
    await db
      .update(checkoutRequests)
      .set({
        status: "completed",
        orderId: created?.id ?? null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(checkoutRequests.userId, userId),
          eq(checkoutRequests.idempotencyKey, idempotencyKey)
        )
      );
    return result;
  } catch (error) {
    await db
      .update(checkoutRequests)
      .set({ status: "failed", updatedAt: new Date() })
      .where(
        and(
          eq(checkoutRequests.userId, userId),
          eq(checkoutRequests.idempotencyKey, idempotencyKey)
        )
      );
    throw error;
  }
}

export async function subscribeNewsletter(
  email: string,
  userId?: number,
  source = "storefront"
) {
  const db = await requireDb();
  const normalized = email.trim().toLowerCase();
  const existing = (
    await db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, normalized))
      .limit(1)
  )[0];
  if (existing) {
    await db
      .update(newsletterSubscribers)
      .set({
        status: "subscribed",
        userId: userId ?? existing.userId,
        source,
        unsubscribedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(newsletterSubscribers.id, existing.id));
    return { subscribed: true, alreadyRegistered: true };
  }
  await db
    .insert(newsletterSubscribers)
    .values({
      email: normalized,
      userId: userId ?? null,
      source,
      unsubscribeToken: uid(),
    });
  return { subscribed: true, alreadyRegistered: false };
}

export async function unsubscribeNewsletter(token: string) {
  const db = await requireDb();
  const existing = (
    await db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.unsubscribeToken, token))
      .limit(1)
  )[0];
  if (!existing) throw new Error("Subscription token not found.");
  await db
    .update(newsletterSubscribers)
    .set({
      status: "unsubscribed",
      unsubscribedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(newsletterSubscribers.id, existing.id));
  return { unsubscribed: true };
}

export function validateReturnSelections(
  orderItems: Array<{ id: number; quantity: number }>,
  requestedItems: Array<{ orderItemId: number; quantity: number }>
) {
  const selections = requestedItems.filter(item => item.quantity > 0);
  if (!selections.length)
    throw new Error("Select at least one item to return.");
  const itemById = new Map(orderItems.map(item => [item.id, item]));
  for (const selection of selections) {
    const orderItem = itemById.get(selection.orderItemId);
    if (
      !orderItem ||
      !Number.isInteger(selection.quantity) ||
      selection.quantity < 1 ||
      selection.quantity > orderItem.quantity
    )
      throw new Error(
        "Return quantities must match the delivered order items."
      );
  }
  return selections;
}

export async function requestReturn(
  userId: number,
  orderPublicId: string,
  reason: string,
  requestedItems: Array<{ orderItemId: number; quantity: number }>
) {
  const db = await requireDb();
  const order = (
    await db
      .select()
      .from(orders)
      .where(and(eq(orders.publicId, orderPublicId), eq(orders.userId, userId)))
      .limit(1)
  )[0];
  if (!order || order.status !== "delivered")
    throw new Error("Returns are available for delivered orders only.");
  const existing = await db
    .select()
    .from(returns)
    .where(
      and(
        eq(returns.orderId, order.id),
        eq(returns.userId, userId),
        sql`${returns.status} IN ('requested', 'approved', 'received')`
      )
    )
    .limit(1);
  if (existing.length)
    throw new Error("A return request already exists for this order.");
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));
  const selections = validateReturnSelections(items, requestedItems);
  const publicId = uid();
  await db.transaction(async tx => {
    await tx
      .insert(returns)
      .values({ publicId, orderId: order.id, userId, reason: reason.trim() });
    const created = (
      await tx
        .select()
        .from(returns)
        .where(eq(returns.publicId, publicId))
        .limit(1)
    )[0]!;
    for (const selection of selections)
      await tx
        .insert(returnItems)
        .values({
          returnId: created.id,
          orderItemId: selection.orderItemId,
          quantity: selection.quantity,
        });
    await tx
      .insert(auditLogs)
      .values({
        actorUserId: userId,
        action: "return.requested",
        entityType: "return",
        entityId: publicId,
        afterData: { orderId: order.publicId, reason },
      });
  });
  return { publicId };
}

export async function listReturnsForUser(userId: number) {
  const db = await requireDb();
  return db
    .select({
      return: returns,
      orderNumber: orders.orderNumber,
      orderPublicId: orders.publicId,
    })
    .from(returns)
    .innerJoin(orders, eq(returns.orderId, orders.id))
    .where(eq(returns.userId, userId))
    .orderBy(desc(returns.createdAt));
}

export async function listAdminReturns() {
  const db = await requireDb();
  return db
    .select({
      return: returns,
      orderNumber: orders.orderNumber,
      customerName: profiles.fullName,
      customerEmail: users.email,
      item: {
        orderItemId: returnItems.orderItemId,
        quantity: returnItems.quantity,
      },
      productName: products.name,
      size: orderItems.size,
      color: orderItems.color,
    })
    .from(returns)
    .innerJoin(orders, eq(returns.orderId, orders.id))
    .innerJoin(users, eq(returns.userId, users.id))
    .leftJoin(profiles, eq(returns.userId, profiles.userId))
    .leftJoin(returnItems, eq(returnItems.returnId, returns.id))
    .leftJoin(orderItems, eq(orderItems.id, returnItems.orderItemId))
    .leftJoin(products, eq(products.id, orderItems.productId))
    .orderBy(desc(returns.createdAt));
}

export async function updateReturnStatus(
  returnId: number,
  status: "approved" | "rejected" | "received" | "cancelled",
  actorUserId: number
) {
  const db = await requireDb();
  const current = (
    await db.select().from(returns).where(eq(returns.id, returnId)).limit(1)
  )[0];
  if (!current) throw new Error("Return request not found.");
  const allowed: Record<string, string[]> = {
    requested: ["approved", "rejected", "cancelled"],
    approved: ["received", "cancelled"],
    received: [],
    rejected: [],
    cancelled: [],
  };
  if (!allowed[current.status]?.includes(status))
    throw new Error(
      `A return cannot move from ${current.status} to ${status}.`
    );
  await db.transaction(async tx => {
    await tx
      .update(returns)
      .set({
        status,
        ...(status === "received" ? { refundStatus: "pending" as const } : {}),
      })
      .where(eq(returns.id, returnId));
    if (status === "received" && current.restock) {
      const items = await tx
        .select({ item: returnItems, orderItem: orderItems })
        .from(returnItems)
        .innerJoin(orderItems, eq(returnItems.orderItemId, orderItems.id))
        .where(eq(returnItems.returnId, returnId));
      for (const row of items) {
        if (!row.orderItem.variantId) continue;
        const before =
          (
            await tx
              .select({ stock: inventory.stockOnHand })
              .from(inventory)
              .where(eq(inventory.variantId, row.orderItem.variantId))
              .limit(1)
          )[0]?.stock ?? 0;
        await tx
          .update(inventory)
          .set({
            stockOnHand: sql`${inventory.stockOnHand} + ${row.item.quantity}`,
          })
          .where(eq(inventory.variantId, row.orderItem.variantId));
        await tx
          .insert(inventoryAdjustments)
          .values({
            variantId: row.orderItem.variantId,
            actorUserId,
            orderId: current.orderId,
            kind: "return",
            delta: row.item.quantity,
            beforeQuantity: before,
            afterQuantity: before + row.item.quantity,
            reason: `Return ${current.publicId} received`,
          });
      }
    }
    await tx
      .insert(auditLogs)
      .values({
        actorUserId,
        action: `return.${status}`,
        entityType: "return",
        entityId: current.publicId,
        beforeData: { status: current.status },
        afterData: { status },
      });
  });
}
