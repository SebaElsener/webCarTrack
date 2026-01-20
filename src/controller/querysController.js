import {
  querysRenderBusiness,
  queryByVINBusiness,
} from "../business/querysBusiness.js";
import { mainPage } from "../business/ProductsBusiness.js";

const queryByDateRender = async (req, res) => {
  const userName = req.session.passport.user;
  res.render("../views/queryByDate", {
    userName: userName,
  });
};

const queryByVINRender = async (req, res) => {
  const userName = req.session.passport.user;
  res.render("../views/queryByVIN", {
    userName: userName,
  });
};

const queryByDatePost = async (req, res) => {
  const { desde, hasta } = req.body;
  try {
    const data = await querysRenderBusiness(desde, hasta);
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
