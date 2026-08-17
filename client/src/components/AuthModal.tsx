import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, Mail, Phone, Sparkles, User, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { luxuryEase, microSpring } from "@/lib/motion";

export function AuthModal({
  isOpen,
  onClose,
  initialMode = "register",
}: {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
}) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "register") {
        if (!fullName.trim()) {
          toast.error("Please enter your full name.");
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          toast.error("Password must be at least 6 characters.");
          setLoading(false);
          return;
        }

        const res = await register({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
          phone: phone.trim() || undefined,
        });

        toast.success(`Welcome to SoleCraft, ${res.user.name || "Member"}! Account created.`);
        onClose();
      } else {
        const res = await login({
          email: email.trim().toLowerCase(),
          password,
        });

        toast.success(`Welcome back, ${res.user.name || "Member"}!`);
        onClose();
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="search-overlay" role="dialog" aria-modal="true">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="search-overlay__backdrop"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.35, ease: luxuryEase }}
            className="auth-modal-card"
          >
            <div className="auth-modal-head flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="brand__mark" />
                <span className="font-medium text-ink">SoleCraft Account</span>
              </div>
              <button
                className="icon-button"
                onClick={onClose}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="auth-tabs flex items-center p-1 my-4">
              <button
                type="button"
                className={`auth-tab flex-1 py-2 text-sm font-medium transition-all ${
                  mode === "register" ? "auth-tab--active" : ""
                }`}
                onClick={() => setMode("register")}
              >
                Create Account
              </button>
              <button
                type="button"
                className={`auth-tab flex-1 py-2 text-sm font-medium transition-all ${
                  mode === "login" ? "auth-tab--active" : ""
                }`}
                onClick={() => setMode("login")}
              >
                Sign In
              </button>
            </div>

            <div className="mb-4">
              <h3 className="display text-2xl text-ink font-semibold">
                {mode === "register"
                  ? "Join the SoleCraft Circle"
                  : "Welcome back to SoleCraft"}
              </h3>
              <p className="text-xs text-muted mt-1">
                {mode === "register"
                  ? "Create your account to save sizing preferences, track handcrafted orders, and earn craft rewards."
                  : "Sign in to access your order history and saved artisanal pairs."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === "register" && (
                <div>
                  <label className="text-xs font-medium text-ink block mb-1">
                    Full name
                  </label>
                  <div className="auth-input-group">
                    <User
                      size={17}
                      className="auth-input-icon"
                    />
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="e.g. Bilal Khan"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-ink block mb-1">
                  Email address
                </label>
                <div className="auth-input-group">
                  <Mail
                    size={17}
                    className="auth-input-icon"
                  />
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="name@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {mode === "register" && (
                <div>
                  <label className="text-xs font-medium text-ink block mb-1">
                    Mobile number (Optional)
                  </label>
                  <div className="auth-input-group">
                    <Phone
                      size={17}
                      className="auth-input-icon"
                    />
                    <input
                      type="tel"
                      className="auth-input"
                      placeholder="03XXXXXXXXX"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-ink block mb-1">
                  Password
                </label>
                <div className="auth-input-group">
                  <Lock
                    size={17}
                    className="auth-input-icon"
                  />
                  <input
                    type="password"
                    className="auth-input"
                    placeholder={
                      mode === "register"
                        ? "At least 6 characters"
                        : "Your password"
                    }
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={microSpring}
                type="submit"
                disabled={loading}
                className="button-primary w-full justify-center mt-4"
              >
                {loading
                  ? "Processing..."
                  : mode === "register"
                    ? "Create My Account"
                    : "Sign In Securely"}
              </motion.button>
            </form>

            <div className="mt-4 pt-3 border-t border-line text-center">
              <span className="text-xs text-muted">
                {mode === "register" ? (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      className="text-moss font-semibold underline hover:text-clay"
                      onClick={() => setMode("login")}
                    >
                      Sign In here
                    </button>
                  </>
                ) : (
                  <>
                    New to SoleCraft?{" "}
                    <button
                      type="button"
                      className="text-moss font-semibold underline hover:text-clay"
                      onClick={() => setMode("register")}
                    >
                      Create an account
                    </button>
                  </>
                )}
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
