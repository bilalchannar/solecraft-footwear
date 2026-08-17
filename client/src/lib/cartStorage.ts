export type GuestCartItem = {
  id: number;
  variantId: number;
  quantity: number;
  variant: {
    id: number;
    productId?: number;
    size: string;
    color: string;
    colorHex?: string | null;
    sku?: string | null;
    priceOverride?: string | null;
    salePriceOverride?: string | null;
    imageUrl?: string | null;
  };
  product: {
    id: number;
    publicId: string;
    name: string;
    slug: string;
    material: string | null;
    basePrice: string;
    salePrice: string | null;
    image: string | null;
  };
};

const CART_KEY = "solecraft_guest_cart_v1";

export function getGuestCart(): GuestCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveGuestCart(items: GuestCartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("solecraft_cart_updated", { detail: items }));
  } catch (err) {
    console.error("Failed to save cart to localStorage", err);
  }
}

export function addGuestCartItem(
  item: Omit<GuestCartItem, "id"> & { id?: number }
): GuestCartItem[] {
  const current = getGuestCart();
  const existingIndex = current.findIndex(i => i.variantId === item.variantId);
  if (existingIndex > -1) {
    current[existingIndex].quantity = Math.min(
      12,
      current[existingIndex].quantity + item.quantity
    );
  } else {
    current.push({
      ...item,
      id: item.id ?? item.variantId,
    });
  }
  saveGuestCart(current);
  return current;
}

export function updateGuestCartQuantity(
  variantId: number,
  quantity: number
): GuestCartItem[] {
  let current = getGuestCart();
  if (quantity <= 0) {
    current = current.filter(i => i.variantId !== variantId);
  } else {
    const idx = current.findIndex(i => i.variantId === variantId);
    if (idx > -1) {
      current[idx].quantity = Math.min(12, quantity);
    }
  }
  saveGuestCart(current);
  return current;
}

export function removeGuestCartItem(variantId: number): GuestCartItem[] {
  const current = getGuestCart().filter(i => i.variantId !== variantId);
  saveGuestCart(current);
  return current;
}

export function clearGuestCart() {
  saveGuestCart([]);
}
