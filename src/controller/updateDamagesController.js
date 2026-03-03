import { updateDamages, scanPatch } from "../business/updateDamagesBusiness.js";

const updateDamagesController = async (req, res) => {
  const userName = req.user.id;
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

const patchScanController = async (req, res) => {
  const infoToPatch = req.body;
  const scanId = req.params.scanId;
  try {
    const result = await scanPatch(scanId, infoToPatch);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error al actualizar información en DB", error);
    return res.status(500).json(error);
  }
};

export { updateDamagesController, patchScanController };
