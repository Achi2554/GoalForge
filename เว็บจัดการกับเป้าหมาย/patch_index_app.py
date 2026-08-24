html = open('index.html', 'r', encoding='utf-8').read()
html = html.replace('<script src="js/app.js"></script>', '<script src="js/app.js?v=2"></script>')
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
