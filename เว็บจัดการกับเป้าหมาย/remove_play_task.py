import re
with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Remove the play button from tasks
old_task_actions = """<div class="task-actions-wrap">
                    <button type="button" class="btn-task-action" data-action="play-task" data-task-id="${t.id}" title="เริ่มจับเวลาภารกิจนี้">
                      ▶️
                    </button>
                    <button type="button" class="btn-task-action" data-action="edit-task\""""
new_task_actions = """<div class="task-actions-wrap">
                    <button type="button" class="btn-task-action" data-action="edit-task\""""
js = js.replace(old_task_actions, new_task_actions)

# Remove the play-task event listener
js = re.sub(r'// Play Task Trigger.*?\n\s*// Edit Task Trigger', '// Edit Task Trigger', js, flags=re.DOTALL)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
