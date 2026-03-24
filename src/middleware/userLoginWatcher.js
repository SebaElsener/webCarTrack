import passport from "passport";

export const requireLogin = (req, res, next) => {
  passport.authenticate(
    "supabase-jwt",
    { session: false },
    (err, user, info) => {
      if (err) return next(err);

      if (!user) {
        // 🔴 Token expirado
        if (info?.name === "TokenExpiredError") {
          console.log("Token expirado");

          // podés redirigir o responder distinto
          return res.redirect("/api/timeout");
        }

        // 🔴 Token inválido u otro error
        return res.redirect("/api/unauthorized");
      }

      req.user = user;
      next();
    },
  )(req, res, next);
};
