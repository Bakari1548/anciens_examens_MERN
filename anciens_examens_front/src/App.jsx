import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
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
import ExamsPage from './pages/Exams'
import ProfilePage from './pages/Profile'
import AccountAppealPage from './pages/AccountAppeal'
import AdminProtectedRoute from './components/AdminProtectedRoute'
import AdminDashboardPage from './pages/AdminDashboard'
import AdminUsersPage from './pages/AdminUsers'
import AdminExamsPage from './pages/AdminExams'
import AdminModerationPage from './pages/AdminModeration'
import AdminAnalyticsPage from './pages/AdminAnalytics'
import AdminNotificationsPage from './pages/AdminNotifications'
import AdminSettingsPage from './pages/AdminSettings'
import AdminLogsPage from './pages/AdminLogs'
import AdminAppealsPage from './pages/AdminAppeals'
import { ThemeProvider } from './app/admin/context/ThemeContext'

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Header />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/inscription" element={<RegisterPage />} />
        <Route path="/connexion" element={<LoginPage />} />
        <Route path="/mot-de-passe-oublie" element={<ResetPasswordPage />} />
        <Route path="/email-envoye" element={<ResetPasswordDonePage />} />
        <Route path="/mot-de-passe-modifie" element={<ResetPasswordCompletePage />} />
        <Route path="/partager-examen" element={<PostExamPage />} />
        <Route path="/examen/:slug" element={<DetailExamPage />} />
        <Route path="/examens" element={<ExamsPage />} />
        <Route path="/profil" element={<ProfilePage />} />
        <Route path="/demande" element={<AccountAppealPage />} />
        <Route path="/regles" element={<HomePage />} />



        {/* Routes Admin protégées */}
        <Route path="/admin" element={
          <AdminProtectedRoute>
            <ThemeProvider>
              <AdminDashboardPage />
            </ThemeProvider>
          </AdminProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
          <AdminProtectedRoute>
            <ThemeProvider>
              <AdminDashboardPage />
            </ThemeProvider>
          </AdminProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <AdminProtectedRoute>
            <ThemeProvider>
              <AdminUsersPage />
            </ThemeProvider>
          </AdminProtectedRoute>
        } />
        <Route path="/admin/exams" element={
          <AdminProtectedRoute>
            <ThemeProvider>
              <AdminExamsPage />
            </ThemeProvider>
          </AdminProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <AdminProtectedRoute>
            <ThemeProvider>
              <AdminModerationPage />
            </ThemeProvider>
          </AdminProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <AdminProtectedRoute>
            <ThemeProvider>
              <AdminAnalyticsPage />
            </ThemeProvider>
          </AdminProtectedRoute>
        } />
        <Route path="/admin/notifications" element={
          <AdminProtectedRoute>
            <ThemeProvider>
              <AdminNotificationsPage />
            </ThemeProvider>
          </AdminProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <AdminProtectedRoute>
            <ThemeProvider>
              <AdminSettingsPage />
            </ThemeProvider>
          </AdminProtectedRoute>
        } />
        <Route path="/admin/logs" element={
          <AdminProtectedRoute>
            <ThemeProvider>
              <AdminLogsPage />
            </ThemeProvider>
          </AdminProtectedRoute>
        } />
        <Route path="/admin/appeals" element={
          <AdminProtectedRoute>
            <ThemeProvider>
              <AdminAppealsPage />
            </ThemeProvider>
          </AdminProtectedRoute>
        } />
      </Routes>
      {!isAdminRoute && <Footer />}
      <Toaster 
        position="bottom-center"
        richColors
        closeButton
      />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App
