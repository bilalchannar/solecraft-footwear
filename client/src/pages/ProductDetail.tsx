import {
  Check,
  CheckCircle2,
  Heart,
  Loader2,
  Minus,
  Plus,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { pkr } from "@/components/ProductCard";
import { StorefrontLayout } from "@/components/StorefrontLayout";
import { SizeGuideModal } from "@/components/SizeGuideModal";
import { addGuestCartItem } from "@/lib/cartStorage";
import { trpc } from "@/lib/trpc";
import { luxuryEase, microSpring } from "@/lib/motion";

export default function ProductDetail({
  params: routeParams,
}: {
  params?: { slug?: string };
}) {
  const [, hookParams] = useRoute<{ slug: string }>("/product/:slug");
  const slug = routeParams?.slug ?? hookParams?.slug ?? "";
  const productQuery = trpc.storefront.product.useQuery(
    { slug },
    { enabled: Boolean(slug) }
  );
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    null
  );
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [saved, setSaved] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const product = productQuery.data;

  useEffect(() => {
    if (product?.variants[0]?.variant.id)
      setSelectedVariantId(product.variants[0].variant.id);
  }, [product?.product.id]);

  const selectedVariant = useMemo(
    () =>
      product?.variants.find(row => row.variant.id === selectedVariantId) ??
      product?.variants[0],
    [product?.variants, selectedVariantId]
  );

  const addCart = trpc.cart.add.useMutation({
    onSuccess: () => {
      setJustAdded(true);
      toast.success("Added to your bag");
      utils.cart.get.invalidate();
      setTimeout(() => setJustAdded(false), 2400);
    },
    onError: error => toast.error(error.message),
  });

  const toggleWishlist = trpc.wishlist.toggle.useMutation({
    onSuccess: result => {
      setSaved(result.saved);
      toast.success(
        result.saved ? "Saved to your wishlist" : "Removed from wishlist"
      );
      utils.wishlist.get.invalidate();
    },
    onError: error => toast.error(error.message),
  });

  if (productQuery.isLoading)
    return (
      <StorefrontLayout>
        <div className="site-container product-detail product-detail--loading">
          <div className="product-detail__grid">
            <div className="product-skeleton">
              <div />
            </div>
            <div>
              <div className="skeleton-line skeleton-line--short" />
              <div className="skeleton-line skeleton-line--title" />
              <div
                className="skeleton-line"
                style={{ width: "90%", height: 16, marginTop: 12 }}
              />
              <div
                className="skeleton-line"
                style={{ width: "60%", height: 16, marginTop: 8 }}
              />
            </div>
          </div>
        </div>
      </StorefrontLayout>
    );

  if (!product)
    return (
      <StorefrontLayout>
        <div className="site-container product-detail">
          <div className="empty-state">
            This pair is not available.{" "}
            <Link className="button-text" href="/shop">
              Return to the shop
            </Link>
          </div>
        </div>
      </StorefrontLayout>
    );

  const fallbackImage = "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80";
  const images = (product.images && product.images.length > 0)
    ? product.images
    : selectedVariant?.variant.imageUrl
      ? [
          {
            id: 0,
            url: selectedVariant.variant.imageUrl,
            altText: product.product.name,
          },
        ]
      : [
          {
            id: 0,
            url: fallbackImage,
            altText: product.product.name,
          },
        ];

  const salePrice = Number(
    selectedVariant?.variant.salePriceOverride ??
      product.product.salePrice ??
      selectedVariant?.variant.priceOverride ??
      product.product.basePrice
  );
  const regularPrice = Number(
    selectedVariant?.variant.priceOverride ?? product.product.basePrice
  );
  const stock = Math.max(
    1,
    (selectedVariant?.stock ?? 12) - (selectedVariant?.reserved ?? 0)
  );
  const sizeVariants = (product.variants ?? []).filter(
    row => !selectedVariant?.variant.color || row.variant.color === selectedVariant?.variant.color
  );
  const colorVariants = (product.variants ?? []).filter(
    (row, index, all) =>
      all.findIndex(item => item.variant.color === row.variant.color) === index
  );
  const productDescription =
    product.product.description ??
    product.product.shortDescription ??
    "Considered Pakistani footwear for everyday movement.";

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <StorefrontLayout
      seo={{
        title: `${product.product.name} | SoleCraft Pakistan`,
        description: productDescription,
        schema: {
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.product.name,
          description: productDescription,
          image: images.map(image => image.url),
          brand: { "@type": "Brand", name: "SoleCraft" },
          offers: {
            "@type": "Offer",
            priceCurrency: "PKR",
            price: salePrice.toFixed(2),
            availability:
              stock > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            url: `${origin}/product/${product.product.slug}`,
          },
          breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: `${origin}/`,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Shop",
                item: `${origin}/shop`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: product.product.name,
                item: `${origin}/product/${product.product.slug}`,
              },
            ],
          },
        },
      }}
    >
      <div className="site-container product-detail">
        <div className="breadcrumb">
          <Link href="/">Home</Link> / <Link href="/shop">Shop</Link> /{" "}
          {product.product.name}
        </div>
        <div className="product-detail__grid">
          <div className="product-gallery">
            <div className="product-gallery__thumbs">
              {images.map((image, index) => (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`View ${product.product.name} image ${index + 1}`}
                  className={`product-gallery__thumb relative ${imageIndex === index ? "product-gallery__thumb--active" : ""}`}
                  key={image.id}
                  onClick={() => setImageIndex(index)}
                >
                  <img
                    loading="lazy"
                    src={image.url}
                    alt={image.altText ?? product.product.name}
                  />
                  {imageIndex === index && (
                    <motion.span
                      layoutId="thumb-active-border"
                      className="product-gallery__thumb-ring"
                      transition={microSpring}
                    />
                  )}
                </motion.button>
              ))}
            </div>
            <div className="product-gallery__main overflow-hidden relative">
              <AnimatePresence mode="wait">
                {images[imageIndex] ? (
                  <motion.img
                    key={images[imageIndex].url}
                    src={images[imageIndex].url}
                    alt={images[imageIndex].altText ?? product.product.name}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.35, ease: luxuryEase }}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="product-card__image--empty">
                    Product images will appear here.
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: luxuryEase }}
            className="product-info"
          >
            <span className="eyebrow">
              {product.category?.name ??
                product.product.material ??
                "SoleCraft footwear"}
            </span>
            <h1 className="display">{product.product.name}</h1>
            <p className="product-info__copy">{productDescription}</p>
            <div className="product-info__price">
              {pkr(salePrice)}
              {salePrice < regularPrice && (
                <span className="price-old">{pkr(regularPrice)}</span>
              )}
            </div>

            <div className="option-label">
              Colour <span>{selectedVariant?.variant.color}</span>
            </div>
            <div className="color-options">
              {colorVariants.map(row => (
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  title={row.variant.color}
                  aria-label={`Choose ${row.variant.color}`}
                  className={`color-option ${row.variant.color === selectedVariant?.variant.color ? "color-option--active" : ""}`}
                  key={row.variant.id}
                  style={{ backgroundColor: row.variant.colorHex ?? "#5f615a" }}
                  onClick={() => setSelectedVariantId(row.variant.id)}
                />
              ))}
            </div>

            <div className="option-label flex items-center justify-between">
              <div>
                Size{" "}
                <span className={stock ? "stock-ready" : "stock-empty"}>
                  {stock ? `${stock} available` : "Out of stock"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                className="text-xs text-[var(--moss)] hover:underline flex items-center gap-1 font-semibold cursor-pointer bg-transparent border-0 p-0"
              >
                <Ruler size={13} />
                <span>Size Guide</span>
              </button>
            </div>
            <div className="size-options">
              {sizeVariants.map(row => (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`size-option ${row.variant.id === selectedVariant?.variant.id ? "size-option--active" : ""}`}
                  key={row.variant.id}
                  onClick={() => setSelectedVariantId(row.variant.id)}
                  disabled={
                    row.variant.availability !== "available" ||
                    (row.stock ?? 0) <= 0
                  }
                >
                  {row.variant.size}
                </motion.button>
              ))}
            </div>

            <div className="quantity-row">
              <div className="quantity-stepper">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(value => Math.max(1, value - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus size={15} />
                </motion.button>
                <span>{quantity}</span>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  disabled={quantity >= stock}
                  onClick={() =>
                    setQuantity(value =>
                      Math.min(Math.max(stock, 1), value + 1)
                    )
                  }
                  aria-label="Increase quantity"
                >
                  <Plus size={15} />
                </motion.button>
              </div>

              {/* Multi-state Add to Bag Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={microSpring}
                className={`button-primary inline-flex items-center justify-center gap-2 ${
                  justAdded ? "bg-[var(--moss)] text-white border-[var(--moss)]" : ""
                }`}
                disabled={addCart.isPending}
                onClick={() => {
                  const targetVariant = selectedVariant ?? product.variants[0];
                  if (!targetVariant) {
                    toast.error("Please choose your size first");
                    return;
                  }
                  if (isAuthenticated) {
                    addCart.mutate({
                      variantId: targetVariant.variant.id,
                      quantity,
                    });
                  } else {
                    addGuestCartItem({
                      variantId: targetVariant.variant.id,
                      quantity,
                      variant: targetVariant.variant,
                      product: {
                        id: product.product.id,
                        publicId: product.product.publicId,
                        name: product.product.name,
                        slug: product.product.slug,
                        material: product.product.material,
                        basePrice: product.product.basePrice,
                        salePrice: product.product.salePrice,
                        image: images[0]?.url ?? null,
                      },
                    });
                    setJustAdded(true);
                    toast.success("Added to your bag!");
                    utils.cart.get.invalidate();
                    setTimeout(() => setJustAdded(false), 2400);
                  }
                }}
              >
                {addCart.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Adding to bag…</span>
                  </>
                ) : justAdded ? (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Added to your bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} />
                    <span>Add to bag</span>
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                transition={microSpring}
                className="icon-button"
                aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
                disabled={toggleWishlist.isPending}
                onClick={() => {
                  if (isAuthenticated) {
                    toggleWishlist.mutate({ productId: product.product.id });
                  } else {
                    setSaved(!saved);
                    toast.success(
                      !saved ? "Saved to your wishlist" : "Removed from wishlist"
                    );
                  }
                }}
              >
                <Heart fill={saved ? "currentColor" : "none"} size={18} />
              </motion.button>
            </div>

            <div className="product-promise">
              <div>
                <Truck size={15} /> Free Pakistan-wide delivery over PKR 4,000 with live SMS tracking.
              </div>
              <div>
                <ShieldCheck size={15} /> Cash on delivery with open parcel inspection allowed on doorstep.
              </div>
              <div>
                <Check size={15} /> 14-day hassle-free size exchange guarantee nationwide.
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
      />

      {product.reviews.length > 0 && (
        <section className="section">
          <div className="section-head">
            <div>
              <span className="eyebrow">Verified customer feedback</span>
              <h2 className="display section-title">Thoughts from the sole.</h2>
            </div>
          </div>
          <div className="product-grid">
            {product.reviews.map(row => (
              <article className="summary-card" key={row.review.id}>
                <strong>{row.reviewer ?? "Verified customer"}</strong>
                <p style={{ color: "var(--clay)", margin: "8px 0" }}>
                  {"★".repeat(row.review.rating)}
                </p>
                <p
                  style={{ margin: 0, color: "var(--muted)", lineHeight: 1.6 }}
                >
                  {row.review.body}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}
    </StorefrontLayout>
  );
}
