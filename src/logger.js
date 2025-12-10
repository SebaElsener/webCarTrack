
import pino from 'pino'

const errorLogger = 
    pino({
        level: 'warn',
        timestamp: pino.stdTimeFunctions.isoTime
    },
    pino.destination('./log/logs.log'))

const infoLogger = 
    pino({
        level: 'info',
        timestamp: pino.stdTimeFunctions.isoTime
    })

export {
    errorLogger,
    infoLogger
}