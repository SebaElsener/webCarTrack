import React, { useState, useContext, useEffect } from 'react'
import Brief from './Brief'
import { getFirestore, addDoc, collection, doc, getDoc } from 'firebase/firestore'
import { CartContext } from '../../context/CartContext'
import { Link } from 'react-router-dom'
import './CheckoutContainer.css'

const defaultForm = { name: '', email: '' }

const CheckoutContainer = () => {

    const [orderId, setOrderId] = useState([])
    const [form, setForm] = useState(defaultForm)
    const [order, setOrder] = useState([])
    const { cart, precioTotal, borrarCarrito } = useContext(CartContext)

    const changeHandler = (ev) => {
        setForm({ ...form, [ev.target.name]: ev.target.value })
    }
    
    const submitHandler = (ev) => {
        ev.preventDefault()
        const datosCompra = {
            comprador : form,
            items: cart.map(prod => ({id: prod.id, price: prod.price, product: prod.name, quant: prod.cantidadComprada})),
            totalPrice: precioTotal
        }
        const db = getFirestore()
        const contactFormCollection = collection(db, 'contactform')
        addDoc(contactFormCollection, datosCompra).then((snapshot) => {
            setOrderId(snapshot.id)
        })
    }

    useEffect(() => {
        if (orderId.length !== 0) {
        const db = getFirestore()
        const docRef = doc(db, 'contactform', orderId)
        getDoc(docRef).then((snapshot) => setOrder(snapshot.data()))
    }   
    }, [orderId])

    const volverInicio = () => {
        borrarCarrito()
    }

    return (
        <>
            {orderId.length !== 0 ? (
                <div className='checkoutContainer'>
                    <Brief order={order} orderId={orderId} />
                    <Link to='/'><button className='btnCheckoutContainer' onClick={() => volverInicio()}>Volver a inicio</button></Link>
                </div>
            ) : (
                <form className='orderForm' onSubmit={submitHandler}>
                    <p>Por favor registre sus datos para completar la compra</p>
                    <div>
                        <label htmlFor="name">Nombre</label>
                        <input
                        name="name"
                        id="name"
                        placeholder='Ingrese su nombre'
                        value={form.name}
                        onChange={changeHandler}
                        />
                    </div>
                    <div>
                        <label htmlFor="email">Email</label>
                        <input
                        type="email"
                        name="email"
                        id="email"
                        placeholder='Ingrese su email'
                        value={form.email}
                        onChange={changeHandler}
                        />
                    </div>
                    <button className='btnSend'>Enviar</button>
                </form>
            )}
        </>
    )
}

export default CheckoutContainer