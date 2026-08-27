import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

js = js.replace(
    "const lastLogin = localStorage.getItem('goalforge_last_checkin');",
    "const user = AuthService.getCurrentUser(); const checkinKey = 'goalforge_last_checkin_' + (user ? user.id : ''); const lastLogin = localStorage.getItem(checkinKey);"
)
js = js.replace(
    "localStorage.setItem('goalforge_last_checkin', todayStr);",
    "localStorage.setItem(checkinKey, todayStr);"
)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
