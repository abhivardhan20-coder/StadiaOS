import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { Application } from "express";

export const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "AI request limit reached, please slow down." },
  validate: { trustProxy: true }
});

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
  validate: { trustProxy: true }
});

export const setupSecurity = (app: Application) => {
  const isProd = process.env.NODE_ENV === 'production';
  const cspDirectives: Record<string, string[] | boolean> = {
    defaultSrc: ["'self'"],
    scriptSrc: isProd ? ["'self'"] : ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https://images.unsplash.com"],
    connectSrc: isProd
      ? ["'self'", "https://accounts.google.com", "https://oauth2.googleapis.com"]
      : ["'self'", "ws:", "wss:", "https://accounts.google.com", "https://oauth2.googleapis.com"],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
  };

  if (isProd) {
    cspDirectives.frameAncestors = ["'none'"];
  }

  app.use(helmet({
    xFrameOptions: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: isProd ? { policy: 'same-origin' } : false,
    contentSecurityPolicy: isProd ? {
      directives: cspDirectives as Record<string, Iterable<string>>,
    } : false,
  }));
  app.use(cors({ origin: process.env.APP_URL || 'http://localhost:3000' }));
};
