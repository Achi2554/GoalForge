import re
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

old_timer_header = '''                <div class="flex justify-between items-center" style="margin-bottom: 0.5rem;">
                  <h3 style="font-size: 1.1rem; font-weight: 700;">⏱️ Focus Timer</h3>
                  <span class="text-sm text-muted">Pomodoro</span>
                </div>'''

new_timer_header = '''                <div class="flex justify-between items-center">
                  <h3 style="font-size: 1.1rem; font-weight: 700;">⏱️ Focus Timer</h3>
                  <span class="text-sm text-muted">Pomodoro</span>
                </div>
                <div id="active-timer-task" style="margin-bottom: 0.75rem; color: var(--primary); font-size: 0.9rem; font-weight: 600; display: none;">
                  🎯 กำลังโฟกัส: <span></span>
                </div>'''

html = html.replace(old_timer_header, new_timer_header)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
