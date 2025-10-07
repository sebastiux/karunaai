import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import OpenAI from 'openai';

function App() {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'Namaste 🙏 Soy Karuna AI, tu guía experto en meditación Vipassana y dharma budista. Estoy aquí para ayudarte en tu camino hacia la iluminación, responder tus preguntas sobre la práctica meditativa, y compartir las enseñanzas del Buddha. ¿En qué puedo asistirte hoy en tu práctica espiritual?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const client = new OpenAI({
    apiKey: process.env.REACT_APP_XAI_API_KEY,
    baseURL: 'https://api.x.ai/v1',
    dangerouslyAllowBrowser: true
  });

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    setError('');
    const userMessage = { role: 'user', content: input };
    
    // System prompt for Vipassana expert
    const systemMessage = {
      role: 'system',
      content: `Eres Karuna AI, un experto maestro de dharma especializado en meditación Vipassana y budismo Theravada. 
      Tu conocimiento abarca:
      - Técnicas de meditación Vipassana (visión clara)
      - Las Cuatro Nobles Verdades y el Noble Óctuple Sendero
      - Anapanasati (atención a la respiración)
      - Los cinco agregados (skandhas) y la naturaleza del no-yo (anatta)
      - Impermanencia (anicca) y sufrimiento (dukkha)
      - Jhanas y estados meditativos
      - Suttas del Canon Pali
      - Prácticas de mindfulness y sati
      
      Responde siempre en español con compasión, sabiduría y claridad. Usa términos en pali cuando sea apropiado, 
      explicándolos en español. Ofrece guía práctica para la meditación y la vida diaria. Mantén un tono sereno, 
      sabio y accesible. Incluye citas relevantes del Buddha cuando sea apropiado.`
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const completion = await client.chat.completions.create({
        model: 'grok-4',
        messages: [systemMessage, ...messages, userMessage],
        temperature: 0.7,
        max_tokens: 1000
      });

      const assistantMessage = {
        role: 'assistant',
        content: completion.choices[0].message.content
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión. Por favor, intenta nuevamente.');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Disculpa, hubo un error de conexión. Por favor, intenta nuevamente. Que todos los seres estén libres de sufrimiento. 🙏'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      { 
        role: 'assistant', 
        content: 'Namaste 🙏 Soy Karuna AI, tu guía experto en meditación Vipassana y dharma budista. Estoy aquí para ayudarte en tu camino hacia la iluminación, responder tus preguntas sobre la práctica meditativa, y compartir las enseñanzas del Buddha. ¿En qué puedo asistirte hoy en tu práctica espiritual?' 
      }
    ]);
    setError('');
  };

  return (
    <div className="App">
      <div className="chat-container">
        <div className="chat-header">
          <div className="header-content">
            <h1>☸ KARUNA AI</h1>
            <p>Maestro de Dharma · Meditación Vipassana</p>
          </div>
          <button onClick={clearChat} className="clear-button" title="Nueva conversación">
            ↻
          </button>
        </div>
        
        <div className="messages-container">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`message ${message.role}`}
            >
              <div className="message-avatar">
                {message.role === 'user' ? '🧘' : '☸'}
              </div>
              <div className="message-content">
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message assistant">
              <div className="message-avatar">☸</div>
              <div className="message-content loading">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          )}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu pregunta sobre meditación o dharma... (Presiona Enter para enviar)"
            disabled={isLoading}
            rows="2"
          />
          <button 
            onClick={sendMessage} 
            disabled={isLoading || !input.trim()}
            className="send-button"
          >
            {isLoading ? '⏳' : '→'} Enviar
          </button>
        </div>
        
        <div className="footer">
          <p>Que todos los seres estén libres de sufrimiento · सब्बे सत्ता सुखिता होन्तु</p>
        </div>
      </div>
    </div>
  );
}

export default App;
