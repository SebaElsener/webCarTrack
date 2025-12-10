
import {
    danosHistoryRenderBusiness,
    partsHistoryRenderBusiness,
    missingsHistoryRenderBusiness
} from '../business/statsBusiness.js'

const danosHistoryRender = async (req, res) => {
    const danosHistory = await danosHistoryRenderBusiness()
    let danosTotal = 0
    danosHistory.forEach(dano => {
        danosTotal = dano[1] + danosTotal
    }
    )
    res.render('../views/danosHistory', {danosHistory, danosTotal})
}

const partsHistoryRender = async (req, res) => {
    const partesHistory = await partsHistoryRenderBusiness()
    let partesTotal = 0
    partesHistory.forEach(parte => {
        partesTotal = parte[1] + partesTotal
    }
    )
    res.render('../views/partsHistory', {partesHistory, partesTotal})
}

const missingsHistoryRender = async (req, res) => {
    const missingsHistory = await missingsHistoryRenderBusiness()
    let missingsTotal = 0
    missingsHistory.forEach(parte => {
        missingsTotal = parte[1] + missingsTotal
    }
    )
    res.render('../views/missingsHistory', {missingsHistory, missingsTotal})
}

export {
    danosHistoryRender,
    missingsHistoryRender,
    partsHistoryRender
}