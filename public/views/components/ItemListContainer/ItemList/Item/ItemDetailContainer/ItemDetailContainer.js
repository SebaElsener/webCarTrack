
import React from 'react'
import { useState, useEffect } from 'react'
import ItemDetail from './ItemDetail/ItemDetail'
import { useParams } from 'react-router-dom'
import { getFirestore, getDoc, doc } from 'firebase/firestore'

const ItemDetailContainer = () => {

    const [detalleProducto, setDetalleProducto] = useState([])
    const { id } = useParams()  // trayendo id de referencia desde Item.js con el hook

    useEffect(() =>{
        const db = getFirestore()
        const docPorId = doc(db, 'productos', id)
        getDoc(docPorId).then((snapshot) => {
            setDetalleProducto(snapshot.data())
        })
    },[id])

    return (
        <>
            <ItemDetail producto={detalleProducto} id={id} />
        </>
    )
}

export default ItemDetailContainer