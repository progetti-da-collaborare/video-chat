import React, { useState, useRef, useEffect, useMemo, useCallback , useReducer} from 'react'
import {SOCKET_STATUS_TYPE} from './useWebSocketClient'
import { ErrorFront } from '../../errors/ErrorFront'

/**
 * The function supplies instruments to establish socket connection provided with connect-function
 * @param {*} status Socket connection status
 * @param {*} setStatus Set socket connection status
 * @param  {...any} props
 * @returns
 */

const useConnectionPauseHandler = ({ status, setStatus, setErr }) => {
    const [connectFn, setConnectFn] = useState(null)
    const [disconnectFn, setDisconnectFn] = useState(null)
    const stat = useRef(SOCKET_STATUS_TYPE.DISCONNECTED)   //Connection establishment process status
    const setStatSocket = useRef(null)   //Socket status
    const flag = useRef(null)
    const count = useRef(1)

    //Отключить соединение
    const disconnectCallback = useCallback(() => {
      try {
        if (status !== SOCKET_STATUS_TYPE.DISCONNECTED) {
            setStatus( SOCKET_STATUS_TYPE.DISCONNECTED )
            disconnectFn()
        }
      } catch (e) {
        setErr && setErr(e.message)
        console.log(e.stack)
      }
    }, [status, setStatus, disconnectFn, setErr])

    //Создать соединение
    const connectCallback = useCallback(async () => {
        try {
            if (setStatSocket.current) setStatSocket.current(prev => { stat.current = prev; return prev } )
            if (status !== SOCKET_STATUS_TYPE.DISCONNECTED || stat.current !== SOCKET_STATUS_TYPE.DISCONNECTED ) return
                setStatus( SOCKET_STATUS_TYPE.SUSPENDED )
                stat.current = SOCKET_STATUS_TYPE.SUSPENDED
                let timeoutId = null
                setStatSocket.current = await connectFn()

                const f = async () => {
                    try {
                        count.current = count.current + 1
                        if(count.current > 100) {
                            setStatus( SOCKET_STATUS_TYPE.DISCONNECTED )
                            stat.current = SOCKET_STATUS_TYPE.DISCONNECTED
                            setStatSocket.current && setStatSocket.current( prev => SOCKET_STATUS_TYPE.DISCONNECTED )
                            return null
                        }        
                      
                        setStatSocket.current( prev => {
                            if( prev !== SOCKET_STATUS_TYPE.CONNECTED ) stat.current = SOCKET_STATUS_TYPE.DISCONNECTED
                            else {
                                stat.current = SOCKET_STATUS_TYPE.CONNECTED
                                clearTimeout(timeoutId)
                            }
                            return prev
                        })

                        if( stat.current === SOCKET_STATUS_TYPE.DISCONNECTED ) {
                            stat.current = SOCKET_STATUS_TYPE.SUSPENDED
                            setStatSocket.current = await connectFn()
                        }

                        if( stat.current !== SOCKET_STATUS_TYPE.CONNECTED ) {
                            timeoutId = setTimeout( async () => {await f()}, 5 * 1000)
                            return 
                        }

                        return null
                        //disconnectCallback()
                    } catch(e) {
                        setErr && setErr(e.message)
                    }
                }

                try {
                    if(!connectFn) throw new ErrorFront("Function, establishing socket connection, isn't defined.")
                    timeoutId = setTimeout( async () => {await f()}, 5 * 1000 )
                } catch(e) {
                    setStatus( SOCKET_STATUS_TYPE.DISCONNECTED )
                    setErr && setErr(e.message)
                    timeoutId && clearTimeout(timeoutId)
                }
        } catch(e) {
            setStatus( SOCKET_STATUS_TYPE.DISCONNECTED )
            setErr && setErr(e.message)
        }
    }, [status, setStatus, connectFn, setErr, setStatSocket])

    const registerConnectFunction = useCallback((fn) => {
      setConnectFn(() => fn); // do this to avoid confusing the react dispatch function
    }, [])

    const registerDisconnectFunction = useCallback((fn) => {
      setDisconnectFn(() => fn); // do this to avoid confusing the react dispatch function
    }, [])
  
    return [registerConnectFunction, registerDisconnectFunction, connectCallback, disconnectCallback];
  }

  export {useConnectionPauseHandler}