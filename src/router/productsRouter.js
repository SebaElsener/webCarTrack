import { Router as router } from "express";
import { mainPageRender } from "../controller/productsController.js";
import adminUser from "../middleware/adminUser.js";

const routeProducts = new router();

// Renderiza página pincipal
routeProducts.get("/", mainPageRender);

export default routeProducts;
