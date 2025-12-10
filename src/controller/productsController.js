
import {
    mainPage,
    getAllProducts,
    productById,
    addProduct,
    updateById,
    deleteById
} from '../business/ProductsBusiness.js'

const mainPageRender = async (req, res) => {
    const userName = req.session.passport.user
    const data = await mainPage(userName)
    req.session.admin = data.userData.admin
    res.render('index', {
        userName: userName,
        userData: data.userData,
        allProducts: data.productsList || ['Error'],
        productsQty: data.productsList.length
    })
}

const productsForm = async (req, res) => {
    res.render('./partials/form')
}

const getProductById = async (req, res) =>{
    const productId = req.params.id
    if (productId === 'arrayproductos') {
        res.json(await getAllProducts(productId))
    } else {
    const searchedProduct = await productById(productId)
        res.json(searchedProduct)
    }
}

const postProduct = async (req, res) =>{
    const product = req.body
    const addedProduct = await addProduct(product)
    res.json(addedProduct)
    }

const updateProductById = async (req, res) =>{
    const updateInfo = req.body
    const productId = req.params.id
    const updatedProduct = await updateById(productId, updateInfo)
    res.json(updatedProduct)
}

const deleteProductById = async (req, res) =>{
    const productId = req.params.id
    const deletedProduct = deleteById(productId)
    res.json(deletedProduct)
}

export {
    mainPageRender,
    productsForm,
    getProductById,
    postProduct,
    updateProductById,
    deleteProductById
}