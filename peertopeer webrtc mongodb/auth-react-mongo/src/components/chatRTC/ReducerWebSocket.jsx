/**
 * state {idMe, idGroupCall, remoteStreamData}
 * action {type, data}
 */
import { useState } from "react"
import ErrorChat from "../../ErrorChat"
//import {SOCKET_STATUS_TYPE} from "./WebSocketClient"

const MSG_TYPE = Object.freeze({
    //События обработать при получении
    frontendSet: "frontendSet", //Set parameters on frontend without server implementation
    addChannel: "addChannel",
    newUserId: "myUserId",
    newGroupCall: "newGroupCall",
    newCall: "newCall",
    newOffer: "newOffer",
    newAnswer: "newAnswer",
    newOfferCandidates: "newOfferCandidates",
    newAnswerCandidates: "newAnswerCandidates",/*
    //События для отправки по сокетному соединению всем
    sendOffer: "sendOffer",
    sendOfferCandidates: "sendOfferCandidates",
    sendAnswer: "sendAnswer",
    sendAnswerCandidates: "sendAnswerCandidates",
    resume: "resume",   //Возобновить отправку*/
})

/* state:
        idMe: null,     //id для доступа к сокетному соединению
        idGroupCall: null,      //id группового созвона
        localStream: localStream,
        remoteStreamData: [],   //Данные signaling for webrtc из базы данных. Можно использовать для синхронизации с БД
        send: pushSendMessage,  
        pc: {id: //{rtc: объект RTCPeerConnection, remoteStream: поток MediaStream для вывода в <video> }//}   //Объект для организации связи по протоколам webrtc
*/

const ReducerWebSocket = ({srvs, setText, dispatch, setErr}) => {

const useReducerWebSocket = async (statePromise, action) => {
try {
    const state = await statePromise
    const servers = srvs
    /*const [delayedMsgRTC, setDelayedMsgRTC] = useState(null)
    useEffect(() => {
        setTimeout(action.pushMessage(delayedMsgRTC), 1000)
    }, [delayedMsgRTC])*/
        //if(!!!action.data) throw new Error(`reducerWebSocket() error - no data - file: ${__dirname} ${__filename}`)
    switch(action.type){     //Тип сообщения
        case MSG_TYPE.frontendSet :   //Сохранить id для доступа к сокетному соединению
            return {...state, ...action.data}
        case MSG_TYPE.addChannel :
            {
                const tmp = {...state}
                tmp.pc[action.data.idRtc].channel = action.data.channel
                return tmp  //{...state, ...action.data}
            }
        case MSG_TYPE.newUserId :   //Сохранить id для доступа к сокетному соединению
            console.log(`socket connect id = ${action.data.idMe}`)
            return {...state,
                idMe: action.data.idMe}
        case MSG_TYPE.newGroupCall :   //id соответствует экземпляру класса
            console.log(`socket new group call id = ${action.data.idGroupCall}`)
            return {...state,
                idGroupCall: action.data.idGroupCall}
        case MSG_TYPE.newCall :    //Соответствует
            console.log(`new calls in group call id = ${state.idGroupCall}`)
            {//Предполагается общий случай, что добавляется массив новых значений для remoteStreamData
                if(!state.localStream) return {...state}
                const ids = state.remoteStreamData.map(a => a._id)  //Уже имеющиеся в state экземпляры
                const remNew = action.data.remoteStreamData.filter(a => !ids.includes(a._id))
                return {...state,
                    //idGroupCall: action.data.idGroupCall,
                    remoteStreamData: [...state.remoteStreamData, ...remNew],
                    pc: await (async () => {
                            const tmp = {...state.pc}
                            const proms = Promise.all(remNew.map(async a => {
                                if(!state.idMe || !a.idUserOffer || !a.idUserAnswer) throw new ErrorChat("Wrong user id")
                                if(state.idMe !== a.idUserOffer && state.idMe !== a.idUserAnswer) {
                                    const hz=9
                                    throw new ErrorChat(`idME:${state.idMe}|userO:${a.idUserOffer}|userA:${a.idUserAnswer}|User id doesn't correspond to user offer/answer id`)
                                }
                                const p = new RTCPeerConnection(servers)
                                let channel = null
                                const remoteStream = new MediaStream()
                                // Pull tracks from remote stream, add to video stream
                                p.ontrack = event => {
                                    event.streams[0].getTracks().forEach(track => {
                                        remoteStream.addTrack(track)
                                    })
                                }

                                // Push tracks from local stream to peer connection
                                state.localStream.getTracks().forEach((track) => {
                                    p.addTrack(track, state.localStream)
                                })

                                    if(state.idMe === a.idUserOffer) {  //По умолчанию так и есть при создании новых пар соединений
                                        channel = p.createDataChannel("datachannel")
                                        channel.onopen = (event) => {
                                            //channel.send("Hi you!")
                                        }
                                        channel.onmessage = (event) => {
                                            //console.log("offer:" + event.data)
                                            setText(event.data)
                                        }

                                        // Get candidates for caller, send to db
                                        p.onicecandidate = event => {
                                            if(event.candidate) { /*
                                                const s = event.candidate.toJSON();
                                                const s1 = s.sdpMLineIndex;
                                                const s2 = s.sdpMid;
                                                (s1 !== 0 || s2 !== "0") && */ event.candidate && state.send({
                                                    type: MSG_TYPE.newOfferCandidates,
                                                    idMe: state.idMe,
                                                    idFriend: a.idUserAnswer,
                                                    offerCandidates: [event.candidate.toJSON()],
                                                    idGroupCall: state.idGroupCall});
                                            }
                                        };

                                        // Create and send offer to db for signaling
                                        const offerDescription = await p.createOffer()
                                        await p.setLocalDescription(offerDescription)

                                        const offer = {
                                            sdp: offerDescription.sdp,
                                            type: offerDescription.type,
                                        }

                                        state.send({
                                            type: MSG_TYPE.newOffer,
                                            idMe: state.idMe,
                                            idFriend: a.idUserAnswer,
                                            offer: offer,
                                            idGroupCall: state.idGroupCall
                                        })
                                    } else {
                                        p.ondatachannel = (event) => {
                                            const channel = event.channel
                                            channel.onopen = (event) => {
                                                //channel.send("Hi back!")
                                            }
                                            channel.onmessage = (event) => {
                                                //console.log("answer:" + event.data)
                                                setText(event.data)
                                            }

                                            let action = {}
                                            action.type = MSG_TYPE.addChannel
                                            action.data = {}
                                            action.data.idRtc = a._id
                                            action.data.channel = channel
                                            dispatch && dispatch(action)
                                        }

                                        p.onicecandidate = event => {
                                            event.candidate && state.send({
                                                type: MSG_TYPE.newAnswerCandidates,
                                                idMe: a.idUserOffer,
                                                idFriend: a.idUserAnswer, //state.idMe,
                                                answerCandidates: [event.candidate.toJSON()],
                                                idGroupCall: state.idGroupCall});
                                        };

                                    }
                                tmp[a._id] = {rtc: p, remoteStream: remoteStream, channel: channel}
                            }))
                            await proms
                        return tmp
                    })()}
            }//{...state.pc, new RTCPeerConnection(action.data.servers)}}
        case MSG_TYPE.newOffer :    //Здесь id уже не проверяются - только в бд. Т.е. здесь или offer или answer
            console.log(`new offer in group call id = ${state.idGroupCall}`)
            {
                const remNew = await Promise.all(state.remoteStreamData.map( async a => {
                    await Promise.all(action.data.offer.map(async b => {
                        if(b.idUserOffer === state.idMe && b.idUserAnswer === a.idUserAnswer) {  //Да, по идее в newCall offer создается, и можно там же и занести значение
                            a.offer = b.offer
                            return {...a, offer: b.offer}   //Return value isn't used
                        } else if ( b.idUserOffer === a.idUserOffer && b.idUserAnswer === state.idMe) { //a.idUserAnswer === state.idMe
                            await state.pc[a._id].rtc.setRemoteDescription(new RTCSessionDescription(b.offer))
                            const answerDescription = await state.pc[a._id].rtc.createAnswer()
                            await state.pc[a._id].rtc.setLocalDescription(answerDescription)
                            const answer = {
                                type: answerDescription.type,
                                sdp: answerDescription.sdp,
                            }
                            state.send({
                                type: MSG_TYPE.newAnswer,
                                idMe: b.idUserOffer,   //offer
                                idFriend: b.idUserAnswer,   //answer
                                answer: answer,
                                idGroupCall: state.idGroupCall
                            })
                            return a    //Return value isn't used
                        }
                    })) /*
                    if(a.idUserOffer === state.idMe)
                        return {...a, offer: action.data.offer}
                    else return a */
                    return {...a}
                }))
                return {...state,
                    remoteStreamData: remNew}
            }
        case MSG_TYPE.newAnswer :
            console.log(`new answer in group call id = ${state.idGroupCall}`)
            {
                const remNew = await Promise.all(state.remoteStreamData.map( async a => {
                    await Promise.all(action.data.answer.map(async b => {
                        if(b.idUserAnswer === state.idMe && b.idUserOffer === a.idUserOffer) {
                            a.answer = b.answer
                            return {...a, answer: b.answer}
                        } else if(b.idUserAnswer === a.idUserAnswer && b.idUserOffer === state.idMe) {
                            const answerDescription = new RTCSessionDescription(b.answer)
                            await state.pc[a._id].rtc.setRemoteDescription(answerDescription)
                            return a
                        }
                    })) /*
                    if(a.idUserAnswer === state.idMe)
                        return {...a, answer: action.data.answer}
                    else
                        return a */
                    return {...a}
                }))
                return {...state,
                    remoteStreamData: remNew}
            }
        case MSG_TYPE.newOfferCandidates :
            console.log(`new offerCandidates in group call id = ${state.idGroupCall}`)
            {
                const remNew = await Promise.all(state.remoteStreamData.map( async a => {
                    await Promise.all(action.data.offerCandidates.map(async b => {
                        if(b.idUserOffer === state.idMe && b.idUserAnswer === a.idUserAnswer /*action.data.idUserOffer*/) {
                            //a.offerCandidates = [...a.offerCandidates, b.offerCandidate]
                            return {...a, offerCandidates: [...a.offerCandidates, b.offerCandidate]}
                            //return {...a, offerCandidates: [...a.offerCandidates, ...action.data.offerCandidates]}
                        } else if(b.idUserOffer === a.idUserOffer && b.idUserAnswer === state.idMe) {
                            // Listen for remote ICE candidates
                            //action.data.offerCandidates.forEach( p => {
                                try{
                                    const candidate = new RTCIceCandidate(b.offerCandidate);
                                    await state.pc[a._id].rtc.addIceCandidate(candidate);
                                } catch(e) {
                                    console.log(e.message)
                                }
                           // })
                            return {...a}
                        }
                    })) /*
                    if(a.idUserOffer === state.idMe)
                        return {...a, offerCandidates: [...a.offerCandidates, ...action.data.offerCandidates]}
                    else
                        return a */
                    return {...a}
                }))
                return {...state,
                    remoteStreamData: remNew}
            }
        case MSG_TYPE.newAnswerCandidates :
            console.log(`new answerCandidates in group call id = ${state.idGroupCall}`)
            {
                const remNew = await Promise.all(state.remoteStreamData.map( async a => {
                    await Promise.all(action.data.answerCandidates.map(async b => {
                        if(b.idUserAnswer === state.idMe && b.idUserOffer === a.idUserOffer) {
                            //a.answerCandidates = [...a.answerCandidates, b.answerCandidate]
                            return {...a, answerCandidates: [...a.answerCandidates, b.answerCandidate]}
                            //return {...a, answerCandidates: [...a.answerCandidates, ...action.data.answerCandidates]}
                        } else if(b.idUserAnswer === a.idUserAnswer && b.idUserOffer === state.idMe) {
                            // Listen for remote ICE candidates
                            //action.data.answerCandidates.forEach( p => {
                                try{
                                    const candidate = new RTCIceCandidate(b.answerCandidate);
                                    await state.pc[a._id].rtc.addIceCandidate(candidate);
                                } catch(e) {
                                    console.log(e.message)
                                }
                            //})
                            return a
                        } /*
                        if(a.idUserAnswer === state.idMe)
                            return {...a, answerCandidates: [...a.answerCandidates, ...action.data.answerCandidates]}
                        else
                            return a */
                    }))
                    return {...a}
                }))
                return {...state,
                    remoteStreamData: remNew}
            }/*
        case "SOCKET_STATUS_TYPE" :
            switch(action.status) {
                case SOCKET_STATUS_TYPE.CONNECTED :
                    return {...state, status: SOCKET_STATUS_TYPE.CONNECTED}
                case SOCKET_STATUS_TYPE.DISCONNECTED :
                    return {...state, status: SOCKET_STATUS_TYPE.DISCONNECTED}
                case SOCKET_STATUS_TYPE.SUSPENDED :
                    return {...state, status: SOCKET_STATUS_TYPE.SUSPENDED}
                default:
                    throw new ErrorChat("SOCKET_STATUS_TYPE message in reducer not defined")
            }*/
        default :   //state не меняется
                return {...state}
    }

//    setTimeout(() => return tmp, )
} catch (e) {
    setErr && setErr(e.message)
    console.log(e.stack)
}

}
return useReducerWebSocket
}

export default ReducerWebSocket
export {MSG_TYPE}