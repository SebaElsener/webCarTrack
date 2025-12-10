
import { filter } from "compression"
import { infoLogger } from "../logger.js"
import { supabaseRepo } from "../persistence/factory.js"

const danosHistoryRenderBusiness = async () => {
    try {
        const allData = await supabaseRepo.getAll()
        const contador = {}
        allData.forEach(elemento => {
            contador[elemento.averia] = (contador[elemento.averia] || 0) + 1
        })
        const contadorToArray = Object.entries(contador)
        contadorToArray.sort((a, b) => b[1] - a[1])
        return contadorToArray
    } catch (error) {
        infoLogger.info("Error al consultar base de datos", error)
        return "Error al consultar base de datos"
    }
}

const partsHistoryRenderBusiness = async () => {
    try {
        const allData = await supabaseRepo.getAll()
        const contador = {}
        allData.forEach(elemento => {
            contador[elemento.area] = (contador[elemento.area] || 0) + 1
        })
        const contadorToArray = Object.entries(contador)
        contadorToArray.sort((a, b) => b[1] - a[1])
        return contadorToArray
    } catch (error) {
        infoLogger.info("Error al consultar base de datos", error)
        return "Error al consultar base de datos"
    }
}

const missingsHistoryRenderBusiness = async () => {
    try {
        const allData = await supabaseRepo.getAll()
        const filtered = allData.filter(elemento => elemento.averia === 'M')
        const contador = {}
        filtered.forEach(elemento => {
            contador[elemento.area] = (contador[elemento.area] || 0) + 1
        })
        const contadorToArray = Object.entries(contador)
        contadorToArray.sort((a, b) => b[1] - a[1])
        return contadorToArray
    } catch (error) {
        infoLogger.info("Error al consultar base de datos", error)
        return "Error al consultar base de datos"
    }
}

export {
    danosHistoryRenderBusiness,
    partsHistoryRenderBusiness,
    missingsHistoryRenderBusiness
}