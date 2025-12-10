
import * as os from 'os'

const infoService = () => {
    const data = {
        args: process.argv,
        platform: process.platform,
        version: process.version,
        projectFolder: process.cwd(),
        projectPath: process.execPath,
        processId: process.pid,
        memUsage: process.memoryUsage().rss,
        CPUsQty: os.cpus().length
    }
    return data
}

export {
    infoService
}