import React, { useState } from 'react';

function ChatInterface() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [conversationId, setConversationId] = useState(null);

  const handleSubmit = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/mcp/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, conversationId }),
      });
      const data = await res.json();
      setResponse(data.response);
      setConversationId(data.conversationId);
      setPrompt('');
    } catch (error) {
      setResponse('Error processing request');
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <textarea
        className="w-full p-2 border rounded"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g., I want to book an appointment with Dr. Ahuja tomorrow morning"
      />
      <button
        onClick={handleSubmit}
        className="mt-2 bg-blue-500 text-white p-2 rounded"
      >
        Submit
      </button>
      {response && <div className="mt-4 p-2 bg-gray-100 rounded">{response}</div>}
    </div>
  );
}

export default ChatInterface;