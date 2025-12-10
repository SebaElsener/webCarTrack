
import React, { useState } from 'react'

const CartContext = React.createContext()

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([])

  const addItem = (producto, cantidad) => {
    const productosAgregados = cart.filter(prod => prod.id !== producto.id)
    productosAgregados.push({ ...producto, cantidadComprada: cantidad })
    setCart(productosAgregados)
  }

  const borrarCarrito = () => setCart([])

  const borrarProducto = (id) => setCart(cart.filter(prod => prod.id !== id))

  const precioTotal = cart.reduce((prev, act) => prev + act.cantidadComprada * act.price, 0)

  const cantidadTotal = cart.reduce((acum, prodActual) => acum + prodActual.cantidadComprada, 0)

  return (
    <CartContext.Provider value={{
      addItem,
      borrarCarrito,
      borrarProducto,
      precioTotal,
      cantidadTotal,
      cart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export { CartContext, CartProvider }