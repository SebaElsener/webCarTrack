import { updateDamages } from "../business/updateDamagesBusiness.js";

const updateDamagesController = async (req, res) => {
  const userName = req.session.passport.user;
  const infoToUpdate = {
    ...req.body,
    changes: req.body.changes.map((change) => ({
      ...change,
      userName,
    })),
  };
  const result = await updateDamages(infoToUpdate);
  return res.status(200).json(result);
};

export { updateDamagesController };
