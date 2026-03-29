import { Router } from "express";

import {
  renderUserData,
  getUser,
  updateUser,
  usersAdmin,
  roleUpdate,
  userDelete,
  passChange,
  getTransportistasController,
  postTransportistasController,
  putTransportistasController,
  deleteTransportistasController,
} from "../controller/userController.js";

const userData = new Router();

/// USUARIOS ///
userData.get("/", renderUserData);
userData.get("/getuser", getUser);
userData.post("/", updateUser);
userData.put("/:userId/role", roleUpdate);
userData.get("/usersadmin", usersAdmin);
userData.delete("/:userId", userDelete);
userData.post("/passchange", passChange);

/// TRANSPORTISTAS ///
userData.get("/transportistas", getTransportistasController);
userData.post("/transportistas", postTransportistasController);
userData.put("/transportistas/:id", putTransportistasController);
userData.delete("/transportistas/:id", deleteTransportistasController);

export default userData;
