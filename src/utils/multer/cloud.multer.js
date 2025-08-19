import multer from "multer";


export const fileValidation = {
    image: ['image/jpeg','image/png','image/gif'],
    document:['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document',]
}

export const cloudFileUpload = ({validation =[] } = {}) => {


    const storage = multer.diskStorage({})

        
    
    const fileFilter = function (req, file, callback) {
        if (validation.includes(file.mimetype)) {
            return callback(null ,true)
        }
        return callback(new Error('in valid file data', false))
        
    }


    return multer({
    
        fileFilter,
        storage,
       limits: { fileSize: 4 * 1024 * 1024 },
    })
}