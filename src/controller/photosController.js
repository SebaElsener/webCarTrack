import { deletePhoto, deletePhotoSet } from "../business/photosBusiness.js";

const deletePhotoSetController = async (req, res) => {
  const { scan_id } = req.body;

  if (!scan_id) {
    return res.status(400).json({ error: "scan_id requerido" });
  }

  try {
    const data = await deletePhotoSet(scan_id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar eliminar las fotos" });
  }
};

const deletePhotoController = async (req, res) => {
  const { pict_id, pictureurl } = req.body;

  if (!pict_id || !pictureurl) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  try {
    const data = await deletePhoto(pict_id, pictureurl);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar eliminar foto" }, error);
  }
};

export { deletePhotoController, deletePhotoSetController };
