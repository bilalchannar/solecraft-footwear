import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import rateLimit from "express-rate-limit";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

// 1. General API rate limiter (120 requests per minute per IP)
const globalApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: "Too many requests from this IP. Please try again in a moment.",
      code: 429,
    },
  },
});

// 2. Strict rate limiter for sensitive operations (25 requests per 15 minutes per IP)
const sensitiveApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message:
        "Too many sensitive attempts. Please wait 15 minutes before retrying.",
      code: 429,
    },
  },
});

console.log("[Server] Initializing SoleCraft server...");

async function startServer() {
  console.log("[Server] Creating Express app and HTTP server...");
  const app = express();
  const server = createServer(app);

  // Security Headers & Hardening
  app.disable("x-powered-by");
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
  });

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  // Apply rate limiters
  app.use("/api/", globalApiLimiter);
  app.use("/api/trpc/checkout.placeOrder", sensitiveApiLimiter);
  app.use("/api/trpc/checkout.createPaymentIntent", sensitiveApiLimiter);
  app.use("/api/trpc/newsletter.subscribe", sensitiveApiLimiter);

  registerStorageProxy(app);
  registerOAuthRoutes(app);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV !== "production") {
    console.log("[Server] Configuring Vite middleware...");
    await setupVite(app, server);
    console.log("[Server] Vite middleware configured.");
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "3000", 10);

  server.listen(port, "0.0.0.0", () => {
    console.log(`\n==============================================`);
    console.log(` SoleCraft Footwear Commerce Server Running!`);
    console.log(` URL: http://localhost:${port}/`);
    console.log(` Supabase DB & Stripe Test Mode: Active`);
    console.log(`==============================================\n`);
  });
}

startServer().catch(err => {
  console.error("[Server Error]", err);
});
