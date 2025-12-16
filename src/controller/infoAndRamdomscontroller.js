
import { faker } from "@faker-js/faker"; // para datos falsos
import { supabaseRepo } from "../persistence/factory.js";
import areas from '../../utils/areas.json' with { type: 'json' };
import averias from '../../utils/averias.json' with { type: 'json' };
import codigos from '../../utils/codigos.json' with { type: 'json' };
import gravedades from '../../utils/gravedades.json' with { type: 'json' };

const AREAS = areas.map(p => (p.id))
const AVERIAS = averias.map(p => (p.id))
const GRAVEDADES = gravedades.map(p => (p.id))
const CODIGOS = codigos.map(p => (p.id))

const generarRegistros = async (req, res) => {
  const batchSize = 500; // Supabase soporta inserts en lotes
  let registros = [];
  const cantidad = 2000

  for (let i = 0; i < cantidad; i++) {
    registros.push({
      type: faker.vehicle.model(),
      code: faker.vehicle.vin(),
      area: faker.helpers.arrayElement(AREAS),
      averia: faker.helpers.arrayElement(AVERIAS),
      grav: faker.helpers.arrayElement(GRAVEDADES),
      obs: faker.lorem.sentence(),
      codigo: faker.helpers.arrayElement(CODIGOS),
      date: faker.date.anytime()
    });

    // INSERTAR CADA 500
    if (registros.length === batchSize || i === cantidad - 1) {
      console.log(`Insertando ${registros.length} registros...`);
      const populationResult = await supabaseRepo.populateDb(registros)

      if (populationResult === 'error') {
        console.error("Error al popular DB");
        process.exit(1);
      }

      registros = []; // limpiar lote
    }
  }

  console.log("✔ Finalizado: 2000 registros insertados.");
}

export default generarRegistros