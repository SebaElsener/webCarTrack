
import ContenedorMongoDB from '../contenedores/contenedorMongoDB.js'

const messageSchema = 
    {
        author: {
            id: {type: String, require: true, max: 50},
            nombre: {type: String, require: true, max: 50},
            apellido: {type: String, require: true, max: 50},
            edad: {type: Number, require: true, max: 99},
            alias: {type: String, require: true, max: 50},
            avatar: {type: String, require: true, max: 300}
        },
        text: {type: String, require: true, max: 300},
        date: {type: String, require: true, max: 300}
    }

let instance = null

class DAOmessagesMongoDB extends ContenedorMongoDB {

    constructor () {
        super ('messages', messageSchema)
    }

    static getInstance () {
        if(!instance) { instance = new DAOmessagesMongoDB() }
        return instance
    }
}

export default DAOmessagesMongoDB