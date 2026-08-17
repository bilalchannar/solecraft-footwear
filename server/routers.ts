import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router, staffProcedure } from "./_core/trpc";
import { getProviderStatus } from "./services/providerStatus";
import { createStripePaymentIntent } from "./services/stripe";
import {
  addCartItem,
  changeCartItemQuantity,
  createCategory,
  createProduct,
  createOrderIdempotent,
  archiveCategory,
  createVerifiedReview,
  getAnalyticsOverview,
  archiveProduct,
  getCmsContent,
  getAdminMetrics,
  getCartForUser,
  getCustomerProfile,
  getHomepageContent,
  getOrderForUser,
  getProductBySlug,
  getWishlistForUser,
  listAddresses,
  listAdminProducts,
  listAdminCustomers,
  listAdminCategories,
  listAdminInventory,
  listAdminOrders,
  listAdminReviews,
  listCatalogProducts,
  listCoupons,
  listDiscounts,
  listBanners,
  listSiteSettings,
  listCategories,
  listOrdersForUser,
  subscribeNewsletter,
  unsubscribeNewsletter,
  quoteCheckout,
  requestReturn,
  listReturnsForUser,
  listAdminReturns,
  updateReturnStatus,
  saveAddress,
  saveCustomerProfile,
  saveBanner,
  saveCoupon,
  saveDiscount,
  saveHomepageSection,
  saveSiteSetting,
  toggleWishlistItem,
  trackEvent,
  updateOrderStatus,
  updateCategory,
  updatePaymentStatus,
  updateProductCore,
  updateReviewStatus,
  updateInventory,
} from "./db";

const phone = z.string().trim().regex(/^(?:\+92|0092|0)?3\d{9}$/, "Enter a valid Pakistani mobile number.");
const addressInput = z.object({
  label: z.string().trim().min(2).max(64),
  fullName: z.string().trim().min(2).max(160),
  phone,
  email: z.string().trim().email().optional(),
  province: z.string().trim().min(2).max(96),
  city: z.string().trim().min(2).max(96),
  area: z.string().trim().max(128).optional(),
  addressLine: z.string().trim().min(8).max(1000),
  postalCode: z.string().trim().max(20).optional(),
  deliveryInstructions: z.string().trim().max(500).optional(),
  isDefault: z.boolean().optional(),
});

export const appRouter = router({
  system: systemRouter,
  integrations: publicProcedure.query(() => getProviderStatus()),
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  storefront: router({
    home: publicProcedure.query(() => getHomepageContent()),
    categories: publicProcedure.query(() => listCategories()),
    products: publicProcedure.input(z.object({
      query: z.string().trim().max(100).optional(),
      categorySlug: z.string().trim().max(160).optional(),
      brand: z.string().trim().max(160).optional(),
      material: z.string().trim().max(128).optional(),
      minPrice: z.number().nonnegative().optional(),
      maxPrice: z.number().positive().optional(),
      sort: z.enum(["newest", "price_asc", "price_desc", "best_selling", "discount", "relevance"]).optional(),
    }).optional()).query(({ input }) => listCatalogProducts(input)),
    product: publicProcedure.input(z.object({ slug: z.string().min(1).max(255) })).query(async ({ input }) => {
      const product = await getProductBySlug(input.slug);
      if (product) await trackEvent(null, "product_view", "product", product.product.publicId);
      return product;
    }),
  }),
  cart: router({
    get: protectedProcedure.query(({ ctx }) => getCartForUser(ctx.user.id)),
    add: protectedProcedure.input(z.object({ variantId: z.number().int().positive(), quantity: z.number().int().min(1).max(12) })).mutation(({ ctx, input }) => addCartItem(ctx.user.id, input.variantId, input.quantity)),
    updateQuantity: protectedProcedure.input(z.object({ itemId: z.number().int().positive(), quantity: z.number().int().min(0).max(12) })).mutation(({ ctx, input }) => changeCartItemQuantity(ctx.user.id, input.itemId, input.quantity)),
  }),
  wishlist: router({
    get: protectedProcedure.query(({ ctx }) => getWishlistForUser(ctx.user.id)),
    toggle: protectedProcedure.input(z.object({ productId: z.number().int().positive() })).mutation(({ ctx, input }) => toggleWishlistItem(ctx.user.id, input.productId)),
  }),
  account: router({
    profile: protectedProcedure.query(({ ctx }) => getCustomerProfile(ctx.user.id)),
    saveProfile: protectedProcedure.input(z.object({ fullName: z.string().trim().min(2).max(160), phone: phone.optional(), marketingOptIn: z.boolean().optional() })).mutation(({ ctx, input }) => saveCustomerProfile(ctx.user.id, input)),
    addresses: protectedProcedure.query(({ ctx }) => listAddresses(ctx.user.id)),
    saveAddress: protectedProcedure.input(z.object({ addressId: z.number().int().positive().optional(), address: addressInput })).mutation(({ ctx, input }) => saveAddress(ctx.user.id, input.address, input.addressId)),
    orders: protectedProcedure.query(({ ctx }) => listOrdersForUser(ctx.user.id)),
    order: protectedProcedure.input(z.object({ publicId: z.string().uuid() })).query(({ ctx, input }) => getOrderForUser(ctx.user.id, input.publicId)),
    returns: protectedProcedure.query(({ ctx }) => listReturnsForUser(ctx.user.id)),
    requestReturn: protectedProcedure.input(z.object({ orderPublicId: z.string().uuid(), reason: z.string().trim().min(10).max(500), items: z.array(z.object({ orderItemId: z.number().int().positive(), quantity: z.number().int().positive() })).min(1) })).mutation(({ ctx, input }) => requestReturn(ctx.user.id, input.orderPublicId, input.reason, input.items)),
  }),
  checkout: router({
    quote: protectedProcedure.input(z.object({ couponCode: z.string().trim().max(64).optional() })).query(({ ctx, input }) => quoteCheckout(ctx.user.id, input.couponCode)),
    createPaymentIntent: protectedProcedure.input(z.object({ couponCode: z.string().trim().max(64).optional() })).mutation(async ({ ctx, input }) => {
      const quote = await quoteCheckout(ctx.user.id, input.couponCode);
      return createStripePaymentIntent({
        amount: quote.total,
        orderNumber: `SC-${Date.now().toString().slice(-6)}`,
        customerEmail: ctx.user.email ?? undefined,
      });
    }),
    placeOrder: protectedProcedure.input(z.object({ idempotencyKey: z.string().uuid(), addressId: z.number().int().positive(), paymentMethod: z.enum(["cod", "online"]), couponCode: z.string().trim().max(64).optional(), customerNote: z.string().trim().max(500).optional() })).mutation(({ ctx, input }) => createOrderIdempotent(ctx.user.id, input.idempotencyKey, input.addressId, input.paymentMethod, input.couponCode, input.customerNote)),
  }),
  newsletter: router({
    subscribe: publicProcedure.input(z.object({ email: z.string().trim().email().max(320), source: z.string().trim().max(64).optional() })).mutation(({ ctx, input }) => subscribeNewsletter(input.email, ctx.user?.id, input.source)),
    unsubscribe: publicProcedure.input(z.object({ token: z.string().trim().min(16).max(96) })).mutation(({ input }) => unsubscribeNewsletter(input.token)),
  }),
  reviews: router({
    create: protectedProcedure.input(z.object({ productId: z.number().int().positive(), rating: z.number().int().min(1).max(5), body: z.string().trim().min(20).max(2000) })).mutation(({ ctx, input }) => createVerifiedReview(ctx.user.id, input.productId, input.rating, input.body)),
  }),
  admin: router({
    metrics: staffProcedure.query(() => getAdminMetrics()),
    products: staffProcedure.query(() => listAdminProducts()),
    categories: staffProcedure.query(() => listAdminCategories()),
    inventory: staffProcedure.query(() => listAdminInventory()),
    customers: staffProcedure.query(() => listAdminCustomers()),
    orders: staffProcedure.query(() => listAdminOrders()),
    returns: staffProcedure.query(() => listAdminReturns()),
    reviews: staffProcedure.query(() => listAdminReviews()),
    coupons: adminProcedure.query(() => listCoupons()),
    discounts: adminProcedure.query(() => listDiscounts()),
    banners: adminProcedure.query(() => listBanners()),
    analytics: staffProcedure.query(() => getAnalyticsOverview()),
    settings: adminProcedure.query(() => listSiteSettings()),
    cms: adminProcedure.query(() => getCmsContent()),
    createProduct: adminProcedure.input(z.object({
      name: z.string().trim().min(2).max(255), slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(255), sku: z.string().trim().min(2).max(96),
      categoryId: z.number().int().positive().optional(), brandId: z.number().int().positive().optional(), description: z.string().trim().max(10000).optional(), shortDescription: z.string().trim().max(400).optional(), material: z.string().trim().max(128).optional(),
      basePrice: z.number().positive(), salePrice: z.number().positive().optional(), status: z.enum(["draft", "active", "archived"]), featured: z.boolean().optional(), isNew: z.boolean().optional(), bestSeller: z.boolean().optional(),
      variants: z.array(z.object({ sku: z.string().trim().min(2).max(96), size: z.string().trim().min(1).max(32), color: z.string().trim().min(1).max(64), colorHex: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/).optional(), priceOverride: z.number().positive().optional(), salePriceOverride: z.number().positive().optional(), imageUrl: z.string().url().optional(), stockOnHand: z.number().int().min(0), lowStockThreshold: z.number().int().min(0).max(999).optional() })).min(1).max(80),
    })).mutation(({ input }) => createProduct(input)),
    createCategory: adminProcedure.input(z.object({ name: z.string().trim().min(2).max(128), slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(160), parentId: z.number().int().positive().optional(), description: z.string().trim().max(5000).optional(), imageUrl: z.string().url().optional(), sortOrder: z.number().int().min(0).max(9999).optional(), seoTitle: z.string().trim().max(160).optional(), seoDescription: z.string().trim().max(320).optional() })).mutation(({ input }) => createCategory(input)),
    updateCategory: adminProcedure.input(z.object({ categoryId: z.number().int().positive(), name: z.string().trim().min(2).max(128), slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(160), parentId: z.number().int().positive().optional(), description: z.string().trim().max(5000).optional(), imageUrl: z.string().url().optional(), sortOrder: z.number().int().min(0).max(9999).optional(), seoTitle: z.string().trim().max(160).optional(), seoDescription: z.string().trim().max(320).optional() })).mutation(({ input }) => { const { categoryId, ...category } = input; return updateCategory(categoryId, category); }),
    archiveCategory: adminProcedure.input(z.object({ categoryId: z.number().int().positive() })).mutation(({ input }) => archiveCategory(input.categoryId)),
    updateInventory: staffProcedure.input(z.object({ variantId: z.number().int().positive(), stockOnHand: z.number().int().min(0), lowStockThreshold: z.number().int().min(0).max(999).optional() })).mutation(({ input }) => updateInventory(input.variantId, input.stockOnHand, input.lowStockThreshold)),
    updateOrderStatus: staffProcedure.input(z.object({ orderId: z.number().int().positive(), status: z.enum(["confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered", "cancelled", "returned", "refunded"]), trackingNumber: z.string().trim().max(128).optional() })).mutation(({ ctx, input }) => updateOrderStatus(input.orderId, input.status, input.trackingNumber, ctx.user.id)),
    updateReturnStatus: staffProcedure.input(z.object({ returnId: z.number().int().positive(), status: z.enum(["approved", "rejected", "received", "cancelled"]) })).mutation(({ ctx, input }) => updateReturnStatus(input.returnId, input.status, ctx.user.id)),
    updateReviewStatus: staffProcedure.input(z.object({ reviewId: z.number().int().positive(), status: z.enum(["approved", "rejected", "hidden"]) })).mutation(({ input }) => updateReviewStatus(input.reviewId, input.status)),
    updatePaymentStatus: adminProcedure.input(z.object({ paymentId: z.number().int().positive(), status: z.enum(["paid", "failed", "cancelled", "partially_refunded", "refunded"]), providerReference: z.string().trim().max(160).optional() })).mutation(({ input }) => updatePaymentStatus(input.paymentId, input.status, input.providerReference)),
    saveCoupon: adminProcedure.input(z.object({ couponId: z.number().int().positive().optional(), code: z.string().trim().min(3).max(64), kind: z.enum(["percentage", "fixed", "free_shipping"]), value: z.number().nonnegative(), minimumOrder: z.number().nonnegative().optional(), maximumDiscount: z.number().nonnegative().optional(), startsAt: z.date().optional(), expiresAt: z.date().optional(), usageLimit: z.number().int().positive().optional(), perUserLimit: z.number().int().positive().optional(), firstOrderOnly: z.boolean().optional(), active: z.boolean().optional() })).mutation(({ input }) => saveCoupon(input, input.couponId)),
    saveDiscount: adminProcedure.input(z.object({ discountId: z.number().int().positive().optional(), name: z.string().trim().min(2).max(160), type: z.enum(["product", "category", "storewide", "flash_sale", "buy_x_get_y", "first_order"]), valueType: z.enum(["percentage", "fixed"]), value: z.number().nonnegative(), minimumOrder: z.number().nonnegative().optional(), startsAt: z.date().optional(), expiresAt: z.date().optional(), active: z.boolean().optional(), stackable: z.boolean().optional() })).mutation(({ input }) => saveDiscount(input, input.discountId)),
    saveHomepageSection: adminProcedure.input(z.object({ key: z.string().trim().min(2).max(96), heading: z.string().trim().max(160).optional(), subheading: z.string().trim().max(320).optional(), content: z.record(z.string(), z.unknown()).optional(), active: z.boolean().optional(), sortOrder: z.number().int().min(0).max(9999).optional() })).mutation(({ input }) => saveHomepageSection(input)),
    saveBanner: adminProcedure.input(z.object({ publicId: z.string().uuid().optional(), placement: z.string().trim().min(2).max(64), title: z.string().trim().max(160).optional(), subtitle: z.string().trim().max(320).optional(), imageUrl: z.string().url(), mobileImageUrl: z.string().url().optional(), href: z.string().max(512).optional(), sortOrder: z.number().int().min(0).max(9999).optional(), active: z.boolean().optional(), startsAt: z.date().optional(), endsAt: z.date().optional() })).mutation(({ input }) => saveBanner(input)),
    saveSetting: adminProcedure.input(z.object({ key: z.string().trim().min(2).max(96), value: z.record(z.string(), z.unknown()) })).mutation(({ input }) => saveSiteSetting(input.key, input.value)),
    updateProduct: adminProcedure.input(z.object({ productId: z.number().int().positive(), name: z.string().trim().min(2).max(255), slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(255), sku: z.string().trim().min(2).max(96), categoryId: z.number().int().positive().optional(), brandId: z.number().int().positive().optional(), description: z.string().trim().max(10000).optional(), shortDescription: z.string().trim().max(400).optional(), material: z.string().trim().max(128).optional(), basePrice: z.number().positive(), salePrice: z.number().positive().optional(), status: z.enum(["draft", "active", "archived"]), featured: z.boolean().optional(), isNew: z.boolean().optional(), bestSeller: z.boolean().optional() })).mutation(({ input }) => { const { productId, ...product } = input; return updateProductCore(productId, product); }),
    archiveProduct: adminProcedure.input(z.object({ productId: z.number().int().positive() })).mutation(({ input }) => archiveProduct(input.productId)),
  }),
});

export type AppRouter = typeof appRouter;
