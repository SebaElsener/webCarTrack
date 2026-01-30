import { infoLogger } from "../logger.js";
import { supabaseRepo } from "../persistence/factory.js";

function getStoragePathFromPublicUrl(publicUrl, bucketName) {
  const marker = `/storage/v1/object/public/${bucketName}/`;
  const index = publicUrl.indexOf(marker);

  if (index === -1) {
    throw new Error("URL no corresponde al bucket");
  }

  return publicUrl.substring(index + marker.length);
}

const deletePhoto = async (pict_id, pictureurl) => {
  // 2️⃣ extraer path del bucket
  const bucketName = "pics";
  const path = getStoragePathFromPublicUrl(pictureurl, bucketName);

  if (!pict_id || !pictureurl) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  try {
    const data = await supabaseRepo.deletePhoto(pict_id, bucketName, path);
    console.log(data);
    return data;
  } catch (error) {
    infoLogger.error("Error eliminando foto en DB", error);
    return error;
  }
};

const deletePhotoSet = async (vin) => {
  try {
    const data = await supabaseRepo.getDataByVIN(vin);
    console.log(...data);
    return data;
  } catch (error) {
    infoLogger.error("Error en queryByVINBusiness", error);
    return [];
  }
};

export { deletePhoto, deletePhotoSet };
