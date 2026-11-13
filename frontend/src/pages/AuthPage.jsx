import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { API_BASE_URL, apiRequest } from '../services/api';

function GoogleMark() {
  return <svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.8 6.1C12.3 13.6 17.7 9.5 24 9.5Z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.2-3.2-.5-4.7H24v9h12.4c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7-10.1 7-17.3Z"/><path fill="#FBBC05" d="M10.4 28.6a14.4 14.4 0 0 1 0-9.2l-7.8-6.1a24 24 0 0 0 0 21.4l7.8-6.1Z"/><path fill="#34A853" d="M24 48c6.5 0 12-2.1 16-6.2l-7.5-5.8c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.7-4.1-13.6-9.8l-7.8 6.1C6.5 42.6 14.6 48 24 48Z"/></svg>;
}

export default function AuthPage({ mode }) {
  const isSignup = mode === 'signup';
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(searchParams.get('googleError') ? 'Google sign-in could not be completed. Check your OAuth setup and try again.' : '');
  const [googleBusy, setGoogleBusy] = useState(false);

  useEffect(() => {
    if (user) navigate('/chat', { replace: true });
  }, [user, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (isSignup) await register(fullName, email, password);
      else await login(email, password);
      navigate('/chat');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setGoogleBusy(true);
    try {
      const status = await apiRequest('/api/auth/google/status');
      if (!status.enabled) {
        setError('Google sign-in is not configured yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to backend/.env, then set GOOGLE_OAUTH_ENABLED=true. See README.');
        return;
      }
      window.location.assign(`${API_BASE_URL}/oauth2/authorization/google`);
    } catch (err) {
      setError(err.message || 'Could not check Google sign-in configuration.');
    } finally {
      setGoogleBusy(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-visual">
        <div className="auth-visual-top"><span className="brand-mark">✦</span><span>tripilot</span></div>
        <div className="visual-copy">
          <div className="eyebrow light">YOUR NEXT JOURNEY STARTS HERE</div>
          <h1>Less planning stress.<br/><em>More world to see.</em></h1>
          <p>Tell Tripilot what you're dreaming of. Turn a few ideas into a journey that feels like yours.</p>
          <div className="visual-route-card">
            <div className="route-topline"><span>YOUR NEXT POSSIBILITY</span><span className="route-dots">•••</span></div>
            <div className="route-line"><span className="route-pin">●</span><span className="route-dash"></span><span className="route-pin end">●</span></div>
            <div className="route-cities"><span><b>Somewhere new</b><small>Start with a feeling</small></span><span className="align-right"><b>Somewhere unforgettable</b><small>We'll help you get there</small></span></div>
          </div>
        </div>
        <div className="visual-footer">Thoughtful trips begin with a conversation.</div>
      </section>

      <section className="auth-panel">
        <div className="auth-mobile-brand"><span className="brand-mark">✦</span> tripilot</div>
        <div className="auth-card">
          <div className="eyebrow">WELCOME TO TRIPILOT</div>
          <h2>{isSignup ? 'Create your account' : 'Welcome back'}</h2>
          <p className="auth-subtitle">{isSignup ? 'Start turning travel ideas into plans.' : 'Sign in to pick up where your next adventure begins.'}</p>

          <div className="auth-tabs">
            <Link className={!isSignup ? 'active' : ''} to="/login">Sign in</Link>
            <Link className={isSignup ? 'active' : ''} to="/signup">Create account</Link>
          </div>

          <button className="google-button" type="button" onClick={handleGoogle} disabled={googleBusy}>
            <GoogleMark /> {googleBusy ? 'Connecting to Google…' : 'Continue with Google'}
          </button>
          <div className="or-divider"><span></span><small>or continue with email</small><span></span></div>

          <form onSubmit={handleSubmit} className="auth-form">
            {isSignup && <label>Full name<input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" autoComplete="name" required maxLength={120}/></label>}
            <label>Email address<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required/></label>
            <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={isSignup ? 'At least 8 characters' : 'Your password'} autoComplete={isSignup ? 'new-password' : 'current-password'} minLength={isSignup ? 8 : 1} required/></label>
            {error && <div className="form-error" role="alert">{error}</div>}
            <button className="primary-button" type="submit" disabled={busy}>{busy ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'} <span>→</span></button>
          </form>
          <p className="terms-note">By continuing, you agree to use Tripilot responsibly. Your account details are stored securely by the application.</p>
        </div>
        <div className="auth-bottom">© {new Date().getFullYear()} Tripilot AI <span>Made for the curious.</span></div>
      </section>
    </main>
  );
}
