export interface MockProduct {
  id: number;
  publicId: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  material: string;
  basePrice: string;
  salePrice: string | null;
  featured: number;
  isNew: number;
  bestSeller: number;
  status: string;
  categoryName: string;
  categorySlug: string;
  brandName: string;
  image: string;
  images: { id: number; url: string; altText: string }[];
  variants: {
    variant: {
      id: number;
      sku: string;
      size: string;
      color: string;
      colorHex: string;
      imageUrl: string;
      priceOverride: string | null;
      salePriceOverride: string | null;
      availability: "available" | "backorder" | "discontinued";
    };
    stock: number;
    reserved: number;
  }[];
  reviews: {
    review: {
      id: number;
      rating: number;
      title: string;
      body: string;
      createdAt: Date;
    };
    reviewer: string;
  }[];
}

import type { banners, categories } from "../drizzle/schema";

export type CategoryRecord = typeof categories.$inferSelect;
export type BannerRecord = typeof banners.$inferSelect;

export const MOCK_CATEGORIES: CategoryRecord[] = [
  {
    id: 1,
    publicId: "cat_peshawari",
    name: "Peshawari Chappal",
    slug: "peshawari",
    description: "Iconic traditional handcrafted footwear with double sole craftsmanship.",
    imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
    active: 1,
    sortOrder: 1,
    parentId: null,
    seoTitle: "Peshawari Chappal | SoleCraft",
    seoDescription: "Authentic handcrafted Peshawari chappals made in Pakistan.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    publicId: "cat_khussa",
    name: "Artisanal Khussa",
    slug: "khussa",
    description: "Delicately embroidered and pure leather traditional Khussa.",
    imageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
    active: 1,
    sortOrder: 2,
    parentId: null,
    seoTitle: "Artisanal Khussa | SoleCraft",
    seoDescription: "Hand-embroidered pure leather khussas.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    publicId: "cat_kaptaan",
    name: "Kaptaan & Norozi",
    slug: "norozi",
    description: "Heavy-duty tyre sole and pure cowhide leather traditional classics.",
    imageUrl: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80",
    active: 1,
    sortOrder: 3,
    parentId: null,
    seoTitle: "Kaptaan & Norozi Chappal | SoleCraft",
    seoDescription: "Pure cowhide leather double sole traditional footwear.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    publicId: "cat_modern",
    name: "Modern Loafers & Oxfords",
    slug: "loafers",
    description: "Formal and contemporary footwear crafted for versatile lifestyle.",
    imageUrl: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=800&q=80",
    active: 1,
    sortOrder: 4,
    parentId: null,
    seoTitle: "Modern Loafers & Oxfords | SoleCraft",
    seoDescription: "Everyday leather loafers and dress oxfords.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 5,
    publicId: "cat_sandals",
    name: "Sandals & Kolhapuri",
    slug: "sandals",
    description: "Lightweight breathable leather sandals and mules for warm seasons.",
    imageUrl: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80",
    active: 1,
    sortOrder: 5,
    parentId: null,
    seoTitle: "Sandals & Kolhapuri | SoleCraft",
    seoDescription: "Hand-braided leather sandals and mules.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const MOCK_BANNERS: BannerRecord[] = [
  {
    id: 1,
    publicId: "ban_1",
    placement: "hero",
    title: "Steps crafted for your everyday journey.",
    subtitle: "Grounded in authentic Pakistani craft, refined for every direction you take.",
    imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=85",
    mobileImageUrl: null,
    href: "/shop",
    active: 1,
    sortOrder: 1,
    startsAt: null,
    endsAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    publicId: "ban_2",
    placement: "hero",
    title: "Timeless handcrafted leather silhouettes.",
    subtitle: "Occasion-ready Peshawari and artisanal Khussa made with intent.",
    imageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=85",
    mobileImageUrl: null,
    href: "/shop?category=khussa",
    active: 1,
    sortOrder: 2,
    startsAt: null,
    endsAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    publicId: "ban_3",
    placement: "hero",
    title: "Everyday modern comfort & movement.",
    subtitle: "Minimalist leather loafers and mules designed to remain part of your rotation.",
    imageUrl: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=1200&q=85",
    mobileImageUrl: null,
    href: "/shop?category=loafers",
    active: 1,
    sortOrder: 3,
    startsAt: null,
    endsAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const MOCK_PRODUCTS: MockProduct[] = [
  // 1. Peshawari Chappal
  {
    id: 1,
    publicId: "prod_peshawari_mustard",
    name: "Classic Mustard Peshawari Chappal",
    slug: "classic-mustard-peshawari-chappal",
    shortDescription: "Hand-stitched full grain mustard leather with durable tyre sole.",
    description: "Our signature Peshawari Chappal is constructed using premium vegetable-tanned cowhide leather. Featuring the iconic semi-pointed toe, padded insole for all-day comfort, and a resilient treaded outsole made for Pakistani terrain.",
    material: "Full Grain Cowhide Leather",
    basePrice: "6500",
    salePrice: "5499",
    featured: 1,
    isNew: 1,
    bestSeller: 1,
    status: "active",
    categoryName: "Peshawari Chappal",
    categorySlug: "peshawari",
    brandName: "SoleCraft Heritage",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
    images: [
      { id: 101, url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80", altText: "Mustard Peshawari Chappal Angle" },
      { id: 102, url: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80", altText: "Mustard Peshawari Chappal Top View" },
    ],
    variants: [
      {
        variant: {
          id: 1001,
          sku: "PSH-MST-41",
          size: "41",
          color: "Mustard Tan",
          colorHex: "#C59B27",
          imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
          priceOverride: null,
          salePriceOverride: null,
          availability: "available",
        },
        stock: 14,
        reserved: 0,
      },
      {
        variant: {
          id: 1002,
          sku: "PSH-MST-42",
          size: "42",
          color: "Mustard Tan",
          colorHex: "#C59B27",
          imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
          priceOverride: null,
          salePriceOverride: null,
          availability: "available",
        },
        stock: 22,
        reserved: 0,
      },
      {
        variant: {
          id: 1003,
          sku: "PSH-MST-43",
          size: "43",
          color: "Mustard Tan",
          colorHex: "#C59B27",
          imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
          priceOverride: null,
          salePriceOverride: null,
          availability: "available",
        },
        stock: 16,
        reserved: 0,
      },
      {
        variant: {
          id: 1004,
          sku: "PSH-MST-44",
          size: "44",
          color: "Mustard Tan",
          colorHex: "#C59B27",
          imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
          priceOverride: null,
          salePriceOverride: null,
          availability: "available",
        },
        stock: 12,
        reserved: 0,
      },
    ],
    reviews: [
      {
        review: {
          id: 501,
          rating: 5,
          title: "Exceptional craft and comfort",
          body: "The leather quality is top-notch. Very comfortable for Friday prayers and family gatherings in Lahore. Highly recommended!",
          createdAt: new Date(),
        },
        reviewer: "Hamza Tariq",
      },
    ],
  },
  {
    id: 11,
    publicId: "prod_peshawari_dark_tan",
    name: "Shikarpuri Dark Tan Peshawari",
    slug: "shikarpuri-dark-tan-peshawari",
    shortDescription: "Rich mahogany brown leather with hand-braided border and tyre tread sole.",
    description: "Crafted in the authentic Shikarpuri tradition with double welted edges and natural vegetable tanned leather that develops a deep patina over time.",
    material: "Full Grain Cowhide Leather",
    basePrice: "6800",
    salePrice: "5999",
    featured: 1,
    isNew: 1,
    bestSeller: 0,
    status: "active",
    categoryName: "Peshawari Chappal",
    categorySlug: "peshawari",
    brandName: "SoleCraft Heritage",
    image: "https://images.unsplash.com/photo-1549298916-f52d724204b4?auto=format&fit=crop&w=800&q=80",
    images: [
      { id: 111, url: "https://images.unsplash.com/photo-1549298916-f52d724204b4?auto=format&fit=crop&w=800&q=80", altText: "Dark Tan Peshawari" },
    ],
    variants: [
      {
        variant: {
          id: 1015,
          sku: "PSH-BRN-42",
          size: "42",
          color: "Dark Mahogany",
          colorHex: "#4A2E18",
          imageUrl: "https://images.unsplash.com/photo-1549298916-f52d724204b4?auto=format&fit=crop&w=800&q=80",
          priceOverride: null,
          salePriceOverride: null,
          availability: "available",
        },
        stock: 15,
        reserved: 0,
      },
      {
        variant: {
          id: 1016,
          sku: "PSH-BRN-43",
          size: "43",
          color: "Dark Mahogany",
          colorHex: "#4A2E18",
          imageUrl: "https://images.unsplash.com/photo-1549298916-f52d724204b4?auto=format&fit=crop&w=800&q=80",
          priceOverride: null,
          salePriceOverride: null,
          availability: "available",
        },
        stock: 18,
        reserved: 0,
      },
    ],
    reviews: [],
  },

  // 2. Kaptaan & Norozi
  {
    id: 2,
    publicId: "prod_norozi_black",
    name: "Artisanal Norozi Chappal (Double Gear Sole)",
    slug: "artisanal-norozi-chappal-double-gear-sole",
    shortDescription: "Heavyweight traditional Balochi Norozi Chappal with hand-carved finish.",
    description: "Built with thick cowhide leather and distinctive contrast stitching. The Norozi design features a wide strap profile and reinforced double gear sole engineered for durability and authentic presence.",
    material: "Oil-Pulled Cowhide Leather",
    basePrice: "7800",
    salePrice: "6999",
    featured: 1,
    isNew: 1,
    bestSeller: 1,
    status: "active",
    categoryName: "Kaptaan & Norozi",
    categorySlug: "norozi",
    brandName: "SoleCraft Heritage",
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80",
    images: [
      { id: 103, url: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80", altText: "Norozi Chappal Angle" },
    ],
    variants: [
      {
        variant: {
          id: 1005,
          sku: "NRZ-BLK-42",
          size: "42",
          color: "Deep Walnut",
          colorHex: "#382216",
          imageUrl: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80",
          priceOverride: null,
          salePriceOverride: null,
          availability: "available",
        },
        stock: 18,
        reserved: 0,
      },
      {
        variant: {
          id: 1006,
          sku: "NRZ-BLK-43",
          size: "43",
          color: "Deep Walnut",
          colorHex: "#382216",
          imageUrl: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80",
          priceOverride: null,
          salePriceOverride: null,
          availability: "available",
        },
        stock: 14,
        reserved: 0,
      },
    ],
    reviews: [],
  },
  {
    id: 5,
    publicId: "prod_kaptaan_matte",
    name: "Prime Kaptaan Chappal (Matte Black)",
    slug: "prime-kaptaan-chappal-matte-black",
    shortDescription: "Iconic square-toe Kaptaan chappal with thick tyre sole.",
    description: "Worn by leaders and dignitaries across Pakistan. The Kaptaan Chappal offers authoritative presence, wide cross straps, and robust hand-stitched welt.",
    material: "Full Grain Cowhide Leather",
    basePrice: "7200",
    salePrice: "6499",
    featured: 1,
    isNew: 0,
    bestSeller: 1,
    status: "active",
    categoryName: "Kaptaan & Norozi",
    categorySlug: "norozi",
    brandName: "SoleCraft Heritage",
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80",
    images: [
      { id: 106, url: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80", altText: "Kaptaan Chappal Matte Black" },
    ],
    variants: [
      {
        variant: {
          id: 1010,
          sku: "KPT-BLK-42",
          size: "42",
          color: "Matte Black",
          colorHex: "#111111",
          imageUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80",
          priceOverride: null,
          salePriceOverride: null,
          availability: "available",
        },
        stock: 25,
        reserved: 0,
      },
      {
        variant: {
          id: 1011,
          sku: "KPT-BLK-43",
          size: "43",
          color: "Matte Black",
          colorHex: "#111111",
          imageUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80",
          priceOverride: null,
          salePriceOverride: null,
          availability: "available",
        },
        stock: 20,
        reserved: 0,
      },
    ],
    reviews: [],
  },

  // 3. Artisanal Khussa
  {
    id: 3,
    publicId: "prod_khussa_tilla",
    name: "Handmade Tilla Embroidered Khussa",
    slug: "handmade-tilla-embroidered-khussa",
    shortDescription: "Traditional festive Khussa with intricate gold dabka & tilla work.",
    description: "Crafted by heritage artisans in Kasur and Multan. Made on organic vegetable-tanned leather with padded leather insole and authentic metallic thread embroidery perfect for weddings and celebratory festivities.",
    material: "Velvet & Gold Tilla Embroidery",
    basePrice: "5200",
    salePrice: "4499",
    featured: 1,
    isNew: 1,
    bestSeller: 1,
    status: "active",
    categoryName: "Artisanal Khussa",
    categorySlug: "khussa",
    brandName: "SoleCraft Heritage",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
    images: [
      { id: 104, url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80", altText: "Tilla Khussa Front View" },
    ],
    variants: [
      {
        variant: {
          id: 1007,
          sku: "KHS-GLD-41",
          size: "41",
          color: "Antique Gold",
          colorHex: "#D4AF37",
          imageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
          priceOverride: null,
          salePriceOverride: null,
          availability: "available",
        },
        stock: 12,
        reserved: 0,
      },
      {
        variant: {
          id: 1008,
          sku: "KHS-GLD-42",
          size: "42",
          color: "Antique Gold",
          colorHex: "#D4AF37",
          imageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
          priceOverride: null,
          salePriceOverride: null,
          availability: "available",
        },
        stock: 16,
        reserved: 0,
      },
    ],
    reviews: [],
  },
  {
    id: 12,
    publicId: "prod_khussa_kasuri_raw",
    name: "Raw Kasuri Tan Leather Khussa",
    slug: "raw-kasuri-tan-leather-khussa",
    shortDescription: "Minimalist untreated tan cow leather khussa with rounded toe.",
    description: "Simple, honest, and timeless. Hand-shaped from soft calfskin leather without heavy embroidery. Shapes to your foot like a glove with everyday wear.",
    material: "Full Grain Cowhide Leather",
    basePrice: "4800",
    salePrice: "3999",
    featured: 0,
    isNew: 1,
    bestSeller: 1,
    status: "active",
    categoryName: "Artisanal Khussa",
    categorySlug: "khussa",
    brandName: "SoleCraft Heritage",
    image: "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?auto=format&fit=crop&w=800&q=80",
    images: [
      { id: 112, url: "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?auto=format&fit=crop&w=800&q=80", altText: "Raw Kasuri Khussa" },
    ],
    variants: [
      {
        variant: {
          id: 1017,
          sku: "KHS-RAW-42",
          size: "42",
          color: "Raw Honey Tan",
          colorHex: "#C68B59",
          imageUrl: "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?auto=format&fit=crop&w=800&q=80",
          priceOverride: null,
          salePriceOverride: null,
          availability: "available",
        },
        stock: 20,
        reserved: 0,
      },
    ],
    reviews: [],
  },

  // 4. Modern Loafers & Oxfords
  {
    id: 4,
    publicId: "prod_loafer_penny",
    name: "Artisan Burnished Penny Loafer",
    slug: "artisan-burnished-penny-loafer",
    shortDescription: "Hand-burnished Italian crust calf leather with leather sole.",
    description: "A refined classic reimagined by SoleCraft master craftsmen. Featuring hand-painted patina finishing, soft calfskin lining, and leather stacked heel with rubber grip.",
    material: "Full Grain Burnished Leather",
    basePrice: "8900",
    salePrice: "7999",
    featured: 1,
    isNew: 0,
    bestSeller: 1,
    status: "active",
    categoryName: "Modern Loafers & Oxfords",
    categorySlug: "loafers",
    brandName: "SoleCraft Studio",
    image: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=800&q=80",
    images: [
      { id: 105, url: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=800&q=80", altText: "Penny Loafer Side Profile" },
    ],
    variants: [
      {
        variant: {
          id: 1009,
          sku: "LFR-COGNAC-42",
          size: "42",
          color: "Cognac Brown",
          colorHex: "#8B4513",
          imageUrl: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=800&q=80",
          priceOverride: null,
          salePriceOverride: null,
          availability: "available",
        },
        stock: 15,
        reserved: 0,
      },
    ],
    reviews: [],
  },
  {
    id: 8,
    publicId: "prod_derby_dress",
    name: "Classic Cap-Toe Oxford Shoes",
    slug: "classic-cap-toe-oxford-shoes",
    shortDescription: "Formal dress shoe in polished dark espresso leather.",
    description: "Goodyear-welted oxford silhouette tailored for formal occasions, weddings, and executive wear. Hand-finished leather sole with rubber heel cap.",
    material: "Full Grain Burnished Leather",
    basePrice: "9500",
    salePrice: "8499",
    featured: 0,
    isNew: 1,
    bestSeller: 0,
    status: "active",
    categoryName: "Modern Loafers & Oxfords",
    categorySlug: "loafers",
    brandName: "SoleCraft Studio",
    image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80",
    images: [
      { id: 109, url: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80", altText: "Oxford Shoes" },
    ],
    variants: [
      {
        variant: {
          id: 1014,
          sku: "OXF-ESP-42",
          size: "42",
          color: "Espresso Brown",
          colorHex: "#2E1A11",
          imageUrl: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80",
          priceOverride: null,
          salePriceOverride: null,
          availability: "available",
        },
        stock: 16,
        reserved: 0,
      },
    ],
    reviews: [],
  },

  // 5. Sandals & Kolhapuri
  {
    id: 6,
    publicId: "prod_kolhapuri_tan",
    name: "Hand-Braided Kolhapuri Sandal",
    slug: "hand-braided-kolhapuri-sandal",
    shortDescription: "Traditional hand-braided leather chord sandal with natural tan finish.",
    description: "Breathable open sandal handcrafted with vegetable dyed leather. Beautiful braided strap patterns that age gracefully with everyday wear.",
    material: "Vegetable Tanned Leather",
    basePrice: "4500",
    salePrice: "3750",
    featured: 0,
    isNew: 1,
    bestSeller: 0,
    status: "active",
    categoryName: "Sandals & Kolhapuri",
    categorySlug: "sandals",
    brandName: "SoleCraft Artisans",
    image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80",
    images: [
      { id: 107, url: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80", altText: "Kolhapuri Sandal" },
    ],
    variants: [
      {
        variant: {
          id: 1012,
          sku: "KLP-TAN-42",
          size: "42",
          color: "Natural Tan",
          colorHex: "#B87333",
          imageUrl: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80",
          priceOverride: null,
          salePriceOverride: null,
          availability: "available",
        },
        stock: 15,
        reserved: 0,
      },
    ],
    reviews: [],
  },
  {
    id: 7,
    publicId: "prod_suede_mule",
    name: "Minimalist Suede Leather Mule",
    slug: "minimalist-suede-leather-mule",
    shortDescription: "Slip-on casual luxury in sand beige suede leather.",
    description: "Engineered for breathable comfort at home or casual weekend outings. Features an ergonomic contoured footbed and genuine calf suede upper.",
    material: "Calf Suede Leather",
    basePrice: "6800",
    salePrice: null,
    featured: 0,
    isNew: 0,
    bestSeller: 1,
    status: "active",
    categoryName: "Sandals & Kolhapuri",
    categorySlug: "sandals",
    brandName: "SoleCraft Studio",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80",
    images: [
      { id: 108, url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80", altText: "Suede Mule" },
    ],
    variants: [
      {
        variant: {
          id: 1013,
          sku: "SUD-SAN-42",
          size: "42",
          color: "Sand Dune",
          colorHex: "#C2B280",
          imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80",
          priceOverride: null,
          salePriceOverride: null,
          availability: "available",
        },
        stock: 12,
        reserved: 0,
      },
    ],
    reviews: [],
  },
];
