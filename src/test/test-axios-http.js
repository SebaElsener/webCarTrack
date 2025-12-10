
import axios from 'axios'
import { infoLogger } from '../logger.js'

const testProduct = {
    product: 'Lapiz color',
    price: 12.20,
    stock: 47,
    description: 'Lápiz para pintar',
    code: '123F',
    thumbnail: 'https://cdn3.iconfinder.com/data/icons/education-209/64/pencil-pen-stationery-school-64.png'
}

//  Traer todos los productos
const getAllProducts = async () => {
    infoLogger.info('TEST GET TODOS LOS PRODUCTOS')
    await axios('http://localhost:8080/api/productos/arrayproductos')
        .then(products => infoLogger.info(products.data))
        .catch(error => console.log(`ERROR AL LISTAR TODOS LOS PRODUCTOS, ${error}`))
}

//  Agregar un producto
const addProduct = async () => {
    infoLogger.info('TEST AGREGAR PRODUCTO')
    await axios.post('http://localhost:8080/api/productos', testProduct)
        .then(product => {
            testProduct.id = product.data._id
            infoLogger.info(`PRODUCTO ${product.data.product} INGRESADO OK`)
        })
        .catch(error => infoLogger.info(`ERROR AL INGRESAR PRODUCTO, ${error}`))
}

//  Actualizar producto
const updateProduct = async () => {
    const infoToUpdate = {
        product: 'Lápiz color rojo',
        stock: 1500
    }
    infoLogger.info('TEST ACTUALIZAR PRODUCTO')
    await axios.put(`http://localhost:8080/api/productos/${testProduct.id}`, infoToUpdate)
        .then(product => {
            infoLogger.info('PRODUCTO ACTUALIZADO CON EXITO')
        })
        .catch(error => infoLogger.info(`ERROR AL ACTUALIZAR PRODUCTO, ${error}`))
}

//  Eliminar un producto
const deleteProduct = async () => {
    infoLogger.info('TEST ELIMINAR PRODUCTO')
    await axios.delete(`http://localhost:8080/api/productos/${testProduct.id}`)
        .then(product => {
            infoLogger.info('PRODUCTO ELIMINADO CON EXITO')
        })
        .catch(error => infoLogger.info(`ERROR AL ELIMINAR PRODUCTO, ${error}`))
}

await getAllProducts()
await addProduct()
await updateProduct()
await deleteProduct()