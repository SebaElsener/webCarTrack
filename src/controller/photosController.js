import {
  deleteFile,
  deleteFileSet,
  uploadFilesBusiness,
} from "../business/photosBusiness.js";

const deleteFileSetController = async (req, res) => {
  const { scan_id } = req.body;

  if (!scan_id) {
    return res.status(400).json({ error: "scan_id requerido" });
  }

  try {
    const data = await deleteFileSet(scan_id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar eliminar archivos" });
  }
};

const deleteFileController = async (req, res) => {
  const { pict_id, upload_id, pictureurl } = req.body;

  if ((!pict_id && !upload_id) || !pictureurl) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  try {
    const data = await deleteFile({ pict_id, upload_id, pictureurl });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar eliminar archivo" });
  }
};

const uploadFiles = async (req, res) => {
  try {
    const { vin, fileName, scanId } = req.body;
    const file = req.file;
    const user = req.user.email;

    if (!file || !vin || !scanId) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const uploadFilesResult = await uploadFilesBusiness(
      vin,
      fileName,
      scanId,
      file,
      user,
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error al subir archivo" });
  }
};

export { deleteFileController, deleteFileSetController, uploadFiles };
