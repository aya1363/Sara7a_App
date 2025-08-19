import Joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";
import { fileValidation } from "../../utils/multer/cloud.multer.js";

export const sendMessage = {
    params: Joi.object().keys({
        receiverId:generalFields.id.required()
    }).required(),

    body: Joi.object().keys({
        content:Joi.string().min(2).max(200000)
    }).required(),
    files: Joi.array().items(Joi.object().keys({
          fieldname: generalFields.file.fieldname.valid('attachments').required(),
                originalname: generalFields.file.originalname,
                encoding: generalFields.file.encoding,
                mimetype: generalFields.file.mimetype.valid(...Object.values(fileValidation.image)),
                destination:generalFields.file.destination,
                filename: generalFields.file.filename,
                path: generalFields.file.path,
                size:generalFields.file.size
    }).required()).min(0).max(2)
    
}