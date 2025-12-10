
import { Router as router} from 'express'
import {
    danosHistoryRender,
    partsHistoryRender,
    missingsHistoryRender
} from '../controller/statsController.js'

const statsRouter = new router()

statsRouter.get('/danosHistory', danosHistoryRender)

statsRouter.get('/partsHistory', partsHistoryRender)

statsRouter.get('/missingsHistory', missingsHistoryRender)

export default statsRouter