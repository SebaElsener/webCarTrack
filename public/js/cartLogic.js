
const products = document.getElementsByClassName('products')
const deleteProductBtn = document.getElementsByClassName('deleteProductBtn')
const deleteCartBtn = document.getElementsByClassName('deleteCartBtn')
const endPurchaseBtn = document.getElementById('endPurchaseBtn')
const emptyCart = document.getElementsByClassName('emptyCart')
const backLink = document.getElementsByClassName('backLink')

let userCartId
let userId
let userName
let userEmail

if (emptyCart[0]) {
    endPurchaseBtn.style.display = 'none'
    deleteCartBtn[0].style.display = 'none'
    backLink[0].style.display = 'none'
}

const userData = async () => {
    // Traer ID user y ID carrito asociado al user
    await fetch('/api/userdata/getuser')
        .then(res => res.json())
        .then(json => {
            userId = json[0]._id
            userCartId = json[0].cartId
            userEmail = json[0].user
            userName = json[0].name
        })
}

// Evento vaciar carrito
deleteCartBtn[0].addEventListener('click', async () => {
    await userData()
    // Delete ID carrito en documento user
    const data = { userId: userId, cartId: '' }
    await fetch('/api/userdata/',
        {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(json => console.log(json))
    // Delete carrito
    await fetch(`/api/carrito/${userCartId}`, { method: 'DELETE'})
        .then(res => res.json())
        .then(async json => {
            console.log(json)
        })
    document.location.reload()
})

// Evento borrar producto según su id
for (let i=0;i < deleteProductBtn.length;i++) {
    deleteProductBtn[i].addEventListener('click', async () => {
        await fetch('/api/userdata/getuser')
        .then(res => res.json())
        .then(json => {
            userCartId = json[0].cartId
        })
        fetch(`/api/carrito/${userCartId}/productos/${deleteProductBtn[i].id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(cart => {
            const cartProds = cart.productos.map(product => {
                    return `<div class='productDiv'>
                                <div class='productContainer'>
                                    <p class='productContainerP'><span class='productContainerSpan'>Producto: </span>${product.product}</p>
                                    <p class='productContainerP'><span class='productContainerSpan'>Precio: </span>$${product.price}</p>
                                    <p class='productContainerP'><span class='productContainerSpan'>Descripción: </span>${product.description}</p>
                                    <p class='productContainerP'><span class='productContainerSpan'>Stock: </span>${product.stock}</p>
                                </div>
                                <div class='thumbnailContainer'>
                                    <img class='thumbnail thumbnailImg' src='${product.thumbnail}' alt='imagen producto' width='60px'>
                                </div>
                                <div class='deleteProductBtnContainer'>
                                    <button class='deleteProductBtn' id='${product.id}'>Eliminar</button>
                                </div>
                            </div>
                            `
            })
            products[0].innerHTML = cartProds.join('') || `<p class='emptyCart'>Carrito vacío</p>`
            document.location.reload()
        })
    })
}

// Evento generar orden de compra
endPurchaseBtn.addEventListener('click', async () => {
    document.location.href = '/api/carrito/purchase'
})