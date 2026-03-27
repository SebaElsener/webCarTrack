import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import xlsx from "xlsx";

dotenv.config();

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const jobs = {};

const uploadMovimientos = async (req, res) => {
  const jobId = Date.now().toString();

  jobs[jobId] = { progress: 0, done: false, etapa: "iniciando" };

  res.json({ jobId });

  (async () => {
    try {
      // 🧹 1. borrar datos existentes
      jobs[jobId].etapa = "limpiando tabla";

      const { error: truncateError } = await supabase.rpc(
        "truncate_movimientos_test",
      );

      if (truncateError) throw truncateError;

      // 📖 2. leer excel
      jobs[jobId].etapa = "leyendo archivo";

      const workbook = xlsx.readFile(req.file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      // 🔥 leer como matriz (no como JSON todavía)
      let raw = xlsx.utils.sheet_to_json(sheet, { header: 1 });

      // ❌ eliminar primeras 6 filas
      raw = raw.slice(6);

      // ❌ eliminar primera columna
      raw = raw.map((row) => row.slice(1));

      // ✅ primera fila ahora es header
      const normalizeKey = (k) =>
        String(k || "")
          .trim()
          .toLowerCase();

      const headers = raw[0].map(normalizeKey);
      let rows = raw.slice(1);

      // convertir a objetos
      rows = rows.map((row) => {
        const obj = {};
        headers.forEach((h, i) => {
          obj[h] = row[i] ?? null;
        });
        return obj;
      });

      // 🧹 limpieza
      rows = rows
        .filter(
          (r) =>
            r.idtequipo &&
            String(r.idtequipo).trim() !== "" &&
            r.idtviaje &&
            String(r.idtviaje).trim() !== "",
        )
        .map((r) => {
          delete r.chasis;
          delete r.preciopagado;

          if (r.fechapartida) {
            if (
              typeof r.fechapartida === "string" &&
              r.fechapartida.includes("/")
            ) {
              const [d, m, y] = r.fechapartida.split("/");
              r.fechapartida = `${y}-${m}-${d} 00:00:00`;
            } else {
              const d = new Date(r.fechapartida);
              r.fechapartida = d.toISOString().slice(0, 19).replace("T", " ");
            }
          }

          return r;
        });

      const total = rows.length;
      const chunkSize = 500;
      let processed = 0;

      // 🚀 4. insertar
      jobs[jobId].etapa = "subiendo datos";

      for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);

        const { error } = await supabase
          .schema("carpointer")
          .from("movimientos_test")
          .insert(chunk);

        if (error) throw error;

        processed += chunk.length;

        jobs[jobId].progress = Math.round((processed / total) * 100);
      }

      jobs[jobId].done = true;
      jobs[jobId].etapa = "completo";
    } catch (err) {
      jobs[jobId] = {
        error: err.message,
        done: true,
        etapa: "error",
      };
    } finally {
      // 🧹 borrar archivo temporal
      fs.unlink(req.file.path, () => {});
    }
  })();
};

const uploadProgress = async (req, res) => {
  const { jobId } = req.params;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const interval = setInterval(() => {
    const job = jobs[jobId];

    if (!job) return;

    res.write(`data: ${JSON.stringify(job)}\n\n`);

    if (job.done) {
      clearInterval(interval);
      res.end();
    }
  }, 500);
};

export { uploadMovimientos, uploadProgress };
