import { deletePhoto, deletePhotoSet } from "../business/photosBusiness.js";

const deletePhotoSetController = async (req, res) => {
  //   const { vin } = req.body;
  //   try {
  //     const data = await queryByVINBusiness(vin);
  //     res.json(data);
  //   } catch (error) {
  //     res.status(500).json({ error: "Error al consultar VIN en base de datos" });
  //   }
};

const deletePhotoController = async (req, res) => {
  const { pict_id, pictureurl } = req.body;

  try {
    const data = await deletePhoto(pict_id, pictureurl);
    res.json(data);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al consultar VIN en base de datos" }, error);
  }
};

export { deletePhotoController, deletePhotoSetController };
