html = open('index.html', 'r', encoding='utf-8').read()
idx = html.find('🎯')
if idx != -1:
    with open('dart.txt', 'w', encoding='utf-8') as f:
        f.write(html[max(0, idx-100):min(len(html), idx+100)])
