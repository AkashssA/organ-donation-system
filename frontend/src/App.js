import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import DonationForm from './components/DonationForm';
import RequestForm from './components/RequestForm';
import UserManagement from './components/UserManagement';
import AdminDashboard from './components/AdminDashboard';
import MyDonations from './components/MyDonation';
import MyRequests from './components/MyRequests';
import Profile from './components/Profile';
import HospitalDashboard from './components/HospitalDashboard';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <AuthProvider>
        <Navigation />
        <div className="container mt-4">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />

            {/* Default route redirects to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Donor routes */}
            <Route path="/donor" element={
              <ProtectedRoute roles={['donor']}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/donate" element={
              <ProtectedRoute roles={['donor']}>
                <DonationForm />
              </ProtectedRoute>
            } />
            <Route path="/my-donations" element={
              <ProtectedRoute roles={['donor']}>
                <MyDonations />
              </ProtectedRoute>
            } />

            {/* Recipient routes */}
            <Route path="/recipient" element={
              <ProtectedRoute roles={['recipient']}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/request-organ" element={
              <ProtectedRoute roles={['recipient']}>
                <RequestForm />
              </ProtectedRoute>
            } />
            <Route path="/my-requests" element={
              <ProtectedRoute roles={['recipient']}>
                <MyRequests />
              </ProtectedRoute>
            } />

            {/* Hospital routes */}
            <Route path="/hospital" element={
              <ProtectedRoute roles={['hospital']}>
                <HospitalDashboard />
              </ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute roles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            } />

            {/* Common protected routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            {/* Catch-all route redirects to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;