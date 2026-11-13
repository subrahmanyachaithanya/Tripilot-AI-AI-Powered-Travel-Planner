import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import OAuthCallback from './pages/OAuthCallback';
import ChatPage from './pages/ChatPage';

function HomeRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader">Preparing your workspace…</div>;
  return <Navigate to={user ? '/chat' : '/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/signup" element={<AuthPage mode="signup" />} />
      <Route path="/oauth2/callback" element={<OAuthCallback />} />
      <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
