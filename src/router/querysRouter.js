
import { Router as router} from 'express'
import {
    queryByDateRender,
    queryByDatePost
} from '../controller/querysController.js'

const querysRouter = new router()

querysRouter.get('/queryByDate', queryByDateRender)
querysRouter.post('/queryByDate', queryByDatePost)

export default querysRouter