with open('index_restored.html', 'r', encoding='utf-8') as f:
    text = f.read()
text = text.replace('<script src="https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore-compat.js"></script>', '<script src="https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore-compat.js"></script>\n  <script src="https://www.gstatic.com/firebasejs/10.13.0/firebase-auth-compat.js"></script>')
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)
