
import { Router } from 'express'

const homeRoute = new Router()

homeRoute.get('/', (req, res) => {
    res.redirect('/api/productos')
})

export default homeRoute