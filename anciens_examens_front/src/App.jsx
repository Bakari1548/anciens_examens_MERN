import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import './App.css'
import HomePage from './pages/Home'
import Header from './app/home/components/Header'
import Footer from './app/home/components/Footer'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import ResetPasswordPage from './pages/ResetPassword'
import ResetPasswordDonePage from './pages/ResetPasswordDone'
import ResetPasswordCompletePage from './pages/ResetPasswordComplete'
import PostExamPage from './pages/PostExam'
import DetailExamPage from './pages/DetailExam'
import AdminProtectedRoute from './components/AdminProtectedRoute'
import AdminDashboardPage from './pages/AdminDashboard'
import AdminUsersPage from './pages/AdminUsers'
import AdminExamsPage from './pages/AdminExams'
import AdminModerationPage from './pages/AdminModeration'
import AdminAnalyticsPage from './pages/AdminAnalytics'

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
        <Route path="/partager-examen" element={<PostExamPage />} />
        <Route path="/examen/:slug" element={<DetailExamPage />} />
        <Route path="/regles" element={<HomePage />} />
        
        {/* Routes Admin protégées */}
        <Route path="/admin" element={
          <AdminProtectedRoute>
            <AdminDashboardPage />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
          <AdminProtectedRoute>
            <AdminDashboardPage />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <AdminProtectedRoute>
            <AdminUsersPage />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/exams" element={
          <AdminProtectedRoute>
            <AdminExamsPage />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <AdminProtectedRoute>
            <AdminModerationPage />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <AdminProtectedRoute>
            <AdminAnalyticsPage />
          </AdminProtectedRoute>
        } />
      </Routes>
      <Footer />
      <Toaster 
        position="bottom-center"
        richColors
        closeButton
      />
    </Router>
  )
}

export default App
