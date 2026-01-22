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

export { updateDamages };
