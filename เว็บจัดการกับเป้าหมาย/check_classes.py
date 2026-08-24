import re
html = open('login_vercel.html', 'r', encoding='utf-8').read()
classes = set()
for m in re.findall(r'class="([^"]+)"', html):
    classes.update(m.split())
print(sorted(list(classes)))
