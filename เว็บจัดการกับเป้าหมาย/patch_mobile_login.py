import re

with open('login.html', 'r', encoding='utf-8') as f:
    html = f.read()

old_css = """    /* Auth Page Layout */
    body {
      min-height: 100vh;
      background: var(--bg-body);
      padding: 2rem 1.5rem 3rem;
      position: relative;
      overflow-y: auto;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }"""

new_css = """    /* Auth Page Layout */
    html, body {
      min-height: 100vh;
      background: var(--bg-body);
      padding: 2rem 1.5rem 3rem;
      position: relative;
      overflow-y: auto;
      overflow-x: hidden;
      max-width: 100vw;
      width: 100%;
      margin: 0;
    }
    body {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
    }"""

html = html.replace(old_css, new_css)
with open('login.html', 'w', encoding='utf-8') as f:
    f.write(html)
