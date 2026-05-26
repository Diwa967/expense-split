// config/cookieConfig.js

export const getCookieConfig = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,

    // MUST be true in production (Render HTTPS)
    secure: isProduction,

    // CRITICAL for Vercel ↔ Render cross-site cookies
    sameSite: isProduction ? "none" : "lax",

    path: "/",

    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
};