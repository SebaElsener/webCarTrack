
import passport from 'passport'
import { Strategy } from 'passport-local'
import { DAOusers } from '../persistence/factory.js'
import { errorLogger } from '../logger.js'
import { passwordCheck } from '../../utils/passwordCheck.js'

passport.use('login', new Strategy(
    async (username, password, done) => {
        const user = await DAOusers.getByUser(username)
        if (!user) {
            errorLogger.error('Usuario no existe')
            return done(null, false)
        }
        const validPassword = await passwordCheck(user.password, password)
        if (!validPassword) {
            errorLogger.error('Clave incorrecta')
            return done(null, false)
        }
        return done(null, user.user)
    })
)

const loginController = () => {
    return passport.authenticate('login', {
        successRedirect: '/api/home',
        failureRedirect: '/api/login/faillogin'
    })
}

export default loginController