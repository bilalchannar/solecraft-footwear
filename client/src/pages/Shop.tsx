import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
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

export default function Shop() {
  const [location, navigate] = useLocation();
  const params = parseParams(location);
  const [searchValue, setSearchValue] = useState(params.get("q") ?? "");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [pendingCategory, setPendingCategory] = useState(
    params.get("category") ?? ""
  );
  const [pendingSort, setPendingSort] = useState(
    params.get("sort") ?? "newest"
  );
  const category = params.get("category") ?? undefined;
  const sort = params.get("sort") as
    | "newest"
    | "price_asc"
    | "price_desc"
    | "best_selling"
    | "discount"
    | "relevance"
    | null;
  const filters = useMemo(
    () => ({
      query: params.get("q") ?? undefined,
      categorySlug: category,
      sort: sort ?? "newest",
    }),
    [location]
  );
  const products = trpc.storefront.products.useQuery(filters);
  const categories = trpc.storefront.categories.useQuery();

  useEffect(() => {
    setSearchValue(params.get("q") ?? "");
    setPendingCategory(params.get("category") ?? "");
    setPendingSort(params.get("sort") ?? "newest");
  }, [location]);

  const setParam = (key: string, value?: string) => {
    const next = parseParams(location);
    if (value) next.set(key, value);
    else next.delete(key);
    navigate(`/shop${next.toString() ? `?${next.toString()}` : ""}`);
  };

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setParam("q", searchValue.trim() || undefined);
  };

  const applyMobileFilters = () => {
    const next = parseParams(location);
    if (pendingCategory) next.set("category", pendingCategory);
    else next.delete("category");
    if (pendingSort && pendingSort !== "newest") next.set("sort", pendingSort);
    else next.delete("sort");
    navigate(`/shop${next.toString() ? `?${next.toString()}` : ""}`);
    setMobileFiltersOpen(false);
  };

  const clearFilters = () => {
    setSearchValue("");
    setPendingCategory("");
    setPendingSort("newest");
    navigate("/shop");
    setMobileFiltersOpen(false);
  };

  return (
    <StorefrontLayout>
      <div className="site-container catalog-page">
        <div className="breadcrumb">Home / Shop</div>
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: luxuryEase }}
          className="display catalog-title"
        >
          The footwear edit
        </motion.h1>

        <div className="catalog-controls desktop-catalog-controls">
          <form className="search-field" onSubmit={submitSearch}>
            <Search size={16} />
            <input
              value={searchValue}
              onChange={event => setSearchValue(event.target.value)}
              placeholder="Search by name, style, or SKU"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="button-text"
              type="submit"
            >
              Search
            </motion.button>
          </form>
          <div className="filter-row">
            <SlidersHorizontal size={16} />
            <select
              className="select-field"
              aria-label="Sort products"
              value={sort ?? "newest"}
              onChange={event => setParam("sort", event.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="best_selling">Best selling</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="discount">Best value</option>
            </select>
          </div>
        </div>

        <div
          className="filter-row catalog-category-row"
          style={{ marginTop: 18 }}
        >
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className={`filter-pill relative ${!category ? "filter-pill--active" : ""}`}
            onClick={() => setParam("category")}
          >
            All pairs
          </motion.button>
          {categories.data?.map(item => (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              key={item.id}
              className={`filter-pill relative ${category === item.slug ? "filter-pill--active" : ""}`}
              onClick={() => setParam("category", item.slug)}
            >
              {item.name}
            </motion.button>
          ))}
        </div>

        <div className="mobile-filter-drawer">
          <button
            className="mobile-filter-trigger"
            onClick={() => setMobileFiltersOpen(value => !value)}
            aria-expanded={mobileFiltersOpen}
          >
            <SlidersHorizontal size={15} /> Filter &amp; sort{" "}
            <span>{mobileFiltersOpen ? "−" : "+"}</span>
          </button>
          <AnimatePresence>
            {mobileFiltersOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: luxuryEase }}
                className="mobile-filter-drawer__body overflow-hidden"
              >
                <form
                  className="search-field"
                  onSubmit={event => {
                    submitSearch(event);
                    setMobileFiltersOpen(false);
                  }}
                >
                  <Search size={16} />
                  <input
                    value={searchValue}
                    onChange={event => setSearchValue(event.target.value)}
                    placeholder="Search footwear"
                  />
                  <button className="button-text" type="submit">
                    Search
                  </button>
                </form>
                <select
                  className="select-field"
                  aria-label="Sort products"
                  value={pendingSort}
                  onChange={event => setPendingSort(event.target.value)}
                >
                  <option value="newest">Newest</option>
                  <option value="best_selling">Best selling</option>
                  <option value="price_asc">Price: low to high</option>
                  <option value="price_desc">Price: high to low</option>
                  <option value="discount">Best value</option>
                </select>
                <div className="filter-row">
                  <button
                    className={`filter-pill ${!pendingCategory ? "filter-pill--active" : ""}`}
                    onClick={() => setPendingCategory("")}
                  >
                    All pairs
                  </button>
                  {categories.data?.map(item => (
                    <button
                      key={item.id}
                      className={`filter-pill ${pendingCategory === item.slug ? "filter-pill--active" : ""}`}
                      onClick={() => setPendingCategory(item.slug)}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
                <div className="mobile-filter-actions">
                  <button className="button-secondary" onClick={clearFilters}>
                    Clear
                  </button>
                  <button className="button-primary" onClick={applyMobileFilters}>
                    Apply filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="catalog-result-row">
          <p className="catalog-result">
            {products.isLoading
              ? "Searching the collection…"
              : `${products.data?.length ?? 0} pair${(products.data?.length ?? 0) === 1 ? "" : "s"} found`}
          </p>
          {(category || sort || params.get("q")) && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="button-text"
              onClick={clearFilters}
            >
              Clear filters
            </motion.button>
          )}
        </div>

        {products.isLoading ? (
          <div className="product-grid">
            {Array.from({ length: 8 }).map((_, index) => (
              <div className="product-skeleton" key={index}>
                <div />
                <span />
                <span />
              </div>
            ))}
          </div>
        ) : products.data?.length ? (
          <motion.div
            key={`${category}-${sort}-${params.get("q")}`}
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
            className="product-grid"
          >
            {(products.data as StoreProduct[]).map(product => (
              <motion.div variants={staggerItemVariants} key={product.id}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: luxuryEase }}
            className="empty-state"
          >
            <strong>No footwear matches this search yet.</strong>
            <p>
              Try another term, clear your filters, or browse the full
              collection.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={microSpring}
              className="button-secondary"
              onClick={clearFilters}
            >
              View all pairs
            </motion.button>
          </motion.div>
        )}
      </div>
    </StorefrontLayout>
  );
}
