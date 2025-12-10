
import ContenedorMongoDB from '../contenedores/contenedorMongoDB.js'

const userSchema = 
    {
        user: {type: String, require: true, max: 300},
        password: {type: String, require: true, max: 300},
        name: {type: String, require: true, max: 300},
        address: {type: String, require: true, max: 300},
        age: {type: Number, require: true, max: 99},
        phone: {type: String, require: true, max: 300},
        avatar: {type: String, require: true, max: 300},
        cartId: {type: String, require: false, max: 300},
        admin: {type: String, require: false, max: 10}
    }

let instance = null

class DAOusersMongoDB extends ContenedorMongoDB {

    constructor () {
        super ('users', userSchema)
    }

    static getInstance () {
        if(!instance) { instance = new DAOusersMongoDB() }
        return instance
    }
}

export default DAOusersMongoDB