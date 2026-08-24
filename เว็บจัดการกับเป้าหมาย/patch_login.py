import re
with open('login.html', 'r', encoding='utf-8') as f:
    html = f.read()

# I will replace specific HTML blocks!
html = re.sub(r'<title>.*?</title>', '<title>เข้าสู่ระบบ - GoalForge AI</title>', html, flags=re.DOTALL)
html = re.sub(r'<meta name="description".*?>', '<meta name="description" content="เข้าสู่ระบบ - GoalForge AI">', html, flags=re.DOTALL)

html = re.sub(r'<p class="hero-subtitle".*?</p>', '<p class="hero-subtitle" style="font-size: 1rem; margin-bottom: 2rem;">แตกเป้าหมายใหญ่ให้กลายเป็นภารกิจรายวันด้วย AI</p>', html, flags=re.DOTALL)

# Tabs
html = re.sub(r'<button class="auth-tab-btn active" data-panel="login">.*?</button>', '<button class="auth-tab-btn active" data-panel="login">🔑 เข้าสู่ระบบ</button>', html, flags=re.DOTALL)
html = re.sub(r'<button class="auth-tab-btn" data-panel="register">.*?</button>', '<button class="auth-tab-btn" data-panel="register">✨ สมัครสมาชิก</button>', html, flags=re.DOTALL)

# Google Button Login (first match)
html = re.sub(r'<button type="button" class="auth-google-btn btn-google-login">\s*<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo">\s*.*?\s*</button>', 
'<button type="button" class="auth-google-btn btn-google-login">\n          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo">\n          เข้าสู่ระบบด้วย Google\n        </button>', html, count=1, flags=re.DOTALL)

# Google Button Register (second match)
html = re.sub(r'<button type="button" class="auth-google-btn btn-google-login">\s*<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo">\s*.*?\s*</button>', 
'<button type="button" class="auth-google-btn btn-google-login">\n          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo">\n          สมัครสมาชิกด้วย Google\n        </button>', html, count=1, flags=re.DOTALL)

# Dividers
html = re.sub(r'<div class="auth-divider">.*?</div>', '<div class="auth-divider">หรือใช้อีเมล</div>', html, flags=re.DOTALL)

# Labels
html = re.sub(r'<label class="auth-label" for="login-email">.*?</label>', '<label class="auth-label" for="login-email">อีเมล</label>', html, flags=re.DOTALL)
html = re.sub(r'<label class="auth-label" for="login-password">.*?</label>', '<label class="auth-label" for="login-password">รหัสผ่าน</label>', html, flags=re.DOTALL)

html = re.sub(r'<label class="auth-label" for="reg-name">.*?</label>', '<label class="auth-label" for="reg-name">ชื่อของคุณ</label>', html, flags=re.DOTALL)
html = re.sub(r'<label class="auth-label" for="reg-email">.*?</label>', '<label class="auth-label" for="reg-email">อีเมล</label>', html, flags=re.DOTALL)
html = re.sub(r'<label class="auth-label" for="reg-password">.*?</label>', '<label class="auth-label" for="reg-password">รหัสผ่าน <span style="color: var(--text-muted); font-weight: 400;">(ขั้นต่ำ 6 ตัวอักษร)</span></label>', html, flags=re.DOTALL)
html = re.sub(r'<label class="auth-label" for="reg-confirm">.*?</label>', '<label class="auth-label" for="reg-confirm">ยืนยันรหัสผ่าน</label>', html, flags=re.DOTALL)

# Submit buttons
html = re.sub(r'<button type="submit" class="auth-submit-btn" id="login-submit-btn">.*?</button>', '<button type="submit" class="auth-submit-btn" id="login-submit-btn">🚀 เข้าสู่ระบบ</button>', html, flags=re.DOTALL)
html = re.sub(r'<button type="submit" class="auth-submit-btn" id="register-submit-btn">.*?</button>', '<button type="submit" class="auth-submit-btn" id="register-submit-btn">✨ สร้างบัญชีใหม่</button>', html, flags=re.DOTALL)

# Placeholders (just replace all instances of corrupted placeholders)
# Since placeholders are attributes, we can replace them easily
html = re.sub(r'placeholder="your@email.com"', 'placeholder="your@email.com"', html)
html = re.sub(r'placeholder="[^"]*สมชาย ใจดี[^"]*"', 'placeholder="เช่น สมชาย ใจดี"', html) # Wait, it might be corrupted in the html
html = re.sub(r'placeholder="[^"]*" required autocomplete="name"', 'placeholder="เช่น สมชาย ใจดี" required autocomplete="name"', html)
html = re.sub(r'placeholder="[^"]*" required autocomplete="current-password"', 'placeholder="••••••••" required autocomplete="current-password"', html)
html = re.sub(r'placeholder="[^"]*" required autocomplete="new-password"', 'placeholder="••••••••" required autocomplete="new-password"', html)

# Script text (just leaving it as is for errors, since they are JS strings we can ignore for UI)
# We can replace the JS button loading texts
html = html.replace('btn.innerHTML = `<div class="btn-spinner"></div> ????????????????? Google...`;', 'btn.innerHTML = `<div class="btn-spinner"></div> กำลังเชื่อมต่อกับ Google...`;')

# Footer
html = re.sub(r'<p style="text-align: center; font-size: 0.875rem; color: var\(--text-muted\);">.*?</p>', '<p style="text-align: center; font-size: 0.875rem; color: var(--text-muted);">ยังไม่มีบัญชีใช่ไหม? <a href="#" id="goto-register" style="color: var(--primary); font-weight: 500; text-decoration: none;">สมัครสมาชิก</a></p>', html, count=1, flags=re.DOTALL)
html = re.sub(r'<p style="text-align: center; font-size: 0.875rem; color: var\(--text-muted\);">.*?</p>', '<p style="text-align: center; font-size: 0.875rem; color: var(--text-muted);">มีบัญชีอยู่แล้ว? <a href="#" id="goto-login" style="color: var(--primary); font-weight: 500; text-decoration: none;">เข้าสู่ระบบเลย</a></p>', html, count=1, flags=re.DOTALL)

# Fix missing tags from footer replacement if any
# Actually, the footer was:
# <div class="auth-divider">...</div>
# <p style="...

with open('login.html', 'w', encoding='utf-8') as f:
    f.write(html)
