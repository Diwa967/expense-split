// config/cookieConfig.js
export const getCookieConfig = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction, // false in dev (no HTTPS)
    sameSite: isProduction ? "none" : "lax", // lax works for same-site in dev
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  };
};
