import dotenv from 'dotenv'
import path from 'path'
dotenv.config({
    path:path.resolve('src/config/.env')
})
export default ({
    env:process.env.NODE_ENV,
    db: {
        name: process.env.DB_NAME,
        uri: process.env.DB_URI,
        
    },
    port: {
        port:process.env.DB_PORT
    },
    jwt: {
        key: process.env.TOKEN_KEY,
        expires: '1h',
        audience:process.env.AUDIENCE,
    }
})