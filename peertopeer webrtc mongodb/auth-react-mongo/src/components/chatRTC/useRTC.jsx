import React, { useState, useRef, useEffect, useMemo, useCallback , useReducer} from 'react'
import ReducerWebSocket, {MSG_TYPE} from './ReducerWebSocket'
import ErrorChat from '../../ErrorChat'
import useWebSocketClient, { SOCKET_STATUS_TYPE } from './useWebSocketClient'
import {useConnectionPauseHandler} from './useConnectionPauseHandler'
import dotenv from 'dotenv/config'
import serversNatStun from "./ServersNatStun"
import { channel } from 'process'
import { httpRequest } from '../../stuff/stuff'
import ReducerFrontEnd from './ReducerFrontEnd'
import { WORKFLOWS, MSG_TYPE_F } from './ReducerFrontEnd'

//Статусы сокетного соединения
const REGIME_STATUS = Object.freeze({
    CREATE_CALL: "CREATE_CALL",
    JOIN_CALL: "JOIN_CALL",
    PROCESSED: "PROCESSED",
    STOPPED: "STOPPED"
})

//Статусы приема сообщений из очереди
const MESSAGE_STATUS = Object.freeze({
    PROCESSED: "PROCESSED",
    PAUSED: "PAUSED"
})

/**
 * The hook serves to get RTCPeerConnection[] massive underneath (each member represents poin-to-point connection between user's browsers) with tool kit exposed 
 * to get status of the connection (each hook - one connection/call group, defined by call group id) and handles to establish socket connection and affordable functions to use it
 * @param {MediaStream} localStream - local audio/video source
 * @param {String} userName - user name to expose
 * @returns rtc - data massve to establish RTCPeerConnection. Is applied to RTCPeerConnection objects on receive, so not needed in fact. For tests or future subjects, maybe to restore the connection
 * 
 * connect - connection establishment
 * 
 * disconnect - connection distruction
 * 
 * createGroupCall - create new group call
 * 
 * joinGroupCall - join existing group call
 * 
 * status - connection status
 * 
 * state.idGroupCall - group call id
 */
const useRTC = ( { localStream, httpServer, setText, setErr } ) => {
    //Статусы передачи сообщений в reducer из пула сообщений сокетного клиента
    const [statusMsg, setStatusMsg] = useState(MESSAGE_STATUS.PROCESSED)    //Needed user id from server on socket creation
    //Режим работы зависит от фронтенда. Начать созвон, присоединиться, отключено, в процессе установленного режима
    const [regime, setRegime] = useState(REGIME_STATUS.STOPPED)
    //State без промиса
    const [state, setState] = useState({})

    const onMessage = useCallback(async event => {
        try {
            let msg = JSON.parse(event.data)
            if(!msg.type) throw new ErrorChat("Received socket message doesn't have 'type' field. ")
            let action = {}
            action.type = msg.type
            switch(msg.type){     //Тип сообщения
                case MSG_TYPE.newUserId :   //Сохранить id для доступа к сокетному соединению
                    action.data = {idMe: msg.idMe}
                    dispatch(action)
                break
                case MSG_TYPE.newGroupCall :   //id соответствует экземпляру класса
                    action.data = {idGroupCall: msg.idGroupCall}
                    dispatch(action)
                    //if(regime !== REGIME_STATUS.STOPPED ) setRegime( REGIME_STATUS.STOPPED )
                break
                case MSG_TYPE.newCall :    //Соответствует
                    action.data = {remoteStreamData: msg.remoteStreamData, idGroupCall: msg.idGroupCall}
                    dispatch(action)
                    //const m =  msg.remoteStreamData.map(a => a.idUserOffer)
                    //if(regime !== REGIME_STATUS.STOPPED && m.includes(state.idMe) ) setRegime( REGIME_STATUS.STOPPED )
                break
                case MSG_TYPE.newOffer :
                    action.data = {offer: msg.offer, idGroupCall: msg.idGroupCall}
                    dispatch(action)
                break
                case MSG_TYPE.newAnswer :
                    action.data = {answer: msg.answer, idGroupCall: msg.idGroupCall}
                    dispatch(action)
                break
                case MSG_TYPE.newOfferCandidates :
                    action.data = {offerCandidates: msg.offerCandidates, idGroupCall: msg.idGroupCall}
                    dispatch(action)
                break
                case MSG_TYPE.newAnswerCandidates :
                    action.data = {answerCandidates: msg.answerCandidates, idGroupCall: msg.idGroupCall}
                    dispatch(action)
                break
                default :
                setStatusMsg( MESSAGE_STATUS.PROCESSED )
            }
        } catch(e) {
            setErr && setErr(e.message)
        }
    }, [setErr])

    const onOpen = useCallback(event => {  //Seems not called on socket connection creation
        try {
            console.log("Socket connection is opened")
        } catch(e) {
            setErr && setErr(e.message)
        }
    }, [setErr])

    const onClose = useCallback(event => {
        try {
            console.log("Socket connection is closed")
        } catch(e) {
            setErr && setErr(e.message)
        }
    }, [setErr])

    const onError = useCallback(event => {
        try {
            console.log("Socket connection error")
        } catch(e) {
            setErr && setErr(e.message)
        }
    }, [setErr])


    const [rtc, setRtc] = useState(null)
    const [connectFn, sendMessage, status, setStatus, disconnectFn, idMe] = useWebSocketClient({onMessage, onClose, onOpen, onError, setStatusMsg, statusMsg, setErr})
    const [setConnectFn, setDisconnectFn, connect, disconnect] = useConnectionPauseHandler({status, setStatus, setErr})

    const [dispatchAlias, setDispatchAlias] = useState(null)
    const [fff, dispatch] = useReducer(ReducerWebSocket({srvs: serversNatStun, setText, dispatch: dispatchAlias, setErr}), new Promise(resolve => { resolve({
        idMe: null,     //id для доступа к сокетному соединению
        idGroupCall: null,      //id группового созвона
        localStream: localStream,
        remoteStreamData: [],   //Данные signaling for webrtc из базы данных. Можно использовать для синхронизации с БД
        send: a => sendMessage(a),
        pc: {/*id: {rtc: объект RTCPeerConnection, remoteStream: поток MediaStream для вывода в <video>, channel: канал для обмена сообщениями }*/},   //Объект для организации связи по протоколам webrtc
        title: "Senza titolo",
        name: "John Doe"
    })}))

    const [dispatchAliasW, setDispatchAliasW] = useState(null)
    const [wflows, dispatchW] = useReducer(ReducerFrontEnd({httpServer, connect, dispatch: dispatchAliasW, setErr, params:state}), new Promise(resolve => { resolve({
        workflows: []
    })}))
    
    useEffect( () => {
        try {
            if(!idMe) return
            let action = {}
            action.type = MSG_TYPE.frontendSet
            action.data = {}
            action.data.idMe = idMe
            dispatch(action)
        } catch(e) {
            setErr && setErr(e.message)
        }
    }, [idMe])

    useEffect( () => {
        try {
            setDispatchAlias(() => dispatch)
        } catch(e) {
            setErr && setErr(e.message)
        }
    }, [dispatch])

    useEffect( () => {
        try {
            setDispatchAliasW(() => dispatchW)
        } catch(e) {
            setErr && setErr(e.message)
        }
    }, [dispatchW])

    useEffect( () => {
        (async () => {
            try {
                let res = await fff;
                setState({...state, ...res})
                setStatusMsg( MESSAGE_STATUS.PROCESSED )

                if(res.idGroupCall) {
                    let action = {}
                    action.type = MSG_TYPE_F.CALLGROUP_CREATED
                    action.data = {}
                    dispatchW(action)
                }
            } catch(e) {
                setErr && setErr(e.message)
            }
        })()
    }, [fff])

    useEffect( () => {
        try {
            //if(sendMessage) setPushSendMessage(sendMessage)     //Не работает
            //if(sendMessage) setPushSendMessage(a => sendMessage)
            let action = {}
            action.type = MSG_TYPE.frontendSet
            action.data = {}
            action.data.send = a => sendMessage(a)
            dispatch(action)
        } catch(e) {
            setErr && setErr(e.message)
        }
    }, [sendMessage])

    useEffect( () => {
        try {
            setRtc(state.pc ? Object.keys(state.pc).map( a => {
                return {id: a, stream: state.pc[a].remoteStream, channel: state.pc[a].channel }
            }) : {})
        } catch(e) {
            setErr && setErr(e.message)
        }
    }, [state])

    useEffect( () => {
        try {
            let action = {}
            action.type = MSG_TYPE.frontendSet
            action.data = {}
            action.data.localStream = localStream
            dispatch(action)
        } catch(e) {
            setErr && setErr(e.message)
        }
    }, [localStream])

    useEffect(() => {
        try {
            if(setConnectFn && connectFn) setConnectFn(() => connectFn(httpServer, state.name))
        } catch(e) {
            setErr && setErr(e.message)
        }
    }, [setConnectFn, connectFn, state.name, httpServer])

    useEffect(() => {
        try {
            if(setDisconnectFn && disconnectFn) setDisconnectFn(() => disconnectFn())
        } catch(e) {
            setErr && setErr(e.message)
        }
    }, [setDisconnectFn, disconnectFn])

    //Workflow events to create groupcall
    //Workflow events to join groupcall

    const createGroupCall = useCallback((title, userName) => {
        try {
            if( regime !== REGIME_STATUS.STOPPED ) return

            setRegime( REGIME_STATUS.CREATE_CALL )
            let action = {}
            action.type = MSG_TYPE_F.FRONTENDSET.type
            action.data = {}
            action.data.idMe = null
            action.data.idGroupCall = null
            action.data.remoteStreamData = []
            action.data.pc = {}
            action.data.title = "Senza titolo"
            action.data.name = "John Doe"
            dispatch(action)
        } catch(e) {
            setErr && setErr(e.message)
        }
        //setState({...state, title: title})    //Остальные key остаются?
    }, [regime, setErr])

    const qwe = useRef(0)
    useEffect( () => {
        if(regime !== REGIME_STATUS.CREATE_CALL) return
        if(qwe.current === 0) {
            qwe.current = 1
            let action = {}
            action.type = MSG_TYPE_F.CONNECT.type
            dispatchW(action)
        }
        if(state.idMe && qwe.current === 1) {
            qwe.current = 2
            let action = {}
            action.type = MSG_TYPE_F.CREATE_CALLGROUP.type
            dispatchW(action)
        }
        if(state.idGroupCall && qwe.current === 2) {
            qwe.current = 3
            let action = {}
            action.type = MSG_TYPE_F.CALLGROUP_CREATED.type
            dispatchW(action)
            setRegime( REGIME_STATUS.STOPPED )
            qwe.current = 0
        }
    }, [regime, state])

    const joinGroupCall = useCallback((idGroupCall, userName) => {
        try {
            if( regime !== REGIME_STATUS.STOPPED ) return

            setRegime( REGIME_STATUS.JOIN_CALL )
            let action = {}
            action.type = MSG_TYPE.frontendSet
            action.data = {}
            action.data.idMe = null
            action.data.remoteStreamData = []
            action.data.idGroupCall = idGroupCall
            action.data.pc = {}
            action.data.title = "Senza titolo"
            action.data.name = userName || "John Doe"
            dispatch(action)
        } catch(e) {
            setErr && setErr(e.message)
        }
        //setState({...state, idGroupCall: idGroupCall, name: name})
    }, [regime, setErr])

    useEffect( () => {
        if(regime !== REGIME_STATUS.JOIN_CALL) return
        if(qwe.current === 0) {
            qwe.current = 1
            let action = {}
            action.type = MSG_TYPE_F.CONNECT.type
            dispatchW(action)
        }
        if(state.idMe && qwe.current === 1) {
            qwe.current = 2
            sendMessage({type: MSG_TYPE.newCall, idMe: state.idMe, name: state.name, idGroupCall: state.idGroupCall})
        }
        if(state.remoteStreamData.length > 0 && qwe.current === 2) {
            qwe.current = 3
            setRegime( REGIME_STATUS.STOPPED )
            qwe.current = 0
        }
    }, [regime, state, sendMessage])


//mock
/*
const [rtc, setRtc] = useState(null)
const [status, setStatus] = useState(null)
const [state, setState] = useState({idGroupCall:null})
const connect = () => {}
const disconnect = () => {}
    
const createGroupCall = a => {}
const joinGroupCall = a => {}
    */
//mock

    return [rtc, disconnect, createGroupCall, joinGroupCall, status, state.idGroupCall, state.idMe]
}

export default useRTC
export {MESSAGE_STATUS, REGIME_STATUS}