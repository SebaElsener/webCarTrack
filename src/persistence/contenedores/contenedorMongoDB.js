
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { infoLogger, errorLogger } from '../../logger.js'

dotenv.config()

mongoose
  .connect(
    process.env.MONGOURI,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    (error) => {
      if (error) throw new Error(`Error al conectar a base de datos, ${error}`);
      infoLogger.info("MONGODB:  Base de datos conectada");
    }
  )

class ContenedorMongoDB {
    
    //  Con los datos recibidos de los DAOS (clase extendida) crea una nueva colección y un nuevo schema
    constructor (collection, schema) {
        const newSchema = new mongoose.Schema(schema)
        this.newModel = mongoose.model(collection, newSchema)
    }

    //  Métodos comunes productos, carrito, usuarios y mensajes
    // Guardar datos
    async save (data) {
        try {
            return await this.newModel(data).save()
        } catch (error) {
            errorLogger.error(`Error al escribir en base de datos, ${error}`)
        }
    }

    //  Traer todos los productos, carritos, usuarios o mensajes
    async getAll() {
        try {
            return await this.newModel.find().lean()
        } catch (error) {
            errorLogger.error('Error al leer la base de datos', error)
        }
    }

    //  Traer producto o carrito por id
    async getById(id) {
        try {
            return await this.newModel.findOne( {_id: id} ).then(res => { return res })
        } catch (error) {
            errorLogger.error('El ID buscado no existe', error)
        }
    }

    // Borrar producto o carrito por id
    async deleteById(id) {
        try {
            return await this.newModel.deleteOne( {_id: id} )
        } catch (err) {
            errorLogger.error('Error al eliminar item', err)
        }
    }

    // Borrar todos los productos o carritos
    async deleteAll() {
        try {
            return await this.newModel.deleteMany({}).then(res => { return res })
        } catch (err) {
            errorLogger.error('Error al eliminar todos los productos', err)
        }
    }

    //  ----------- Métodos productos -----------  //
    // Actualizar producto o usuario por id
    async updateById(id, data) {
        try {
            return await this.newModel.updateOne({_id: id}, { $set: data })
        } catch (err) {
            errorLogger.error('Error al actualizar', err)
        }
    }

    //  ----------- Métodos carrito -----------  //
    //  Agregar producto al carrito por id
    async addProductById (id, data) {
        try {
            await this.newModel.updateOne( {_id: id}, {$push: {productos: data}} )
            const updatedCart = await this.getById(id)
            return updatedCart
        } catch (error) {
            errorLogger.error(`Error al escribir en base de datos, ${error}`)
        }
    }

    //  Eliminar producto del carrito por id
    async deleteProductById (id, data) {
        try {
            const dataId = (JSON.stringify(data._id))
            const cartToUpdate = await this.getById(id)
            const productToDelete = cartToUpdate.productos.findIndex(product => JSON.stringify(product._id) === dataId)
            cartToUpdate.productos.splice(productToDelete, 1)
            await this.newModel.updateOne( {_id: id}, {$set: {productos: cartToUpdate.productos}} )
            const updatedCart = await this.getById(id)
            return updatedCart
        } catch (error) {
            errorLogger.error(`Error al escribir en base de datos, ${error}`)
        }
    }

    ////////  Métodos usuarios  //////////
    async getByUser (username) {
        try {
            const matchedUser = await this.newModel.findOne({ user: username })
            if (matchedUser == null) {
                return undefined
            }
            return matchedUser
        } catch (error) {
            errorLogger.error(`Error al buscar usuario, ${error}`)
        }
    }

    async updateUsersAdmin (users) {
        try {
            users.forEach(async user => {
                await this.newModel.updateOne({_id: user.user}, {$set: {admin: user.admin}})
            })
            return 'DATOS ACTUALIZADOS CON EXITO'
        } catch (error) {
            errorLogger.error(`Error al actualizar la información, ${error}`)
        }

    }

    async deleteUsers (users) {
        try {
            users.forEach(async user => {
                await this.newModel.deleteOne( {_id: user} )
            })
            return 'USUARIOS ELIMINADOS CON EXITO'
        } catch (error) {
            errorLogger.error('Error al eliminar uno o más usuarios', error)
        }
    }
}

export default ContenedorMongoDB