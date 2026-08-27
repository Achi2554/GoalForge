import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Update the task-tag for time
old_time_tag = """<span class="task-tag time clickable" data-action="edit-task" data-task-id="${t.id}" title="คลิกเพื่อตั้งค่าเวลาที่ใช้">"""
new_time_tag = """<span class="task-tag time clickable" data-action="send-to-timer" data-task-id="${t.id}" title="คลิกเพื่อส่งเวลาไปที่นาฬิกาโฟกัส">"""
js = js.replace(old_time_tag, new_time_tag)

# Add event listener for send-to-timer
old_edit_trigger = """// Edit Task Trigger"""
new_timer_trigger = """// Send to Timer Trigger
        taskList.querySelectorAll('[data-action="send-to-timer"]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const taskId = btn.getAttribute('data-task-id');
            const task = dayData.tasks.find(t => t.id === taskId);
            if (task) {
              const modeBtn = document.querySelector('.timer-mode-btn[data-mode="focus"]');
              if (modeBtn) modeBtn.click();
              
              const mins = task.estMinutes || 25;
              TimerEngine.setCustomTime(mins);
              
              Swal.fire({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2500,
                icon: 'success',
                title: `ตั้งเวลา ${mins} นาทีเรียบร้อย!`,
                text: `สำหรับภารกิจ: ${task.title}`
              });
              
              const timerWidget = document.querySelector('.timer-widget');
              if (timerWidget) {
                timerWidget.scrollIntoView({ behavior: 'smooth', block: 'center' });
                timerWidget.classList.add('highlight-pulse');
                setTimeout(() => timerWidget.classList.remove('highlight-pulse'), 1500);
              }
            }
          });
        });

        // Edit Task Trigger"""

js = js.replace(old_edit_trigger, new_timer_trigger)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
