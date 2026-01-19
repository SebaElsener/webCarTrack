
import React, { useContext } from 'react'
import { CartContext } from '../../context/CartContext'
import './CartDetail.css'

const CartDetail = ({ producto }) => {

    const {name, picurl, cantidadComprada, description, id, price} = producto
    const { borrarProducto } = useContext(CartContext)

    return (
        <>
            <div className='cajaCartDetail'>
                <div className='imgCartContainer'>
                    <p className='itemName'>{name}</p>
                    <img className='imgProductCart' src={picurl} alt={`imagen ${name}`} />
                    <p className='itemPrice'>{`Precio: $${price}`}</p>
                </div>
                <div className='detailCartContainer'>
                    <p className='itemDescription'>{description}</p>
                    <p className='itemQuant'>{`Cantidad: ${cantidadComprada}`}</p>
                    <p className='subTotal'>{`Subtotal: $${price * cantidadComprada}`}</p>
                    <button className='btnEliminar' onClick={() => borrarProducto(id)}>Eliminar</button>
                </div>
            </div>
        </>
    )
}

export default CartDetail