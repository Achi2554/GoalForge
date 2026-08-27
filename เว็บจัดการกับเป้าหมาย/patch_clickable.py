import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

old_style = """              .swal-gold-bg {
                border: 4px solid #FFD700 !important;
                border-radius: 30px !important;
                animation: goldGlow 2s infinite !important;
              }"""

new_style = """              .swal-gold-bg {
                border: 4px solid #FFD700 !important;
                border-radius: 30px !important;
                box-shadow: 0 0 40px rgba(255, 215, 0, 0.4) !important;
              }"""

js = js.replace(old_style, new_style)

# Also ensure outside click is allowed
js = js.replace("backdrop: `rgba(0,0,0,0.9)`,", "backdrop: `rgba(0,0,0,0.9)`,\n          allowOutsideClick: true,")

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
