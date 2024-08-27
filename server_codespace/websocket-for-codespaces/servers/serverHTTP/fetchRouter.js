import Router from 'express'
const router = new Router()
import controller from './fetchController.js'
import {check} from 'express-validator'
import authMiddleWare from './../../middleWare/authMiddleWare.js'
import roleMiddleWare from './../../middleWare/roleMiddleWare.js'

router.get('/users', /*roleMiddleWare(['USER', 'ADMIN']),*/ controller.getUsers)
router.get('/contacts', roleMiddleWare(['USER', 'ADMIN']), controller.getContacts)
router.get('/study-process', roleMiddleWare(['USER', 'ADMIN']), controller.getGitPage)

export default router