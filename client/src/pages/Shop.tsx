import { Search, SlidersHorizontal, X, Filter, Sparkles, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { StorefrontLayout } from "@/components/StorefrontLayout";
import { ProductCard, type StoreProduct } from "@/components/ProductCard";
import { trpc } from "@/lib/trpc";
import {
  luxuryEase,
  microSpring,
  staggerContainerVariants,
  staggerItemVariants,
} from "@/lib/motion";

const parseParams = (location: string) =>
  new URLSearchParams(location.split("?")[1] ?? "");

const MATERIALS = [
  { label: "All Materials", value: "" },
  { label: "Cowhide Leather", value: "Cowhide" },
  { label: "Calf Suede", value: "Suede" },
  { label: "Velvet & Gold Tilla", value: "Tilla" },
  { label: "Burnished Crust Leather", value: "Burnished" },
];

const PRICE_RANGES = [
  { label: "Any Price", min: undefined, max: undefined },
  { label: "Under PKR 5,000", min: 0, max: 5000 },
  { label: "PKR 5,000 – 7,500", min: 5000, max: 7500 },
  { label: "Above PKR 7,500", min: 7500, max: 50000 },
];

export default function Shop() {
  const [location, navigate] = useLocation();
  const params = parseParams(location);
  const [searchValue, setSearchValue] = useState(params.get("q") ?? "");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const category = params.get("category") ?? undefined;
  const material = params.get("material") ?? undefined;
  const minPrice = params.get("minPrice") ? Number(params.get("minPrice")) : undefined;
  const maxPrice = params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined;
  const sort = (params.get("sort") as
    | "newest"
    | "price_asc"
    | "price_desc"
    | "best_selling"
    | null) ?? "newest";

  const filters = useMemo(
    () => ({
      query: params.get("q") ?? undefined,
      categorySlug: category,
      material,
      minPrice,
      maxPrice,
      sort,
    }),
    [location]
  );

  const products = trpc.storefront.products.useQuery(filters);
  const categories = trpc.storefront.categories.useQuery();

  useEffect(() => {
    setSearchValue(params.get("q") ?? "");
  }, [location]);

  const setParam = (key: string, value?: string | number) => {
    const next = parseParams(location);
    if (value !== undefined && value !== "") next.set(key, String(value));
    else next.delete(key);
    navigate(`/shop${next.toString() ? `?${next.toString()}` : ""}`);
  };

  const setPriceRange = (min?: number, max?: number) => {
    const next = parseParams(location);
    if (min !== undefined) next.set("minPrice", String(min));
    else next.delete("minPrice");
    if (max !== undefined) next.set("maxPrice", String(max));
    else next.delete("maxPrice");
    navigate(`/shop${next.toString() ? `?${next.toString()}` : ""}`);
  };

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setParam("q", searchValue.trim() || undefined);
  };

  const clearFilters = () => {
    setSearchValue("");
    navigate("/shop");
    setMobileFiltersOpen(false);
  };

  const activeFilterCount = [
    category,
    material,
    minPrice !== undefined || maxPrice !== undefined,
    searchValue.trim(),
    sort !== "newest" ? sort : null,
  ].filter(Boolean).length;

  return (
    <StorefrontLayout
      seo={{
        title: "Artisanal Footwear Edit | SoleCraft Pakistan",
        description:
          "Explore handcrafted Pakistani Peshawari chappals, Norozi soles, wedding tilla khussas, and modern dress loafers.",
      }}
    >
      <div className="site-container catalog-page py-10">
        <div className="breadcrumb mb-4">
          <Link href="/">Home</Link> / <span>Shop Collection</span>
        </div>

        {/* Page Title Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="eyebrow">Handcrafted in Pakistan</span>
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: luxuryEase }}
              className="display catalog-title text-3xl md:text-5xl font-serif font-bold text-[var(--ink)] mt-1"
            >
              The Footwear Edit
            </motion.h1>
          </div>
          <p className="text-xs text-[var(--muted)] max-w-sm leading-relaxed">
            Every pair is lasted by master ustads using full-grain leathers and signature treaded soles.
          </p>
        </div>

        {/* Desktop Controls Bar */}
        <div className="catalog-controls desktop-catalog-controls p-4 bg-[var(--paper)] rounded-2xl border border-[var(--line)] shadow-sm flex-wrap gap-3">
          <form className="search-field flex-1 min-w-[240px]" onSubmit={submitSearch}>
            <Search size={16} />
            <input
              value={searchValue}
              onChange={event => setSearchValue(event.target.value)}
              placeholder="Search by name, leather, style..."
              className="w-full text-xs"
            />
            {searchValue && (
              <button
                type="button"
                className="text-[var(--muted)] hover:text-[var(--ink)]"
                onClick={() => {
                  setSearchValue("");
                  setParam("q", undefined);
                }}
              >
                <X size={14} />
              </button>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="button-text text-xs"
              type="submit"
            >
              Search
            </motion.button>
          </form>

          {/* Material Select */}
          <div className="filter-row">
            <select
              className="select-field text-xs"
              aria-label="Filter by material"
              value={material ?? ""}
              onChange={e => setParam("material", e.target.value || undefined)}
            >
              {MATERIALS.map(m => (
                <option key={m.label} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Select */}
          <div className="filter-row">
            <select
              className="select-field text-xs"
              aria-label="Filter by price"
              value={
                minPrice !== undefined || maxPrice !== undefined
                  ? `${minPrice ?? 0}-${maxPrice ?? 50000}`
                  : ""
              }
              onChange={e => {
                if (!e.target.value) {
                  setPriceRange(undefined, undefined);
                } else {
                  const [min, max] = e.target.value.split("-").map(Number);
                  setPriceRange(min, max);
                }
              }}
            >
              <option value="">Any Price Range</option>
              <option value="0-5000">Under PKR 5,000</option>
              <option value="5000-7500">PKR 5,000 – 7,500</option>
              <option value="7500-50000">Above PKR 7,500</option>
            </select>
          </div>

          {/* Sort Select */}
          <div className="filter-row">
            <SlidersHorizontal size={15} />
            <select
              className="select-field text-xs font-medium"
              aria-label="Sort products"
              value={sort}
              onChange={event => setParam("sort", event.target.value)}
            >
              <option value="newest">Newest Arrivals</option>
              <option value="best_selling">Best Sellers</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Pills Row */}
        <div className="filter-row catalog-category-row flex-wrap gap-2 my-4">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className={`filter-pill text-xs py-2 px-4 rounded-full border transition-all ${
              !category
                ? "bg-[var(--moss)] text-white border-[var(--moss)] font-semibold shadow-sm"
                : "bg-[var(--paper)] text-[var(--ink)] border-[var(--line)] hover:border-[var(--moss)]"
            }`}
            onClick={() => setParam("category", undefined)}
          >
            All Footwear
          </motion.button>
          {categories.data?.map(item => {
            const isActive =
              category === item.slug ||
              (category === "peshawari" && item.slug.includes("peshawari")) ||
              (category === "khussa" && item.slug.includes("khussa")) ||
              (category === "norozi" && item.slug.includes("norozi")) ||
              (category === "loafers" && item.slug.includes("modern"));
            return (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                key={item.id}
                className={`filter-pill text-xs py-2 px-4 rounded-full border transition-all ${
                  isActive
                    ? "bg-[var(--moss)] text-white border-[var(--moss)] font-semibold shadow-sm"
                    : "bg-[var(--paper)] text-[var(--ink)] border-[var(--line)] hover:border-[var(--moss)]"
                }`}
                onClick={() => setParam("category", item.slug)}
              >
                {item.name}
              </motion.button>
            );
          })}
        </div>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-[var(--surface-tint)] rounded-xl text-xs border border-[var(--line)]">
            <span className="font-semibold text-[var(--ink)]">Active filters:</span>
            {category && (
              <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-md bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)] font-medium">
                Category: {category}
                <button onClick={() => setParam("category", undefined)}>
                  <X size={12} />
                </button>
              </span>
            )}
            {material && (
              <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-md bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)] font-medium">
                Material: {material}
                <button onClick={() => setParam("material", undefined)}>
                  <X size={12} />
                </button>
              </span>
            )}
            {(minPrice !== undefined || maxPrice !== undefined) && (
              <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-md bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)] font-medium">
                Price: PKR {minPrice ?? 0} – {maxPrice ?? "+"}
                <button onClick={() => setPriceRange(undefined, undefined)}>
                  <X size={12} />
                </button>
              </span>
            )}
            {searchValue && (
              <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-md bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)] font-medium">
                Search: "{searchValue}"
                <button
                  onClick={() => {
                    setSearchValue("");
                    setParam("q", undefined);
                  }}
                >
                  <X size={12} />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-xs text-[var(--clay)] font-semibold hover:underline ml-auto flex items-center gap-1"
            >
              <RotateCcw size={12} />
              <span>Reset all</span>
            </button>
          </div>
        )}

        {/* Results Header Count */}
        <div className="catalog-result-row flex items-center justify-between text-xs text-[var(--muted)] mb-6">
          <p className="catalog-result">
            {products.isLoading
              ? "Loading handcrafted pairs…"
              : `Showing ${products.data?.length ?? 0} handcrafted pair${(products.data?.length ?? 0) === 1 ? "" : "s"}`}
          </p>
        </div>

        {/* Product Grid */}
        {products.isLoading ? (
          <div className="product-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <div className="product-skeleton" key={index}>
                <div />
                <span />
                <span />
              </div>
            ))}
          </div>
        ) : (products.data?.length ?? 0) > 0 ? (
          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            animate="show"
            className="product-grid"
          >
            {products.data!.map(product => (
              <motion.div key={product.id} variants={staggerItemVariants}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="empty-state p-12 text-center bg-[var(--paper)] rounded-2xl border border-[var(--line)] my-6">
            <h3 className="font-serif text-xl font-bold text-[var(--ink)] mb-2">
              No matching pairs found
            </h3>
            <p className="text-xs text-[var(--muted)] max-w-sm mx-auto mb-6 leading-relaxed">
              We couldn’t find any pairs matching your selected filters. Try broadening your criteria or resetting filters.
            </p>
            <button onClick={clearFilters} className="button-primary text-xs py-2 px-6">
              Reset all filters
            </button>
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
}
