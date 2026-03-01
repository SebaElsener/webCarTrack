import { Router } from "express";

const timeout = new Router();

timeout.get("/", async (req, res) => {
  res.render("timeout");
});

export default timeout;
