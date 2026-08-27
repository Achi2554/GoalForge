import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

old_buttons = """        <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1.5rem;">
          <button type="submit" id="btn-save-goal-info" class="btn btn-primary w-full">
            💾 บันทึกการแก้ไขข้อมูล
          </button>
          <button type="button" id="btn-replan-goal-ai" class="btn btn-secondary w-full"
            style="border-color: var(--primary); color: var(--primary);">
            ✨ ให้ AI วางแผนตารางใหม่ตามจำนวนวันและเวลาที่ตั้งไว้
          </button>
        </div>"""

new_buttons = """        <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1.5rem;">
          <button type="submit" id="btn-replan-goal-ai" class="btn btn-primary w-full"
            style="background: linear-gradient(135deg, var(--primary), #8b5cf6);">
            ✨ ให้ AI วางแผนตารางใหม่ตามข้อมูลนี้
          </button>
        </div>"""

html = html.replace(old_buttons, new_buttons)

# Also bump cache
html = html.replace('js/app.js?v=20260827_11', 'js/app.js?v=20260827_12')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
