import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Ruler, Sparkles, Check, Compass, HelpCircle, ArrowRight } from "lucide-react";
import { StorefrontLayout } from "@/components/StorefrontLayout";
import { SIZE_CHART, FIT_TIPS } from "@/components/SizeGuideModal";
import { luxuryEase, microSpring } from "@/lib/motion";

export default function SizeGuide() {
  const [unit, setUnit] = useState<"cm" | "inch">("cm");
  const [footLength, setFootLength] = useState<string>("");

  const recommendedSize = footLength
    ? SIZE_CHART.find(row => {
        const val = parseFloat(footLength);
        if (isNaN(val)) return false;
        return unit === "cm" ? val <= row.cm : val <= parseFloat(row.inch);
      }) ?? SIZE_CHART[SIZE_CHART.length - 1]
    : null;

  return (
    <StorefrontLayout
      seo={{
        title: "Footwear Size & Fit Guide | SoleCraft Pakistan",
        description:
          "Find your exact size for handcrafted Peshawari Chappals, Khussas, Loafers, and Oxfords with our Pakistan & International sizing converter and foot measuring guide.",
      }}
    >
      <div className="site-container page-layout py-10">
        <div className="breadcrumb mb-6">
          <Link href="/">Home</Link> / <span>Size Guide</span>
        </div>

        {/* Page Header */}
        <div className="max-w-2xl mb-10">
          <span className="eyebrow">Precision Fit</span>
          <h1 className="display text-3xl md:text-4xl font-serif font-bold text-[var(--ink)] mt-2">
            The SoleCraft Sizing Guide
          </h1>
          <p className="text-sm text-[var(--muted)] mt-3 leading-relaxed">
            Every SoleCraft pair is lasted by master artisans using traditional Pakistani footwear proportions. Use our conversion tables, foot measurement steps, and style-specific recommendations to find your perfect fit.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Chart Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Conversion Table Card */}
            <div className="p-6 rounded-xl bg-[var(--paper)] border border-[var(--line)] shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-[var(--ink)]">
                    Standard Sizing Conversion Table
                  </h3>
                  <p className="text-xs text-[var(--muted)]">
                    Pakistan sizes correspond directly to EU shoe sizing.
                  </p>
                </div>
                <div className="inline-flex rounded-md bg-[var(--surface)] p-0.5 text-xs border border-[var(--line)]">
                  <button
                    className={`px-3 py-1.5 rounded ${unit === "cm" ? "bg-[var(--moss)] text-white font-medium" : "text-[var(--muted)]"}`}
                    onClick={() => setUnit("cm")}
                  >
                    Centimeters (cm)
                  </button>
                  <button
                    className={`px-3 py-1.5 rounded ${unit === "inch" ? "bg-[var(--moss)] text-white font-medium" : "text-[var(--muted)]"}`}
                    onClick={() => setUnit("inch")}
                  >
                    Inches (in)
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-[var(--line)]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--surface)] border-b border-[var(--line)] text-[var(--ink)] font-semibold">
                    <tr>
                      <th className="py-3 px-4">PK / EU Size</th>
                      <th className="py-3 px-4">UK Size</th>
                      <th className="py-3 px-4">US Size</th>
                      <th className="py-3 px-4">
                        Foot Length ({unit === "cm" ? "cm" : "in"})
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)] text-[var(--ink)]">
                    {SIZE_CHART.map(row => (
                      <tr key={row.eu} className="hover:bg-[var(--surface-tint)] transition-colors">
                        <td className="py-2.5 px-4 font-semibold text-[var(--moss)]">
                          PK {row.eu} (EU {row.eu})
                        </td>
                        <td className="py-2.5 px-4">UK {row.uk}</td>
                        <td className="py-2.5 px-4">US {row.us}</td>
                        <td className="py-2.5 px-4 font-medium">
                          {unit === "cm" ? `${row.cm} cm` : `${row.inch}"`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Step-by-Step Measuring Guide */}
            <div className="p-6 rounded-xl bg-[var(--paper)] border border-[var(--line)] shadow-sm space-y-4">
              <h3 className="font-semibold text-lg text-[var(--ink)] flex items-center gap-2">
                <Ruler className="text-[var(--moss)]" size={20} />
                How to Measure Your Foot Length at Home
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-[var(--surface)] rounded-lg border border-[var(--line)]">
                  <span className="w-6 h-6 rounded-full bg-[var(--moss)] text-white font-bold inline-flex items-center justify-center mb-2">
                    1
                  </span>
                  <h4 className="font-semibold text-sm text-[var(--ink)] mb-1">Stand on Paper</h4>
                  <p className="text-[var(--muted)] leading-relaxed">
                    Place an A4 sheet against a flat wall. Stand barefoot with your heel pressed lightly against the wall.
                  </p>
                </div>
                <div className="p-4 bg-[var(--surface)] rounded-lg border border-[var(--line)]">
                  <span className="w-6 h-6 rounded-full bg-[var(--moss)] text-white font-bold inline-flex items-center justify-center mb-2">
                    2
                  </span>
                  <h4 className="font-semibold text-sm text-[var(--ink)] mb-1">Mark Longest Toe</h4>
                  <p className="text-[var(--muted)] leading-relaxed">
                    Holding a pencil completely upright, draw a clean mark at the tip of your longest toe on the paper.
                  </p>
                </div>
                <div className="p-4 bg-[var(--surface)] rounded-lg border border-[var(--line)]">
                  <span className="w-6 h-6 rounded-full bg-[var(--moss)] text-white font-bold inline-flex items-center justify-center mb-2">
                    3
                  </span>
                  <h4 className="font-semibold text-sm text-[var(--ink)] mb-1">Measure Distance</h4>
                  <p className="text-[var(--muted)] leading-relaxed">
                    Measure the straight distance from the edge to your mark in centimeters and match it to our size chart.
                  </p>
                </div>
              </div>
            </div>

            {/* Silhouette Specific Fit Advice */}
            <div className="p-6 rounded-xl bg-[var(--paper)] border border-[var(--line)] shadow-sm space-y-4">
              <h3 className="font-semibold text-lg text-[var(--ink)]">
                Footwear Silhouette Recommendations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {FIT_TIPS.map(tip => (
                  <div
                    key={tip.type}
                    className="p-4 rounded-lg bg-[var(--surface)] border border-[var(--line)] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-xs text-[var(--ink)]">{tip.type}</h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[var(--surface-tint)] text-[var(--moss)] border border-[var(--line)]">
                        {tip.badge}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted)] leading-relaxed">{tip.advice}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Calculator Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--line)] shadow-sm sticky top-28">
              <h3 className="font-semibold text-base text-[var(--ink)] mb-1 flex items-center gap-2">
                <Compass className="text-[var(--moss)]" size={18} />
                Instant Size Finder
              </h3>
              <p className="text-xs text-[var(--muted)] mb-4">
                Enter your exact foot length to see your recommended SoleCraft pair size:
              </p>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    placeholder={unit === "cm" ? "e.g. 27.0" : "e.g. 10.6"}
                    value={footLength}
                    onChange={e => setFootLength(e.target.value)}
                    className="auth-input flex-1"
                  />
                  <div className="inline-flex rounded-md bg-[var(--paper)] p-0.5 text-xs border border-[var(--line)]">
                    <button
                      className={`px-2.5 py-1 rounded ${unit === "cm" ? "bg-[var(--moss)] text-white" : "text-[var(--muted)]"}`}
                      onClick={() => setUnit("cm")}
                    >
                      cm
                    </button>
                    <button
                      className={`px-2.5 py-1 rounded ${unit === "inch" ? "bg-[var(--moss)] text-white" : "text-[var(--muted)]"}`}
                      onClick={() => setUnit("inch")}
                    >
                      in
                    </button>
                  </div>
                </div>

                {recommendedSize && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-[var(--paper)] rounded-lg border border-[var(--moss)] shadow-sm"
                  >
                    <span className="text-xs text-[var(--muted)] block">Recommended Size</span>
                    <div className="text-xl font-bold text-[var(--moss)] mt-1">
                      PK {recommendedSize.eu} / EU {recommendedSize.eu}
                    </div>
                    <div className="text-xs text-[var(--ink)] mt-1">
                      UK {recommendedSize.uk} • US {recommendedSize.us}
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--line)] space-y-3">
                <div className="flex items-start gap-2 text-xs text-[var(--muted)]">
                  <Sparkles size={16} className="text-[var(--clay)] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>14-Day Free Exchange:</strong> Zero risk. If the size doesn't feel right at home, we exchange it free of charge.
                  </span>
                </div>
                <Link
                  href="/shop"
                  className="button-primary w-full py-2.5 text-center text-xs flex items-center justify-center gap-2 mt-4"
                >
                  <span>Explore Handcrafted Shoes</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
