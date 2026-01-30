import { supabaseRepo } from "../persistence/factory.js";

export function getStoragePathFromPublicUrl(publicUrl, bucketName) {
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

  try {
    const data = await supabaseRepo.deletePhoto(pict_id, bucketName, path);
    return data;
  } catch (error) {
    console.error("Error eliminando foto en DB", error);
    return error;
  }
};

const deletePhotoSet = async (scanId) => {
  const bucketName = "pics";
  // 3️⃣ extraer paths del bucket

  try {
    await supabaseRepo.deletePhotoSetAndBucket(scanId, bucketName);
  } catch (error) {
    console.error("Error eliminando las fotos en DB", error);
    return error;
  }
};

export { deletePhoto, deletePhotoSet };
