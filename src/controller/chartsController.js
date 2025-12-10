
import fsp from 'node:fs/promises';
import {
    getSampleChartInfo
} from '../business/chartsBusiness.js'

const renderCharts = async (req, res) => {
    await getSampleChartInfo(req.body[0], req.body[1])
    const chart = await fsp.readFile('./public/charts/output.png')
    const dataUrl = "data:image/jpeg;base64," + chart.toString("base64")
    res.send(dataUrl)
}

export {
    renderCharts
}