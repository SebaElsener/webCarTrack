import { supabaseRepo } from "../persistence/factory.js";

const getAllScans = async () => {
  const allScans = await supabaseRepo.getInfoWithParams();
  return allScans;
};

const deleteScan = async (scan_id) => {
  const deletedVIN = await supabaseRepo.deleteScanById(scan_id);
  return deletedVIN;
};

const addNewScan = async (user, date, vin, type) => {
  const result = await supabaseRepo.addNewVIN(user, date, vin, type);
  console.log(result);
  return result;
};

export { getAllScans, deleteScan, addNewScan };
