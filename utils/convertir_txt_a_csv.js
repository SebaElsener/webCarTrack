import fs from "fs";

const inputFile = "raw_scans.txt";
const outputFile = "scans_import.csv";

function convertDate(dateStr) {
  if (!dateStr) return null;

  const parts = dateStr.trim().split("/");

  if (parts.length !== 3) return null;

  let [day, month, year] = parts;

  if (!day || !month || !year) return null;

  const fullYear =
    Number(year) < 50 ? "20" + year.padStart(2, "0") : "19" + year;

  const d = day.padStart(2, "0");
  const m = month.padStart(2, "0");

  return `${fullYear}-${m}-${d}T00:00:00.000Z`;
}

const raw = fs.readFileSync(inputFile, "utf8");

const lines = raw.split(/\r?\n/);

let output = [];
output.push(
  "vin,date,destino,movimiento,user,clima,lugar,type,localSQL_id"
);

let errores = 0;

for (let line of lines) {
  if (!line.trim()) continue;

  const parts = line.split("\t");

  if (parts.length !== 9) {
    console.log("⚠️ Línea inválida:", line);
    errores++;
    continue;
  }

  const [
    vin,
    date,
    cliente,
    tipo,
    email,
    usuario,
    sucursal,
    origen,
    score
  ] = parts.map(p => p.trim());

  const isoDate = convertDate(date);

  if (!isoDate) {
    console.log("⚠️ Fecha inválida:", date);
    errores++;
    continue;
  }

  output.push(
    `${vin},${isoDate},${cliente},${tipo},${email},${usuario},${sucursal},${origen},${score}`
  );
}

fs.writeFileSync(outputFile, output.join("\n"));

console.log("✅ CSV generado:", outputFile);
console.log("⚠️ Errores detectados:", errores);
