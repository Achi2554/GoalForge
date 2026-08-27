import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Add App.checkAchievements() call
old_toggle = """            const result = Store.toggleTask(goal.id, currentDayNum, taskId);
            if (result && result.task.completed) {
              Utils.playSound('complete');
              const allDoneToday = result.dayData.tasks.every(t => t.completed);
              if (allDoneToday) {
                Utils.launchConfetti();
              }
            }
            this.render();"""

new_toggle = """            const result = Store.toggleTask(goal.id, currentDayNum, taskId);
            if (result && result.task.completed) {
              Utils.playSound('complete');
              const allDoneToday = result.dayData.tasks.every(t => t.completed);
              if (allDoneToday) {
                Utils.launchConfetti();
              }
            }
            if (App.checkAchievements) App.checkAchievements();
            this.render();"""

js = js.replace(old_toggle, new_toggle)

# Define App.checkAchievements()
old_app_end = """  checkDailyWelcome() {"""
new_app_end = """  checkAchievements() {
    const activeGoal = Store.getActiveGoal();
    if (!activeGoal) return;
    const stats = Store.getStats(activeGoal.id);
    if (!stats.unlockedAchievements) {
      stats.unlockedAchievements = [];
    }
    
    const totalTasks = activeGoal.dailyTasks.reduce((acc, d) => acc + d.tasks.length, 0);
    const completedTasks = activeGoal.dailyTasks.reduce((acc, d) => acc + d.tasks.filter(t => t.completed).length, 0);
    const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const achievements = [
      { id: 'first_step', title: 'ก้าวแรกสู่ฝัน', icon: '🌱', unlocked: stats.completedTasksCount >= 1 },
      { id: 'streak_3', title: 'ไฟแห่งความพยายาม', icon: '🔥', unlocked: stats.streak >= 3 },
      { id: 'streak_7', title: 'วินัยเหล็กกล้า', icon: '⚡', unlocked: stats.streak >= 7 },
      { id: 'halfway', title: 'พิชิตครึ่งทาง', icon: '🚀', unlocked: percent >= 50 },
      { id: 'mastery', title: 'ผู้พิชิตเป้าหมาย', icon: '👑', unlocked: percent >= 100 }
    ];
    
    const newlyUnlocked = achievements.filter(ach => ach.unlocked && !stats.unlockedAchievements.includes(ach.id));
    
    if (newlyUnlocked.length > 0) {
      newlyUnlocked.forEach(ach => {
        stats.unlockedAchievements.push(ach.id);
        
        // Show Swal toast for achievement
        Swal.fire({
          title: `ปลดล็อกความสำเร็จ!`,
          html: `<div style="font-size:3.5rem; margin:10px 0;">${ach.icon}</div>
                 <div style="font-size:1.25rem; font-weight:bold; color:var(--primary);">${ach.title}</div>
                 <div style="font-size:0.9rem; color:var(--text-muted); margin-top:5px;">สุดยอดไปเลย! ทำต่อไปเรื่อยๆ นะครับ 🎉</div>`,
          showConfirmButton: true,
          confirmButtonText: 'เยี่ยมเลย!',
          confirmButtonColor: 'var(--primary)',
          backdrop: `rgba(0,0,0,0.5)`,
        });
      });
      Store.save();
    }
  },

  checkDailyWelcome() {"""

js = js.replace(old_app_end, new_app_end)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
