import re
with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Add Play button to task rendering
old_task_actions = '''<div class="task-actions-wrap">
                    <button type="button" class="btn-task-action" data-action="edit-task"'''
new_task_actions = '''<div class="task-actions-wrap">
                    <button type="button" class="btn-task-action" data-action="play-task" data-task-id="${t.id}" title="เริ่มจับเวลาภารกิจนี้">
                      ▶️
                    </button>
                    <button type="button" class="btn-task-action" data-action="edit-task"'''
js = js.replace(old_task_actions, new_task_actions)

# Add event listener for play-task
old_listeners = '''// Edit Task Trigger'''
new_listeners = '''// Play Task Trigger
        taskList.querySelectorAll('[data-action="play-task"]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const taskId = btn.getAttribute('data-task-id');
            const task = dayData.tasks.find(t => t.id === taskId);
            if (task) {
              const activeTimerTask = document.getElementById('active-timer-task');
              if (activeTimerTask) {
                activeTimerTask.style.display = 'block';
                activeTimerTask.querySelector('span').textContent = task.title;
              }
              
              const modeBtn = document.querySelector('.timer-mode-btn[data-mode="focus"]');
              if (modeBtn) modeBtn.click(); // Switch to focus mode
              
              TimerEngine.setCustomTime(task.estMinutes || 25);
              
              const timerWidget = document.querySelector('.timer-widget');
              if (timerWidget) timerWidget.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          });
        });

        // Edit Task Trigger'''
js = js.replace(old_listeners, new_listeners)

# Also, when the timer completes, maybe clear the active task?
old_on_complete = '''onComplete: (mode) => {
        Utils.launchConfetti();'''
new_on_complete = '''onComplete: (mode) => {
        const activeTimerTask = document.getElementById('active-timer-task');
        if (activeTimerTask) activeTimerTask.style.display = 'none';
        Utils.launchConfetti();'''
js = js.replace(old_on_complete, new_on_complete)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
