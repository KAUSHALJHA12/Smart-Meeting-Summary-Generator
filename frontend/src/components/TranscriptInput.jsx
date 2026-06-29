const SAMPLE = `Alice: Welcome everyone. Today we need to decide on the launch date for the mobile app.
Bob: I think we should target March 15th. QA needs at least two weeks.
Carol: Agreed. Marketing will need the final build by March 8th to prepare assets.
Alice: Good. Decision: we launch March 15th. Bob, can you own the QA plan and share it by Friday?
Bob: Yes, I'll have the QA plan ready by Friday.
Carol: I'll coordinate with the design team on the launch landing page by March 5th.
Alice: One more topic — pricing. We're sticking with $9.99/month for now and will revisit after 30 days.
Bob: Sounds good. I'll set up a metrics dashboard before launch.`;

export default function TranscriptInput({ value, onChange, onGenerate, loading }) {
  return (
    <section className="card">
      <div className="card-header">
        <h2>Transcript</h2>
        <div className="row">
          <button className="btn ghost" onClick={() => onChange(SAMPLE)} disabled={loading}>
            Load sample
          </button>
          <button className="btn ghost" onClick={() => onChange('')} disabled={loading}>
            Clear
          </button>
        </div>
      </div>
      <textarea
        className="textarea"
        rows={12}
        placeholder="Paste your meeting transcript here…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
      />
      <div className="row end">
        <button
          className="btn primary"
          onClick={onGenerate}
          disabled={loading || value.trim().length < 10}
        >
          {loading ? 'Generating…' : 'Generate Summary'}
        </button>
      </div>
    </section>
  );
}
