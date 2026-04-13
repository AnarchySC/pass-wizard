/* Pass Wizard — per-exam page controller.
 *
 * Shared by every exams/<slug>/index.html. Reads meta.json from its own directory,
 * renders the tab row, and swaps #tabContent based on location.hash.
 *
 * Hash scheme:
 *   #course               → course landing (module list)
 *   #course/<moduleId>    → specific module
 *   #quiz                 → quiz landing
 *   #quiz/session         → active quiz session
 *   #progress             → stats dashboard
 *   #skill-tree           → skill tree (stub)
 *   #companion            → companion story (stub)
 */

const TAB_ORDER = ['course', 'quiz', 'skillTree', 'companion', 'progress'];
const TAB_LABELS = {
  course: 'Course',
  quiz: 'Practice Quiz',
  skillTree: 'Skill Tree',
  companion: 'Companion',
  progress: 'Progress',
};

let examMeta = null;

async function loadMeta() {
  const res = await fetch('meta.json');
  if (!res.ok) throw new Error('meta.json not found');
  examMeta = await res.json();
  document.getElementById('examBadge').textContent = examMeta.code;
  document.getElementById('examName').textContent = examMeta.name;
  document.title = `Pass Wizard — ${examMeta.code}`;
}

function renderTabs() {
  const row = document.getElementById('tabRow');
  const currentTab = (location.hash.replace('#', '').split('/')[0]) || firstEnabledTab();
  row.innerHTML = TAB_ORDER.map(tab => {
    const enabled = examMeta.tabs[tab];
    const active = tab === currentTab && enabled;
    const disabled = enabled ? '' : 'disabled';
    const cls = ['tab-btn', active ? 'active' : '', disabled].filter(Boolean).join(' ');
    return `<a class="${cls}" href="#${tab}" ${disabled ? 'aria-disabled="true"' : ''}>${TAB_LABELS[tab]}</a>`;
  }).join('');
}

function firstEnabledTab() {
  return TAB_ORDER.find(t => examMeta.tabs[t]) || 'progress';
}

function renderTabContent() {
  const main = document.getElementById('tabContent');
  const hash = location.hash.replace('#', '');
  const [tab, subPath] = hash.split('/');
  const activeTab = (tab && examMeta.tabs[tab]) ? tab : firstEnabledTab();

  switch (activeTab) {
    case 'course':
      return renderCourse(main, subPath);
    case 'quiz':
      return renderQuiz(main, subPath);
    case 'progress':
      return renderProgress(main);
    case 'skillTree':
      return renderComingSoon(main, 'Skill Tree', 'Gamified progression map — coming soon.');
    case 'companion':
      return renderComingSoon(main, 'Companion', 'Interactive story-driven walkthroughs — coming soon.');
    default:
      return renderComingSoon(main, 'Nothing here yet', 'This exam is still being set up.');
  }
}

function renderCourse(main, moduleId) {
  if (!examMeta.tabs.course) {
    return renderComingSoon(main, 'Course', 'Course content is still being migrated for this exam.');
  }
  main.innerHTML = `
    <div class="card">
      <h3>Modules</h3>
      <p style="color:var(--text-dim);font-size:0.85rem;">
        Course content migration pending. See <code>DECISIONS.md</code> for status.
      </p>
    </div>
  `;
}

function renderQuiz(main, subPath) {
  main.innerHTML = `
    <div class="card">
      <h3>Practice Quiz</h3>
      <p style="color:var(--text-dim);font-size:0.9rem;margin-bottom:16px;">
        ${examMeta.questionCount} questions available. Session size: ${examMeta.sessionSize}.
        Pass threshold: ${examMeta.passThreshold}%.
      </p>
      <p style="color:var(--warn);font-size:0.85rem;">
        ⚠ Quiz engine extraction pending. See <code>js/quiz-engine.js</code> — it's a stub in the scaffold commit.
      </p>
    </div>
  `;
}

function renderProgress(main) {
  const s = pwSummary(examMeta.code);
  main.innerHTML = `
    <div class="card">
      <h3>Your Progress</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;">
        <div>
          <div style="font-family:var(--font-mono);font-size:1.8rem;color:var(--correct);">${s.correct}</div>
          <div style="font-size:0.75rem;color:var(--text-dim);text-transform:uppercase;">Correct</div>
        </div>
        <div>
          <div style="font-family:var(--font-mono);font-size:1.8rem;color:var(--wrong);">${s.wrong}</div>
          <div style="font-size:0.75rem;color:var(--text-dim);text-transform:uppercase;">Wrong</div>
        </div>
        <div>
          <div style="font-family:var(--font-mono);font-size:1.8rem;color:var(--accent);">${s.sessions}</div>
          <div style="font-size:0.75rem;color:var(--text-dim);text-transform:uppercase;">Sessions</div>
        </div>
        <div>
          <div style="font-family:var(--font-mono);font-size:1.8rem;color:var(--accent-2);">${s.courseCompleted}</div>
          <div style="font-size:0.75rem;color:var(--text-dim);text-transform:uppercase;">Modules Done</div>
        </div>
      </div>
    </div>
  `;
}

function renderComingSoon(main, title, msg) {
  main.innerHTML = `<div class="coming-soon"><h2>${title}</h2><p>${msg}</p></div>`;
}

async function boot() {
  try {
    await loadMeta();
    renderTabs();
    renderTabContent();
    window.addEventListener('hashchange', () => {
      renderTabs();
      renderTabContent();
    });
  } catch (e) {
    document.getElementById('tabContent').innerHTML =
      `<div class="coming-soon"><h2>Error</h2><p>${e.message}</p></div>`;
  }
}

document.addEventListener('DOMContentLoaded', boot);
