
import { infoLogger } from "../logger.js"
import { supabaseRepo } from "../persistence/factory.js"

const querysRenderBusiness = async (desde, hasta) => {
    try {
        const data = await supabaseRepo.getDataByDate(desde, hasta)
        return data
    } catch (error) {
        infoLogger.error("Error en querysRenderBusiness", error)
        return []
    }
}

export {
    querysRenderBusiness,
}