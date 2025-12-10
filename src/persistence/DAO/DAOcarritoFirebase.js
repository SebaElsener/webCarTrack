
import ContenedorFirebase from "../contenedores/contenedorFirebase.js"

let instance = null

class DAOcarritoFirebase extends ContenedorFirebase {

    constructor (){
        super('carts')
    }

    static getInstance () {
        if(!instance) { instance = new DAOcarritoFirebase() }
        return instance
    }

}

export default DAOcarritoFirebase