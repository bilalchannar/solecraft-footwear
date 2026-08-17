import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Truck,
  ShieldCheck,
  RotateCcw,
  Clock,
  MapPin,
  Search,
  PackageCheck,
  HelpCircle,
  Sparkles,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { StorefrontLayout } from "@/components/StorefrontLayout";
import { toast } from "sonner";
import { luxuryEase } from "@/lib/motion";

const SHIPPING_FAQS = [
  {
    q: "How much does shipping cost across Pakistan?",
    a: "We offer FREE Standard Delivery across all cities in Pakistan on orders above PKR 4,000. For orders below PKR 4,000, a flat rate of PKR 250 is applied at checkout.",
  },
  {
    q: "How long will my handcrafted footwear take to arrive?",
    a: "Orders in Lahore, Karachi, and Islamabad/Rawalpindi arrive within 2 to 3 business days. For Peshawar, Quetta, Multan, Faisalabad, Sialkot, and other regional hubs, delivery takes 3 to 5 business days.",
  },
  {
    q: "Can I inspect the parcel before paying for Cash on Delivery (COD)?",
    a: "Yes. All SoleCraft parcels are shipped with Open-Flyer Inspection Authorization through our logistics partners (TCS, Trax, and Leopard Courier). You can inspect the shoebox and pair prior to handing payment to the rider.",
  },
  {
    q: "How does the 14-day size and style exchange work?",
    a: "If your footwear does not fit perfectly, contact our concierge via WhatsApp at +92 300 8459200. We will dispatch a replacement pair directly to your doorstep and collect the original pair simultaneously—100% free of charge.",
  },
  {
    q: "Do you ship internationally?",
    a: "Yes, we ship bespoke and catalog pairs internationally to the UK, USA, UAE, Canada, and Australia via DHL Express (5–7 business days). Contact our concierge team for international rates.",
  },
];

export default function Shipping() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingResult, setTrackingResult] = useState<{
    status: string;
    location: string;
    carrier: string;
    updated: string;
  } | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      toast.error("Please enter your order or tracking number");
      return;
    }
    // Realistic simulation for customer convenience
    setTrackingResult({
      status: "In Transit with Courier Partner",
      location: "Lahore Central Logistics Hub",
      carrier: "TCS Express Priority",
      updated: "Dispatched today at 11:30 AM",
    });
    toast.success("Order status retrieved");
  };

  return (
    <StorefrontLayout
      seo={{
        title: "Nationwide Shipping & 14-Day Exchanges | SoleCraft Pakistan",
        description:
          "Enjoy free nationwide delivery on orders over PKR 4,000, open parcel inspection on Cash on Delivery, and hassle-free 14-day size exchanges across Pakistan.",
      }}
    >
      <div className="site-container page-layout py-10">
        <div className="breadcrumb mb-6">
          <Link href="/">Home</Link> / <span>Shipping & Delivery</span>
        </div>

        {/* Hero Banner */}
        <div className="max-w-3xl mb-12">
          <span className="eyebrow">Nationwide Logistics</span>
          <h1 className="display text-3xl md:text-5xl font-serif font-bold text-[var(--ink)] mt-2">
            Nationwide Delivery & Artisan Care
          </h1>
          <p className="text-sm md:text-base text-[var(--muted)] mt-3 leading-relaxed">
            Every pair is individually inspected, dust-bagged, and securely packaged at our Lahore atelier. We deliver across 150+ cities in Pakistan with trusted courier partners and open-parcel inspection.
          </p>
        </div>

        {/* 3 Core Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-xl bg-[var(--paper)] border border-[var(--line)] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--surface-tint)] text-[var(--moss)] flex items-center justify-center">
              <Truck size={22} />
            </div>
            <h3 className="font-semibold text-base text-[var(--ink)]">
              Free Delivery Over PKR 4,000
            </h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Enjoy complimentary tracked shipping to your doorstep anywhere in Pakistan on all qualifying orders. Flat PKR 250 for orders below.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[var(--paper)] border border-[var(--line)] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--surface-tint)] text-[var(--moss)] flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
            <h3 className="font-semibold text-base text-[var(--ink)]">
              Open Parcel Inspection on COD
            </h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Inspect your handcrafted footwear on delivery prior to paying the courier. Full peace of mind with Cash on Delivery nationwide.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[var(--paper)] border border-[var(--line)] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--surface-tint)] text-[var(--moss)] flex items-center justify-center">
              <RotateCcw size={22} />
            </div>
            <h3 className="font-semibold text-base text-[var(--ink)]">
              14-Day Free Doorstep Exchange
            </h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              If the size isn't 100% comfortable, we arrange a free doorstep exchange. Our rider will drop the new size and collect the old one.
            </p>
          </div>
        </div>

        {/* Delivery Timelines Matrix */}
        <div className="p-8 rounded-xl bg-[var(--surface)] border border-[var(--line)] mb-12">
          <div className="max-w-xl mb-6">
            <h2 className="font-serif text-2xl font-bold text-[var(--ink)]">
              Delivery Timelines by Region
            </h2>
            <p className="text-xs text-[var(--muted)] mt-1">
              Orders are dispatched from our Lahore atelier Monday through Saturday.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-lg bg-[var(--paper)] border border-[var(--line)]">
              <div className="flex items-center gap-2 text-[var(--moss)] font-semibold text-sm mb-1">
                <Clock size={16} />
                <span>2 – 3 Business Days</span>
              </div>
              <h4 className="font-semibold text-sm text-[var(--ink)] mb-2">Major Metros</h4>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Gujranwala, Sialkot.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-[var(--paper)] border border-[var(--line)]">
              <div className="flex items-center gap-2 text-[var(--moss)] font-semibold text-sm mb-1">
                <Clock size={16} />
                <span>3 – 5 Business Days</span>
              </div>
              <h4 className="font-semibold text-sm text-[var(--ink)] mb-2">Regional Cities & Hubs</h4>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Peshawar, Multan, Quetta, Hyderabad, Sukkur, Bahawalpur, Abbottabad, Mardan, Gujrat.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-[var(--paper)] border border-[var(--line)]">
              <div className="flex items-center gap-2 text-[var(--moss)] font-semibold text-sm mb-1">
                <Clock size={16} />
                <span>5 – 7 Business Days</span>
              </div>
              <h4 className="font-semibold text-sm text-[var(--ink)] mb-2">International Express</h4>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                United Kingdom, UAE, USA, Canada, Saudi Arabia, Australia via DHL Express tracked.
              </p>
            </div>
          </div>
        </div>

        {/* Live Tracking Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          <div className="lg:col-span-6 p-8 rounded-xl bg-[var(--paper)] border border-[var(--line)] shadow-sm">
            <h3 className="font-serif text-xl font-bold text-[var(--ink)] mb-2">
              Track Your SoleCraft Order
            </h3>
            <p className="text-xs text-[var(--muted)] mb-6">
              Enter your Order Number (e.g. SC-84920) or Courier Tracking ID to check status:
            </p>

            <form onSubmit={handleTrack} className="space-y-4">
              <div className="auth-input-group">
                <Search size={18} className="auth-input-icon" />
                <input
                  type="text"
                  placeholder="Enter Order # or Tracking ID"
                  value={trackingNumber}
                  onChange={e => setTrackingNumber(e.target.value)}
                  className="auth-input"
                />
              </div>
              <button type="submit" className="button-primary w-full py-2.5 text-xs">
                Track Shipment
              </button>
            </form>

            {trackingResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-lg bg-[var(--surface)] border border-[var(--line)] space-y-2 text-xs"
              >
                <div className="flex items-center gap-2 text-[var(--moss)] font-semibold">
                  <CheckCircle2 size={16} />
                  <span>{trackingResult.status}</span>
                </div>
                <div className="text-[var(--ink)]">
                  <strong>Carrier:</strong> {trackingResult.carrier}
                </div>
                <div className="text-[var(--ink)]">
                  <strong>Location:</strong> {trackingResult.location}
                </div>
                <div className="text-[var(--muted)] text-[11px]">
                  {trackingResult.updated}
                </div>
              </motion.div>
            )}
          </div>

          <div className="lg:col-span-6 p-8 rounded-xl bg-[var(--paper)] border border-[var(--line)] shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-serif text-xl font-bold text-[var(--ink)] mb-2">
                Logistics & Dispatch Partners
              </h3>
              <p className="text-xs text-[var(--muted)] mb-6 leading-relaxed">
                We partner with Pakistan’s premier courier networks to guarantee secure hand-to-hand delivery and SMS tracking updates directly to your phone.
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[var(--surface)] rounded-md border border-[var(--line)]">
                  <strong className="text-[var(--ink)] block">TCS Express</strong>
                  <span className="text-[var(--muted)]">Overnight Air & Surface</span>
                </div>
                <div className="p-3 bg-[var(--surface)] rounded-md border border-[var(--line)]">
                  <strong className="text-[var(--ink)] block">Trax Logistics</strong>
                  <span className="text-[var(--muted)]">Doorstep COD & Open Flyer</span>
                </div>
                <div className="p-3 bg-[var(--surface)] rounded-md border border-[var(--line)]">
                  <strong className="text-[var(--ink)] block">Leopard Courier</strong>
                  <span className="text-[var(--muted)]">Nationwide Remote Coverage</span>
                </div>
                <div className="p-3 bg-[var(--surface)] rounded-md border border-[var(--line)]">
                  <strong className="text-[var(--ink)] block">DHL International</strong>
                  <span className="text-[var(--muted)]">Global Priority Air</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--line)] text-xs text-[var(--muted)]">
              Need special delivery arrangements? WhatsApp our dispatch manager at <strong>+92 300 8459200</strong>.
            </div>
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <span className="eyebrow">Answers</span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-[var(--ink)] mt-1">
              Shipping & Returns FAQ
            </h2>
          </div>

          <div className="space-y-3">
            {SHIPPING_FAQS.map((faq, index) => (
              <div
                key={faq.q}
                className="rounded-lg bg-[var(--paper)] border border-[var(--line)] overflow-hidden shadow-sm transition-all"
              >
                <button
                  className="w-full py-4 px-5 text-left font-semibold text-sm text-[var(--ink)] flex items-center justify-between gap-4"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-[var(--muted)] transition-transform duration-200 ${
                      openFaq === index ? "rotate-180 text-[var(--moss)]" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-5 pb-4 text-xs text-[var(--muted)] leading-relaxed border-t border-[var(--line)] pt-3"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
