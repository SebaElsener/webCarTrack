
import { Router } from 'express'
import loginController from '../controller/loginController.js'

const userLogin = new Router()

userLogin.get('/', (req, res) => {
    res.render('login')
})

userLogin.post('/', loginController())

userLogin.get('/faillogin', (req, res) => {
    res.render('faillogin')
})

export default userLogin