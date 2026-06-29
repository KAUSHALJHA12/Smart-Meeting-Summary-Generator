import { useState } from 'react';

export default function EditableText({ value, onChange, className = '', multiline = false }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  function start() {
    setDraft(value);
    setEditing(true);
  }
  function save() {
    onChange(draft);
    setEditing(false);
  }
  function cancel() {
    setDraft(value);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="editable">
        {multiline ? (
          <textarea
            className="textarea small"
            value={draft}
            rows={3}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
          />
        ) : (
          <input
            className="input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
          />
        )}
        <div className="row">
          <button className="btn primary small" onClick={save}>
            Save
          </button>
          <button className="btn ghost small" onClick={cancel}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`editable ${className}`} onClick={start} title="Click to edit">
      {value || <span className="muted">(empty — click to edit)</span>}
    </div>
  );
}
