import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Make sure pointer-events: none is strictly on everything in confetti
old_confetti_child = """          p.style.opacity = '1';"""
new_confetti_child = """          p.style.opacity = '1';
          p.style.pointerEvents = 'none';"""
js = js.replace(old_confetti_child, new_confetti_child)

# Simplify Swal.fire to guarantee it doesn't freeze
old_swal = """        await Swal.fire({
          title: `🏆 ปลดล็อกความสำเร็จ! 🏆`,
          color: '#FFD700',
          background: 'linear-gradient(145deg, #111111, #222222)',
          html: `
            <style>
              @keyframes ultraBounce {
                0% { transform: scale(0); opacity: 0; }
                40% { transform: scale(1.5) rotate(15deg); opacity: 1; filter: drop-shadow(0 0 30px #FFD700); }
                70% { transform: scale(0.8) rotate(-10deg); filter: drop-shadow(0 0 50px #FFDF00); }
                100% { transform: scale(1) rotate(0); filter: drop-shadow(0 0 40px #FFD700); }
              }
              .gold-icon {
                font-size: 7rem;
                margin: 20px auto;
                animation: ultraBounce 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                display: inline-block;
              }
              .gold-title {
                font-size: 2rem;
                font-weight: 900;
                background: linear-gradient(to right, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                text-transform: uppercase;
                letter-spacing: 2px;
                animation: ultraBounce 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
              }
            </style>
            <div class="gold-icon">${ach.icon}</div>
            <div class="gold-title">${ach.title}</div>
            <div style="font-size:1.2rem; color:#FFF8DC; margin-top:20px; font-weight:bold; letter-spacing: 1px;">ยอดเยี่ยมที่สุด! ทำต่อไปเรื่อยๆ นะ 🚀</div>
          `,
          showConfirmButton: true,
          confirmButtonText: 'รับรางวัล! 👑',
          confirmButtonColor: '#D4AF37',
          backdrop: `rgba(0,0,0,0.9)`,
          allowOutsideClick: true,
          customClass: {
            popup: 'swal-gold-bg'
          }
        });"""

new_swal = """        await Swal.fire({
          title: `🏆 ปลดล็อกความสำเร็จ! 🏆`,
          color: '#FFD700',
          background: '#1a1a1a',
          html: `
            <div style="font-size: 6rem; margin: 20px auto;">${ach.icon}</div>
            <div style="font-size: 1.8rem; font-weight: bold; color: #FFD700; margin-bottom: 10px;">${ach.title}</div>
            <div style="font-size: 1rem; color: #FFF8DC;">ยอดเยี่ยมที่สุด! ทำต่อไปเรื่อยๆ นะ 🚀</div>
          `,
          confirmButtonText: 'รับรางวัล! 👑',
          confirmButtonColor: '#D4AF37',
          backdrop: `rgba(0,0,0,0.9)`,
          allowOutsideClick: true
        });"""

js = js.replace(old_swal, new_swal)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
