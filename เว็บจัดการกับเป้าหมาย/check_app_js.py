import re
with open('index.html', 'r', encoding='utf-8') as f:
    print(re.findall(r'<script src="js/app.js[^>]*></script>', f.read()))
