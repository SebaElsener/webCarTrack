import { supabaseRepo } from "../persistence/factory.js";

const getAllScans = async () => {
  const allScans = await supabaseRepo.getInfoWithParams();
  return allScans;
};

const deleteScan = async (scan_id) => {
  const deletedVIN = await supabaseRepo.deleteScanById(scan_id);
  return deletedVIN;
};

export { getAllScans, deleteScan };
