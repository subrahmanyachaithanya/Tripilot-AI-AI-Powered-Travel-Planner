import { useState } from 'react';

export default function ChatComposer({ onSend, busy, disabled }) {
  const [value, setValue] = useState('');
  function submit(event) {
    event.preventDefault();
    const message = value.trim();
    if (!message || busy || disabled) return;
    onSend(message);
    setValue('');
  }
  return (
    <form className="composer" onSubmit={submit}>
      <textarea value={value} onChange={e => setValue(e.target.value)} placeholder="Ask Tripilot to plan your next journey…" rows="1" onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(e); } }}/>
      <div className="composer-bottom"><span>Trip ideas, budgets, routes and day-by-day plans</span><button className="send-button" type="submit" disabled={!value.trim() || busy || disabled}>{busy ? '…' : '↑'}</button></div>
    </form>
  );
}
