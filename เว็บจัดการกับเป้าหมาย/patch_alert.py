import re
with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

old_on_complete = """onComplete: (mode) => {
        const activeTimerTask = document.getElementById('active-timer-task');
        if (activeTimerTask) activeTimerTask.style.display = 'none';
        Utils.launchConfetti();
        alert(mode === 'focus' ? '🎉 ยอดเยี่ยมมาก! คุณจดจ่อครบ 25 นาทีแล้ว ได้เวลาพักสายตาสักครู่' : '🔔 หมดเวลาพักแล้ว! พร้อมลุยภารกิจต่อหรือยัง?');
      }"""

new_on_complete = """onComplete: (mode) => {
        const activeTimerTask = document.getElementById('active-timer-task');
        if (activeTimerTask) activeTimerTask.style.display = 'none';
        Utils.launchConfetti();
        
        const durations = TimerEngine.getModeDurations();
        const mins = durations[mode] || 25;

        if (mode === 'focus') {
          Swal.fire({
            title: '🎉 ยอดเยี่ยมมาก!',
            text: `คุณจดจ่อครบ ${mins} นาทีแล้ว ได้เวลาพักสายตาสักครู่`,
            icon: 'success',
            confirmButtonText: 'พักผ่อน',
            confirmButtonColor: 'var(--primary)'
          });
        } else {
          Swal.fire({
            title: '🔔 หมดเวลาพักแล้ว!',
            text: 'พร้อมลุยภารกิจต่อหรือยัง?',
            icon: 'info',
            confirmButtonText: 'ลุยเลย!',
            confirmButtonColor: 'var(--primary)'
          });
        }
      }"""

js = js.replace(old_on_complete, new_on_complete)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
