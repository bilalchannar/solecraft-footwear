import { Link } from "wouter";
import { StorefrontLayout } from "@/components/StorefrontLayout";

export default function StaticPage({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <StorefrontLayout>
      <div className="site-container catalog-page">
        <div className="breadcrumb">
          <Link href="/">Home</Link> / {title}
        </div>
        <h1 className="display catalog-title">{title}</h1>
        <div className="summary-card" style={{ maxWidth: 740, marginTop: 28 }}>
          <p style={{ margin: 0, lineHeight: 1.75, color: "var(--muted)" }}>
            {body}
          </p>
        </div>
      </div>
    </StorefrontLayout>
  );
}
