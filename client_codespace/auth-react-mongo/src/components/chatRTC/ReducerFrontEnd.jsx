import { useState, useRef } from "react"
import { REGIME_STATUS } from "./useRTC"
import { SOCKET_STATUS_TYPE } from "./useWebSocket"
import { httpRequest } from "../../stuff/stuff"

//Нужны состояния для отслеживания этапов выполнения запуска
//У параметров с useState эти состояния есть
//У функции connect нет состояния - а вызвать нужно один раз
//Перенесем состояния в отдельный кастомный хук, а для функции connect создадим его

const EVENT_STATES = Object.freeze({
    SCHEDULED: "SCHEDULED",     /*planned*/
    INPROGRESS: "INPROGRESS",       /*in progress*/
    WAITMESSAGE: "WAITMESSAGE",     /*to continue needed message for next stage in massive // not only order of operations, but also outer event observe*/
    FULFILLED: "FULFILLED"      /*fulfilled*/
})

const MSG_TYPE_F = Object.freeze({
    CONNECT: {type: "CONNECT", state: EVENT_STATES.SCHEDULED},
    CREATE_CALLGROUP: {type: "CREATE_CALLGROUP", state: EVENT_STATES.SCHEDULED},
    CALLGROUP_CREATED: {type: "CALLGROUP_CREATED", state: EVENT_STATES.WAITMESSAGE},
    JOIN_CALLGROUP: {type: "JOIN_CALLGROUP", state: EVENT_STATES.SCHEDULED},
    FRONTENDSET: {type: "FRONTENDSET", state: EVENT_STATES.SCHEDULED},
    ADDWORKFLOW: {type: "ADDWORKFLOW", state: EVENT_STATES.SCHEDULED},
})

const EVENT_FLOW = [EVENT_STATES.SCHEDULED, 
                                 EVENT_STATES.INPROGRESS, 
                                 EVENT_STATES.WAITMESSAGE,
                                 EVENT_STATES.FULFILLED]

const WORKFLOWS = Object.freeze({
    CREATE_CALLGROUP_FLOW: [MSG_TYPE_F.CONNECT, MSG_TYPE_F.CREATE_CALLGROUP, MSG_TYPE_F.CALLGROUP_CREATED],
    JOIN_CALLGROUP_FLOW: [MSG_TYPE_F.CONNECT, MSG_TYPE_F.JOIN_CALLGROUP]
})
//Flag to exclude multiple regimes in progress
let isProgress = false

const setFulfilled = (workflows, status) => {
    workflows.forEach( a => {
        a.forEach(b => {
            if(b.type === status) b.state = EVENT_STATES.FULFILLED
        })
    } )

    return workflows.reduce( (a,v) => v.filter(b=>b.state!==EVENT_STATES.FULFILLED).length===0?a:[...a, v], [] )
}

const sendNextMsg = (workflows, dispatch) => {
    const set = new Set()
    workflows.forEach( a => {
        const toEval = a.findIndex( b => b.state !== EVENT_STATES.FULFILLED && b.state !== EVENT_STATES.INPROGRESS )
        if( toEval < 0 || a[toEval].state !== EVENT_STATES.SCHEDULED ) return
        set.add(a[toEval].type)
    } )

    set.forEach( a => {
        let action = {}
        action.type = a
        action.data = {}
        dispatch(action)
    } )
}


const ReducerFrontEnd = ( {dispatch, setErr, connect, httpServer, params} ) => {

    const reducerFrontEnd = async (statePromise, action) => {
    try {
        const state = await statePromise
        switch(action.type) {     //Тип сообщения
            case MSG_TYPE_F.FRONTENDSET.type :
                return {...state, ...action.data}
            case MSG_TYPE_F.ADDWORKFLOW.type :
                {
                    const w = action.data.workflow
                    if(!w) return state
                    const tmp = {...state, workflows: [...state.workflows, w]}

                    //sendNextMsg(tmp.workflows, dispatch)

                    return tmp
                }
            case MSG_TYPE_F.CONNECT.type :
                {
                    if(isProgress) return state
                    isProgress = true
                    await connect()
                    //const w = setFulfilled( state.workflows, MSG_TYPE_F.CONNECT.type )
                    //sendNextMsg(w, dispatch)
                    isProgress = false
                    return {...state/*, workflows: w*/}
                }
            case MSG_TYPE_F.CREATE_CALLGROUP.type :
                {
                    if(isProgress) return state
                    isProgress = true
                    const url = "http://" + httpServer + `crt/call-group`
                    const data = { idMe: params.idMe, title: params.title, name: params.name }
                    await httpRequest( url, "POST", data, null )
                    //const w = setFulfilled( state.workflows, MSG_TYPE_F.CREATE_CALLGROUP.type )
                    //sendNextMsg(w, dispatch)
                    isProgress = false
                    return {...state/*, workflows: w*/}
                }
            case MSG_TYPE_F.CALLGROUP_CREATED.type :
                {
                    if(isProgress) return state
                    isProgress = true
                    //const w = setFulfilled( state.workflows, MSG_TYPE_F.CALLGROUP_CREATED.type )
                    //sendNextMsg(w, dispatch)
                    isProgress = false
                    return {...state/*, workflows: w*/}
                }
            default :   //state не меняется
                    return state
        }
    
    //    setTimeout(() => return tmp, )
    } catch (e) {
        setErr && setErr(e.message)
        console.log(e.stack)
    }
    
    }
    return reducerFrontEnd
    }
    
    export default ReducerFrontEnd
    export { WORKFLOWS, MSG_TYPE_F }