
import React from 'react'
import './Brief.css'

const Brief = ({ order, orderId }) => {

    return(
        <>
            {order.length === 0 ?
            (
                <div className='loadingOrder'>CARGANDO DATOS DE LA COMPRA...</div>
            ) : (
                <>
                    <p className='pBold pExito'>¡Su compra ha sido registrada con éxito, muchas gracias!</p>
                    <p className='pBold'>RESUMEN</p>
                    <p><span className='pBold'>ID compra: </span>{orderId}</p>
                    <p><span className='pBold'>Nombre y apellido: </span>{order.comprador.name}</p>
                    <p><span className='pBold'>Email: </span>{order.comprador.email}</p>
                    <p className='pBold'>Productos:</p>
                    <ul>
                    {order.items.map(item =>
                        <div key={item.id}>
                            <li>{item.product}</li>
                            <li>Precio unitario: $ {item.price}</li>
                            <li>Cantidad: {item.quant}</li>
                            <li>Subtotal: ${item.quant * item.price}</li>
                            <hr></hr>
                        </div>
                    )}
                    </ul>
                    <p className='pBold total'>Total compra: ${order.totalPrice}</p>
                </>
            )}
        </>
    )
}

export default Brief