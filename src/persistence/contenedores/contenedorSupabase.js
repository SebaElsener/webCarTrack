
import dotenv from 'dotenv'
import postgres from 'postgres'
import { infoLogger } from '../../logger.js'

dotenv.config()

import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

class ContenedorSupabase {
    constructor () {
        this.sql = supabase
    }

    async getAll() {
        try {
            const { data, error } = await this.sql.from("scans").select("*")
            return data
        } catch (error) {
            infoLogger.info("Error al consultar tablas", error)
        }
    }

    async getPictures() {
        try {
            const { data, error } = await this.sql.from("pictures")
                .select("*")
            return data
        } catch (error) {
            infoLogger.info("Error al consultar fotos", error)
        }
    }

    //////////// Func para popular DB supabse

    async populateDb(info) {
        console.log(info)
        const [modelo, vin, area, averia, gravedad, observacion, codigo] = info
        try {
            const { data, error } = await this.sql.from("scans")
                .insert(info)
            console.log(data)
            return data
        } catch (error) {
            return 'error'
        }
    }

}

export default ContenedorSupabase