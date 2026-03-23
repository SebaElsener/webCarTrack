import { carpointerQueryRenderBusiness } from "../business/carpointerBusiness.js";

const carpointerQueryRender = async (req, res) => {
  const userName = req.user.email;
  const permissions = req.user.permissions;

  res.render("../views/carpointer", {
    userName: userName,
    permissions: permissions,
  });
};

export { carpointerQueryRender };
