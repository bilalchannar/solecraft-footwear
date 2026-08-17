import { useState } from "react";
import { toast } from "sonner";
import { AccountLayout } from "@/components/AccountLayout";
import { trpc } from "@/lib/trpc";
import { MapPin, Plus, Trash2, CheckCircle2, Home, Building2, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { luxuryEase, microSpring } from "@/lib/motion";

const PAKISTANI_CITIES = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Rawalpindi",
  "Peshawar",
  "Quetta",
  "Multan",
  "Faisalabad",
  "Sialkot",
  "Gujranwala",
  "Hyderabad",
  "Abbottabad",
  "Bahawalpur",
  "Sargodha",
  "Gujrat",
  "Sukkur",
  "Mardan",
];

const PAKISTANI_PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Azad Jammu & Kashmir",
  "Gilgit-Baltistan",
];

const blank = {
  label: "Home",
  fullName: "",
  phone: "",
  email: "",
  province: "Punjab",
  city: "Lahore",
  area: "",
  addressLine: "",
  postalCode: "",
  deliveryInstructions: "",
  isDefault: true,
};

export default function Addresses() {
  const [form, setForm] = useState(blank);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | undefined>(undefined);
  const utils = trpc.useUtils();
  const addresses = trpc.account.addresses.useQuery();

  const save = trpc.account.saveAddress.useMutation({
    onSuccess: () => {
      toast.success("Delivery address saved successfully.");
      setForm(blank);
      setOpen(false);
      setEditingId(undefined);
      utils.account.addresses.invalidate();
    },
    onError: error => toast.error(error.message),
  });

  return (
    <AccountLayout title="Saved Delivery Addresses">
      <div className="account-section">
        <div className="section-head mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="eyebrow">Doorstep Logistics</span>
            <p className="text-xs text-[var(--muted)] mt-1">
              Your saved addresses are pre-filled securely during 1-click checkout.
            </p>
          </div>
          <button
            className="button-primary text-xs py-2 px-4 flex items-center gap-1.5"
            aria-expanded={open}
            onClick={() => {
              if (open) {
                setOpen(false);
                setEditingId(undefined);
                setForm(blank);
              } else {
                setOpen(true);
              }
            }}
          >
            <Plus size={14} />
            <span>{open ? "Close Form" : "Add New Address"}</span>
          </button>
        </div>

        {/* Add/Edit Address Form Modal/Drawer */}
        <AnimatePresence>
          {open && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: luxuryEase }}
              className="p-6 rounded-2xl bg-[var(--paper)] border border-[var(--moss)] shadow-sm mb-8 space-y-4 overflow-hidden"
              onSubmit={event => {
                event.preventDefault();
                save.mutate({
                  addressId: editingId,
                  address: {
                    ...form,
                    email: form.email || undefined,
                    area: form.area || undefined,
                    postalCode: form.postalCode || undefined,
                    deliveryInstructions: form.deliveryInstructions || undefined,
                  },
                });
              }}
            >
              <h3 className="font-serif text-lg font-bold text-[var(--ink)] mb-1">
                {editingId ? "Edit Delivery Address" : "Add New Delivery Address"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-[var(--ink)] block mb-1">
                    Address Label *
                  </label>
                  <select
                    value={form.label}
                    onChange={e => setForm({ ...form, label: e.target.value })}
                    className="auth-input text-xs"
                  >
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--ink)] block mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    value={form.fullName}
                    onChange={e => setForm({ ...form, fullName: e.target.value })}
                    placeholder="e.g. Bilal Khan"
                    className="auth-input text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--ink)] block mb-1">
                    Mobile Phone Number *
                  </label>
                  <input
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="0300 1234567"
                    className="auth-input text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-[var(--ink)] block mb-1">
                    City *
                  </label>
                  <select
                    value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
                    className="auth-input text-xs"
                  >
                    {PAKISTANI_CITIES.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--ink)] block mb-1">
                    Province / Region *
                  </label>
                  <select
                    value={form.province}
                    onChange={e => setForm({ ...form, province: e.target.value })}
                    className="auth-input text-xs"
                  >
                    {PAKISTANI_PROVINCES.map(p => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--ink)] block mb-1">
                    Area / Sector / Colony
                  </label>
                  <input
                    value={form.area}
                    onChange={e => setForm({ ...form, area: e.target.value })}
                    placeholder="e.g. Gulberg III, DHA Phase 5"
                    className="auth-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--ink)] block mb-1">
                  Complete Street Address (House #, Street #, Landmark) *
                </label>
                <input
                  value={form.addressLine}
                  onChange={e => setForm({ ...form, addressLine: e.target.value })}
                  placeholder="e.g. House 42-B, Street 14, Near Mini Market"
                  className="auth-input text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-[var(--ink)] block mb-1">
                    Postal / Zip Code (Optional)
                  </label>
                  <input
                    value={form.postalCode}
                    onChange={e => setForm({ ...form, postalCode: e.target.value })}
                    placeholder="54660"
                    className="auth-input text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--ink)] block mb-1">
                    Special Delivery Instructions
                  </label>
                  <input
                    value={form.deliveryInstructions}
                    onChange={e =>
                      setForm({ ...form, deliveryInstructions: e.target.value })
                    }
                    placeholder="e.g. Call before arrival, leave at reception"
                    className="auth-input text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--line)]">
                <label className="text-xs text-[var(--muted)] flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isDefault}
                    onChange={e => setForm({ ...form, isDefault: e.target.checked })}
                  />
                  <span>Set as default shipping address</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="button-secondary text-xs py-2 px-4"
                    onClick={() => {
                      setOpen(false);
                      setEditingId(undefined);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="button-primary text-xs py-2 px-6"
                    disabled={save.isPending}
                  >
                    {save.isPending ? "Saving…" : "Save Address"}
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Saved Addresses List */}
        {addresses.data?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.data.map(item => (
              <div
                key={item.id}
                className="p-6 rounded-2xl bg-[var(--paper)] border border-[var(--line)] shadow-sm hover:border-[var(--moss)] transition-colors relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[var(--surface-tint)] text-[var(--moss)] flex items-center justify-center">
                        {item.label.toLowerCase() === "office" ? (
                          <Building2 size={16} />
                        ) : (
                          <Home size={16} />
                        )}
                      </div>
                      <span className="font-semibold text-sm text-[var(--ink)]">
                        {item.label}
                      </span>
                    </div>
                    {item.isDefault === 1 && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--surface-tint)] text-[var(--moss)] border border-[var(--line)]">
                        Default
                      </span>
                    )}
                  </div>

                  <h4 className="font-semibold text-sm text-[var(--ink)] mb-1">
                    {item.fullName}
                  </h4>
                  <p className="text-xs text-[var(--muted)] leading-relaxed mb-2">
                    {item.addressLine}
                    {item.area ? `, ${item.area}` : ""}, {item.city}, {item.province}
                    {item.postalCode ? ` - ${item.postalCode}` : ""}
                  </p>
                  <p className="text-xs text-[var(--ink)] font-medium">
                    Phone: {item.phone}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[var(--line)] flex items-center justify-between text-xs">
                  <button
                    className="text-[var(--moss)] font-semibold hover:underline"
                    onClick={() => {
                      setEditingId(item.id);
                      setForm({
                        label: item.label,
                        fullName: item.fullName,
                        phone: item.phone,
                        email: item.email ?? "",
                        province: item.province,
                        city: item.city,
                        area: item.area ?? "",
                        addressLine: item.addressLine,
                        postalCode: item.postalCode ?? "",
                        deliveryInstructions: item.deliveryInstructions ?? "",
                        isDefault: item.isDefault === 1,
                      });
                      setOpen(true);
                    }}
                  >
                    Edit Address
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state p-12 text-center bg-[var(--paper)] rounded-2xl border border-[var(--line)]">
            <MapPin size={40} className="text-[var(--muted)] mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-[var(--ink)] mb-1">
              No saved addresses yet
            </h3>
            <p className="text-xs text-[var(--muted)] max-w-sm mx-auto mb-4 leading-relaxed">
              Add your primary delivery address to speed up checkout on your future artisanal pairs.
            </p>
            <button
              onClick={() => setOpen(true)}
              className="button-primary text-xs py-2 px-6"
            >
              Add First Address
            </button>
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
