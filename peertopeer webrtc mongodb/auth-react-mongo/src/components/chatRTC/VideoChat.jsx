import React, { useState, useRef, useEffect, useMemo, useCallback , useReducer, useId} from 'react';
//import {authController} from '../../mongodb/authController';  //doesn't function in frontend
//import {pushFile, getGitPage} from '../../githubfun/github';
//const authController = require('../../mongodb/authController');  //doesn't function in frontend
import Video from './Video'
import useRTC from './useRTC'
import {SOCKET_STATUS_TYPE} from "./useWebSocketClient"
import Selector from './Selector'
import { Offcanvas } from 'bootstrap'
import 'bootstrap/dist/css/bootstrap.css'
    
    const VideoChat = ({httpServer}) => {
        const [error, setError] = useState("")
        const [localStream, setLocalStream] = useState(null)
        const [text, setText] = useState("")
        const [msg, setMsg] = useState("")
        const [remoteStreamsData, closeSocketConnection, createGroupCall, joinGroupCall, status, idGroup, idMe] = useRTC({localStream, httpServer, setText, setErr:setError})
        const [deviceGroupId, setDeviceGroupId] = useState(null)
        const [devices, setDevices] = useState([])
        const [exMyVideo, setExMyVideo] = useState(false)
        const [exFrVideo, setExFrVideo] = useState(false)
        const [isTextChatVisible, setIsTextChatVisible] = useState(false)
        const [name, setName] = useState(null)
        const [title, setTitle] = useState(null)
        const [idJoin, setIdJoin] = useState("")

    const sendText = useCallback(txt => {
        try {
            remoteStreamsData.forEach( a => {
                a.channel.send(txt || msg)
            })
        } catch (e) {
            setError && setError(e)
            console.log(e.stack)
        }
    }, [remoteStreamsData, msg, setError])

useEffect(() => {
    try {
        const ff = async () => {
            try {
                await navigator.mediaDevices.getUserMedia({video: !exMyVideo, audio: true}).catch( e => { //Для запроса разрешения
                    console.log(e.message)
                })
                setDevices( await navigator.mediaDevices.enumerateDevices() )
            } catch (e) {
                setError && setError(e)
                console.log(e.stack)
            }
        }
        ff() 
    } catch (e) {
        setError && setError(e)
        console.log(e.stack)
}
}, [exMyVideo] )

useEffect(() => {
    try {
        const onbefore = e => {
            console.log("add")
            sendText(`User ${idMe} has left the call-group.`)
        }
        
        window.addEventListener("beforeunload", onbefore)
        return () => window.removeEventListener("beforeunload", onbefore)
    } catch (e) {
        setError && setError(e)
        console.log(e.stack)
    }
}, [idMe, sendText] )

        const startLocalVideo = useCallback(async () => {
            try{
                setError("")
                //const group_id = process.env.REACT_APP_DEVICE_LABEL ? devices.find(a => a.label.includes(process.env.REACT_APP_DEVICE_LABEL) ).groupId : null
                return deviceGroupId ? await navigator.mediaDevices.getUserMedia({ 
                    video: !exMyVideo ? {groupId: { exact: deviceGroupId }} : false, 
                    audio: {groupId: { exact: deviceGroupId }} }) :
                await navigator.mediaDevices.getUserMedia({ video: !exMyVideo, audio: true })
            } catch(e) {
                setError("Audio/video devices aren't affordable")
            }
        }, [deviceGroupId, setError, exMyVideo] )

        const localVideo = useMemo( () => {
            try {
                return ( localStream ? <video ref = { a => {a && localStream && (a.srcObject = localStream)} } autoPlay controls ></video> : <video autoPlay controls ></video> )
            } catch (e) {
                setError && setError(e)
                console.log(e.stack)
            }
        }, [localStream, setError] )

        //
        const joinChat = useCallback(async (event) => {
            try {
                event.preventDefault()
                setError("")
                if(!localStream) setLocalStream( await startLocalVideo() )
                joinGroupCall(idJoin, name || "John Doe")
            } catch (e) {
                setError && setError(e)
                console.log(e.stack)
            }
        }, [localStream, startLocalVideo, joinGroupCall, idJoin, setError, name])

        const createChat = useCallback(async (event) => {
            try {
                event.preventDefault()
                setError("")
                if(!localStream) setLocalStream( await startLocalVideo() )
                createGroupCall(title || "New group call", name || "John Doe")
            } catch (e) {
                setError && setError(e)
                console.log(e.stack)
            }
        }, [localStream, startLocalVideo, createGroupCall, title, setError, name])

        const closeChat = useCallback(() => {
            try {
                setError("")
                setLocalStream( null )
                closeSocketConnection()
                setError("")
            } catch (e) {
                setError && setError(e)
                console.log(e.stack)
            }
        }, [setLocalStream, closeSocketConnection, setError])

        const msgInputId = useId()
        const chtInputId = useId()
        const checkExcludeMyVideoId = useId()
        const checkExcludeFrVideoId = useId()
        const nameId = useId()
        const titleId = useId()

        return <div className="d-flex flex-column" style={{height: "100vh"}} >
<nav class="navbar navbar-expand-lg navbar-light bg-light">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">Navbar</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
      <div class="navbar-nav">
        <button className="btn btn-primary ms-3 bg-light text-secondary" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasWithBackdrop" aria-controls="offcanvasWithBackdrop">Start call</button>
        <button className="btn btn-primary ms-3 bg-light text-secondary" type="button" onClick={e => setIsTextChatVisible(!isTextChatVisible)}>Text chat</button>
      </div>
    </div>
  </div>
</nav>

<div className="offcanvas offcanvas-start" tabindex="-1" id="offcanvasWithBackdrop" aria-labelledby="offcanvasWithBackdropLabel">
  <div className="offcanvas-header">
    <h5 className="offcanvas-title" id="offcanvasWithBackdropLabel">Offcanvas with backdrop</h5>
    <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
  </div>
  <div className="offcanvas-body">
                <div>{status===SOCKET_STATUS_TYPE.CONNECTED ? '✅ Online' : '❌ Disconnected'}</div>
                <div>
                    <input type='checkbox' id={checkExcludeMyVideoId} checked={exMyVideo} onChange={e => setExMyVideo(e.target.checked)}/>
                    <label htmlFor={checkExcludeMyVideoId}>Exclude <b>my</b> video translation:</label>
                </div>
                <div>
                    <input type='checkbox' id={checkExcludeFrVideoId} checked={exFrVideo} onChange={e => setExFrVideo(e.target.checked)}/>
                    <label htmlFor={checkExcludeFrVideoId}>Exclude <b>received</b> video translation:</label>
                </div>
                <div>
                    { localStream ? "" : 
                      <Selector devices={devices} setGroupId={ d => setDeviceGroupId(d)} exMyVideo={exMyVideo}/> }
                </div>
                            <div style={{border: "1px solid #CCC"}}>
                                <legend>User data</legend>
                                <div>
                                <label htmlFor={nameId}>User name:</label><input placeholder="Enter user name" type='text' onChange={e => setName(e.target.value)}/>
                                </div>
                                <div>
                                <label htmlFor={titleId}>Call title:</label><input placeholder="Enter call title" type='text' onChange={e => setTitle(e.target.value)}/>
                                </div>
                            </div>
                <div>
                    <p>Начать новый созвон</p>
                    <button onClick={createChat}>Start</button>
                    <p>Идентификатор группы созвона: {idGroup ? idGroup : "-"}</p>
                </div>
                <div>
                {
                 status === SOCKET_STATUS_TYPE.CONNECTED ? "" :   //Есть подключение к серверу по сокетному соединению и к базе данных, объединяющей пользователей
                    <div>
                        <p>Подключение к созвону</p>
                        <form onSubmit={joinChat}>
                            <input placeholder="Enter broadcast id" type='text' onChange={e => setIdJoin(e.target.value)}/>
                            <button onClick={joinChat}>Join chat</button>
                        </form>                    
                    </div>
                }
                </div>                      
                <div>
                    <p>Закрыть созвон</p>
                    <button onClick={closeChat}>Stop</button>
                </div>
  </div>
</div>            
    <main className="d-flex bd-highlight flex-grow-1">
        <article className="p-2 flex-grow-1 bd-highlight">
                <div>   
                    { localStream ? <div> {localVideo} </div> : "" }
                </div>
                <div>
                {
                 status === SOCKET_STATUS_TYPE.CONNECTED ?    //Есть подключение к серверу по сокетному соединению и к базе данных, объединяющей пользователей
                    <div className='classVideo'>
                    {
                        remoteStreamsData && remoteStreamsData.map( a => 
                        <Video  id = {a.id} stream = {a.stream} key = {a.id}/>
                    )}
                    </div> : ""
                }
                </div>                      
                <p style={{color: 'red', backgroundColor: 'white'}}><b>{error}</b></p>
        </article>
        {
        isTextChatVisible && <aside className="d-flex p-2 bd-highlight flex-column">
                <div className = "d-flex p-2 flex-grow-1  bd-highlight flex-column">
                    <div><label htmlFor={chtInputId}>Чат:</label></div>
                    <div className = "flex-grow-1"><textarea id={chtInputId} value={text} placeholder="Chat output"/></div>
                </div>
                <div>
                    <div><label htmlFor={msgInputId}>Ввести сообщение:</label></div>
                    <input type='text' placeholder="Enter message" id={msgInputId} onChange={e => setMsg(e.target.value)}/>
                    <button onClick={() => sendText()}>Send message</button>
                </div>
        </aside>
        }
    </main>
            </div>
    }
    
export default VideoChat