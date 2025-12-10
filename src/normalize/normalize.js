
import { normalize, schema } from 'normalizr'

const authorSchema = new schema.Entity('author')
const postSchema = new schema.Entity('post', { author: authorSchema }, { idAttribute: '_id' })
const postsSchema = new schema.Entity('posts', { mensajes: [postSchema] })

const normalizeMessages = (messages) => {
    return normalize({ id: 'mensajes', mensajes: messages }, postsSchema)
}

export default normalizeMessages