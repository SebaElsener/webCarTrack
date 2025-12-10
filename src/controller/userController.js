
import {
    getByUser,
    updateUserById,
    updateUserWithCart,
    purchase,
    getAllUsers,
    makeUsersAdmin,
    deleteUsers,
    passBusiness
} from '../business/userBusiness.js'

const renderUserData = async (req, res) => {
    const userName = req.session.passport.user
    const userData = await getByUser(userName)
    res.render('userData', {
        userData: userData[0]
    })
}

const getUser = async (req, res) => {
    const userName = req.session.passport.user
    res.json(await getByUser(userName))
}

const updateUser = async (req, res) => {
    const userDBid = req.body.userDBid
    const userInfoToUpdate = {
        name: req.body.name,
        address: req.body.address,
        age: req.body.age,
        phone: req.body.phone,
        avatar: req.body.avatar,
    }
    res.json(await updateUserById(userDBid, userInfoToUpdate))
}

const addCartToUser = async (req, res) => {
    const cartId = { cartId: req.body.cartId }
    const userId = req.body.userId
    res.json(updateUserWithCart(userId, cartId))
}

const purchaseOrder = async (req, res) => {
    const userName = req.session.passport.user
    const orderNbr = await purchase(userName)
    res.json(`Orden ${orderNbr} generada con exito`)
}

const usersAdmin = async (req, res) => {
    const allUsers = await getAllUsers()
    res.render('partials/usersAdmin', {
        allUsers: allUsers
    })
}

const usersAdm = async (req, res) => {
    const users = req.body
    res.json(await makeUsersAdmin(users))
}

const usersDelete = async (req, res) => {
    const users = req.body
    res.json(await deleteUsers(users))
}

const passChange = async (req, res) => {
    const passData = req.body
    res.json(await passBusiness(passData))
}

export {
    renderUserData,
    getUser,
    updateUser,
    addCartToUser,
    purchaseOrder,
    usersAdmin,
    usersAdm,
    usersDelete,
    passChange
}