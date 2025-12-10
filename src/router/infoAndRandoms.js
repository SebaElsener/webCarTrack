
import { Router } from 'express'
import generarRegistros from '../controller/infoAndRamdomscontroller.js'

const infoAndRandoms = new Router()

infoAndRandoms.get('/', generarRegistros)

export default infoAndRandoms