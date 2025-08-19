import Joi from 'joi';
import {generalFields}  from '../../middleware/validation.middleware.js';

export const sendForgotPassword = {
    body: Joi.object().keys({
        email: generalFields.email.required()
    })
    
}

export const verifyForgotPasswordOtp = {
    body: sendForgotPassword.body.append({
        otp:generalFields.otp.required()
    })  
}

export const resetPassword = {
    body: verifyForgotPasswordOtp.body.append({
        password: generalFields.password.required(),
        confirmPassword:generalFields.confirmPassword.required()
    })  
}
export const login ={ body:Joi.object().keys({
    email: generalFields.email.required(),
    password: generalFields.password.required()
    
})}

export const signup = {
    body:login.body.append({
    fullName: generalFields.fullName.required(),

    phoneNumber:generalFields.phoneNumber.required(),

    confirmPassword: generalFields.confirmPassword.required()
    }),
    query: Joi.object().keys({
    lang:Joi.string().valid('ar','en')
    })
}

export const confirmEmail = {
    body: Joi.object().keys({
        email: generalFields.email.required(),
        otp:generalFields.otp.required()
    })
    
}

export const loginWithGmail = {
    body: Joi.object().keys({
        idToken: Joi.string().required(),
        otp:generalFields.otp.required()
    }).required().options({allowUnknown:false})
    
}

export const signupWithGmail = {
      body: Joi.object().keys({
        idToken: Joi.string().required()
    }).required().options({allowUnknown:false})
}

export const resendOtp = {
    body: Joi.object().keys({
        email: generalFields.email.required()
    })
    
}

