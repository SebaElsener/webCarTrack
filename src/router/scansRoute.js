
import { Router } from 'express'

import {
    renderScans
} from '../controller/scansController.js'

const scansRoute = new Router()

scansRoute.get('/', renderScans)

export default scansRoute