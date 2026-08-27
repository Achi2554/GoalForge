import re

with open('index.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

# Find navbar area
match = re.search(r'<header.*?</header>', html, re.DOTALL)
if match:
    print(match.group(0).encode('utf-8'))
