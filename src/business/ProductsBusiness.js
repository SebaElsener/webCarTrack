
import { productsRepo } from '../persistence/factory.js'
import { DAOusers } from '../persistence/factory.js'

const mainPage = async (userName) => {
    const productsList = await productsRepo.getAll()
    const userData = await DAOusers.getByUser(userName)
    return {
        productsList: productsList,
        userData: userData
    }
}

const getAllProducts = async () => {
    return await productsRepo.getAll()
}

const productById = async (reqParam) => {
    return await productsRepo.getById(reqParam)
}

const addProduct = async (product) => {
    return await productsRepo.save(product)
}

const updateById = async (productId, updateInfo) => {
    await productsRepo.updateById(productId, updateInfo)
    return await productsRepo.getById(productId)
}

const deleteById = async (productId) => {
    const productToDelete = await productsRepo.getById(productId)
    if (productToDelete !== null) { return await productsRepo.deleteById(productId) }
}

export {
    mainPage,
    getAllProducts,
    productById,
    addProduct,
    updateById,
    deleteById
}