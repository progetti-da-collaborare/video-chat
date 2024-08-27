import { useState } from "react"
import Queue from "../../Queque"

const useQueue = () => {
    const [trigger, setTrigger] = useState(null)
    const [queue] = useState(new Queue( a => setTrigger(a) ))
    return [queue, trigger]
}

export default useQueue