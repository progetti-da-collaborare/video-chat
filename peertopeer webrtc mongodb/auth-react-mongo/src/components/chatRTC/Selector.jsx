import React, { useState, useRef, useEffect, useMemo, useCallback , useReducer} from 'react'

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
      <select name="cameras" id="camera-select" onChange={e => { 
        setGroupId(e.target.value)}}>
        <option value="">{exMyVideo ? "--Please choose a microphone--" : "--Please choose a camera--"}</option>
        { cameras.map( a => <option value={a.groupId} key={a.label}>{a.label}</option> ) }
      </select>
    </>
}

export default Selector