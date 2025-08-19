import { asyncHandler, successResponse } from "../../utils/response.js";
import * as DBService from '../../DB/db.service.js'
import { roleEnum, userModel } from "../../DB/models/user.model.js";
import { decryptEncryption, generateEnc } from "../../utils/encryption.security.js";
import { createRevokeToken, getLoginCredentials, logoutEnum } from "../../utils/security/token.security.js";
import { compareHash, generateHash } from "../../utils/security/hash.security.js";

import { cloud, deleteFolderByPrefix, deleteResources, destroyFile, uploadFile, uploadFiles } from "../../utils/multer/cloudinary.js";




export const profile = asyncHandler(async (req, res, next) => {
    const user = await DBService.findById({
        model: userModel, id: req.user._id,
        populate:[{path:`messages`}]
       
    })
    
    req.user.phoneNumber= await decryptEncryption({ cipherText:req.user.phoneNumber})
    return  successResponse({res, data:{ user },message:'done'})
})

export const logout = asyncHandler(async (req, res, next) => {
    const { flag } = req.body
     let status= 200
    switch (flag) {
        case logoutEnum.signoutFromAll:
            await DBService.updateOne({
                model: userModel, filter: { _id: req.decoded._id },
                data:
                {$set :{changeCredentialTime: new Date()} },
                options:{new:true , runValidators:true}},

            )
            break;
    
        default:
            await createRevokeToken({req})
            status =201
            break;
    }

    return  successResponse({res, data:{ },status,message:'done'})
})
export const getNewLoginCredentials = asyncHandler(async (req, res, next) => {


    const newCredentials = await getLoginCredentials({ user: req.body })
    
    return  successResponse({res, data:{newCredentials},message:'done'})
})
export const shareProfile = asyncHandler(
    async  (req, res, next) => {
        const { userId } = req.params
        const user = await DBService.findOne({
            model: userModel,
            filter: {
                _id: userId,
                confirmEmail:{$exists:true}

            }
        })
        return user?successResponse({res , data:{user} }): next(new Error('invalid user account',{cause:404}))
    }
)

export const updateBasicInfo = asyncHandler(
    async (req, res, next) => {
        if (req.body.phoneNumber) {
            req.body.phoneNumber = await generateEnc({plainText:req.body.phoneNumber })
        }
        
        const user = await DBService.findOneAndUpdate({
            model: userModel,
            filter: {
                userId: req.user._id,
                confirmEmail:{$exists:true}
            },data:req.body
        })
        return user? successResponse({res ,data:{user}}):next(new error('invalid account ', {cause:404}))
    }
)

export const updatePassword = asyncHandler(async(req, res, next) => {
    const {  password , oldPassword, flag } = req.body

    if (!compareHash({plainText:oldPassword , hashValue:req.user.password})) {
        next (new Error ('in valid old password  ',{cause: 400}))
    }
    if (req.user.oldPasswords?.length) {
            for (const password of req.user.oldPasswords) {
        if (!compareHash({plainText:password , hashValue:password})) {
        next (new Error ('this password is used before  ',{cause: 400}))
    }
    }
    }
    let status = 200
    let updatedData ={}
    switch (flag) {
        case logoutEnum.signoutFromAll:
            updatedData.changeCredentialTime = Date.now()
            break;
        case logoutEnum.signout:
            await  createRevokeToken({req})
            status = 201
            break;
        default:
            break;
    }


    const user = await DBService.findOneAndUpdate({
        model: userModel,
        filter: {
            _id:req.user._id
        },
        data: {
            password: await generateHash({ plainText: password }),
            ...updatedData,
            $push:{oldPasswords: req.user.password}
        }
    })


    return  successResponse({ res, message: 'Password updated successfully' ,data:{user} ,status});
    
})

export const freezeAccount = asyncHandler(
    async (req, res, next) => {
        const { userId } = req.params

        if (userId && req.user.role !== roleEnum.admin) {
            return next (new Error('not authorized account',{cause:404}))
        }
        const user = await DBService.findOneAndUpdate({
            model: userModel,
            filter: {
                _id: userId || req.user._id,
                deletedAt:{$exists:false}
            },
            data: {
                deletedAt: Date.now(),
                deletedBy: req.user._id,
                changeCredentialTime: new Date(),
                  $unset: {
                 restoredAt:1,
                   restoredBy:1
                }
            },
            options: { new: true }
        })
         return user? successResponse({res ,data:{user}}):next(new error('invalid account ', {cause:404}))
        
    }
)

export const restoreAccount = asyncHandler(
    async (req, res, next) => {
        const { userId } = req.params

        const user = await DBService.findOneAndUpdate({
            model: userModel,
            filter: {
                _id: userId ,
                deletedAt: { $exists: true },
                 deletedBy:{$ne:userId}
            },
            data: {
                $unset: {
                    deletedAt: 1,
                    deletedBy:1
                }
               , $exists: {
                   restoredAt: Date.now(),
                   restoredBy:req.user._id
                }
            },
            options: { new: true }
        })
         return user? successResponse({res ,data:{user}}):next(new error('invalid account ', {cause:404}))
        
    }
)


export const hardDeleteAccount = asyncHandler(
    async (req, res, next) => {
        const { userId } = req.params

        const user = await DBService.deleteOne({
            model: userModel,
            filter: {
                _id: userId ,
                deletedAt:{$exists:true}
            }
        })
        if (user?.deletedCount) {
            await deleteFolderByPrefix({prefix:`user/${userId}`})
        }
            return user.deletedCount? successResponse({res ,data:{user}}):next(new Error('invalid account ', {cause:404}))
        
    }
)
export const profileImage = asyncHandler(async (req, res, next) => {
    
    const { public_id, secure_url} = await uploadFile({file:req.file , path :`user/${req.user._id}`})
    const user = await DBService.findOneAndUpdate({
        model: userModel,
        filter: { _id: req.user._id },
        data: {
            picture: { public_id, secure_url}
        }
        ,options:{new:false}
    })
    if (user?.picture?.public_id) {
        await destroyFile({public_id:user.picture.public_id})
    }


    return successResponse({res , data:{user}})
})

export const profileCoverImages = asyncHandler(async (req, res, next) => {
    
const attachments = await uploadFiles({files:req.files , path:`user/${req.user._id}/cover`})

const user = await DBService.findOneAndUpdate({
    model: userModel,
    filter: { _id: req.user._id },
    data: {
    coverImages: attachments
    },
    options: { new: false }
});
    if (user?.coverImages?.length) {
        await deleteResources({public_ids:user.coverImages.map(ele=>ele.public_id)})
    }

return successResponse({ res, data: { user } });

})
