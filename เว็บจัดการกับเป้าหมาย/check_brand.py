import re
html = open('login_vercel.html', 'r', encoding='utf-8').read()
match = re.search(r'<div class="auth-brand">.*?</h1>', html, re.DOTALL)
if match:
    print(repr(match.group(0)))
else:
    print("NOT FOUND")
