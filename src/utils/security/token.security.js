import jwt from 'jsonwebtoken'
import { roleEnum, userModel } from '../../DB/models/user.model.js'
import * as DBService from '../../DB/db.service.js'
import { nanoid } from 'nanoid'
import { TokenModel } from '../../DB/models/token.model.js'

export const signatureLevelEnum = { Bearer: 'bearer', System: 'system' }
export const tokenTypeEnum = { access: 'access', refresh: 'refresh' }
export const logoutEnum = {signoutFromAll:'signoutFromAll',signout:'signout',stayLoggedIn:'stayLoggedIn'}

export const generateToken = async ({
    payload,
    secret = process.env.ACCESS_USER_TOKEN_SIGNATURE
    , options = { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN) } } = {}) => {
    return jwt.sign(payload, secret, options)
    
}


export const verifyToken = async ({ token = '', secret= signature.accessSignature }={}) => {
    if (!token || !secret) {
    throw new Error('Missing token or secret for verification')
  }
    return jwt.verify(token , secret)
}

export const getSignatures = async ({ signatureLevel = signatureLevelEnum.Bearer, user = {}, roleEnum = '' }) => {
    let userRole = user.role;
    let role = roleEnum;
    

    const signatures = { accessSignature: undefined, refreshSignature: undefined };


    switch (signatureLevel.toLowerCase()) {
        case signatureLevelEnum.System:
            signatures.accessSignature = process.env.ACCESS_SYSTEM_TOKEN_SIGNATURE;
            signatures.refreshSignature = process.env.REFRESH_SYSTEM_TOKEN_SIGNATURE;
            break;

        default:
            signatures.accessSignature = process.env.ACCESS_USER_TOKEN_SIGNATURE;
            signatures.refreshSignature = process.env.REFRESH_USER_TOKEN_SIGNATURE;
            break;
    }
    //console.log({signatureLevel});
   // console.log('Returning signatures:', signatures);

    return signatures;
};

export const decodedToken = async({next , authorization = '', tokenType=tokenTypeEnum.access } = {}) => {

        
    const [bearer, token] = authorization?.split(' ') || []
    //console.log({bearer, token});

    //console.log(authorization?.split(' '));
   // console.log({ bearer })
                
    if (! bearer || ! token) {
        return next(new Error('missing token parts', { cause: 401 }))
    }
    let signature = await getSignatures({ signatureLevel: bearer })
                
    const secret = tokenType === tokenTypeEnum.refresh? signature.refreshSignature: signature.accessSignature;



    const decoded = await verifyToken({
    token
    , secret 
    })
    //console.log({ decoded });
    if (decoded.jti && await DBService.findOne({model:TokenModel , filter:{jti:decoded.jti} })) {
        return next (new Error('invalid login credentials '))
    }
        
    if (!decoded?._id) {
        return next(new Error('in-valid token', { cause: 400 }))
    }
    const user = await DBService.findById({ model: userModel, id: decoded._id })
    if (!user) {
        return next(new Error('not registered account ', { cause: 404 }))
    }
   // console.log({ user:user.changeCredentialTime?.getTime(), decoded:decoded.iat*1000});
    if (user.changeCredentialTime?.getTime() > decoded.iat * 1000) {
        return next(new Error('invalid login credentials' ,{cause:401}))
    }

        return { user, decoded}
    
}
export const getLoginCredentials = async (user) => {

            let signatures = await getSignatures({
                signatureLevel: user.role == roleEnum.user ? signatureLevelEnum.Bearer : signatureLevelEnum.System
                    
            }) 
            const jwtid = nanoid()
            const access_token = await generateToken({
                payload: { _id: user._id },
                secret: signatures.accessSignature ,
                options: {
                    jwtid,
                    expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN)
                }
        
            })

    
            const refresh_token = await generateToken({
                payload: { _id: user._id },
                secret:signatures.refreshSignature,
                options: {
                    jwtid ,
                    expiresIn:Number(process.env.REFRESH_TOKEN_EXPIRES_IN)
                    
                }
            })
        return { access_token ,refresh_token}
}

export const createRevokeToken = async({req}={}) => {
      await DBService.create({
                model: TokenModel,
                data: [{
                    jti: req.decoded.jti,

                    expiresIn: req.decoded.iat + Number(process.env.REFRESH_TOKEN_EXPIRES_IN)
                    , userId: req.decoded._id
                }]
      })
    return true
}