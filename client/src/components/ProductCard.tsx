import { Heart, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { gentleSpring, microSpring } from "@/lib/motion";

export type StoreProduct = {
  id: number;
  name: string;
  slug: string;
  material: string | null;
  basePrice: string;
  salePrice: string | null;
  image: string | null;
  isNew: number;
  bestSeller: number;
  categoryName?: string | null;
};

export const pkr = (value: number | string) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(Number(value));

export function ProductCard({ product }: { product: StoreProduct }) {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [saved, setSaved] = useState(false);
  const toggleWishlist = trpc.wishlist.toggle.useMutation({
    onSuccess: result => {
      setSaved(result.saved);
      toast.success(
        result.saved ? "Saved to wishlist" : "Removed from wishlist"
      );
      utils.wishlist.get.invalidate();
    },
    onError: error => toast.error(error.message),
  });

  const savings = product.salePrice
    ? Number(product.basePrice) - Number(product.salePrice)
    : 0;

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={gentleSpring}
      className={`product-card group ${saved ? "product-card--saved" : ""}`}
    >
      <Link
        className="product-card__image overflow-hidden relative block"
        href={`/product/${product.slug}`}
        aria-label={`View ${product.name}`}
      >
        {product.image ? (
          <motion.img
            loading="lazy"
            src={product.image}
            alt={product.name}
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          />
        ) : (
          <div className="product-card__image--empty">Image pending</div>
        )}
        <div className="product-card__badges">
          {product.isNew === 1 && (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="product-card__badge"
            >
              New
            </motion.span>
          )}
          {product.bestSeller === 1 && (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="product-card__badge product-card__badge--clay"
            >
              Bestseller
            </motion.span>
          )}
          {savings > 0 && (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="product-card__badge product-card__badge--sale"
            >
              Sale
            </motion.span>
          )}
        </div>
        <div className="product-card__quick-action">
          <span>View pair</span>
          <ArrowUpRight size={14} />
        </div>
      </Link>
      <motion.button
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.85 }}
        transition={microSpring}
        className={`product-card__wish ${saved ? "product-card__wish--saved" : ""}`}
        aria-label={`${saved ? "Remove" : "Save"} ${product.name}`}
        aria-pressed={saved}
        disabled={toggleWishlist.isPending}
        onClick={() => {
          if (!isAuthenticated) return startLogin();
          toggleWishlist.mutate({ productId: product.id });
        }}
      >
        <motion.span
          animate={saved ? { scale: [1, 1.3, 1] } : { scale: 1 }}
          transition={microSpring}
          style={{ display: "inline-flex" }}
        >
          <Heart fill={saved ? "currentColor" : "none"} size={16} />
        </motion.span>
      </motion.button>
      <div className="product-card__meta">
        <Link href={`/product/${product.slug}`}>
          <h3 className="product-card__name">{product.name}</h3>
        </Link>
        <div className="product-card__sub">
          <span>{product.categoryName ?? product.material ?? "Footwear"}</span>
          {savings > 0 && (
            <span className="price-sale">Save {pkr(savings)}</span>
          )}
        </div>
        <div className="product-card__price">
          {pkr(product.salePrice ?? product.basePrice)}
          {product.salePrice && (
            <span className="price-old">{pkr(product.basePrice)}</span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
