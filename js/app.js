/* Pass Wizard — landing + router.
 *
 * For v1 we use per-exam static HTML pages (exams/<code>/index.html) rather than a
 * hash router, to keep things dead simple and SEO-visible. This file's job is:
 *
 *   1. Populate the landing page exam grid from EXAMS[].
 *   2. Show per-exam progress summary on each card.
 */

const EXAMS = [
  {
    code: 'AZ-104',
    name: 'Azure Administrator',
    slug: 'az-104',
    questionCount: 497,
    tabs: { course: true, quiz: true, skillTree: false, companion: false },
  },
  {
    code: 'AZ-400',
    name: 'DevOps Engineer',
    slug: 'az-400',
    questionCount: 336,
    tabs: { course: false, quiz: true, skillTree: false, companion: false },
  },
  {
    code: 'AZ-305',
    name: 'Solutions Architect',
    slug: 'az-305',
    questionCount: 221,
    tabs: { course: false, quiz: true, skillTree: false, companion: false },
  },
  {
    code: 'PSM-I',
    name: 'Scrum Master',
    slug: 'psm-i',
    questionCount: 239,
    tabs: { course: false, quiz: true, skillTree: false, companion: false },
  },
];

function renderExamGrid() {
  const grid = document.getElementById('examGrid');
  if (!grid) return;
  grid.innerHTML = EXAMS.map(exam => {
    const summary = (typeof pwSummary === 'function') ? pwSummary(exam.code) : null;
    const stats = summary && summary.answeredCount > 0
      ? `<div class="tabs-avail" style="margin-top:8px;">
           <span class="ta on">${summary.correct} right</span>
           <span class="ta off">${summary.wrong} wrong</span>
         </div>`
      : '';
    const tabsAvail = `
      <div class="tabs-avail">
        <span class="ta ${exam.tabs.course ? 'on' : 'off'}">Course</span>
        <span class="ta ${exam.tabs.quiz ? 'on' : 'off'}">Quiz</span>
        <span class="ta ${exam.tabs.skillTree ? 'on' : 'off'}">Tree</span>
        <span class="ta ${exam.tabs.companion ? 'on' : 'off'}">Story</span>
      </div>`;
    return `
      <a class="exam-btn" href="exams/${exam.slug}/">
        <span class="code">${exam.code}</span>
        <span class="name">${exam.name}</span>
        <span class="count">${exam.questionCount} questions</span>
        ${tabsAvail}
        ${stats}
      </a>
    `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', renderExamGrid);
