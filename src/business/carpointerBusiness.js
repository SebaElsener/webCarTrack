import { infoLogger } from "../logger.js";
import { supabaseRepo } from "../persistence/factory.js";

const carpointerQueryRenderBusiness = async (desde, hasta, user) => {
  try {
    const data = await supabaseRepo.getDataByDate(desde, hasta, user);
    return data;
  } catch (error) {
    infoLogger.error("Error en querysRenderBusiness", error);
    return [];
  }
};

export { carpointerQueryRenderBusiness };
