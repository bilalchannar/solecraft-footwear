import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { registerUserAccount, loginUserWithPassword, getUserByEmail } from "./db";

describe("Account creation & User Authentication", () => {
  const testEmail = `testuser_${Date.now()}@solecraft.pk`;
  const testPassword = "superSecretPassword123";
  const testName = "Zaid Artisanal";

  it("registers a new user account into the database and persists credentials", async () => {
    const user = await registerUserAccount({
      fullName: testName,
      email: testEmail,
      password: testPassword,
      phone: "03001234567",
    });

    expect(user).toBeDefined();
    expect(user.email).toBe(testEmail.toLowerCase());
    expect(user.name).toBe(testName);
    expect(user.loginMethod).toContain("scrypt:");

    // Verify lookup by email
    const fetched = await getUserByEmail(testEmail);
    expect(fetched).toBeDefined();
    expect(fetched?.id).toBe(user.id);
  });

  it("prevents duplicate registration with the same email", async () => {
    await expect(
      registerUserAccount({
        fullName: "Another Person",
        email: testEmail,
        password: "anotherPassword123",
      })
    ).rejects.toThrow(/already exists/i);
  });

  it("logs in with correct credentials", async () => {
    const loggedIn = await loginUserWithPassword({
      email: testEmail,
      password: testPassword,
    });

    expect(loggedIn).toBeDefined();
    expect(loggedIn.email).toBe(testEmail.toLowerCase());
    expect(loggedIn.name).toBe(testName);
  });

  it("rejects login with invalid password", async () => {
    await expect(
      loginUserWithPassword({
        email: testEmail,
        password: "wrongPassword999",
      })
    ).rejects.toThrow(/invalid email or password/i);
  });

  it("performs end-to-end TRPC registration mutation", async () => {
    const freshEmail = `trpc_user_${Date.now()}@solecraft.pk`;
    const setCookieCalls: string[] = [];

    const mockCtx: any = {
      req: { headers: {} },
      res: {
        cookie: (name: string, val: string) => setCookieCalls.push(name),
        clearCookie: () => {},
      },
      user: null,
    };

    const caller = appRouter.createCaller(mockCtx);
    const result = await caller.auth.register({
      fullName: "TRPC Customer",
      email: freshEmail,
      password: "strongPassword456",
      phone: "03123456789",
    });

    expect(result.success).toBe(true);
    expect(result.user.email).toBe(freshEmail.toLowerCase());
    expect(setCookieCalls.length).toBeGreaterThan(0);
  });
});
