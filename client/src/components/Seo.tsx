import { useEffect } from "react";

const defaultDescription = "SoleCraft is a premium Pakistani footwear store for considered everyday pairs, traditional craft, and modern movement.";

type SeoProps = {
  pathname: string;
  title?: string;
  description?: string;
  schema?: Record<string, unknown>;
};

function setMeta(name: string, content: string) {
  let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!tag) { tag = document.createElement("meta"); tag.name = name; document.head.appendChild(tag); }
  tag.content = content;
}

function setProperty(property: string, content: string) {
  let tag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!tag) { tag = document.createElement("meta"); tag.setAttribute("property", property); document.head.appendChild(tag); }
  tag.content = content;
}

export function Seo({ pathname, title, description, schema }: SeoProps) {
  useEffect(() => {
    const resolvedTitle = title ?? (pathname === "/" ? "SoleCraft | Premium Pakistani Footwear" : pathname.startsWith("/shop") ? "Shop Footwear | SoleCraft Pakistan" : pathname.startsWith("/product/") ? "Footwear Details | SoleCraft Pakistan" : pathname.startsWith("/about") ? "Our Craft | SoleCraft Pakistan" : "SoleCraft Pakistan");
    const resolvedDescription = description ?? defaultDescription;
    document.title = resolvedTitle;
    setMeta("description", resolvedDescription);
    setProperty("og:title", resolvedTitle);
    setProperty("og:description", resolvedDescription);
    setProperty("og:url", `${window.location.origin}${pathname}`);
    setProperty("og:type", schema?.["@type"] === "Product" ? "product" : "website");
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = `${window.location.origin}${pathname}`;
    let schemaTag = document.getElementById("solecraft-store-schema") as HTMLScriptElement | null;
    if (!schemaTag) { schemaTag = document.createElement("script"); schemaTag.type = "application/ld+json"; schemaTag.id = "solecraft-store-schema"; document.head.appendChild(schemaTag); }
    schemaTag.text = JSON.stringify(schema ?? { "@context": "https://schema.org", "@type": "ShoeStore", name: "SoleCraft", description: resolvedDescription, url: window.location.origin, priceRange: "PKR", address: { "@type": "PostalAddress", addressCountry: "PK" } });
  }, [description, pathname, schema, title]);
  return null;
}
