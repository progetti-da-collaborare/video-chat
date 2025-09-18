/**
 * Обработка ввода пользователя по сокетному соединению и отправка запроса на сервер http
 * 
 * Запрос от пользователя через сокетное соединение - отправка http запроса для работы с БД
 * Можно получить ответ в ответе по http, НО!!!
 * При добавлении пользователя в созвон создаются парные подключения ко всем пользователям созвона - нужно сообщить всем пользователям, а запрос по http возвращается добавившему
 * Поэтому обработка http запроса происходит путем мониторинга БД отдельно
 * В принципе можно предусмотреть и обработку здесь, но http запрос должен возвращать тогда id всех пользователей и нужно обеспечить доступ к БД
 */
import axios from 'axios'
import dotenv from 'dotenv/config'
import usersDB from './usersDB.js'

class UserWatch {
    //От пользователя
    //Для доступа к БД используются сервис контроллеров chatController
    static #arrayBufferToString = (buffer) => {
        const decoder = new TextDecoder("utf-8");
        return decoder.decode(new Uint8Array(buffer));
    }

    static #messageToJSON = (message) => {
        return JSON.parse(UserWatch.#arrayBufferToString(message.toJSON().data))
    }

    async onGetUserMessage(message) {
        try {
            const hz = UserWatch.#messageToJSON(message)
            console.log("-----onGetUserMessage")
            console.log(JSON.stringify(hz))
            const {
                idMe, idFriend, token, type, idGroupCall, 
                offer, answer, offerCandidates, answerCandidates, title} = UserWatch.#messageToJSON(message)
            //const urlBase = `${process.env.URL_APP_SERVER}/crt/`;
            const urlBase = `/crt/`;
            let url, data, ws, req = "POST"
            let headers = {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                "Content-Type": "application/json"
            }

            switch(type) {

                case "ping" : //Вернуть обратно
                ws = await usersDB.getSocketConnectionById(idMe)
                    if(!ws.ws) throw new Error(`WebSocket connection not established for user id=${idMe}`)
                        ws.ws.send(JSON.stringify({
                                   idMe: idMe, type: "ping"}))
                return

                case "done" : //Вернуть обратно
                ws = await usersDB.getSocketConnectionById(idMe)
                    if(!ws.ws) throw new Error(`WebSocket connection not established for user id=${idMe}`)
                        ws.ws.send(JSON.stringify({
                                    idMe: idMe, type: "done"}))
                return

                case "newGroupCall" : //Создание пустого созвона
                    url = urlBase + `call-group`
                    data = {idMe: idMe, title: title}
                break

                case "newCall" : //Пользователь делает запрос на участие в созвоне, в ответ приходит сгенерированный idMe
                    url = urlBase + `${idGroupCall}/call`
                    data = {idMe: idMe}
                break

                case "newOffer" : //Пользователь отправляет sdp offer
                    url = urlBase + `${idGroupCall}/offer`
                    data = {
                        idMe: idMe,
                        idFriend: idFriend,
                        offer: offer
                    }
                break

                case "newAnswer" : //
                    url = urlBase + `${idGroupCall}/answer`
                    data = {
                        idMe: idMe,
                        idFriend: idFriend,
                        answer: answer
                    }
                break

                case "newOfferCandidates" : //Пользователь делает запрос на участие в созвоне
                    url = urlBase + `${idGroupCall}/offer-candidates`
                    data = {
                        idMe: idMe,
                        idFriend: idFriend,
                        offerCandidates: offerCandidates
                    }
                break

                case "newAnswerCandidates" : //
                    url = urlBase + `${idGroupCall}/answer-candidates`
                    data = {
                        idMe: idMe,
                        idFriend: idFriend,
                        answerCandidates: answerCandidates
                    }
                break

                default:
                    throw new Error("Тип запроса неверный, задайте параметр 'type'")
            }

            console.log("fetch stuff")
            console.log("url:" + JSON.stringify(url))
            console.log("method:" + JSON.stringify(req))
            console.log("body:" + JSON.stringify(data))
            console.log("headers:" + JSON.stringify(headers))

            fetch( url, {
                    method: req,
                    body: JSON.stringify(data),
                    headers: headers
                })

            //await axios.post(url, data, { headers })
            //setTimeout(() => {}, 5)
            ws = await usersDB.getSocketConnectionById(idMe)
                    if(!ws.ws) throw new Error(`WebSocket connection not established for user id=${idMe}`)
                        ws.ws.send(JSON.stringify({
                                   idMe: idMe, type: "ping"}))
        } catch(e) {
            console.log(`Error onGetUserMessage message: ${e.message}`)
            return {error: `Error onGetUserMessage, message: ${e.message}`}
        }
    }

    //Из БД пользователю через сокетное соединение
    async onGetBDSnapShot(snapshot) {
        try {
            console.log("-----onGetBDSnapShot")
            let proms
            //Рассматриваются только updatedFields - удаленные поля отслеживаются только для полей первого уровня,
            //удаление вложенных рассматривается как обновление
                const p = snapshot.operationType;
                //Добавлен созвон авторизованным пользователем
                if(p == "insert") {
                    const idNewGroupCall = snapshot.documentKey._id.toString();
                    const idU = snapshot.fullDocument.callGroup[0].idUser
                    const ws = await usersDB.getSocketConnectionById(idU)
                    //Считаем, что можно создать только пустой созвон - все данные добавляются позже
                    //return {type: "newGroupCall", id: idNewGroupCall}
                    if(!ws.ws) throw new Error(`WebSocket connection not established for user id=${idU}`)
                        ws.ws.send(JSON.stringify({
                                    type: "newGroupCall", 
                                    idGroupCall: idNewGroupCall}))
                }
    
                //snapshot.operationType == update - заполнение созвона данными
                const upd = snapshot?.updateDescription?.updatedFields;
                if(!upd) return

                //Элементы с индексом M как массивы, остальные как набор объектов - элементов массивов
                const addNewUserM = (Object.keys(upd)).filter(a => {return (a.match(/^callGroup$/g))}).reduce((prev, cur, ind) => [...prev, ...upd[cur]], [])
                const addPairConnectionsM = (Object.keys(upd)).filter(a => {return (a.match(/^rtc$/g))}).reduce((prev, cur, ind) => [...prev, ...upd[cur]], [])
                const addCandidateOffersM = (Object.keys(upd)).filter(a => {return (a.match(/^rtc\.\d+\.offerCandidates$/g))}).reduce((prev, cur, ind) => [...prev, ...upd[cur]], [])
                const addCandidateAnswersM = (Object.keys(upd)).filter(a => {return (a.match(/^rtc\.\d+\.answerCandidates$/g))}).reduce((prev, cur, ind) => [...prev, ...upd[cur]], [])

                let check = {
                    idCallGroup: snapshot.fullDocument._id.toString(),
                    //Добавляется новый пользователь в группу созвона
                    //addNewUser: (Object.keys(upd)).filter(a => {return (a.match(/^callGroup(\.\d+)?$/g))}).map(a => upd[a]),
                    addNewUser: [...addNewUserM, ...(Object.keys(upd)).filter(a => {return (a.match(/^callGroup\.\d+$/g))}).map(a => upd[a])],
                    addPairConnections: [...addPairConnectionsM, ...(Object.keys(upd)).filter(a => {return (a.match(/^rtc\.\d+$/g))}).map(a => upd[a])],
                    //Добавляются данные по парному соединению по webRTC
                    addCandidateOffers: [...addCandidateOffersM, ...(Object.keys(upd)).filter(a => {return (a.match(/^rtc\.\d+\.offerCandidates\.\d+$/g))}).map(a => upd[a])],
                    addCandidateAnswers: [...addCandidateAnswersM, ...(Object.keys(upd)).filter(a => {return (a.match(/^rtc\.\d+\.answerCandidates\.\d+$/g))}).map(a => upd[a])],
                    addOffer: (Object.keys(upd)).filter(a => {return (a.match(/^rtc\.\d+\.offer$/g))}).map(a => upd[a]),
                    addAnswer: (Object.keys(upd)).filter(a => {return (a.match(/^rtc\.\d+\.answer$/g))}).map(a => upd[a])
                }

                //Сообщить о новом подключении к созвону - на фронтенде создать еще окно для приема видео/аудио
                //Отправляется массив id всех пользователей
                /*
                proms = Promise.all(check.addNewUser.map(async a => {
                    const wsA = await usersDB.getSocketConnectionById(a)
                        if(!wsA.ws) throw new Error(`WebSocket connection not established for user id=${a}`)
                    wsA.ws.send(JSON.stringify({
                                idGroupCall: check.idCallGroup,
                                type: "newCall",
                                calls: check.addNewUser}))
                }))
                await proms
                */
                /*
                proms = Promise.all(check.addPairConnections.map(async a => {
                    const y1 = a
                    const y2 = a.idUserAnswer
                    const wsA = await usersDB.getSocketConnectionById(a.idUserAnswer)
                        if(!wsA.ws) throw new Error(`WebSocket connection not established for user id=${a.idUserAnswer}`)
                    wsA.ws.send(JSON.stringify({
                                idGroupCall: check.idCallGroup,
                                type: "newCall",
                                rtc: a}))
                }))
                await proms
                */
               //offer/answer/candidates возвращаем в массивах
               //type: "newCall" - создание нового подключения-юзера, на фронтенде появляется новый видеоэкран/собеседник
                let userIds = check.addPairConnections.reduce((prev, cur, ind) => {return [...prev, ...prev.includes(cur.idUserAnswer) ? [] : [cur.idUserAnswer]]}, [])
                userIds = check.addPairConnections.reduce((prev, cur, ind) => {return [...prev, ...prev.includes(cur.idUserOffer) ? [] : [cur.idUserOffer]]}, userIds)
                proms = Promise.all(userIds.map(async a => {
                    const wsA = await usersDB.getSocketConnectionById(a)
                        if(!wsA.ws) throw new Error(`WebSocket connection not established for user id=${a.idUserAnswer}`)
                    wsA.ws.send(JSON.stringify({
                                idGroupCall: check.idCallGroup,
                                type: "newCall",
                                remoteStreamData: check.addPairConnections.sort(b => a === b.idUserOffer || a === b.idUserAnswer)}))
                }))
                await proms


                //Для offer/answerCandidates незачем определять id rtc - в useReducer данные вставляются по id пользователя
                let t = {}
                proms = Promise.all(check.addCandidateOffers.map(async a => {
                    for(let i = 0; i < snapshot.fullDocument.rtc.length; ++i) {
                        const r = snapshot.fullDocument.rtc[i]
                        const d = r.offerCandidates.find( b => b._id.toString() == a._id.toString())
                        if(d) { 
                            t[r.idUserOffer] = [...(t[r.idUserOffer] ? t[r.idUserOffer] : []), {idUserOffer: r.idUserOffer, idUserAnswer: r.idUserAnswer, idRTC: r._id.toString(), offerCandidate: a}]
                            t[r.idUserAnswer] = [...(t[r.idUserAnswer] ? t[r.idUserAnswer] : []), {idUserOffer: r.idUserOffer, idUserAnswer: r.idUserAnswer, idRTC: r._id.toString(), offerCandidate: a}]
                            return
                        }
                    }}))
                await proms
                    proms = Promise.all(Object.keys(t).map(async a => {
                        const wsA = await usersDB.getSocketConnectionById(a)
                            if(!wsA.ws) throw new Error(`WebSocket connection not established for user id=${a}`)
                        wsA.ws.send(JSON.stringify({
                                    idGroupCall: check.idCallGroup, 
                                    //idRTC: idRTC, //Индекс объекта пары idOffer-idAnswer для key на фронтенде
                                    type: "newOfferCandidates",
                                    offerCandidates: t[a]}))
                    }))
                    await proms
                

                t = {}
                proms = Promise.all(check.addCandidateAnswers.map(async a => {
                    for(let i = 0; i < snapshot.fullDocument.rtc.length; ++i) {
                        const r = snapshot.fullDocument.rtc[i]
                        const d = r.answerCandidates.find( b => b._id.toString() == a._id.toString())
                        if(d) { 
                            t[r.idUserOffer] = [...(t[r.idUserOffer] ? t[r.idUserOffer] : []), {idUserOffer: r.idUserOffer, idUserAnswer: r.idUserAnswer, idRTC: r._id.toString(), answerCandidate: a}]
                            t[r.idUserAnswer] = [...(t[r.idUserAnswer] ? t[r.idUserAnswer] : []), {idUserOffer: r.idUserOffer, idUserAnswer: r.idUserAnswer, idRTC: r._id.toString(), answerCandidate: a}]
                            return
                        }
                    }}))
                await proms
                    proms = Promise.all(Object.keys(t).map(async a => {
                        const wsA = await usersDB.getSocketConnectionById(a)
                            if(!wsA.ws) throw new Error(`WebSocket connection not established for user id=${a}`)
                        wsA.ws.send(JSON.stringify({
                                    idGroupCall: check.idCallGroup, 
                                    //idRTC: idRTC, //Индекс объекта пары idOffer-idAnswer для key на фронтенде
                                    type: "newAnswerCandidates",
                                    answerCandidates: t[a]}))
                    }))
                    await proms


                t = {}
                proms = Promise.all(check.addOffer.map(async a => {
                    for(let i = 0; i < snapshot.fullDocument.rtc.length; ++i) {
                        const r = snapshot.fullDocument.rtc[i]
                        const d = r.offer._id.toString() == a._id.toString()
                        if(d) { 
                            t[r.idUserOffer] = [...(t[r.idUserOffer] ? t[r.idUserOffer] : []), {idUserOffer: r.idUserOffer, idUserAnswer: r.idUserAnswer, idRTC: r._id.toString(), offer: a}]
                            t[r.idUserAnswer] = [...(t[r.idUserAnswer] ? t[r.idUserAnswer] : []), {idUserOffer: r.idUserOffer, idUserAnswer: r.idUserAnswer, idRTC: r._id.toString(), offer: a}]
                            return
                        }
                    }}))
                await proms
                    proms = Promise.all(Object.keys(t).map(async a => {
                        const wsA = await usersDB.getSocketConnectionById(a)
                            if(!wsA.ws) throw new Error(`WebSocket connection not established for user id=${a}`)
                        wsA.ws.send(JSON.stringify({
                                    idGroupCall: check.idCallGroup, 
                                    //idRTC: idRTC, //Индекс объекта пары idOffer-idAnswer для key на фронтенде
                                    type: "newOffer",
                                    offer: t[a]}))
                    }))
                    await proms


                t = {}
                proms = Promise.all(check.addAnswer.map(async a => {
                    for(let i = 0; i < snapshot.fullDocument.rtc.length; ++i) {
                        const r = snapshot.fullDocument.rtc[i]
                        const d = r.answer._id.toString() == a._id.toString()
                        if(d) { 
                            t[r.idUserOffer] = [...(t[r.idUserOffer] ? t[r.idUserOffer] : []), {idUserOffer: r.idUserOffer, idUserAnswer: r.idUserAnswer, idRTC: r._id.toString(), answer: a}]
                            t[r.idUserAnswer] = [...(t[r.idUserAnswer] ? t[r.idUserAnswer] : []), {idUserOffer: r.idUserOffer, idUserAnswer: r.idUserAnswer, idRTC: r._id.toString(), answer: a}]
                            return
                        }
                    }}))
                await proms
                    proms = Promise.all(Object.keys(t).map(async a => {
                        const wsA = await usersDB.getSocketConnectionById(a)
                            if(!wsA.ws) throw new Error(`WebSocket connection not established for user id=${a}`)
                        wsA.ws.send(JSON.stringify({
                                    idGroupCall: check.idCallGroup, 
                                    //idRTC: idRTC, //Индекс объекта пары idOffer-idAnswer для key на фронтенде
                                    type: "newAnswer",
                                    answer: t[a]}))
                    }))
                    await proms

                console.log(snapshot);
                return check
            } catch(e) {
                console.log(e)
            }
    }

}

const userWatch = new UserWatch
export default userWatch