import Joi from "joi";
import mongoose from "mongoose";
import { generalFields } from "../../middleware/validation.middleware.js";
import { logoutEnum } from "../../utils/security/token.security.js";
import { fileValidation } from "../../utils/multer/local.multer.js";


export const profileImage = {
    file: Joi.object().keys({
        fieldname: generalFields.file.fieldname.valid('image').required(),
        originalname: generalFields.file.originalname,
        encoding: generalFields.file.encoding,
        mimetype: generalFields.file.mimetype.valid(...Object.values(fileValidation.image)),
       // finalPath: generalFields.file.finalPath,
        destination:generalFields.file.destination,
        filename: generalFields.file.filename,
        path: generalFields.file.path,
        size:generalFields.file.size
    
    }).required()
   }

export const coverImage = {
    files: Joi.array().items(Joi.object().
        keys({
                
        fieldname: generalFields.file.fieldname.valid('images').required(),
        originalname: generalFields.file.originalname,
        encoding: generalFields.file.encoding,
        mimetype: generalFields.file.mimetype.valid(...Object.values(fileValidation.image)),
        destination:generalFields.file.destination,
        filename: generalFields.file.filename,
        path: generalFields.file.path,
        size:generalFields.file.size
    
    }).required()
    ).min(1).max(2).required()
    /*
     files: Joi.array().items(
        Joi.object().keys(generalFields.file ).required()
    ).min(1).max(2) */
        
    }
export const shareProfile ={ params:Joi.object().keys({
    userId: generalFields.id.required()

    
})
}
export const updateBasicInfo = {
    body: Joi.object().keys({
        fullName: generalFields.fullName,
        phoneNumber:generalFields.phoneNumber,
        gender: generalFields.gender,
        
    }).required()
}
export const freezeAccount = {
    params: Joi.object().keys({
        userId: generalFields.id
    })
}

export const restoreAccount = {
    params: Joi.object().keys({
        userId: generalFields.id
    }).required()
}
export const hardDeleteAccount = {
    params: Joi.object().keys({
        userId: generalFields.id
    }).required()
}
export const logout = {
    body: Joi.object().keys({
        flag:Joi.string().valid(...Object.values(logoutEnum)).default(logoutEnum.stayLoggedIn)
    })
}

export const updatePassword = {
    body: logout.body.append({
        oldPassword: generalFields.password.required(),
        password: generalFields.password.required(),
        confirmPassword:generalFields.confirmPassword.required()
        
    }
    ).required()

}




