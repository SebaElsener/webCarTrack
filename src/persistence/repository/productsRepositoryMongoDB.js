
import ContenedorMongoDB from '../contenedores/contenedorMongoDB.js'

const productSchema = 
    {
        product: {type: String, require: true, max: 50},
        price: {type: Number, require: true},
        stock: {type: Number, require: true, max: 99999},
        description: {type: String, require: true, max: 50},
        code: {type: String, require: true},
        thumbnail: {type: String, require: true, max: 50}
    }

let instance = null

class ProductsRepositoryMongoDB extends ContenedorMongoDB {

    constructor (){
        super('products', productSchema)
    }

    static getInstance () {
        if(!instance) { instance = new ProductsRepositoryMongoDB() }
        return instance
    }

}

export default ProductsRepositoryMongoDB