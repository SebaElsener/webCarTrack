import { supabaseRepo } from "../persistence/factory.js";

const carpointerQueryRenderBusiness = async (desde, hasta, user) => {
  try {
    const data = await supabaseRepo.getDataByDate(desde, hasta, user);
    return data;
  } catch (error) {
    console.error("Error en querysRenderBusiness", error);
    return [];
  }
};

const carpointerQuerybydateBusiness = async (desde, hasta, user) => {
  try {
    const data = await supabaseRepo.getCarpointerDataByDate(desde, hasta, user);
    return data;
  } catch (error) {
    console.error("Error en carpointerQuerybydateBusiness", error);
    return [];
  }
};

const getDataByVINfromCarpointerBusiness = async (vin) => {
  return await supabaseRepo.getDataByVINfromCarpointer(vin);
};

export {
  carpointerQueryRenderBusiness,
  carpointerQuerybydateBusiness,
  getDataByVINfromCarpointerBusiness,
};
