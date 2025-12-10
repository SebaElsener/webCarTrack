
import { supabaseRepo } from '../persistence/factory.js'

const getAllScans = async () => {
    const allScans = await supabaseRepo.getAll()
    const allPhotos = await supabaseRepo.getPictures()
    allScans.forEach(scan => {
        scan.pictures = []
        for (const photo of allPhotos) {
            if (photo.vin === scan.code) {
                scan.pictures.push(photo.pictureurl)
            }
        }
    })
    return allScans
}

export {
    getAllScans
}