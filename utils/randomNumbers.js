import { infoLogger } from "../src/logger"

const randomNumbers = (numbersQty) => {
    const numbersArray = []
    const consolidatedInfo = []
    for (let i = 0; i < numbersQty; i++) {
        numbersArray.push(Math.floor(Math.random() * 1000))
    }
    // Generando un nuevo set de nros únicos sin repetir
    const uniqueNumbersArray = [...new Set(numbersArray)]
    // Contando la cantidad de repetidos en numbersArray a través de recorrer el array de nros únicos
    for (let uniqueNumber of uniqueNumbersArray) {
        const numberAppearances = numbersArray.reduce((total, randomNumber) => {
            // Si coinciden los nros, los sumo al total
            return randomNumber === uniqueNumber ? total += 1 : total
        }, 0)
        const consolidated = {
            number: uniqueNumber,
            qty: numberAppearances
        }
        consolidatedInfo.push(consolidated)
    }
    return consolidatedInfo
}

process.on('exit', () => infoLogger.info(`worker ${process.pid} cerrado`))

process.on('message', (numbersQty) => {
    const randomNumbersGenerated = randomNumbers(numbersQty)
    process.send(randomNumbersGenerated)
    process.exit()
})