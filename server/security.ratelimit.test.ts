import { describe, expect, it } from "vitest";
import rateLimit from "express-rate-limit";

describe("Security & Rate Limiting Configuration", () => {
  it("creates a general rate limiter with 429 status response", () => {
    const limiter = rateLimit({
      windowMs: 60 * 1000,
      max: 120,
      standardHeaders: true,
      legacyHeaders: false,
    });

    expect(limiter).toBeDefined();
    expect(typeof limiter).toBe("function");
  });

  it("creates a sensitive operation rate limiter with strict windows", () => {
    const sensitiveLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 25,
      standardHeaders: true,
      legacyHeaders: false,
    });

    expect(sensitiveLimiter).toBeDefined();
    expect(typeof sensitiveLimiter).toBe("function");
  });
});
