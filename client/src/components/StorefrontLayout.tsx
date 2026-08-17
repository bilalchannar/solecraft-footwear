import { Link, useLocation } from "wouter";
import {
  Heart,
  Menu,
  Monitor,
  Moon,
  Search,
  ShoppingBag,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { Seo } from "@/components/Seo";
import { AuthModal } from "@/components/AuthModal";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";
import { luxuryEase, microSpring, slideUpVariants } from "@/lib/motion";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const [location] = useLocation();
  const links = [
    { href: "/shop", label: "Shop all" },
    { href: "/shop?category=peshawari", label: "Peshawari" },
    { href: "/shop?category=khussa", label: "Khussa" },
    { href: "/shop?sort=newest", label: "New arrivals" },
    { href: "/about", label: "Our craft" },
  ];

  return (
    <>
      {links.map(link => {
        const isActive = location === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={`nav-link ${isActive ? "nav-link--active" : ""}`}
          >
            <span>{link.label}</span>
            {isActive && (
              <motion.span
                layoutId="nav-underline"
                className="nav-link__indicator"
                transition={microSpring}
              />
            )}
          </Link>
        );
      })}
    </>
  );
}

export function StorefrontLayout({
  children,
  seo,
}: {
  children: React.ReactNode;
  seo?: {
    title?: string;
    description?: string;
    schema?: Record<string, unknown>;
  };
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() =>
    JSON.parse(localStorage.getItem("solecraft-recent-searches") ?? "[]")
  );
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const newsletter = trpc.newsletter.subscribe.useMutation({
    onSuccess: result => {
      toast.success(
        result.alreadyRegistered
          ? "You are already on the list."
          : "You are on the list."
      );
      setNewsletterEmail("");
    },
    onError: error => toast.error(error.message),
  });
  const [location, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { theme, themeMode, toggleTheme } = useTheme();
  const cart = trpc.cart.get.useQuery(undefined, { enabled: isAuthenticated });
  const suggestions = trpc.storefront.products.useQuery(
    { query: searchTerm },
    { enabled: searchOpen && searchTerm.trim().length > 1 }
  );
  const cartCount =
    cart.data?.items.reduce((count, item) => count + item.item.quantity, 0) ??
    0;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const submitSearch = (event?: FormEvent, query = searchTerm) => {
    event?.preventDefault();
    const normalized = query.trim();
    if (!normalized) return;
    const next = [
      normalized,
      ...recentSearches.filter(
        item => item.toLowerCase() !== normalized.toLowerCase()
      ),
    ].slice(0, 4);
    localStorage.setItem("solecraft-recent-searches", JSON.stringify(next));
    setRecentSearches(next);
    navigate(`/shop?q=${encodeURIComponent(normalized)}`);
    setSearchOpen(false);
    setSearchTerm("");
  };

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  const themeLabel =
    themeMode === "system"
      ? "Use light theme"
      : theme === "light"
        ? "Use dark theme"
        : "Use system theme";

  return (
    <div className="page-shell">
      <Seo pathname={location} {...seo} />
      <div className="top-strip">
        <div className="site-container top-strip__inner">
          <span>Free shipping across Pakistan on orders above PKR 5,000</span>
          <span>Crafted with intent. Delivered with care.</span>
        </div>
      </div>
      <header className={`header ${isScrolled ? "header--scrolled" : ""}`}>
        <div className="site-container header__main">
          <nav className="desktop-nav">
            <NavLinks />
          </nav>
          <Link className="brand" href="/" aria-label="SoleCraft home">
            <span className="brand__mark">
              <span className="brand__diamond" />
            </span>
            <span className="brand__text">SoleCraft</span>
          </Link>
          <div className="header-actions">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="icon-button desktop-only"
              onClick={() => setSearchOpen(true)}
              aria-label="Search footwear"
            >
              <Search size={19} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="icon-button desktop-only theme-button"
              onClick={toggleTheme}
              aria-label={themeLabel}
              title={themeLabel}
            >
              {themeMode === "system" ? (
                <Monitor size={18} />
              ) : theme === "dark" ? (
                <Moon size={18} />
              ) : (
                <Sun size={18} />
              )}
            </motion.button>
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
              <Link
                className="icon-button desktop-only"
                href="/wishlist"
                aria-label="Wishlist"
              >
                <Heart size={19} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
              <Link
                className="icon-button desktop-only"
                href={
                  isAuthenticated
                    ? user?.role === "admin" ||
                      user?.role === "super_admin" ||
                      user?.role === "staff"
                      ? "/admin"
                      : "/account"
                    : "/account"
                }
                onClick={event => {
                  if (!isAuthenticated) {
                    event.preventDefault();
                    setAuthModalOpen(true);
                  }
                }}
                aria-label="Account"
              >
                <UserRound size={19} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
              <Link
                className="icon-button relative"
                href="/cart"
                aria-label="Cart"
              >
                <ShoppingBag size={20} />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: [0.4, 1.25, 1], opacity: 1 }}
                      exit={{ scale: 0.4, opacity: 0 }}
                      transition={microSpring}
                      className="count-dot"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
            <motion.button
              whileTap={{ scale: 0.92 }}
              className="icon-button mobile-menu"
              onClick={() => setMenuOpen(open => !open)}
              aria-expanded={menuOpen}
              aria-label="Toggle navigation"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </motion.button>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="mobile-overlay"
              aria-label="Close navigation"
              onClick={() => setMenuOpen(false)}
            />
            <motion.nav
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ duration: 0.35, ease: luxuryEase }}
              className="mobile-drawer"
              aria-label="Mobile navigation"
            >
              <div className="mobile-drawer__head">
                <span className="brand">SoleCraft</span>
                <button
                  className="icon-button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
              <NavLinks onNavigate={() => setMenuOpen(false)} />
              <Link
                href={isAuthenticated ? "/account" : "/account"}
                onClick={(e) => {
                  setMenuOpen(false);
                  if (!isAuthenticated) {
                    e.preventDefault();
                    setAuthModalOpen(true);
                  }
                }}
              >
                {isAuthenticated ? "My Account" : "Sign In / Register"}
              </Link>
              <button className="mobile-theme-control" onClick={toggleTheme}>
                {themeMode === "system" ? (
                  <Monitor size={17} />
                ) : theme === "dark" ? (
                  <Moon size={17} />
                ) : (
                  <Sun size={17} />
                )}{" "}
                {themeLabel}
              </button>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {searchOpen && (
          <div
            className="search-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Search SoleCraft"
          >
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="search-overlay__backdrop"
              aria-label="Close search"
              onClick={() => setSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.97 }}
              transition={{ duration: 0.3, ease: luxuryEase }}
              className="search-overlay__panel"
            >
              <div className="search-overlay__head">
                <span className="eyebrow">Find your next pair</span>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="icon-button"
                  aria-label="Close search"
                  onClick={() => setSearchOpen(false)}
                >
                  <X size={20} />
                </motion.button>
              </div>
              <form
                className="search-overlay__form"
                onSubmit={event => submitSearch(event)}
              >
                <Search size={20} />
                <input
                  autoFocus
                  value={searchTerm}
                  onChange={event => setSearchTerm(event.target.value)}
                  placeholder="Search by style, material or occasion"
                  aria-label="Search footwear"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="button-primary"
                  type="submit"
                >
                  Search
                </motion.button>
              </form>
              {searchTerm.trim().length > 1 ? (
                <div className="search-results">
                  {suggestions.isLoading ? (
                    <div className="search-skeleton">
                      Searching the collection…
                    </div>
                  ) : suggestions.data?.length ? (
                    suggestions.data.slice(0, 5).map(product => (
                      <Link
                        href={`/product/${product.slug}`}
                        className="search-result"
                        onClick={() => setSearchOpen(false)}
                        key={product.id}
                      >
                        {product.image ? (
                          <img src={product.image} alt="" />
                        ) : (
                          <div className="search-result__blank" />
                        )}
                        <span>
                          <strong>{product.name}</strong>
                          <small>
                            {product.categoryName ?? "Footwear"} · PKR{" "}
                            {Number(
                              product.salePrice ?? product.basePrice
                            ).toLocaleString("en-PK")}
                          </small>
                        </span>
                      </Link>
                    ))
                  ) : (
                    <div className="search-empty">
                      No matching pairs yet. Try a broader style or material.
                    </div>
                  )}
                </div>
              ) : (
                <div className="search-discovery">
                  <div>
                    <strong>Popular searches</strong>
                    <div className="search-chips">
                      {["Peshawari", "Khussa", "Loafers", "Leather sandals"].map(
                        term => (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            key={term}
                            onClick={() => {
                              setSearchTerm(term);
                              submitSearch(undefined, term);
                            }}
                          >
                            {term}
                          </motion.button>
                        )
                      )}
                    </div>
                  </div>
                  {recentSearches.length > 0 && (
                    <div>
                      <strong>Recent searches</strong>
                      <div className="search-chips">
                        {recentSearches.map(term => (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            key={term}
                            onClick={() => {
                              setSearchTerm(term);
                              submitSearch(undefined, term);
                            }}
                          >
                            {term}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
      <main key={location} className="page-content">
        {children}
      </main>
      <footer className="footer">
        <div className="site-container">
          <div className="footer-grid">
            <div>
              <Link className="brand" href="/">
                <span className="brand__mark">
                  <span className="brand__diamond" />
                </span>
                <span className="brand__text">SoleCraft</span>
              </Link>
              <p>
                Considered footwear for Pakistan’s everyday rituals,
                celebrations, and journeys.
              </p>
            </div>
            <div>
              <h4>Shop</h4>
              <Link href="/shop">All footwear</Link>
              <Link href="/shop?sort=newest">New arrivals</Link>
              <Link href="/shop?sort=best_selling">Best sellers</Link>
            </div>
            <div>
              <h4>Support</h4>
              <Link href="/shipping&returns">Shipping &amp; returns</Link>
              <Link href="/size-guide">Size guide</Link>
              <Link href="/contact">Contact</Link>
            </div>
            <div id="newsletter">
              <h4>Stay in the loop</h4>
              <p className="footer-note">
                New drops, quiet offers, and craft notes.
              </p>
              <form
                className="newsletter-form"
                onSubmit={event => {
                  event.preventDefault();
                  newsletter.mutate({
                    email: newsletterEmail,
                    source: "storefront_footer",
                  });
                }}
              >
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={event => setNewsletterEmail(event.target.value)}
                  placeholder="Your email address"
                  aria-label="Email address"
                  required
                />
                <button
                  className="button-secondary"
                  type="submit"
                  disabled={newsletter.isPending}
                >
                  {newsletter.isPending ? "Joining…" : "Join"}
                </button>
              </form>
              <div className="footer-social">
                <a href="#newsletter">Instagram</a>
                <a href="#newsletter">Facebook</a>
                <a href="#newsletter">WhatsApp</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>
              © {new Date().getFullYear()} SoleCraft. All rights reserved.
            </span>
            <span>Made for movement, grounded in craft.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
