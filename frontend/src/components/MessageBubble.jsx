export default function MessageBubble({ message }) {
  const assistant = message.role === 'assistant';
  return (
    <div className={`message-row ${assistant ? 'assistant' : 'user'}`}>
      {assistant && <div className="assistant-avatar">✦</div>}
      <div className={`message-bubble ${assistant ? 'assistant-bubble' : 'user-bubble'}`}>
        {message.content.split('\n').map((line, index) => <p key={index}>{line || '\u00a0'}</p>)}
      </div>
      {!assistant && <div className="user-avatar">You</div>}
    </div>
  );
}
