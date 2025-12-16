
import {
    querysRenderBusiness
} from '../business/querysBusiness.js'

const queryByDateRender = async (req, res) => {
    res.render('../views/queryByDate')
}

const queryByDatePost = async (req, res) => {
    const { desde, hasta } = req.body
    try {
        const data = await querysRenderBusiness(desde, hasta)
        res.json(data)
    } catch (error) {
        res.status(500).json({ error: 'Error al consultar base de datos' })
    }
}

export {
    queryByDateRender,
    queryByDatePost
}