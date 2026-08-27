import re

with open('css/components.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Add overflow-x: auto to navbar on mobile
old_navbar_mobile = """  /* Navbar — stack brand left, actions right, shrink everything */
  .navbar {
    gap: 0.5rem;
    padding: 0 0.25rem;
  }"""

new_navbar_mobile = """  /* Navbar — stack brand left, actions right, shrink everything */
  .navbar {
    gap: 0.5rem;
    padding: 0 1rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    justify-content: flex-start;
  }
  .navbar::-webkit-scrollbar {
    display: none;
  }"""

css = css.replace(old_navbar_mobile, new_navbar_mobile)

# Fix brand logo text wrapping
old_brand = """  .brand-logo {
    font-size: 1rem;
    gap: 0.5rem;
  }"""

new_brand = """  .brand-logo {
    font-size: 1.1rem;
    gap: 0.5rem;
    white-space: nowrap;
  }"""

css = css.replace(old_brand, new_brand)

with open('css/components.css', 'w', encoding='utf-8') as f:
    f.write(css)
