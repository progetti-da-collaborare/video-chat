import React, { useState, useRef, useEffect, useMemo, useCallback , useReducer} from 'react'
import Queue from '../../Queque'
import ErrorChat from '../../ErrorChat'
import {MESSAGE_STATUS} from './useRTC'
import useWebSocket, { SOCKET_STATUS_TYPE } from './useWebSocket'
import useQueue from './useQueue'
import { httpRequest } from '../../stuff/stuff'

//Приходящие и уходящие сообщения ставятся в очередь
//
const useWebSocketClient = ({onMessage, onClose, onOpen, onError, setStatusMsg, statusMsg, setErr}) => {
    const [idMe, setIdMe] = useState(null)
    const [sendQueue, lenSendQueue] = useQueue()  //Sended messages
    const [receiveQueue,lenRecQueue] = useQueue() //Received messages
        const pushRecMessage = useCallback( a => receiveQueue.push(a), [receiveQueue] )
        const pushSendMessage = useCallback( a => sendQueue.push(a), [sendQueue] )
    const [socket, socketStatus, setSocket, setSocketStatus] = useWebSocket( {onMessage: pushRecMessage, onClose, onOpen, onError, setErr} )

    //Сокетное соединение без авторизации
    const connect = useCallback( async (httpServer, name) => {
        try {
            if( socketStatus !== SOCKET_STATUS_TYPE.DISCONNECTED ) 
                return setSocketStatus
            const id = Math.trunc(Math.random()*1000000).toString()
            const resp = await httpRequest("http://" + httpServer + `crt/check-id`, "POST", { idMe: id }, null)
                if(!resp.ok) throw new ErrorChat("Websocket server error")
            setSocket(new WebSocket("ws://" + httpServer + `?id=${id}`) )
            setIdMe(id)
            return setSocketStatus
        }
        catch(e) {
            setErr && setErr(e.message)
            console.log(e)
            return setSocketStatus
        }
    }, [setSocket, setSocketStatus, socketStatus] )

    const disconnect = useCallback(() => {
      try {
          socket && socket.close()
      }
      catch(e) {
          setErr && setErr(e.message)
          console.log(e)
      }
  }, [socket])

    useEffect(() => {
      try {
        if(!receiveQueue.isEmpty() && statusMsg === MESSAGE_STATUS.PROCESSED) {
          try {
            setStatusMsg( MESSAGE_STATUS.PAUSED )
            onMessage(receiveQueue.frontGet())
            receiveQueue.frontPop()
          } catch(e) {
            console.log(e)
          }
        }
      } catch (e) {
        setErr && setErr(e.message)
        console.log(e.stack)
      }
    }, [receiveQueue, lenRecQueue, onMessage, statusMsg, setStatusMsg])

    useEffect(() => {
      try {
        if(!sendQueue.isEmpty() && socketStatus === SOCKET_STATUS_TYPE.CONNECTED) {
          try {
            socket.send(JSON.stringify(sendQueue.frontGet()))
            sendQueue.frontPop()
          } catch(e) {
            console.log(e)
          }
        }
      } catch (e) {
        setErr && setErr(e.message)
        console.log(e.stack)
      }
    }, [sendQueue, lenSendQueue, socket, setSocketStatus, socketStatus])

    return [connect, pushSendMessage, socketStatus, setSocketStatus, disconnect, idMe]
}

export default useWebSocketClient
export {SOCKET_STATUS_TYPE}