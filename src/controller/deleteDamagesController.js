import { deleteDamages } from "../business/deleteDamagesBusiness.js";

const deleteDamagesController = async (req, res) => {
  const vinReference = req.params.vin;
  const result = await deleteDamages(vinReference);
  return res.status(200).json(result);
};

export { deleteDamagesController };
