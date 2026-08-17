export type ProviderInfo = {
  available: boolean;
  provider?: string;
  reason?: string;
};

export type ProviderStatus = {
  payment: ProviderInfo;
  notifications: ProviderInfo;
  shipping: ProviderInfo;
};

export function getProviderStatus(
  envOverrides?: Record<string, string | undefined>
): ProviderStatus {
  const env = envOverrides ?? process.env;

  const hasPayment = Boolean(
    (env.PAYMENT_PROVIDER_BASE_URL &&
      env.PAYMENT_PROVIDER_API_KEY &&
      env.PAYMENT_PROVIDER_WEBHOOK_SECRET) ||
    (env.STRIPE_SECRET_KEY &&
      !env.STRIPE_SECRET_KEY.startsWith("sk_test_placeholder"))
  );

  const hasNotifications = Boolean(env.NOTIFICATION_PROVIDER_API_KEY);
  const hasShipping = Boolean(env.SHIPPING_PROVIDER_API_KEY);

  return {
    payment: {
      available: hasPayment,
      provider: hasPayment ? "custom_gateway" : undefined,
      reason: hasPayment
        ? undefined
        : "Payment provider credentials not configured. Please use Cash on Delivery (COD).",
    },
    notifications: {
      available: hasNotifications,
      provider: hasNotifications ? "sms_email_gateway" : undefined,
      reason: hasNotifications
        ? undefined
        : "Notification provider credentials not configured.",
    },
    shipping: {
      available: hasShipping,
      provider: hasShipping ? "courier_gateway" : undefined,
      reason: hasShipping
        ? undefined
        : "Shipping provider credentials not configured.",
    },
  };
}
