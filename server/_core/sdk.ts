import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import { COOKIE_NAME } from "@shared/const";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";

export type SessionPayload = {
  openId: string;
  name?: string;
};

class AuthSDK {
  private getSecret(): Uint8Array {
    const secret = ENV.cookieSecret || "development_secret_key_change_in_prod";
    return new TextEncoder().encode(secret);
  }

  async createSessionToken(
    openId: string,
    options: { name?: string; expiresInMs?: number } = {}
  ): Promise<string> {
    const { name = "", expiresInMs = 365 * 24 * 60 * 60 * 1000 } = options;
    const expiresAt = new Date(Date.now() + expiresInMs);

    return new SignJWT({ openId, name })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(expiresAt)
      .sign(this.getSecret());
  }

  async verifySessionToken(token: string): Promise<SessionPayload | null> {
    try {
      const { payload } = await jwtVerify(token, this.getSecret());
      if (typeof payload.openId === "string") {
        return {
          openId: payload.openId,
          name: typeof payload.name === "string" ? payload.name : undefined,
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  async authenticateRequest(req: Request): Promise<User | null> {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return null;

    const cookies = parseCookieHeader(cookieHeader);
    const sessionToken = cookies[COOKIE_NAME];
    if (!sessionToken) return null;

    const session = await this.verifySessionToken(sessionToken);
    if (!session?.openId) return null;

    const user = await db.getUserByOpenId(session.openId);
    return user ?? null;
  }

  async exchangeCodeForToken(
    code: string,
    _state: string
  ): Promise<{ accessToken: string }> {
    return { accessToken: code };
  }

  async getUserInfo(accessToken: string): Promise<{
    openId: string;
    name?: string;
    email?: string;
    loginMethod?: string;
    platform?: string;
  }> {
    return {
      openId: accessToken,
      name: "Customer User",
      email: `${accessToken}@example.com`,
      loginMethod: "oauth",
    };
  }
}

export const sdk = new AuthSDK();
