import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2, ShieldCheck, Truck } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { StorefrontLayout } from "@/components/StorefrontLayout";
import { pkr } from "@/components/ProductCard";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  getGuestCart,
  updateGuestCartQuantity,
  removeGuestCartItem,
  GuestCartItem,
} from "@/lib/cartStorage";
import { useEffect, useState } from "react";
import { luxuryEase, microSpring } from "@/lib/motion";

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const serverCart = trpc.cart.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const [guestItems, setGuestItems] = useState<GuestCartItem[]>(() => getGuestCart());

  useEffect(() => {
    const syncGuest = () => setGuestItems(getGuestCart());
    window.addEventListener("solecraft_cart_updated", syncGuest);
    window.addEventListener("storage", syncGuest);
    return () => {
      window.removeEventListener("solecraft_cart_updated", syncGuest);
      window.removeEventListener("storage", syncGuest);
    };
  }, []);

  const updateServer = trpc.cart.updateQuantity.useMutation({
    onSuccess: () => utils.cart.get.invalidate(),
    onError: error => toast.error(error.message),
  });

  // Merge items based on auth state
  const isServerCart = isAuthenticated && (serverCart.data?.items?.length ?? 0) > 0;
  
  const displayItems = isServerCart
    ? serverCart.data!.items.map(row => ({
        id: row.item.id,
        variantId: row.variant.id,
        name: row.product.name,
        color: row.variant.color,
        size: row.variant.size,
        image: row.image,
        quantity: row.item.quantity,
        salePrice: Number(row.finalPrice),
        regularPrice: Number(row.regularPrice),
        available: row.available,
      }))
    : guestItems.map(item => {
        const sale = Number(
          item.variant.salePriceOverride ??
            item.product.salePrice ??
            item.variant.priceOverride ??
            item.product.basePrice
        );
        const regular = Number(
          item.variant.priceOverride ?? item.product.basePrice
        );
        return {
          id: item.variantId,
          variantId: item.variantId,
          name: item.product.name,
          color: item.variant.color,
          size: item.variant.size,
          image: item.variant.imageUrl || item.product.image,
          quantity: item.quantity,
          salePrice: sale,
          regularPrice: regular,
          available: 10,
        };
      });

  const subtotal = displayItems.reduce(
    (sum, i) => sum + i.salePrice * i.quantity,
    0
  );
  const totalRegular = displayItems.reduce(
    (sum, i) => sum + i.regularPrice * i.quantity,
    0
  );
  const savings = Math.max(0, totalRegular - subtotal);
  const isFreeDelivery = subtotal >= 4000;
  const deliveryFee = isFreeDelivery ? 0 : 250;
  const grandTotal = subtotal + deliveryFee;

  const handleUpdateQuantity = (
    item: { id: number; variantId: number; quantity: number },
    newQty: number
  ) => {
    if (isAuthenticated && isServerCart) {
      updateServer.mutate({ itemId: item.id, quantity: newQty });
    } else {
      updateGuestCartQuantity(item.variantId, newQty);
    }
  };

  const handleRemove = (item: { id: number; variantId: number }) => {
    if (isAuthenticated && isServerCart) {
      updateServer.mutate({ itemId: item.id, quantity: 0 });
    } else {
      removeGuestCartItem(item.variantId);
      toast.success("Removed from bag");
    }
  };

  if (isAuthenticated && serverCart.isLoading) {
    return (
      <StorefrontLayout>
        <div className="site-container cart-page cart-page--loading py-10">
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
            </div>
          </div>
        </div>
      </StorefrontLayout>
    );
  }

  if (displayItems.length === 0) {
    return (
      <StorefrontLayout>
        <div className="site-container cart-page py-10">
          <h1 className="display catalog-title">Your bag</h1>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45, ease: luxuryEase }}
            className="empty-state flex flex-col items-center justify-center text-center p-12 bg-[var(--paper)] rounded-xl border border-[var(--line)] shadow-sm"
            style={{ marginTop: 28 }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="mb-4 text-[var(--muted)]"
            >
              <ShoppingBag size={52} strokeWidth={1.5} />
            </motion.div>
            <h3 className="text-xl font-semibold mb-2 text-[var(--ink)]">Your bag is empty</h3>
            <p className="text-[var(--muted)] max-w-sm mb-6 text-xs leading-relaxed">
              Your bag is waiting for a pair with an artisanal story. Explore our handcrafted Pakistani footwear collection.
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
  }

  return (
    <StorefrontLayout
      seo={{
        title: `Your Bag (${displayItems.length} items) | SoleCraft Pakistan`,
        description: "Review your selected handcrafted footwear before secure checkout.",
      }}
    >
      <div className="site-container cart-page py-10">
        <div className="breadcrumb mb-4">
          <Link href="/shop">Shop</Link> / <span>Your bag</span>
        </div>

        <div className="checkout-progress mb-8" aria-label="Checkout progress">
          <span className="checkout-progress__active">1. Bag</span>
          <i />
          <span>2. Delivery &amp; Details</span>
          <i />
          <span>3. Confirmation</span>
        </div>

        <h1 className="display catalog-title">Your bag</h1>

        <div className="cart-layout" style={{ marginTop: 24 }}>
          <div>
            <AnimatePresence mode="popLayout">
              {displayItems.map(row => (
                <motion.article
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.35, ease: luxuryEase }}
                  className="cart-item overflow-hidden bg-[var(--paper)] p-4 rounded-xl border border-[var(--line)] shadow-sm mb-4"
                  key={row.variantId}
                >
                  {row.image ? (
                    <img
                      loading="lazy"
                      className="cart-item__image rounded-lg object-cover"
                      src={row.image}
                      alt={row.name}
                    />
                  ) : (
                    <div className="cart-item__image product-card__image--empty rounded-lg">
                      Pair
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base text-[var(--ink)] truncate">{row.name}</h3>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      {row.color} · Size {row.size}
                    </p>
                    <p
                      style={{
                        marginTop: 10,
                        fontWeight: 700,
                        color: "var(--ink)",
                      }}
                    >
                      {pkr(row.salePrice)}{" "}
                      {row.salePrice < row.regularPrice && (
                        <span className="price-old text-xs ml-1.5">{pkr(row.regularPrice)}</span>
                      )}
                    </p>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <div className="quantity-stepper">
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        disabled={row.quantity <= 1}
                        onClick={() => handleUpdateQuantity(row, row.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </motion.button>
                      <motion.span
                        key={row.quantity}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={microSpring}
                      >
                        {row.quantity}
                      </motion.span>
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        disabled={row.quantity >= row.available}
                        onClick={() => handleUpdateQuantity(row, row.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </motion.button>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="button-text text-xs flex items-center gap-1 mt-3 text-[var(--clay)]"
                      onClick={() => handleRemove(row)}
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </motion.button>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>

            <Link className="button-text inline-flex items-center gap-1.5 text-xs mt-4" href="/shop">
              <ArrowLeft size={15} /> Continue shopping
            </Link>
          </div>

          {/* Summary Sidebar */}
          <aside className="summary-card cart-summary bg-[var(--paper)] p-6 rounded-xl border border-[var(--line)] shadow-sm sticky top-28 h-fit">
            <h3 className="font-semibold text-lg text-[var(--ink)] mb-4">Order summary</h3>

            <div className="summary-row text-xs flex justify-between py-2 border-b border-[var(--line)]">
              <span className="text-[var(--muted)]">Subtotal</span>
              <span className="font-semibold text-[var(--ink)]">{pkr(subtotal)}</span>
            </div>

            {savings > 0 && (
              <div className="summary-row text-xs flex justify-between py-2 border-b border-[var(--line)]">
                <span className="text-[var(--moss)]">Artisan Offer Savings</span>
                <span className="font-semibold text-[var(--moss)]">− {pkr(savings)}</span>
              </div>
            )}

            <div className="summary-row text-xs flex justify-between py-2 border-b border-[var(--line)]">
              <span className="text-[var(--muted)]">Nationwide Delivery</span>
              <span className="font-semibold text-[var(--ink)]">
                {isFreeDelivery ? (
                  <span className="text-[var(--moss)]">FREE (Orders &gt; PKR 4,000)</span>
                ) : (
                  pkr(deliveryFee)
                )}
              </span>
            </div>

            <div className="summary-row summary-row--total flex justify-between py-3 my-2 text-base font-bold text-[var(--ink)]">
              <span>Estimated Total</span>
              <span className="text-[var(--moss)]">{pkr(grandTotal)}</span>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-4">
              <Link className="button-primary block text-center py-3 text-xs font-semibold" href="/checkout">
                Proceed to Checkout
              </Link>
            </motion.div>

            <div className="mt-6 pt-4 border-t border-[var(--line)] space-y-2 text-[11px] text-[var(--muted)]">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-[var(--moss)] flex-shrink-0" />
                <span>Cash on Delivery (COD) &amp; Open Parcel Inspection</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck size={14} className="text-[var(--moss)] flex-shrink-0" />
                <span>2-4 Days tracked delivery across 150+ cities</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </StorefrontLayout>
  );
}
