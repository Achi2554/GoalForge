import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Add Golden Confetti
old_epic = """  launchEpicConfetti() {"""
new_golden = """  launchGoldenConfetti() {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const count = 70;
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.inset = '0';
        container.style.pointerEvents = 'none';
        container.style.zIndex = '99999';
        container.style.overflow = 'hidden';
        document.body.appendChild(container);

        const colors = ['#FFD700', '#FDB931', '#FFDF00', '#D4AF37', '#FFF8DC'];

        for (let j = 0; j < count; j++) {
          const p = document.createElement('div');
          const size = Math.random() * 12 + 8;
          const color = colors[Math.floor(Math.random() * colors.length)];
          const startX = window.innerWidth / 2 + (Math.random() * 100 - 50);
          const startY = window.innerHeight * 0.5;
          const destX = startX + (Math.random() * 1000 - 500);
          const destY = startY + Math.random() * 800 - 400;
          const rot = Math.random() * 1080 - 540;

          p.style.position = 'absolute';
          p.style.width = `${size}px`;
          p.style.height = `${size}px`;
          p.style.backgroundColor = color;
          p.style.boxShadow = `0 0 15px ${color}`;
          p.style.left = `${startX}px`;
          p.style.top = `${startY}px`;
          p.style.opacity = '1';
          p.style.borderRadius = Math.random() > 0.5 ? '50%' : '3px';
          p.style.transition = 'all 1.5s cubic-bezier(0.1, 1, 0.3, 1)';
          
          container.appendChild(p);

          setTimeout(() => {
            p.style.transform = `translate(${destX - startX}px, ${destY - startY}px) rotate(${rot}deg) scale(${Math.random() + 0.5})`;
            p.style.opacity = '0';
          }, 50);
        }
        setTimeout(() => container.remove(), 2000);
      }, i * 350);
    }
  },

  launchEpicConfetti() {"""

js = js.replace(old_epic, new_golden)

# Modify Swal
old_swal = """        // EPIC Achievement Popup
        Utils.playSound('achievement');
        Utils.launchEpicConfetti();
        
        Swal.fire({
          title: `🎉 ปลดล็อกความสำเร็จ! 🎉`,
          html: `
            <style>
              @keyframes bounceIn {
                0% { transform: scale(0.1); opacity: 0; }
                60% { transform: scale(1.2); opacity: 1; }
                100% { transform: scale(1); }
              }
              @keyframes shine {
                0% { box-shadow: 0 0 10px rgba(99,102,241,0.5); }
                50% { box-shadow: 0 0 40px rgba(99,102,241,1), 0 0 80px rgba(236,72,153,0.8); }
                100% { box-shadow: 0 0 10px rgba(99,102,241,0.5); }
              }
              .epic-icon {
                font-size: 5rem;
                margin: 20px auto;
                animation: bounceIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                text-shadow: 0 0 20px rgba(255,215,0,0.8);
                display: inline-block;
              }
              .epic-title {
                font-size: 1.5rem;
                font-weight: 900;
                background: linear-gradient(90deg, var(--primary), #ec4899);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: bounceIn 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
              }
              .epic-bg {
                border-radius: 20px;
                animation: shine 2s infinite;
              }
            </style>
            <div class="epic-icon">${ach.icon}</div>
            <div class="epic-title">${ach.title}</div>
            <div style="font-size:1rem; color:var(--text-muted); margin-top:10px; font-weight:600;">ยอดเยี่ยมมาก! คุณทำได้แล้ว 🚀</div>
          `,
          showConfirmButton: true,
          confirmButtonText: 'สุดยอดดด! 😎',
          confirmButtonColor: 'var(--primary)',
          backdrop: `rgba(0,0,0,0.85)`,
          customClass: {
            popup: 'epic-bg'
          }
        });"""

new_swal = """        // ULTRA GOLD Achievement Popup
        Utils.playSound('achievement');
        Utils.launchGoldenConfetti();
        
        Swal.fire({
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
              @keyframes goldGlow {
                0% { box-shadow: 0 0 20px #D4AF37, inset 0 0 20px #D4AF37; }
                50% { box-shadow: 0 0 80px #FFDF00, inset 0 0 40px #FFDF00; border-color: #FFF; }
                100% { box-shadow: 0 0 20px #D4AF37, inset 0 0 20px #D4AF37; }
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
              .swal-gold-bg {
                border: 4px solid #FFD700 !important;
                border-radius: 30px !important;
                animation: goldGlow 2s infinite !important;
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
          customClass: {
            popup: 'swal-gold-bg'
          }
        });"""

js = js.replace(old_swal, new_swal)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
