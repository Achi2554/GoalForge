import re
with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

old_tick_ui = """        const activeBtn = document.querySelector(`.timer-mode-btn[data-mode="${state.mode}"]`);
        if (activeBtn) {
          const modeNames = { focus: 'โฟกัส', short_break: 'พักสั้น', long_break: 'พักยาว' };
          const mins = Math.round(state.durationSeconds / 60);
          activeBtn.textContent = `${modeNames[state.mode]} ${mins} น.`;
        }"""

new_tick_ui = """        const modeNames = { focus: 'โฟกัส', short_break: 'พักสั้น', long_break: 'พักยาว' };
        document.querySelectorAll('.timer-mode-btn').forEach(btn => {
          const btnMode = btn.getAttribute('data-mode');
          if (btnMode && modeNames[btnMode]) {
            const mins = TimerEngine.modeDurations[btnMode];
            btn.textContent = `${modeNames[btnMode]} ${mins} น.`;
          }
        });"""

js = js.replace(old_tick_ui, new_tick_ui)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
