
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import './ItemListContainer.css'
import ItemList from './ItemList/ItemList'
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'
import LoadingGif from '../LoadingGif/LoadingGif'

function ItemListContainer({ greeting }) {

    const [products, setProducts] = useState([])
    const { categoryId } = useParams()

    // hook con condicional, si id de categoría es undefined entonces muestra las ofertas random, sino renderiza por id de categoría
    useEffect(() => {
        if (categoryId === undefined) {
            const db = getFirestore()
            const queryCollection = collection(db, 'productos')
            getDocs(queryCollection).then((snapshot) => {
                // Mapeando todos los productos al array
                const arrayProducts = snapshot.docs.map(doc => 
                        ({id: doc.id, ...doc.data()}))
                // Desordenando el array con sort-math.random
                const productosRandom = arrayProducts.sort(() => Math.random() - 0.5)
                // Quiero mostrar 6 productos en la página, almaceno los primeros 6 del array con destructuring
                const [a, b, c, d, e, f] = productosRandom
                // Asignando las var desestructuradas a un array para pasarlas al state
                const productosRandomTrimmed = [a, b, c, d, e, f]
                setProducts(productosRandomTrimmed)
            })
        } else {
            const db = getFirestore()
            const queryCollection = query(collection(db, 'productos'), where('category', '==', categoryId))
            getDocs(queryCollection).then((snapshot) => {
            const arrayProducts = snapshot.docs.map(doc => 
                ({id: doc.id, ...doc.data()}))
                setProducts(arrayProducts) 
            })
        }
    }, [categoryId])

    return (
        <div className='itemListContainer'>
            <h2 className='saludo'>{greeting}</h2>
            {products.length === 0 ? <LoadingGif /> : <ItemList productos={products} />}
        </div>
    )
}

export default ItemListContainer