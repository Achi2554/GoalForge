import re

with open('css/components.css', 'r', encoding='utf-8') as f:
    css = f.read()

old_navbar = """  /* Navbar — make the ENTIRE navbar scrollable */
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

new_navbar = """  /* Navbar — make the ENTIRE navbar scrollable */
  .navbar {
    gap: 1.5rem;
    padding: 0 1rem;
    justify-content: flex-start;
    overflow-x: auto !important;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    flex-wrap: nowrap !important;
    align-items: center;
    width: 100vw; /* Force width */
    max-width: 100vw;
  }
  .navbar::-webkit-scrollbar {
    display: none;
  }

  /* Force elements to their actual width so they trigger scrolling */
  .brand-logo {
    font-size: 1.25rem;
    gap: 0.5rem;
    white-space: nowrap;
    flex: 0 0 auto !important;
    min-width: max-content;
  }
  
  .nav-actions {
    flex: 0 0 auto !important;
    min-width: max-content;
    justify-content: flex-start;
    gap: 1rem;
  }
  
  .nav-actions > * {
    flex: 0 0 auto !important;
    min-width: max-content;
  }
  
  /* Create an artificial block at the end to guarantee overflow */
  .navbar::after {
    content: '.';
    color: transparent;
    width: 2rem;
    flex: 0 0 auto;
  }"""

css = css.replace(old_navbar, new_navbar)

with open('css/components.css', 'w', encoding='utf-8') as f:
    f.write(css)
