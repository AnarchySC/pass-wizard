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
      return renderSkillTree(main);
    case 'companion':
      return renderCompanion(main);
    default:
      return renderComingSoon(main, 'Nothing here yet', 'This exam is still being set up.');
  }
}

function renderCourse(main, moduleId) {
  if (!examMeta.tabs.course) {
    return renderComingSoon(main, 'Course', 'Course content is still being migrated for this exam.');
  }
  const mods = examMeta.courseModules || [];
  if (mods.length === 0) {
    return renderComingSoon(main, 'Course', 'No modules registered in meta.json for this exam.');
  }
  const completed = pwLoad(examMeta.code).course.completed;
  const cards = mods.map(m => {
    const done = completed.includes(m.id) ? '<span style="color:var(--correct);font-size:0.7rem;">&#10003; DONE</span>' : '';
    return `
      <a class="exam-btn" href="${m.file}" style="text-align:left;">
        <span class="code" style="font-size:0.9rem;">Module ${m.num}</span>
        <span class="name" style="color:var(--text);font-size:1rem;margin-bottom:8px;">${m.title}</span>
        ${done}
      </a>
    `;
  }).join('');
  main.innerHTML = `
    <div class="card">
      <h3>Course Modules</h3>
      <p style="color:var(--text-dim);font-size:0.85rem;margin-bottom:20px;">
        ${mods.length} modules. Click a module to open it. Use the back bar at the top of each module to return here.
      </p>
      <div class="exam-grid" style="max-width:none;">${cards}</div>
    </div>
  `;
}

function renderQuiz(main, subPath) {
  if (!examMeta.tabs.quiz) {
    return renderComingSoon(main, 'Practice Quiz', 'No quiz bank available for this exam yet.');
  }
  // Hand off the container to the quiz engine. It owns rendering from here.
  PWQuiz.mount({ exam: examMeta, container: main });
}

function renderCompanion(main) {
  if (!examMeta.tabs.companion) {
    return renderComingSoon(main, 'Companion', 'No companion guides authored for this exam yet.');
  }
  const guides = examMeta.companionGuides || [];
  if (guides.length === 0) {
    return renderComingSoon(main, 'Companion', 'No companion guides registered in meta.json.');
  }
  const data = pwLoad(examMeta.code);
  const store = (data.companion && data.companion.guides) || {};
  const cards = guides.map(g => {
    if (g.status === 'available') {
      const p = store[g.id] || { completed: [], totalXP: 0 };
      const done = p.completed.length;
      const badge = done === g.questCount
        ? '<span style="color:var(--correct);font-size:0.7rem;">&#10003; COMPLETE</span>'
        : `<span style="color:var(--text-dim);font-size:0.7rem;">${done}/${g.questCount} quests · ${p.totalXP}/${g.xp} XP</span>`;
      return `
        <a class="exam-btn" href="${g.file}" style="text-align:left;">
          <span class="code" style="font-size:0.9rem;">${g.icon || '📘'} Guide</span>
          <span class="name" style="color:var(--text);font-size:1rem;margin-bottom:8px;">${g.title}</span>
          ${badge}
        </a>`;
    }
    return `
      <div class="exam-btn" style="text-align:left;opacity:0.4;cursor:not-allowed;">
        <span class="code" style="font-size:0.9rem;">${g.icon || '🔒'} Guide</span>
        <span class="name" style="color:var(--text);font-size:1rem;margin-bottom:8px;">${g.title}</span>
        <span style="color:var(--text-dim);font-size:0.7rem;">Coming soon</span>
      </div>`;
  }).join('');
  main.innerHTML = `
    <div class="card">
      <h3>Interactive Walkthroughs</h3>
      <p style="color:var(--text-dim);font-size:0.85rem;margin-bottom:20px;">
        Step-by-step guided tours with hints, knowledge checks, and XP tracking. Progress persists alongside your other AZ-104 state.
      </p>
      <div class="exam-grid" style="max-width:none;">${cards}</div>
    </div>
  `;
}

function renderSkillTree(main) {
  if (!examMeta.tabs.skillTree) {
    return renderComingSoon(main, 'Skill Tree', 'No skill tree authored for this exam yet.');
  }
  PWSkillTree.mount({ exam: examMeta, container: main });
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
