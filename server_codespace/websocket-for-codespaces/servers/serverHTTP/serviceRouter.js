import Router from 'express'
const router = new Router()
import controller from './serviceController.js'
import roleMiddleWare from './../../middleWare/roleMiddleWare.js'

router.get('/check-token', roleMiddleWare(['USER', 'ADMIN']), 
    (req, res) => res.status(200).json({message: "Пользователь зарегистрирован"}))

export default router