import { infoLogger } from "../logger.js";
import { supabaseRepo } from "../persistence/factory.js";

const deleteDamages = async (damageReference) => {
  try {
    const deletedDamages = await supabaseRepo.deleteDamages(damageReference);
    return deletedDamages;
  } catch (error) {
    infoLogger.error("Error al eliminar datos en DB", error);
    return [];
  }
};

export { deleteDamages };
