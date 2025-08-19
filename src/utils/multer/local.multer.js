import multer from "multer";
import path from 'node:path'
import fs from 'node:fs'

export const fileValidation = {
    image: ['image/jpeg','image/png','image/gif'],
    document:['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document',]
}

export const localFileUpload = ({customPath = 'general'  , validation =[] } = {}) => {
    let basePath = `./uploads/${customPath}`
    
    

    const storage = multer.diskStorage({
        destination: function (req, file, callback) {
            if (req.user._id) {
                basePath += `/${req.user.id}`
            }
            
            
            const fullPath = path.resolve(`./src/${basePath}`)
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath ,{recursive:true})
            }

            
            callback(null ,path.resolve(fullPath))
        },
        filename: function (req, file, callback) {
           
            const uniqueFileName = Date.now() + '__' + Math.random() + '__' + file.originalname
            file.finalPath = basePath+'/'+uniqueFileName
            callback(null , uniqueFileName)
        }
    })
    
    const fileFilter = function (req, file, callback) {
              

        
        if (validation.includes(file.mimetype)) {
            return callback(null ,true)
        }
        return callback(new Error('in valid file data', false))
        
    }


    return multer({
        dest: "./temp",
        fileFilter,
        storage,
       limits: { fileSize: 5 * 1024 * 1024 },
    })
}