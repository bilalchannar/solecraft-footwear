import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { StorefrontLayout } from "@/components/StorefrontLayout";
import { toast } from "sonner";
import { luxuryEase, microSpring } from "@/lib/motion";

export default function Contact() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("Sizing & Custom Fitting");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success(
        `Thank you ${fullName.split(" ")[0]}! Your message has been received by our Lahore atelier concierge.`
      );
    }, 900);
  };

  return (
    <StorefrontLayout
      seo={{
        title: "Contact Atelier & Concierge | SoleCraft Pakistan",
        description:
          "Connect with SoleCraft master artisans and customer concierge in Lahore. Get assistance with sizing, bespoke wedding orders, nationwide delivery, and inquiries.",
      }}
    >
      <div className="site-container page-layout py-10">
        <div className="breadcrumb mb-6">
          <Link href="/">Home</Link> / <span>Contact Atelier</span>
        </div>

        {/* Page Heading */}
        <div className="max-w-2xl mb-10">
          <span className="eyebrow">Lahore Atelier Concierge</span>
          <h1 className="display text-3xl md:text-5xl font-serif font-bold text-[var(--ink)] mt-2">
            Get in Touch
          </h1>
          <p className="text-sm md:text-base text-[var(--muted)] mt-3 leading-relaxed">
            Whether you need custom sizing guidance, bespoke bridal/groom pairs, order status updates, or leather care tips, our craftsmen and concierge team are at your service.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Information & Atelier Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--line)] shadow-sm space-y-5">
              <h3 className="font-serif text-lg font-bold text-[var(--ink)]">
                SoleCraft Flagship Atelier
              </h3>

              <div className="flex items-start gap-3 text-xs text-[var(--muted)]">
                <MapPin size={18} className="text-[var(--moss)] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[var(--ink)] block mb-0.5">Workshop & Showroom</strong>
                  42-C Gulberg III, Off MM Alam Road, Lahore 54660, Pakistan
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-[var(--muted)]">
                <Phone size={18} className="text-[var(--moss)] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[var(--ink)] block mb-0.5">Direct Line & WhatsApp</strong>
                  <a href="tel:+923008459200" className="hover:text-[var(--moss)] transition-colors">
                    +92 300 8459200
                  </a>
                  <span className="block text-[11px] text-[var(--muted)] mt-0.5">
                    (Instant response on WhatsApp)
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-[var(--muted)]">
                <Mail size={18} className="text-[var(--moss)] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[var(--ink)] block mb-0.5">Email Inquiries</strong>
                  <a href="mailto:concierge@solecraft.pk" className="hover:text-[var(--moss)] transition-colors">
                    concierge@solecraft.pk
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-[var(--muted)]">
                <Clock size={18} className="text-[var(--moss)] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[var(--ink)] block mb-0.5">Atelier Hours</strong>
                  Monday – Saturday: 10:00 AM – 8:30 PM PKT<br />
                  Sunday: Closed (Artisan Rest Day)
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--line)]">
                <a
                  href="https://wa.me/923008459200"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-secondary w-full py-2.5 text-xs inline-flex items-center justify-center gap-2"
                >
                  <MessageSquare size={15} />
                  <span>Chat on WhatsApp Directly</span>
                </a>
              </div>
            </div>

            {/* Bespoke Footwear Callout */}
            <div className="p-6 rounded-xl bg-[var(--paper)] border border-[var(--line)] shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-[var(--clay)] font-semibold text-xs uppercase tracking-wider">
                <Sparkles size={16} />
                <span>Bespoke & Wedding Orders</span>
              </div>
              <h4 className="font-semibold text-sm text-[var(--ink)]">
                Handcrafted for Special Occasions
              </h4>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Planning a wedding sherwani pair or custom-dyed Peshawari chappal? We offer personalized fitting consultations and custom leather finishes for grooms and celebrations.
              </p>
            </div>
          </div>

          {/* Interactive Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-8 rounded-xl bg-[var(--paper)] border border-[var(--line)] shadow-sm">
              <h2 className="font-serif text-2xl font-bold text-[var(--ink)] mb-2">
                Send us a Message
              </h2>
              <p className="text-xs text-[var(--muted)] mb-6">
                Fill in the details below and our team will get back to you within 4 business hours.
              </p>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 rounded-xl bg-[var(--surface)] text-center space-y-4 border border-[var(--moss)]"
                >
                  <div className="w-12 h-12 rounded-full bg-[var(--moss)] text-white mx-auto flex items-center justify-center">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[var(--ink)]">
                    Message Received
                  </h3>
                  <p className="text-xs text-[var(--muted)] max-w-md mx-auto leading-relaxed">
                    Thank you, <strong>{fullName}</strong>. Your inquiry regarding <em>"{subject}"</em> has been dispatched to our concierge team. We will contact you at <strong>{email}</strong> shortly.
                  </p>
                  <button
                    className="button-secondary text-xs py-2 px-6 mt-4"
                    onClick={() => {
                      setIsSubmitted(false);
                      setMessage("");
                    }}
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-[var(--ink)] block mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Tariq Mehmood"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="auth-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[var(--ink)] block mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        placeholder="tariq@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="auth-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-[var(--ink)] block mb-1">
                        Mobile Number (Optional)
                      </label>
                      <input
                        type="tel"
                        placeholder="0300 1234567"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="auth-input"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[var(--ink)] block mb-1">
                        Inquiry Topic
                      </label>
                      <select
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        className="auth-input"
                      >
                        <option>Sizing & Custom Fitting</option>
                        <option>Order Status & Tracking</option>
                        <option>Bespoke Wedding / Groom Pair</option>
                        <option>14-Day Size Exchange</option>
                        <option>Wholesale & International Export</option>
                        <option>General Feedback</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[var(--ink)] block mb-1">
                      Your Message *
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Please tell us how we can assist you..."
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      className="auth-input"
                      style={{ height: "auto", padding: "12px 14px" }}
                      required
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    transition={microSpring}
                    type="submit"
                    disabled={isSubmitting}
                    className="button-primary w-full py-3 text-xs flex items-center justify-center gap-2 font-medium"
                  >
                    <Send size={15} />
                    <span>{isSubmitting ? "Dispatching Message…" : "Send Message to Atelier"}</span>
                  </motion.button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
