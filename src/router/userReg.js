
import { Router } from 'express'
import regController from '../controller/userRegController.js'

const userReg = new Router()

userReg.get('/', (req, res) => {
    res.render('register')
})

userReg.post('/', regController())

userReg.get('/failreg', (req, res) => {
    res.render('failreg')
})

userReg.get('/successreg', (req, res) => {
    res.render('successreg')
})

export default userReg