import { describe, expect, it } from "vitest";
import {
  assertCheckoutStock,
  calculateCouponDiscount,
  canTransitionOrder,
  canTransitionPayment,
  validateReturnSelections,
} from "./db";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(
  role: "user" | "staff" | "admin" | "super_admin"
): TrpcContext {
  return {
    user: {
      id: 9,
      openId: "commerce-test-user",
      name: "Commerce Test",
      email: "test@example.com",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("commerce discount rules", () => {
  it("caps a percentage coupon at its maximum discount", () => {
    expect(
      calculateCouponDiscount(12000, {
        kind: "percentage",
        value: "15",
        maximumDiscount: "1000",
      })
    ).toBe(1000);
  });

  it("calculates fixed and free-shipping coupon line discounts correctly", () => {
    expect(
      calculateCouponDiscount(5000, {
        kind: "fixed",
        value: "750",
        maximumDiscount: null,
      })
    ).toBe(750);
    expect(
      calculateCouponDiscount(5000, {
        kind: "free_shipping",
        value: "0",
        maximumDiscount: null,
      })
    ).toBe(0);
  });
});

describe("order and payment state machines", () => {
  it("allows only a valid forward order progression", () => {
    expect(canTransitionOrder("confirmed", "processing")).toBe(true);
    expect(canTransitionOrder("shipped", "delivered")).toBe(false);
    expect(canTransitionOrder("delivered", "processing")).toBe(false);
  });

  it("permits payment settlement and refund paths while blocking reversal from a failure", () => {
    expect(canTransitionPayment("pending", "paid")).toBe(true);
    expect(canTransitionPayment("paid", "refunded")).toBe(true);
    expect(canTransitionPayment("failed", "paid")).toBe(false);
  });
});

describe("checkout inventory guard", () => {
  it("blocks both an empty cart and a quantity that has gone out of stock", () => {
    expect(() => assertCheckoutStock([])).toThrow("Your cart is empty.");
    expect(() =>
      assertCheckoutStock([
        { productName: "Hand-finished loafer", available: 1, quantity: 2 },
      ])
    ).toThrow("no longer has the selected quantity available");
    expect(() =>
      assertCheckoutStock([
        { productName: "Hand-finished loafer", available: 2, quantity: 2 },
      ])
    ).not.toThrow();
  });
});

describe("itemized return validation", () => {
  const orderItems = [
    { id: 11, quantity: 2 },
    { id: 12, quantity: 1 },
  ];
  it("accepts selected quantities within the delivered order", () => {
    expect(
      validateReturnSelections(orderItems, [{ orderItemId: 11, quantity: 1 }])
    ).toEqual([{ orderItemId: 11, quantity: 1 }]);
  });
  it("rejects empty, unknown, and over-quantity selections", () => {
    expect(() => validateReturnSelections(orderItems, [])).toThrow(
      "Select at least one item"
    );
    expect(() =>
      validateReturnSelections(orderItems, [{ orderItemId: 99, quantity: 1 }])
    ).toThrow("Return quantities");
    expect(() =>
      validateReturnSelections(orderItems, [{ orderItemId: 12, quantity: 2 }])
    ).toThrow("Return quantities");
  });
});

describe("procedure authorization and input validation", () => {
  it("blocks a customer from management metrics while permitting a staff member past the role guard", async () => {
    await expect(
      appRouter.createCaller(createContext("user")).admin.metrics()
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(
      appRouter
        .createCaller(createContext("staff"))
        .cart.add({ variantId: 0, quantity: 1 })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
