import re
with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Delete Day
old_day = """if (confirm(`คุณต้องการลบ วันที่ ${goal.dailyTasks.length} ออกจากเป้าหมายใช่หรือไม่?`)) {
            Store.removeLastDayFromGoal(goal.id);
            this.render();
          }"""
new_day = """Swal.fire({
            title: 'ลบวันสุดท้าย',
            text: `คุณต้องการลบ วันที่ ${goal.dailyTasks.length} ออกจากเป้าหมายใช่หรือไม่?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--danger, #ef4444)',
            cancelButtonColor: 'var(--bg-subtle, #f1f5f9)',
            confirmButtonText: 'ลบ',
            cancelButtonText: 'ยกเลิก',
            reverseButtons: true,
            customClass: { cancelButton: 'swal2-cancel-custom' }
          }).then((result) => {
            if (result.isConfirmed) {
              Store.removeLastDayFromGoal(goal.id);
              this.render();
            }
          });"""
js = js.replace(old_day, new_day)

# 2. Delete Task
old_task = """if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบภารกิจนี้?')) {
              Store.deleteTask(goal.id, currentDayNum, taskId);
              this.render();
            }"""
new_task = """Swal.fire({
              title: 'ลบภารกิจ',
              text: 'คุณแน่ใจหรือไม่ว่าต้องการลบภารกิจนี้?',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: 'var(--danger, #ef4444)',
              cancelButtonColor: 'var(--bg-subtle, #f1f5f9)',
              confirmButtonText: 'ลบ',
              cancelButtonText: 'ยกเลิก',
              reverseButtons: true,
              customClass: { cancelButton: 'swal2-cancel-custom' }
            }).then((result) => {
              if (result.isConfirmed) {
                Store.deleteTask(goal.id, currentDayNum, taskId);
                this.render();
              }
            });"""
js = js.replace(old_task, new_task)

# 3. Delete Goal
old_goal = """if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบเป้าหมาย "${active.title}"?`)) {
        Store.deleteGoal(active.id);
        this.render();
      }"""
new_goal = """Swal.fire({
        title: 'ลบเป้าหมาย',
        text: `คุณแน่ใจหรือไม่ว่าต้องการลบเป้าหมาย "${active.title}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'var(--danger, #ef4444)',
        cancelButtonColor: 'var(--bg-subtle, #f1f5f9)',
        confirmButtonText: 'ลบเป้าหมาย',
        cancelButtonText: 'ยกเลิก',
        reverseButtons: true,
        customClass: { cancelButton: 'swal2-cancel-custom' }
      }).then((result) => {
        if (result.isConfirmed) {
          Store.deleteGoal(active.id);
          this.render();
        }
      });"""
js = js.replace(old_goal, new_goal)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
