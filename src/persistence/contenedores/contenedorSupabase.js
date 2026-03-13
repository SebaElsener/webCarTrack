import dotenv from "dotenv";
import { infoLogger } from "../../logger.js";
import { getStoragePathFromPublicUrl } from "../../business/photosBusiness.js";

dotenv.config();

import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

class ContenedorSupabase {
  constructor() {
    this.sql = supabase;
  }

  applyVisibilityFilter(query, user) {
    if (user.isAdmin) return query;

    if (!user.canViewAll) {
      query = query.eq("user", user.email);
    }

    if (user.destino) {
      query = query.eq("destino", user.destino);
    }

    return query;
  }

  async getInfoWithParams(options) {
    try {
      const {
        vin = null,
        destino = null,
        limit = 50,
        offset = 0,
      } = options || {};
      let query = this.sql
        .from("scans")
        .select(
          `
            supabase_id,
            vin,
            date,
            destino,
            damages (
              id,
              area,
              averia,
              grav,
              obs,
              codigo,
              date
            ),
            pictures (
              pictureurl
            )
          `,
        )
        .order("supabase_id", { ascending: false })
        .range(offset, offset + limit - 1);

      if (vin) {
        query = query.eq("vin", vin);
      }

      const { data, error } = await query;

      if (error) {
        console.error("getScans error:", error);
        return false;
      }

      if (!data || !data.length) return false;

      const result = data.map((s) => {
        let damages = s.damages ?? [];

        // mismo filtro que ya tenías
        damages = damages.filter(
          (d) =>
            d.area !== null ||
            d.averia !== null ||
            d.grav !== null ||
            d.obs !== null ||
            d.codigo !== null,
        );

        return {
          scan_id: s.supabase_id,
          vin: s.vin,
          scan_date: s.date,
          damages,
          fotos: (s.pictures ?? []).map((p) => p.pictureurl).filter(Boolean),
        };
      });
      return result;
    } catch (error) {
      infoLogger.info("Error al consultar DB", error);
    }
  }

  async updateDamages(infoToUpdate) {
    try {
      const { data, error } = await supabase.rpc("update_damages", {
        ...infoToUpdate,
      });

      if (error) {
        console.error("Error al actualizar datos", error);
      } else {
        return data;
      }
    } catch (error) {
      console.log("Error al actualizar la información en DB", error);
      infoLogger.error("Error al actualizar la información en DB", error);
      return [];
    }
  }

  async scanPatch(scanId, infoToPatch) {
    const { data, error } = await supabase
      .from("scans")
      .update(infoToPatch)
      .eq("supabase_id", scanId)
      .select()
      .single();

    if (error) return error;
    return data;
  }

  async uploadFiles(vin, fileName, scanId, file, user) {
    // Subir archivo a bucket
    const { error: uploadError } = await supabase.storage
      .from("pics")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) return uploadError;

    // Obtener URL pública
    const { data: publicData } = supabase.storage
      .from("pics")
      .getPublicUrl(fileName);

    const publicUrl = publicData.publicUrl;

    // Insertar en uploads
    const { error: insertError } = await supabase.from("uploads").insert({
      vin,
      public_url: publicUrl,
      user: user,
      scan_id: Number(scanId),
    });

    if (insertError) return insertError;
  }

  async deleteDamages(damageReference) {
    try {
      const { data, error } = await supabase.rpc("delete_damage_by_id", {
        p_damage_id: damageReference,
      });

      if (error) {
        console.error("Error al eliminar daños", error);
      } else {
        return data;
      }
    } catch (error) {
      console.log("Error al eliminar daños en DB", error);
      infoLogger.error("Error al eliminar daños en DB", error);
    }
  }

  /////////////
  async getOnlyAreas() {
    try {
      const { data, error } = await this.sql.from("scans").select("area");
      return data;
    } catch (error) {
      infoLogger.info("Error al consultar areas", error);
    }
  }

  async getOnlyDamages() {
    try {
      const { data, error } = await this.sql.from("scans").select("averia");
      return data;
    } catch (error) {
      infoLogger.info("Error al consultar averias", error);
    }
  }

  async getOnlyMissings() {
    try {
      const { data, error } = await this.sql
        .from("scans")
        .select("area")
        .eq("averia", "M");
      return data;
    } catch (error) {
      infoLogger.info("Error al consultar base de datos", error);
    }
  }

  async getDataByDate(startDate, endDate, user) {
    try {
      let query = this.sql
        .from("scans")
        .select(
          `
            supabase_id,
            vin,
            date,
            marca,
            modelo,
            batea,
            movimiento,
            clima,
            user,
            lugar,
            destino,
            unidad_transito,
            damages (
              id,
              area,
              averia,
              grav,
              obs,
              date
            ),
            pictures (
              pictureurl
            )
        `,
        )
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true });

      query = this.applyVisibilityFilter(query, user);

      const { data, error } = await query;

      if (error) throw error;

      const result = data.map((s) => ({
        scan_id: s.supabase_id,
        vin: s.vin,
        scan_date: s.date,
        marca: s.marca,
        modelo: s.modelo,
        batea: s.batea,
        movimiento: s.movimiento,
        user: s.user,
        lugar: s.lugar,
        destino: s.destino,
        clima: s.clima,
        unidad_transito: s.unidad_transito,
        damages: (s.damages ?? []).filter(
          (d) =>
            d.area !== null ||
            d.averia !== null ||
            d.grav !== null ||
            d.obs !== null,
        ),
        fotos: (s.pictures ?? []).map((p) => p.pictureurl).filter(Boolean),
      }));

      return result;
    } catch (error) {
      infoLogger.info("Error al consultar base de datos por fecha", error);
      return false;
    }
  }

  async getPictures() {
    try {
      const { data, error } = await this.sql.from("pictures").select("*");
      return data;
    } catch (error) {
      infoLogger.info("Error al consultar fotos", error);
    }
  }

  // Func para popular DB supabse
  async populateDb(info) {
    const [modelo, vin, area, averia, gravedad, observacion, codigo] = info;
    try {
      const { data, error } = await this.sql.from("scans").insert(info);
      return data;
    } catch (error) {
      return "error";
    }
  }

  //Traer datos por chasis-vin
  async getDataByVIN(vin) {
    try {
      const { data: scans, error } = await supabase
        .from("scans")
        .select(
          `
        supabase_id,
        vin,
        date,
        marca,
        modelo,
        clima,
        user,
        movimiento,
        lugar,
        batea,
        destino,
        unidad_transito,
        damages (
          id, area, averia, grav, obs, date
        ),
        pictures (
          pictureurl,
          id,
          scan_id
        ),
        uploads (
          public_url,
          id,
          scan_id
        )
      `,
        )
        .ilike("vin", `%${vin}%`)
        .order("date", { ascending: true });

      if (error) throw error;
      if (!scans?.length) return [];

      return scans.map((s) => ({
        scan_id: s.supabase_id,
        vin: s.vin,
        scan_date: s.date,
        marca: s.marca,
        modelo: s.modelo,
        user: s.user,
        clima: s.clima,
        batea: s.batea,
        lugar: s.lugar,
        movimiento: s.movimiento,
        destino: s.destino,
        unidad_transito: s.unidad_transito,
        damages: s.damages ?? [],
        fotos:
          s.pictures?.map((p) => ({
            pictureurl: p.pictureurl,
            id: p.id,
            pict_scan_id: p.scan_id,
          })) ?? [],
        uploads:
          s.uploads?.map((u) => ({
            publicUrl: u.public_url,
            id: u.id,
            upload_scan_id: u.scan_id,
          })) ?? [],
      }));
    } catch (err) {
      console.error("Error al consultar VIN en DB", err);
      return null;
    }
  }

  async getByUser(userId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, destino, name, address, phone")
      .eq("id", userId);

    if (error) throw error;

    return data;
  }

  async updateUserById(userId, userInfoToUpdate) {
    const { data, error } = await supabase
      .from("profiles")
      .update(userInfoToUpdate)
      .eq("id", userId)
      .select();

    if (error) throw error;

    return data;
  }

  async deleteFile({ pict_id, upload_id, bucketName, path }) {
    try {
      // borrar registro DB
      if (pict_id) {
        const { error } = await supabase
          .from("pictures")
          .delete()
          .eq("id", pict_id);

        if (error) throw error;
      }

      if (upload_id) {
        const { error } = await supabase
          .from("uploads")
          .delete()
          .eq("id", upload_id);

        if (error) throw error;
      }

      // borrar archivo storage
      const { error: storageError } = await supabase.storage
        .from(bucketName)
        .remove([path]);

      if (storageError) throw storageError;

      return { success: true };
    } catch (err) {
      console.error("deleteFile error:", err);
      throw err;
    }
  }

  async addNewVIN({ user, date, vin, type }) {
    const { data, error } = await this.sql
      .from("scans")
      .insert({ user, date, vin, type })
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async deleteScanById(scan_id) {
    const bucketName = "pics";
    try {
      // obtener todas las fotos del scan
      const { data: photos, error: fetchError } = await supabase
        .from("pictures")
        .select("id, pictureurl")
        .eq("scan_id", scan_id);

      if (fetchError) throw fetchError;

      if (!photos || photos.length === 0) {
        // nada para borrar → idempotente
      }

      const paths = (photos && [])
        .map((p) => {
          try {
            return getStoragePathFromPublicUrl(p.pictureurl, bucketName);
          } catch {
            return null;
          }
        })
        .filter(Boolean);

      // borrar VIN en DB
      const { error: deleteDbError } = await supabase
        .from("scans")
        .delete()
        .eq("supabase_id", scan_id);

      if (deleteDbError) {
        console.error(deleteDbError);
        throw deleteDbError;
      }

      // borrar archivos del bucket (batch)
      if (paths.length) {
        const { error: storageError } = await supabase.storage
          .from(bucketName)
          .remove(paths);

        if (storageError) throw storageError;
      }

      return {
        success: true,
      };
    } catch (error) {
      console.log("Error al eliminar VIN/Daños/Fotos en DB", error);
    }
  }

  async deleteFileSetAndBucket(scan_id) {
    const bucketName = "pics";
    try {
      // 1️⃣ obtener fotos
      const { data: photos, error: photosError } = await supabase
        .from("pictures")
        .select("pictureurl")
        .eq("scan_id", scan_id);

      if (photosError) throw photosError;

      // 2️⃣ obtener uploads
      const { data: uploads, error: uploadsError } = await supabase
        .from("uploads")
        .select("public_url")
        .eq("scan_id", scan_id);

      if (uploadsError) throw uploadsError;

      // 3️⃣ construir paths storage
      const photoPaths = (photos || [])
        .map((p) => {
          try {
            return getStoragePathFromPublicUrl(p.pictureurl, bucketName);
          } catch {
            return null;
          }
        })
        .filter(Boolean);

      const uploadPaths = (uploads || [])
        .map((u) => {
          try {
            return getStoragePathFromPublicUrl(u.public_url, bucketName);
          } catch {
            return null;
          }
        })
        .filter(Boolean);

      const allPaths = [...photoPaths, ...uploadPaths];

      // 4️⃣ borrar registros DB
      const { error: deletePhotosError } = await supabase
        .from("pictures")
        .delete()
        .eq("scan_id", scan_id);

      if (deletePhotosError) throw deletePhotosError;

      const { error: deleteUploadsError } = await supabase
        .from("uploads")
        .delete()
        .eq("scan_id", scan_id);

      if (deleteUploadsError) throw deleteUploadsError;

      // 5️⃣ borrar archivos storage
      if (allPaths.length) {
        const { error: storageError } = await supabase.storage
          .from(bucketName)
          .remove(allPaths);

        if (storageError) throw storageError;
      }

      return {
        success: true,
        deletedPhotos: photoPaths.length,
        deletedUploads: uploadPaths.length,
      };
    } catch (error) {
      console.error("Error deleteFileSetAndBucket:", error);
      throw error;
    }
  }
}

export default ContenedorSupabase;
