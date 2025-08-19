import { Router } from 'express'
import * as userService from './user.service.js'
import { auth, authentication} from '../../middleware/authentication.middleware.js'
import { tokenTypeEnum } from '../../utils/security/token.security.js'
import * as validators from './user.validation.js'
import { endPoint } from './user.authorization.js'
import { validation } from '../../middleware/validation.middleware.js'
import { fileValidation, localFileUpload } from '../../utils/multer/local.multer.js'
import { cloudFileUpload } from '../../utils/multer/cloud.multer.js'

const router = Router({
    caseSensitive: true,
    strict:true
})
router.patch('/profile-image', authentication(),
    cloudFileUpload({ validation: fileValidation.image }).single('image'),
    validation(validators.profileImage),
    userService.profileImage)

router.patch(
  "/profile-cover-images",
  authentication(),
  cloudFileUpload({
    validation: [
        ...fileValidation.image,
        fileValidation.document[0]
    ],
  }).array('images', 2),
   validation(validators.coverImage),
  userService.profileCoverImages
)



router.get('/refresh-token',
    authentication({ tokenType: tokenTypeEnum.refresh }),
    userService.getNewLoginCredentials)

router.patch('/update-basic-info'
    , authentication(),
    validation(validators.updateBasicInfo),
    userService.updateBasicInfo)

router.patch('/', authentication(),
    validation(validators.updatePassword),
    userService.updatePassword)

router.post('/logout',
    authentication(),
    userService.logout)

router.get('/', authentication(),
    validation(validators.logout),
    userService.profile)

router.delete('/:userId'
    , auth({ accessRoles: endPoint.hardDeleteAccount }),
    validation(validators.hardDeleteAccount), userService.hardDeleteAccount)

router.patch('/:userId',
    auth({ accessRoles: endPoint.restoreAccount }),
    validation(validators.restoreAccount),
    userService.restoreAccount)

router.delete('/{:userId}', authentication(),
    validation(validators.freezeAccount),
    userService.freezeAccount)

router.get('/:userId',
    validation(validators.shareProfile),
    userService.shareProfile)


export default router
