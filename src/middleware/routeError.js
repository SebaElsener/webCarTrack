import { errorLogger } from "../logger.js";

const routeError = (req, res, next) => {
  if ((res.status = "404")) {
    const error = `Ruta '${req.path}' metodo '${req.method}' no implementada`;
    errorLogger.warn(error);
    res.render("routeError", {
      badRoute: error,
    });
  }
  next();
};

export default routeError;
