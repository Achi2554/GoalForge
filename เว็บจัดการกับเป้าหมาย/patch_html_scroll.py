import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

old_header = """  <!-- App Header / Navbar -->
  <header class="app-header">
    <div class="container navbar">
      <div class="brand-logo" onclick="location.reload()">"""

new_header = """  <!-- App Header / Navbar -->
  <header class="app-header">
    <div class="container navbar">
      <div class="navbar-scroll-inner">
      <div class="brand-logo" onclick="location.reload()">"""

old_header_end = """        <div class="user-avatar-wrap" id="user-avatar-wrap" style="display:flex;align-items:center;gap:0.5rem;">
          <div class="user-avatar" id="nav-user-avatar" title="">?</div>
          <button id="btn-logout" class="btn-icon" title="ออกจากระบบ" style="font-size:1rem;">🚪</button>
        </div>
      </div>
    </div>
  </header>"""

new_header_end = """        <div class="user-avatar-wrap" id="user-avatar-wrap" style="display:flex;align-items:center;gap:0.5rem;">
          <div class="user-avatar" id="nav-user-avatar" title="">?</div>
          <button id="btn-logout" class="btn-icon" title="ออกจากระบบ" style="font-size:1rem;">🚪</button>
        </div>
      </div>
      </div>
    </div>
  </header>"""

html = html.replace(old_header, new_header)
html = html.replace(old_header_end, new_header_end)

# Also fix the inline block on AI
old_ai = """<span style="background: linear-gradient(135deg, var(--primary), #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; display: inline-block;">AI</span>"""
new_ai = """<span style="background: linear-gradient(135deg, var(--primary), #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">AI</span>"""
html = html.replace(old_ai, new_ai)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
