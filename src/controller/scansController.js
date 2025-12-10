
import {
    getAllScans
} from '../business/scansBusiness.js'

const renderScans = async (req, res) => {
    const scansData = await getAllScans()
    res.render('scansData', {
        scansData: scansData
    })
}

export {
    renderScans
}