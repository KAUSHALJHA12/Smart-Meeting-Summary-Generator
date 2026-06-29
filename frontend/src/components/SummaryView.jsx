import SectionCard from './SectionCard.jsx';
import EditableText from './EditableText.jsx';
import ActionItemsList from './ActionItemsList.jsx';

export default function SummaryView({ summary, onRegenerate, onEdit, regenLoading }) {
  return (
    <div className="summary">
      <SectionCard
        title="Topics"
        onRegenerate={() => onRegenerate('topics')}
        loading={regenLoading === 'topics'}
      >
        {summary.topics.length === 0 ? (
          <p className="muted">No topics identified in the transcript.</p>
        ) : (
          <ul className="list">
            {summary.topics.map((t, i) => (
              <li key={i} className="list-item">
                <EditableText
                  value={t.title}
                  onChange={(v) => onEdit('topics', i, { ...t, title: v })}
                  className="item-title"
                />
                <EditableText
                  value={t.summary}
                  onChange={(v) => onEdit('topics', i, { ...t, summary: v })}
                  className="item-body"
                  multiline
                />
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard
        title="Decisions"
        onRegenerate={() => onRegenerate('decisions')}
        loading={regenLoading === 'decisions'}
      >
        {summary.decisions.length === 0 ? (
          <p className="muted">No explicit decisions found.</p>
        ) : (
          <ul className="list">
            {summary.decisions.map((d, i) => (
              <li key={i} className="list-item">
                <EditableText
                  value={d.decision}
                  onChange={(v) => onEdit('decisions', i, { ...d, decision: v })}
                  className="item-title"
                />
                {d.context && (
                  <EditableText
                    value={d.context}
                    onChange={(v) => onEdit('decisions', i, { ...d, context: v })}
                    className="item-body"
                    multiline
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard
        title="Action Items"
        onRegenerate={() => onRegenerate('actionItems')}
        loading={regenLoading === 'actionItems'}
      >
        <ActionItemsList
          items={summary.actionItems}
          onEdit={(i, updated) => onEdit('actionItems', i, updated)}
        />
      </SectionCard>
    </div>
  );
}
