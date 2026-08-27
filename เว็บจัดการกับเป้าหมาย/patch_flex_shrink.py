import re

with open('css/components.css', 'r', encoding='utf-8') as f:
    css = f.read()

old_nav_actions = """  .brand-logo {
    font-size: 1.1rem;
    gap: 0.5rem;
    white-space: nowrap;
  }"""

new_nav_actions = """  .brand-logo {
    font-size: 1.1rem;
    gap: 0.5rem;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .nav-actions {
    flex-shrink: 0;
  }"""

css = css.replace(old_nav_actions, new_nav_actions)

with open('css/components.css', 'w', encoding='utf-8') as f:
    f.write(css)
