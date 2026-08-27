import re
with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

old_timer_engine = """const TimerEngine = {
  modeDurations: JSON.parse(localStorage.getItem('goalforge_timer_settings')) || {
    focus: 25,
    short_break: 5,
    long_break: 15
  },
  durationSeconds: 25 * 60,
  remainingSeconds: 25 * 60,
  timerInterval: null,
  isRunning: false,
  mode: 'focus',
  onTick: null,
  onComplete: null,

  init({ onTick, onComplete }) {
    this.onTick = onTick;
    this.onComplete = onComplete;
    // Load duration for current mode
    this.durationSeconds = this.modeDurations[this.mode] * 60;
    this.reset();
  },

  setMode(mode) {
    this.mode = mode;
    this.pause();
    this.durationSeconds = this.modeDurations[mode] * 60;
    this.remainingSeconds = this.durationSeconds;
    this.notifyTick();
  },

  setCustomTime(minutes) {
    this.pause();
    this.modeDurations[this.mode] = minutes;
    localStorage.setItem('goalforge_timer_settings', JSON.stringify(this.modeDurations));
    this.durationSeconds = minutes * 60;
    this.remainingSeconds = this.durationSeconds;
    this.notifyTick();
  },"""

new_timer_engine = """const TimerEngine = {
  durationSeconds: 25 * 60,
  remainingSeconds: 25 * 60,
  timerInterval: null,
  isRunning: false,
  mode: 'focus',
  onTick: null,
  onComplete: null,

  getModeDurations() {
    let goalId = 'default';
    if (typeof Store !== 'undefined') {
      const active = Store.getActiveGoal();
      if (active && active.id) goalId = active.id;
    }
    const key = 'goalforge_timer_' + goalId;
    return JSON.parse(localStorage.getItem(key)) || {
      focus: 25,
      short_break: 5,
      long_break: 15
    };
  },

  saveModeDurations(durations) {
    let goalId = 'default';
    if (typeof Store !== 'undefined') {
      const active = Store.getActiveGoal();
      if (active && active.id) goalId = active.id;
    }
    const key = 'goalforge_timer_' + goalId;
    localStorage.setItem(key, JSON.stringify(durations));
  },

  init({ onTick, onComplete }) {
    this.onTick = onTick;
    this.onComplete = onComplete;
    const durations = this.getModeDurations();
    this.durationSeconds = durations[this.mode] * 60;
    this.reset();
  },

  setMode(mode) {
    this.mode = mode;
    this.pause();
    const durations = this.getModeDurations();
    this.durationSeconds = durations[mode] * 60;
    this.remainingSeconds = this.durationSeconds;
    this.notifyTick();
  },

  setCustomTime(minutes) {
    this.pause();
    const durations = this.getModeDurations();
    durations[this.mode] = minutes;
    this.saveModeDurations(durations);
    this.durationSeconds = minutes * 60;
    this.remainingSeconds = this.durationSeconds;
    this.notifyTick();
  },"""

js = js.replace(old_timer_engine, new_timer_engine)

# Also fix the tick UI code that refers to `TimerEngine.modeDurations`!
old_tick_ui = """        document.querySelectorAll('.timer-mode-btn').forEach(btn => {
          const btnMode = btn.getAttribute('data-mode');
          if (btnMode && modeNames[btnMode]) {
            const mins = TimerEngine.modeDurations[btnMode];
            btn.textContent = `${modeNames[btnMode]} ${mins} น.`;
          }
        });"""

new_tick_ui = """        document.querySelectorAll('.timer-mode-btn').forEach(btn => {
          const btnMode = btn.getAttribute('data-mode');
          if (btnMode && modeNames[btnMode]) {
            const durations = TimerEngine.getModeDurations();
            const mins = durations[btnMode];
            btn.textContent = `${modeNames[btnMode]} ${mins} น.`;
          }
        });"""

js = js.replace(old_tick_ui, new_tick_ui)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
