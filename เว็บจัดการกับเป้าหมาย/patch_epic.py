import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Add 'achievement' sound
old_sound = """        osc1.stop(now + 0.1);
        osc2.start(now + 0.08);
        osc2.stop(now + 0.4);
      }"""

new_sound = """        osc1.stop(now + 0.1);
        osc2.start(now + 0.08);
        osc2.stop(now + 0.4);
      } else if (type === 'achievement') {
        const now = ctx.currentTime;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
        gain.connect(ctx.destination);
        
        // C Major Arpeggio Fanfare
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + (i * 0.12));
          osc.connect(gain);
          osc.start(now + (i * 0.12));
          osc.stop(now + 1.5);
        });
      }"""

js = js.replace(old_sound, new_sound)

# 2. Add Epic Confetti
old_confetti = """  launchConfetti() {"""
new_confetti = """  launchEpicConfetti() {
    this.launchConfetti();
    setTimeout(() => this.launchConfetti(), 300);
    setTimeout(() => this.launchConfetti(), 600);
    setTimeout(() => this.launchConfetti(), 900);
    setTimeout(() => this.launchConfetti(), 1200);
  },
  
  launchConfetti() {"""

js = js.replace(old_confetti, new_confetti)

# 3. Trigger it in checkAchievements()
old_swal = """        // Show Swal toast for achievement
        Swal.fire({
          title: `ปลดล็อกความสำเร็จ!`,
          html: `<div style="font-size:3.5rem; margin:10px 0;">${ach.icon}</div>
                 <div style="font-size:1.25rem; font-weight:bold; color:var(--primary);">${ach.title}</div>
                 <div style="font-size:0.9rem; color:var(--text-muted); margin-top:5px;">สุดยอดไปเลย! ทำต่อไปเรื่อยๆ นะครับ 🎉</div>`,
          showConfirmButton: true,
          confirmButtonText: 'เยี่ยมเลย!',
          confirmButtonColor: 'var(--primary)',
          backdrop: `rgba(0,0,0,0.5)`,
        });"""

new_swal = """        // EPIC Achievement Popup
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

js = js.replace(old_swal, new_swal)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
