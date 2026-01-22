import { updateDamages } from "../business/updateDamagesBusiness.js";

const updateDamagesController = async (req, res) => {
  const dataToUpdate = req.data;
  await updateDamages(dataToUpdate);
};

export { updateDamagesController };
