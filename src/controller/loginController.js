import passport from "passport";
//import { Strategy } from "passport-local"; ////////// DESINSTALAR
//import { DAOusers } from "../persistence/factory.js";
//import { errorLogger } from "../logger.js";
//import { passwordCheck } from "../../utils/passwordCheck.js";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import dotenv from "dotenv";

dotenv.config();

passport.use(
  "supabase-jwt",
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.SUPABASE_JWT_SECRET,
      algorithms: ["HS256"],
    },
    (payload, done) => {
      return done(null, payload);
    },
  ),
);

const loginController = () => {
  return passport.authenticate("supabase-jwt", {
    successRedirect: "/api/home",
    failureRedirect: "/api/login/faillogin",
  });
};

export default loginController;
