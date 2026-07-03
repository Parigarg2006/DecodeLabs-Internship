/* ==========================================================================
   SIGNAL LAB — script.js
   Every module below follows the same contract taught in Project 3:

     INPUT   -> an event listener detects a user action
     PROCESS -> a small, single-purpose function evaluates state
     OUTPUT  -> the DOM is mutated (textContent / classList / style)

   Conventions used throughout:
     - const is the default. let is used only where a value must mutate.
     - var is never used.
     - textContent is used for all dynamic text (never innerHTML).
     - "js-" classes are DOM hooks only. "is-" classes represent state only.
   ========================================================================== */

(() => {
  'use strict';

  /* ------------------------------------------------------------------ */
  /*  Shared: IPO Trace Console                                          */
  /*  Every module calls logSignal() so the whole page narrates its own  */
  /*  Input -> Process -> Output loop in one place.                      */
  /* ------------------------------------------------------------------ */

  const nodeInput = document.querySelector('.js-node-input');
  const nodeProcess = document.querySelector('.js-node-process');
  const nodeOutput = document.querySelector('.js-node-output');

  const detailInput = document.querySelector('.js-node-input-detail');
  const detailProcess = document.querySelector('.js-node-process-detail');
  const detailOutput = document.querySelector('.js-node-output-detail');

  const traceLog = document.querySelector('.js-trace-log');
  const MAX_LOG_ENTRIES = 6;

  const pulse = (node) => {
    node.classList.add('is-pulsing');
    window.setTimeout(() => node.classList.remove('is-pulsing'), 900);
  };

  const formatTime = (date) =>
    date.toLocaleTimeString('en-IN', { hour12: false });

  /**
   * logSignal — the single choke point every interactive module reports to.
   * @param {{input: string, process: string, output: string}} signal
   */
  const logSignal = (signal) => {
    detailInput.textContent = signal.input;
    detailProcess.textContent = signal.process;
    detailOutput.textContent = signal.output;

    pulse(nodeInput);
    window.setTimeout(() => pulse(nodeProcess), 150);
    window.setTimeout(() => pulse(nodeOutput), 300);

    const entry = document.createElement('li');

    const time = document.createElement('time');
    time.textContent = formatTime(new Date());

    const label = document.createElement('span');
    label.textContent = `${signal.input} → ${signal.process} → `;

    const outSpan = document.createElement('span');
    outSpan.className = 'log-out';
    outSpan.textContent = signal.output;

    label.appendChild(outSpan);
    entry.appendChild(time);
    entry.appendChild(label);

    traceLog.prepend(entry);

    while (traceLog.children.length > MAX_LOG_ENTRIES) {
      traceLog.removeChild(traceLog.lastElementChild);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Module 0: Theme Toggle                                             */
  /* ------------------------------------------------------------------ */

  const THEME_KEY = 'signal-lab-theme';
  const body = document.querySelector('.js-body');
  const themeToggle = document.querySelector('.js-theme-toggle');
  const themeLabel = document.querySelector('.js-theme-label');

  const applyTheme = (isDark) => {
    body.classList.toggle('is-dark', isDark);
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeLabel.textContent = isDark ? 'Dark' : 'Light';
  };

  const storedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(storedTheme ? storedTheme === 'dark' : prefersDark);

  themeToggle.addEventListener('click', () => {
    const isDark = !body.classList.contains('is-dark');
    applyTheme(isDark);
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');

    logSignal({
      input: 'click.themeToggle',
      process: `state.theme → ${isDark ? 'dark' : 'light'}`,
      output: 'body.classList mutated',
    });
  });

  /* ------------------------------------------------------------------ */
  /*  Module 1: Task Queue                                               */
  /* ------------------------------------------------------------------ */

  const taskForm = document.querySelector('.js-task-form');
  const taskInput = document.querySelector('.js-task-input');
  const taskList = document.querySelector('.js-task-list');
  const taskEmpty = document.querySelector('.js-task-empty');

  let taskCount = 0; // mutates on every add/remove, so `let` is correct here.

  const refreshEmptyState = () => {
    taskEmpty.classList.toggle('is-hidden', taskCount > 0);
  };

  const createTask = (text) => {
    const item = document.createElement('li');

    const label = document.createElement('span');
    label.className = 'task-text';
    label.textContent = text;

    const checkBtn = document.createElement('button');
    checkBtn.type = 'button';
    checkBtn.className = 'task-check';
    checkBtn.setAttribute('aria-label', 'Mark task complete');
    checkBtn.textContent = '✓';

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'task-remove';
    removeBtn.setAttribute('aria-label', 'Remove task');
    removeBtn.textContent = '✕';

    checkBtn.addEventListener('click', () => {
      const nowComplete = !item.classList.contains('is-complete');
      item.classList.toggle('is-complete', nowComplete);
      checkBtn.classList.toggle('is-active', nowComplete);

      logSignal({
        input: 'click.taskCheck',
        process: `task.complete → ${nowComplete}`,
        output: 'li.classList mutated',
      });
    });

    removeBtn.addEventListener('click', () => {
      taskList.removeChild(item);
      taskCount -= 1;
      refreshEmptyState();

      logSignal({
        input: 'click.taskRemove',
        process: 'state.tasks -= 1',
        output: 'li removed from DOM',
      });
    });

    item.appendChild(checkBtn);
    item.appendChild(label);
    item.appendChild(removeBtn);
    return item;
  };

  taskForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = taskInput.value.trim();
    if (!value) return;

    const task = createTask(value);
    taskList.appendChild(task);
    taskCount += 1;
    refreshEmptyState();
    taskInput.value = '';
    taskInput.focus();

    logSignal({
      input: 'submit.taskForm',
      process: 'state.tasks += 1',
      output: 'li.createElement → appendChild',
    });
  });

  refreshEmptyState();

  /* ------------------------------------------------------------------ */
  /*  Module 2: Signal Strength meter                                    */
  /* ------------------------------------------------------------------ */

  const meterFill = document.querySelector('.js-meter-fill');
  const meterValue = document.querySelector('.js-meter-value');
  const meterBand = document.querySelector('.js-meter-band');
  const meterPlus = document.querySelector('.js-meter-plus');
  const meterMinus = document.querySelector('.js-meter-minus');
  const meterReset = document.querySelector('.js-meter-reset');

  const STEP = 10;
  let signalValue = 0; // counter — must mutate, so `let`.

  const bandFor = (value) => {
    if (value >= 70) return 'high';
    if (value >= 30) return 'mid';
    return 'low';
  };

  const renderMeter = () => {
    const band = bandFor(signalValue);
    meterFill.style.width = `${signalValue}%`;
    meterFill.classList.toggle('is-mid', band === 'mid');
    meterFill.classList.toggle('is-high', band === 'high');
    meterValue.textContent = String(signalValue);
    meterBand.textContent = band === 'low' ? 'idle' : band;
  };

  const adjustSignal = (delta, source) => {
    signalValue = Math.min(100, Math.max(0, signalValue + delta));
    renderMeter();

    logSignal({
      input: source,
      process: `state.signal → ${signalValue}`,
      output: `meter width + band → ${bandFor(signalValue)}`,
    });
  };

  meterPlus.addEventListener('click', () => adjustSignal(STEP, 'click.meterPlus'));
  meterMinus.addEventListener('click', () => adjustSignal(-STEP, 'click.meterMinus'));
  meterReset.addEventListener('click', () => {
    signalValue = 0;
    renderMeter();
    logSignal({
      input: 'click.meterReset',
      process: 'state.signal → 0',
      output: 'meter reset to idle',
    });
  });

  renderMeter();

  /* ------------------------------------------------------------------ */
  /*  Module 3: Field Notes carousel                                     */
  /* ------------------------------------------------------------------ */

  const carouselText = document.querySelector('.js-carousel-text');
  const carouselDots = document.querySelector('.js-carousel-dots');
  const carouselPrev = document.querySelector('.js-carousel-prev');
  const carouselNext = document.querySelector('.js-carousel-next');

  const notes = [
    'Prefer textContent over innerHTML — it keeps user input from ever being parsed as markup.',
    'A function that does one thing is easier to test than one that does five.',
    'classList.toggle() is the difference between reading state and writing state.',
    'Name your JS hooks js-, name your visual state is- — your CSS and your logic stop fighting.',
    'Every "Uncaught ReferenceError" is the DOM telling you exactly where to look next.',
  ];

  let noteIndex = 0; // mutates on prev/next.

  const renderNote = () => {
    carouselText.textContent = notes[noteIndex];

    while (carouselDots.firstChild) {
      carouselDots.removeChild(carouselDots.firstChild);
    }

    notes.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.classList.toggle('is-active', i === noteIndex);
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Note ${i + 1} of ${notes.length}`);
      dot.addEventListener('click', () => {
        noteIndex = i;
        renderNote();
        logSignal({
          input: 'click.carouselDot',
          process: `state.noteIndex → ${noteIndex}`,
          output: 'carousel text swapped',
        });
      });
      carouselDots.appendChild(dot);
    });
  };

  carouselPrev.addEventListener('click', () => {
    noteIndex = (noteIndex - 1 + notes.length) % notes.length;
    renderNote();
    logSignal({
      input: 'click.carouselPrev',
      process: `state.noteIndex → ${noteIndex}`,
      output: 'carousel text swapped',
    });
  });

  carouselNext.addEventListener('click', () => {
    noteIndex = (noteIndex + 1) % notes.length;
    renderNote();
    logSignal({
      input: 'click.carouselNext',
      process: `state.noteIndex → ${noteIndex}`,
      output: 'carousel text swapped',
    });
  });

  renderNote();

  /* ------------------------------------------------------------------ */
  /*  Module 4: Handoff Note form                                        */
  /* ------------------------------------------------------------------ */

  const noteForm = document.querySelector('.js-note-form');
  const noteTextarea = document.querySelector('.js-note-textarea');
  const noteCount = document.querySelector('.js-note-count');
  const noteStatus = document.querySelector('.js-note-status');

  const MAX_LEN = 140;

  noteTextarea.addEventListener('input', () => {
    const length = noteTextarea.value.length;
    noteCount.textContent = String(length);
    noteStatus.textContent = '';

    noteTextarea.classList.remove('is-invalid', 'is-valid');
    if (length > 0) {
      noteTextarea.classList.add('is-valid');
    }

    logSignal({
      input: 'input.noteTextarea',
      process: `state.length → ${length}/${MAX_LEN}`,
      output: 'character counter updated',
    });
  });

  noteForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = noteTextarea.value.trim();

    if (!value) {
      noteTextarea.classList.add('is-invalid');
      noteTextarea.classList.remove('is-valid');
      noteStatus.textContent = 'Write something before sending.';

      logSignal({
        input: 'submit.noteForm',
        process: 'validation → empty',
        output: 'is-invalid applied',
      });
      return;
    }

    noteStatus.textContent = 'Note sent ✓';
    noteForm.reset();
    noteCount.textContent = '0';
    noteTextarea.classList.remove('is-valid', 'is-invalid');

    logSignal({
      input: 'submit.noteForm',
      process: 'validation → passed',
      output: 'form reset, status confirmed',
    });
  });
})();