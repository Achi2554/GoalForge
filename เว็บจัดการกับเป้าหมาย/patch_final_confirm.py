import re
with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace ANY remaining delete task
js = re.sub(
    r'if\s*\(\s*confirm\(\'คุณแน่ใจหรือไม่ว่าต้องการลบภารกิจนี้\?\'\)\s*\)\s*\{',
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
              if (result.isConfirmed) {""",
    js
)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
