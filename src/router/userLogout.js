import { Router } from "express";

const userLogout = new Router();

userLogout.get("/", (req, res) => {
  res.render("logout");
});

userLogout.post("/", (req, res) => {
  res.clearCookie("sb_token", {
    httpOnly: true,
    secure: false, // en producción poner true
    sameSite: "lax",
    path: "/",
    maxAge: 1000 * 60 * 60 * 24, // 1 día
  });

  res.json({ success: true });
});

export default userLogout;
