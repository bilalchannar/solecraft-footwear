import { Link, useLocation } from "wouter";
import { Heart, Menu, Monitor, Moon, Search, ShoppingBag, Sun, UserRound, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { Seo } from "@/components/Seo";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return <>
    <Link href="/shop" onClick={onNavigate}>Shop all</Link>
    <Link href="/shop?sort=newest" onClick={onNavigate}>New arrivals</Link>
    <Link href="/shop?sort=best_selling" onClick={onNavigate}>Best sellers</Link>
    <Link href="/about" onClick={onNavigate}>Our craft</Link>
  </>;
}

export function StorefrontLayout({ children, seo }: { children: React.ReactNode; seo?: { title?: string; description?: string; schema?: Record<string, unknown> } }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>(() => JSON.parse(localStorage.getItem("solecraft-recent-searches") ?? "[]"));
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const newsletter = trpc.newsletter.subscribe.useMutation({ onSuccess: result => { toast.success(result.alreadyRegistered ? "You are already on the list." : "You are on the list."); setNewsletterEmail(""); }, onError: error => toast.error(error.message) });
  const [location, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { theme, themeMode, toggleTheme } = useTheme();
  const cart = trpc.cart.get.useQuery(undefined, { enabled: isAuthenticated });
  const suggestions = trpc.storefront.products.useQuery({ query: searchTerm }, { enabled: searchOpen && searchTerm.trim().length > 1 });
  const cartCount = cart.data?.items.reduce((count, item) => count + item.item.quantity, 0) ?? 0;
  const submitSearch = (event?: FormEvent, query = searchTerm) => {
    event?.preventDefault();
    const normalized = query.trim();
    if (!normalized) return;
    const next = [normalized, ...recentSearches.filter(item => item.toLowerCase() !== normalized.toLowerCase())].slice(0, 4);
    localStorage.setItem("solecraft-recent-searches", JSON.stringify(next));
    setRecentSearches(next);
    navigate(`/shop?q=${encodeURIComponent(normalized)}`);
    setSearchOpen(false);
    setSearchTerm("");
  };
  useEffect(() => { const close = (event: KeyboardEvent) => { if (event.key === "Escape") { setMenuOpen(false); setSearchOpen(false); } }; window.addEventListener("keydown", close); return () => window.removeEventListener("keydown", close); }, []);
  const themeLabel = themeMode === "system" ? "Use light theme" : theme === "light" ? "Use dark theme" : "Use system theme";

  return <div className="page-shell"><Seo pathname={location} {...seo} />
    <div className="top-strip"><div className="site-container top-strip__inner"><span>Free shipping across Pakistan on orders above PKR 5,000</span><span>Crafted with intent. Delivered with care.</span></div></div>
    <header className="header">
      <div className="site-container header__main">
        <nav className="desktop-nav"><NavLinks /></nav>
        <Link className="brand" href="/" aria-label="SoleCraft home"><span className="brand__mark" /><span>SoleCraft</span></Link>
        <div className="header-actions">
          <button className="icon-button desktop-only" onClick={() => setSearchOpen(true)} aria-label="Search footwear"><Search size={19} /></button>
          <button className="icon-button desktop-only theme-button" onClick={toggleTheme} aria-label={themeLabel} title={themeLabel}>{themeMode === "system" ? <Monitor size={18} /> : theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}</button>
          <Link className="icon-button desktop-only" href={isAuthenticated ? "/wishlist" : "/"} onClick={event => { if (!isAuthenticated) { event.preventDefault(); startLogin(); } }} aria-label="Wishlist"><Heart size={19} /></Link>
          <Link className="icon-button desktop-only" href={isAuthenticated ? (user?.role === "admin" || user?.role === "super_admin" || user?.role === "staff" ? "/admin" : "/account") : "/"} onClick={event => { if (!isAuthenticated) { event.preventDefault(); startLogin(); } }} aria-label="Account"><UserRound size={19} /></Link>
          <Link className="icon-button" href={isAuthenticated ? "/cart" : "/"} onClick={event => { if (!isAuthenticated) { event.preventDefault(); startLogin(); } }} aria-label="Cart"><ShoppingBag size={20} />{cartCount > 0 && <span className="count-dot">{cartCount}</span>}</Link>
          <button className="icon-button mobile-menu" onClick={() => setMenuOpen(open => !open)} aria-expanded={menuOpen} aria-label="Toggle navigation">{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </div>
    </header>
    {menuOpen && <><button className="mobile-overlay" aria-label="Close navigation" onClick={() => setMenuOpen(false)} /><nav className="mobile-drawer" aria-label="Mobile navigation"><NavLinks onNavigate={() => setMenuOpen(false)} /><Link href={isAuthenticated ? "/account" : "/"} onClick={() => { setMenuOpen(false); if (!isAuthenticated) startLogin(); }}>Account</Link><button className="mobile-theme-control" onClick={toggleTheme}>{themeMode === "system" ? <Monitor size={17} /> : theme === "dark" ? <Moon size={17} /> : <Sun size={17} />} {themeLabel}</button></nav></>}
    {searchOpen && <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search SoleCraft"><button className="search-overlay__backdrop" aria-label="Close search" onClick={() => setSearchOpen(false)} /><div className="search-overlay__panel"><div className="search-overlay__head"><span className="eyebrow">Find your next pair</span><button className="icon-button" aria-label="Close search" onClick={() => setSearchOpen(false)}><X size={20} /></button></div><form className="search-overlay__form" onSubmit={event => submitSearch(event)}><Search size={20} /><input autoFocus value={searchTerm} onChange={event => setSearchTerm(event.target.value)} placeholder="Search by style, material or occasion" aria-label="Search footwear" /><button className="button-primary" type="submit">Search</button></form>{searchTerm.trim().length > 1 ? <div className="search-results">{suggestions.isLoading ? <div className="search-skeleton">Searching the collection…</div> : suggestions.data?.length ? suggestions.data.slice(0, 5).map(product => <Link href={`/product/${product.slug}`} className="search-result" onClick={() => setSearchOpen(false)} key={product.id}>{product.image ? <img src={product.image} alt="" /> : <div className="search-result__blank" />}<span><strong>{product.name}</strong><small>{product.categoryName ?? "Footwear"} · PKR {Number(product.salePrice ?? product.basePrice).toLocaleString("en-PK")}</small></span></Link>) : <div className="search-empty">No matching pairs yet. Try a broader style or material.</div>}</div> : <div className="search-discovery"><div><strong>Popular searches</strong><div className="search-chips">{["Peshawari", "Khussa", "Loafers", "Leather sandals"].map(term => <button key={term} onClick={() => { setSearchTerm(term); submitSearch(undefined, term); }}>{term}</button>)}</div></div>{recentSearches.length > 0 && <div><strong>Recent searches</strong><div className="search-chips">{recentSearches.map(term => <button key={term} onClick={() => { setSearchTerm(term); submitSearch(undefined, term); }}>{term}</button>)}</div></div>}</div>}</div></div>}
    <main key={location} className="page-content">{children}</main>
    <footer className="footer"><div className="site-container"><div className="footer-grid"><div><Link className="brand" href="/"><span className="brand__mark" /><span>SoleCraft</span></Link><p>Considered footwear for Pakistan’s everyday rituals, celebrations, and journeys.</p></div><div><h4>Shop</h4><Link href="/shop">All footwear</Link><Link href="/shop?sort=newest">New arrivals</Link><Link href="/shop?sort=best_selling">Best sellers</Link></div><div><h4>Support</h4><Link href="/shipping&returns">Shipping &amp; returns</Link><Link href="/size-guide">Size guide</Link><Link href="/contact">Contact</Link></div><div id="newsletter"><h4>Stay in the loop</h4><p className="footer-note">New drops, quiet offers, and craft notes.</p><form className="newsletter-form" onSubmit={event => { event.preventDefault(); newsletter.mutate({ email: newsletterEmail, source: "storefront_footer" }); }}><input type="email" value={newsletterEmail} onChange={event => setNewsletterEmail(event.target.value)} placeholder="Your email address" aria-label="Email address" required /><button className="button-secondary" type="submit" disabled={newsletter.isPending}>{newsletter.isPending ? "Joining…" : "Join"}</button></form><div className="footer-social"><a href="#newsletter">Instagram</a><a href="#newsletter">Facebook</a><a href="#newsletter">WhatsApp</a></div></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} SoleCraft. All rights reserved.</span><span>Made for movement, grounded in craft.</span></div></div></footer>
  </div>;
}
