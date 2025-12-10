
import ContenedorFirebase from "../contenedores/contenedorFirebase.js"

let instance = null

class DAOusersFirebase extends ContenedorFirebase {

    constructor (){
        super('users')
    }

    static getInstance () {
        if(!instance) { instance = new DAOusersFirebase() }
        return instance
    }

}

export default DAOusersFirebase