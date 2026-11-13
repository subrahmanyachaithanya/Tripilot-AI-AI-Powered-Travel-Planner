import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function OAuthCallback() {
  const [params] = useSearchParams();
  const { completeGoogleLogin } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setError('Google sign-in did not return an application token.');
      return;
    }
    // Remove the token from the visible address bar immediately after reading it.
    window.history.replaceState({}, document.title, '/oauth2/callback');
    completeGoogleLogin(token)
      .then(() => navigate('/chat', { replace: true }))
      .catch(err => setError(err.message || 'Could not finish Google sign-in.'));
  }, []);

  return <div className="page-loader">{error ? <div className="callback-error">{error}<a href="/login">Return to sign in</a></div> : 'Finishing your sign-in…'}</div>;
}
