
import { DAOusers } from '../persistence/factory.js'
import { DAOcarrito } from '../persistence/factory.js'
import sendMail from '../nodemailer/mailSender.js'
import { infoLogger } from '../logger.js'
import twilioSender from '../twilio/twilioMessage.js'
import { usersAdministrationDTO } from '../persistence/DTO/usersDTO.js'
import { passwordCheck } from '../../utils/passwordCheck.js'

const getByUser = async (userName) => {
    const user = [await DAOusers.getByUser(userName)]
    return usersAdministrationDTO(user)
}

const getAllUsers = async () => {
    const getData = await DAOusers.getAll()
    return usersAdministrationDTO(getData)
}

const updateUserById = async (userDBid, userInfoToUpdate) => {
    return await DAOusers.updateById(userDBid, userInfoToUpdate)
}

const updateUserWithCart = async (userId, cartId) => {
    return await DAOusers.updateById(userId, cartId)
}

const purchase = async (userName) => {
    const userData = await DAOusers.getByUser(userName)
    const cart = await DAOcarrito.getById(userData.cartId)
    const mailBodyTemplate = cart.productos.map(product => {
        return `<div>
                    <div>
                        <p><span>Producto: </span>${product.product}</p>
                        <p><span>Precio: </span>$${product.price}</p>
                        <p><span>Descripción: </span>${product.description}</p>
                    </div>
                    <div>
                        <img src='${product.thumbnail}' alt='imagen producto' width='60px'>
                    </div>
                </div>
                `
    })
    const messageSubject = `Nuevo pedido de ${userData.name} - ${userData.user}`
    sendMail(process.env.GMAILUSER, messageSubject, mailBodyTemplate.join(''))
    const smsMessage = `Hola ${userData.name}!  Su orden de compra con ID ${userData.cartId}\
        ha sido generada con exito, nos pondremos en contacto con usted.  Muchas gracias`
    twilioSender(userData.phone, messageSubject, 'whatsapp')
    twilioSender(userData.phone, smsMessage, 'sms')
    infoLogger.info(`Orden de compra con ID ${userData.cartId} generada con exito`)
    return userData.cartId
}

const makeUsersAdmin = async (users) => {
    return await DAOusers.updateUsersAdmin(users)
}

const deleteUsers = async (users) => {
    return await DAOusers.deleteUsers(users)
}

const passBusiness = async (passData) => {
    const userData = await DAOusers.getById(passData.userId)
    const DBUserPass = userData.password
    const validPassword = await passwordCheck(DBUserPass, passData.password)
    if (!validPassword) { return 'LA CONTRASEÑA ACTUAL INGRESADA ES INCORRECTA' }
    await DAOusers.updateById(passData.userId, { password: passData.newPassword })
    return 'CONTRASEÑA MODIFICADA CON EXITO'
}

export {
    getByUser,
    updateUserById,
    updateUserWithCart,
    purchase,
    getAllUsers,
    makeUsersAdmin,
    deleteUsers,
    passBusiness
}