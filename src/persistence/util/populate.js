
import { faker } from "@faker-js/faker"; // para datos falsos
import { supabaseRepo } from "../factory.js";

const AREAS = ["34", "37", "44", "12", "18"];
const AVERIAS = ["A", "G", "S", "R", "M"];
const GRAVEDADES = ["1", "2", "5"];
const CODIGOS = ["SSTD", "NTD", "NAGR"];

async function generarRegistros(cantidad = 2000) {
  const batchSize = 500; // Supabase soporta inserts en lotes
  let registros = [];

  for (let i = 0; i < cantidad; i++) {
    registros.push({
      type: faker.vehicle.model(),
      code: faker.vehicle.vin(),
      area: faker.helpers.arrayElement(AREAS),
      averia: faker.helpers.arrayElement(AVERIAS),
      grav: faker.helpers.arrayElement(GRAVEDADES),
      obs: faker.lorem.sentence(),
      codigo: faker.helpers.arrayElement(CODIGOS)
    });

    // INSERTAR CADA 500
    if (registros.length === batchSize || i === cantidad - 1) {
      console.log(`Insertando ${registros.length} registros...`);
      const populationResult = await supabaseRepo.populateDb(registros)

      if (populationResult === error) {
        console.error("Error al popular DB");
        process.exit(1);
      }

      registros = []; // limpiar lote
    }
  }

  console.log("✔ Finalizado: 2000 registros insertados.");
}

generarRegistros();