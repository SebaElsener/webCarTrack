import dotenv from "dotenv";
import { infoLogger } from "../../logger.js";

dotenv.config();

import { createClient } from "@supabase/supabase-js";
import { readUsedSize } from "chart.js/helpers";

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
          pictureurl
        )
      `,
        )
        .like("vin", `%${vin}%`) // búsqueda parcial
        .order("date", { ascending: true });

      if (error) throw error;

      if (!scans || scans.length === 0) {
        document.getElementById("resultados").innerHTML =
          "<p class='text-muted'>No se encontraron datos</p>";
        document.getElementById("paginacion").innerHTML = "";
        return;
      }

      const result = scans.map((s) => ({
        scan_id: s.supabase_id,
        vin: s.vin,
        scan_date: s.date,
        marca: s.marca,
        modelo: s.modelo,
        user: s.user,
        clima: s.clima,
        batea: s.batea,
        damages: s.damages ?? [],
        fotos: s.pictures?.map((p) => p.pictureurl) ?? [],
      }));
      return result;
    } catch (err) {
      console.error("Error al consultar VIN en DB", err);
    }
  }
}

export default ContenedorSupabase;
