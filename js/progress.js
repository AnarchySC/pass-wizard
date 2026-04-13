/* Pass Wizard — unified progress store.
 *
 * Privacy: this data never leaves the user's device. No network calls, no
 * telemetry, no analytics. Clearing browser data clears progress.
 *
 * Per-exam localStorage keys: `passwizard:<exam-code>`
 * Shape:
 *   {
 *     quiz:   { answered: { [qid]: {correct, skipped, ts} }, sessions: [...] },
 *     course: { completed: [moduleId, ...] },
 *     skillTree: { xp: 0, unlocked: [] }
 *   }
 *
 * Stable v1 schema. If you change this, bump SCHEMA_VERSION and write a migration.
 */

const PW_SCHEMA_VERSION = 1;
const PW_KEY_PREFIX = 'passwizard:';

function pwEmpty() {
  return {
    _v: PW_SCHEMA_VERSION,
    quiz: { answered: {}, sessions: [] },
    course: { completed: [] },
    skillTree: { xp: 0, unlocked: [] },
  };
}

function pwLoad(examCode) {
  try {
    const raw = localStorage.getItem(PW_KEY_PREFIX + examCode);
    if (!raw) return pwEmpty();
    const data = JSON.parse(raw);
    if (data._v !== PW_SCHEMA_VERSION) {
      // Future migrations land here.
      return { ...pwEmpty(), ...data, _v: PW_SCHEMA_VERSION };
    }
    return data;
  } catch (e) {
    console.warn('pwLoad failed, returning empty:', e);
    return pwEmpty();
  }
}

function pwSave(examCode, data) {
  try {
    localStorage.setItem(PW_KEY_PREFIX + examCode, JSON.stringify(data));
  } catch (e) {
    console.error('pwSave failed:', e);
  }
}

function pwSummary(examCode) {
  const d = pwLoad(examCode);
  const answered = Object.values(d.quiz.answered);
  const correct = answered.filter(a => a.correct).length;
  const wrong = answered.filter(a => !a.correct && !a.skipped).length;
  return {
    examCode,
    answeredCount: answered.length,
    correct,
    wrong,
    courseCompleted: d.course.completed.length,
    sessions: d.quiz.sessions.length,
  };
}

function pwExportAll() {
  const all = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(PW_KEY_PREFIX)) {
      all[k.slice(PW_KEY_PREFIX.length)] = JSON.parse(localStorage.getItem(k));
    }
  }
  return { _v: PW_SCHEMA_VERSION, exported: new Date().toISOString(), data: all };
}

function pwImportAll(payload) {
  if (!payload || !payload.data) throw new Error('invalid import payload');
  for (const [exam, data] of Object.entries(payload.data)) {
    localStorage.setItem(PW_KEY_PREFIX + exam, JSON.stringify(data));
  }
}
