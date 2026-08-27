import re

with open('css/components.css', 'r', encoding='utf-8') as f:
    css = f.read()

old_navbar = """  /* Navbar — make the ENTIRE navbar scrollable */
  .navbar {
    gap: 1rem; /* slightly more gap for readability */
    padding: 0 1rem;
    justify-content: flex-start;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    flex-wrap: nowrap;
  }
  .navbar::-webkit-scrollbar {
    display: none;
  }

  .navbar > * {
    flex-shrink: 0;
  }

  .brand-logo {
    font-size: 1.1rem;
    gap: 0.5rem;
    white-space: nowrap;
    flex-shrink: 0;
  }
  
  .nav-actions {
    flex-shrink: 0;
    overflow-x: visible;
    justify-content: flex-start;
    padding-right: 1rem; /* extra space at the very end of scroll */
  }
  
  .nav-actions > * {
    flex-shrink: 0;
  }"""

new_navbar = """  /* Navbar — make the ENTIRE navbar scrollable */
  .navbar {
    gap: 1rem;
    padding: 0 1rem;
    justify-content: flex-start;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    flex-wrap: nowrap;
    align-items: center;
  }
  .navbar::-webkit-scrollbar {
    display: none;
  }

  /* Force elements to their actual width so they trigger scrolling */
  .brand-logo {
    font-size: 1.15rem;
    gap: 0.5rem;
    white-space: nowrap;
    flex-shrink: 0;
    min-width: max-content;
  }
  
  .nav-actions {
    flex-shrink: 0;
    min-width: max-content;
    justify-content: flex-start;
  }
  
  .nav-actions > * {
    flex-shrink: 0;
    min-width: max-content;
  }
  
  /* Fix right padding being ignored when scrolling in flexbox */
  .navbar::after {
    content: '';
    padding-right: 1rem;
    flex-shrink: 0;
  }"""

css = css.replace(old_navbar, new_navbar)

with open('css/components.css', 'w', encoding='utf-8') as f:
    f.write(css)
