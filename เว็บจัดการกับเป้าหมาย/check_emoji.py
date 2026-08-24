html = open('login_vercel.html', 'r', encoding='utf-8').read()
idx = html.find('🎯')
if idx != -1:
    print(repr(html[max(0, idx-100):min(len(html), idx+100)]))
else:
    print("NOT FOUND")
