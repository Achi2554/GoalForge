import re

verification_tag = '<meta name="google-site-verification" content="I8u3Y371OYm33gJTbB3l3HZPUo-xkjYltVelUB3Z8BA" />\n  <title>GoalForge AI</title>'

# index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()
html = re.sub(r'<title>GoalForge AI</title>', verification_tag, html)
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

# login.html
with open('login.html', 'r', encoding='utf-8') as f:
    html2 = f.read()
html2 = re.sub(r'<title>GoalForge AI</title>', verification_tag, html2)
with open('login.html', 'w', encoding='utf-8') as f:
    f.write(html2)
