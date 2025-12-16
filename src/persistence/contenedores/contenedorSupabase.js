
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

    async getOnlyAreas (){
        try {
            const { data, error } = await this.sql.from("scans").select("area")
            return data
        } catch (error) {
            infoLogger.info("Error al consultar areas", error)
        }
    }

    async getOnlyDamages (){
        try {
            const { data, error } = await this.sql.from("scans").select("averia")
            return data
        } catch (error) {
            infoLogger.info("Error al consultar averias", error)
        }
    }

    async getOnlyMissings (){
        try {
            const { data, error } = await this.sql.from("scans").select("area").eq('averia', 'M')
            return data
        } catch (error) {
            infoLogger.info("Error al consultar base de datos", error)
        }
    }

    async getDataByDate (startDate, endDate) {
        try {
            const { data, error } = await this.sql.from("scans")
                .select("*")
                .gte('date', startDate)
                .lte('date', endDate)
                .order('date', { ascending: true })
            return data
        } catch (error) {
            infoLogger.info("Error al consultar base de datos por fecha", error)
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