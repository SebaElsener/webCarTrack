import {
  carpointerQueryRenderBusiness,
  carpointerQuerybydateBusiness,
} from "../business/carpointerBusiness.js";

const carpointerQueryRender = async (req, res) => {
  const userName = req.user.email;
  const permissions = req.user.permissions;

  res.render("../views/carpointer", {
    userName: userName,
    permissions: permissions,
  });
};

const carpointerQuerybydate = async (req, res) => {
  const { desde, hasta } = req.body;
  const user = req.user;

  try {
    const data = await carpointerQuerybydateBusiness(desde, hasta, user);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error al consultar base de datos" });
  }
};

export { carpointerQueryRender, carpointerQuerybydate };
