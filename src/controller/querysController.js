import {
  querysRenderBusiness,
  queryByVINBusiness,
} from "../business/querysBusiness.js";

const queryByDateRender = async (req, res) => {
  const userName = req.user.email;
  const permissions = req.user.permissions;

  res.render("../views/queryByDate", {
    userName: userName,
    permissions: permissions,
  });
};

const queryByVINRender = async (req, res) => {
  const userName = req.user.email;
  const permissions = req.user.permissions;

  res.render("../views/queryByVIN", {
    userName: userName,
    permissions: permissions,
  });
};

const queryByDatePost = async (req, res) => {
  const { desde, hasta } = req.body;
  const user = req.user;

  try {
    const data = await querysRenderBusiness(desde, hasta, user);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error al consultar base de datos" });
  }
};

const queryByVINPost = async (req, res) => {
  const { vin } = req.body;
  try {
    const data = await queryByVINBusiness(vin);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error al consultar VIN en base de datos" });
  }
};

export { queryByDateRender, queryByDatePost, queryByVINPost, queryByVINRender };
