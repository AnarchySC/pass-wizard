/* Pass Wizard — quiz engine.
 *
 * Exam-agnostic port of the engine from the original quiz.html.
 *
 * API:
 *   PWQuiz.mount({ exam, container })  // Loads quiz-data.json relative to the
 *                                       // current page and renders the quiz
 *                                       // landing into `container`.
 *
 * Persistence is via pwLoad/pwSave from progress.js. Per-question stats live in
 * pwLoad(exam.code).quiz.track[qid] and session results in .quiz.sessions.
 *
 * Domain regexes come from exam.domains (string -> RegExp source). Pass threshold
 * and session size come from exam meta.
 */

const PWQuiz = (() => {
  // Per-mount state. Reset each time mount() is called.
  let state = null;

  /* ============ helpers ============ */

  function escHtml(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function buildDomainRegexes(domains) {
    // domains is { [name]: regex-source-string }
    const out = {};
    for (const [name, src] of Object.entries(domains || {})) {
      try {
        out[name] = new RegExp(src, 'i');
      } catch (e) {
        console.warn('bad domain regex for', name, e);
      }
    }
    return out;
  }

  function tagDomain(q, regexes) {
    if (!regexes) return 'General';
    const text = (q.question || '') + ' ' + Object.values(q.options || {}).join(' ');
    let best = 'General', bestScore = 0;
    for (const [name, re] of Object.entries(regexes)) {
      const matches = (text.match(re) || []).length;
      if (matches > bestScore) { bestScore = matches; best = name; }
    }
    return best;
  }

  function isBroken(q) {
    if (!q.question || q.question.length < 20) return true;
    if (/exhibit|following (image|diagram|table|screenshot)|as shown|see the|refer to the/i.test(q.question) && q.question.length < 100) return true;
    if (Object.keys(q.options || {}).length < 2) return true;
    const opts = Object.values(q.options || {});
    const avgOptLen = opts.reduce((s, o) => s + (o || '').length, 0) / (opts.length || 1);
    if (avgOptLen < 3) return true;
    return false;
  }

  function linkifyExplanation(text) {
    let html = escHtml(text);
    html = html.replace(/(https?:\/\/[^\s,)]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    return html;
  }

  function buildImagesHtml(images) {
    if (!images || images.length === 0) return '';
    let html = '<div class="q-images">';
    for (let i = 0; i < images.length; i++) {
      // Image data is base64. Embed as data URL. The base64 string is NOT user input
      // (it came from the local quiz-data.json file), so the data: URL is safe.
      html += `<img src="data:image/png;base64,${images[i]}" alt="Question diagram ${i + 1}" loading="lazy" data-zoom>`;
    }
    return html + '</div>';
  }

  /* ============ persistence ============ */

  function loadProgress() {
    return pwLoad(state.exam.code);
  }

  function saveProgress(p) {
    pwSave(state.exam.code, p);
  }

  function getTrack() {
    return loadProgress().quiz.track || {};
  }

  function getSessions() {
    return loadProgress().quiz.sessions || [];
  }

  function recordQuestion(qId, result) {
    const p = loadProgress();
    p.quiz.track = p.quiz.track || {};
    if (!p.quiz.track[qId]) {
      p.quiz.track[qId] = { seen: 0, correct: 0, wrong: 0, streak: 0, known: false, lastSeen: null };
    }
    const t = p.quiz.track[qId];
    t.seen++;
    t.lastSeen = new Date().toISOString();
    if (result === 'correct') {
      t.correct++;
      t.streak = (t.streak > 0 ? t.streak : 0) + 1;
      if (t.streak >= 5) t.known = true;
    } else if (result === 'wrong') {
      t.wrong++;
      t.streak = 0;
      t.known = false;
    }
    saveProgress(p);
  }

  function recordSession(result) {
    const p = loadProgress();
    p.quiz.sessions = p.quiz.sessions || [];
    p.quiz.sessions.push({
      date: new Date().toISOString(),
      correct: result.correct,
      wrong: result.wrong,
      skipped: result.skipped,
      pct: result.pct,
      mode: result.mode,
      domain: result.domain || null,
    });
    if (p.quiz.sessions.length > 100) p.quiz.sessions.splice(0, p.quiz.sessions.length - 100);
    saveProgress(p);
  }

  /* ============ pool selection ============ */

  function getPoolStats() {
    const pool = state.questions.filter(q => !isBroken(q));
    const track = getTrack();
    let unseen = 0, weak = 0, learning = 0, strong = 0, known = 0;
    for (const q of pool) {
      const t = track[q.id];
      if (!t || t.seen === 0) unseen++;
      else if (t.known) known++;
      else if (t.wrong > t.correct || t.streak <= -2) weak++;
      else if (t.correct > 0 && t.streak >= 3) strong++;
      else learning++;
    }
    return { unseen, weak, learning, strong, known, total: pool.length };
  }

  function getDomainCounts() {
    const pool = state.questions.filter(q => !isBroken(q));
    const counts = {};
    for (const q of pool) {
      const d = tagDomain(q, state.domainRegexes);
      counts[d] = (counts[d] || 0) + 1;
    }
    return counts;
  }

  function selectWeightedQuestions(count, mode, domain) {
    let pool = state.questions.filter(q => !isBroken(q));
    if (mode === 'domain' && domain) {
      pool = pool.filter(q => tagDomain(q, state.domainRegexes) === domain);
    }
    const track = getTrack();
    const unseen = [], weakQ = [], learning = [], strong = [], known = [];
    for (const q of pool) {
      const t = track[q.id];
      if (!t || t.seen === 0) unseen.push(q);
      else if (t.known) known.push(q);
      else if (t.wrong > t.correct || t.streak <= -2) weakQ.push(q);
      else if (t.correct > 0 && t.streak >= 3) strong.push(q);
      else learning.push(q);
    }
    let weighted = [];
    if (mode === 'weak') {
      for (const q of weakQ) for (let i = 0; i < 5; i++) weighted.push(q);
      for (const q of learning) for (let i = 0; i < 2; i++) weighted.push(q);
      if (weighted.length < count) for (const q of unseen) weighted.push(q);
      if (weighted.length < count) for (const q of strong) weighted.push(q);
    } else {
      for (const q of weakQ) for (let i = 0; i < 5; i++) weighted.push(q);
      for (const q of unseen) for (let i = 0; i < 3; i++) weighted.push(q);
      for (const q of learning) for (let i = 0; i < 2; i++) weighted.push(q);
      for (const q of strong) weighted.push(q);
      if (weighted.length < count) for (const q of known) weighted.push(q);
    }
    const shuffled = shuffle(weighted);
    const selected = [], usedIds = new Set();
    for (const q of shuffled) {
      if (usedIds.has(q.id)) continue;
      usedIds.add(q.id);
      selected.push(q);
      if (selected.length >= count) break;
    }
    return selected;
  }

  /* ============ timer ============ */

  function startTimer() {
    stopTimer();
    if (!state.timerEnabled) {
      const el = state.container.querySelector('#pw-timer');
      if (el) el.style.display = 'none';
      return;
    }
    state.timerSeconds = 120;
    const el = state.container.querySelector('#pw-timer');
    if (el) { el.style.display = ''; updateTimerDisplay(); }
    state.timerInterval = setInterval(() => {
      state.timerSeconds--;
      updateTimerDisplay();
      if (state.timerSeconds <= 0) { stopTimer(); skipQuestion(); }
    }, 1000);
  }

  function stopTimer() {
    if (state && state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
  }

  function updateTimerDisplay() {
    const el = state.container.querySelector('#pw-timer');
    if (!el) return;
    const m = Math.floor(state.timerSeconds / 60);
    const s = state.timerSeconds % 60;
    el.textContent = `${m}:${s.toString().padStart(2, '0')}`;
    el.className = 'timer' + (state.timerSeconds <= 30 ? ' danger' : state.timerSeconds <= 60 ? ' warn' : '');
  }

  /* ============ landing ============ */

  function renderLanding() {
    const pools = getPoolStats();
    const sessions = getSessions();
    const passT = state.exam.passThreshold || 70;
    let stats = '';
    if (sessions.length > 0) {
      const avg = Math.round(sessions.reduce((s, x) => s + x.pct, 0) / sessions.length);
      const best = Math.max(...sessions.map(s => s.pct));
      stats = `
        <div style="display:flex;gap:24px;flex-wrap:wrap;justify-content:center;font-size:0.85rem;margin-bottom:24px;">
          <span><span style="color:var(--text-dim);">Sessions:</span> <span style="font-family:var(--font-mono);color:var(--accent);">${sessions.length}</span></span>
          <span><span style="color:var(--text-dim);">Average:</span> <span style="font-family:var(--font-mono);color:${avg >= passT ? 'var(--correct)' : 'var(--wrong)'};">${avg}%</span></span>
          <span><span style="color:var(--text-dim);">Best:</span> <span style="font-family:var(--font-mono);color:var(--correct);">${best}%</span></span>
          <span><span style="color:var(--text-dim);">Weak:</span> <span style="font-family:var(--font-mono);color:var(--wrong);">${pools.weak}</span></span>
          <span><span style="color:var(--text-dim);">Known:</span> <span style="font-family:var(--font-mono);color:var(--correct);">${pools.known}</span></span>
        </div>
      `;
    }

    const weakDisabled = pools.weak === 0;
    const counts = getDomainCounts();
    const domainHtml = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, n]) => `<button class="domain-btn" data-action="start-domain" data-domain="${escHtml(name)}">${escHtml(name)}<span class="d-count">${n}</span></button>`)
      .join('');

    state.container.innerHTML = `
      <div class="quiz-landing">
        <h2>Practice Quiz</h2>
        <p class="sub">${state.exam.sessionSize} questions per session. Pass threshold ${passT}%.</p>
        ${stats}
        <div class="mode-row">
          <div class="mode-card" data-action="start-normal">
            <div class="mc-title">Study Mode</div>
            <div class="mc-sub">Weighted random — focuses on weak + unseen.</div>
          </div>
          <div class="mode-card ${weakDisabled ? 'disabled' : ''}" ${weakDisabled ? '' : 'data-action="start-weak"'}>
            <div class="mc-title">Weak Only</div>
            <div class="mc-sub">${pools.weak} weak question${pools.weak === 1 ? '' : 's'} in pool.</div>
          </div>
        </div>
        <div style="margin-top:8px;">
          <div style="font-size:0.75rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">By Domain</div>
          <div class="domain-grid">${domainHtml}</div>
        </div>
        <div style="margin-top:24px;display:flex;gap:8px;justify-content:center;align-items:center;font-size:0.8rem;color:var(--text-dim);">
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
            <input type="checkbox" id="pw-timer-toggle" ${state.timerEnabled ? 'checked' : ''}> Enable 2-min timer per question
          </label>
        </div>
      </div>
    `;
    bindLandingEvents();
  }

  function bindLandingEvents() {
    state.container.querySelectorAll('[data-action]').forEach(el => {
      el.addEventListener('click', e => {
        const action = el.getAttribute('data-action');
        if (action === 'start-normal') startQuiz('normal');
        else if (action === 'start-weak') startQuiz('weak');
        else if (action === 'start-domain') startQuiz('domain', el.getAttribute('data-domain'));
      });
    });
    const tt = state.container.querySelector('#pw-timer-toggle');
    if (tt) tt.addEventListener('change', () => { state.timerEnabled = tt.checked; });
  }

  /* ============ quiz session ============ */

  function startQuiz(mode, domain) {
    state.sessionMode = mode || 'normal';
    state.sessionDomain = domain || '';
    state.session = selectWeightedQuestions(state.exam.sessionSize || 25, state.sessionMode, state.sessionDomain);
    if (state.session.length === 0) {
      alert('No questions available for this selection.');
      return;
    }
    state.currentIdx = 0;
    state.answers = state.session.map(() => ({ selected: [], checked: false, result: 'unanswered' }));
    state.locked = false;
    renderQuizShell();
    renderQuestion();
  }

  function renderQuizShell() {
    let modeBadge = '';
    if (state.sessionMode === 'weak') modeBadge = '<span class="session-mode">WEAK ONLY</span>';
    else if (state.sessionMode === 'domain') modeBadge = `<span class="session-mode domain">${escHtml(state.sessionDomain)}</span>`;

    state.container.innerHTML = `
      <div id="pw-quiz-root">
        <div class="quiz-header">
          <div class="quiz-header-left">
            <button class="back-btn" data-action="exit-quiz">&larr; Exit</button>
            <span class="exam-badge">${escHtml(state.exam.code)}</span>
            ${modeBadge}
          </div>
          <div class="progress-area">
            <span class="timer" id="pw-timer" style="display:none;">2:00</span>
            <span class="progress-text" id="pw-progress-text"></span>
            <div class="progress-bar"><div class="progress-fill" id="pw-progress-fill"></div></div>
          </div>
        </div>
        <div class="history-bar">
          <span class="history-label">Session</span>
          <div class="history-dots" id="pw-history-dots"></div>
        </div>
        <div id="pw-question-area"></div>
        <div class="btn-row">
          <button class="btn-quiz primary" id="pw-check-btn" data-action="check" disabled>Check Answer</button>
          <button class="btn-quiz primary" id="pw-next-btn" data-action="next" style="display:none;">Next Question</button>
          <button class="btn-quiz ghost" id="pw-skip-btn" data-action="skip">Skip</button>
        </div>
        <div class="key-hints">
          <span class="key-hint"><kbd>A</kbd>-<kbd>F</kbd> Select</span>
          <span class="key-hint"><kbd>Enter</kbd> Check / Next</span>
          <span class="key-hint"><kbd>S</kbd> Skip</span>
        </div>
      </div>
    `;
    state.container.querySelector('[data-action="exit-quiz"]').addEventListener('click', () => {
      stopTimer();
      renderLanding();
    });
    state.container.querySelector('#pw-check-btn').addEventListener('click', checkAnswer);
    state.container.querySelector('#pw-next-btn').addEventListener('click', nextQuestion);
    state.container.querySelector('#pw-skip-btn').addEventListener('click', skipQuestion);
  }

  function renderQuestion() {
    const q = state.session[state.currentIdx];
    const a = state.answers[state.currentIdx];
    state.locked = a.checked;
    if (!state.locked) startTimer(); else stopTimer();

    const answered = state.answers.filter(x => x.checked || x.result === 'skipped').length;
    state.container.querySelector('#pw-progress-text').textContent = `${answered}/${state.session.length}`;
    state.container.querySelector('#pw-progress-fill').style.width = `${(answered / state.session.length) * 100}%`;

    const dots = state.container.querySelector('#pw-history-dots');
    dots.innerHTML = '';
    for (let i = 0; i < state.session.length; i++) {
      const dot = document.createElement('div');
      dot.className = `h-dot ${state.answers[i].result}${i === state.currentIdx ? ' current' : ''}`;
      dot.textContent = i + 1;
      dot.addEventListener('click', () => { state.currentIdx = i; renderQuestion(); });
      dots.appendChild(dot);
    }

    const isMulti = q.type === 'multiple';
    let badges = '';
    if (isMulti) badges += `<span class="q-badge multi">SELECT ${q.correct.length}</span>`;
    const domain = tagDomain(q, state.domainRegexes);
    badges += `<span class="q-badge domain-tag">${escHtml(domain)}</span>`;
    const track = getTrack();
    const history = track[q.id];
    if (history && history.seen > 0) {
      const streakInfo = history.streak > 0 ? ` | streak: ${history.streak}/5` : '';
      const poolLabel = history.known ? ' | KNOWN' : (history.wrong > history.correct ? ' | WEAK' : '');
      badges += `<span class="q-badge seen">SEEN ${history.seen}x — ${history.correct}/${history.seen}${streakInfo}${poolLabel}</span>`;
    }
    if (isBroken(q)) badges += `<span class="q-badge broken">MAY BE INCOMPLETE</span>`;

    let optionsHtml = '';
    for (const letter of Object.keys(q.options).sort()) {
      let extraClass = '';
      if (state.locked) {
        extraClass = ' locked';
        if (q.correct.includes(letter)) extraClass += ' correct-answer';
        else if (a.selected.includes(letter)) extraClass += ' wrong-answer';
      } else if (a.selected.includes(letter)) {
        extraClass = ' selected';
      }
      optionsHtml += `<div class="option${extraClass}" data-option="${escHtml(letter)}"><div class="option-letter">${escHtml(letter)}</div><div class="option-text">${escHtml(q.options[letter])}</div></div>`;
    }

    let explanationHtml = '';
    if (q.explanation) {
      explanationHtml = `<div class="explanation${state.locked ? ' show' : ''}"><div class="explanation-label">Explanation</div><div class="explanation-text">${linkifyExplanation(q.explanation)}</div></div>`;
    }

    const area = state.container.querySelector('#pw-question-area');
    area.innerHTML = `
      <div class="question-card">
        <div class="q-number">Question ${state.currentIdx + 1} of ${state.session.length} ${badges} <span style="float:right;font-size:0.65rem;color:var(--text-dim);">${escHtml(q.id)}</span></div>
        <div class="q-text">${escHtml(q.question)}</div>
        ${buildImagesHtml(q.images)}
        <div class="options-list">${optionsHtml}</div>
        ${explanationHtml}
      </div>
    `;

    area.querySelectorAll('.option').forEach(el => {
      el.addEventListener('click', () => selectOption(el.getAttribute('data-option')));
    });
    area.querySelectorAll('img[data-zoom]').forEach(img => {
      img.addEventListener('click', () => zoomImage(img));
    });

    const checkBtn = state.container.querySelector('#pw-check-btn');
    const nextBtn = state.container.querySelector('#pw-next-btn');
    const skipBtn = state.container.querySelector('#pw-skip-btn');
    if (state.locked) {
      checkBtn.style.display = 'none';
      nextBtn.style.display = '';
      skipBtn.style.display = 'none';
      nextBtn.textContent = state.currentIdx < state.session.length - 1 ? 'Next Question' : 'See Results';
    } else {
      checkBtn.style.display = '';
      nextBtn.style.display = 'none';
      skipBtn.style.display = '';
      checkBtn.disabled = a.selected.length === 0;
    }
  }

  function selectOption(letter) {
    if (state.locked) return;
    const q = state.session[state.currentIdx];
    const a = state.answers[state.currentIdx];
    if (q.type === 'multiple') {
      const i = a.selected.indexOf(letter);
      if (i >= 0) a.selected.splice(i, 1);
      else a.selected.push(letter);
    } else {
      a.selected = [letter];
    }
    renderQuestion();
  }

  function checkAnswer() {
    const q = state.session[state.currentIdx];
    const a = state.answers[state.currentIdx];
    if (a.selected.length === 0) return;
    a.checked = true;
    stopTimer();
    const cs = new Set(q.correct), ss = new Set(a.selected);
    a.result = (cs.size === ss.size && [...cs].every(c => ss.has(c))) ? 'correct' : 'wrong';
    recordQuestion(q.id, a.result);
    state.locked = true;
    renderQuestion();
  }

  function skipQuestion() {
    stopTimer();
    state.answers[state.currentIdx].result = 'skipped';
    if (state.currentIdx < state.session.length - 1) { state.currentIdx++; renderQuestion(); }
    else showResults();
  }

  function nextQuestion() {
    if (state.currentIdx < state.session.length - 1) { state.currentIdx++; renderQuestion(); }
    else showResults();
  }

  function zoomImage(img) {
    if (img.classList.contains('zoomed')) {
      img.classList.remove('zoomed');
      const overlay = document.querySelector('.zoom-overlay');
      if (overlay) overlay.remove();
      return;
    }
    const overlay = document.createElement('div');
    overlay.className = 'zoom-overlay';
    overlay.addEventListener('click', () => { img.classList.remove('zoomed'); overlay.remove(); });
    document.body.appendChild(overlay);
    img.classList.add('zoomed');
  }

  /* ============ results ============ */

  function showResults() {
    stopTimer();
    const correct = state.answers.filter(a => a.result === 'correct').length;
    const wrong = state.answers.filter(a => a.result === 'wrong').length;
    const skipped = state.answers.filter(a => a.result === 'skipped' || a.result === 'unanswered').length;
    const pct = Math.round((correct / state.session.length) * 100);
    const threshold = state.exam.passThreshold || 70;
    const pass = pct >= threshold;
    let label = `${state.exam.code} — ${state.exam.name}`;
    if (state.sessionMode === 'weak') label += ' [Weak Only]';
    if (state.sessionMode === 'domain') label += ` [${state.sessionDomain}]`;

    const circ = 2 * Math.PI * 78;

    state.container.innerHTML = `
      <div class="results-card">
        <h2 class="results-title">Session Complete</h2>
        <div class="results-exam">${escHtml(label)}</div>
        <div class="score-ring">
          <svg width="180" height="180" viewBox="0 0 180 180">
            <circle class="bg" cx="90" cy="90" r="78"></circle>
            <circle class="fill" id="pw-score-circle" cx="90" cy="90" r="78"
                    stroke="${pass ? 'var(--correct)' : 'var(--wrong)'}"
                    stroke-dasharray="${circ}" stroke-dashoffset="${circ}"></circle>
          </svg>
          <div class="score-number">
            <div class="score-pct">${pct}%</div>
            <div class="score-label">Score</div>
          </div>
        </div>
        <div class="score-pass ${pass ? 'pass' : 'fail'}">${pass ? `PASS (need ${threshold}%)` : `FAIL (need ${threshold}%)`}</div>
        <div class="stats-row">
          <div class="stat-item"><div class="stat-num correct-color">${correct}</div><div class="stat-label">Correct</div></div>
          <div class="stat-item"><div class="stat-num wrong-color">${wrong}</div><div class="stat-label">Wrong</div></div>
          <div class="stat-item"><div class="stat-num skip-color">${skipped}</div><div class="stat-label">Skipped</div></div>
        </div>
      </div>
      <div class="results-btns">
        <button class="btn-quiz primary" data-action="new-session">New Session</button>
        <button class="btn-quiz ghost" data-action="review-wrong">Review Wrong Answers</button>
        <button class="btn-quiz ghost" data-action="back-landing">Back to Quiz Menu</button>
      </div>
      <div class="review-section" id="pw-review-section" style="display:none;"></div>
    `;

    requestAnimationFrame(() => {
      const c = state.container.querySelector('#pw-score-circle');
      if (c) c.style.strokeDashoffset = circ - (circ * pct / 100);
    });

    state.container.querySelector('[data-action="new-session"]').addEventListener('click', () => startQuiz(state.sessionMode, state.sessionDomain));
    state.container.querySelector('[data-action="review-wrong"]').addEventListener('click', reviewWrong);
    state.container.querySelector('[data-action="back-landing"]').addEventListener('click', renderLanding);

    recordSession({ correct, wrong, skipped, pct, mode: state.sessionMode, domain: state.sessionDomain });
  }

  function reviewWrong() {
    const section = state.container.querySelector('#pw-review-section');
    const wrongIdxs = state.answers.map((a, i) => a.result === 'wrong' ? i : -1).filter(i => i >= 0);
    if (wrongIdxs.length === 0) {
      section.innerHTML = '<p style="color:var(--correct);text-align:center;padding:20px;">No wrong answers.</p>';
      section.style.display = 'block';
      return;
    }
    const track = getTrack();
    let html = `<div class="review-title">Review: ${wrongIdxs.length} wrong</div>`;
    for (const idx of wrongIdxs) {
      const q = state.session[idx];
      const a = state.answers[idx];
      let optHtml = '';
      for (const [letter, text] of Object.entries(q.options)) {
        let cls = '';
        if (q.correct.includes(letter)) cls = 'correct-answer';
        else if (a.selected.includes(letter)) cls = 'wrong-answer';
        optHtml += `<div class="option locked ${cls}"><div class="option-letter">${escHtml(letter)}</div><div class="option-text">${escHtml(text)}</div></div>`;
      }
      const hist = track[q.id];
      const histNote = hist ? `<span style="font-size:0.7rem;color:var(--text-dim);"> — ${hist.wrong}x wrong / ${hist.seen} total</span>` : '';
      html += `<div class="question-card" style="margin-bottom:16px;">
        <div class="q-number">Q${idx + 1} <span class="q-badge domain-tag">${escHtml(tagDomain(q, state.domainRegexes))}</span><span style="float:right;font-size:0.65rem;color:var(--text-dim);">${escHtml(q.id)}${histNote}</span></div>
        <div class="q-text">${escHtml(q.question)}</div>
        ${buildImagesHtml(q.images)}
        <div class="options-list">${optHtml}</div>
        ${q.explanation ? `<div class="explanation show"><div class="explanation-label">Explanation</div><div class="explanation-text">${linkifyExplanation(q.explanation)}</div></div>` : ''}
      </div>`;
    }
    section.innerHTML = html;
    section.style.display = 'block';
    section.scrollIntoView({ behavior: 'smooth' });
  }

  /* ============ keyboard ============ */

  function handleKey(e) {
    if (!state || !state.session) return;
    if (!state.container.querySelector('#pw-quiz-root')) return;
    const key = e.key.toUpperCase();
    if ('ABCDEF'.includes(key) && !state.locked) {
      const q = state.session[state.currentIdx];
      if (q.options[key]) selectOption(key);
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!state.locked && state.answers[state.currentIdx].selected.length > 0) checkAnswer();
      else if (state.locked) nextQuestion();
    }
    if (key === 'S' && !state.locked) skipQuestion();
  }

  /* ============ public API ============ */

  async function mount({ exam, container }) {
    if (state) {
      // Tearing down a previous mount.
      stopTimer();
      document.removeEventListener('keydown', state.keyHandler);
    }
    state = {
      exam,
      container,
      questions: [],
      domainRegexes: buildDomainRegexes(exam.domains),
      session: [],
      answers: [],
      currentIdx: 0,
      locked: false,
      sessionMode: 'normal',
      sessionDomain: '',
      timerEnabled: false,
      timerInterval: null,
      timerSeconds: 0,
      keyHandler: null,
    };
    container.innerHTML = '<div class="coming-soon"><h2>Loading questions…</h2></div>';
    try {
      const res = await fetch('quiz-data.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      state.questions = await res.json();
    } catch (e) {
      container.innerHTML = `
        <div class="coming-soon">
          <h2>Quiz data unavailable</h2>
          <p>Could not load <code>quiz-data.json</code> for this exam.</p>
          <p style="margin-top:16px;font-size:0.85rem;">
            ${escHtml(e.message)}
          </p>
          <p style="margin-top:16px;font-size:0.85rem;">
            The question bank lives outside the git repo (<code>.gitignore</code>'d) for IP reasons.
            See <code>DECISIONS.md</code> for context.
          </p>
        </div>
      `;
      return;
    }
    state.keyHandler = handleKey;
    document.addEventListener('keydown', state.keyHandler);
    renderLanding();
  }

  return { mount };
})();
