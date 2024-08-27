import Router from 'express'
const router = new Router()
import controller from './authController.js'
import {check} from 'express-validator'
import roleMiddleWare from '../../middleWare/roleMiddleWare.js'

router.post('/registration', [
   // roleMiddleWare("SUPER"),
    check("username", "Имя пользователя не может быть пустым").notEmpty(),
    check("password", "Пароль должен быть больше 4 и меньше 18 символов").isLength({min:4, max:18})
], controller.registration)
router.post('/login', controller.loginNicknameEmail)

export default router