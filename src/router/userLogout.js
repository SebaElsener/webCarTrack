import { Router } from "express";

const userLogout = new Router();

userLogout.get("/", (req, res) => {
  res.render("logout");
});

userLogout.post("/", (req, res) => {
  res.clearCookie("sb_token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // true en producción HTTPS
  });

  res.json({ success: true });
});

export default userLogout;
