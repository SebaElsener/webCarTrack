
import ContenedorFirebase from "../contenedores/contenedorFirebase.js"

let instance = null

class ProductsRepositoryFirebase extends ContenedorFirebase {

    constructor (){
        super('products')
    }

    static getInstance () {
        if(!instance) { instance = new ProductsRepositoryFirebase() }
        return instance
    }

}

export default ProductsRepositoryFirebase