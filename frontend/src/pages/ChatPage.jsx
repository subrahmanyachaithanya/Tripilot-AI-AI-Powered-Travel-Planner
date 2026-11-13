import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { apiRequest } from '../services/api';
import Brand from '../components/Brand';
import MessageBubble from '../components/MessageBubble';
import ChatComposer from '../components/ChatComposer';

const suggestions = [
  { icon: '☼', title: 'A slow weekend away', prompt: 'Plan a relaxed 2-day weekend trip from Bengaluru under ₹8,000.' },
  { icon: '⌁', title: 'A first trip to Japan', prompt: 'Help me plan a first-time 7-day trip to Japan. Ask me what you need to know.' },
  { icon: '◒', title: 'Mountains and fresh air', prompt: 'Suggest a 4-day mountain getaway from Bengaluru for two people.' },
  { icon: '◇', title: 'Travel on a budget', prompt: 'Create a budget-friendly 5-day trip plan for me. Start by asking my city and budget.' }
];

export default function ChatPage() {
  const { user, logout } = useAuth();
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [recent, setRecent] = useState(() => JSON.parse(localStorage.getItem('tripilot_recent') || '[]'));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, busy]);

  function startNewTrip() {
    setMessages([]);
    setError('');
    setSidebarOpen(false);
  }

  async function sendMessage(content) {
    setError('');
    const previous = messages;
    setMessages([...previous, { role: 'user', content }]);
    setBusy(true);
    try {
      const history = previous.map(item => ({ role: item.role === 'assistant' ? 'model' : 'user', content: item.content }));
      const result = await apiRequest('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: content, history })
      });
      setMessages(current => [...current, { role: 'assistant', content: result.reply }]);
      const nextRecent = [content, ...recent.filter(item => item !== content)].slice(0, 5);
      setRecent(nextRecent);
      localStorage.setItem('tripilot_recent', JSON.stringify(nextRecent));
    } catch (err) {
      setError(err.message || 'Could not reach Tripilot. Check that the backend is running.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="chat-layout">
      <button className="mobile-menu" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu">☰</button>
      {sidebarOpen && <button className="sidebar-scrim" onClick={() => setSidebarOpen(false)} aria-label="Close menu"/>}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <Brand />
        <button className="new-trip-button" onClick={startNewTrip}><span>＋</span> New trip</button>
        <div className="sidebar-section-label">YOUR SPACE</div>
        <button className="sidebar-link active"><span>✧</span> Travel assistant</button>
        <button className="sidebar-link" onClick={startNewTrip}><span>▤</span> Explore ideas</button>
        <div className="sidebar-divider" />
        <div className="sidebar-section-label">RECENT PROMPTS</div>
        <div className="recent-list">
          {recent.length === 0 ? <p className="empty-recent">Your recent conversations will appear here.</p> : recent.map((item, index) => <button key={`${item}-${index}`} className="recent-item" title={item} onClick={() => sendMessage(item)}>{item}</button>)}
        </div>
        <div className="sidebar-spacer" />
        <div className="sidebar-help"><div className="help-spark">✦</div><b>Travel, your way.</b><p>Start with a place, a budget or simply a feeling.</p></div>
        <div className="profile-row">
          <div className="profile-avatar">{(user?.fullName || user?.email || 'T').charAt(0).toUpperCase()}</div>
          <div className="profile-info"><b>{user?.fullName || 'Traveller'}</b><small>{user?.email}</small></div>
          <button className="logout-button" onClick={logout} title="Sign out">↗</button>
        </div>
      </aside>

      <main className="chat-main">
        <header className="chat-topbar"><div className="topbar-label">YOUR PERSONAL TRAVEL PLANNER <span>✦</span></div><div className="topbar-right"><span className="online-dot"/> AI assistant</div></header>
        <div className="conversation-scroll">
          {messages.length === 0 ? (
            <div className="welcome-content">
              <div className="welcome-icon">✦</div>
              <div className="eyebrow">A LITTLE INSPIRATION GOES A LONG WAY</div>
              <h1>Where would you<br/><em>like to go?</em></h1>
              <p className="welcome-description">Dream out loud. Share a destination, a budget, or the kind of feeling you're chasing. We'll shape it into a plan together.</p>
              <div className="suggestion-grid">
                {suggestions.map(item => <button className="suggestion-card" key={item.title} onClick={() => sendMessage(item.prompt)}><span className="suggestion-icon">{item.icon}</span><b>{item.title}</b><small>{item.prompt}</small><span className="suggestion-arrow">↗</span></button>)}
              </div>
            </div>
          ) : (
            <div className="message-list">
              <div className="conversation-heading"><span>✦</span> Your travel conversation</div>
              {messages.map((message, index) => <MessageBubble key={index} message={message} />)}
              {busy && <div className="typing-indicator"><span/><span/><span/> Tripilot is thinking…</div>}
              <div ref={bottomRef}/>
            </div>
          )}
        </div>
        <div className="composer-wrap">
          {error && <div className="chat-error">{error}</div>}
          <ChatComposer onSend={sendMessage} busy={busy} disabled={false}/>
          <p className="disclaimer">Tripilot can make mistakes. Verify live prices, schedules and availability with providers before booking.</p>
        </div>
      </main>
    </div>
  );
}
