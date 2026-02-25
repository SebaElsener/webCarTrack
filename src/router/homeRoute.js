import { Router } from "express";
import passport from "passport";

const homeRoute = new Router();

homeRoute.get("/", (req, res) => {
  res.redirect("/api/productos");
});

homeRoute.post(
  "/",
  passport.authenticate("supabase-jwt", { session: false }),
  (req, res) => {
    const token = req.headers.authorization.split(" ")[1];

    res.cookie("sb_token", token, {
      httpOnly: true,
      secure: false, // en producción poner true
      sameSite: "lax",
      path: "/",
      maxAge: 1000 * 60 * 60 * 24, // 1 día
    });

    res.status(200).json({ ok: true });
  },
);

export default homeRoute;
