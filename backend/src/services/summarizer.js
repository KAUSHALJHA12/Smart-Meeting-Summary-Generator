import { chatJSON } from './aiGateway.js';

const SYSTEM_PROMPT = `You are a careful meeting-notes assistant.

Rules (strict, no exceptions):
- Use ONLY information explicitly present in the transcript.
- Never invent owners, dates, decisions, or topics.
- If a field is not stated in the transcript, omit it or leave the array empty.
- Be concise and factual. No filler, no opinions, no summaries of summaries.

Output a single JSON object with EXACTLY this shape:
{
  "topics":      [ { "title": string, "summary": string } ],
  "decisions":   [ { "decision": string, "context"?: string } ],
  "actionItems": [ { "task": string, "owner"?: string, "dueDate"?: string } ]
}

Rules for actionItems:
- "owner" must be a person/role named in the transcript. Omit if not stated.
- "dueDate" must appear in the transcript (any format is fine). Omit if not stated.
- Each "task" is one concrete action.`;

function buildUserPrompt(transcript) {
  return `Transcript:
"""
${transcript.trim()}
"""

Return the JSON object now.`;
}

function buildSectionPrompt(transcript, section, existing) {
  const sectionRules = {
    topics: 'Return ONLY the "topics" array. The rest of the object must be empty arrays.',
    decisions: 'Return ONLY the "decisions" array. The rest of the object must be empty arrays.',
    actionItems:
      'Return ONLY the "actionItems" array. The rest of the object must be empty arrays.',
  }[section];

  return `Transcript:
"""
${transcript.trim()}
"""

Previously generated sections (for context, do not duplicate or invent beyond the transcript):
${JSON.stringify(existing || {}, null, 2)}

${sectionRules}
Return the JSON object now.`;
}

/** Coerce/validate AI output into the canonical shape. Drops anything unexpected. */
function normalize(raw) {
  const safe = raw && typeof raw === 'object' ? raw : {};
  const topics = Array.isArray(safe.topics)
    ? safe.topics
        .filter((t) => t && typeof t.title === 'string')
        .map((t) => ({
          title: String(t.title).trim(),
          summary: typeof t.summary === 'string' ? t.summary.trim() : '',
        }))
    : [];

  const decisions = Array.isArray(safe.decisions)
    ? safe.decisions
        .filter((d) => d && typeof d.decision === 'string')
        .map((d) => ({
          decision: String(d.decision).trim(),
          ...(typeof d.context === 'string' && d.context.trim()
            ? { context: d.context.trim() }
            : {}),
        }))
    : [];

  const actionItems = Array.isArray(safe.actionItems)
    ? safe.actionItems
        .filter((a) => a && typeof a.task === 'string')
        .map((a) => ({
          task: String(a.task).trim(),
          ...(typeof a.owner === 'string' && a.owner.trim() ? { owner: a.owner.trim() } : {}),
          ...(typeof a.dueDate === 'string' && a.dueDate.trim()
            ? { dueDate: a.dueDate.trim() }
            : {}),
        }))
    : [];

  return { topics, decisions, actionItems };
}

export async function summarizeAll(transcript) {
  const raw = await chatJSON({
    system: SYSTEM_PROMPT,
    user: buildUserPrompt(transcript),
  });
  return normalize(raw);
}

export async function regenerateSection(transcript, section, existing) {
  if (!['topics', 'decisions', 'actionItems'].includes(section)) {
    const err = new Error(`Unknown section: ${section}`);
    err.status = 400;
    throw err;
  }
  const raw = await chatJSON({
    system: SYSTEM_PROMPT,
    user: buildSectionPrompt(transcript, section, existing),
  });
  const normalized = normalize(raw);
  return { [section]: normalized[section] };
}
