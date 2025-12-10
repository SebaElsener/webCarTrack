
import { Router as router} from 'express'
import {
    getCartById,
    saveCart,
    addProductByIdAndCartId,
    deleteProductByIdAndCartId,
    deleteCartById,
    renderCart,
    generatePurchaseOrder
} from '../controller/cartController.js'

const routeCart = new router()

// devuelve todos los productos del carrito según id
routeCart.get('/:id/productos', getCartById)

// guarda un nuevo carrito con id y timestamp
routeCart.post('/', saveCart)

// guarda un nuevo producto según id de carrito e id de producto especificado
routeCart.post('/:id_cart/productos/:id_prod', addProductByIdAndCartId)

// elimina un producto según id de carrito e id de producto
routeCart.delete('/:id_cart/productos/:id_prod', deleteProductByIdAndCartId)

// borrar carrito completo según id
routeCart.delete('/:id', deleteCartById)

// Renderizar carrito
routeCart.get('/', renderCart)

// Generar orden de compra
routeCart.get('/purchase', generatePurchaseOrder)

export default routeCart