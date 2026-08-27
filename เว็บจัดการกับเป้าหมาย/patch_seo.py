import re

seo_tags = """  <!-- SEO & Meta Tags -->
  <meta name="description" content="GoalForge AI - ผู้ช่วยส่วนตัวอัจฉริยะที่จะช่วยคุณวางแผน จัดการเป้าหมาย และติดตามความคืบหน้าในทุกๆ วัน พร้อมระบบนาฬิกาโฟกัส Pomodoro">
  <meta name="keywords" content="GoalForge, จัดการเป้าหมาย, เป้าหมายชีวิต, นาฬิกา Pomodoro, วางแผนชีวิต, productivity, AI planner, โฟกัสเวลา">
  <meta name="author" content="GoalForge AI">
  
  <!-- OpenGraph (Facebook, LINE) -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://goalforge-ruby.vercel.app/">
  <meta property="og:title" content="GoalForge AI - เปลี่ยนเป้าหมายให้เป็นความจริง">
  <meta property="og:description" content="จัดการเป้าหมาย วางแผนชีวิต และเพิ่ม Productivity ด้วยผู้ช่วย AI และระบบโฟกัส Pomodoro">
  <meta property="og:image" content="https://goalforge-ruby.vercel.app/images/goalforge_og.jpg">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="GoalForge AI - เปลี่ยนเป้าหมายให้เป็นความจริง">
  <meta name="twitter:description" content="จัดการเป้าหมาย วางแผนชีวิต และเพิ่ม Productivity ด้วยผู้ช่วย AI และระบบโฟกัส Pomodoro">
  <meta name="twitter:image" content="https://goalforge-ruby.vercel.app/images/goalforge_og.jpg">
  
  <title>GoalForge AI</title>"""

# index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()
html = re.sub(r'<title>.*?</title>', seo_tags, html, flags=re.DOTALL)
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

# login.html
with open('login.html', 'r', encoding='utf-8') as f:
    html2 = f.read()
html2 = re.sub(r'<title>.*?</title>', seo_tags, html2, flags=re.DOTALL)
with open('login.html', 'w', encoding='utf-8') as f:
    f.write(html2)
