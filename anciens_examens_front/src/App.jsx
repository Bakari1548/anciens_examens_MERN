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
import FavoritesPage from './pages/Favorites'
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
import AdminEmailsPage from './pages/AdminEmails'
import { ThemeProvider } from './app/admin/context/ThemeContext'
import ResetPasswordWithTokenPage from './pages/ResetPasswordWithToken'
import RulesPage from './app/legal/components/RulesPage'

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
        <Route path="/mot-de-passe-modifie/:token" element={<ResetPasswordWithTokenPage />} />
        <Route path="/partager-examen" element={<PostExamPage />} />
        <Route path="/examens/:slug" element={<DetailExamPage />} />
        <Route path="/examens" element={<ExamsPage />} />
        <Route path="/examens/favoris" element={<FavoritesPage />} />
        <Route path="/profil" element={<ProfilePage />} />
        <Route path="/demande" element={<AccountAppealPage />} />
        <Route path="/regles" element={<RulesPage />} />



        {/* Routes Admin protégées */}
        <Route path="/admin/*" element={
          <AdminProtectedRoute>
            <Routes>
              <Route path="/" element={<AdminDashboardPage />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="exams" element={<AdminExamsPage />} />
              <Route path="reports" element={<AdminModerationPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="notifications" element={<AdminNotificationsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="logs" element={<AdminLogsPage />} />
              <Route path="appeals" element={<AdminAppealsPage />} />
              <Route path="emails" element={<AdminEmailsPage />} />
            </Routes>
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
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App
