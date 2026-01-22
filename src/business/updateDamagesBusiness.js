import { infoLogger } from "../logger.js";
import { supabaseRepo } from "../persistence/factory.js";

const updateDamages = async (data) => {
  try {
  } catch (error) {
    infoLogger.error("Error al guardar datos en DB", error);
    return [];
  }
};

export { updateDamages };
