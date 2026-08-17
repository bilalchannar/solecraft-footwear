import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Ruler, Check, HelpCircle, Sparkles, Compass } from "lucide-react";
import { luxuryEase, microSpring } from "@/lib/motion";

export const SIZE_CHART = [
  { eu: "39", uk: "6", us: "7", cm: 24.5, inch: "9.6" },
  { eu: "40", uk: "6.5", us: "7.5", cm: 25.0, inch: "9.8" },
  { eu: "41", uk: "7.5", us: "8.5", cm: 26.0, inch: "10.2" },
  { eu: "42", uk: "8.5", us: "9.5", cm: 27.0, inch: "10.6" },
  { eu: "43", uk: "9.5", us: "10.5", cm: 27.5, inch: "10.8" },
  { eu: "44", uk: "10.5", us: "11.5", cm: 28.5, inch: "11.2" },
  { eu: "45", uk: "11.5", us: "12.5", cm: 29.5, inch: "11.6" },
  { eu: "46", uk: "12.5", us: "13.5", cm: 30.5, inch: "12.0" },
];

export const FIT_TIPS = [
  {
    type: "Peshawari & Norozi",
    badge: "True to Size",
    advice:
      "Crafted with double-ply artisan leather. Hand-stitched uppers will naturally conform and soften to your foot's unique contours within 2-3 wears.",
  },
  {
    type: "Handmade Khussa",
    badge: "Wide Feet: +1 Size",
    advice:
      "Traditional Pakistani khussas are crafted flat without a rigid left/right mold. The organic leather adjusts to your foot. If you have wider feet or high instep, choose 1 size up.",
  },
  {
    type: "Formal Loafers & Oxfords",
    badge: "Standard Dress Fit",
    advice:
      "True to formal UK/EU sizing. Order your standard dress shoe size. Premium cow crust leather provides immediate all-day arch comfort.",
  },
];

export function SizeGuideModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [unit, setUnit] = useState<"cm" | "inch">("cm");
  const [footLength, setFootLength] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"chart" | "measure" | "tips">("chart");

  // Calculate recommended size from foot length
  const recommendedSize = footLength
    ? SIZE_CHART.find(row => {
        const val = parseFloat(footLength);
        if (isNaN(val)) return false;
        if (unit === "cm") {
          return val <= row.cm;
        } else {
          return val <= parseFloat(row.inch);
        }
      }) ?? SIZE_CHART[SIZE_CHART.length - 1]
    : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="auth-modal-overlay">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="auth-modal-backdrop"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.35, ease: luxuryEase }}
            className="auth-modal-card size-guide-card max-w-2xl w-full"
            style={{ maxHeight: "88vh", overflowY: "auto" }}
          >
            {/* Header */}
            <div className="auth-modal-head flex items-center justify-between pb-4 border-b border-[var(--line)]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--surface-tint)] flex items-center justify-center text-[var(--moss)]">
                  <Ruler size={18} />
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-lg text-[var(--ink)]">
                    SoleCraft Size & Fit Guide
                  </h3>
                  <p className="text-xs text-[var(--muted)]">
                    Standard Pakistan & International Footwear Sizing
                  </p>
                </div>
              </div>
              <button
                className="icon-button"
                onClick={onClose}
                aria-label="Close size guide"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="auth-tabs flex items-center p-1 my-4">
              <button
                type="button"
                className={`auth-tab flex-1 py-2 text-xs font-medium transition-all ${
                  activeTab === "chart" ? "auth-tab--active" : ""
                }`}
                onClick={() => setActiveTab("chart")}
              >
                Conversion Chart
              </button>
              <button
                type="button"
                className={`auth-tab flex-1 py-2 text-xs font-medium transition-all ${
                  activeTab === "measure" ? "auth-tab--active" : ""
                }`}
                onClick={() => setActiveTab("measure")}
              >
                Interactive Calculator
              </button>
              <button
                type="button"
                className={`auth-tab flex-1 py-2 text-xs font-medium transition-all ${
                  activeTab === "tips" ? "auth-tab--active" : ""
                }`}
                onClick={() => setActiveTab("tips")}
              >
                Artisan Fit Advice
              </button>
            </div>

            {/* Tab 1: Size Chart Table */}
            {activeTab === "chart" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[var(--muted)]">
                    Standard Pakistani sizing corresponds directly to European (EU) lasts.
                  </p>
                  <div className="inline-flex rounded-md bg-[var(--surface)] p-0.5 text-xs border border-[var(--line)]">
                    <button
                      className={`px-2.5 py-1 rounded ${unit === "cm" ? "bg-[var(--moss)] text-white font-medium" : "text-[var(--muted)]"}`}
                      onClick={() => setUnit("cm")}
                    >
                      cm
                    </button>
                    <button
                      className={`px-2.5 py-1 rounded ${unit === "inch" ? "bg-[var(--moss)] text-white font-medium" : "text-[var(--muted)]"}`}
                      onClick={() => setUnit("inch")}
                    >
                      in
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-[var(--line)]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[var(--surface)] border-b border-[var(--line)] text-[var(--ink)] font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">PK / EU Size</th>
                        <th className="py-2.5 px-3">UK Size</th>
                        <th className="py-2.5 px-3">US Size</th>
                        <th className="py-2.5 px-3">
                          Foot Length ({unit === "cm" ? "cm" : "inches"})
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--line)] text-[var(--ink)]">
                      {SIZE_CHART.map(row => (
                        <tr key={row.eu} className="hover:bg-[var(--surface-tint)] transition-colors">
                          <td className="py-2 px-3 font-semibold text-[var(--moss)]">
                            EU {row.eu} (PK {row.eu})
                          </td>
                          <td className="py-2 px-3">UK {row.uk}</td>
                          <td className="py-2 px-3">US {row.us}</td>
                          <td className="py-2 px-3">
                            {unit === "cm" ? `${row.cm} cm` : `${row.inch}"`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-[var(--surface-tint)] rounded-lg text-xs text-[var(--muted)] flex items-start gap-2">
                  <Sparkles size={16} className="text-[var(--clay)] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Free Size Exchange Guarantee:</strong> If the size does not fit comfortably, we provide a 100% free home exchange across all cities in Pakistan within 14 days.
                  </span>
                </div>
              </div>
            )}

            {/* Tab 2: Interactive Measurement Calculator */}
            {activeTab === "measure" && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-[var(--surface)] border border-[var(--line)]">
                  <h4 className="text-sm font-semibold text-[var(--ink)] mb-2 flex items-center gap-2">
                    <Compass size={16} className="text-[var(--moss)]" />
                    Interactive Size Calculator
                  </h4>
                  <p className="text-xs text-[var(--muted)] mb-3">
                    Enter the measurement from the back of your heel to the tip of your longest toe:
                  </p>

                  <div className="flex gap-2 items-center">
                    <div className="auth-input-group flex-1">
                      <input
                        type="number"
                        step="0.1"
                        placeholder={unit === "cm" ? "e.g. 26.5" : "e.g. 10.4"}
                        value={footLength}
                        onChange={e => setFootLength(e.target.value)}
                        className="auth-input"
                      />
                    </div>
                    <div className="inline-flex rounded-md bg-[var(--surface)] p-0.5 text-xs border border-[var(--line)]">
                      <button
                        className={`px-3 py-2 rounded ${unit === "cm" ? "bg-[var(--moss)] text-white font-medium" : "text-[var(--muted)]"}`}
                        onClick={() => setUnit("cm")}
                      >
                        cm
                      </button>
                      <button
                        className={`px-3 py-2 rounded ${unit === "inch" ? "bg-[var(--moss)] text-white font-medium" : "text-[var(--muted)]"}`}
                        onClick={() => setUnit("inch")}
                      >
                        inch
                      </button>
                    </div>
                  </div>

                  {recommendedSize && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3 bg-[var(--paper)] rounded-lg border border-[var(--moss)] flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs text-[var(--muted)] block">Recommended SoleCraft Size</span>
                        <span className="text-lg font-bold text-[var(--moss)]">
                          PK / EU {recommendedSize.eu} (UK {recommendedSize.uk} / US {recommendedSize.us})
                        </span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[var(--moss)] text-white flex items-center justify-center">
                        <Check size={18} />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Step by step measuring guide */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-[var(--ink)] uppercase tracking-wider">
                    How to measure your feet at home:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-3 bg-[var(--surface)] rounded-md border border-[var(--line)]">
                      <span className="font-bold text-[var(--moss)] block mb-1">1. Place Paper</span>
                      <p className="text-[var(--muted)]">
                        Put an A4 sheet against a flat wall and stand with your heel firmly against the wall.
                      </p>
                    </div>
                    <div className="p-3 bg-[var(--surface)] rounded-md border border-[var(--line)]">
                      <span className="font-bold text-[var(--moss)] block mb-1">2. Trace Mark</span>
                      <p className="text-[var(--muted)]">
                        With a pen held straight, mark the tip of your longest toe on the paper.
                      </p>
                    </div>
                    <div className="p-3 bg-[var(--surface)] rounded-md border border-[var(--line)]">
                      <span className="font-bold text-[var(--moss)] block mb-1">3. Measure</span>
                      <p className="text-[var(--muted)]">
                        Use a ruler to measure from the edge of the paper to the mark in centimeters.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Artisan Fit Advice */}
            {activeTab === "tips" && (
              <div className="space-y-3">
                {FIT_TIPS.map(tip => (
                  <div
                    key={tip.type}
                    className="p-3.5 rounded-lg bg-[var(--surface)] border border-[var(--line)]"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="font-semibold text-xs text-[var(--ink)]">{tip.type}</h4>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[var(--surface-tint)] text-[var(--moss)] border border-[var(--line)]">
                        {tip.badge}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted)] leading-relaxed">{tip.advice}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Footer Close / WhatsApp assistance */}
            <div className="mt-5 pt-3 border-t border-[var(--line)] flex items-center justify-between text-xs">
              <span className="text-[var(--muted)]">
                Still unsure? WhatsApp us at <strong>+92 300 8459200</strong>
              </span>
              <button
                className="button-primary py-1.5 px-4 text-xs"
                onClick={onClose}
              >
                Got it
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
