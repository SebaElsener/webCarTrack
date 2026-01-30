import { infoLogger } from "../logger.js";
import { supabaseRepo } from "../persistence/factory.js";

const querysRenderBusiness = async (desde, hasta) => {
  try {
    const data = await supabaseRepo.getDataByDate(desde, hasta);
    return data;
  } catch (error) {
    infoLogger.error("Error en querysRenderBusiness", error);
    return [];
  }
};

const queryByVINBusiness = async (vin) => {
  try {
    const data = await supabaseRepo.getDataByVIN(vin);
    return data;
  } catch (error) {
    infoLogger.error("Error en queryByVINBusiness", error);
    return [];
  }
};

export { querysRenderBusiness, queryByVINBusiness };
