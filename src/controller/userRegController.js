
import passport from 'passport'
import { Strategy } from 'passport-local'
import { DAOusers } from '../persistence/factory.js'
import { infoLogger, errorLogger } from '../logger.js'
import sendMail from '../nodemailer/mailSender.js'
import { createHash } from '../../utils/passwordEncrypt.js'

passport.use('register', new Strategy({
    passReqToCallback: true},
    async (req, username, password, done) => {
        const user = await DAOusers.getByUser(username)
        if (user) {
            errorLogger.error('Usuario ya existe')
            return done(null, false)
        }
        const newUser = {
            user: req.body.username,
            password: await createHash(password),
            name: req.body.nameLastname,
            address: req.body.address,
            age: req.body.age,
            phone: req.body.phone,
            avatar: req.body.avatar,
            cartId: '',
            admin: 'false'
        }
        await DAOusers.save(newUser)
        const mailBodyTemplate =
            `
            <h3>Se ha creado un nuevo usuario</h3>
            <ul>
                <li>Mail:  ${newUser.user}</li>
                <li>Nombre y apellido:  ${newUser.name}</li>
                <li>Dirección:  ${newUser.address}</li>
                <li>Edad:  ${newUser.age}</li>
                <li>Teléfono:  ${newUser.phone}</li>
                <li>Avatar:  <img src='${newUser.avatar}' width='80px'></li>
            </ul>
            `
        sendMail(process.env.GMAILUSER, 'Nuevo registro', mailBodyTemplate)
        infoLogger.info(`Nuevo usuario ${newUser.user} creado con exito`)
        return done(null, newUser.user)
    }
))

const regController = () => {
    return passport.authenticate('register', {
        successRedirect: '/api/register/successreg',
        failureRedirect: '/api/register/failreg'
    })
}

export default regController