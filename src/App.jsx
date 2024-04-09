import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Routes, Route } from "react-router-dom";
import './App.css'
import Chat from './pages/ChatRoom';
import JoinChat from './pages/JoinChat';
function App() {

  return (
    <Routes>
      <Route path="/room" element={<Chat />}></Route>
      <Route path="/" element={<JoinChat />}></Route>
    </Routes>
  )
}

export default App
