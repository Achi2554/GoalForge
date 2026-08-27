import re
with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

old_ui_tick = """      onTick: (state) => {
        if (timerDigits) timerDigits.textContent = state.formatted;
        if (timerToggleBtn) {
          timerToggleBtn.textContent = state.isRunning ? '⏸️ หยุดชั่วคราว' : '▶️ เริ่มโฟกัส';
          timerToggleBtn.className = state.isRunning ? 'btn btn-secondary' : 'btn btn-primary';
        }
        if (timerCircle) {
          const offset = circumference * (1 - state.progress);
          timerCircle.style.strokeDashoffset = `${offset}`;
        }
      },"""

new_ui_tick = """      onTick: (state) => {
        if (timerDigits) timerDigits.textContent = state.formatted;
        
        const activeBtn = document.querySelector(`.timer-mode-btn[data-mode="${state.mode}"]`);
        if (activeBtn) {
          const modeNames = { focus: 'โฟกัส', short_break: 'พักสั้น', long_break: 'พักยาว' };
          const mins = Math.round(state.durationSeconds / 60);
          activeBtn.textContent = `${modeNames[state.mode]} ${mins} น.`;
        }

        if (timerToggleBtn) {
          timerToggleBtn.textContent = state.isRunning ? '⏸️ หยุดชั่วคราว' : '▶️ เริ่มโฟกัส';
          timerToggleBtn.className = state.isRunning ? 'btn btn-secondary' : 'btn btn-primary';
        }
        if (timerCircle) {
          const offset = circumference * (1 - state.progress);
          timerCircle.style.strokeDashoffset = `${offset}`;
        }
      },"""

js = js.replace(old_ui_tick, new_ui_tick)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
