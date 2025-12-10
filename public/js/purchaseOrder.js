
const confirmPurchaseBtn = document.getElementById('confirmPurchaseBtn')
const cancelPurchaseBtn = document.getElementsByClassName('cancelPurchaseBtn')

let userCartId
let userId

// Cancelar orden y volver a home
cancelPurchaseBtn[0].addEventListener('click', () => {
    document.location.href = '/api/productos'
})

const orderMessage = 'Orden de compra generada con exito,\
    Hemos enviado un mensaje a su casilla y teléfono de registro"\
    ¡Muchas gracias!  Será redirigido a home luego de unos segundos...'

// Confirmar orden de compra
confirmPurchaseBtn.addEventListener('click', async () => {
    await fetch('/api/userdata/purchaseorder')
    Toastify({
        text: orderMessage,
        offset: {
            x: 150,
            y: 150
        },
        duration: 7000,
        destination: "/api/productos",
        newWindow: false,
        close: false,
        gravity: "top", // `top` or `bottom`
        position: "left", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: "linear-gradient(to right, #00b09b, #96c93d)",
        },
        callback: async function(){
            await deleteCart()
            document.location.href = '/api/productos'
        } // Callback after click
      }).showToast()
})

const deleteCart = async () => {
    // Traer ID user y ID carrito asociado al user
    await fetch('/api/userdata/getuser')
    .then(res => res.json())
    .then(json => {
        userId = json[0]._id
        userCartId = json[0].cartId
    })
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
}