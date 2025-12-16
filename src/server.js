
import express from 'express'
import { createServer } from "http"
import { Server } from "socket.io"
import { sessionMiddleware } from './middleware/sessionMiddleware.js'
import MessageRepository from './persistence/repository/messageRepository.js'
import userLogin from './router/userLogin.js'
import homeRoute from './router/homeRoute.js'
import userReg from './router/userReg.js'
import passport from 'passport'
import routeProducts from './router/productsRouter.js'
import routeCart from './router/cartRouter.js'
import userLogout from './router/userLogout.js'
import userLoginWatcher from './middleware/userLoginWatcher.js'
import _yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import dotenv from 'dotenv'
import infoAndRandoms from './router/infoAndRandoms.js'
import cluster from 'cluster'
import * as os from 'os'
import compression from 'compression'
import routeError from './middleware/routeError.js'
import { logs } from './middleware/logs.js'
import userData from './router/userData.js'
import { infoLogger, errorLogger } from './logger.js'
import SessionStore from '../utils/chatSessionStorage.js'
import scansRoute from './router/scansRoute.js'
import chartsRoute from './router/chartsRouter.js'
import statsRoute from './router/statsRouter.js'
import querysRouter from './router/querysRouter.js'

dotenv.config()

const yargs = _yargs(hideBin(process.argv))
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)

const messages = MessageRepository.getInstance()

app.set('view engine', 'ejs')
app.set('views', './public/views')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use(compression())
app.use(sessionMiddleware)
app.use(passport.initialize())
app.use(passport.session())
passport.serializeUser((user, done) => {
    done(null, user)
  })
passport.deserializeUser((user, done) => {
    done(null, user)
})

// Middleware para registrar todas la peticiones recibidas
app.use(logs)

// Rutas api
//userLoginWatcher
app.use('/', userLogin)
app.use('/api/productos', userLoginWatcher, routeProducts)
app.use('/api/carrito', userLoginWatcher, routeCart)
app.use('/api/userdata', userLoginWatcher, userData)
app.use('/api/scans', scansRoute)
app.use('/api/querys', querysRouter)
app.use('/api/login', userLogin)
app.use('/api/logout', userLogout)
app.use('/api/register', userReg)
app.use('/api/stats', statsRoute)
app.use('/api/home', homeRoute)
app.use('/api/charts', chartsRoute)
app.use('/api/populateSupabase', infoAndRandoms)

// Middleware para mostrar error al intentar acceder a una ruta/método no implementados
app.use(routeError)

// convert a connect middleware to a Socket.IO middleware
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next)
io.use(wrap(sessionMiddleware))
io.use(wrap(passport.initialize()))
io.use(wrap(passport.session()))

const sessionStore = new SessionStore()
io.use((socket, next) => {
    if (socket.request.user) {
        socket.sessionId = socket.request.sessionID
        socket.username = socket.request.user
        next()
    } else {
        next(infoLogger.error('SESION NO INICIADA'))
    }
})

io.on('connection', async socket => {
    infoLogger.info(`Nuevo cliente ${socket.username} conectado!`);
    sessionStore.saveSession(socket.sessionId, {
        username: socket.username,
      })

    // join the user room
    socket.join(socket.username)

    // Almacenamiento de usuarios que se van conectando
    const users = []
    sessionStore.findAllSessions().forEach((session) => {
        users.push({
            username: session.username
        })
    })
    // Envío de usuarios conectados
    io.sockets.emit('connectedUsers', users)

    // Escuchando y guardando nuevos mensajes
    socket.on('newMessage', async data => {
        const { newMessage, receiver, sender } = data
        const dataToStore =
            {
                ...newMessage,
                from: sender,
                to: receiver
            }
        await messages.save(dataToStore)
        const allMssgs = await messages.getAll()
        let mssgs = []
        for (let mssg of allMssgs){
            if (mssg.from === sender && mssg.to === sender) {
				mssgs.push(mssg)
                continue
			}
            if (mssg.from === sender && mssg.to === receiver) { mssgs.push(mssg) }
            if (mssg.from === receiver && mssg.to === sender) { mssgs.push(mssg) }
        }
        io.to(receiver).to(socket.username).emit("newMessage", {
            newMessage: mssgs
        })
    })
    socket.on('disconnect', () => {
        infoLogger.info(`Desconectado ${socket.username}`)
        sessionStore.deleteSession(socket.sessionId)
    })
})

const { PORT, clusterMode } = yargs
    .alias({
        p: 'PORT',
        m: 'clusterMode'
    })
    .default({
        PORT: 8080,
        clusterMode: 'FORK'
    })
    .argv

if (clusterMode === 'CLUSTER' && cluster.isPrimary) {
    const CPUsQty = os.cpus().length

    infoLogger.info('SERVIDOR PRIMARIO DEL CLUSTER')
    infoLogger.info('Número de procesadores: ' + CPUsQty)
    infoLogger.info('PID:' + process.pid)

    for (let i = 0; i < CPUsQty; i++) {
        cluster.fork()
    }
    cluster.on('exit', worker => {
        infoLogger.info(`Worker ${worker.process.pid} died on ${new Date().toLocaleString()}`)
        cluster.fork()
    })
} else {
    const connectedServer = httpServer.listen(PORT, () => {
        infoLogger.info(`http server escuchando en puerto ${connectedServer.address().port}`)
    })
    connectedServer.on('error', error => errorLogger.error(`Error en servidor ${error}`))
}