import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { StorefrontLayout } from "@/components/StorefrontLayout";
import { pkr } from "@/components/ProductCard";
import { trpc } from "@/lib/trpc";
import { luxuryEase, microSpring } from "@/lib/motion";

export default function Cart() {
  const utils = trpc.useUtils();
  const cart = trpc.cart.get.useQuery();
  const update = trpc.cart.updateQuantity.useMutation({
    onSuccess: () => utils.cart.get.invalidate(),
    onError: error => toast.error(error.message),
  });
  if (cart.isLoading)
    return (
      <StorefrontLayout>
        <div className="site-container cart-page cart-page--loading">
          <div className="skeleton-line skeleton-line--short" />
          <div className="skeleton-line skeleton-line--title" />
          <div className="cart-layout" style={{ marginTop: 30 }}>
            <div className="cart-skeleton">
              <div />
              <span />
              <span />
            </div>
            <div className="summary-card">
              <div
                className="skeleton-line"
                style={{ height: 24, width: "45%" }}
              />
              <div
                className="skeleton-line"
                style={{ height: 16, marginTop: 24 }}
              />
              <div
                className="skeleton-line"
                style={{ height: 16, marginTop: 16 }}
              />
            </div>
          </div>
        </div>
      </StorefrontLayout>
    );
  if (!cart.data?.items.length)
    return (
      <StorefrontLayout>
        <div className="site-container cart-page">
          <h1 className="display catalog-title">Your bag</h1>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45, ease: luxuryEase }}
            className="empty-state flex flex-col items-center justify-center text-center p-12"
            style={{ marginTop: 28 }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="mb-4 text-muted"
            >
              <ShoppingBag size={48} strokeWidth={1.5} />
            </motion.div>
            <h3 className="text-xl font-semibold mb-2">Your bag is empty</h3>
            <p className="text-muted max-w-sm mb-6">
              Your bag is waiting for a pair with a story. Explore our handcrafted collection.
            </p>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link className="button-primary" href="/shop">
                Explore the collection
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </StorefrontLayout>
    );
  return (
    <StorefrontLayout>
      <div className="site-container cart-page">
        <div className="breadcrumb">
          <Link href="/shop">Shop</Link> / Your bag
        </div>
        <div className="checkout-progress" aria-label="Checkout progress">
          <span className="checkout-progress__active">1. Bag</span>
          <i />
          <span>2. Delivery</span>
          <i />
          <span>3. Confirmation</span>
        </div>
        <h1 className="display catalog-title">Your bag</h1>
        <div className="cart-layout" style={{ marginTop: 30 }}>
          <div>
            <AnimatePresence mode="popLayout">
              {cart.data.items.map(row => (
                <motion.article
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.35, ease: luxuryEase }}
                  className="cart-item overflow-hidden"
                  key={row.item.id}
                >
                  {row.image ? (
                    <img
                      loading="lazy"
                      className="cart-item__image"
                      src={row.image}
                      alt={row.product.name}
                    />
                  ) : (
                    <div className="cart-item__image product-card__image--empty">
                      Image
                    </div>
                  )}
                  <div>
                    <h3>{row.product.name}</h3>
                    <p>
                      {row.variant.color} · Size {row.variant.size}
                    </p>
                    {row.available < row.item.quantity && (
                      <span className="stock-empty cart-stock-warning">
                        Only {row.available} currently available
                      </span>
                    )}
                    <p
                      style={{
                        marginTop: 10,
                        fontWeight: 700,
                        color: "var(--ink)",
                      }}
                    >
                      {pkr(row.finalPrice)}{" "}
                      {row.finalPrice < row.regularPrice && (
                        <span className="price-old">{pkr(row.regularPrice)}</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <div className="quantity-stepper">
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        disabled={update.isPending || row.item.quantity <= 1}
                        onClick={() =>
                          update.mutate({
                            itemId: row.item.id,
                            quantity: row.item.quantity - 1,
                          })
                        }
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </motion.button>
                      <motion.span
                        key={row.item.quantity}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={microSpring}
                      >
                        {row.item.quantity}
                      </motion.span>
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        disabled={
                          update.isPending || row.item.quantity >= row.available
                        }
                        onClick={() =>
                          update.mutate({
                            itemId: row.item.id,
                            quantity: row.item.quantity + 1,
                          })
                        }
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </motion.button>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="button-text"
                      style={{ marginTop: 13, color: "var(--clay)" }}
                      disabled={update.isPending}
                      onClick={() =>
                        update.mutate({ itemId: row.item.id, quantity: 0 })
                      }
                    >
                      <Trash2 size={14} /> Remove
                    </motion.button>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
            <Link className="button-text inline-flex items-center gap-1.5" href="/shop">
              <ArrowLeft size={15} /> Continue shopping
            </Link>
          </div>
          <aside className="summary-card cart-summary">
            <h3>Order summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{pkr(cart.data.subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Product savings</span>
              <span className="price-sale">− {pkr(cart.data.savings)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="summary-row summary-row--total">
              <span>Estimated total</span>
              <span>{pkr(cart.data.subtotal)}</span>
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link className="button-primary block text-center" href="/checkout">
                Secure checkout
              </Link>
            </motion.div>
            <p
              style={{
                margin: "14px 0 0",
                color: "var(--muted)",
                fontSize: 11,
                lineHeight: 1.5,
              }}
            >
              All prices include Pakistani applicable taxes. Delivery timelines
              are confirmed on the next step.
            </p>
          </aside>
        </div>
      </div>
    </StorefrontLayout>
  );
}
