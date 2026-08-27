import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

js = re.sub(
    r'<span class="task-tag time clickable" data-action="edit-task" data-task-id="\$\{t\.id\}" title=".*?">',
    '<span class="task-tag time clickable" data-action="send-to-timer" data-task-id="${t.id}" title="คลิกเพื่อส่งเวลาไปที่นาฬิกาโฟกัส">',
    js
)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
