import {
  querysRenderBusiness,
  queryByVINBusiness,
} from "../business/querysBusiness.js";

const queryByDateRender = async (req, res) => {
  res.render("../views/queryByDate");
};

const queryByVINRender = async (req, res) => {
  res.render("../views/queryByVIN");
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
