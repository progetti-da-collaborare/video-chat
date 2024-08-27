import { useEffect, useRef, useState } from "react"

const Video = ( props ) => {
    const {id, stream, name, setErr} = props
    const [name_, setName] = useState(name || "Gohn Doe")
    const refVideo = useRef(null);
    useEffect(() => {
        try {
            if(!!stream) refVideo.current.srcObject = stream;
        } catch (e) {
            setErr && setErr(e.message)
            console.log(e.stack)
        }
    },[stream])

    return (
    <div className="video">
        <video ref = {refVideo} autoPlay controls ></video>
        <p>{name_}</p>
    </div>
    )
}

export default Video