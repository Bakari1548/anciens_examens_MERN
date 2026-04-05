import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import HomePage from './pages/Home'
import Header from './app/home/components/Header'
import Footer from './app/home/components/Footer'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import ResetPasswordPage from './pages/ResetPassword'
import ResetPasswordDonePage from './pages/ResetPasswordDone'
import ResetPasswordCompletePage from './pages/ResetPasswordComplete'

function App() {

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/inscription" element={<RegisterPage />} />
        <Route path="/connexion" element={<LoginPage />} />
        <Route path="/mot-de-passe-oublie" element={<ResetPasswordPage />} />
        <Route path="/email-envoye" element={<ResetPasswordDonePage />} />
        <Route path="/mot-de-passe-modifie" element={<ResetPasswordCompletePage />} />
        <Route path="/regles" element={<HomePage />} />
      </Routes>
      <Footer />
    </Router>
  )
}

export default App
