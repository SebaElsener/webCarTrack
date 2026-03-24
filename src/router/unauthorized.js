import { Router } from "express";

const unauthorized = new Router();

unauthorized.get("/", async (req, res) => {
  res.render("unauthorized");
});

export default unauthorized;
