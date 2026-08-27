import re
with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Delete Task
js = re.sub(
    r'if\s*\(\s*confirm\(\'คุณแน่ใจหรือไม่ว่าต้องการลบภารกิจนี้\?\'\)\s*\)\s*\{\s*Store\.deleteTask\(goal\.id,\s*currentDayNum,\s*taskId\);\s*this\.render\(\);\s*\}',
    """Swal.fire({
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
            });""",
    js
)

# 2. Delete Goal
js = re.sub(
    r'if\s*\(\s*confirm\(`คุณแน่ใจหรือไม่ว่าต้องการลบเป้าหมาย "\$\{active\.title\}"\?`\)\s*\)\s*\{\s*Store\.deleteGoal\(active\.id\);\s*this\.render\(\);\s*\}',
    """Swal.fire({
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
      });""",
    js
)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
