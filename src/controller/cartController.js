
import {
    getDataById,
    saveNewCart,
    addNewProductToCart,
    deleteProductFromCart,
    deleteCart,
    renderedCart,
    purchaseOrder
} from '../business/cartBusiness.js'

const getCartById = async (req, res) => {
    const cart = await getDataById(req.params.id)
    res.json(cart)
}

const saveCart = async (req, res) => {
    const newCart = await saveNewCart()
    res.json(newCart)
}

const addProductByIdAndCartId = async (req, res) => {
    const addedProduct = await addNewProductToCart(req.params.id_prod, req.params.id_cart)
    res.json(addedProduct)
}

const deleteProductByIdAndCartId = async (req, res) => {
    const deletedProduct = await deleteProductFromCart(req.params.id_prod, req.params.id_cart)
    res.json(deletedProduct)
}

const deleteCartById = async (req, res) => {
    const deletedCart = await deleteCart(req.params.id)
    res.json(deletedCart)
}

const renderCart = async (req, res) => {
    const userName = req.session.passport.user
    const cartData = await renderedCart(userName)
    res.render('./partials/cart',
        {
            cart: cartData.cart,
            productsQty: cartData.cart.productos.length,
            userData: cartData.userData
        }
    )
}

const generatePurchaseOrder = async (req, res) => {
    const userName = req.session.passport.user
    const purchaseOrderData = await purchaseOrder(userName)
    res.render('./partials/purchaseOrder',
        {
            cart: purchaseOrderData.cart,
            userData: purchaseOrderData.userData
        }
    )
}

export {
    getCartById,
    saveCart,
    addProductByIdAndCartId,
    deleteProductByIdAndCartId,
    deleteCartById,
    renderCart,
    generatePurchaseOrder
}