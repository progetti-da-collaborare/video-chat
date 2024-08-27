import logo from './logo.svg'
import './App.css'
import { useRef, useEffect, useState } from 'react'
import VideoChat from './components/chatRTC/VideoChat'
import 'bootstrap/dist/css/bootstrap.css'

function App() {
  
  return (
    <div className="App" style={{height: "100vh"}} >
      <VideoChat httpServer = "localhost:8082/"/>
    </div>
  )
}

export default App