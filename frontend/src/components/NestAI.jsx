import { useState } from 'react';

const starterPrompts = ['Where is my order?', 'I need to return an item', 'Payment help'];

const getReply = (message) => {
  const prompt = message.toLowerCase();
  if (prompt.includes('return')) {
    return 'I can help with that. Most items can be returned within 7 days of delivery. Share your order number and I will guide you through the next step.';               
  }
  if (prompt.includes('payment')) {
    return 'For payment issues, please check that your bank or UPI app shows the transaction as successful. I can help investigate with your order number.';
  }
  if (prompt.includes('order') || prompt.includes('track')) {
    return 'I can check that for you. Open an order above to find its latest details, or send me the order number you want to track.';
  }
  return 'I am here to help with orders, returns, payments, and delivery questions. What would you like to sort out?';
};

export default function NestAI() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'agent', text: 'Hi there. I am NestAI, your order support assistant. How can I help today?' },
  ]);
  const [draft, setDraft] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = (message = draft) => {
    const text = message.trim();
    if (!text || isTyping) return;

    setMessages((current) => [...current, { id: Date.now(), role: 'customer', text }]);
    setDraft('');
    setIsTyping(true);
    window.setTimeout(() => {
      setMessages((current) => [...current, { id: Date.now(), role: 'agent', text: getReply(text) }]);
      setIsTyping(false);
    }, 650);
  };

  return (
    <aside className="nest-ai" aria-label="NestAI customer support">
      <div className="nest-ai__header">
        <div className="nest-ai__identity">
          <div className="nest-ai__avatar" aria-hidden="true">N</div>
          <div>
            <div className="nest-ai__name">NestAI</div>
            <div className="nest-ai__status"><span /> Online support assistant</div>
          </div>
        </div>
        <button className="nest-ai__more" type="button" aria-label="More support options">•••</button>
      </div>

      <div className="nest-ai__body">
        <div className="nest-ai__intro">
          <span className="nest-ai__spark">✦</span>
          <div>
            <h2>How can I help?</h2>
            <p>Ask me about your orders, delivery, returns or payments.</p>
          </div>
        </div>
        <div className="nest-ai__messages" aria-live="polite">
          {messages.map((message) => (
            <div key={message.id} className={`nest-ai__message nest-ai__message--${message.role}`}>
              {message.text}
            </div>
          ))}
          {isTyping && <div className="nest-ai__message nest-ai__message--agent nest-ai__typing"><span /><span /><span /></div>}
        </div>
        <div className="nest-ai__prompts">
          {starterPrompts.map((prompt) => (
            <button key={prompt} type="button" onClick={() => sendMessage(prompt)}>{prompt}</button>
          ))}
        </div>
        <form className="nest-ai__composer" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}>
          <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a message..." aria-label="Message NestAI" />
          <button type="submit" aria-label="Send message" disabled={!draft.trim() || isTyping}>↑</button>
        </form>
        <p className="nest-ai__notice">NestAI can make mistakes. Never share payment passwords.</p>
      </div>
    </aside>
  );
}

