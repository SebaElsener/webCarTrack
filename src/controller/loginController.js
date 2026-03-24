import passport from "passport";
//import { Strategy } from "passport-local"; ////////// DESINSTALAR
//import { DAOusers } from "../persistence/factory.js";
//import { errorLogger } from "../logger.js";
//import { passwordCheck } from "../../utils/passwordCheck.js";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY, // solo en backend
);

passport.use(
  "supabase-jwt",
  new JwtStrategy(
    {
      jwtFromRequest: (req) => {
        if (req.headers?.authorization?.startsWith("Bearer ")) {
          return req.headers.authorization.split(" ")[1];
        }

        if (req.cookies?.sb_token) {
          return req.cookies.sb_token;
        }

        return null;
      },
      secretOrKey: process.env.SUPABASE_JWT_SECRET,
      algorithms: ["HS256"],
    },
    async (payload, done) => {
      try {
        const userId = payload.sub;

        const { data, error } = await supabase.rpc("get_user_context", {
          uid: userId,
        });

        if (error || !data?.length) {
          return done(null, false);
        }

        const ctx = data[0];

        const user = {
          id: userId,
          email: payload.email,
          role_id: ctx.role_id,
          destino: ctx.destino,
          permissions: ctx.permissions,
          isAdmin: ctx.is_admin,
          canViewAll: ctx.can_view_all,
          canManageUsers: ctx.can_manage_users,
        };

        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    },
  ),
);

const loginController = () => {
  return passport.authenticate("supabase-jwt", {
    session: false,
  });
};

export default loginController;
