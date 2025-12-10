
import { DAOcarrito } from '../persistence/factory.js'
import { productsRepo } from '../persistence/factory.js'
import { DAOusers } from '../persistence/factory.js'

const getDataById = async (data) => {
    return await DAOcarrito.getById(data)
}

const saveNewCart = async () => {
    const newCart = {
        timestamp: Date.now().toLocaleString(),
        productos: []
    }
    return await DAOcarrito.save(newCart)
}

const addNewProductToCart = async (id_prod, id_cart) => {
    const product = await productsRepo.getById(id_prod)
    return await DAOcarrito.addProductById(id_cart, product)
}

const deleteProductFromCart = async (id_prod, id_cart) => {
    const product = await productsRepo.getById(id_prod)
    return await DAOcarrito.deleteProductById(id_cart, product)
}

const deleteCart = async (id_cart) => {
    return DAOcarrito.deleteById(id_cart)
}

const renderedCart = async (userName) => {
    const userData = await DAOusers.getByUser(userName)
    const cart = userData.cartId == ''
        ? { productos: [] }
        : await DAOcarrito.getById(userData.cartId)
    return { cart: cart, userData: userData }
}

const purchaseOrder = async (userName) => {
    const userData = await DAOusers.getByUser(userName)
    const cart = await DAOcarrito.getById(userData.cartId)
    return { cart: cart, userData: userData }
}

export {
    getDataById,
    saveNewCart,
    addNewProductToCart,
    deleteProductFromCart,
    deleteCart,
    renderedCart,
    purchaseOrder
}