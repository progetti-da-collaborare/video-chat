import { useEffect, useState } from "react";

//Статусы сокетного соединения
const SOCKET_STATUS_TYPE = Object.freeze({
    CONNECTED: "CONNECTED",   //Подключено
    DISCONNECTED: "DISCONNECTED",    //Отключено
    SUSPENDED: "SUSPENDED",     //Статус не определен, непредвиденное отключение - попробовать переподключиться
    ERROR: "ERROR",     //Ошибка
})

const useWebSocket = ({onMessage, onClose, onOpen, onError, setErr}) => {
    const [status, setStatus] = useState( SOCKET_STATUS_TYPE.DISCONNECTED )
    const [socket, setSocket] = useState( { readyState: -1 } )

    useEffect(() => {
        if (socket.readyState < 0) return
        setStatus(SOCKET_STATUS_TYPE.SUSPENDED)
    }, [socket])

    useEffect(() => {
        try {
            if (socket.readyState < 0) return
            const op = e => {
                setStatus( SOCKET_STATUS_TYPE.CONNECTED )
                onOpen(e)
                console.log("-------------opened")
            }
            socket.addEventListener('open', op )
            return () => socket.removeEventListener('open', op )
        } catch (e) {
            setErr && setErr(e.message)
            console.log(e.stack)
        }
    }, [socket, onOpen])
    
    useEffect(() => {
        try {
            if (socket.readyState < 0) return
            const cl = e => {
                setStatus( SOCKET_STATUS_TYPE.DISCONNECTED )
                onClose(e)
                console.log("-------------closed")
                setSocket({ readyState: -1 })
            }
            socket.addEventListener('close', cl)
            return () => socket.removeEventListener('close', cl)
        } catch (e) {
            setErr && setErr(e.message)
            console.log(e.stack)
        }
    }, [socket, onClose])

    useEffect(() => {
        try {
            if (socket.readyState < 0) return
            const cl = e => {
                setStatus( SOCKET_STATUS_TYPE.ERROR )
                onError(e)
            }
            socket.addEventListener('error', cl);
            return () => socket.removeEventListener('error', cl)
        } catch (e) {
            setErr && setErr(e.message)
            console.log(e.stack)
        }
    }, [socket, onError])

    useEffect(() => {
        try {
            if (socket.readyState < 0) return
            const cl = e => {
                onMessage(e)
                console.log("-----msg")
            }
            socket.addEventListener('message', cl);
            return () => socket.removeEventListener('message', cl)
        } catch (e) {
            setErr && setErr(e.message)
            console.log(e.stack)
        }
    }, [socket, onMessage])

    return [socket, status, setSocket, setStatus]
}

export default useWebSocket
export {SOCKET_STATUS_TYPE}