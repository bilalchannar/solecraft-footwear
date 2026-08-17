import { Heart, MapPin, Package, UserRound } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { StorefrontLayout } from "@/components/StorefrontLayout";

const links = [{ href: "/account", label: "Overview", icon: UserRound }, { href: "/account/orders", label: "Orders", icon: Package }, { href: "/account/addresses", label: "Addresses", icon: MapPin }, { href: "/wishlist", label: "Wishlist", icon: Heart }];

export function AccountLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const { loading, user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  if (loading) return <StorefrontLayout><div className="site-container account-page account-page--loading"><aside className="account-nav"><div className="skeleton-line skeleton-line--short" /><div className="skeleton-line skeleton-line--title" /><div className="skeleton-line" style={{ height: 14, marginTop: 20 }} /><div className="skeleton-line" style={{ height: 14, marginTop: 13 }} /></aside><section className="account-content"><div className="skeleton-line skeleton-line--short" /><div className="skeleton-line skeleton-line--title" /><div className="account-stat-grid"><div className="account-stat skeleton-stat" /><div className="account-stat skeleton-stat" /><div className="account-stat skeleton-stat" /></div></section></div></StorefrontLayout>;
  if (!isAuthenticated) return <StorefrontLayout><div className="site-container catalog-page"><h1 className="display catalog-title">Your SoleCraft account</h1><div className="empty-state" style={{ marginTop: 28 }}>Sign in to view orders, saved pairs, and delivery addresses.<br /><button className="button-primary" style={{ marginTop: 18 }} onClick={() => startLogin()}>Sign in securely</button></div></div></StorefrontLayout>;
  return <StorefrontLayout><div className="site-container account-page"><aside className="account-nav"><span className="eyebrow">Signed in as</span><h2 className="display">{user?.name ?? "SoleCraft member"}</h2>{links.map(item => { const Icon = item.icon; const active = item.href === "/account" ? location === "/account" : location.startsWith(item.href); return <Link aria-current={active ? "page" : undefined} className={`account-nav__link ${active ? "account-nav__link--active" : ""}`} key={item.href} href={item.href}><Icon size={16} />{item.label}</Link>; })}</aside><section className="account-content account-content--reveal"><div className="breadcrumb">Account / {title}</div><h1 className="display catalog-title">{title}</h1>{children}</section></div></StorefrontLayout>;
}
