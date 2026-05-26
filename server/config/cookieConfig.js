// config/cookieConfig.js

export const getCookieConfig = () => {
  return {
    httpOnly: true,
    secure: true, // ✅ Always true on Render HTTPS
    sameSite: "none", // ✅ Required for Vercel ↔ Render
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
};