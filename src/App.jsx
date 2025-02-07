import React from 'react'
import Login from './pages/login'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './component/header'
import Footer from './component/footer'
import Home from './pages/home'
import Schedules from './pages/schedules'


function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/schedules' element={<Schedules/>}/>
        <Route path='/login' element={<Login/>}/>
      </Routes>
      <Footer />
    </Router>
  )
}

export default App