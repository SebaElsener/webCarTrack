
const updateBtn = document.getElementsByClassName('updateBtn')
const deleteBtn = document.getElementsByClassName('deleteBtn')
const buyBtn = document.getElementsByClassName('buyBtn')
const cartLinkSpan = document.getElementsByClassName('cartLinkSpan')
const userWelcome = document.getElementsByClassName('userWelcome')
const cartLink = document.getElementsByClassName('cartLink')
let cartId

//Evento para mostrar cantidad items carrito en barra navegación
window.addEventListener('load', async () => {
    let userCart
    await fetch('/api/userdata/getuser')
        .then(res => res.json())
        .then(json => {
            userCart = json[0].cartId
            cartLink[0].id = userCart
        })
    if (userCart == '') { cartLinkSpan[0].innerHTML = ': VACIO' }
    else {
    fetch(`/api/carrito/${userCart}/productos`)
        .then(res => res.json())
        .then(cart => {
            cartLinkSpan[0].innerHTML =
                `: ${cart === null || cart.productos.length === 0
                    ? 'VACIO'
                    : cart.productos.length + ' PRODUCTO(S)'}
                `
        })
    }
})

// Evento borrar producto
for (let i=0; i < deleteBtn.length; i++) {
    deleteBtn[i].addEventListener('click', () => {
        productId = updateBtn[i].parentElement.previousElementSibling.childNodes[1].id
        fetch(`/api/productos/${productId}`,
            {
                method: 'DELETE'
            }
        ).then(res => res.json()).then(json => {
            console.log(json)
            document.location.reload()}
        )
    })
}

// Evento modificar producto
for (let i=0; i < updateBtn.length; i++) {
    updateBtn[i].addEventListener('click', () => {
        productId = updateBtn[i].parentElement.previousElementSibling.childNodes[1].id
        productToUpdate = {
            product: updateBtn[i].parentElement.parentElement.childNodes[1].value,
            price: updateBtn[i].parentElement.parentElement.childNodes[3].childNodes[3].value,
            stock: updateBtn[i].parentElement.parentElement.childNodes[9].childNodes[3].value,
            description: updateBtn[i].parentElement.parentElement.childNodes[7].value,
            code: updateBtn[i].parentElement.parentElement.childNodes[13].value,
            thumbnail: updateBtn[i].parentElement.parentElement.childNodes[5].childNodes[1].src
        }
        fetch(`/api/productos/${productId}`,
            {
                method: 'PUT',
                body: JSON.stringify(productToUpdate),
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
        .then(res => res.json())
        .then(json => {
            console.log(json)
            Toastify({
                text: `PRODUCTO ${json.product} ACTUALIZADO`,
                offset: {
                    x: 150,
                    y: 150
                },
                duration: 3000,
                newWindow: false,
                close: false,
                gravity: "top", // `top` or `bottom`
                position: "left", // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
                }
            }).showToast()
        })
    })
}

// Evento comprar producto
for (let i=0;i < buyBtn.length;i++) {
    buyBtn[i].addEventListener('click', async () => {
        // fetch para traer todos los productos en route auxiliar arrayproductos
        await fetch('/api/productos/arrayproductos').then(res => res.json())
        .then(async productos => {
            const selectedProduct = productos.find(product => product.id === buyBtn[i].id)
            // Generando un nuevo carrito en caso de que no exista ninguno para el usuario logueado
            if (!cartLink[0].id) {
                await fetch('/api/carrito', { method: 'POST' })
                    .then(res => res.json())
                    .then(async newCart => {
                        cartLink[0].id = newCart._id
                        cartId = newCart._id
                        const userIdAndCartId = { userId: userWelcome[0].id, cartId: cartId }
                        await fetch('/api/userdata/',
                            {
                                method: 'PUT',
                                body: JSON.stringify(userIdAndCartId),
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            })
                            .then(res => res.json())
                            .then(json => console.log(json))
                    })
            }
            //Fetch para agregar producto comprado al carrito
            cartId = cartLink[0].id
            fetch(`/api/carrito/${cartId}/productos/${buyBtn[i].id}`,
                {
                    method: 'POST',
                    body: JSON.stringify(selectedProduct),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            .then(res => res.json()).then(cart => {
                const prodsQty = cart.productos.length
                cartLinkSpan[0].innerHTML = `: ${prodsQty} PRODUCTO(S)`
            })
        })
    })
}