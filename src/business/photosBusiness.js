import { supabaseRepo } from "../persistence/factory.js";

export function getStoragePathFromPublicUrl(publicUrl, bucketName) {
  const marker = `/storage/v1/object/public/${bucketName}/`;
  const index = publicUrl.indexOf(marker);

  if (index === -1) {
    throw new Error("URL no corresponde al bucket");
  }

  return publicUrl.substring(index + marker.length);
}

const deleteFile = async ({ pict_id, upload_id, pictureurl }) => {
  // 2️⃣ extraer path del bucket
  const bucketName = "pics";
  const path = getStoragePathFromPublicUrl(pictureurl, bucketName);

  try {
    const data = await supabaseRepo.deleteFile({
      pict_id,
      upload_id,
      bucketName,
      path,
    });
    return data;
  } catch (error) {
    console.error("Error eliminando archivo en DB", error);
    return error;
  }
};

const deleteFileSet = async (scanId) => {
  const bucketName = "pics";

  try {
    const data = await supabaseRepo.deleteFileSetAndBucket(scanId, bucketName);
    return data;
  } catch (error) {
    console.error("Error eliminando archivos del scan", error);
    throw error;
  }
};

const uploadFilesBusiness = async (vin, fileName, scanId, file, user) => {
  const uploadResult = await supabaseRepo.uploadFiles(
    vin,
    fileName,
    scanId,
    file,
    user,
  );
  return uploadResult;
};

export { deleteFile, deleteFileSet, uploadFilesBusiness };
