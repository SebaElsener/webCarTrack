import { supabaseRepo } from "../persistence/factory.js";

const getAllScans = async () => {
  const allScans = await supabaseRepo.getInfoWithParams();
  return allScans;
};

export { getAllScans };
