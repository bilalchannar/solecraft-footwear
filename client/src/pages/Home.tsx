import { ArrowRight, BadgeCheck, Leaf, Truck } from "lucide-react";
import { Link } from "wouter";
import { StorefrontLayout } from "@/components/StorefrontLayout";
import { ProductCard, type StoreProduct } from "@/components/ProductCard";
import { trpc } from "@/lib/trpc";
import { Reveal } from "@/components/Reveal";

const heroFallback = "/manus-storage/solecraft-hero_13184c2b.png";
const traditionalFallback = "/manus-storage/solecraft-traditional_d3ec126c.png";
const womenFallback = "/manus-storage/solecraft-women_409e1ba7.png";

function ProductShelf({ title, eyebrow, products }: { title: string; eyebrow: string; products: StoreProduct[] }) {
  return <section className="section"><div className="site-container"><Reveal><div className="section-head"><div><span className="eyebrow">{eyebrow}</span><h2 className="display section-title">{title}</h2></div><Link className="button-text" href="/shop">Shop the edit <ArrowRight size={16} /></Link></div></Reveal>{products.length ? <div className="product-grid">{products.map((product, index) => <Reveal key={product.id} delay={index * 55}><ProductCard product={product} /></Reveal>)}</div> : <div className="empty-state">This collection will appear here as the catalog is curated.</div>}</div></section>;
}

export default function Home() {
  const home = trpc.storefront.home.useQuery();
  const banner = home.data?.heroBanners[0];
  const sections = home.data?.sections ?? [];
  const categoryCards = home.data?.categories ?? [];
  const featured = home.data?.featured as StoreProduct[] ?? [];
  const newArrivals = home.data?.newArrivals as StoreProduct[] ?? [];
  const bestSellers = home.data?.bestSellers as StoreProduct[] ?? [];
  const heroTitle = banner?.title ?? (sections.find(section => section.key === "hero")?.heading ?? "Steps made for your story.");
  const heroSubtitle = banner?.subtitle ?? (sections.find(section => section.key === "hero")?.subheading ?? "Grounded in Pakistani craft, refined for every direction you take.");
  return <StorefrontLayout>
    <section className="hero"><div className="site-container"><div className="hero__panel reveal reveal--visible"><div className="hero__copy"><span className="eyebrow">The refined everyday</span><h1 className="display hero__title">{heroTitle}</h1><p className="hero__body">{heroSubtitle}</p><div><Link className="button-primary" href={banner?.href ?? "/shop"}>Shop the collection <ArrowRight size={17} /></Link></div></div><div className="hero__image" style={{ backgroundImage: `url(${banner?.imageUrl ?? heroFallback})` }} /><div className="hero__stamp">Made for<br />everyday<br />movement</div></div></div></section>
    <section className="section section--paper"><div className="site-container"><Reveal><div className="section-head"><div><span className="eyebrow">Find your footing</span><h2 className="display section-title">Shop by collection</h2></div><p className="section-note">An evolving selection of occasion-ready silhouettes and everyday essentials.</p></div></Reveal>{categoryCards.length ? <div className="category-grid">{categoryCards.map((category, index) => <Reveal delay={index * 60} key={category.id}><Link href={`/shop?category=${category.slug}`} className="category-card"><img loading="lazy" src={category.imageUrl ?? (index % 2 ? womenFallback : traditionalFallback)} alt={category.name} /><span>{category.name}</span><small>Explore</small></Link></Reveal>)}</div> : <div className="empty-state">Create active categories in the management dashboard to shape this collection guide.</div>}</div></section>
    {home.isLoading ? <section className="section"><div className="site-container"><div className="section-head"><div className="skeleton-line skeleton-line--short" /><div className="skeleton-line skeleton-line--title" /></div><div className="product-grid">{Array.from({ length: 4 }).map((_, index) => <div className="product-skeleton" key={index}><div /><span /><span /></div>)}</div></div></section> : <><ProductShelf eyebrow="Curated selection" title="Featured pairs" products={featured} /><ProductShelf eyebrow="Freshly added" title="New arrivals" products={newArrivals} /></>}
    <section className="section section--moss"><div className="site-container"><div className="value-grid"><div className="value-item"><Truck size={26} /><h3>Nationwide delivery</h3><p>Reliable delivery to every corner of Pakistan, with clear tracking as your order moves.</p></div><div className="value-item"><BadgeCheck size={26} /><h3>Craft-first materials</h3><p>Each product’s material and construction details are made clear before checkout.</p></div><div className="value-item"><Leaf size={26} /><h3>Considered choices</h3><p>Shop fewer, better pairs designed to remain part of your rotation.</p></div></div></div></section>
    <ProductShelf eyebrow="Loved right now" title="Best sellers" products={bestSellers} />
    <section className="section section--moss" id="newsletter"><div className="site-container newsletter"><div><span className="eyebrow" style={{ color: "var(--sun)" }}>The SoleCraft note</span><h2 className="display">A small letter for better steps.</h2></div><div><p>Receive quiet updates on new workmanship, season-ready footwear, and member-only offers.</p><form className="newsletter-form" onSubmit={event => { event.preventDefault(); }}><input type="email" aria-label="Email address" placeholder="Your email address" /><button type="submit">Join <ArrowRight size={16} /></button></form></div></div></section>
  </StorefrontLayout>;
}
