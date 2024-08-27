/**
 * idGroup - id группы созвона
 * nickname - ник пользователя
 */
import Router from 'express'
const router = new Router()
import controller from './chatController.js'

//router.post('/text', controller.textRTC)
//router.post('/video', controller.videoRTC)
//router.post('/socket', /*[checkMiddleWare, roleMiddleWare(['USER', 'ADMIN'])],*/ controller.socketConnect)

router.post('/check-id', controller.checkIdUserUnique)

router.post('/call-group', controller.addCallGroup)
router.get('/call-group/:id', controller.getCallGroup)
router.delete('/call-group/deleteall', controller.deleteAllCallGroup)
router.delete('/call-group/:id', controller.deleteCallGroup)

router.post('/:idGroup/call', controller.addCalls)
router.get('/:idGroup/call', controller.getCalls)    //Не сделан
router.delete('/:idGroup/call', controller.deleteCalls)

router.post('/:idGroup/offer', controller.addOffer)
router.post('/:idGroup/answer', controller.addAnswer)

router.post('/:idGroup/offer-candidates', controller.addOfferCandidate)
router.delete('/:idGroup/offer-candidates', controller.nullOfferCandidate)

router.post('/:idGroup/answer-candidates', controller.addAnswerCandidate)
router.delete('/:idGroup/answer-candidates', controller.nullAnswerCandidate)

export default router