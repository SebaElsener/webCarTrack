
import ContenedorSupabase from "../contenedores/contenedorSupabase.js"

let instance = null

class supabaseRepository extends ContenedorSupabase {

    constructor (){
        super()
    }

    static getInstance () {
        if(!instance) { instance = new supabaseRepository() }
        return instance
    }

}

export default supabaseRepository