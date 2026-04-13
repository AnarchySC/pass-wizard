/* Pass Wizard — quiz engine.
 *
 * Extracted from the original quiz.html, made exam-agnostic.
 *
 * TODO (next commit): port the full engine from ~/Documents/Certification Courses/quiz.html:
 *   - selectWeightedQuestions(exam, count, mode, domain)
 *   - tagDomain(q)
 *   - session lifecycle (start, check, skip, next, finish)
 *   - results view with score ring + review
 *   - keyboard shortcuts (A-F, Enter, S)
 *
 * This stub exists so exam pages can `<script src="../../js/quiz-engine.js">` without 404ing
 * during the scaffold commit. It will be replaced in the engine-extraction commit.
 */

const PW_ENGINE_VERSION = '0.0.1-stub';

function pwQuizInit(opts) {
  console.warn('quiz-engine.js is a stub. Extraction commit pending. opts:', opts);
}
