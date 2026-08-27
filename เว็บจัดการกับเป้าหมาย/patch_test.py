import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

js = js.replace(
    "if (lastLogin !== todayStr) {",
    "if (lastLogin !== todayStr || window.location.search.includes('test')) {"
)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
