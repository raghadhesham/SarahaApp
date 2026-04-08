import dotenv from 'dotenv'
import path from 'path'
dotenv.config({
    path:path.resolve('src/config/.env')
})
export const config= ({
    env:process.env.NODE_ENV,
    db: {
        name: process.env.DB_NAME,
        uri: process.env.DB_URI,
        
    },
    port: {
        port:process.env.DB_PORT
    },
    jwt: {
        access_key: process.env.ACCESS_TOKEN_KEY,
        refresh_key: process.env.REFRESH_TOKEN_KEY,
        access_expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
        refresh_expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
        audience: process.env.AUDIENCE,
        prefix:process.env.PREFIX
    },
    cloudinary: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        cloud_api_key:process.env.CLOUDINARY_API_KEY,
        cloud_api_secret:process.env.CLOUDINARY_API_SECRET
    },
    redis: {
        redis_url:process.env.REDIS_URl
    },
    email: {
        email: process.env.EMAIL,
        password:process.env.PASSWORD
    },
    cors: {
        white_list:process.env.WHITE_LIST.split(',')
    }
})