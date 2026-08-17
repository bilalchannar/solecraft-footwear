import { Link } from "wouter";
import { AccountLayout } from "@/components/AccountLayout";
import { ProductCard, type StoreProduct } from "@/components/ProductCard";
import { trpc } from "@/lib/trpc";

export default function Wishlist() { const wishlist = trpc.wishlist.get.useQuery(); return <AccountLayout title="Saved pairs"><div className="account-section wishlist-section">{wishlist.isLoading ? <div className="product-grid product-grid--skeleton" aria-label="Loading saved pairs"><div className="product-card-skeleton" /><div className="product-card-skeleton" /><div className="product-card-skeleton" /></div> : wishlist.data?.length ? <div className="product-grid">{(wishlist.data as StoreProduct[]).map(product => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-state account-empty"><strong>Save the pairs that speak to you.</strong><span>Build a considered wishlist from any product card, then return when the timing is right.</span><Link className="button-secondary" href="/shop">Browse footwear</Link></div>}</div></AccountLayout>; }
