export type StripePaymentIntentResult = {
  clientSecret: string;
  paymentIntentId: string;
};

export async function createStripePaymentIntent(params: {
  amount: number;
  currency?: string;
  orderNumber: string;
  customerEmail?: string;
}): Promise<StripePaymentIntentResult> {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey || secretKey.startsWith("sk_test_placeholder")) {
    // Mock payment intent for testing when keys are deferred
    return {
      clientSecret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).slice(2)}`,
      paymentIntentId: `pi_mock_${Date.now()}`,
    };
  }

  // Real Stripe API call using fetch to avoid hard dependency mismatch
  const body = new URLSearchParams({
    amount: Math.round(params.amount * 100).toString(), // smallest currency unit (cents/paisa)
    currency: (params.currency || "pkr").toLowerCase(),
    "metadata[orderNumber]": params.orderNumber,
    ...(params.customerEmail ? { receipt_email: params.customerEmail } : {}),
  });

  const response = await fetch("https://api.stripe.com/v1/payment_intents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message ||
        `Stripe payment creation failed with status ${response.status}`
    );
  }

  const data = await response.json();
  return {
    clientSecret: data.client_secret,
    paymentIntentId: data.id,
  };
}
