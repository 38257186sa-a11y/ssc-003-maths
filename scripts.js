
function qs(sel, ctx=document) { return ctx.querySelector(sel) }
function qsa(sel, ctx=document) { return Array.from(ctx.querySelectorAll(sel)) }

async function init() {
  const params = new URLSearchParams(location.search);
  const setFile = params.get('set') || 'quizzes/algebra-set1.json';
  const titleEl = qs('#title');
  const metaEl = qs('#meta');
  const quizArea = qs('#quiz-area');
  const tpl = qs('#question-tpl');

  let data;
  try {
    const res = await fetch(setFile);
    if (!res.ok) throw new Error('Not found: '+setFile);
    data = await res.json();
  } catch (err) {
    titleEl.textContent = 'Could not load quiz';
    metaEl.textContent = err.message;
    return;
  }

  document.title = data.title || 'SSC Quiz';
  titleEl.textContent = data.title || 'SSC Quiz';
  metaEl.textContent = data.description || '';

  // state
  let idx = 0;
  let userAnswers = new Array(data.questions.length).fill(null);

  function renderQuestion(i) {
    quizArea.innerHTML = '';
    const q = data.questions[i];
    const node = tpl.content.cloneNode(true);
    qs('[data-qno]', node).textContent = `Question ${i+1} of ${data.questions.length}`;
    qs('[data-q]', node).innerHTML = q.q;
    const optionsCont = qs('[data-options]', node);
    q.options.forEach((opt, j) => {
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.style.display='block';
      btn.style.margin='8px 0';
      btn.type = 'button';
      btn.tabIndex = 0;
      btn.innerHTML = opt;
      btn.addEventListener('click', () => {
        userAnswers[i] = j;
        // show selection UI
        qsa('.card .btn', quizArea).forEach(b => b.style.opacity=0.5);
        btn.style.opacity = 1;
        // reveal hint after answer
        if (q.hint) qs('[data-hint]', node).style.display = 'block';
        qs('[data-hint]', node).textContent = q.hint || '';
        // reveal explanation
        if (q.explanation) qs('[data-explain]', node).style.display = 'block';
        qs('[data-explain]', node).textContent = q.explanation || '';
        updateScore();
      });
      optionsCont.appendChild(btn);
    });

    if (q.hint) {
      qs('[data-hint]', node).style.display = 'none';
    }
    quizArea.appendChild(node);
    updateScore();
  }

  function updateScore() {
    const correct = userAnswers.reduce((acc, ans, i) => {
      if (ans === data.questions[i].answer) return acc+1;
      return acc;
    }, 0);
    qs('#score-area').textContent = `Score: ${correct} / ${data.questions.length}`;
  }

  qs('#prev').addEventListener('click', () => {
    if (idx>0) { idx--; renderQuestion(idx); }
  });
  qs('#next').addEventListener('click', () => {
    if (idx < data.questions.length-1) { idx++; renderQuestion(idx); }
  });

  // initial render
  renderQuestion(idx);
}

init();
