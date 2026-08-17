import {
  ArrowRight,
  MapPin,
  Package,
  Heart,
  User,
  Shield,
  Ruler,
  Phone,
  Mail,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";
import { AccountLayout } from "@/components/AccountLayout";
import { pkr } from "@/components/ProductCard";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { motion } from "framer-motion";
import { luxuryEase, microSpring } from "@/lib/motion";

export default function Account() {
  const { user } = useAuth();
  const orders = trpc.account.orders.useQuery();
  const addresses = trpc.account.addresses.useQuery();
  const profile = trpc.account.profile.useQuery();
  const wishlist = trpc.wishlist.get.useQuery(undefined, { enabled: Boolean(user) });
  const utils = trpc.useUtils();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    preferredSize: "42",
    marketingOptIn: false,
  });

  useEffect(() => {
    if (profile.data)
      setForm({
        fullName:
          profile.data.profile?.fullName ?? profile.data.user.name ?? "",
        phone: profile.data.profile?.phone ?? "",
        preferredSize: "42",
        marketingOptIn: profile.data.profile?.marketingOptIn === 1,
      });
  }, [profile.data]);

  const saveProfile = trpc.account.saveProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile & preferences updated successfully.");
      utils.account.profile.invalidate();
    },
    onError: error => toast.error(error.message),
  });

  const userName =
    profile.data?.profile?.fullName ||
    profile.data?.user.name ||
    user?.name ||
    "SoleCraft Patron";

  const userEmail = profile.data?.user.email || user?.email || "";
  const initials = userName
    .split(" ")
    .map(n => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <AccountLayout title="Customer Dashboard">
      {/* User Header Profile Card */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[var(--moss)] text-white font-serif text-2xl font-bold flex items-center justify-center shadow-sm flex-shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl font-bold text-[var(--ink)]">
                {userName}
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--surface-tint)] text-[var(--moss)] border border-[var(--line)]">
                {user?.role === "super_admin" || user?.role === "admin"
                  ? "Admin"
                  : "Circle Member"}
              </span>
            </div>
            <p className="text-xs text-[var(--muted)] mt-0.5">{userEmail}</p>
            <p className="text-[11px] text-[var(--muted)] mt-1 flex items-center gap-1">
              <Sparkles size={12} className="text-[var(--clay)]" />
              <span>Complimentary nationwide delivery on all orders over PKR 4,000</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Link
            href="/shop"
            className="button-primary text-xs py-2 px-4 flex-1 md:flex-none text-center"
          >
            Explore Catalog
          </Link>
        </div>
      </div>

      {/* 3 Overview Quick Stats */}
      <div className="account-stat-grid mb-8">
        <Link href="/account/orders" className="account-stat cursor-pointer hover:border-[var(--moss)] transition-colors">
          <Package size={18} />
          <span>{orders.data?.length ?? 0}</span>
          <small>Orders Placed</small>
        </Link>
        <Link href="/account/addresses" className="account-stat cursor-pointer hover:border-[var(--moss)] transition-colors">
          <MapPin size={18} />
          <span>{addresses.data?.length ?? 0}</span>
          <small>Saved Addresses</small>
        </Link>
        <Link href="/wishlist" className="account-stat cursor-pointer hover:border-[var(--moss)] transition-colors">
          <Heart size={18} />
          <span>{wishlist.data?.length ?? 0}</span>
          <small>Saved Wishlist Pairs</small>
        </Link>
      </div>

      {/* Profile Details Form */}
      <section className="account-section profile-card mb-8">
        <div className="section-head mb-6">
          <div>
            <span className="eyebrow">Personal Details &amp; Sizing</span>
            <h2 className="display section-title" style={{ fontSize: 26 }}>
              Your Account Profile
            </h2>
          </div>
        </div>

        <form
          className="address-form space-y-4"
          onSubmit={event => {
            event.preventDefault();
            saveProfile.mutate({
              fullName: form.fullName,
              phone: form.phone || undefined,
              marketingOptIn: form.marketingOptIn,
            });
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-xs font-medium text-[var(--ink)] block">
              Full Name *
              <input
                className="auth-input mt-1"
                value={form.fullName}
                onChange={event =>
                  setForm({ ...form, fullName: event.target.value })
                }
                required
              />
            </label>

            <label className="text-xs font-medium text-[var(--ink)] block">
              Mobile Number
              <input
                className="auth-input mt-1"
                value={form.phone}
                onChange={event =>
                  setForm({ ...form, phone: event.target.value })
                }
                placeholder="0300 1234567"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-xs font-medium text-[var(--ink)] block">
              Email Address
              <input
                className="auth-input mt-1 bg-[var(--surface)] opacity-80 cursor-not-allowed"
                value={userEmail}
                disabled
              />
            </label>

            <label className="text-xs font-medium text-[var(--ink)] block">
              Preferred Footwear Size
              <select
                className="auth-input mt-1"
                value={form.preferredSize}
                onChange={e => setForm({ ...form, preferredSize: e.target.value })}
              >
                <option value="39">PK / EU 39 (UK 6)</option>
                <option value="40">PK / EU 40 (UK 6.5)</option>
                <option value="41">PK / EU 41 (UK 7.5)</option>
                <option value="42">PK / EU 42 (UK 8.5)</option>
                <option value="43">PK / EU 43 (UK 9.5)</option>
                <option value="44">PK / EU 44 (UK 10.5)</option>
                <option value="45">PK / EU 45 (UK 11.5)</option>
                <option value="46">PK / EU 46 (UK 12.5)</option>
              </select>
            </label>
          </div>

          <label className="checkbox-label text-xs text-[var(--muted)] flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              checked={form.marketingOptIn}
              onChange={event =>
                setForm({ ...form, marketingOptIn: event.target.checked })
              }
            />
            <span>Receive private release previews, festive offers, and craft notes.</span>
          </label>

          <div className="pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="button-primary text-xs py-2.5 px-6"
              type="submit"
              disabled={saveProfile.isPending}
            >
              {saveProfile.isPending ? "Saving changes…" : "Save Profile Details"}
            </motion.button>
          </div>
        </form>
      </section>

      {/* Recent Orders Section */}
      <section className="account-section">
        <div className="section-head mb-4 flex items-center justify-between">
          <div>
            <span className="eyebrow">Your Movement</span>
            <h2 className="display section-title" style={{ fontSize: 26 }}>
              Recent Orders
            </h2>
          </div>
          <Link className="button-text text-xs flex items-center gap-1" href="/account/orders">
            <span>View All Orders</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {orders.data?.length ? (
          <div className="account-list space-y-3">
            {orders.data.slice(0, 3).map(order => (
              <Link
                className="account-list__row p-4 rounded-xl bg-[var(--paper)] border border-[var(--line)] shadow-sm hover:border-[var(--moss)] transition-colors flex items-center justify-between"
                href={`/account/orders/${order.publicId}`}
                key={order.id}
              >
                <div>
                  <strong className="text-sm font-semibold text-[var(--ink)] block">
                    {order.orderNumber}
                  </strong>
                  <small className="text-xs text-[var(--muted)]">
                    {new Date(order.placedAt).toLocaleDateString("en-PK", {
                      dateStyle: "medium",
                    })}
                  </small>
                </div>
                <span className="status-pill text-xs px-2.5 py-1 rounded-full bg-[var(--surface-tint)] text-[var(--moss)] font-medium">
                  {order.status.replaceAll("_", " ")}
                </span>
                <strong className="text-sm font-bold text-[var(--ink)]">
                  {pkr(order.totalAmount)}
                </strong>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state p-8 rounded-xl bg-[var(--paper)] border border-[var(--line)] text-center">
            <p className="text-xs text-[var(--muted)] mb-3">
              You haven't placed any handcrafted orders yet.
            </p>
            <Link className="button-primary text-xs py-2 px-4" href="/shop">
              Browse Footwear Edit
            </Link>
          </div>
        )}
      </section>
    </AccountLayout>
  );
}
