
import { createRequire } from 'node:module'
import { infoLogger, errorLogger } from '../../logger.js'
import dotenv from 'dotenv'

dotenv.config()

const require = createRequire(import.meta.url)
//const serviceAccount = require('../config/coder-test-67523-firebase-adminsdk-w5t74-8bca7fec93.json')
const admin = require("firebase-admin")

try {
    admin.initializeApp({
    credential: admin.credential.cert(process.env.serviceAccount)})
    infoLogger.info('FIREBASE:  Base de datos conectada')
} catch (error) {
    infoLogger.info('ERROR DE CONEXION A FIREBASE', error)
}

const db = admin.firestore()

class ContenedorFirebase {
    
    constructor (collection) {
        this.collection = collection
        this.query = db.collection(this.collection)
    }

    //  Métodos comunes productos y carrito    
    // Guardar un nuevo producto, usuario o carrito
    async save (data) {
        try {
            let savedItemId
            await this.query.add(data).then(ref => { savedItemId = { _id: ref.id } })
            return savedItemId
        } catch (error) {
            errorLogger.error(`Error al escribir en base de datos, ${error}`)
        }
    }

    //  Traer todos los productos, carritos o usuarios
    async getAll () {
        try {
            const querySnapshot = await this.query.get()
            const docs = querySnapshot.docs
            const data = docs.map(doc => ({_id: doc.id, ...doc.data()}))
            return data
        } catch (error) {
            errorLogger.error('Error al leer la base de datos', error)
        }
    }

    //  Traer producto, usuario o carrito por id
    async getById (id) {
        try {
            const doc = this.query.doc(`${id}`)
            const item = await doc.get()
            const data = { _id: id, ...item.data() }
            return data
        } catch (error) {
            errorLogger.error('El producto buscado no existe', error)
        }
    }

    // Actualizar producto, usuario o carrito por id
    async updateById (id, data) {
        try {
            const doc = this.query.doc(`${id}`)
            return await doc.update(data)
        } catch (err) {
            errorLogger.error('Error al actualizar', err)
        }
    }

    // Borrar producto, usuario o carrito por id
    async deleteById (id) {
        try {
            const doc = this.query.doc(`${id}`)
            return await doc.delete()
        } catch (err) {
            errorLogger.error('Error al eliminar', err)
        }
    }

    //  ----------- Métodos carrito -----------  //
    //  Guardar carrito
    async saveCart () {
        try {
            const newCart = {
                timestamp: Date.now(),
                productos: []
            }
            const doc = this.query.doc()
            await doc.create(newCart)
        } catch (error) {
            errorLogger.error(`Error al escribir en base de datos, ${error}`)
        }
    }

    //  Agregar producto al carrito por id
    async addProductById (id, data) {
        try {
            const cartToUpdate = await this.getById(id)
            const arrayProducts = [...cartToUpdate.productos, data]
            const doc = this.query.doc(`${id}`)
            await doc.update({ productos: arrayProducts })
            const updatedCart = await this.getById(id)
            return updatedCart
        } catch (error) {
            errorLogger.error(`Error al escribir en base de datos, ${error}`)
        }
    }

    //  Eliminar producto del carrito por id
    async deleteProductById (id, data) {
        try {
            const cartToUpdate = await this.getById(id)
            const productToDelete = cartToUpdate.productos.findIndex(product => product.product === data.product)
            cartToUpdate.productos.splice(productToDelete, 1)
            const doc = this.query.doc(`${id}`)
            await doc.set(cartToUpdate)
            const updatedCart = await this.getById(id)
            return updatedCart
        } catch (error) {
            errorLogger.error(`Error al escribir en base de datos, ${error}`)
        }
    }

    // METODOS USUARIOS //
    async getByUser (username) {
        try {
            // let user = undefined
            const allUsers = await this.getAll()
            const firestoreUserId = allUsers.filter(user => user.user === username)
            // const query = this.query.where('user', '==', username)
            // await query.get().then(data => {
            //     if (data.docs.length > 0) {
            //         user = data.docs[0].data()

            //     }
            // })
            return firestoreUserId[0]
        } catch (error) {
            errorLogger.error(`Error al buscar usuario, ${error}`)
        }
    }

    async updateUsersAdmin (users) {
        try {
            users.forEach(async user => {
                await this.updateById(user.user, { admin: user.admin.toString() })
            })
            return 'DATOS ACTUALIZADOS CON EXITO'
        } catch (error) {
            errorLogger.error(`Error al actualizar la información, ${error}`)
        }

    }

    async deleteUsers (users) {
        try {
            users.forEach(async user => {
                await this.deleteById(user)
                //await this.newModel.deleteOne( {_id: user} )
            })
            return 'USUARIOS ELIMINADOS CON EXITO'
        } catch (error) {
            errorLogger.error('Error al eliminar uno o más usuarios', error)
        }
    }

}

export default ContenedorFirebase