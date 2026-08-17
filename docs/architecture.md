# SoleCraft Commerce Architecture

SoleCraft is organized around a typed React storefront and administration interface, an Express and tRPC business layer, and a normalized relational data model. Page components are responsible for presentation and interaction only. Procedures orchestrate authorization and validation, while database helpers are the sole location for persistence operations. This separation keeps catalog, cart, checkout, payment, inventory, discount, and order logic reusable for future mobile and third-party consumers.

| Layer | Responsibility | Main locations |
| --- | --- | --- |
| Customer interface | Browsing, product discovery, cart, checkout, account, and reviews | `client/src/pages`, `client/src/components` |
| Admin interface | Protected product, inventory, order, customer, review, and content management | `client/src/pages/admin`, `client/src/components/DashboardLayout.tsx` |
| Contracts and business services | Input validation, access control, stock and price checks, cart/order transitions | `server/routers`, `server/services` |
| Data access | Normalized relational persistence and transaction-safe helpers | `server/db.ts`, `drizzle/schema.ts` |
| Media | URL/key metadata in the database; image bytes stored through the configured storage service | `server/storage.ts`, `productImages`, `banners` |

The catalog hierarchy is `category → product → product variant`. A purchasable variant carries its own SKU, option values, sale-price override, availability, image, and inventory quantity. Shopping and fulfillment operate on immutable order item snapshots, so later catalog edits never change historic order details.

| Route group | Routes |
| --- | --- |
| Storefront | `/`, `/shop`, `/categories/:slug`, `/product/:slug`, `/search`, `/cart`, `/checkout`, `/wishlist`, `/about`, `/contact`, `/faq`, `/shipping-returns`, `/privacy`, `/terms` |
| Customer account | `/login`, `/register`, `/forgot-password`, `/account`, `/account/orders`, `/account/orders/:orderNumber`, `/account/addresses`, `/account/profile`, `/account/reviews` |
| Administration | `/admin`, `/admin/products`, `/admin/categories`, `/admin/inventory`, `/admin/orders`, `/admin/customers`, `/admin/discounts`, `/admin/coupons`, `/admin/reviews`, `/admin/content`, `/admin/analytics` |

| Workflow | Server-side source of truth |
| --- | --- |
| Product discovery | Active categories, products, variants, and product images |
| Cart and wishlist | Authenticated customer rows plus variant-level inventory checks |
| Checkout | Revalidated variant price, active discount/coupon eligibility, shipping, address, and stock reservation logic |
| Payment | COD/online-provider abstraction with pending, paid, failed, cancelled, and refund states; no card data is stored |
| Order management | Validated state transitions, item snapshots, tracking information, and invoice-ready totals |
| Reviews | Purchase verification against delivered order items before review creation |
| Administration | Role and permission checks before every management operation |

The initial managed full-stack project supplies a MySQL-compatible relational database and OAuth session layer. The schema and service boundaries remain portable to Supabase PostgreSQL; completing a Supabase deployment requires enabling the rejected Supabase connector or supplying the relevant project credentials through the project settings. No browser-facing secret is stored in source code.
