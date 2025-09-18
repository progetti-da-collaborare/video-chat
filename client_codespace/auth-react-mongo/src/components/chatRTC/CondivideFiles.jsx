import { useCallback, useEffect, useRef, useState } from "react"

const CondivideFiles = ( props ) => {
    const { dataChannels, setOnFileChannelMsg } = props
    const [file, setFile] = useState( null )  //Файлы для отправки собеседникам
    const [labelSend, setLabelSend] = useState( "" )
    const [labelReceive, setLabelReceive] = useState( "" )
    const progressSend = useRef({ label: "", value: 0, max: 0 })    //Load files process progress
    const progressReceived = useRef({ label: "", value: 0, max: 0 })    //Load files process progress
    const refFiles = useRef()
    const fileMetaReceive = useRef({ name: null, type: null })
    const receiveBuffer = useRef([])
    const downloadAnchor = useRef()

    const sendData = useCallback( async dataChannel => {
      let maxChunkSize = 16384;
      progressSend.current = { ...progressSend.current, value: 0 }

      console.log(dataChannel.bufferedAmountLowThreshold);

      file.arrayBuffer().then((buffer) => {
        let offset = 0
        const send = () => {
          while (buffer.byteLength) {
            if (
              dataChannel.bufferedAmount >
              dataChannel.bufferedAmountLowThreshold
            ) {
              dataChannel.onbufferedamountlow = () => {
                dataChannel.onbufferedamountlow = null;
                send();
              };
              return;
            }
            const chunk = buffer.slice(0, maxChunkSize);
            buffer = buffer.slice(maxChunkSize, buffer.byteLength);
            dataChannel.send(chunk);
            offset += maxChunkSize;
            console.log("Sent " + offset + " bytes.");
            progressSend.current = { ...progressSend.current, 
                          value: offset >= file.size ? file.size : offset,
                          label: offset >= file.size ? "File sent" : ((1. * offset / file.size) * 100).toFixed(1) + "%"
            }
            setLabelSend( progressSend.current.label )
          }
        }

        send()
      })

      //console.log(`File is ${[file.name, file.size, file.type, file.lastModified].join(' ')}`);
      //fileReader = new FileReader();
    }, [file, progressSend] )

    useEffect( () => {
      if(!file) return
      progressSend.current = { max: file?.size, value: 0, label: "" }
      //progressReceived.current = { max: file?.size, value: 0, label: "" }

      dataChannels.forEach( a => {
          a.send(
          JSON.stringify({
            name: file?.name,
            size: file?.size,
            type: file?.type,
          })
        )
        sendData(a)
      })
    }, [file, dataChannels, sendData] )

      const onReceiveMessageCallback = useCallback( (event) => {
        //console.log(receivedFile)

        if (!fileMetaReceive.current["name"]) {
          const file = JSON.parse(event.data);
          console.log(file);
          fileMetaReceive.current = { name: file.name, type: file.type }
          progressReceived.current = { max: file.size, value: 0, label: "" }
          return;
        }

        receiveBuffer.current.push(event.data);
        progressReceived.current = { ...progressReceived.current, 
                      value: progressReceived.current.value + event.data.byteLength, 
                      label: "Received: " + (( (1. * progressReceived.current.value + event.data.byteLength) / progressReceived.current.max) * 100).toFixed(1) + "%"
        }
        setLabelReceive( progressReceived.current.label )

        if (progressReceived.current.value === progressReceived.current.max) {
          const blob = new Blob(receiveBuffer.current, { type: fileMetaReceive.current.type });
          downloadAnchor.current.href = URL.createObjectURL(blob);
          downloadAnchor.current.download = fileMetaReceive.current["name"];
          downloadAnchor.current.innerHTML = fileMetaReceive.current["name"];
          //downloadAnchor.click();
          receiveBuffer.current = []
          fileMetaReceive.current =({})
          //progressReceived.current = {label: "", value: 0, max: 0}
        }
      }, [])

      useEffect( () => {
        setOnFileChannelMsg( () => onReceiveMessageCallback )
      }, [setOnFileChannelMsg, onReceiveMessageCallback])

    return (
    <div>
        <input class="form-control" ref={refFiles} type="file" onChange = { e => { setFile( refFiles.current.files[0] ) } }/>
        <button hidden id="sendFile">Send file</button><br />
        {progressReceived.current.label.length > 0 && <div>
        <progress max={progressReceived.current.max} value={progressReceived.current.value}></progress>&nbsp;&nbsp;<label dangerouslySetInnerHTML={{__html: `${labelReceive}`}}></label>
        </div>}
        {progressSend.current.label.length > 0 && <div>
        <progress max={progressSend.current.max} value={progressSend.current.value}></progress>&nbsp;&nbsp;<label dangerouslySetInnerHTML={{__html: `${labelSend}`}}></label>
        </div>}
        <div><a href="" ref={downloadAnchor} ></a></div>
    </div>
    )
}

export default CondivideFiles