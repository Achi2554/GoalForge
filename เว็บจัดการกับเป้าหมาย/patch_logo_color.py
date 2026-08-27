import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

old_logo = """      <div class="brand-logo" onclick="location.reload()">
        <div class="logo-icon">🎯</div>
        <span>GoalForge AI</span>
      </div>"""

new_logo = """      <div class="brand-logo" onclick="location.reload()">
        <div class="logo-icon">🎯</div>
        <span>GoalForge <span style="background: linear-gradient(135deg, var(--primary), #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; display: inline-block;">AI</span></span>
      </div>"""

html = html.replace(old_logo, new_logo)

# Bump cache just in case, although this is just HTML
html = html.replace('js/app.js?v=20260827_12', 'js/app.js?v=20260827_13')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
