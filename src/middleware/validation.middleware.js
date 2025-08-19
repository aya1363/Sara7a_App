import { asyncHandler } from "../utils/response.js"
//import * as validators from '../modules/auth/auth.validation.js'
import Joi from "joi"
import mongoose from "mongoose";
import { genderENUM } from "../DB/models/user.model.js";
import { fileValidation } from "../utils/multer/local.multer.js";
export const generalFields = {
        fullName: Joi.string().min(3).max(20),
    
        phoneNumber: Joi.string()
            .pattern(/^(?:\+20|0020|0)1[0125][0-9]{8}$/)
            
            .messages({
                'string.pattern.base': 'Invalid Egyptian phone number.',
                'string.empty': 'Phone number is required.',
            }),
        email: Joi.string()
            .email({ minDomainSegments: 2, maxDomainSegments: 3, tlds: { allow: ['com', 'net', 'edu'] } })
                ,
        password: Joi.string()
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)
            .messages({
            'string.pattern.base': 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.',
            }),
        confirmPassword: Joi.string()
            .valid(Joi.ref('password'))
            .required()
            .messages({
                'any.only': 'Passwords do not match.',
            })
    , otp: Joi.string().pattern(new RegExp(/^\d{6}$/)),
    gender:Joi.string().valid(...Object.values(genderENUM)),
    
    id: Joi.string()
        .length(24)
        .custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            return helpers.message("Invalid user ID format");
        }
        return value; 
        }),
    file:{
        fieldname: Joi.string().required(),
            originalname: Joi.string().required(),
            encoding: Joi.string().required(),
            mimetype: Joi.string(),
          //  finalPath: Joi.string().required(),
            destination:Joi.string().required(),
            filename: Joi.string().required(),
            path: Joi.string().required(),
            size:Joi.number().positive().required()
    }

        
    
}
export const validation = (schema) => {
    return asyncHandler(async (req, res, next) => {
    
        
        const validationError =[]
        for (const key of Object.keys(schema)) {
            const validationResult = schema[key].validate(req[key], { abortEarly: false });

            if (validationResult.error) {
                validationError.push({
                    key, details: validationResult.error.details.map(ele =>{
                    return{message :ele.message , path:ele.path[0]}}
                )})

            }
        }
        if (validationError.length) {
            return res.status(400).json({message:'error ',validationError})
        }

        // Only call next if all validations passed
        next();
    });
}










      //      const validationResult = schema.validate(...req.body,...req.query , {abortEarly:false})
      //  if (validationResult.error) {
        //    return res.status(400).json({ err_message : 'validation error ',validationResult })
      //  }
      //  next()

