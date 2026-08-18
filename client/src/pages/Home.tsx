import { ArrowRight, BadgeCheck, Leaf, Truck } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { StorefrontLayout } from "@/components/StorefrontLayout";
import { ProductCard, type StoreProduct } from "@/components/ProductCard";
import { trpc } from "@/lib/trpc";
import { Reveal } from "@/components/Reveal";
import { RevealDepth } from "@/components/RevealDepth";
import { HeroSection } from "@/components/HeroSection";
import { gentleSpring, microSpring } from "@/lib/motion";
import { useTilt3d, DEPTH } from "@/lib/use3d";

const traditionalFallback = "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80";
const womenFallback = "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80";

function ProductShelf({
  title,
  eyebrow,
  products,
}: {
  title: string;
  eyebrow: string;
  products: StoreProduct[];
}) {
  return (
    <section className="section">
      <div className="site-container">
        <RevealDepth>
          <div className="section-head">
            <div>
              <span className="eyebrow">{eyebrow}</span>
              <h2 className="display section-title">{title}</h2>
            </div>
            <motion.div whileHover={{ x: 4 }} transition={microSpring}>
              <Link className="button-text inline-flex items-center gap-1.5" href="/shop">
                <span>Shop the edit</span>
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>
        </RevealDepth>
        {products.length ? (
          <div className="product-grid">
            {products.map((product, index) => (
              <RevealDepth key={product.id} delay={index * 55}>
                <ProductCard product={product} />
              </RevealDepth>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            This collection will appear here as the catalog is curated.
          </div>
        )}
      </div>
    </section>
  );
}

/** Category card wrapper with 3D tilt */
function CategoryCard3D({
  category,
  index,
}: {
  category: { id: number; slug: string; name: string; imageUrl?: string | null };
  index: number;
}) {
  const tilt = useTilt3d<HTMLDivElement>({ max: DEPTH.categoryTilt });

  return (
    <RevealDepth delay={index * 60}>
      <motion.div
        ref={tilt.ref}
        style={
          tilt.enabled
            ? {
                rotateX: tilt.rotateX,
                rotateY: tilt.rotateY,
                transformPerspective: 700,
              }
            : undefined
        }
        {...tilt.handlers}
        className="h-full"
      >
        <Link
          href={`/shop?category=${category.slug}`}
          className="category-card group block overflow-hidden"
        >
          <img
            loading="lazy"
            src={
              category.imageUrl ??
              (index % 2 ? womenFallback : traditionalFallback)
            }
            alt={category.name}
          />
          <span>{category.name}</span>
          <small className="inline-flex items-center gap-1">
            Explore <ArrowRight size={12} className="inline transition-transform group-hover:translate-x-1" />
          </small>
        </Link>
      </motion.div>
    </RevealDepth>
  );
}

export default function Home() {
  const home = trpc.storefront.home.useQuery();
  const heroBanners = home.data?.heroBanners ?? [];
  const sections = home.data?.sections ?? [];
  const categoryCards = home.data?.categories ?? [];
  const featured = (home.data?.featured as StoreProduct[]) ?? [];
  const newArrivals = (home.data?.newArrivals as StoreProduct[]) ?? [];
  const bestSellers = (home.data?.bestSellers as StoreProduct[]) ?? [];
  const heroTitle =
    heroBanners[0]?.title ??
    sections.find(section => section.key === "hero")?.heading ??
    "Steps made for your story.";
  const heroSubtitle =
    heroBanners[0]?.subtitle ??
    sections.find(section => section.key === "hero")?.subheading ??
    "Grounded in Pakistani craft, refined for every direction you take.";

  return (
    <StorefrontLayout>
      <HeroSection
        banners={heroBanners}
        defaultTitle={heroTitle}
        defaultSubtitle={heroSubtitle}
      />

      <section className="section section--paper">
        <div className="site-container">
          <RevealDepth>
            <div className="section-head">
              <div>
                <span className="eyebrow">Find your footing</span>
                <h2 className="display section-title">Shop by collection</h2>
              </div>
              <p className="section-note">
                An evolving selection of occasion-ready silhouettes and everyday
                essentials.
              </p>
            </div>
          </RevealDepth>
          {categoryCards.length ? (
            <div className="category-grid">
              {categoryCards.map((category, index) => (
                <CategoryCard3D
                  key={category.id}
                  category={category}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              Create active categories in the management dashboard to shape this
              collection guide.
            </div>
          )}
        </div>
      </section>

      {home.isLoading ? (
        <section className="section">
          <div className="site-container">
            <div className="section-head">
              <div className="skeleton-line skeleton-line--short" />
              <div className="skeleton-line skeleton-line--title" />
            </div>
            <div className="product-grid">
              {Array.from({ length: 4 }).map((_, index) => (
                <div className="product-skeleton" key={index}>
                  <div />
                  <span />
                  <span />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <>
          <ProductShelf
            eyebrow="Curated selection"
            title="Featured pairs"
            products={featured}
          />
          <ProductShelf
            eyebrow="Freshly added"
            title="New arrivals"
            products={newArrivals}
          />
        </>
      )}

      <section className="section section--moss">
        <div className="site-container">
          <div className="value-grid">
            <RevealDepth delay={0}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={gentleSpring}
                className="value-item"
              >
                <Truck size={26} />
                <h3>Nationwide delivery</h3>
                <p>
                  Reliable delivery to every corner of Pakistan, with clear
                  tracking as your order moves.
                </p>
              </motion.div>
            </RevealDepth>
            <RevealDepth delay={80}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={gentleSpring}
                className="value-item"
              >
                <BadgeCheck size={26} />
                <h3>Craft-first materials</h3>
                <p>
                  Each product's material and construction details are made clear
                  before checkout.
                </p>
              </motion.div>
            </RevealDepth>
            <RevealDepth delay={160}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={gentleSpring}
                className="value-item"
              >
                <Leaf size={26} />
                <h3>Considered choices</h3>
                <p>
                  Shop fewer, better pairs designed to remain part of your
                  rotation.
                </p>
              </motion.div>
            </RevealDepth>
          </div>
        </div>
      </section>

      <ProductShelf
        eyebrow="Loved right now"
        title="Best sellers"
        products={bestSellers}
      />

      <section className="section section--moss" id="newsletter">
        <div className="site-container newsletter">
          <RevealDepth>
            <div>
              <span className="eyebrow" style={{ color: "var(--sun)" }}>
                The SoleCraft note
              </span>
              <h2 className="display">A small letter for better steps.</h2>
            </div>
          </RevealDepth>
          <RevealDepth delay={100}>
            <div>
              <p>
                Receive quiet updates on new workmanship, season-ready footwear,
                and member-only offers.
              </p>
              <form
                className="newsletter-form"
                onSubmit={event => {
                  event.preventDefault();
                }}
              >
                <input
                  type="email"
                  aria-label="Email address"
                  placeholder="Your email address"
                />
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={microSpring}
                  type="submit"
                >
                  Join <ArrowRight size={16} />
                </motion.button>
              </form>
            </div>
          </RevealDepth>
        </div>
      </section>
    </StorefrontLayout>
  );
}
