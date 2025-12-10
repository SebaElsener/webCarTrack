
import ContenedorMongoDB from "../contenedores/contenedorMongoDB.js"

const cartSchema = 
    {
        timestamp: {type: String, require: true},
        productos: {type: Array, require: true},
    }

let instance = null

class DAOcarritoMongoDB extends ContenedorMongoDB {

    constructor (){
        super('cart', cartSchema)
    }

    static getInstance () {
        if(!instance) { instance = new DAOcarritoMongoDB() }
        return instance
    }

}

export default DAOcarritoMongoDB