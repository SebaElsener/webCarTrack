import autocannon from 'autocannon'
import { PassThrough } from 'stream'
import { infoLogger, errorLogger } from './src/logger'

function run(url) {
    const buffer = []
    const output = new PassThrough()
    
    const inst = autocannon({
        url,
        connections: 100,
        duration: 20
    })
    
    autocannon.track(inst, {output})
    output.on('data', data => {
        buffer.push(data)
    })
    
    inst.on('done', () => {
        process.stdout.write(Buffer.concat(buffer))
    })
}

infoLogger.info('Running tests in parallel')
run('http://localhost:8080/api/info')