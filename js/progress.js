/* Pass Wizard — unified progress store.
 *
 * Privacy: this data never leaves the user's device. No network calls, no
 * telemetry, no analytics. Clearing browser data clears progress.
 *
 * Per-exam localStorage keys: `passwizard:<exam-code>`
 * Shape:
 *   {
 *     _v: 1,
 *     quiz: {
 *       track: { [qid]: { seen, correct, wrong, streak, known, lastSeen } },
 *       sessions: [ { date, correct, wrong, skipped, pct, mode, domain } ]
 *     },
 *     course:   { completed: [moduleId, ...] },
 *     skillTree:{ xp: 0, unlocked: [] }
 *   }
 *
 * Schema vocabulary matches the original quiz.html engine so the migration
 * doesn't change the meaning of any field. Bump SCHEMA_VERSION + write a
 * migration before changing field semantics.
 */

const PW_SCHEMA_VERSION = 1;
const PW_KEY_PREFIX = 'passwizard:';

function pwEmpty() {
  return {
    _v: PW_SCHEMA_VERSION,
    quiz: { track: {}, sessions: [] },
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
  const tracks = Object.values(d.quiz.track || {});
  let totalCorrect = 0, totalWrong = 0, totalSeen = 0;
  for (const t of tracks) {
    totalCorrect += t.correct || 0;
    totalWrong += t.wrong || 0;
    totalSeen += t.seen || 0;
  }
  return {
    examCode,
    questionsTouched: tracks.length,
    correct: totalCorrect,
    wrong: totalWrong,
    seen: totalSeen,
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
