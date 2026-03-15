import { Router } from "express";

import {
  renderUserData,
  getUser,
  updateUser,
  usersAdmin,
  roleUpdate,
  userDelete,
  passChange,
} from "../controller/userController.js";

const userData = new Router();

userData.get("/", renderUserData);

userData.get("/getuser", getUser);

userData.post("/", updateUser);

userData.put("/:userId/role", roleUpdate);

// userData.get("/purchaseorder", purchaseOrder);

userData.get("/usersadmin", usersAdmin);

// userData.put("/usersadm", usersAdm);

userData.delete("/:userId", userDelete);

userData.post("/passchange", passChange);

export default userData;
