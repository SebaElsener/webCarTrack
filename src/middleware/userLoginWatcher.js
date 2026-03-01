import passport from "passport";

export const requireLogin = (req, res, next) => {
  passport.authenticate("supabase-jwt", { session: false }, (err, user) => {
    if (err || !user) {
      return res.redirect("/");
    }
    req.user = user;
    next();
  })(req, res, next);
};
