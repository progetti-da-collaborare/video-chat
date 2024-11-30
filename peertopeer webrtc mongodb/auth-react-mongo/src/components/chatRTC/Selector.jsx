import React, { useState, useRef, useEffect, useMemo, useCallback , useReducer} from 'react'
//import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'

const Selector = ({devices, setGroupId, setErr, exMyVideo}) => {
    const [cameras, setCameras] = useState([])
    
    useEffect(() => {
      try {
        setCameras(devices.filter(a => 
          a.kind === (!exMyVideo ? 'videoinput' : 'audioinput'))
          .map(a => {return {groupId: a.groupId, label: a.label}}))
      } catch (e) {
          setErr && setErr(e.message)
          console.log(e.stack)
      }    
    }, [devices, exMyVideo])

    return <>
      <label htmlFor="camera-select">{exMyVideo ? "Choose a microphone" : "Choose a camera"}:</label>
      <select class="form-select" name="cameras" id="camera-select" onChange={e => { 
        setGroupId(e.target.value)}}>
        <option value="">{exMyVideo ? "--Please choose a microphone--" : "--Please choose a camera--"}</option>
        { cameras.map( a => <option value={a.groupId} key={a.label}>{a.label}</option> ) }
      </select>
    </>
}

export default Selector