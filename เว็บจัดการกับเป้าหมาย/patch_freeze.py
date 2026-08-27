import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Make checkAchievements async
old_func = """  checkAchievements() {"""
new_func = """  async checkAchievements() {"""
js = js.replace(old_func, new_func)

# Fix the loop to use await
old_loop = """    if (newlyUnlocked.length > 0) {
      newlyUnlocked.forEach(ach => {
        stats.unlockedAchievements.push(ach.id);
        
        // ULTRA GOLD Achievement Popup
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
        });
      });
      Store.save();
    }"""

new_loop = """    if (newlyUnlocked.length > 0) {
      for (const ach of newlyUnlocked) {
        stats.unlockedAchievements.push(ach.id);
        Store.save();
        
        Utils.playSound('achievement');
        Utils.launchGoldenConfetti();
        
        await Swal.fire({
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
        });
      }
    }"""

js = js.replace(old_loop, new_loop)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
