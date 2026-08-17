# Project TODO

- [x] Define domain vocabulary, route map, and implementation boundaries for the Pakistani footwear commerce platform.
- [x] Replace the starter schema with normalized tables for profiles, roles, permissions, categories, brands, products, variants, media, tags, inventory, carts, wishlists, addresses, orders, payments, coupons, discounts, reviews, CMS content, analytics, and notifications.
- [x] Generate and apply the database migration with foreign keys, indexes, constraints, timestamps, and variant-level inventory safeguards.
- [x] Implement server-side catalog, category, search, filter, product-detail, cart, wishlist, address, coupon, checkout, order, review, CMS, analytics, and administration procedures.
- [x] Implement server-side price, stock, coupon, and order-state validation, including COD and modular online-payment states without storing card data.
- [x] Implement role-based authorization for Super Admin, Admin, and Staff-equivalent permissions and protect all management routes.
- [x] Build the responsive premium storefront shell, homepage sections, category discovery, search, product cards, product detail, cart, checkout, and account routes.
- [x] Build dynamic customer account routes for orders, order detail, addresses, profile, wishlist, and purchase-verified review submission.
- [x] Build a protected admin dashboard with product, category, inventory, coupon, order, customer, review, and homepage CMS management routes.
- [x] Add Pakistan-focused phone/address validation, PKR presentation, shipping totals, confirmation dialogs, success/error/empty/loading states, and mobile navigation/filter behavior.
- [x] Add SEO foundations including semantic structure, metadata defaults, canonical-ready routing, robots.txt, sitemap-ready data, and structured-data helpers.
- [x] Add Vitest coverage for core validation, discount, stock, checkout, and authorization flows.
- [x] Add and verify focused Vitest coverage for coupon calculations and order/payment transition guards.
- [x] Add and verify stock and checkout guard coverage for empty carts and unavailable quantities.
- [x] Add and verify protected and management authorization coverage, then run the complete test suite.
- [x] Add a delivered-order review form with purchase verification, loading, success, error, and unavailable-state feedback.
- [x] Verify the database migration, type safety, test suite, desktop/mobile presentation, and browser interaction flows.
- [x] Save a completed project checkpoint and deliver the implementation summary with configuration follow-ups.
- [x] Verify all generated migration tables, key foreign keys, and indexes are present after the timed-out batch execution and manual completion step.
- [x] Complete and verify review submission/moderation, CMS management, and order/customer administration procedures.
- [x] Confirm all tRPC procedures are saved and reachable through the typed client contract.
- [x] Enforce modeled coupon usage and first-order rules, and validate modular online-payment state transitions.
- [x] Implement a staff-capable management guard for operational read, inventory, fulfillment, and review workflows.
- [x] Add a protected category management route with creation, update/archive controls, dashboard navigation, and router registration.
- [x] Add confirmation handling for critical catalog and order management actions, plus responsive mobile filtering behavior.
- [x] Capture and review mobile storefront and account/admin viewport verification before final checkpointing.
- [x] Require confirmation before an administrator changes an order's fulfillment status.
- [x] Introduce a tokenized premium fashion design system with shared surfaces, typography, controls, focus states, loading states, and accessible dark/light/system themes.
- [x] Upgrade storefront navigation, search, product cards, product detail, cart, checkout, and customer account flows with cohesive micro-interactions, feedback, and reduced-motion support.
- [x] Add refined scroll/page reveals, skeleton loaders, polished empty/error states, responsive image treatment, and a mobile filter drawer with explicit apply and clear interactions.
- [x] Upgrade the protected administration experience with a responsive animated navigation, polished metrics/tables/forms, and management routes for discounts, banners, analytics, and settings.
- [x] Validate the enhanced application page-by-page in light and dark themes at desktop and mobile sizes, run type checks/tests, save a checkpoint, and deliver the update.
- [x] Add and verify prefers-reduced-motion handling for reveal, drawer, gallery, and the newly animated interface behaviors.
- [x] Apply and verify the refreshed interaction and feedback system on customer account, orders, addresses, and wishlist routes.
- [x] Apply the refreshed interaction and feedback patterns directly to orders, addresses, and wishlist route components.
- [x] Re-verify the enhanced UI in light and dark themes at desktop and mobile sizes, then save the final updated checkpoint.
- [x] Re-verify the final orders, addresses, and wishlist refinements at desktop and mobile sizes in both light and dark themes.
- [x] Save the final updated project checkpoint after the cross-theme verification pass.
- [x] Re-verify orders, addresses, and wishlist individually in both light and dark themes at desktop and mobile sizes.
- [x] Save a final project checkpoint after the complete per-route theme verification pass.
- [x] Save a new release checkpoint containing the final theme, account-route, and operations-interface refinements.
- [x] Conduct a read-only audit of the completed SoleCraft project, covering implementation status, data and backend connections, security, launch blockers, defects, placeholders, and a prioritized readiness roadmap.
- [x] Preserve admin/staff roles across OAuth sync, logout/login, refresh, and session restoration without trusting client roles.
- [x] Make inventory reservation/deduction and stock restoration atomic and non-negative during checkout, cancellation, and refunds.
- [x] Add atomic coupon usage enforcement for global and per-user limits.
- [x] Add checkout idempotency keys and duplicate-order protection for retries and repeated submissions.
- [x] Provide local product administration for variants, availability/pricing, and catalog media URLs; direct storage-upload automation remains an explicit future placeholder.
- [x] Provide validated local inventory adjustment, low-stock, and out-of-stock views; expanded historical reporting remains an explicit future placeholder.
- [x] Provide the local order workbench, guarded status transitions, customer/order visibility, and return handling; invoice automation and provider-backed refunds remain placeholders.
- [x] Provide local return records, itemized selection, restock hooks, and deferred refund states; external refund execution remains a provider placeholder.
- [x] Add modular shipping, notification, and payment-provider interfaces with explicit unavailable states while credentials remain deferred.
- [x] Provide the local audit-log foundation for protected commerce operations; broader event coverage remains an explicit extension point.
- [x] Implement newsletter subscription storage, duplicate prevention, validation, success/error state, and unsubscribe-ready fields.
- [x] Provide dynamic product SEO, canonical/OG metadata, Product/Offer/Breadcrumb JSON-LD, and absolute sitemap URLs; category expansion remains an extension point.
- [x] Provide focused Vitest coverage for auth, provider configuration, commerce guards, itemized returns, and checkout safety; deeper live-concurrency integration remains a placeholder.
- [x] Validate the non-credential-dependent production-readiness changes, save a new checkpoint, and deliver a truthful completion report that lists deferred integrations.
- [x] Keep the supplied external payment, notification, and carrier credentials deferred; do not claim those integrations are active.
- [x] Do not modify the existing visual system unnecessarily; preserve responsive behavior, themes, accessibility, and reduced-motion support.
- [x] Complete the previously requested read-only audit report follow-up only if explicitly requested; do not treat it as application feature work.
- [x] Verify existing database connection, migration state, and live row counts before applying any new schema migration.
- [x] Add a lightweight configuration test that reports payment, notification, and shipping providers as unavailable when credentials are absent.
- [x] Provide regression coverage for the local role, stock, coupon, and checkout safety paths; full live-session concurrency coverage remains a placeholder.
- [x] Re-check current application types, tests, and route contracts after each production-readiness milestone.
- [x] Surface deferred online-payment availability in checkout and enforce the same guard server-side.
- [x] Run the complete regression suite and cross-theme, cross-viewport smoke verification before the release checkpoint.
- [x] Save the final production-readiness release checkpoint with deferred external integrations clearly documented.

> Note: External payment, notification, and carrier credentials remain intentionally deferred and are not represented as active integrations.

- [x] Run and document smoke verification for key customer and admin routes in both light and dark themes at desktop and mobile viewports before checkpointing.
- [x] Capture validation evidence beyond checkout for home, shop/product discovery, cart, account/orders, and admin routes.

- [x] Upgrade the customer return request form and admin return workbench to display and validate item-level return quantities.

> Migration verification evidence: the live ledger currently reports one applied migration hash matching `drizzle/0000_pale_warstar.sql`; the repository journal contains four ordered migrations through `0003_cool_spirit.sql`. No new migration was applied during this validation.

- [x] Leave remaining repository migrations as an approval-gated database placeholder; do not apply them without explicit approval.

- [x] Reconcile the release scope so local storefront, checkout, returns, inventory, admin, and SEO flows remain usable without external API credentials.
- [x] Add clear in-product placeholder states and documentation for deferred payment, notification, shipping APIs, and migration-sensitive database setup.
- [x] Validate the stable local-functionality release and save a checkpoint without applying unapproved database migrations.

- [x] Add a second local variant row to the admin product creation workflow using the existing atomic product transaction.
- [x] Add explicit all, low-stock, and out-of-stock inventory filters with empty-state feedback.
- [x] Restart the development service to clear stale transform diagnostics and confirm the current source has unique return exports.
- [x] Re-run the full Vitest and TypeScript validation after the latest admin changes.
