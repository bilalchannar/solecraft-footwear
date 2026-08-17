import { describe, expect, it } from "vitest";
import { getProviderStatus } from "./services/providerStatus";

describe("deferred provider configuration", () => {
  it("reports unavailable providers when credentials are absent", () => {
    const status = getProviderStatus({});
    expect(status.payment.available).toBe(false);
    expect(status.notifications.available).toBe(false);
    expect(status.shipping.available).toBe(false);
    expect(status.payment.reason).toMatch(/not configured/i);
  });

  it("only reports configured when the required provider values exist", () => {
    const status = getProviderStatus({
      PAYMENT_PROVIDER_BASE_URL: "https://gateway.example",
      PAYMENT_PROVIDER_API_KEY: "server-only-test-key",
      PAYMENT_PROVIDER_WEBHOOK_SECRET: "test-webhook-secret",
      NOTIFICATION_PROVIDER_API_KEY: "notification-test-key",
      SHIPPING_PROVIDER_API_KEY: "shipping-test-key",
    });
    expect(status.payment.available).toBe(true);
    expect(status.notifications.available).toBe(true);
    expect(status.shipping.available).toBe(true);
  });
});
