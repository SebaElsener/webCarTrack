
import React from 'react'
import Item from './Item/Item'
import './ItemList.css'

const ItemList = ( {productos} ) => {

    return(
        <div className='itemList'>
            {productos.map(prods => <Item prods={prods} key={prods.id} />)}
        </div>
    )
}

export default ItemList