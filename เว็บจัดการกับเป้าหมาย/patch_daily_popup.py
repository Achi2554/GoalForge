import re
with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Add checkDailyWelcome to App
old_app_init = '''  async init() {
    await Store.init();
    this.removeLegacyDefaultGoal();

    this.applyTheme(Store.state.settings.theme || 'light');
    this.initTimer();
    this.bindEvents();
    this.render();
  },'''

new_app_init = '''  async init() {
    await Store.init();
    this.removeLegacyDefaultGoal();

    this.applyTheme(Store.state.settings.theme || 'light');
    this.initTimer();
    this.bindEvents();
    this.render();
    
    setTimeout(() => {
      this.checkDailyWelcome();
    }, 500); // slight delay so UI renders first
  },

  checkDailyWelcome() {
    const activeGoal = Store.getActiveGoal();
    if (!activeGoal) return;
    
    const todayStr = new Date().toDateString();
    const lastLogin = localStorage.getItem('goalforge_last_checkin');
    
    if (lastLogin !== todayStr) {
      localStorage.setItem('goalforge_last_checkin', todayStr);
      
      const currentDayNum = Store.state.selectedDay || 1;
      const dayData = activeGoal.days.find(d => d.dayNum === currentDayNum);
      let tasksCountText = '';
      
      if (dayData && dayData.tasks && dayData.tasks.length > 0) {
        const incompleteTasks = dayData.tasks.filter(t => !t.completed).length;
        if (incompleteTasks > 0) {
          tasksCountText = `วันนี้คุณมี <b>${incompleteTasks} ภารกิจ</b> ที่ต้องทำในเป้าหมาย "${Utils.escapeHTML(activeGoal.title)}"`;
        } else {
          tasksCountText = `คุณทำภารกิจของวันนี้สำเร็จหมดแล้ว! สุดยอดไปเลยครับ 🎉`;
        }
      } else {
        tasksCountText = `วันนี้ยังไม่มีภารกิจในเป้าหมาย "${Utils.escapeHTML(activeGoal.title)}" ลองเพิ่มเป้าหมายย่อยดูสิครับ!`;
      }
      
      Swal.fire({
        title: '☀️ สวัสดีวันใหม่!',
        html: `<div style="margin-bottom: 0.5rem; color: #4b5563;">ยินดีต้อนรับกลับมาสานต่อเป้าหมายของคุณ!</div>
               <div style="font-size: 0.95rem; font-weight: 500; color: var(--primary);">${tasksCountText}</div>`,
        icon: 'info',
        confirmButtonText: 'ลุยเลย! 🚀',
        confirmButtonColor: 'var(--primary)',
        backdrop: `rgba(0,0,0,0.5)`
      });
    }
  },'''

js = js.replace(old_app_init, new_app_init)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
