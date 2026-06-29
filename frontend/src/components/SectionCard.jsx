export default function SectionCard({ title, onRegenerate, loading, children }) {
  return (
    <section className="card">
      <div className="card-header">
        <h2>{title}</h2>
        <button className="btn ghost" onClick={onRegenerate} disabled={loading}>
          {loading ? 'Regenerating…' : 'Regenerate'}
        </button>
      </div>
      {children}
    </section>
  );
}
