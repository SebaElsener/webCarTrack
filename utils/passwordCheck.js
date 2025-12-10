
import bcrypt from 'bcrypt'

export const passwordCheck = async (dbPassword, loginPassword) => {
    return await bcrypt.compare(loginPassword, dbPassword)
}