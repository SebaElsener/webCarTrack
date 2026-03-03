import { infoLogger } from "../logger.js";
import { supabaseRepo } from "../persistence/factory.js";

const updateDamages = async (infoToUpdate) => {
  try {
    const updateResult = await supabaseRepo.updateDamages(infoToUpdate);
    return updateResult;
  } catch (error) {
    infoLogger.error("Error al guardar datos en DB", error);
    return [];
  }
};

const scanPatch = async (scanId, infoToPatch) => {
  const patchResult = await supabaseRepo.scanPatch(scanId, infoToPatch);
  return patchResult;
};

export { updateDamages, scanPatch };
