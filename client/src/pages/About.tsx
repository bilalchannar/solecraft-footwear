import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Sparkles,
  ShieldCheck,
  Hammer,
  Feather,
  Layers,
  Heart,
  Compass,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { StorefrontLayout } from "@/components/StorefrontLayout";
import { luxuryEase, staggerContainerVariants, staggerItemVariants } from "@/lib/motion";

const CRAFT_STAGES = [
  {
    step: "01",
    title: "Vegetable Tanning & Leather Selection",
    subtitle: "Organic Full-Grain Hides",
    description:
      "Every pair begins with top-tier full-grain cowhides and calfskins sourced from responsible Pakistani tanneries in Kasur and Sialkot. Treated with natural tree bark extracts and drum-dyed for breathability, our leathers age gracefully with every wear.",
    icon: Layers,
  },
  {
    step: "02",
    title: "Master Pattern Hand-Cutting",
    subtitle: "Zero Machine Stamping",
    description:
      "Ustad cutters examine each hide for natural grain flow and tensile strength. Every strap, vamp, and lining piece is hand-carved with traditional half-moon knives (rambi) to guarantee seamless flexibility and enduring symmetry.",
    icon: Feather,
  },
  {
    step: "03",
    title: "Artisanal Stitching & Tilla Embroidery",
    subtitle: "Centuries-Old Lineage",
    description:
      "Using reinforced dual-thread saddle stitching, our master artisans bind the uppers with heavy-duty thread. For our festive khussas, intricate gold and silver tilla motifs are embroidered stitch-by-stitch by generational artisan families in Multan.",
    icon: Sparkles,
  },
  {
    step: "04",
    title: "Lasting & Tyre Sole Cementing",
    subtitle: "Engineered for Pakistani Terrains",
    description:
      "The upper is hand-lasted over ergonomic wooden lasts for 48 hours to set shape. We then bond our signature recycled tyre rubber sole—celebrated across Khyber Pakhtunkhwa and Balochistan for its near-indestructible road grip.",
    icon: Hammer,
  },
];

const ARTISAN_STORIES = [
  {
    name: "Ustad Muhammad Rafiq",
    origin: "Namak Mandi, Peshawar",
    craft: "Master Peshawari & Norozi Lasting",
    experience: "38 Years Experience",
    quote:
      "A true Peshawari chappal isn’t just footwear; it is the dignity of our ancestors. When you pull the leather over the last with the right tension, the shoe breathes with the foot.",
  },
  {
    name: "Master Artisan Farooq",
    origin: "Kasur Khussa Guild",
    craft: "Traditional Sole Shaping & Stitching",
    experience: "29 Years Experience",
    quote:
      "Unlike modern factory shoes that pinch your toes, a genuine Kasuri khussa becomes softer and moulds to your exact foot contour after just three wears.",
  },
  {
    name: "Ustad Zulfiqar Ali",
    origin: "Anarkali, Lahore",
    craft: "Hand-Burnished Dress Loafers",
    experience: "32 Years Experience",
    quote:
      "We apply five layers of natural dye and carnauba wax by hand to achieve that deep, luminous patina. No spray machine can replicate human touch.",
  },
];

export default function About() {
  return (
    <StorefrontLayout
      seo={{
        title: "Our Craft & Artisanal Heritage | SoleCraft Pakistan",
        description:
          "Discover how SoleCraft preserves Pakistan's generational footwear craftsmanship. Handcrafted Peshawari chappals, Norozi soles, and tilla khussas made by master ustads.",
      }}
    >
      <div className="site-container page-layout py-10">
        <div className="breadcrumb mb-6">
          <Link href="/">Home</Link> / <span>Our Craft</span>
        </div>

        {/* Hero Section */}
        <section className="mb-16">
          <div className="max-w-3xl">
            <span className="eyebrow">The Soul of Pakistani Footwear</span>
            <h1 className="display text-3xl md:text-5xl font-serif font-bold text-[var(--ink)] mt-2 leading-tight">
              Rooted in Heritage, Refined for Modern Movement.
            </h1>
            <p className="text-base text-[var(--muted)] mt-4 leading-relaxed">
              SoleCraft was founded on a singular conviction: Pakistan possesses some of the world's most gifted leather ustads and shoemaking traditions. We unite generational craftsmanship from Peshawar, Multan, and Lahore with contemporary ergonomic comfort and transparent ethical wages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            <div className="rounded-2xl overflow-hidden shadow-sm aspect-[4/3] bg-[var(--surface)] relative">
              <img
                src="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=85"
                alt="Handcrafted leather footwear crafting"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent p-6 flex flex-col justify-end text-white">
                <span className="text-xs uppercase tracking-widest text-[var(--clay)] font-semibold">
                  Hand-Lasted Leather
                </span>
                <h3 className="font-serif text-lg font-bold">The Authentic Semi-Pointed Toe</h3>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-sm aspect-[4/3] bg-[var(--surface)] relative">
              <img
                src="https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1000&q=85"
                alt="Artisan stitching process"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent p-6 flex flex-col justify-end text-white">
                <span className="text-xs uppercase tracking-widest text-[var(--clay)] font-semibold">
                  Generational Masters
                </span>
                <h3 className="font-serif text-lg font-bold">Double Gear Sole & Hand Welt</h3>
              </div>
            </div>
          </div>
        </section>

        {/* 4-Step Crafting Journey */}
        <section className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="eyebrow">The Atelier Process</span>
            <h2 className="display text-2xl md:text-4xl font-serif font-bold text-[var(--ink)] mt-1">
              How a SoleCraft Pair is Born
            </h2>
            <p className="text-xs md:text-sm text-[var(--muted)] mt-2">
              From raw hides to final hand-burnish, every pair spends over 48 hours in our workshop.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {CRAFT_STAGES.map(stage => {
              const Icon = stage.icon;
              return (
                <motion.div
                  key={stage.step}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3, ease: luxuryEase }}
                  className="p-8 rounded-2xl bg-[var(--paper)] border border-[var(--line)] shadow-sm space-y-4 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-3xl font-bold text-[var(--moss)]/30">
                      {stage.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-[var(--surface-tint)] text-[var(--moss)] flex items-center justify-center">
                      <Icon size={20} />
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--clay)] block mb-1">
                      {stage.subtitle}
                    </span>
                    <h3 className="font-serif text-xl font-bold text-[var(--ink)]">
                      {stage.title}
                    </h3>
                  </div>
                  <p className="text-xs md:text-sm text-[var(--muted)] leading-relaxed">
                    {stage.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Ustads & Heritage Profiles */}
        <section className="mb-20 p-8 md:p-12 rounded-3xl bg-[var(--surface)] border border-[var(--line)]">
          <div className="max-w-2xl mb-10">
            <span className="eyebrow">The Masters Behind the Sole</span>
            <h2 className="display text-2xl md:text-4xl font-serif font-bold text-[var(--ink)] mt-1">
              Honoring Our Artisan Ustads
            </h2>
            <p className="text-xs md:text-sm text-[var(--muted)] mt-2">
              We provide fair living wages, safe workshop conditions, and healthcare support to ensure these irreplaceable skills thrive for generations to come.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ARTISAN_STORIES.map(artisan => (
              <div
                key={artisan.name}
                className="p-6 rounded-2xl bg-[var(--paper)] border border-[var(--line)] shadow-sm flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--moss)] px-2 py-0.5 rounded bg-[var(--surface-tint)] inline-block mb-3">
                    {artisan.experience}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-[var(--ink)]">
                    {artisan.name}
                  </h3>
                  <p className="text-xs text-[var(--muted)] mb-1">{artisan.origin}</p>
                  <p className="text-xs font-semibold text-[var(--clay)] mb-4">{artisan.craft}</p>
                  <blockquote className="text-xs italic text-[var(--muted)] leading-relaxed border-l-2 border-[var(--moss)] pl-3">
                    "{artisan.quote}"
                  </blockquote>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sourcing & Environmental Pledge */}
        <section className="mb-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="eyebrow">Ethical Craft</span>
            <h2 className="display text-2xl md:text-4xl font-serif font-bold text-[var(--ink)] leading-tight">
              Our Commitment to Substance & Transparency
            </h2>
            <div className="space-y-3 text-xs md:text-sm text-[var(--muted)]">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-[var(--moss)] flex-shrink-0 mt-0.5" />
                <span>
                  <strong>100% Genuine Full-Grain Leather:</strong> Zero synthetic PU leather or bonded filler scraps. Every pair breathes and ages naturally.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-[var(--moss)] flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Upcycled Tyre Soles:</strong> Reclaiming resilient rubber tyres to construct durable outsoles that withstand high mileage.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-[var(--moss)] flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Direct-to-Artisan Economics:</strong> Eliminating exploitative middlemen so our craftsmen receive maximum value for their expertise.
                </span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/shop"
                className="button-primary inline-flex items-center gap-2 py-3 px-6 text-xs font-semibold"
              >
                <span>Experience Handcrafted Footwear</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 rounded-2xl overflow-hidden shadow-sm aspect-[4/3] bg-[var(--surface)]">
            <img
              src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=85"
              alt="Artisan workshop showcase"
              className="w-full h-full object-cover"
            />
          </div>
        </section>
      </div>
    </StorefrontLayout>
  );
}
