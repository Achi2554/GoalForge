import re

with open('css/components.css', 'r', encoding='utf-8') as f:
    css = f.read()

old_navbar = """  .navbar {
    gap: 0.5rem;
    padding: 0 1rem;
    justify-content: space-between;
    overflow: hidden; /* Prevent body scroll */
  }"""

new_navbar = """  .navbar {
    gap: 0.5rem;
    padding: 0 1rem;
    justify-content: space-between;
  }"""

css = css.replace(old_navbar, new_navbar)

with open('css/components.css', 'w', encoding='utf-8') as f:
    f.write(css)
