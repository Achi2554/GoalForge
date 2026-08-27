import re

with open('css/main.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Add html selector and width fixes
old_body = """body {
  font-family: var(--font-body);
  background-color: var(--bg-body);
  color: var(--text-main);
  line-height: 1.6;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: background-color var(--transition-normal), color var(--transition-normal);
  overflow-x: hidden;
}"""

new_body = """html, body {
  font-family: var(--font-body);
  background-color: var(--bg-body);
  color: var(--text-main);
  line-height: 1.6;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: background-color var(--transition-normal), color var(--transition-normal);
  overflow-x: hidden;
  max-width: 100vw;
  width: 100%;
}"""

css = css.replace(old_body, new_body)

with open('css/main.css', 'w', encoding='utf-8') as f:
    f.write(css)
