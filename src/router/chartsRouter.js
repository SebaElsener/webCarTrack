
import { Router } from 'express'

import {
    renderCharts
} from '../controller/chartsController.js'

const chartsRoute = new Router()

chartsRoute.post('/', renderCharts)

export default chartsRoute