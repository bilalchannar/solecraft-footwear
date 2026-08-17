import { ArrowRight, MapPin, Package, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";
import { AccountLayout } from "@/components/AccountLayout";
import { pkr } from "@/components/ProductCard";
import { trpc } from "@/lib/trpc";

export default function Account() {
  const orders = trpc.account.orders.useQuery();
  const addresses = trpc.account.addresses.useQuery();
  const profile = trpc.account.profile.useQuery();
  const utils = trpc.useUtils();
  const [form, setForm] = useState({ fullName: "", phone: "", marketingOptIn: false });
  useEffect(() => { if (profile.data) setForm({ fullName: profile.data.profile?.fullName ?? profile.data.user.name ?? "", phone: profile.data.profile?.phone ?? "", marketingOptIn: profile.data.profile?.marketingOptIn === 1 }); }, [profile.data]);
  const saveProfile = trpc.account.saveProfile.useMutation({ onSuccess: () => { toast.success("Profile saved."); utils.account.profile.invalidate(); }, onError: error => toast.error(error.message) });
  return <AccountLayout title="Welcome back"><div className="account-stat-grid"><div className="account-stat"><Package size={18} /><span>{orders.data?.length ?? 0}</span><small>Orders placed</small></div><div className="account-stat"><MapPin size={18} /><span>{addresses.data?.length ?? 0}</span><small>Saved addresses</small></div><div className="account-stat"><Heart size={18} /><span>—</span><small>Saved pairs</small></div></div><section className="account-section profile-card"><div className="section-head"><div><span className="eyebrow">Account details</span><h2 className="display section-title" style={{ fontSize: 34 }}>Your profile</h2></div></div><form className="address-form" onSubmit={event => { event.preventDefault(); saveProfile.mutate({ fullName: form.fullName, phone: form.phone || undefined, marketingOptIn: form.marketingOptIn }); }}><label>Full name<input value={form.fullName} onChange={event => setForm({ ...form, fullName: event.target.value })} required /></label><label>Mobile number<input value={form.phone} onChange={event => setForm({ ...form, phone: event.target.value })} placeholder="03XXXXXXXXX" /></label><label className="checkbox-label"><input type="checkbox" checked={form.marketingOptIn} onChange={event => setForm({ ...form, marketingOptIn: event.target.checked })} /> Receive considered launches and private offers</label><button className="button-secondary" type="submit" disabled={saveProfile.isPending}>{saveProfile.isPending ? "Saving…" : "Save profile"}</button></form></section><section className="account-section"><div className="section-head"><div><span className="eyebrow">Your movement</span><h2 className="display section-title" style={{ fontSize: 34 }}>Recent orders</h2></div><Link className="button-text" href="/account/orders">All orders <ArrowRight size={15} /></Link></div>{orders.data?.length ? <div className="account-list">{orders.data.slice(0, 3).map(order => <Link className="account-list__row" href={`/account/orders/${order.publicId}`} key={order.id}><span><strong>{order.orderNumber}</strong><small>{new Date(order.placedAt).toLocaleDateString("en-PK", { dateStyle: "medium" })}</small></span><span className="status-pill">{order.status.replaceAll("_", " ")}</span><strong>{pkr(order.totalAmount)}</strong></Link>)}</div> : <div className="empty-state">Your order history will appear here once you have placed a pair in your bag.</div>}</section></AccountLayout>;
}
