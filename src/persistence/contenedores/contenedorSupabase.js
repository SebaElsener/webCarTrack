import dotenv from "dotenv";
import { infoLogger } from "../../logger.js";

dotenv.config();

import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

class ContenedorSupabase {
  constructor() {
    this.sql = supabase;
  }

  async getInfoWithParams(options) {
    try {
      const { vin = null, limit = 50, offset = 0 } = options || {};
      let query = this.sql
        .from("scans")
        .select(
          `
      supabase_id,
      vin,
      date,
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

  async getDataByDate(startDate, endDate) {
    try {
      const { data, error } = await this.sql
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
        clima: s.clima,
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
    console.log(info);
    const [modelo, vin, area, averia, gravedad, observacion, codigo] = info;
    try {
      const { data, error } = await this.sql.from("scans").insert(info);
      console.log(data);
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
        batea,
        damages (
          id, area, averia, grav, obs, date
        ),
        pictures (
          pictureurl,
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
        damages: s.damages ?? [],
        fotos:
          s.pictures?.map((p) => ({
            pictureurl: p.pictureurl,
            id: p.id,
            pict_scan_id: p.scan_id,
          })) ?? [],
      }));
    } catch (err) {
      console.error("Error al consultar VIN en DB", err);
      return null;
    }
  }

  async deletePhoto(pict_id, bucketName, path) {
    console.log(pict_id, bucketName, path);
    try {
      // 1️⃣ borrar registro DB
      const { error: dbError } = await supabase
        .from("pictures")
        .delete()
        .eq("id", pict_id);

      if (dbError) throw dbError;

      // 3️⃣ borrar archivo del storage
      const { error: storageError } = await supabase.storage
        .from(bucketName)
        .remove([path]);

      if (storageError) throw storageError;

      return JSON.stringify({ success: true });
    } catch (err) {
      console.error("Error deletePhoto:", err);
      return res.status(500).json({ error: "No se pudo eliminar la foto" });
    }
  }
}

export default ContenedorSupabase;
