import { CheckCircle2, MapPin, Package, ShieldCheck, Truck, ArrowRight, Sparkles, Building2, Phone, Mail, ShoppingBag } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { StorefrontLayout } from "@/components/StorefrontLayout";
import { pkr } from "@/components/ProductCard";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getGuestCart, clearGuestCart, type GuestCartItem } from "@/lib/cartStorage";
import { motion } from "framer-motion";
import { luxuryEase } from "@/lib/motion";

const PAKISTANI_CITIES = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Rawalpindi",
  "Peshawar",
  "Quetta",
  "Multan",
  "Faisalabad",
  "Sialkot",
  "Gujranwala",
  "Hyderabad",
  "Abbottabad",
  "Bahawalpur",
  "Sargodha",
  "Gujrat",
  "Sukkur",
  "Mardan",
];

const PAKISTANI_PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Azad Jammu & Kashmir",
  "Gilgit-Baltistan",
];

export default function Checkout() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [couponDraft, setCouponDraft] = useState("");
  const [couponCode, setCouponCode] = useState<string | undefined>();
  const [addressId, setAddressId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [guestCart, setGuestCart] = useState<GuestCartItem[]>([]);
  const [orderPlaced, setOrderPlaced] = useState<{
    orderNumber: string;
    publicId: string;
    totalAmount: number;
    shippingAddress: any;
  } | null>(null);

  const [guestAddress, setGuestAddress] = useState({
    fullName: "",
    phone: "",
    email: "",
    city: "Lahore",
    province: "Punjab",
    addressLine: "",
    area: "",
    postalCode: "",
    deliveryInstructions: "",
  });

  // Load guest cart
  useEffect(() => {
    setGuestCart(getGuestCart());
    const handleSync = (e: any) => {
      if (e.detail) setGuestCart(e.detail);
      else setGuestCart(getGuestCart());
    };
    window.addEventListener("solecraft_cart_updated", handleSync);
    return () => window.removeEventListener("solecraft_cart_updated", handleSync);
  }, []);

  const quoteInput = useMemo(() => ({ couponCode }), [couponCode]);
  const addresses = trpc.account.addresses.useQuery(undefined, { enabled: isAuthenticated });
  const quote = trpc.checkout.quote.useQuery(quoteInput, { enabled: isAuthenticated });

  const placeOrder = trpc.checkout.placeOrder.useMutation({
    onSuccess: result => {
      toast.success(`Order ${result.orderNumber} placed successfully.`);
      navigate(`/account/orders?placed=${result.publicId}`);
    },
    onError: error => toast.error(error.message),
  });

  const guestPlaceOrder = trpc.checkout.guestPlaceOrder.useMutation({
    onSuccess: result => {
      clearGuestCart();
      setOrderPlaced({
        orderNumber: result.orderNumber,
        publicId: result.publicId,
        totalAmount: result.totalAmount,
        shippingAddress: result.shippingAddress,
      });
      toast.success(`Order ${result.orderNumber} placed successfully!`);
    },
    onError: error => toast.error(error.message),
  });

  // Calculate cart items & totals for guest or auth
  const guestSubtotal = useMemo(() => {
    return guestCart.reduce((sum, item) => {
      const price = Number(
        item.variant.salePriceOverride ??
          item.product.salePrice ??
          item.variant.priceOverride ??
          item.product.basePrice
      );
      return sum + price * item.quantity;
    }, 0);
  }, [guestCart]);

  const guestShippingFee = guestSubtotal >= 4000 ? 0 : 250;
  const guestDiscount = couponCode ? Math.round(guestSubtotal * 0.1) : 0;
  const guestTotal = Math.max(0, guestSubtotal + guestShippingFee - guestDiscount);

  const hasItems = isAuthenticated
    ? (quote.data?.items.length ?? 0) > 0 || guestCart.length > 0
    : guestCart.length > 0;

  const selectedAddress =
    addressId ?? addresses.data?.find(address => address.isDefault === 1)?.id;

  // Order Confirmation View
  if (orderPlaced) {
    return (
      <StorefrontLayout
        seo={{
          title: `Order Confirmed: ${orderPlaced.orderNumber} | SoleCraft`,
          description: "Thank you for your order with SoleCraft.",
        }}
      >
        <div className="site-container py-12 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: luxuryEase }}
            className="p-8 md:p-10 rounded-3xl bg-[var(--paper)] border border-[var(--line)] shadow-sm text-center space-y-6"
          >
            <div className="w-16 h-16 rounded-full bg-[var(--surface-tint)] text-[var(--moss)] flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--moss)]">
                Handcrafting Underway
              </span>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-[var(--ink)] mt-1">
                Thank You For Your Order
              </h1>
              <p className="text-xs md:text-sm text-[var(--muted)] mt-2">
                Order Reference: <strong className="text-[var(--ink)]">{orderPlaced.orderNumber}</strong>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Payment Mode:</span>
                <strong className="text-[var(--ink)]">Cash on Delivery (COD)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Amount Payable:</span>
                <strong className="text-[var(--ink)]">{pkr(orderPlaced.totalAmount)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Recipient:</span>
                <span className="text-[var(--ink)]">{orderPlaced.shippingAddress.fullName} ({orderPlaced.shippingAddress.phone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Destination:</span>
                <span className="text-[var(--ink)]">{orderPlaced.shippingAddress.addressLine}, {orderPlaced.shippingAddress.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Estimated Delivery:</span>
                <span className="text-[var(--moss)] font-semibold">2–3 Business Days (TCS / Trax)</span>
              </div>
            </div>

            <div className="text-xs text-[var(--muted)] flex items-center justify-center gap-2">
              <ShieldCheck size={16} className="text-[var(--moss)]" />
              <span>Open Parcel Inspection Authorized on Delivery</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <a
                href={`https://wa.me/923008459200?text=Hello%20SoleCraft%20Atelier,%20I%20have%20placed%20order%20${orderPlaced.orderNumber}.`}
                target="_blank"
                rel="noreferrer"
                className="button-secondary text-xs py-3 px-6 flex items-center justify-center gap-2"
              >
                <span>Track on WhatsApp Concierge</span>
              </a>
              <Link href="/shop" className="button-primary text-xs py-3 px-6 text-center">
                <span>Continue Shopping</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </StorefrontLayout>
    );
  }

  // Loading state
  if (isAuthenticated && quote.isLoading) {
    return (
      <StorefrontLayout>
        <div className="site-container py-12">
          <div className="empty-state p-12 text-center bg-[var(--paper)] rounded-2xl border border-[var(--line)]">
            <p className="text-xs text-[var(--muted)]">Preparing your checkout quote…</p>
          </div>
        </div>
      </StorefrontLayout>
    );
  }

  // Empty cart state
  if (!hasItems) {
    return (
      <StorefrontLayout>
        <div className="site-container checkout-page py-12">
          <div className="empty-state p-12 text-center bg-[var(--paper)] rounded-2xl border border-[var(--line)] max-w-lg mx-auto">
            <ShoppingBag size={40} className="text-[var(--muted)] mx-auto mb-3" />
            <h2 className="font-serif text-2xl font-bold text-[var(--ink)] mb-2">
              Your bag is currently empty
            </h2>
            <p className="text-xs text-[var(--muted)] mb-6">
              Select a handcrafted pair from our collection before proceeding to checkout.
            </p>
            <Link className="button-primary text-xs py-2.5 px-6 inline-block" href="/shop">
              Explore Footwear Edit
            </Link>
          </div>
        </div>
      </StorefrontLayout>
    );
  }

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestAddress.fullName || !guestAddress.phone || !guestAddress.addressLine) {
      toast.error("Please fill in your delivery name, phone, and complete street address.");
      return;
    }

    guestPlaceOrder.mutate({
      shippingAddress: guestAddress,
      paymentMethod,
      couponCode,
      totalAmount: guestTotal,
      itemsCount: guestCart.reduce((sum, i) => sum + i.quantity, 0),
    });
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddress) {
      toast.error("Please choose or add a delivery address.");
      return;
    }
    placeOrder.mutate({
      idempotencyKey,
      addressId: selectedAddress,
      paymentMethod,
      couponCode,
    });
  };

  return (
    <StorefrontLayout
      seo={{
        title: "Secure Checkout | SoleCraft Footwear",
        description: "Complete your handcrafted Pakistani footwear order.",
      }}
    >
      <div className="site-container checkout-page py-10">
        <div className="breadcrumb mb-4">
          <Link href="/cart">Your Bag</Link> / <span>Checkout</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="eyebrow">Direct Atelier Fulfillment</span>
            <h1 className="display text-3xl md:text-5xl font-serif font-bold text-[var(--ink)] mt-1">
              Complete Your Order
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--moss)] bg-[var(--surface-tint)] py-1.5 px-3 rounded-full border border-[var(--line)]">
            <ShieldCheck size={14} />
            <span>Open Parcel Inspection on COD</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Delivery Details Form */}
          <div className="lg:col-span-7 space-y-8">
            {isAuthenticated ? (
              /* Authenticated User Saved Addresses */
              <section className="p-6 rounded-2xl bg-[var(--paper)] border border-[var(--line)] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-xl font-bold text-[var(--ink)]">
                    1. Select Delivery Address
                  </h2>
                  <Link href="/account/addresses" className="text-xs text-[var(--moss)] font-semibold hover:underline">
                    Manage Addresses
                  </Link>
                </div>

                {addresses.data?.length ? (
                  <div className="space-y-3">
                    {addresses.data.map(address => (
                      <label
                        key={address.id}
                        className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                          selectedAddress === address.id
                            ? "border-[var(--moss)] bg-[var(--surface-tint)]/40 shadow-sm"
                            : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--muted)]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="deliveryAddress"
                          checked={selectedAddress === address.id}
                          onChange={() => setAddressId(address.id)}
                          className="mt-1"
                        />
                        <div className="text-xs space-y-1">
                          <strong className="text-[var(--ink)] block text-sm">
                            {address.fullName} ({address.label})
                          </strong>
                          <p className="text-[var(--muted)]">
                            {address.addressLine}, {address.city}, {address.province}
                          </p>
                          <p className="text-[var(--ink)] font-medium">
                            Phone: {address.phone}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-xl bg-[var(--surface)] text-center text-xs space-y-3">
                    <p className="text-[var(--muted)]">No delivery address found on your account.</p>
                    <Link href="/account/addresses" className="button-primary text-xs py-2 px-4 inline-block">
                      Add Delivery Address
                    </Link>
                  </div>
                )}
              </section>
            ) : (
              /* Guest Checkout Delivery Form */
              <form onSubmit={handleGuestSubmit} className="p-6 rounded-2xl bg-[var(--paper)] border border-[var(--line)] shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-[var(--ink)]">
                      1. Delivery Information
                    </h2>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      Enter your address for fast courier delivery across Pakistan.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-[var(--ink)] block mb-1">
                      Recipient Full Name *
                    </label>
                    <input
                      value={guestAddress.fullName}
                      onChange={e => setGuestAddress({ ...guestAddress, fullName: e.target.value })}
                      placeholder="e.g. Tariq Mehmood"
                      className="auth-input text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[var(--ink)] block mb-1">
                      Mobile Phone Number *
                    </label>
                    <input
                      value={guestAddress.phone}
                      onChange={e => setGuestAddress({ ...guestAddress, phone: e.target.value })}
                      placeholder="0300 1234567"
                      className="auth-input text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-[var(--ink)] block mb-1">
                      Email Address (For Tracking Updates)
                    </label>
                    <input
                      type="email"
                      value={guestAddress.email}
                      onChange={e => setGuestAddress({ ...guestAddress, email: e.target.value })}
                      placeholder="tariq@example.com"
                      className="auth-input text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[var(--ink)] block mb-1">
                      City *
                    </label>
                    <select
                      value={guestAddress.city}
                      onChange={e => setGuestAddress({ ...guestAddress, city: e.target.value })}
                      className="auth-input text-xs"
                    >
                      {PAKISTANI_CITIES.map(c => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-[var(--ink)] block mb-1">
                      Province *
                    </label>
                    <select
                      value={guestAddress.province}
                      onChange={e => setGuestAddress({ ...guestAddress, province: e.target.value })}
                      className="auth-input text-xs"
                    >
                      {PAKISTANI_PROVINCES.map(p => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[var(--ink)] block mb-1">
                      Area / Sector
                    </label>
                    <input
                      value={guestAddress.area}
                      onChange={e => setGuestAddress({ ...guestAddress, area: e.target.value })}
                      placeholder="e.g. Gulberg III, DHA Phase 5"
                      className="auth-input text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--ink)] block mb-1">
                    Complete Street Address (House #, Street #, Landmark) *
                  </label>
                  <input
                    value={guestAddress.addressLine}
                    onChange={e => setGuestAddress({ ...guestAddress, addressLine: e.target.value })}
                    placeholder="House 12-A, Street 4, Near Commercial Market"
                    className="auth-input text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--ink)] block mb-1">
                    Special Delivery Instructions
                  </label>
                  <input
                    value={guestAddress.deliveryInstructions}
                    onChange={e => setGuestAddress({ ...guestAddress, deliveryInstructions: e.target.value })}
                    placeholder="e.g. Call before arrival, leave with security"
                    className="auth-input text-xs"
                  />
                </div>
              </form>
            )}

            {/* Payment Method Selector */}
            <section className="p-6 rounded-2xl bg-[var(--paper)] border border-[var(--line)] shadow-sm space-y-4">
              <h2 className="font-serif text-xl font-bold text-[var(--ink)]">
                2. Payment Method
              </h2>

              <div className="space-y-3">
                <label
                  className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    paymentMethod === "cod"
                      ? "border-[var(--moss)] bg-[var(--surface-tint)]/40 shadow-sm"
                      : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--muted)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="mt-1"
                  />
                  <div className="text-xs space-y-1">
                    <strong className="text-[var(--ink)] block text-sm">
                      Cash on Delivery (COD) — Recommended
                    </strong>
                    <p className="text-[var(--muted)]">
                      Pay cash to the courier rider upon delivery at your doorstep. Open parcel inspection authorized.
                    </p>
                  </div>
                </label>

                <label
                  className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    paymentMethod === "online"
                      ? "border-[var(--moss)] bg-[var(--surface-tint)]/40 shadow-sm"
                      : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--muted)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={paymentMethod === "online"}
                    onChange={() => setPaymentMethod("online")}
                    className="mt-1"
                  />
                  <div className="text-xs space-y-1">
                    <strong className="text-[var(--ink)] block text-sm">
                      Online Debit / Credit Card
                    </strong>
                    <p className="text-[var(--muted)]">
                      Pay securely with Visa, Mastercard, or UnionPay.
                    </p>
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* Right Column: Order Summary & Place Order */}
          <div className="lg:col-span-5">
            <div className="p-6 rounded-2xl bg-[var(--paper)] border border-[var(--line)] shadow-sm space-y-6 sticky top-24">
              <h3 className="font-serif text-xl font-bold text-[var(--ink)] pb-3 border-b border-[var(--line)]">
                Order Summary
              </h3>

              {/* Items List */}
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {isAuthenticated && quote.data?.items ? (
                  quote.data.items.map(row => (
                    <div key={row.variant.id} className="flex items-center gap-3 text-xs">
                      {row.image && (
                        <img
                          src={row.image}
                          alt={row.product.name}
                          className="w-12 h-12 object-cover rounded-lg bg-[var(--surface)] flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[var(--ink)] truncate">{row.product.name}</h4>
                        <p className="text-[var(--muted)]">
                          Size {row.variant.size} • Qty {row.item.quantity}
                        </p>
                      </div>
                      <strong className="text-[var(--ink)] flex-shrink-0">
                        {pkr(row.finalPrice * row.item.quantity)}
                      </strong>
                    </div>
                  ))
                ) : (
                  guestCart.map(item => {
                    const price = Number(
                      item.variant.salePriceOverride ??
                        item.product.salePrice ??
                        item.variant.priceOverride ??
                        item.product.basePrice
                    );
                    return (
                      <div key={item.variantId} className="flex items-center gap-3 text-xs">
                        {item.product.image && (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded-lg bg-[var(--surface)] flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-[var(--ink)] truncate">{item.product.name}</h4>
                          <p className="text-[var(--muted)]">
                            Size {item.variant.size} • Qty {item.quantity}
                          </p>
                        </div>
                        <strong className="text-[var(--ink)] flex-shrink-0">
                          {pkr(price * item.quantity)}
                        </strong>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Coupon Code Field */}
              <div className="pt-4 border-t border-[var(--line)]">
                <div className="flex gap-2">
                  <input
                    value={couponDraft}
                    onChange={e => setCouponDraft(e.target.value)}
                    placeholder="Coupon code (e.g. SOLE10)"
                    className="auth-input text-xs py-2 flex-1 uppercase"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!couponDraft.trim()) return;
                      setCouponCode(couponDraft.trim());
                      toast.success(`Coupon "${couponDraft.trim()}" applied!`);
                    }}
                    className="button-secondary text-xs py-2 px-3 flex-shrink-0"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Totals Breakdown */}
              <div className="space-y-2 text-xs pt-4 border-t border-[var(--line)]">
                <div className="flex justify-between text-[var(--muted)]">
                  <span>Subtotal</span>
                  <span>{pkr(isAuthenticated ? quote.data?.subtotal ?? 0 : guestSubtotal)}</span>
                </div>
                <div className="flex justify-between text-[var(--muted)]">
                  <span>Nationwide Courier Shipping</span>
                  <span>
                    {(isAuthenticated ? quote.data?.shippingAmount ?? 0 : guestShippingFee) === 0 ? (
                      <strong className="text-[var(--moss)]">FREE</strong>
                    ) : (
                      pkr(isAuthenticated ? quote.data?.shippingAmount ?? 0 : guestShippingFee)
                    )}
                  </span>
                </div>
                {(isAuthenticated ? quote.data?.couponDiscount ?? 0 : guestDiscount) > 0 && (
                  <div className="flex justify-between text-[var(--moss)] font-semibold">
                    <span>Discount</span>
                    <span>-{pkr(isAuthenticated ? quote.data?.couponDiscount ?? 0 : guestDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-serif font-bold text-[var(--ink)] pt-3 border-t border-[var(--line)]">
                  <span>Total</span>
                  <span>{pkr(isAuthenticated ? quote.data?.total ?? 0 : guestTotal)}</span>
                </div>
              </div>

              {/* Submit CTA Button */}
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleAuthSubmit}
                  disabled={placeOrder.isPending || !selectedAddress}
                  className="button-primary w-full py-3.5 text-xs font-semibold flex items-center justify-center gap-2"
                >
                  {placeOrder.isPending ? (
                    "Confirming Order…"
                  ) : (
                    <>
                      <span>Place Cash on Delivery Order</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleGuestSubmit}
                  disabled={guestPlaceOrder.isPending}
                  className="button-primary w-full py-3.5 text-xs font-semibold flex items-center justify-center gap-2"
                >
                  {guestPlaceOrder.isPending ? (
                    "Confirming Order…"
                  ) : (
                    <>
                      <span>Place Cash on Delivery Order</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              )}

              <div className="flex items-center justify-center gap-2 text-[11px] text-[var(--muted)]">
                <Truck size={14} className="text-[var(--moss)]" />
                <span>Delivered via TCS / Trax in 2–3 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
