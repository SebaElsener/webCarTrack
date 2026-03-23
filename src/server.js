import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
//import { sessionMiddleware } from "./middleware/sessionMiddleware.js";
// import MessageRepository from "./persistence/repository/messageRepository.js";
import userLogin from "./router/userLogin.js";
import homeRoute from "./router/homeRoute.js";
import userReg from "./router/userReg.js";
import passport from "passport";
import routeProducts from "./router/productsRouter.js";
// import routeCart from "./router/cartRouter.js";
import userLogout from "./router/userLogout.js";
import { requireLogin } from "./middleware/userLoginWatcher.js";
import _yargs from "yargs";
import { hideBin } from "yargs/helpers";
import dotenv from "dotenv";
// import infoAndRandoms from "./router/infoAndRandoms.js";
// import cluster from "cluster";
// import * as os from "os";
import compression from "compression";
import routeError from "./middleware/routeError.js";
import { logs } from "./middleware/logs.js";
import userData from "./router/userData.js";
import { infoLogger, errorLogger } from "./logger.js";
//import SessionStore from "../utils/chatSessionStorage.js";
import scansRoute from "./router/scansRoute.js";
// import chartsRoute from "./router/chartsRouter.js";
// import statsRoute from "./router/statsRouter.js";
import querysRouter from "./router/querysRouter.js";
import exportRouter from "./router/exportRouter.js";
import updatesRouter from "./router/updatesRouter.js";
import damagesRouter from "./router/damagesRouter.js";
import photosRouter from "./router/photosRouter.js";
import carpointerRouter from "./router/carpointerRouter.js";
import timeout from "./router/timeout.js";
import cookieParser from "cookie-parser";

dotenv.config();

const yargs = _yargs(hideBin(process.argv));
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// const messages = MessageRepository.getInstance();

app.set("view engine", "ejs");
app.set("views", "./public/views");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(compression());
app.use(passport.initialize());

// Middleware para registrar todas la peticiones recibidas
app.use(logs);

// Rutas api
app.use("/", userLogin);
app.use("/api/productos", requireLogin, routeProducts);
// app.use("/api/carrito", requireLogin, routeCart);
app.use("/api/userdata", requireLogin, userData);
app.use("/api/querys", requireLogin, querysRouter);
app.use("/api/export", requireLogin, exportRouter);
app.use("/api/carpointer", requireLogin, carpointerRouter);
app.use("/api/timeout", timeout);
app.use("/api/updates", requireLogin, updatesRouter);
app.use("/api/damages", requireLogin, damagesRouter);
app.use("/api/photos", requireLogin, photosRouter);
app.use("/api/scans", requireLogin, scansRoute);
app.use("/api/login", userLogin);
app.use("/api/logout", userLogout);
app.use("/api/register", userReg);
//app.use("/api/stats", statsRoute);
app.use("/api/home", homeRoute);
//app.use("/api/charts", chartsRoute);
//app.use("/api/populateSupabase", infoAndRandoms);

// Middleware para mostrar error al intentar acceder a una ruta/método no implementados
app.use(routeError);

const PORT = process.env.PORT || 8080;

const connectedServer = httpServer.listen(PORT, () => {
  infoLogger.info(
    `http server escuchando en puerto ${connectedServer.address().port}`,
  );
});

connectedServer.on("error", (error) =>
  errorLogger.error(`Error en servidor ${error}`),
);
