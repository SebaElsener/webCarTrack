
import { Router } from 'express'

const userLogout = new Router()

userLogout.get('/', (req, res) => {
    req.session.destroy(error => {
        !error
            ? res.render('logout')
            : res.redirect('/api/home')
    })
})

export default userLogout