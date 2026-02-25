import jwt from "jsonwebtoken";

export const requireLogin = (req, res, next) => {
  const token = req.cookies.sb_token;

  if (!token) {
    return res.redirect("/timeout");
  }

  try {
    const decoded = jwt.decode(token); // Passport ya validó antes
    req.user = decoded;
    next();
  } catch {
    return res.redirect("/timeout");
  }
};
