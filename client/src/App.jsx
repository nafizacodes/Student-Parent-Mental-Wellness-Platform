import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './i18n';
import './index.css';

import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import ParentDashboard from './pages/ParentDashboard';
import DailyCheckin from './pages/DailyCheckin';
import Games from './pages/Games';
import Music from './pages/Music';
import Resources from './pages/Resources';

function ProtectedRoute({ children, role }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="main-content" style={{ textAlign: 'center', paddingTop: 100 }}>
        <div className="float" style={{ fontSize: 48 }}>🧠</div>
        <p style={{ marginTop: 16, color: 'var(--text-muted)' }}>Loading...</p>
    </div>;
    if (!user) return <Navigate to="/login" />;
    if (role && user.role !== role) return <Navigate to={user.role === 'parent' ? '/parent-dashboard' : '/dashboard'} />;
    return children;
}

function AppRoutes() {
    const { user } = useAuth();

    return (
        <Routes>
            <Route path="/login" element={user ? <Navigate to={user.role === 'parent' ? '/parent-dashboard' : '/dashboard'} /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to={user.role === 'parent' ? '/parent-dashboard' : '/dashboard'} /> : <Register />} />
            <Route path="/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
            <Route path="/parent-dashboard" element={<ProtectedRoute role="parent"><ParentDashboard /></ProtectedRoute>} />
            <Route path="/checkin" element={<ProtectedRoute role="student"><DailyCheckin /></ProtectedRoute>} />
            <Route path="/games" element={<ProtectedRoute role="student"><Games /></ProtectedRoute>} />
            <Route path="/music" element={<ProtectedRoute role="student"><Music /></ProtectedRoute>} />
            <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to={user ? (user.role === 'parent' ? '/parent-dashboard' : '/dashboard') : '/login'} />} />
        </Routes>
    );
}

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <div className="app-container">
                        <Navbar />
                        <AppRoutes />
                    </div>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}
