import { useState } from 'react';
import TranscriptInput from './components/TranscriptInput.jsx';
import SummaryView from './components/SummaryView.jsx';
import { summarize, regenerateSection } from './api/summary.js';

export default function App() {
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [regenLoading, setRegenLoading] = useState('');

  async function handleGenerate() {
    setError('');
    setLoading(true);
    try {
      const result = await summarize(transcript);
      setSummary(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegenerate(section) {
    if (!summary) return;
    setError('');
    setRegenLoading(section);
    try {
      const partial = await regenerateSection(transcript, section, summary);
      setSummary((prev) => ({ ...prev, ...partial }));
    } catch (e) {
      setError(e.message);
    } finally {
      setRegenLoading('');
    }
  }

  function handleEdit(section, index, updated) {
    setSummary((prev) => {
      const next = { ...prev };
      const arr = [...(next[section] || [])];
      arr[index] = updated;
      next[section] = arr;
      return next;
    });
  }

  return (
    <div className="app">
      <header className="header">
        <h1>
          Smart meeting <span className="accent">summaries</span>,
          <br />without the busywork.
        </h1>
        <p className="muted">
          Paste a meeting transcript and get structured topics, decisions, and action items —
          editable, regeneratable, grounded only in what was actually said.
        </p>
      </header>

      <main className="main">
        <TranscriptInput
          value={transcript}
          onChange={setTranscript}
          onGenerate={handleGenerate}
          loading={loading}
        />

        {error && <div className="alert error">{error}</div>}

        {summary && (
          <SummaryView
            summary={summary}
            onRegenerate={handleRegenerate}
            onEdit={handleEdit}
            regenLoading={regenLoading}
          />
        )}
      </main>

      
    </div>
  );
}
