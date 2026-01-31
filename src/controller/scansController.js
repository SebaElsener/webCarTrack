import { getAllScans, deleteScan } from "../business/scansBusiness.js";

const renderScans = async (req, res) => {
  const scansData = await getAllScans();
  res.render("scansData", {
    scansData: scansData,
  });
};

const deletebyscan_id = async (req, res) => {
  const { scan_id } = req.params;
  const result = await deleteScan(scan_id);
  return res.status(200).json(result);
};

export { renderScans, deletebyscan_id };
