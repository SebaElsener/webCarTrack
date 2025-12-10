
import React, { useContext } from 'react'
import { CartContext } from '../../context/CartContext'
import CartDetail from './CartDetail'
import { Link } from 'react-router-dom'
import './CartDetailContainer.css'

const CartDetailContainer = () => {

    const { cart, precioTotal, borrarCarrito } = useContext(CartContext)

    if (cart.length === 0) {
        return (
            <div className='carritoVacio'>
                <p className='pCarritoVacio'>Carrito vacío.</p>
                <Link className='linkCarritoVacio' to='/'>Seguir comprando</Link>
            </div>
        )
    }

    
    return (
        <>
            {cart.map(prod => <CartDetail producto={prod} key={prod.id} />)}
            <div className='totalCompra'>
                <p>Total de su compra: ${precioTotal}</p>
                <button className='vaciarCarrito' onClick={() => borrarCarrito()}>Vaciar carrito</button>
                <Link to='/Checkout'><button className='terminarCompra'>Terminar compra</button></Link>
            </div>
        </>
    )
}

export default CartDetailContainer