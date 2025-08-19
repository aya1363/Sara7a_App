import { Router } from 'express'
import * as authService from './auth.service.js'
import { authentication } from '../../middleware/authentication.middleware.js'
import {validation} from '../../middleware/validation.middleware.js'
import * as validator from './auth.validation.js'


const router = Router({
    caseSensitive: true,
    strict: true
})

router.post('/signup',validation(validator.signup), authService.signup)
router.post('/login', validation(validator.login), authService.login)
router.patch('/send-forgot-password',validation(validator.sendForgotPassword), authService.sendForgotPassword)
router.patch('/verify/send-forgot-password',validation(validator.verifyForgotPasswordOtp), authService.verifyForgotPasswordOtp)
router.patch('/reset-password',validation(validator.resetPassword), authService.resetPassword)

router.patch('/confirm-email', validation(validator.confirmEmail), authService.confirmEmail)
router.patch('/resend-otp', validation(validator.resendOtp),authService.resendConfirmEmailOtp)

router.post('/signup/gmail', validation(validator.signupWithGmail), authService.signupWithGmail)
router.post('/login/gmail', validation(validator.loginWithGmail), authService.loginWithGmail)


export default router