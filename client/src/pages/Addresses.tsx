import { useState } from "react";
import { toast } from "sonner";
import { AccountLayout } from "@/components/AccountLayout";
import { trpc } from "@/lib/trpc";

const blank = {
  label: "Home",
  fullName: "",
  phone: "",
  email: "",
  province: "",
  city: "",
  area: "",
  addressLine: "",
  postalCode: "",
  deliveryInstructions: "",
  isDefault: true,
};
export default function Addresses() {
  const [form, setForm] = useState(blank);
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();
  const addresses = trpc.account.addresses.useQuery();
  const save = trpc.account.saveAddress.useMutation({
    onSuccess: () => {
      toast.success("Delivery address saved.");
      setForm(blank);
      setOpen(false);
      utils.account.addresses.invalidate();
    },
    onError: error => toast.error(error.message),
  });
  return (
    <AccountLayout title="Delivery addresses">
      <div className="account-section">
        <div className="section-head">
          <p className="section-note">
            Your saved addresses are reused securely at checkout.
          </p>
          <button
            className="button-primary"
            aria-expanded={open}
            onClick={() => setOpen(value => !value)}
          >
            {open ? "Close form" : "Add address"}
          </button>
        </div>
        {open && (
          <form
            className="address-form address-form--open"
            onSubmit={event => {
              event.preventDefault();
              save.mutate({
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
            <label>
              Label
              <input
                value={form.label}
                onChange={event =>
                  setForm({ ...form, label: event.target.value })
                }
                required
              />
            </label>
            <label>
              Full name
              <input
                value={form.fullName}
                onChange={event =>
                  setForm({ ...form, fullName: event.target.value })
                }
                required
              />
            </label>
            <label>
              Mobile number
              <input
                value={form.phone}
                onChange={event =>
                  setForm({ ...form, phone: event.target.value })
                }
                placeholder="03XXXXXXXXX"
                required
              />
            </label>
            <label>
              Email (optional)
              <input
                type="email"
                value={form.email}
                onChange={event =>
                  setForm({ ...form, email: event.target.value })
                }
              />
            </label>
            <label>
              Province
              <select
                value={form.province}
                onChange={event =>
                  setForm({ ...form, province: event.target.value })
                }
                required
              >
                <option value="">Choose province</option>
                <option>Punjab</option>
                <option>Sindh</option>
                <option>Khyber Pakhtunkhwa</option>
                <option>Balochistan</option>
                <option>Islamabad Capital Territory</option>
                <option>Gilgit-Baltistan</option>
                <option>Azad Jammu and Kashmir</option>
              </select>
            </label>
            <label>
              City
              <input
                value={form.city}
                onChange={event =>
                  setForm({ ...form, city: event.target.value })
                }
                required
              />
            </label>
            <label>
              Area / locality
              <input
                value={form.area}
                onChange={event =>
                  setForm({ ...form, area: event.target.value })
                }
              />
            </label>
            <label>
              Postal code
              <input
                value={form.postalCode}
                onChange={event =>
                  setForm({ ...form, postalCode: event.target.value })
                }
              />
            </label>
            <label className="address-form__full">
              Complete address
              <textarea
                value={form.addressLine}
                onChange={event =>
                  setForm({ ...form, addressLine: event.target.value })
                }
                required
              />
            </label>
            <label className="address-form__full">
              Delivery instructions
              <textarea
                value={form.deliveryInstructions}
                onChange={event =>
                  setForm({ ...form, deliveryInstructions: event.target.value })
                }
              />
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={event =>
                  setForm({ ...form, isDefault: event.target.checked })
                }
              />{" "}
              Make this my default delivery address
            </label>
            <button
              className="button-primary"
              type="submit"
              disabled={save.isPending}
            >
              {save.isPending ? "Saving…" : "Save address"}
            </button>
          </form>
        )}
        {addresses.isLoading ? (
          <div
            className="address-grid address-grid--loading"
            aria-label="Loading saved addresses"
          >
            <div className="address-card skeleton-stat" />
            <div className="address-card skeleton-stat" />
          </div>
        ) : (
          <div className="address-grid">
            {addresses.data?.map(address => (
              <article className="address-card" key={address.id}>
                <strong>
                  {address.label}{" "}
                  {address.isDefault === 1 && (
                    <span className="status-pill">Default</span>
                  )}
                </strong>
                <p>
                  {address.fullName}
                  <br />
                  {address.addressLine}
                  <br />
                  {address.area ? `${address.area}, ` : ""}
                  {address.city}, {address.province}
                  <br />
                  {address.phone}
                </p>
              </article>
            ))}
          </div>
        )}
        {!addresses.data?.length && !open && !addresses.isLoading && (
          <div className="empty-state account-empty">
            <strong>No delivery addresses yet.</strong>
            <span>Add an address now for a faster checkout later.</span>
            <button className="button-secondary" onClick={() => setOpen(true)}>
              Add your first address
            </button>
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
