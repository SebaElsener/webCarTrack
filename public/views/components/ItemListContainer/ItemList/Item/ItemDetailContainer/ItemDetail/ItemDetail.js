
import React, { useContext } from 'react'
import './ItemDetail.css'
import ItemCount from '../../../../../ItemCount/ItemCount'
import { CartContext } from '../../../../../../context/CartContext'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const ItemDetail = ( {producto, id} ) => {

    const {name, picurl, price, stock, description} = producto
    const { addItem } = useContext(CartContext)

    const msjOnAdd = (msj) => {
        toast(msj,{
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        });
    }

    const onAdd = (cantidad) => {
        if (cantidad === 0) {
            return (
                <>
                    {msjOnAdd('Por favor, seleccione una o más unidades de este producto')}
                </>
        )} else {
            <>
                {msjOnAdd('Producto añadido al carrito')}
            </>
            const prodConId = { ...producto, id: id }
            addItem(prodConId, cantidad)
        }
    }
        
    return(
        <div className='cajaItemDetail'>
            <div className='imgContainer'>
                <img className='imgProduct' src={picurl} alt={`imagen ${name}`} />
            </div>
            <div className='detailContainer'>
                <p className='itemName'>{name}</p>
                <p className='itemDescription'>{description}</p>
                <p className='itemPrice'>{`Precio: $${price}`}</p>
                {stock === 0 ? '' : <p className='itemStock'>{`Stock: ${stock} unidades`}</p>}
                <ItemCount stock={stock} onAdd={onAdd} />
                <ToastContainer rtl closeButton={false} />
            </div>
        </div>
    )
}

export default ItemDetail