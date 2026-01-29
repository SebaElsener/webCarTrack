import { deleteDamages } from "../business/deleteDamagesBusiness.js";

const deleteDamagesController = async (req, res) => {
  const damageReference = req.params.damageId;
  console.log(damageReference);
  const result = await deleteDamages(damageReference);
  return res.status(200).json(result);
};

export { deleteDamagesController };
