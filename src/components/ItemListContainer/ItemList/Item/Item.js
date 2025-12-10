
import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import ItemCount from '../../../ItemCount/ItemCount'
import './Item.css'
import { CartContext } from '../../../../context/CartContext'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Item = ({ prods }) =>{

    const {name, id, picurl, price, stock} = prods

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
            const prodConId = { ...prods, id: id }
            addItem(prodConId, cantidad)
        }
    }

    return(
        <div className='ItemContainer'>
            <p className='itemName'>{name}</p>
            <Link className='imgContainer' to={`/Item/${id}`}><img className='imgProduct' src={picurl} alt={`imagen ${name}`} /></Link>
            <p className='itemPrice'>{`Precio: $${price}`}</p>
            {stock === 0 ? '' : <p className='itemStock'>{`Stock: ${stock} unidades`}</p>}
            <ItemCount stock={stock} onAdd={onAdd} />
            <ToastContainer rtl closeButton={false} />
        </div>
    )
}

export default Item
