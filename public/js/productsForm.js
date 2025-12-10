
const productsForm = document.getElementById('productsForm')

// Evento nuevo ingreso de producto al servidor
productsForm.addEventListener('submit', (e) => {
    e.preventDefault()
    newProduct = {
        product: productsForm[0].value,
        price: productsForm[1].value,
        stock: productsForm[2].value,
        description: productsForm[3].value,
        code: productsForm[4].value,
        thumbnail: productsForm[5].value
    }
    fetch('/api/productos/',
        {
            method: 'POST',
            body: JSON.stringify(newProduct),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(json => {
            Toastify({
                text: `PRODUCTO ${json.product} AGREGADO CON EXITO`,
                offset: {
                    x: 150,
                    y: 150
                },
                duration: 5000,
                newWindow: false,
                close: false,
                gravity: "top", // `top` or `bottom`
                position: "left", // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                  background: "linear-gradient(to right, #00b09b, #96c93d)",
                }
              }).showToast()
            
            // Reset del form luego del ingreso
            productsForm.reset() 
        })
})