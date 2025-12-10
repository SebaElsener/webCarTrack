
import ProductsRepositoryMongoDB from './repository/productsRepositoryMongoDB.js'
import ProductsRepositoryFirebase from './repository/ProductsRepositoryFirebase.js'
import supabaseRepository from './repository/supabaseRepository.js'
import DAOcarritoMongoDB from './DAO/DAOcarritoMongoDB.js'
import DAOusersMongoDB from './DAO/DAOusersMongoDB.js'
import DAOcarritoFirebase from './DAO/DAOcarritoFirebase.js'
import DAOusersFirebase from './DAO/DAOusersFirebase.js'
import { infoLogger } from '../logger.js'
import _yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

const yargs = _yargs(hideBin(process.argv))
const { DB } = yargs
    .default({
        DB: 'mongoDB'
    })
    .argv

//  Con la siguiente var elegimos el método de persistencia (pasado como argumento en línea de comando al iniciar server)
//  Según su valor se importan y exportan las instancias de las clases para la persistencia
const persistenceMethod = DB

infoLogger.info(`PERSISTENCIA: ${DB}`)

let productsRepo = null
let DAOcarrito = null
let DAOusers = null
let supabaseRepo = null

switch (persistenceMethod) {
    case 'mongoDB':
        productsRepo = ProductsRepositoryMongoDB.getInstance()
        DAOcarrito = DAOcarritoMongoDB.getInstance()
        DAOusers = DAOusersMongoDB.getInstance()
        supabaseRepo = supabaseRepository.getInstance()
        break
    case 'firebase':
        productsRepo = ProductsRepositoryFirebase.getInstance()
        DAOcarrito = DAOcarritoFirebase.getInstance()
        DAOusers = DAOusersFirebase.getInstance()
        break
}

export { productsRepo, DAOcarrito, DAOusers, supabaseRepo }