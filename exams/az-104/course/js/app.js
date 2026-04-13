// ============================================
// AZ-104 Course - Interactive Functionality
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initTaskToggles();
  initHints();
  initProgress();
  initQuizzes();
  initTroubleshoot();
  initArchitect();
});

// Tab switching
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.tab-container');
      group.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      group.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });
}

// Collapsible task blocks
function initTaskToggles() {
  document.querySelectorAll('.task-header').forEach(header => {
    header.addEventListener('click', () => {
      header.closest('.task-block').classList.toggle('open');
    });
  });
  // Open first task by default
  const first = document.querySelector('.tab-content.active .task-block');
  if (first) first.classList.add('open');
}

// Hint reveal
function initHints() {
  document.querySelectorAll('.hint').forEach(hint => {
    hint.addEventListener('click', () => hint.classList.toggle('revealed'));
  });
}

// Progress tracking with localStorage
function initProgress() {
  const pageId = document.body.dataset.module || 'index';
  document.querySelectorAll('.completion-check').forEach(cb => {
    const key = `az104_${pageId}_${cb.dataset.task}`;
    cb.checked = localStorage.getItem(key) === 'true';
    cb.addEventListener('change', () => {
      localStorage.setItem(key, cb.checked);
      updateProgressBar(pageId);
    });
  });
  updateProgressBar(pageId);
}

function updateProgressBar(pageId) {
  const checks = document.querySelectorAll('.completion-check');
  if (!checks.length) return;
  const done = [...checks].filter(c => c.checked).length;
  const pct = Math.round((done / checks.length) * 100);
  const bar = document.querySelector('.progress-bar');
  if (bar) bar.style.width = pct + '%';
  const label = document.querySelector('.progress-label');
  if (label) label.textContent = `${done}/${checks.length} completed`;
}

// ============================================
// Scenario Quizzes
// ============================================
function initQuizzes() {
  const pageId = document.body.dataset.module || 'index';

  // Restore saved state
  document.querySelectorAll('.quiz-card').forEach(card => {
    const qid = card.dataset.qid;
    const saved = localStorage.getItem(`az104_${pageId}_quiz_${qid}`);
    if (saved) restoreQuiz(card, saved);
  });

  // Click handler
  document.querySelectorAll('.quiz-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const card = opt.closest('.quiz-card');
      if (card.classList.contains('answered')) return;

      const correct = card.dataset.answer;
      const chosen = opt.dataset.value;
      const qid = card.dataset.qid;

      // Mark all options
      card.querySelectorAll('.quiz-option').forEach(o => {
        o.classList.add('disabled');
        if (o.dataset.value === correct) o.classList.add('correct');
        if (o === opt && chosen !== correct) o.classList.add('wrong');
        if (o === opt) o.classList.add('selected');
      });

      card.classList.add('answered');
      card.classList.add(chosen === correct ? 'answered-correct' : 'answered-wrong');

      // Save
      localStorage.setItem(`az104_${pageId}_quiz_${qid}`, chosen);
      updateQuizScore();
    });
  });

  // Reset button
  document.querySelectorAll('.reset-quiz-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.quiz-card').forEach(card => {
        const qid = card.dataset.qid;
        localStorage.removeItem(`az104_${pageId}_quiz_${qid}`);
        card.classList.remove('answered', 'answered-correct', 'answered-wrong');
        card.querySelectorAll('.quiz-option').forEach(o => {
          o.classList.remove('disabled', 'correct', 'wrong', 'selected');
        });
      });
      // Reset architect cards too
      document.querySelectorAll('.architect-card').forEach(card => {
        const aid = card.dataset.aid;
        localStorage.removeItem(`az104_${pageId}_arch_${aid}`);
        card.classList.remove('answered');
        card.querySelectorAll('.arch-option').forEach(o => {
          o.classList.remove('disabled', 'selected', 'best');
        });
      });
      updateQuizScore();
    });
  });

  updateQuizScore();
}

function restoreQuiz(card, chosen) {
  const correct = card.dataset.answer;
  card.querySelectorAll('.quiz-option').forEach(o => {
    o.classList.add('disabled');
    if (o.dataset.value === correct) o.classList.add('correct');
    if (o.dataset.value === chosen && chosen !== correct) o.classList.add('wrong');
    if (o.dataset.value === chosen) o.classList.add('selected');
  });
  card.classList.add('answered');
  card.classList.add(chosen === correct ? 'answered-correct' : 'answered-wrong');
}

function updateQuizScore() {
  const cards = document.querySelectorAll('.quiz-card');
  if (!cards.length) return;
  const answered = document.querySelectorAll('.quiz-card.answered').length;
  const correct = document.querySelectorAll('.quiz-card.answered-correct').length;
  const scoreEl = document.querySelector('.quiz-score');
  if (scoreEl) {
    if (answered === 0) {
      scoreEl.textContent = 'No questions answered yet';
    } else {
      scoreEl.innerHTML = `<strong>${correct}/${cards.length}</strong> correct`;
    }
  }
}

// ============================================
// Troubleshooting Progressive Hints
// ============================================
function initTroubleshoot() {
  document.querySelectorAll('.prog-hint').forEach(hint => {
    hint.addEventListener('click', () => {
      hint.classList.toggle('revealed');
    });
  });
}

// ============================================
// Architect's Corner
// ============================================
function initArchitect() {
  const pageId = document.body.dataset.module || 'index';

  // Restore saved state
  document.querySelectorAll('.architect-card').forEach(card => {
    const aid = card.dataset.aid;
    const saved = localStorage.getItem(`az104_${pageId}_arch_${aid}`);
    if (saved) restoreArchitect(card, saved);
  });

  document.querySelectorAll('.arch-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const card = opt.closest('.architect-card');
      if (card.classList.contains('answered')) return;

      const best = card.dataset.best;
      const aid = card.dataset.aid;

      card.querySelectorAll('.arch-option').forEach(o => {
        o.classList.add('disabled');
        if (o.dataset.value === best) o.classList.add('best');
        if (o === opt) o.classList.add('selected');
      });

      card.classList.add('answered');
      localStorage.setItem(`az104_${pageId}_arch_${aid}`, opt.dataset.value);
    });
  });
}

function restoreArchitect(card, chosen) {
  const best = card.dataset.best;
  card.querySelectorAll('.arch-option').forEach(o => {
    o.classList.add('disabled');
    if (o.dataset.value === best) o.classList.add('best');
    if (o.dataset.value === chosen) o.classList.add('selected');
  });
  card.classList.add('answered');
}
