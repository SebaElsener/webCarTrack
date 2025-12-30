import session from "express-session";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";

dotenv.config();

export const sessionMiddleware = session({
  store: MongoStore.create({
    dbName: "sessions",
    mongoUrl: process.env.MONGOURI,
    mongoOptions: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  }),
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    maxAge: parseInt(process.env.SESSION_TIME),
  },
});
