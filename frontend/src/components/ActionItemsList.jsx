import EditableText from './EditableText.jsx';

export default function ActionItemsList({ items, onEdit }) {
  if (!items || items.length === 0) {
    return <p className="muted">No action items found.</p>;
  }

  return (
    <ul className="list">
      {items.map((a, i) => (
        <li key={i} className="list-item">
          <EditableText
            value={a.task}
            onChange={(v) => onEdit(i, { ...a, task: v })}
            className="item-title"
          />
          <div className="badges">
            <span className="badge">
              Owner:{' '}
              <EditableText
                value={a.owner || ''}
                onChange={(v) => onEdit(i, { ...a, owner: v })}
              />
            </span>
            <span className="badge">
              Due:{' '}
              <EditableText
                value={a.dueDate || ''}
                onChange={(v) => onEdit(i, { ...a, dueDate: v })}
              />
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
