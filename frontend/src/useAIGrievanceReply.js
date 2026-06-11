// hooks/useAIGrievanceReply.js
// No API key needed — talks to Ollama running on your laptop

import { useState } from 'react';

export function useAIGrievanceReply() {
  const [draft, setDraft]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const generate = async (grievance, canteenName) => {
    setLoading(true);
    setError(null);
    setDraft('');

    const prompt = `
Canteen: ${canteenName}
Issue type: ${grievance.issue_type.replace('_', ' ')}
Student complaint: "${grievance.description}"
Order ID: ${grievance.order_id || 'N/A'}

Write a reply to this student grievance.
    `.trim();

    try {
      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model:  'gourmetgo-assistant',  // your custom model
          prompt: prompt,
          stream: false                   // wait for full response
        })
      });

      if (!res.ok) throw new Error(`Ollama error ${res.status} — is Ollama running?`);

      const data = await res.json();
      setDraft(data.response.trim());

    } catch (e) {
      setError(e.message || 'Could not reach Ollama. Make sure it is running.');
    } finally {
      setLoading(false);
    }
  };

  return { draft, setDraft, loading, error, generate };
}