
import { infoLogger } from '../logger.js'

export const logs = (req, res, next) => {
    infoLogger.info(`ruta '${req.path}' metodo '${req.method}'`)
    next()
}