
import path from 'node:path'
import * as dotenv from 'dotenv'
//dotenv.config({ path: path.join('./src/config/.env.dev') })
dotenv.config({})
import express from 'express'
import messageController from './modules/message/message.controller.js'
import authController from './modules/auth/auth.controller.js'
import userController from './modules/user/user.controller.js'
import connectDB from './DB/connection.db.js'
import { globalErrorHandling } from './utils/response.js'
import cors from 'cors'
import morgan from 'morgan'

const bootstrap = async () => {

    const app = express()
    const port = process.env.PORT || 5000
    app.use('/uploads',express.static(path.resolve('./src/uploads')))
    app.use(express.json())
    app.use(cors())
    app.use(morgan('common'))
    //DB
    await connectDB()

    //app routing
    app.use('/auth', authController)
    app.use('/user', userController)
    
 app.use('/message', messageController)
    app.get('/', (req, res, next) => { res.json({ message: 'welcome to whisper app (anonymous messages app  )💚 ' }) })
    app.all('{/*dummy}',(req ,res , next)=>{res.json({message: 'invalid routing'})})
    app.use(globalErrorHandling)
    

    return app.listen(port, () => { console.log(`server is running on port :::${port} 🚀 `)})
}
export default bootstrap 

