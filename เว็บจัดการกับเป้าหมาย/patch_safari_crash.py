import re

with open('css/components.css', 'r', encoding='utf-8') as f:
    css = f.read()

old_nav_actions = """  /* Make only the right side actions scrollable */
  .nav-actions {
    flex: 1;
    min-width: 0;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    justify-content: flex-start;
    padding-right: 1rem;
    margin-right: -1rem; /* extend scroll area slightly */
  }"""

new_nav_actions = """  /* Make only the right side actions scrollable */
  .nav-actions {
    flex: 1;
    min-width: 0;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    justify-content: flex-start;
    padding-right: 0.5rem;
  }"""

css = css.replace(old_nav_actions, new_nav_actions)

with open('css/components.css', 'w', encoding='utf-8') as f:
    f.write(css)
