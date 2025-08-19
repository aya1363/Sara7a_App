import { providerEnum, roleEnum, userModel } from "../../DB/models/user.model.js"
import { asyncHandler, successResponse } from '../../utils/response.js';
import * as DBService from '../../DB/db.service.js'
import { compareHash, generateHash } from "../../utils/security/hash.security.js";
import { generateEnc } from "../../utils/encryption.security.js";
import { decodedToken, generateToken, getLoginCredentials, getSignatures, signatureLevelEnum, verifyToken } from "../../utils/security/token.security.js";
import { sendEmail } from "../../utils/email/send.email.js";
import  {OAuth2Client} from 'google-auth-library';
import { emailEvent } from "../../utils/events/email.event.js";
import { customAlphabet } from "nanoid";
import * as validators from './auth.validation.js'
const client = new OAuth2Client();

export const signup = asyncHandler( async(req, res, next) => {
    const { fullName, email, password, phoneNumber } = req.body
    

    
    
    if (await DBService.findOne({ model: userModel, filter: { email } })) {
            return next(new Error('email exist',{cause:409}))
    }
    const hashPassword = await generateHash({ plainText: password })
    const encPhone = await generateEnc({ plainText:phoneNumber})
    const otp = customAlphabet('0123456789', (6))()
    const confirmEmailOtp = await generateHash({plainText:otp})
    
    
    const user = await DBService.create({
        model: userModel,
        data: [{
            fullName, email,
            password: hashPassword,
            phoneNumber: encPhone,
            confirmEmailOtp,
            confirmEmailOtpCreatedAt: Date.now(),    
           confirmEmailOtpTries: 0,   
        }]
    })
    emailEvent.emit('confirmEmail',{to:email , otp })
      successResponse({res, status:201 ,data:{user}})
    

})
export const confirmEmail = asyncHandler(async (req, res, next) => {
    const { email, otp } = req.body;
    const user = await DBService.findOne({
        model: userModel,
        filter: {
            email,
            confirmEmail: { $exists: false },
            confirmEmailOtp: { $exists: true }
        }
    });

    if (!user) {
        return next(new Error('invalid account or already verified', { cause: 404 }));
    }

    const now = Date.now();
    const otpCreatedAt = new Date(user.confirmEmailOtpCreatedAt).getTime();

    // OTP expired? → resend new OTP automatically
    if (!otpCreatedAt || now - otpCreatedAt > 2 * 60 * 1000) {
        const newOtp = customAlphabet('0123456789', 6)();
        const hashNewOtp = await generateHash({ plainText: newOtp });

        await DBService.updateOne({
            model: userModel,
            filter: { email },
            data: {
                confirmEmailOtp: hashNewOtp,
                confirmEmailOtpCreatedAt: Date.now(),
                confirmEmailOtpTries: 0
            }
        });

        emailEvent.emit('confirmEmail', { to: email, otp: newOtp });
        return next(new Error('OTP expired — a new code has been sent to your email', { cause: 410 }));
    }

    const isOtpCorrect = await compareHash({ plainText: otp, hashValue: user.confirmEmailOtp });
    if (!isOtpCorrect) {
        if (user.confirmEmailOtpTries >= 4) {
            const newOtp = customAlphabet('0123456789', 6)();
            const hashNewOtp = await generateHash({ plainText: newOtp });

            await DBService.updateOne({
                model: userModel,
                filter: { email },
                data: {
                    confirmEmailOtp: hashNewOtp,
                    confirmEmailOtpCreatedAt: Date.now(),
                    confirmEmailOtpTries: 0
                }
            });

            emailEvent.emit('confirmEmail', { to: email, otp: newOtp });
            return next(new Error('Too many failed attempts — a new OTP has been sent', { cause: 429 }));
        }

        await DBService.updateOne({
            model: userModel,
            filter: { email },
            data: { $inc: { confirmEmailOtpTries: 1 } }
        });

        return next(new Error(`Invalid OTP. ${4 - user.confirmEmailOtpTries} attempts left.`, { cause: 401 }));
    }

    // OTP correct → confirm email
    const updatedUser = await DBService.updateOne({
        model: userModel,
        filter: { email },
        data: {
            confirmEmail: Date.now(),
            $unset: {
                confirmEmailOtp: 1,
                confirmEmailOtpCreatedAt: 1,
                confirmEmailOtpTries: 1
            },
            $inc: { __v: 1 }
        }
    });

    return updatedUser.matchedCount
        ? successResponse({ res, status: 200, data: {} })
        : next(new Error('Failed to confirm email', { cause: 404 }));
});


export const login =asyncHandler(async (req, res, next) => {

    const { email, password } = req.body
    
        
    const user = await DBService.findOne({ model: userModel, filter: { email  , provider:providerEnum.system} })
    
    
    
        if (!user) {
            return next(new Error('in-valid login data',{cause:404}))
    }
    if (!user.confirmEmail) {
        return next (new Error('please verify your account first',{cause:404}))
    }
    if (user.deletedAt) {
        return next (new Error(' account is deactivated ',{cause:404}))
    }
    const match = await compareHash({ plainText: password, hashValue: user.password })
    
    
    if (!await compareHash({plainText:password , hashValue:user.password})) {
        return next(new Error('in-valid login data',{cause:404}))
    }
    const credentials = await getLoginCredentials(user)
    return  successResponse({ res, data: { credentials } })
    
})
async function verifyGoogleAccount({ idToken } = {}) {

  const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.WEB_CLIENT_ID.split(','), 
  });
  const payload = ticket.getPayload();
  return payload
 
}


export const signupWithGmail = asyncHandler(async (req, res, next) => {
    const { idToken } = req.body
    const { name, email, email_verified, picture } = await verifyGoogleAccount({ idToken })
    if (!email_verified) {
        return next(new Error('not verified account', { cause: 400 }))
    }
    const user = await DBService.findOne({ model: userModel, filter: {email} })
    if (user) {
        if (user.provider === providerEnum.google) {
            const credentials = await getLoginCredentials(user)
            return successResponse({res  ,data:{credentials}})
          //  return loginWithGmail(req ,res,next)
        }
        return next(new Error('email exist', { cause: 404}))
    }
    const [newUser] = await DBService.create({
        model: userModel, data: [{
            fullName: name,
            email:email,
            picture,
            confirmEmail: Date.now(),
            provider:providerEnum.google
    }]})

    return successResponse({res ,status:201 , data:{user:newUser._id}})


})
export const loginWithGmail = asyncHandler(
    async (req, res, next) => {
        const { idToken } = req.body
        const { email, email_verified } = await verifyGoogleAccount({ idToken })
        if (!email_verified) {
            return next(new Error('not verified account', { cause: 400 }))
    }
        const user = await DBService.findOne({ model: userModel, filter: {email , provider:providerEnum.google} })
        if (!user) {
            return next(new Error(' in-valid login data or invalid provider ', { cause: 404}))
        }
            const credentials = await getLoginCredentials(user)
        successResponse({res  ,data:{credentials}})

    }
)
export const resendConfirmEmailOtp = asyncHandler(async (req, res, next) => {

    const { email } = req.body;

   
    const user = await DBService.findOne({
        model: userModel,
        filter: {
            email,
            confirmEmail: { $exists: false } 
        }
    });

    if (!user) {
        return next(new Error('Account not found or already verified', { cause: 404 }));
    }

    const now = Date.now();
    if (
        user.confirmEmailOtpCreatedAt &&
        now - new Date(user.confirmEmailOtpCreatedAt).getTime() < 30 * 1000
    ) {
        return next(new Error('Please wait before requesting a new OTP', { cause: 429 }));
    }

   
    const otp = customAlphabet('0123456789', 6)();
    const hashNewOtp = await generateHash({ plainText: otp });

    
    await DBService.updateOne({
        model: userModel,
        filter: { email },
        data: {
            confirmEmailOtp: hashNewOtp,
            confirmEmailOtpCreatedAt: Date.now(),
            confirmEmailOtpTries: 0
        }
    });


    emailEvent.emit('confirmEmail', { to: email, otp });

    return successResponse({
        res,
        status: 200,
        data: { message: 'A new OTP has been sent to your email.' }
    });
});

export const sendForgotPassword = asyncHandler(async(req, res, next)=> {
    const { email } = req.body
    const otp =  customAlphabet('0123456789',6)()
    const user = await DBService.findOneAndUpdate({
        model: userModel,
        filter: {
            email,
            confirmEmail: { $exists: true },
             deletedAt:{$exists:false},
            provider:providerEnum.system
        }, data: {
            forgetPasswordOtp: await generateHash({ plainText: otp })
            ,
    options: { new: true, runValidators: true }
        }
        
    })
    if (!user) {
        next(new Error('invalid account ', {cause:404}))

    }
    emailEvent.emit('sendForgetPassword ',{ to: email , subject :'forgot password', title:'reset password',otp})
        return  successResponse({res})
})

export const verifyForgotPasswordOtp = asyncHandler(async (req, res, next) => {
    
     const { email ,otp } = req.body
    
    const user = await DBService.findOneAndUpdate({
        model: userModel,
        filter: {
            email,
            confirmEmail: { $exists: true },
            deletedAt:{$exists:false},
            provider: providerEnum.system,
            forgetPasswordOtp:{ $exists: true }
        }
        
    })
    if (!user) {
        next(new Error('invalid account ', {cause:404}))
    }
    if (!await compareHash({plainText:otp  ,hashValue:user.forgetPasswordOtp})) {
        return next(new Error('invalid otp' ,{cause:400}))
    }
   
    return successResponse({ res })
})

export const resetPassword = asyncHandler(async (req, res, next) => {
    
    const { email, password, otp } = req.body 
    const user = await DBService.findOne({
        model: userModel,
        filter: {
            email,
            confirmEmail: { $exists: true },
            deletedAt: { $exists: false },
            forgetPasswordOtp: { $exists: true },
            provider:providerEnum.system
        }
    })
    if (!user) {
        return next (new Error('invalid account',{cause:404}))
    }
    if (! await compareHash({plainText:otp , hashValue:user.forgetPasswordOtp})) {
        return next(new Error('invalid otp',{cause:400}))
    }
    await DBService.updateOne({
        model: userModel,
        filter: {
            email
        }, data: {
            password: await generateHash({ plainText: password }),
            changeCredentialTime: new Date(),
            $unset: {
                forgetPasswordOtp : 1
            }
        }, options: {
            new:true , runValidators:true
        }
    })
    return successResponse({res , data:user })
})


