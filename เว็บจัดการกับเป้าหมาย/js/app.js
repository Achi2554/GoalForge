/**
 * GoalForge AI - Complete Integrated Application Bundle
 * Built for high reliability across both HTTP servers and local file:// protocol
 */

// ==========================================================================
// 1. UTILITY MODULE
// ==========================================================================
const Utils = {
  generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  },

  formatThaiDate(dateInput) {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  formatMinutes(totalMinutes) {
    totalMinutes = parseInt(totalMinutes, 10) || 0;
    if (totalMinutes <= 0) return '0 นาที';
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours === 0) return `${mins} นาที`;
    if (mins === 0) return `${hours} ชั่วโมง`;
    return `${hours} ชม. ${mins} นาที`;
  },

  escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  playSound(type = 'complete') {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'complete') {
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, now); // D5
        osc2.frequency.setValueAtTime(880.00, now + 0.08); // A5

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc1.stop(now + 0.1);
        osc2.start(now + 0.08);
        osc2.stop(now + 0.4);
      } else if (type === 'timer_bell') {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(659.25, now); // E5
        osc.frequency.exponentialRampToValueAtTime(329.63, now + 0.8);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.8);
      }
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  },

  speakText(text, lang = 'en-US') {
    if (!('speechSynthesis' in window)) {
      alert('เบราว์เซอร์ของคุณไม่รองรับการออกเสียงข้อความ');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  },

  async copyToClipboard(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    } catch (err) {
      console.warn('Clipboard write error:', err);
      return false;
    }
  },

  launchConfetti() {
    const count = 50;
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.inset = '0';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '99999';
    container.style.overflow = 'hidden';
    document.body.appendChild(container);

    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'];

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      const size = Math.random() * 8 + 6;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const startX = window.innerWidth / 2 + (Math.random() * 200 - 100);
      const startY = window.innerHeight * 0.4;
      const destX = startX + (Math.random() * 600 - 300);
      const destY = startY + Math.random() * 400 + 150;
      const rot = Math.random() * 720 - 360;

      p.style.position = 'absolute';
      p.style.width = `${size}px`;
      p.style.height = `${size * 0.6}px`;
      p.style.backgroundColor = color;
      p.style.borderRadius = '2px';
      p.style.left = `${startX}px`;
      p.style.top = `${startY}px`;
      p.style.opacity = '1';
      p.style.transform = `translate(0, 0) rotate(0deg)`;
      p.style.transition = `all ${0.8 + Math.random() * 0.7}s cubic-bezier(0.25, 1, 0.5, 1)`;

      container.appendChild(p);

      requestAnimationFrame(() => {
        p.style.transform = `translate(${destX - startX}px, ${destY - startY}px) rotate(${rot}deg)`;
        p.style.opacity = '0';
      });
    }

    setTimeout(() => {
      container.remove();
    }, 1800);
  }
};

// ==========================================================================
// 2. STORE & STATE MANAGEMENT MODULE
// ==========================================================================
const STORAGE_KEYS = {
  GOALS: 'goalforge_goals',
  ACTIVE_GOAL_ID: 'goalforge_active_goal_id',
  SETTINGS: 'goalforge_settings',
  STATS: 'goalforge_stats'
};

const Store = {
  state: {
    goals: [],
    activeGoalId: null,
    selectedDay: 1,
    settings: {
      model: 'gemini-3.6-flash',
      theme: 'light',
      soundEnabled: true
    },
    stats: {
      streak: 0,
      lastActiveDate: null,
      totalXp: 0,
      completedTasksCount: 0
    }
  },

  async init() {
    try {
      const user = AuthService.getCurrentUser();
      if (user && window.db) {
        const userDocRef = window.db.collection('userData').doc(user.id);
        const docSnap = await userDocRef.get();
        
        if (docSnap.exists) {
          const data = docSnap.data();
          this.state.goals = data.goals || [];
          this.state.activeGoalId = data.activeGoalId || null;
          if (data.settings) this.state.settings = { ...this.state.settings, ...data.settings };
          if (data.stats) this.state.stats = { ...this.state.stats, ...data.stats };
        }
      } else {
        throw new Error('No DB');
      }
      this.checkDailyStreak();
    } catch (e) {
      console.warn('Firestore load failed. Falling back to local storage.', e);
      const savedGoals = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (savedGoals) this.state.goals = JSON.parse(savedGoals);
      const savedActiveId = localStorage.getItem(STORAGE_KEYS.ACTIVE_GOAL_ID);
      if (savedActiveId && this.state.goals.some(g => g.id === savedActiveId)) {
        this.state.activeGoalId = savedActiveId;
      } else if (this.state.goals.length > 0) {
        this.state.activeGoalId = this.state.goals[0].id;
      }
      const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (savedSettings) this.state.settings = { ...this.state.settings, ...JSON.parse(savedSettings) };
      const savedStats = localStorage.getItem(STORAGE_KEYS.STATS);
      if (savedStats) this.state.stats = { ...this.state.stats, ...JSON.parse(savedStats) };
      this.checkDailyStreak();
    }
  },

  async save() {
    try {
      const user = AuthService.getCurrentUser();
      if (user && window.db) {
        const userDocRef = window.db.collection('userData').doc(user.id);
        await userDocRef.set({
          goals: this.state.goals,
          activeGoalId: this.state.activeGoalId,
          settings: this.state.settings,
          stats: this.state.stats
        }, { merge: true });
      } else {
        // Fallback
        localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(this.state.goals));
        if (this.state.activeGoalId) {
          localStorage.setItem(STORAGE_KEYS.ACTIVE_GOAL_ID, this.state.activeGoalId);
        }
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.state.settings));
        localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(this.state.stats));
      }
    } catch (e) {
      console.error('Store save error:', e);
    }
  },

  getGoals() {
    return this.state.goals;
  },

  getStats(goalId) {
    const goal = this.state.goals.find(g => g.id === goalId);
    if (!goal) return { streak: 0, totalXp: 0, completedTasksCount: 0, lastActiveDate: null };
    if (!goal.stats) {
      // Initialize with 0
      goal.stats = { streak: 0, totalXp: 0, completedTasksCount: 0, lastActiveDate: null };
      // Save it immediately so it persists
      this.save();
    }
    return goal.stats;
  },

  getActiveGoal() {
    return this.state.goals.find(g => g.id === this.state.activeGoalId) || null;
  },

  setActiveGoal(id) {
    if (this.state.goals.some(g => g.id === id)) {
      this.state.activeGoalId = id;
      this.state.selectedDay = 1;
      this.save();
      return true;
    }
    return false;
  },

  addGoal(goal) {
    this.state.goals.unshift(goal);
    this.state.activeGoalId = goal.id;
    this.state.selectedDay = 1;
    this.save();
    return goal;
  },

  updateGoal(goalId, { title, category, durationDays, dailyMinutes, notes }) {
    const goal = this.state.goals.find(g => g.id === goalId);
    if (!goal) return false;

    if (title) goal.title = title;
    if (category) goal.category = category;
    if (dailyMinutes) goal.dailyMinutes = parseInt(dailyMinutes, 10);
    if (notes !== undefined) goal.notes = notes;

    const newDuration = parseInt(durationDays, 10);
    if (newDuration && newDuration > 0 && newDuration !== goal.durationDays) {
      goal.durationDays = newDuration;
      
      // If increased, append extra days
      while (goal.dailyTasks.length < newDuration) {
        const nextDayNum = goal.dailyTasks.length + 1;
        goal.dailyTasks.push({
          day: nextDayNum,
          focus: `ภารกิจประจำวันที่ ${nextDayNum}`,
          notes: '',
          tasks: [
            {
              id: Utils.generateId(`t_${nextDayNum}_1`),
              title: `ภารกิจประจำวันที่ ${nextDayNum} สำหรับ ${goal.title}`,
              description: `ลงมือทำเป้าหมายอย่างต่อเนื่องตามแผน`,
              estMinutes: Math.floor((goal.dailyMinutes || 30) * 0.6),
              difficulty: nextDayNum <= 4 ? 'easy' : (nextDayNum <= 9 ? 'medium' : 'hard'),
              tip: 'รักษาความสม่ำเสมอในทุกๆ วัน',
              drill: null,
              resources: [{ title: `🔍 ค้นคว้าเกี่ยวกับ ${goal.title}`, url: `https://www.google.com/search?q=${encodeURIComponent(goal.title)}` }],
              completed: false,
              completedAt: null
            },
            {
              id: Utils.generateId(`t_${nextDayNum}_2`),
              title: `ทบทวนและบันทึกความก้าวหน้า Day ${nextDayNum}`,
              description: `จดบันทึกสิ่งที่ได้เรียนรู้`,
              estMinutes: Math.max(5, (goal.dailyMinutes || 30) - Math.floor((goal.dailyMinutes || 30) * 0.6)),
              difficulty: nextDayNum <= 4 ? 'easy' : (nextDayNum <= 9 ? 'medium' : 'hard'),
              tip: '',
              drill: null,
              resources: [],
              completed: false,
              completedAt: null
            }
          ]
        });
      }

      // If decreased, trim days
      if (goal.dailyTasks.length > newDuration) {
        goal.dailyTasks = goal.dailyTasks.slice(0, newDuration);
        if (this.state.selectedDay > newDuration) {
          this.state.selectedDay = newDuration;
        }
      }
    }

    this.save();
    return true;
  },

  deleteGoal(id) {
    this.state.goals = this.state.goals.filter(g => g.id !== id);
    if (this.state.activeGoalId === id) {
      this.state.activeGoalId = this.state.goals.length > 0 ? this.state.goals[0].id : null;
      this.state.selectedDay = 1;
    }
    this.save();
  },

  toggleTask(goalId, dayNumber, taskId) {
    const goal = this.state.goals.find(g => g.id === goalId);
    if (!goal) return null;

    const dayData = goal.dailyTasks.find(d => d.day === Number(dayNumber));
    if (!dayData) return null;

    const task = dayData.tasks.find(t => t.id === taskId);
    if (!task) return null;

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date().toISOString() : null;

    const stats = this.getStats(goalId);
    if (task.completed) {
      stats.totalXp += 20;
      stats.completedTasksCount += 1;
      
      // ตรวจสอบว่าภารกิจของวันนี้ถูกติ๊กครบทุกอันแล้วหรือยัง
      const allCompleted = dayData.tasks.every(t => t.completed);
      if (allCompleted) {
        this.recordActivity(goalId);
      }
    } else {
      stats.totalXp = Math.max(0, stats.totalXp - 20);
      stats.completedTasksCount = Math.max(0, stats.completedTasksCount - 1);
    }

    this.save();
    return { task, dayData, goal };
  },

  updateTask(goalId, dayNumber, taskId, { title, description, estMinutes, difficulty, tip }) {
    const goal = this.state.goals.find(g => g.id === goalId);
    if (!goal) return false;

    const dayData = goal.dailyTasks.find(d => d.day === Number(dayNumber));
    if (!dayData) return false;

    const task = dayData.tasks.find(t => t.id === taskId);
    if (!task) return false;

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (estMinutes) task.estMinutes = parseInt(estMinutes, 10);
    if (difficulty) task.difficulty = difficulty;
    if (tip !== undefined) task.tip = tip;

    this.save();
    return true;
  },

  addTask(goalId, dayNumber, { title, description, estMinutes, difficulty, tip }) {
    const goal = this.state.goals.find(g => g.id === goalId);
    if (!goal) return false;

    const dayData = goal.dailyTasks.find(d => d.day === Number(dayNumber));
    if (!dayData) return false;

    const newTask = {
      id: Utils.generateId(`custom_t_${dayNumber}`),
      title: title || 'ภารกิจใหม่',
      description: description || '',
      estMinutes: parseInt(estMinutes, 10) || 15,
      difficulty: difficulty || 'easy',
      tip: tip || '',
      drill: null,
      resources: [{
        title: `🔍 ค้นคว้าข้อมูลเกี่ยวกับ "${title}"`,
        url: `https://www.google.com/search?q=${encodeURIComponent((goal.title || '') + ' ' + (title || ''))}`
      }],
      completed: false,
      completedAt: null
    };

    dayData.tasks.push(newTask);
    this.save();
    return newTask;
  },

  deleteTask(goalId, dayNumber, taskId) {
    const goal = this.state.goals.find(g => g.id === goalId);
    if (!goal) return false;

    const dayData = goal.dailyTasks.find(d => d.day === Number(dayNumber));
    if (!dayData) return false;

    dayData.tasks = dayData.tasks.filter(t => t.id !== taskId);
    this.save();
    return true;
  },

  addDayToGoal(goalId) {
    const goal = this.state.goals.find(g => g.id === goalId);
    if (!goal) return false;

    const nextDayNum = goal.dailyTasks.length + 1;
    goal.durationDays = nextDayNum;

    goal.dailyTasks.push({
      day: nextDayNum,
      focus: `ภารกิจประจำวันที่ ${nextDayNum}`,
      notes: '',
      tasks: [
        {
          id: Utils.generateId(`t_${nextDayNum}_1`),
          title: `ภารกิจประจำวันที่ ${nextDayNum} สำหรับ ${goal.title}`,
          description: `ลงมือทำภารกิจตามเป้าหมายที่กำหนด`,
          estMinutes: Math.floor((goal.dailyMinutes || 30) * 0.6),
          difficulty: nextDayNum <= 4 ? 'easy' : (nextDayNum <= 9 ? 'medium' : 'hard'),
          tip: 'ก้าวไปข้างหน้าทีละวันอย่างสม่ำเสมอ',
          drill: null,
          resources: [{ title: `🔍 ค้นคว้าเกี่ยวกับ ${goal.title}`, url: `https://www.google.com/search?q=${encodeURIComponent(goal.title)}` }],
          completed: false,
          completedAt: null
        },
        {
          id: Utils.generateId(`t_${nextDayNum}_2`),
          title: `ทบทวนและบันทึกผลงาน Day ${nextDayNum}`,
          description: `บันทึกสิ่งที่ได้เรียนรู้และพัฒนาขึ้นในวันนี้`,
          estMinutes: Math.max(5, (goal.dailyMinutes || 30) - Math.floor((goal.dailyMinutes || 30) * 0.6)),
          difficulty: nextDayNum <= 4 ? 'easy' : (nextDayNum <= 9 ? 'medium' : 'hard'),
          tip: '',
          drill: null,
          resources: [],
          completed: false,
          completedAt: null
        }
      ]
    });

    this.state.selectedDay = nextDayNum;
    this.save();
    return true;
  },

  removeLastDayFromGoal(goalId) {
    const goal = this.state.goals.find(g => g.id === goalId);
    if (!goal || goal.dailyTasks.length <= 1) return false;

    goal.dailyTasks.pop();
    goal.durationDays = goal.dailyTasks.length;
    if (this.state.selectedDay > goal.durationDays) {
      this.state.selectedDay = goal.durationDays;
    }

    this.save();
    return true;
  },

  saveDayNote(goalId, dayNumber, noteText) {
    const goal = this.state.goals.find(g => g.id === goalId);
    if (!goal) return;

    const dayData = goal.dailyTasks.find(d => d.day === Number(dayNumber));
    if (dayData) {
      dayData.notes = noteText;
      this.save();
    }
  },

  getGoalProgress(goal) {
    if (!goal || !goal.dailyTasks || goal.dailyTasks.length === 0) {
      return { total: 0, completed: 0, percent: 0, daysCompleted: 0, totalDays: 0 };
    }

    let totalTasks = 0;
    let completedTasks = 0;
    let daysCompleted = 0;

    goal.dailyTasks.forEach(day => {
      let dayCompleted = true;
      if (day.tasks.length === 0) {
        dayCompleted = false;
      }
      day.tasks.forEach(t => {
        totalTasks++;
        if (t.completed) completedTasks++;
        else dayCompleted = false;
      });
      if (dayCompleted && day.tasks.length > 0) {
        daysCompleted++;
      }
    });

    const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    return {
      total: totalTasks,
      completed: completedTasks,
      percent,
      daysCompleted,
      totalDays: goal.durationDays || goal.dailyTasks.length
    };
  },

  checkDailyStreak() {
    if (!this.state.activeGoalId) return;
    const stats = this.getStats(this.state.activeGoalId);
    const today = new Date().toDateString();
    if (!stats.lastActiveDate) return;

    const lastDate = new Date(stats.lastActiveDate);
    const diffTime = Math.abs(new Date(today) - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1 && new Date(today).toDateString() !== lastDate.toDateString()) {
      stats.streak = 0;
      this.save();
    }
  },

  recordActivity(goalId) {
    if (!goalId) return;
    const stats = this.getStats(goalId);
    const today = new Date().toDateString();
    if (stats.lastActiveDate !== today) {
      stats.streak += 1;
      stats.lastActiveDate = today;
      this.save();
    }
  },

  updateSettings(newSettings) {
    this.state.settings = { ...this.state.settings, ...newSettings };
    this.save();
  },

  exportData() {
    return JSON.stringify({
      goals: this.state.goals,
      stats: this.state.stats,
      exportedAt: new Date().toISOString()
    }, null, 2);
  },

  importData(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.goals)) {
        this.state.goals = parsed.goals;
        this.state.activeGoalId = this.state.goals.length > 0 ? this.state.goals[0].id : null;
      }
      if (parsed.stats) {
        this.state.stats = { ...this.state.stats, ...parsed.stats };
      }
      this.save();
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }
};

// ==========================================================================
// 3. FOCUS TIMER MODULE
// ==========================================================================
const TimerEngine = {
  modeDurations: {
    focus: 25,
    short_break: 5,
    long_break: 15
  },
  durationSeconds: 25 * 60,
  remainingSeconds: 25 * 60,
  timerInterval: null,
  isRunning: false,
  mode: 'focus',
  onTick: null,
  onComplete: null,

  init({ onTick, onComplete }) {
    this.onTick = onTick;
    this.onComplete = onComplete;
    this.reset();
  },

  setMode(mode) {
    this.mode = mode;
    this.pause();
    this.durationSeconds = this.modeDurations[mode] * 60;
    this.remainingSeconds = this.durationSeconds;
    this.notifyTick();
  },

  setCustomTime(minutes) {
    this.pause();
    this.modeDurations[this.mode] = minutes;
    this.durationSeconds = minutes * 60;
    this.remainingSeconds = this.durationSeconds;
    this.notifyTick();
  },

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    this.timerInterval = setInterval(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds--;
        this.notifyTick();
      } else {
        this.pause();
        Utils.playSound('timer_bell');
        if (this.onComplete) {
          this.onComplete(this.mode);
        }
      }
    }, 1000);

    this.notifyTick();
  },

  pause() {
    this.isRunning = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.notifyTick();
  },

  toggle() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  },

  reset() {
    this.pause();
    this.remainingSeconds = this.durationSeconds;
    this.notifyTick();
  },

  notifyTick() {
    if (this.onTick) {
      const minutes = Math.floor(this.remainingSeconds / 60);
      const seconds = this.remainingSeconds % 60;
      const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      const progress = this.durationSeconds > 0 
        ? ((this.durationSeconds - this.remainingSeconds) / this.durationSeconds) 
        : 0;

      this.onTick({
        formatted,
        minutes,
        seconds,
        progress,
        isRunning: this.isRunning,
        mode: this.mode,
        durationSeconds: this.durationSeconds
      });
    }
  }
};

// ==========================================================================
// 4. MULTI-CATEGORY AI PROGRESSIVE DECOMPOSER
// ==========================================================================
const AIService = {
  async generateGoalBreakdown({ title, category, durationDays, dailyMinutes, level, notes, model = 'gemini-3.6-flash' }) {
    durationDays = parseInt(durationDays, 10) || 14;
    dailyMinutes = parseInt(dailyMinutes, 10) || 25;

    try {
      const result = await this.callGeminiAPI({
        title,
        category,
        durationDays,
        dailyMinutes,
        level,
        notes,
        model
      });
      if (result && result.phases && result.dailyTasks && result.dailyTasks.length > 0) {
        return result;
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to smart progressive offline generator:', err);
      alert('⚠️ ไม่สามารถเชื่อมต่อกับ AI ได้ (ระบบจะใช้ตารางสำรองแทน)\n\nข้อความข้อผิดพลาด: ' + err.message);
    }

    return this.generateSmartOfflineBreakdown({
      title,
      category,
      durationDays,
      dailyMinutes,
      level,
      notes
    });
  },

  async callGeminiAPI({ title, category, durationDays, dailyMinutes, level, notes, model }) {
    // Keep one central endpoint: the current site's serverless API proxy.
    // The Gemini key stays on the server (Vercel) and is never exposed to the browser.
    const endpoint = new URL('/api/generate-goal', window.location.origin);

    const promptText = `
คุณคือสุดยอด AI Goal Coach และผู้เชี่ยวชาญด้านการออกแบบหลักสูตรที่มีความก้าวหน้าอย่างเป็นระบบ (Progressive Curriculum Architect)
หน้าที่ของคุณคือรับเป้าหมายของผู้ใช้ แล้วแตกเป้าหมายออกมาเป็น "ภารกิจย่อยในแต่ละวัน (Daily Micro-Tasks)" ตั้งแต่วันที่ 1 ถึงวันที่ ${durationDays}

ข้อมูลเป้าหมาย:
- เป้าหมาย: "${title}"
- ระยะเวลาทั้งหมด: ${durationDays} วัน
- เวลาว่างต่อวัน: ${dailyMinutes} นาที
- ระดับพื้นฐาน: ${level}
- ข้อมูลเพิ่มเติม: ${notes || 'ไม่มี'}

กฎสำคัญที่สุด (CRITICAL INSTRUCTIONS):
1. **ต้องตอบโจทย์เป้าหมายอย่างเคร่งครัด**: วิเคราะห์จาก "เป้าหมาย" ที่ผู้ใช้พิมพ์มาเท่านั้น ไม่ต้องสนใจหมวดหมู่
2. **ห้ามซ้ำกันเด็ดขาด (100% Unique Every Day)**: ทุกๆ วัน (Day 1 ถึง Day ${durationDays}) ต้องมีเนื้อหาและโจทย์ที่ไม่ซ้ำกัน
3. **ความยากต้องไต่ระดับขึ้นเรื่อยๆ (Progressive Difficulty Escalation)**:
   - Day 1-4: ระดับ "easy" เน้นพื้นฐานเบื้องต้น
   - Day 5-8: ระดับ "medium" ขยายความซับซ้อน
   - Day 9-12: ระดับ "hard" การประยุกต์ใช้จริงขั้นสูง
   - Day 13-${durationDays}: ระดับ "hard" การทดสอบจำลองสถานการณ์จริง
4. **ต้องมีเนื้อหาเจาะจงที่ให้ทำทันที (drill)** ในแต่ละภารกิจ (เช่น vocab, workout, code, steps)
5. **ต้องมีแหล่งศึกษาข้อมูลและลิงก์ความรู้ (resources)**
6. **ต้องสร้างภารกิจย่อย (tasks) อย่างน้อย 2-3 ข้อต่อวัน ห้ามให้มาแค่วันละข้อเด็ดขาด!**
7. **(สำคัญมาก) กระชับแต่ได้ใจความ (Action-Oriented)**: ไม่ต้องเกริ่นน้ำเยอะ หรือเขียนอธิบายยาวเกินไป ให้เขียนเน้นขั้นตอนปฏิบัติที่เจาะจง (Actionable steps) สั้นๆ แต่อัดแน่นด้วยเนื้อหา เน้นให้ผู้ใช้ทำตามได้ทันที

ส่งผลลัพธ์กลับมาเป็น JSON ตามโครงสร้างนี้เท่านั้น:
{
  "summary": "สรุปแผนพัฒนา 1-2 ประโยค",
  "coachAdvice": "คำแนะนำและแรงบันดาลใจจาก AI Coach",
  "phases": [
    {
      "phaseNumber": 1,
      "title": "ชื่อระยะ",
      "daysRange": "Day 1 - 4",
      "description": "คำอธิบายเป้าหมายระยะนี้"
    }
  ],
  "dailyTasks": [ // ต้องมีภารกิจอย่างน้อย 2-3 ข้อในแต่ละวัน ห้ามมีแค่ข้อเดียว
    {
      "day": 1,
      "focus": "หัวข้อหลักของวันนี้",
      "tasks": [
        {
          "id": "t_1_1",
          "title": "ชื่อภารกิจที่เจาะจง",
          "description": "วิธีปฏิบัติอย่างละเอียด",
          "estMinutes": 15,
          "difficulty": "easy",
          "tip": "คำแนะนำ",
          "drill": {
            "type": "steps",
            "title": "หัวข้อเนื้อหาฝึกฝนเฉพาะวันนี้",
            "items": [
              "ขั้นตอนที่ 1", "ขั้นตอนที่ 2"
            ]
          },
          "resources": [
            { "title": "แหล่งศึกษาข้อมูล", "url": "https://..." }
          ]
        }
      ]
    }
  ]
}
`;

    const requestBody = {
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: {
        temperature: 0.35,
        topP: 0.95,
        responseMimeType: "application/json"
      }
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, requestBody })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) throw new Error('Empty response from Gemini');

    let cleanJson = candidateText.trim();
    const jsonMatch = cleanJson.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (jsonMatch) {
      cleanJson = jsonMatch[1].trim();
    } else {
      const firstBrace = cleanJson.indexOf('{');
      const lastBrace = cleanJson.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
      }
    }

    const parsed = JSON.parse(cleanJson);

    const formattedDaily = parsed.dailyTasks.map(d => ({
      day: d.day,
      focus: d.focus || `ภารกิจประจำวันที่ ${d.day}`,
      notes: '',
      tasks: (d.tasks || []).map((t, idx) => {
        let resources = [];
        if (Array.isArray(t.resources) && t.resources.length > 0) {
          resources = t.resources.filter(r => r && (r.url || r.title)).map(r => ({
            title: r.title || 'ศึกษาข้อมูลเพิ่มเติม',
            url: r.url || `https://www.google.com/search?q=${encodeURIComponent(t.title || title)}`
          }));
        } else {
          resources = [{
            title: `🔍 ค้นคว้าเรื่อง "${t.title}"`,
            url: `https://www.google.com/search?q=${encodeURIComponent((title || '') + ' ' + (t.title || ''))}`
          }];
        }

        return {
          id: t.id || Utils.generateId(`t_${d.day}_${idx}`),
          title: t.title || 'ภารกิจย่อย',
          description: t.description || '',
          estMinutes: parseInt(t.estMinutes, 10) || Math.floor(dailyMinutes / (d.tasks.length || 1)),
          difficulty: ['easy', 'medium', 'hard'].includes(t.difficulty) ? t.difficulty : (d.day <= 4 ? 'easy' : (d.day <= 9 ? 'medium' : 'hard')),
          tip: t.tip || '',
          drill: t.drill || null,
          resources: resources,
          completed: false,
          completedAt: null
        };
      })
    }));

    return {
      summary: parsed.summary || `แผนพัฒนาตนเองแบบไต่ระดับ ${durationDays} วันสำหรับ ${title}`,
      coachAdvice: parsed.coachAdvice || 'ความยากที่เพิ่มขึ้นในแต่ละวันคือเครื่องพิสูจน์ว่าคุณกำลังเก่งขึ้นเรื่อยๆ!',
      phases: parsed.phases || [
        { phaseNumber: 1, title: 'ระยะที่ 1: ปูพื้นฐาน (Day 1 - 4)', daysRange: 'Day 1 - 4', description: 'สร้างความคุ้นเคยเบื้องต้น' },
        { phaseNumber: 2, title: 'ระยะที่ 2: เสริมความแกร่ง (Day 5 - 8)', daysRange: 'Day 5 - 8', description: 'เพิ่มความเข้มข้น' },
        { phaseNumber: 3, title: 'ระยะที่ 3: ประยุกต์ใช้จริง (Day 9 - 12)', daysRange: 'Day 9 - 12', description: 'การฝึกขั้นสูง' },
        { phaseNumber: 4, title: 'ระยะที่ 4: พิชิตเป้าหมาย (Day 13 - 14)', daysRange: 'Day 13 - 14', description: 'ทดสอบและวัดผลรวม' }
      ],
      dailyTasks: formattedDaily
    };
  },

  generateSmartOfflineBreakdown({ title, category, durationDays, dailyMinutes, level, notes }) {
    const t = (title || '').toLowerCase();
    
    const isHealth = category === 'health' || t.includes('ลด') || t.includes('อ้วน') || t.includes('น้ำหนัก') || t.includes('ออกกำลัง') || t.includes('ฟิต') || t.includes('วิ่ง') || t.includes('หุ่น') || t.includes('กล้าม') || t.includes('ว่ายน้ำ');
    const isCoding = category === 'coding' || t.includes('โค้ด') || t.includes('โปรแกรม') || t.includes('เว็บ') || t.includes('python') || t.includes('javascript') || t.includes('react') || t.includes('html');
    const isReading = category === 'reading' || t.includes('อ่าน') || t.includes('หนังสือ') || t.includes('เรียน') || t.includes('สอบ');
    const isLanguage = category === 'language' || t.includes('อังกฤษ') || t.includes('ภาษา') || t.includes('english') || t.includes('japanese');

    let curriculumData = [];
    let summaryText = '';
    let coachAdviceText = '';
    let phases = [];

    // -------------------------------------------------------------
    // CATEGORY 1: HEALTH, FITNESS & WEIGHT LOSS
    // -------------------------------------------------------------
    if (isHealth) {
      summaryText = `โปรแกรมลดน้ำหนักและกระชับสัดส่วน ${durationDays} วันแบบ Progressive Training ผสานเวทเทรนนิ่ง คาร์ดิโอ และคุมโภชนาการ`;
      coachAdviceText = `การลดน้ำหนักที่ยั่งยืนไม่ได้มาจากการอดอาหาร แต่อยู่ที่การขยับร่างกายอย่างถูกวิธีและทานอาหารที่มีประโยชน์ในทุกๆ วัน!`;
      phases = [
        { phaseNumber: 1, title: 'ระยะที่ 1: ปรับระบบเผาผลาญ & วางรากฐาน (Day 1-4)', daysRange: 'Day 1 - 4', description: 'กระตุ้นกล้ามเนื้อมัดใหญ่ ปรับการดื่มน้ำ และตัดน้ำตาล' },
        { phaseNumber: 2, title: 'ระยะที่ 2: เผาผลาญไขมัน & เพิ่มความเข้มข้น (Day 5-8)', daysRange: 'Day 5 - 8', description: 'HIIT คาร์ดิโอสลับความเร็ว และจัดสัดส่วนอาหารคลีน' },
        { phaseNumber: 3, title: 'ระยะที่ 3: กระชับสัดส่วน & สร้างกล้ามเนื้อลีน (Day 9-12)', daysRange: 'Day 9 - 12', description: 'เพิ่มน้ำหนัก/จำนวนครั้ง (Progressive Overload) และเน้นแกนกลางลำตัว' },
        { phaseNumber: 4, title: `ระยะที่ 4: ทดสอบความฟิต & วัดผล (Day 13-${durationDays})`, daysRange: `Day 13 - ${durationDays}`, description: '100 Reps Challenge และประเมินผลลัพธ์แห่งชัยชนะ' }
      ];

      const workoutRoutines = [
        { focus: 'Full-Body Foundation & ตัดน้ำหวาน 100%', title: 'ออกกำลังกายพื้นฐานกระตุ้นกล้ามเนื้อมัดใหญ่', exercises: [{ name: 'Bodyweight Squats', reps: '12 ครั้ง' }, { name: 'Knee Push-ups', reps: '10 ครั้ง' }, { name: 'Plank', reps: '20 วินาที' }], nutrition: 'ดื่มน้ำ 2.5 ลิตร & ตัดน้ำหวาน', nutDesc: 'งดเครื่องดื่มที่มีน้ำตาลทั้งหมด' },
        { focus: 'Low-Impact Cardio & เริ่มต้นบันทึกอาหาร', title: 'คาร์ดิโอเบิร์นไขมันระดับเริ่มต้น (Cardio Burn)', exercises: [{ name: 'Jumping Jacks (หรือก้าวแตะสลับ)', reps: '30 วินาที' }, { name: 'High Knees (ยกเข่าสูง)', reps: '30 วินาที' }, { name: 'Butt Kicks', reps: '30 วินาที' }], nutrition: 'เริ่มบันทึกอาหารทุกมื้อ', nutDesc: 'จดบันทึกอาหารที่กินเพื่อให้รู้แคลอรี่คร่าวๆ' },
        { focus: 'Upper Body Strength & โปรตีนมื้อเช้า', title: 'สร้างความแข็งแรงช่วงบน (แขน ไหล่ อก)', exercises: [{ name: 'Push-ups', reps: '10 ครั้ง' }, { name: 'Pike Push-ups', reps: '8 ครั้ง' }, { name: 'Triceps Dips (กับเก้าอี้)', reps: '10 ครั้ง' }], nutrition: 'เน้นโปรตีนในมื้อเช้า', nutDesc: 'เพิ่มไข่ต้ม หรืออกไก่ในมื้อเช้าเพื่อให้อิ่มนาน' },
        { focus: 'Lower Body Sculpt & เลี่ยงของทอด', title: 'กระชับต้นขาและสะโพก (Lower Body Sculpt)', exercises: [{ name: 'Walking Lunges', reps: '10 ครั้ง/ข้าง' }, { name: 'Glute Bridges', reps: '15 ครั้ง' }, { name: 'Calf Raises', reps: '20 ครั้ง' }], nutrition: 'ลดของทอดของมัน', nutDesc: 'เปลี่ยนจากของทอดเป็นต้ม ย่าง หรือนึ่ง' },
        { focus: 'Core & Abs Burner & กฎผักครึ่งจาน', title: 'สร้างซิกแพคและลดพุง (Core Burner)', exercises: [{ name: 'Crunches', reps: '20 ครั้ง' }, { name: 'Russian Twists', reps: '20 ครั้ง' }, { name: 'Leg Raises', reps: '15 ครั้ง' }], nutrition: 'กฎผัก 50% ของจาน', nutDesc: 'มื้อเที่ยงและเย็น ต้องมีผักใบเขียวครึ่งจาน' },
        { focus: 'Active Recovery & Stretching', title: 'วันพักฟื้น ยืดเหยียดกล้ามเนื้อ (Yoga/Stretching)', exercises: [{ name: 'Cat-Cow Stretch', reps: '1 นาที' }, { name: 'Child\'s Pose', reps: '1 นาที' }, { name: 'Downward Dog', reps: '1 นาที' }], nutrition: 'นอนหลับ 7-8 ชั่วโมง', nutDesc: 'วันพักฟื้น ร่างกายต้องการการนอนหลับที่มีคุณภาพ' },
        { focus: 'HIIT Fat Blast & วันชีทมีลแบบมีสติ', title: 'คาดิโอความเข้มข้นสูง (HIIT 15 นาที)', exercises: [{ name: 'Burpees', reps: '40 วิ (พัก 20 วิ)' }, { name: 'Mountain Climbers', reps: '40 วิ (พัก 20 วิ)' }, { name: 'Jump Squats', reps: '40 วิ (พัก 20 วิ)' }], nutrition: 'ควบคุมสติในวัน Cheat Meal', nutDesc: 'ทานของชอบได้ 1 มื้อ แต่ปริมาณพอดีไม่ยัดเยียด' },
        { focus: 'Advanced Full-Body & โภชนาการก่อนออกกำลัง', title: 'ออกกำลังกายแบบคอมพาวด์ (Compound Movements)', exercises: [{ name: 'Squat to Press (ขวดน้ำ)', reps: '15 ครั้ง' }, { name: 'Renegade Rows', reps: '12 ครั้ง' }, { name: 'Spiderman Plank', reps: '16 ครั้ง' }], nutrition: 'อาหารก่อนออกกำลังกาย (Pre-workout)', nutDesc: 'ทานกล้วยหอม หรือกาแฟดำก่อนออกกำลังกาย 30 นาที' },
        { focus: 'Endurance Cardio & ลดโซเดียม', title: 'ฝึกความอึดของหัวใจ (Steady State Cardio)', exercises: [{ name: 'วิ่งเหยาะๆ หรือเดินเร็ว', reps: '30 นาทีต่อเนื่อง' }, { name: 'กระโดดเชือก', reps: '5 นาที' }, { name: 'Jumping Jacks', reps: '3 นาที' }], nutrition: 'ลดโซเดียมและผงชูรส', nutDesc: 'ซดน้ำซุปให้น้อยลง ลดเครื่องปรุงรสจัด' },
        { focus: 'Back & Biceps & ไขมันดี', title: 'ดึงและกระชับแผ่นหลัง (Back & Biceps)', exercises: [{ name: 'Superman Pose', reps: '15 ครั้ง' }, { name: 'Towel Rows (ใช้ผ้าขนหนู)', reps: '15 ครั้ง' }, { name: 'Bicep Curls (ขวดน้ำ)', reps: '15 ครั้ง' }], nutrition: 'ทานไขมันดี (Good Fats)', nutDesc: 'เพิ่มถั่วอัลมอนด์ อะโวคาโด หรือน้ำมันมะกอก' },
        { focus: 'Dynamic Legs & มื้อเย็นเบาๆ', title: 'ฝึกขาแบบเคลื่อนไหว (Plyometric Legs)', exercises: [{ name: 'Skater Jumps', reps: '20 ครั้ง' }, { name: 'Lunge Jumps', reps: '16 ครั้ง' }, { name: 'Wall Sit', reps: '45 วินาที' }], nutrition: 'มื้อเย็นเบาๆ (Light Dinner)', nutDesc: 'ทานสลัด หรือปลา และงดแป้งขัดขาวในมื้อเย็น' },
        { focus: 'Mobility Flow & ชาเขียว', title: 'เพิ่มความยืดหยุ่นให้ข้อต่อ (Mobility Flow)', exercises: [{ name: 'World\'s Greatest Stretch', reps: '5 ครั้ง/ข้าง' }, { name: 'Hip Rotations', reps: '10 ครั้ง' }, { name: 'Arm Circles', reps: '20 ครั้ง' }], nutrition: 'ดื่มชาเขียวไม่มีน้ำตาล', nutDesc: 'ชาเขียวมีสาร EGCG ช่วยเร่งการเผาผลาญไขมัน' },
        { focus: 'Total Core Annihilation & IF 16/8', title: 'ระเบิดหน้าท้องขั้นสุด (Core Annihilation)', exercises: [{ name: 'V-Ups', reps: '15 ครั้ง' }, { name: 'Bicycle Crunches', reps: '30 ครั้ง' }, { name: 'Plank Jacks', reps: '20 ครั้ง' }], nutrition: 'ทดลองทำ IF 16/8', nutDesc: 'งดอาหาร 16 ชม. ทาน 8 ชม. เพื่อดึงไขมันเก่ามาใช้' },
        { focus: 'The 100 Rep Challenge & สรุปผล', title: 'ทดสอบความฟิต (100 Reps Challenge)', exercises: [{ name: 'Squats', reps: '25 ครั้ง' }, { name: 'Push-ups', reps: '25 ครั้ง' }, { name: 'Sit-ups', reps: '50 ครั้ง' }], nutrition: 'ประเมินสัดส่วนและเป้าหมาย', nutDesc: 'ชั่งน้ำหนัก วัดสัดส่วน และถ่ายรูปเก็บความภูมิใจ' }
      ];

      curriculumData = [];
      for (let d = 1; d <= Math.max(14, durationDays); d++) {
        const stage = workoutRoutines[(d - 1) % workoutRoutines.length];
        const round = Math.floor((d - 1) / workoutRoutines.length) + 1;
        curriculumData.push({
          focus: `Level ${Math.min(6, Math.ceil(d / 2))}: ${stage.focus} (วันที่ ${d}${round > 1 ? ` · รอบ ${round}` : ''})`,
          task1: {
            title: `🔥 ${stage.title} (${Utils.formatMinutes(Math.floor(dailyMinutes * 0.6))})`,
            desc: `ออกกำลังกายตามลำดับท่าฝึกอย่างมีวินัย พักระหว่างเซ็ต 45 วินาที`,
            tip: 'พยายามทำจำนวนครั้งให้มากกว่ารอบที่แล้วเสมอ (Progressive Overload)',
            drill: {
              type: 'workout',
              title: `ตารางฝึก Day ${d}`,
              exercises: stage.exercises.map(ex => ({ name: ex.name, sets: '3 เซ็ต', reps: ex.reps, rest: '45 วิ' }))
            },
            resources: [{ title: '▶️ Workout tutorials at home', url: `https://www.youtube.com/results?search_query=${encodeURIComponent(stage.title)}` }]
          },
          task2: {
            title: `🥗 ภารกิจโภชนาการ: ${stage.nutrition}`,
            desc: stage.nutDesc,
            tip: 'สุขภาพ 80% มาจากอาหารในครัว 20% มาจากการออกกำลังกาย',
            drill: null,
            resources: [{ title: '💡 เคล็ดลับโภชนาการ', url: `https://www.google.com/search?q=${encodeURIComponent(stage.nutrition)}` }]
          }
        });
      }

    // -------------------------------------------------------------
    // CATEGORY 2: CODING / PROGRAMMING
    // -------------------------------------------------------------
    } else if (isCoding) {
      summaryText = `หลักสูตรฝึกเขียนโค้ดและพัฒนาโปรเจกต์ ${durationDays} วันแบบ Progressive Learning`;
      coachAdviceText = `วิธีเรียนโค้ดที่ดีที่สุดคือการลงมือพิมพ์โค้ดจริงและสร้างโปรเจกต์ของตัวเอง!`;
      phases = [
        { phaseNumber: 1, title: 'ระยะที่ 1: โครงสร้าง & ดีไซน์พื้นฐาน (Day 1-4)', daysRange: 'Day 1 - 4', description: 'HTML5 & CSS Flexbox' },
        { phaseNumber: 2, title: 'ระยะที่ 2: Logic & Interactive Programming (Day 5-8)', daysRange: 'Day 5 - 8', description: 'JavaScript Functions & DOM' },
        { phaseNumber: 3, title: 'ระยะที่ 3: Data & API Integration (Day 9-12)', daysRange: 'Day 9 - 12', description: 'Fetch API, Promises & LocalStorage' },
        { phaseNumber: 4, title: `ระยะที่ 4: Capstone Showcase (Day 13-${durationDays})`, daysRange: `Day 13 - ${durationDays}`, description: 'Deploy โปรเจกต์จริง' }
      ];

      const codingTopics = [
        { focus: 'HTML Structure & Semantic Tags', topic: 'วางโครงสร้าง HTML', review: 'เช็คความถูกต้องของ Semantic HTML' },
        { focus: 'CSS Styling & Colors', topic: 'ตกแต่งหน้าเว็บด้วย CSS', review: 'ทดสอบความสวยงามของสี' },
        { focus: 'CSS Flexbox & Grid Layout', topic: 'จัด Layout ด้วย Flexbox/Grid', review: 'ทดสอบ Responsive บนมือถือ' },
        { focus: 'CSS Animations & Transitions', topic: 'เพิ่มลูกเล่น Animation', review: 'เช็คความลื่นไหลของการแสดงผล' },
        { focus: 'JavaScript Variables & Logic', topic: 'เขียนลอจิกพื้นฐาน (Variables/If-Else)', review: 'console.log เช็คตัวแปร' },
        { focus: 'JavaScript Functions & Arrays', topic: 'สร้างฟังก์ชันจัดการข้อมูล', review: 'รันโค้ดและเทสผลลัพธ์ของฟังก์ชัน' },
        { focus: 'DOM Manipulation', topic: 'เขียน JS เพื่อควบคุม HTML (DOM)', review: 'ทดสอบคลิกปุ่มบนหน้าเว็บ' },
        { focus: 'Event Listeners & Forms', topic: 'รับค่าจาก Form และ Event', review: 'กรอกฟอร์มแล้วเช็คว่ามี Error ไหม' },
        { focus: 'Local Storage & Data Persistence', topic: 'บันทึกข้อมูลลง Local Storage', review: 'ลองรีเฟรชหน้าเว็บว่าข้อมูลยังอยู่ไหม' },
        { focus: 'API Fetching & Promises (1)', topic: 'ดึงข้อมูลจาก API', review: 'เช็ค Network Tab ใน DevTools' },
        { focus: 'API Fetching & Promises (2)', topic: 'แสดงผลข้อมูล API บนหน้าเว็บ', review: 'เช็คว่าข้อมูลที่ดึงมาแสดงผลถูกต้องไหม' },
        { focus: 'Error Handling & Debugging', topic: 'ดักจับ Error และ Bug (Try/Catch)', review: 'ลองทำให้ระบบพังดูว่าดัก Error ได้ไหม' },
        { focus: 'Refactoring & Clean Code', topic: 'จัดระเบียบโค้ดให้สะอาด (Refactoring)', review: 'อ่านโค้ดตัวเองซ้ำอีกรอบว่าเข้าใจไหม' },
        { focus: 'Deployment & Hosting', topic: 'เตรียมโปรเจกต์สำหรับ Deploy (เช่น Vercel, Netlify)', review: 'อัปโหลดขึ้น GitHub และเช็คลิ้งค์จริง' }
      ];

      curriculumData = [];
      for (let d = 1; d <= Math.max(14, durationDays); d++) {
        const stage = codingTopics[(d - 1) % codingTopics.length];
        const round = Math.floor((d - 1) / codingTopics.length) + 1;
        curriculumData.push({
          focus: `Level ${Math.min(6, Math.ceil(d/2))}: ${stage.focus} (วันที่ ${d}${round > 1 ? ` · รอบ ${round}` : ''})`,
          task1: {
            title: `💻 ภารกิจเขียนโค้ด: ${stage.topic}`,
            desc: `เปิด VS Code หรือ Editor แล้วลงมือเขียนโค้ดตามหัวข้อนี้อย่างน้อย ${Utils.formatMinutes(Math.floor(dailyMinutes * 0.6))}`,
            tip: 'ฝึกแก้ Error ด้วยการอ่านข้อความใน Console อย่างใจเย็น หรือโยนถาม AI',
            drill: {
              type: 'code',
              title: `Code Snippet Day ${d}`,
              code: `// ${stage.topic} - Day ${d}\nconsole.log('เริ่มเขียนโค้ดสำหรับวันนี้เลย!');\n\n// TODO: ลงมือทำ ${stage.topic}`
            },
            resources: [{ title: '🌐 ค้นหาข้อมูลใน MDN Docs', url: `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(stage.focus)}` }]
          },
          task2: {
            title: `🧪 ตรวจสอบและ Review: ${stage.review}`,
            desc: `ทดลองรันโค้ดและตรวจเช็คผลลัพธ์บนเบราว์เซอร์`,
            tip: 'การบันทึกโค้ดบ่อยๆ (Git commit) ช่วยให้เราย้อนกลับได้เมื่อทำพัง',
            drill: null,
            resources: [{ title: '💻 Stack Overflow', url: 'https://stackoverflow.com/' }]
          }
        });
      }

    // -------------------------------------------------------------
    // CATEGORY 3: READING / STUDY
    // -------------------------------------------------------------
    } else if (isReading) {
      summaryText = `แผนการอ่านและย่อยความรู้ ${durationDays} วันแบบ Progressive Knowledge Blueprint`;
      coachAdviceText = `การอ่านที่ได้นำมาลงมือทำ มีค่ามากกว่าการอ่านหลายเล่มแล้วลืมไป!`;
      phases = [
        { phaseNumber: 1, title: 'ระยะที่ 1: วางภาพรวม & สารบัญ (Day 1-4)', daysRange: 'Day 1 - 4', description: 'Inspectional Reading' },
        { phaseNumber: 2, title: 'ระยะที่ 2: ดำดิ่งเนื้อหาแกนกลาง (Day 5-8)', daysRange: 'Day 5 - 8', description: 'Deep Reading & Notes' },
        { phaseNumber: 3, title: 'ระยะที่ 3: ตกผลึก & วิเคราะห์ (Day 9-12)', daysRange: 'Day 9 - 12', description: 'Feynman Technique' },
        { phaseNumber: 4, title: `ระยะที่ 4: สรุปเล่ม & Action Plan (Day 13-${durationDays})`, daysRange: `Day 13 - ${durationDays}`, description: 'ประยุกต์ใช้จริง' }
      ];

      const readingStrategies = [
        { focus: 'สำรวจหนังสือ & สารบัญ', topic: 'อ่านแบบสำรวจ (Inspectional Reading)', review: 'สรุปโครงสร้างหนังสือ', qty: 'สารบัญและบทนำ' },
        { focus: 'อ่านเพื่อจับใจความหลัก', topic: 'สแกนหา Keywords สำคัญ', review: 'เขียน Keyword 5 คำ', qty: 'บทที่ 1 หรือ 15 หน้า' },
        { focus: 'Deep Reading (โฟกัสสูงสุด)', topic: 'อ่านแบบเจาะลึก (Deep Reading)', review: 'จดโน้ตย่อด้วยภาษาตัวเอง', qty: 'บทที่ 2 หรือ 20 หน้า' },
        { focus: 'Feynman Technique (1)', topic: 'อธิบายสิ่งที่อ่านให้เด็กฟัง', review: 'พูดอัดเสียงตัวเอง', qty: 'สรุป 30 หน้าแรก' },
        { focus: 'เชื่อมโยงกับชีวิตจริง', topic: 'หา 1 ไอเดียที่ประยุกต์ใช้ได้เลย', review: 'วางแผน Action Plan เล็กๆ', qty: 'บทต่อไป 20 หน้า' },
        { focus: 'ตั้งคำถามกับผู้เขียน', topic: 'อ่านแบบวิพากษ์ (Critical Reading)', review: 'เขียนคำถามที่สงสัย 2 ข้อ', qty: 'บทต่อไป 15 หน้า' },
        { focus: 'สร้าง Mind Map', topic: 'วาดแผนผังเชื่อมโยงเนื้อหา', review: 'ทบทวน Mind Map', qty: 'บทต่อไป 20 หน้า' },
        { focus: 'อ่านแบบจับเวลา (Pomodoro)', topic: 'อ่านแบบ 25 นาที พัก 5 นาที', review: 'ประเมินสมาธิตัวเอง', qty: 'บทต่อไป 20 หน้า' },
        { focus: 'อ่านข้ามน้ำ (Skimming)', topic: 'ข้ามส่วนยืดเยื้อ หาเฉพาะแก่น', review: 'สรุปแก่นของบท', qty: 'อ่านข้ามบทที่น้ำเยอะ' },
        { focus: 'Feynman Technique (2)', topic: 'อธิบายแนวคิดที่ยากที่สุด', review: 'เขียนสรุป 1 หน้ากระดาษ', qty: 'ทบทวนส่วนที่ยาก' },
        { focus: 'Highlight & Note', topic: 'ไฮไลต์เฉพาะประโยคเปลี่ยนชีวิต', review: 'คัดลอกประโยคเด็ดลงสมุด', qty: 'บทต่อไป 20 หน้า' },
        { focus: 'ถกเถียงกับหนังสือ', topic: 'หาข้อโต้แย้งในสิ่งที่ผู้เขียนบอก', review: 'บันทึกมุมมองที่ต่างออกไป', qty: 'บทต่อไป 15 หน้า' },
        { focus: 'สรุปรวมเล่ม', topic: 'รวบรวมโน้ตทั้งหมดที่จดไว้', review: 'เขียนบทสรุปภาพรวม', qty: 'ทบทวนเนื้อหาทั้งหมด' },
        { focus: 'Action Plan', topic: 'แปลงความรู้เป็นการลงมือทำ', review: 'ตั้งเป้าหมายจากหนังสือ 1 อย่าง', qty: 'ออกแบบแผนปฏิบัติ' }
      ];

      curriculumData = [];
      for (let d = 1; d <= Math.max(14, durationDays); d++) {
        const stage = readingStrategies[(d - 1) % readingStrategies.length];
        const round = Math.floor((d - 1) / readingStrategies.length) + 1;
        curriculumData.push({
          focus: `Level ${Math.min(6, Math.ceil(d/2))}: ${stage.focus} (วันที่ ${d}${round > 1 ? ` · รอบ ${round}` : ''})`,
          task1: {
            title: `📖 ${stage.topic} (${stage.qty})`,
            desc: `อ่านอย่างมีสมาธิแบบ Deep Work ${Utils.formatMinutes(Math.floor(dailyMinutes * 0.6))} ไม่เปิดแจ้งเตือนโทรศัพท์`,
            tip: 'ถ้าหลุดโฟกัส ให้สูดหายใจลึกๆ 3 ครั้งแล้วดึงความสนใจกลับมาที่ตัวหนังสือ',
            drill: {
              type: 'steps',
              title: `ภารกิจการอ่านประจำวันที่ ${d}`,
              items: [
                `1. ${stage.topic}`,
                `2. สรุปใจความสำคัญ 2-3 ประโยค`,
                `3. เชื่อมโยงสิ่งที่อ่านเข้ากับประสบการณ์ตัวเอง`
              ]
            },
            resources: [{ title: '🧠 Feynman Technique เทคนิคการเรียนรู้ที่จำแม่น', url: `https://www.google.com/search?q=${encodeURIComponent('Feynman technique คืออะไร')}` }]
          },
          task2: {
            title: `✍️ บันทึกบทเรียน: ${stage.review}`,
            desc: `จดบันทึกสิ่งที่ได้เรียนรู้วันนี้ เพื่อเปลี่ยนจาก "แค่ตาดู" เป็น "ความจำระยะยาว"`,
            tip: 'การเขียนสรุปด้วยคำพูดตัวเองทำให้ข้อมูลถูกย้ายเข้าสู่ความจำถาวร',
            drill: null,
            resources: [{ title: '📚 Goodreads: หาแรงบันดาลใจจากหนังสือ', url: 'https://goodreads.com/' }]
          }
        });
      }

    // -------------------------------------------------------------
    // CATEGORY 4: LANGUAGE (ENGLISH)
    // -------------------------------------------------------------
    } else if (isLanguage) {
      summaryText = `หลักสูตรภาษาอังกฤษ ${durationDays} วันแบบ Progressive Difficulty ตั้งแต่ปูพื้นฐานสู่ระดับมืออาชีพ`;
      coachAdviceText = `แต่ละวันความท้าทายจะเพิ่มขึ้นทีละขั้น ทำทีละวันอย่างมีวินัย แล้วคุณจะประหลาดใจกับผลลัพธ์!`;
      phases = [
        { phaseNumber: 1, title: 'ระยะที่ 1: ปูพื้นฐานและคำศัพท์สำคัญ (Level 1)', daysRange: 'Day 1 - 4', description: 'เริ่มต้นจากคำศัพท์และโครงสร้างง่ายๆ' },
        { phaseNumber: 2, title: 'ระยะที่ 2: เชื่อมโยงและสื่อสารคล่องตัว (Level 2)', daysRange: 'Day 5 - 8', description: 'ประโยคที่ซับซ้อนขึ้นและสำนวนทำงาน' },
        { phaseNumber: 3, title: 'ระยะที่ 3: สื่อสารระดับมืออาชีพ (Level 3)', daysRange: 'Day 9 - 12', description: 'การนำเสนองานและการเจรจาต่อรอง' },
        { phaseNumber: 4, title: `ระยะที่ 4: บททดสอบเสมือนจริง (Day 13-${durationDays})`, daysRange: `Day 13 - ${durationDays}`, description: 'จำลองการสัมภาษณ์งานและสปีช' }
      ];

      const vocabs = [
        { w: "Accomplish", ipa: "/əˈkɑːm.plɪʃ/", m: "ทำสำเร็จ, บรรลุผล", ex: "I will accomplish my goals step by step.", t2: "แนะนำตัวเองเป็นภาษาอังกฤษ (Self-Introduction)" },
        { w: "Prioritize", ipa: "/praɪˈɔːr.ə.taɪz/", m: "จัดลำดับความสำคัญ", ex: "We must prioritize our most important task.", t2: "พูดคุยเรื่องงานอดิเรกและความชอบ" },
        { w: "Collaborate", ipa: "/kəˈlæb.ə.reɪt/", m: "ร่วมมือกันทำงาน", ex: "Let's collaborate on this new project.", t2: "การสั่งอาหารที่ร้านอาหาร (Ordering Food)" },
        { w: "Resilience", ipa: "/rɪˈzɪl.jəns/", m: "ความยืดหยุ่นทางใจ, การฟื้นตัว", ex: "Resilience helps us overcome challenges.", t2: "การถามทางและการบอกทาง (Directions)" },
        { w: "Feasible", ipa: "/ˈfiː.zə.bəl/", m: "เป็นไปได้จริง, ปฏิบัติได้", ex: "This timeline is very feasible.", t2: "การจองโรงแรมและการเช็คอิน (Hotel Check-in)" },
        { w: "Compelling", ipa: "/kəmˈpel.ɪŋ/", m: "น่าดึงดูดใจ, มีเหตุผลหนักแน่น", ex: "She made a compelling presentation.", t2: "เล่าเรื่องราวในอดีต (Past Tense Practice)" },
        { w: "Streamline", ipa: "/ˈstriːm.laɪn/", m: "ปรับกระบวนการให้กระชับ", ex: "We streamline our workflow daily.", t2: "การสัมภาษณ์งานพื้นฐาน (Job Interview Basics)" },
        { w: "Articulate", ipa: "/ɑːrˈtɪk.jə.leɪt/", m: "ถ่ายทอดความคิดได้ชัดเจน", ex: "He articulates his ideas clearly.", t2: "การอธิบายปัญหาที่ทำงาน (Describing Issues)" },
        { w: "Mitigate", ipa: "/ˈmɪt̬.ə.ɡeɪt/", m: "บรรเทา, ลดผลกระทบ", ex: "We mitigated the risk early.", t2: "การต่อรองราคา (Bargaining & Negotiation)" },
        { w: "Paradigm", ipa: "/ˈper.ə.daɪm/", m: "กระบวนทัศน์, แบบจำลองความคิด", ex: "A new paradigm in learning.", t2: "การแสดงความคิดเห็น (Expressing Opinions)" },
        { w: "Spearhead", ipa: "/ˈspɪr.hed/", m: "เป็นหัวหอกนำทัพขับเคลื่อน", ex: "She spearheaded the project.", t2: "อธิบายแผนการในอนาคต (Future Tense)" },
        { w: "Innovative", ipa: "/ˈɪn.ə.veɪ.t̬ɪv/", m: "ซึ่งสร้างสรรค์สิ่งใหม่", ex: "We need an innovative solution.", t2: "จำลองการประชุม (Meeting Simulation)" },
        { w: "Proactive", ipa: "/proʊˈæk.tɪv/", m: "เชิงรุก, ล่วงหน้า", ex: "Be proactive, not reactive.", t2: "การนำเสนองานสั้นๆ (Mini Presentation)" },
        { w: "Synergy", ipa: "/ˈsɪn.ɚ.dʒi/", m: "การผสานพลัง", ex: "Our team has great synergy.", t2: "รีวิวภาพยนตร์หรือหนังสือที่ชอบ" }
      ];

      curriculumData = [];
      for (let d = 1; d <= Math.max(14, durationDays); d++) {
        const v = vocabs[(d - 1) % vocabs.length];
        const round = Math.floor((d - 1) / vocabs.length) + 1;
        curriculumData.push({
          focus: `Level ${Math.min(6, Math.ceil(d/2))}: คำศัพท์และการสื่อสาร (วันที่ ${d}${round > 1 ? ` · รอบ ${round}` : ''})`,
          task1: {
            title: `🗣️ ฝึกคำศัพท์และการออกเสียง: ${v.w}`,
            desc: `กดปุ่ม 🔊 เพื่อฟังเสียงอ่านภาษาอังกฤษ ฝึกออกเสียงตาม 3 รอบ`,
            tip: `ออกเสียงคำว่า "${v.w}" ให้ชัดเจนและฟังตัวอย่างประโยค`,
            drill: {
              type: 'vocab',
              title: `คำศัพท์ประจำวัน Day ${d}`,
              items: [
                { word: v.w, ipa: v.ipa, meaning: v.m, example: v.ex }
              ]
            },
            resources: [{ title: '📚 Cambridge Dictionary', url: 'https://dictionary.cambridge.org/' }]
          },
          task2: {
            title: `🎙️ ฝึกพูดสื่อสาร: ${v.t2}`,
            desc: `ฝึกพูดออกเสียงประโยค 2-3 นาทีอย่างมั่นใจ หัวข้อ: ${v.t2}`,
            tip: 'บันทึกเสียงตัวเองไว้ในโทรศัพท์เพื่อฟังสำเนียงย้อนหลัง แล้วเทียบกับเจ้าของภาษา',
            drill: null,
            resources: [{ title: '▶️ English Speaking Practice', url: `https://www.youtube.com/results?search_query=${encodeURIComponent(v.t2 + ' conversation english')}` }]
          }
        });
      }

    // -------------------------------------------------------------
    // CATEGORY 5: GENERAL / CAREER / OTHER
    // -------------------------------------------------------------
    } else {
      summaryText = `แผนกลยุทธ์ ${durationDays} วันแบบ Progressive Action Blueprint สำหรับ "${title}"`;
      coachAdviceText = `ความลับของความสำเร็จอยู่ที่การทำขั้นตอนเล็กๆ ที่ชัดเจนในแต่ละวันอย่างไม่หยุดยั้ง!`;
      phases = [
        { phaseNumber: 1, title: 'ระยะที่ 1: วางผังและเตรียมความพร้อม (Day 1-4)', daysRange: 'Day 1 - 4', description: 'วิเคราะห์เป้าหมาย จัดหาทรัพยากร' },
        { phaseNumber: 2, title: 'ระยะที่ 2: ลงมือปฏิบัติการหลัก (Day 5-8)', daysRange: 'Day 5 - 8', description: 'สร้างชิ้นงานและทดสอบ' },
        { phaseNumber: 3, title: 'ระยะที่ 3: ปรับแต่งและขยายผล (Day 9-12)', daysRange: 'Day 9 - 12', description: 'แก้ปัญหาคอขวดและเพิ่มประสิทธิภาพ' },
        { phaseNumber: 4, title: `ระยะที่ 4: สรุปผลลัพธ์และตกผลึก (Day 13-${durationDays})`, daysRange: `Day 13 - ${durationDays}`, description: 'วัดผลสำเร็จและส่งมอบผลงาน' }
      ];

      const actionStages = [
        { focus: 'กำหนดเส้นชัยให้ชัด', main: 'นิยามผลลัพธ์สุดท้ายและเกณฑ์ความสำเร็จ', detail: 'เขียนภาพความสำเร็จของเป้าหมายให้อ่านแล้ววัดผลได้', review: 'ตั้งตัวชี้วัดและกำหนดจุดเริ่มต้น', tip: 'เป้าหมายที่วัดได้ จะช่วยให้รู้ว่าควรทำอะไรต่อ' },
        { focus: 'ค้นคว้าทิศทาง', main: 'รวบรวมความรู้และตัวอย่างที่เชื่อถือได้', detail: 'ค้นหาแนวทาง ตัวอย่าง หรือผู้ที่ทำเป้าหมายนี้สำเร็จแล้ว', review: 'บันทึก 3 สิ่งที่นำไปใช้ได้จริง', tip: 'เริ่มจากแหล่งข้อมูลน้อยชิ้นแต่เชื่อถือได้' },
        { focus: 'เตรียมเครื่องมือ', main: 'จัดเตรียมเครื่องมือและสภาพแวดล้อม', detail: 'เตรียมอุปกรณ์ ไฟล์ พื้นที่ หรือคนที่ต้องใช้ให้พร้อม', review: 'ตัดสิ่งกีดขวางหนึ่งอย่างก่อนเริ่มวันพรุ่งนี้', tip: 'ทำให้การเริ่มต้นง่ายที่สุดก่อนเพิ่มความยาก' },
        { focus: 'แตกงานให้เล็ก', main: 'แบ่งเป้าหมายเป็นงานย่อยที่ทำได้ทันที', detail: 'เลือกงานย่อยหนึ่งชิ้นที่ทำเสร็จได้ในเวลาที่มี', review: 'จัดลำดับงานย่อยตามผลกระทบ', tip: 'งานที่เล็กพอจะทำให้เริ่มได้ทันที' },
        { focus: 'ลงมือสร้างชิ้นแรก', main: 'สร้างผลลัพธ์ฉบับแรกที่ยังไม่ต้องสมบูรณ์', detail: 'ทำร่าง ทดลอง หรือฝึกส่วนพื้นฐานของเป้าหมาย', review: 'ระบุสิ่งหนึ่งที่ทำสำเร็จแล้ว', tip: 'เวอร์ชันแรกที่ยังไม่สมบูรณ์ ดีกว่าแผนที่ยังไม่เริ่ม' },
        { focus: 'ฝึกทักษะแกนหลัก', main: 'ฝึกองค์ประกอบที่สำคัญที่สุดของเป้าหมาย', detail: 'ทำซ้ำอย่างมีสมาธิและจดจ่อกับทักษะหลักเพียงหนึ่งเรื่อง', review: 'ให้คะแนนความมั่นใจของตัวเองจาก 1-10', tip: 'การฝึกแบบเจาะจงช่วยพัฒนาเร็วกว่าแค่ทำไปเรื่อยๆ' },
        { focus: 'ทดลองใช้งานจริง', main: 'นำสิ่งที่ทำไปทดสอบในสถานการณ์ใกล้เคียงจริง', detail: 'จำลองสถานการณ์หรือทดลองกับงานขนาดเล็ก', review: 'จดปัญหาที่พบและสาเหตุ', tip: 'ความผิดพลาดจากการทดลองคือข้อมูลสำหรับรอบถัดไป' },
        { focus: 'แก้จุดติดขัด', main: 'แก้ปัญหาคอขวดที่พบจากการทดลอง', detail: 'เลือกปัญหาใหญ่ที่สุดหนึ่งข้อและหาวิธีแก้ที่ง่ายที่สุด', review: 'บันทึกวิธีแก้ที่ได้ผล', tip: 'แก้ทีละจุดจะทำให้ความคืบหน้ามองเห็นได้ชัด' },
        { focus: 'ยกระดับคุณภาพ', main: 'ปรับปรุงผลงานจากข้อสังเกตที่ผ่านมา', detail: 'เลือกส่วนที่สำคัญที่สุดของงานแล้วทำให้ดีขึ้นอีกหนึ่งระดับ', review: 'เปรียบเทียบก่อนและหลังปรับปรุง', tip: 'ปรับเพียงจุดสำคัญก่อน ไม่ต้องแก้ทุกอย่างพร้อมกัน' },
        { focus: 'ขอ feedback', main: 'รับความคิดเห็นจากคนอื่นหรือประเมินตนเองแบบมีเกณฑ์', detail: 'ส่งผลงานให้คนที่ไว้ใจหรือใช้ checklist ตรวจด้วยตัวเอง', review: 'เลือก feedback หนึ่งข้อที่จะนำไปแก้จริง', tip: 'Feedback ที่ดีต้องนำไปสู่การลงมือทำต่อได้' },
        { focus: 'ทำซ้ำอย่างสม่ำเสมอ', main: 'ทำรอบฝึกที่สองให้คล่องและเร็วขึ้น', detail: 'ทำงานเดิมในรูปแบบที่ท้าทายขึ้นหรือใช้เวลาน้อยลง', review: 'บันทึกความแตกต่างจากรอบแรก', tip: 'ความสม่ำเสมอเปลี่ยนทักษะให้กลายเป็นนิสัย' },
        { focus: 'เชื่อมโยงสู่เป้าหมายใหญ่', main: 'รวมงานย่อยให้กลายเป็นชิ้นงานหรือผลลัพธ์ที่จับต้องได้', detail: 'เชื่อมส่วนที่ทำมาตลอดให้เห็นภาพรวมของเป้าหมาย', review: 'ตรวจว่าส่วนใดยังขาดก่อนส่งมอบ', tip: 'มองภาพรวมเป็นระยะเพื่อไม่ให้หลุดจากเป้าหมาย' },
        { focus: 'ทดสอบความพร้อม', main: 'จำลองการใช้งานหรือการนำเสนอครั้งจริง', detail: 'ทำตามเงื่อนไขจริงให้ใกล้เคียงที่สุดและจับเวลา', review: 'จดรายการที่ต้องแก้ก่อนวันสุดท้าย', tip: 'การซ้อมในสถานการณ์จริงช่วยลดความกังวลได้มาก' },
        { focus: 'สรุปและวางแผนต่อยอด', main: 'ประเมินผลลัพธ์และกำหนดก้าวถัดไป', detail: 'สรุปสิ่งที่สำเร็จ บทเรียน และแผนต่อยอดหลังจบแผนนี้', review: 'เลือกเป้าหมายถัดไปหนึ่งข้อ', tip: 'การทบทวนทำให้ความสำเร็จครั้งนี้ต่อยอดได้จริง' }
      ];

      curriculumData = [];
      for (let d = 1; d <= Math.max(14, durationDays); d++) {
        const stage = actionStages[(d - 1) % actionStages.length];
        const round = Math.floor((d - 1) / actionStages.length) + 1;
        curriculumData.push({
          focus: `Level ${Math.min(6, Math.ceil(d / 2))}: ${stage.focus} (วันที่ ${d}${round > 1 ? ` · รอบ ${round}` : ''})`,
          task1: {
            title: `🎯 ${stage.main} สำหรับ "${title}"`,
            desc: `${stage.detail} จับเวลา Focus Timer ${Utils.formatMinutes(Math.floor(dailyMinutes * 0.6))} แล้วปิดสิ่งรบกวนระหว่างทำ`,
            tip: stage.tip,
            drill: {
              type: 'steps',
              title: `Checklist วันที่ ${d}: ${stage.focus}`,
              items: [
                `1. ตั้งผลลัพธ์เฉพาะของวันนี้ให้สอดคล้องกับ "${title}"`,
                `2. ${stage.detail}`,
                `3. ทำให้เสร็จหนึ่งส่วนก่อนเปลี่ยนไปทำเรื่องอื่น`
              ]
            },
            resources: [{ title: `🔍 ค้นคว้าเรื่อง "${title}"`, url: `https://www.google.com/search?q=${encodeURIComponent(title)}` }]
          },
          task2: {
            title: `📝 ${stage.review}`,
            desc: `ใช้ Daily Reflection บันทึกสิ่งที่ได้เรียนรู้จากขั้น "${stage.focus}" และเตรียมงานชิ้นถัดไป`,
            tip: 'การทบทวนสั้นๆ หลังลงมือทำ ช่วยให้แผนวันต่อไปชัดเจนขึ้น',
            drill: null,
            resources: [{ title: '📝 เทคนิค Time Blocking', url: `https://www.google.com/search?q=${encodeURIComponent('Time blocking technique')}` }]
          }
        });
      }
    }

    // Build the final dailyTasks array
    const dailyTasks = [];
    for (let day = 1; day <= durationDays; day++) {
      const curData = curriculumData[Math.min(day - 1, curriculumData.length - 1)];

      dailyTasks.push({
        day: day,
        focus: curData.focus || `ภารกิจประจำวันที่ ${day}`,
        notes: '',
        tasks: [
          {
            id: Utils.generateId(`t_${day}_1`),
            title: curData.task1.title,
            description: curData.task1.desc,
            estMinutes: Math.floor(dailyMinutes * 0.6),
            difficulty: day <= 4 ? 'easy' : (day <= 9 ? 'medium' : 'hard'),
            tip: curData.task1.tip,
            drill: curData.task1.drill,
            resources: curData.task1.resources || [],
            completed: false,
            completedAt: null
          },
          {
            id: Utils.generateId(`t_${day}_2`),
            title: curData.task2.title,
            description: curData.task2.desc,
            estMinutes: Math.max(5, dailyMinutes - Math.floor(dailyMinutes * 0.6)),
            difficulty: day <= 4 ? 'easy' : (day <= 9 ? 'medium' : 'hard'),
            tip: curData.task2.tip,
            drill: curData.task2.drill,
            resources: curData.task2.resources || [],
            completed: false,
            completedAt: null
          }
        ]
      });
    }

    return {
      summary: summaryText,
      coachAdvice: coachAdviceText,
      phases,
      dailyTasks
    };
  }
};

// ==========================================================================
// 5. MAIN APPLICATION CONTROLLER
// ==========================================================================
const App = {
  activeTab: 'today',

  async init() {
    await Store.init();
    this.removeLegacyDefaultGoal();

    this.applyTheme(Store.state.settings.theme || 'light');
    this.initTimer();
    this.bindEvents();
    this.render();
  },

  removeLegacyDefaultGoal() {
    const defaultTitle = 'ฝึกพูดภาษาอังกฤษสื่อสารมั่นใจในชีวิตประจำวัน';
    const defaultNotes = 'เน้นฟังและพูดเพื่อความคล่องแคล่ว ไม่เน้นท่องไวยากรณ์ยากๆ';
    const before = Store.state.goals.length;

    // Remove only the exact demo goal that older versions created automatically.
    Store.state.goals = Store.state.goals.filter(goal =>
      !(goal.title === defaultTitle && goal.notes === defaultNotes)
    );

    if (Store.state.goals.length !== before) {
      Store.state.activeGoalId = Store.state.goals[0]?.id || null;
      Store.state.selectedDay = 1;
      Store.save();
    }
  },

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeBtn = document.getElementById('btn-toggle-theme');
    if (themeBtn) {
      themeBtn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    }
  },

  initTimer() {
    const timerDigits = document.getElementById('timer-digits');
    const timerCircle = document.getElementById('timer-bar-circle');
    const timerToggleBtn = document.getElementById('btn-timer-toggle');

    const btnEditTime = document.getElementById('btn-edit-time');
    
    const handleEditTime = () => {
      if (TimerEngine.isRunning) TimerEngine.pause();
      const currentMins = Math.round(TimerEngine.remainingSeconds / 60);
      Swal.fire({
        title: 'กำหนดเวลาเอง',
        input: 'number',
        inputLabel: 'ตั้งเวลาใหม่ (นาที):',
        inputValue: currentMins,
        inputAttributes: {
          min: 1,
          max: 180,
          step: 1
        },
        showCancelButton: true,
        confirmButtonText: 'ตั้งเวลา',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: 'var(--primary)',
        cancelButtonColor: 'var(--bg-subtle, #f1f5f9)',
        customClass: { cancelButton: 'swal2-cancel-custom' }
      }).then((result) => {
        if (result.isConfirmed && result.value) {
          const mins = parseInt(result.value, 10);
          if (!isNaN(mins) && mins > 0) {
            TimerEngine.setCustomTime(mins);
          }
        }
      });
    };
    if (timerDigits) {
      timerDigits.style.cursor = 'pointer';
      timerDigits.title = 'คลิกเพื่อแก้ไขเวลา';
      timerDigits.addEventListener('click', handleEditTime);
    }
    
    if (btnEditTime) {
      btnEditTime.addEventListener('click', handleEditTime);
    }

    const circumference = 2 * Math.PI * 76;
    if (timerCircle) {
      timerCircle.style.strokeDasharray = `${circumference}`;
    }

    TimerEngine.init({
      onTick: (state) => {
        if (timerDigits) timerDigits.textContent = state.formatted;
        
        const activeBtn = document.querySelector(`.timer-mode-btn[data-mode="${state.mode}"]`);
        if (activeBtn) {
          const modeNames = { focus: 'โฟกัส', short_break: 'พักสั้น', long_break: 'พักยาว' };
          const mins = Math.round(state.durationSeconds / 60);
          activeBtn.textContent = `${modeNames[state.mode]} ${mins} น.`;
        }

        if (timerToggleBtn) {
          timerToggleBtn.textContent = state.isRunning ? '⏸️ หยุดชั่วคราว' : '▶️ เริ่มโฟกัส';
          timerToggleBtn.className = state.isRunning ? 'btn btn-secondary' : 'btn btn-primary';
        }
        if (timerCircle) {
          const offset = circumference * (1 - state.progress);
          timerCircle.style.strokeDashoffset = `${offset}`;
        }
      },
      onComplete: (mode) => {
        Utils.launchConfetti();
        alert(mode === 'focus' ? '🎉 ยอดเยี่ยมมาก! คุณจดจ่อครบ 25 นาทีแล้ว ได้เวลาพักสายตาสักครู่' : '🔔 หมดเวลาพักแล้ว! พร้อมลุยภารกิจต่อหรือยัง?');
      }
    });
  },

  bindEvents() {
    // Navigation Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });

    // Theme Toggle
    const themeBtn = document.getElementById('btn-toggle-theme');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const current = Store.state.settings.theme;
        const next = current === 'dark' ? 'light' : 'dark';
        Store.updateSettings({ theme: next });
        this.applyTheme(next);
      });
    }

    // Goal Selector Dropdown
    const goalSelect = document.getElementById('goal-selector');
    if (goalSelect) {
      goalSelect.addEventListener('change', (e) => {
        Store.setActiveGoal(e.target.value);
        this.render();
      });
    }

    // Modal Triggers
    document.querySelectorAll('[data-open-modal="new-goal-modal"]').forEach(el => {
      el.addEventListener('click', () => this.openModal('new-goal-modal'));
    });

    document.querySelectorAll('[data-open-modal="settings-modal"]').forEach(el => {
      el.addEventListener('click', () => {
        this.populateSettingsForm();
        this.openModal('settings-modal');
      });
    });

    document.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const overlay = e.target.closest('.modal-overlay');
        if (overlay) overlay.classList.remove('active');
      });
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('active');
      });
    });

    // Form Submissions: New Goal
    const newGoalForm = document.getElementById('new-goal-form');
    if (newGoalForm) {
      newGoalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleCreateGoal();
      });
    }

    // Form Submissions: Settings
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
      settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveSettings();
      });
    }

    // Edit Goal Modal Trigger
    const btnEditGoal = document.getElementById('btn-edit-goal');
    if (btnEditGoal) {
      btnEditGoal.addEventListener('click', () => {
        const active = Store.getActiveGoal();
        if (!active) return;
        this.populateEditGoalForm(active);
        this.openModal('edit-goal-modal');
      });
    }

    // Form Submissions: Edit Goal Form
    const editGoalForm = document.getElementById('edit-goal-form');
    if (editGoalForm) {
      editGoalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveEditGoal(false);
      });
    }

    // Re-plan with AI button in Edit Goal Modal
    const btnReplanAI = document.getElementById('btn-replan-goal-ai');
    if (btnReplanAI) {
      btnReplanAI.addEventListener('click', async () => {
        await this.handleSaveEditGoal(true);
      });
    }

    // Add Task Button Trigger
    const btnAddTask = document.getElementById('btn-add-task');
    if (btnAddTask) {
      btnAddTask.addEventListener('click', () => {
        const form = document.getElementById('add-task-form');
        if (form) form.reset();
        this.openModal('add-task-modal');
      });
    }

    // Form Submissions: Add Task Form
    const addTaskForm = document.getElementById('add-task-form');
    if (addTaskForm) {
      addTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleCreateCustomTask();
      });
    }

    // Form Submissions: Edit Task Form
    const editTaskForm = document.getElementById('edit-task-form');
    if (editTaskForm) {
      editTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveEditTask();
      });
    }

    // Delete Task button in Edit Task Modal
    const btnDeleteTask = document.getElementById('btn-delete-current-task');
    if (btnDeleteTask) {
      btnDeleteTask.addEventListener('click', () => {
        const taskId = document.getElementById('edit-task-id').value;
        const dayNum = parseInt(document.getElementById('edit-task-day-num').value, 10);
        const active = Store.getActiveGoal();
        if (!active || !taskId) return;

        Swal.fire({
          title: 'ลบภารกิจ',
          text: 'คุณแน่ใจหรือไม่ว่าต้องการลบภารกิจนี้?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: 'var(--danger, #ef4444)',
          cancelButtonColor: 'var(--bg-subtle, #f1f5f9)',
          confirmButtonText: 'ลบ',
          cancelButtonText: 'ยกเลิก',
          reverseButtons: true,
          customClass: { cancelButton: 'swal2-cancel-custom' }
        }).then((result) => {
          if (result.isConfirmed) {
            Store.deleteTask(active.id, dayNum, taskId);
            this.closeModal('edit-task-modal');
            this.render();
          }
        });
      });
    }

    // Timer controls
    const timerToggleBtn = document.getElementById('btn-timer-toggle');
    const timerResetBtn = document.getElementById('btn-timer-reset');
    if (timerToggleBtn) timerToggleBtn.addEventListener('click', () => TimerEngine.toggle());
    if (timerResetBtn) timerResetBtn.addEventListener('click', () => TimerEngine.reset());

    document.querySelectorAll('.timer-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.timer-mode-btn').forEach(b => {
          b.classList.remove('btn-primary');
          b.classList.add('btn-secondary');
        });
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');
        TimerEngine.setMode(btn.getAttribute('data-mode'));
      });
    });

    // Delete Goal button
    const deleteGoalBtn = document.getElementById('btn-delete-goal');
    if (deleteGoalBtn) {
      deleteGoalBtn.addEventListener('click', () => {
        const active = Store.getActiveGoal();
        if (!active) return;
        Swal.fire({
        title: 'ลบเป้าหมาย',
        text: `คุณแน่ใจหรือไม่ว่าต้องการลบเป้าหมาย "${active.title}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'var(--danger, #ef4444)',
        cancelButtonColor: 'var(--bg-subtle, #f1f5f9)',
        confirmButtonText: 'ลบเป้าหมาย',
        cancelButtonText: 'ยกเลิก',
        reverseButtons: true,
        customClass: { cancelButton: 'swal2-cancel-custom' }
      }).then((result) => {
        if (result.isConfirmed) {
          Store.deleteGoal(active.id);
          this.render();
        }
      });
      });
    }

    // Export / Import Data
    const exportBtn = document.getElementById('btn-export-data');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const dataStr = Store.exportData();
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `goalforge_backup_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
      });
    }

    const importInput = document.getElementById('import-file-input');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          if (Store.importData(event.target.result)) {
            alert('นำเข้าข้อมูลสำเร็จ!');
            this.closeModal('settings-modal');
            this.render();
          } else {
            alert('เกิดข้อผิดพลาดในการอ่านไฟล์ JSON');
          }
        };
        reader.readAsText(file);
      });
    }
  },

  switchTab(tab) {
    this.activeTab = tab;
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
    });

    document.getElementById('view-today').classList.toggle('hidden', tab !== 'today');
    document.getElementById('view-roadmap').classList.toggle('hidden', tab !== 'roadmap');
    document.getElementById('view-stats').classList.toggle('hidden', tab !== 'stats');

    this.render();
  },

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  },

  populateSettingsForm() {
    const s = Store.state.settings;
    const modelSelect = document.getElementById('setting-model');
    if (modelSelect) modelSelect.value = s.model || 'gemini-3.6-flash';
  },

  handleSaveSettings() {
    const model = document.getElementById('setting-model').value;
    Store.updateSettings({ model });
    this.closeModal('settings-modal');
    alert('บันทึกการตั้งค่าเรียบร้อย!');
    this.render();
  },

  populateEditGoalForm(goal) {
    document.getElementById('edit-goal-title').value = goal.title || '';
    document.getElementById('edit-goal-duration').value = goal.durationDays || goal.dailyTasks?.length || 14;

    const totalMins = goal.dailyMinutes || 30;
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    document.getElementById('edit-goal-hours').value = hours > 0 ? hours : '';
    document.getElementById('edit-goal-minutes').value = mins;
    document.getElementById('edit-goal-notes').value = goal.notes || '';
  },

  async handleSaveEditGoal(replanWithAI = false) {
    const active = Store.getActiveGoal();
    if (!active) return;

    const title = document.getElementById('edit-goal-title').value.trim();
    const category = 'general';
    const durationDays = parseInt(document.getElementById('edit-goal-duration').value, 10) || 14;
    const hours = parseInt(document.getElementById('edit-goal-hours').value, 10) || 0;
    const mins = parseInt(document.getElementById('edit-goal-minutes').value, 10) || 0;
    const dailyMinutes = Math.max(5, (hours * 60) + mins);
    const notes = document.getElementById('edit-goal-notes').value.trim();

    if (!title) {
      alert('กรุณาระบุชื่อเป้าหมาย');
      return;
    }

    if (replanWithAI) {
      const btn = document.getElementById('btn-replan-goal-ai');
      const prevText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = `<span class="loading-spinner"></span> กำลังวางแผนใหม่...`;

      try {
        const breakdown = await AIService.generateGoalBreakdown({
          title,
          category,
          durationDays,
          dailyMinutes,
          level: active.level || 'เริ่มต้น',
          notes,
          model: Store.state.settings.model
        });

        active.title = title;
        active.category = category;
        active.durationDays = durationDays;
        active.dailyMinutes = dailyMinutes;
        active.notes = notes;
        active.summary = breakdown.summary;
        active.coachAdvice = breakdown.coachAdvice;
        active.phases = breakdown.phases;
        active.dailyTasks = breakdown.dailyTasks;

        Store.save();
        this.closeModal('edit-goal-modal');
        Utils.launchConfetti();
        alert('✨ ให้ AI วางแผนปรับตารางภารกิจใหม่สำเร็จเรียบร้อย!');
        this.render();
      } catch (err) {
        console.error(err);
        alert('เกิดข้อผิดพลาดในการวางแผน: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = prevText;
      }
    } else {
      Store.updateGoal(active.id, {
        title,
        category,
        durationDays,
        dailyMinutes,
        notes
      });
      this.closeModal('edit-goal-modal');
      this.render();
    }
  },

  populateEditTaskModal(task, dayNum) {
    document.getElementById('edit-task-id').value = task.id;
    document.getElementById('edit-task-day-num').value = dayNum;
    document.getElementById('edit-task-title').value = task.title || '';
    document.getElementById('edit-task-desc').value = task.description || '';

    const totalMins = task.estMinutes || 15;
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    document.getElementById('edit-task-hours').value = hours > 0 ? hours : '';
    document.getElementById('edit-task-minutes').value = mins;
    document.getElementById('edit-task-difficulty').value = task.difficulty || 'easy';
    document.getElementById('edit-task-tip').value = task.tip || '';

    this.openModal('edit-task-modal');
  },

  handleSaveEditTask() {
    const active = Store.getActiveGoal();
    if (!active) return;

    const taskId = document.getElementById('edit-task-id').value;
    const dayNum = parseInt(document.getElementById('edit-task-day-num').value, 10);
    const title = document.getElementById('edit-task-title').value.trim();
    const description = document.getElementById('edit-task-desc').value.trim();
    const hours = parseInt(document.getElementById('edit-task-hours').value, 10) || 0;
    const mins = parseInt(document.getElementById('edit-task-minutes').value, 10) || 0;
    const estMinutes = Math.max(1, (hours * 60) + mins);
    const difficulty = document.getElementById('edit-task-difficulty').value;
    const tip = document.getElementById('edit-task-tip').value.trim();

    if (!title) {
      alert('กรุณาระบุชื่อภารกิจ');
      return;
    }

    Store.updateTask(active.id, dayNum, taskId, {
      title,
      description,
      estMinutes,
      difficulty,
      tip
    });

    this.closeModal('edit-task-modal');
    this.render();
  },

  handleCreateCustomTask() {
    const active = Store.getActiveGoal();
    if (!active) return;

    const currentDayNum = Store.state.selectedDay || 1;
    const title = document.getElementById('add-task-title').value.trim();
    const description = document.getElementById('add-task-desc').value.trim();
    const hours = parseInt(document.getElementById('add-task-hours').value, 10) || 0;
    const mins = parseInt(document.getElementById('add-task-minutes').value, 10) || 0;
    const estMinutes = Math.max(1, (hours * 60) + mins);
    const difficulty = document.getElementById('add-task-difficulty').value;
    const tip = document.getElementById('add-task-tip').value.trim();

    if (!title) {
      alert('กรุณาระบุชื่อภารกิจ');
      return;
    }

    Store.addTask(active.id, currentDayNum, {
      title,
      description,
      estMinutes,
      difficulty,
      tip
    });

    this.closeModal('add-task-modal');
    document.getElementById('add-task-form').reset();
    this.render();
  },

  async handleCreateGoal() {
    const title = document.getElementById('goal-title').value.trim();
    const category = 'general';
    const durationDays = parseInt(document.getElementById('goal-duration').value, 10) || 14;
    const dailyMinutes = parseInt(document.getElementById('goal-minutes').value, 10) || 25;
    const level = document.querySelector('input[name="goal-level"]:checked')?.value || 'เริ่มต้น';
    const notes = document.getElementById('goal-notes').value.trim();

    if (!title) {
      alert('กรุณาระบุชื่อเป้าหมายที่ต้องการทำ');
      return;
    }

    const submitBtn = document.getElementById('btn-submit-goal');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    
    const loadingMessages = [
      "กำลังให้ AI วิเคราะห์และวางแผน...",
      "AI กำลังจิบกาแฟและคิดตารางให้คุณ...",
      "กำลังจัดภารกิจให้เป๊ะที่สุด...",
      "ประมวลผลข้อมูล... ใกล้เสร็จแล้ว...",
      "รอแป๊บนะ กำลังประกอบร่างเป้าหมาย...",
      "AI กำลังปั่นตารางอย่างขะมักเขม้น..."
    ];
    let msgIndex = 0;
    submitBtn.innerHTML = `<span class="loading-spinner"></span> ${loadingMessages[0]}`;
    
    // Store interval ID on the button element itself so we can clear it in finally block
    submitBtn.loadingInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % loadingMessages.length;
      submitBtn.innerHTML = `<span class="loading-spinner"></span> ${loadingMessages[msgIndex]}`;
    }, 2500);

    try {
      const breakdown = await AIService.generateGoalBreakdown({
        title,
        category,
        durationDays,
        dailyMinutes,
        level,
        notes,
        model: Store.state.settings.model
      });

      const newGoal = {
        id: Utils.generateId('goal'),
        title,
        category,
        durationDays,
        dailyMinutes,
        level,
        notes,
        createdAt: new Date().toISOString(),
        summary: breakdown.summary,
        coachAdvice: breakdown.coachAdvice,
        phases: breakdown.phases,
        dailyTasks: breakdown.dailyTasks
      };

      Store.addGoal(newGoal);
      this.closeModal('new-goal-modal');
      document.getElementById('new-goal-form').reset();
      Utils.launchConfetti();
      this.render();
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการสร้างแผนงาน: ' + err.message);
    } finally {
      if (submitBtn.loadingInterval) {
        clearInterval(submitBtn.loadingInterval);
        submitBtn.loadingInterval = null;
      }
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  },

  render() {
    this.renderHeader();
    const activeGoal = Store.getActiveGoal();

    if (!activeGoal) {
      document.getElementById('app-empty-state').classList.remove('hidden');
      document.getElementById('app-goal-content').classList.add('hidden');
      return;
    }

    document.getElementById('app-empty-state').classList.add('hidden');
    document.getElementById('app-goal-content').classList.remove('hidden');

    this.renderHeroBanner(activeGoal);

    if (this.activeTab === 'today') {
      this.renderTodayView(activeGoal);
    } else if (this.activeTab === 'roadmap') {
      this.renderRoadmapView(activeGoal);
    } else if (this.activeTab === 'stats') {
      this.renderStatsView(activeGoal);
    }
  },

  renderHeader() {
    const activeGoal = Store.getActiveGoal();
    const stats = activeGoal ? Store.getStats(activeGoal.id) : { streak: 0, totalXp: 0 };

    const streakEl = document.getElementById('nav-streak-count');
    const xpEl = document.getElementById('nav-xp-count');
    if (streakEl) streakEl.textContent = stats.streak;
    if (xpEl) xpEl.textContent = `${stats.totalXp} XP`;

    const selector = document.getElementById('goal-selector');
    if (selector) {
      const goals = Store.getGoals();
      selector.innerHTML = goals.map(g => `
        <option value="${g.id}" ${g.id === Store.state.activeGoalId ? 'selected' : ''}>
          🎯 ${Utils.escapeHTML(g.title)}
        </option>
      `).join('');
    }
  },

  renderHeroBanner(goal) {
    const progress = Store.getGoalProgress(goal);

    document.getElementById('hero-goal-title').textContent = goal.title;
    document.getElementById('hero-goal-summary').textContent = goal.summary || '';
    document.getElementById('hero-progress-percent').textContent = `${progress.percent}%`;
    document.getElementById('hero-progress-fill').style.width = `${progress.percent}%`;
    document.getElementById('hero-tasks-count').textContent = `${progress.completed}/${progress.total} ภารกิจ`;
    document.getElementById('hero-days-count').textContent = `${progress.daysCompleted}/${progress.totalDays} วัน`;
    document.getElementById('hero-daily-time').textContent = `${Utils.formatMinutes(goal.dailyMinutes || 25)} / วัน`;

    const adviceEl = document.getElementById('hero-coach-advice');
    if (adviceEl) {
      adviceEl.textContent = goal.coachAdvice || 'ก้าวเล็กๆ ในแต่ละวันจะนำไปสู่ความสำเร็จที่ยิ่งใหญ่!';
    }
  },

  renderTodayView(goal) {
    const currentDayNum = Store.state.selectedDay || 1;
    const dayData = goal.dailyTasks.find(d => d.day === currentDayNum) || goal.dailyTasks[0] || { day: 1, focus: '', tasks: [] };

    const switcher = document.getElementById('day-switcher-list');
    if (switcher) {
      let pillsHtml = goal.dailyTasks.map(d => {
        const isDone = d.tasks.length > 0 && d.tasks.every(t => t.completed);
        const isActive = d.day === currentDayNum;
        return `
          <button type="button" class="day-pill ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}" data-day="${d.day}">
            <span class="day-number">DAY</span>
            <span class="day-title">${d.day}</span>
            <span class="status-dot"></span>
          </button>
        `;
      }).join('');

      // Add Quick Add / Remove Day buttons
      pillsHtml += `
        <button type="button" class="day-pill-action" id="btn-quick-add-day" title="เพิ่มวันถัดไป">
          <span>➕</span>
          <span>เพิ่มวัน</span>
        </button>
        ${goal.dailyTasks.length > 1 ? `
          <button type="button" class="day-pill-action danger" id="btn-quick-remove-day" title="ลดวันสุดท้าย">
            <span>🗑️</span>
            <span>ลดวัน</span>
          </button>
        ` : ''}
      `;

      switcher.innerHTML = pillsHtml;

      switcher.querySelectorAll('.day-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          Store.state.selectedDay = parseInt(pill.getAttribute('data-day'), 10);
          this.render();
        });
      });

      const addDayBtn = document.getElementById('btn-quick-add-day');
      if (addDayBtn) {
        addDayBtn.addEventListener('click', () => {
          Store.addDayToGoal(goal.id);
          this.render();
        });
      }

      const removeDayBtn = document.getElementById('btn-quick-remove-day');
      if (removeDayBtn) {
        removeDayBtn.addEventListener('click', () => {
          Swal.fire({
            title: 'ลบวันสุดท้าย',
            text: `คุณต้องการลบ วันที่ ${goal.dailyTasks.length} ออกจากเป้าหมายใช่หรือไม่?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--danger, #ef4444)',
            cancelButtonColor: 'var(--bg-subtle, #f1f5f9)',
            confirmButtonText: 'ลบ',
            cancelButtonText: 'ยกเลิก',
            reverseButtons: true,
            customClass: { cancelButton: 'swal2-cancel-custom' }
          }).then((result) => {
            if (result.isConfirmed) {
              Store.removeLastDayFromGoal(goal.id);
              this.render();
            }
          });
        });
      }
    }

    document.getElementById('today-focus-title').textContent = dayData.focus || `ภารกิจประจำวันที่ ${dayData.day}`;
    document.getElementById('today-day-badge').textContent = `วันที่ ${dayData.day} จาก ${goal.durationDays || goal.dailyTasks.length} วัน`;

    const taskList = document.getElementById('today-tasks-list');
    if (taskList) {
      if (!dayData.tasks || dayData.tasks.length === 0) {
        taskList.innerHTML = `
          <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
            <p style="margin-bottom: 0.75rem;">ยังไม่มีภารกิจสำหรับวันนี้</p>
            <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('btn-add-task').click()">
              ➕ คลิกที่นี่เพื่อเพิ่มภารกิจใหม่
            </button>
          </div>
        `;
      } else {
        taskList.innerHTML = dayData.tasks.map(t => {
          const diffMap = { easy: 'ง่าย (Level 1)', medium: 'ปานกลาง (Level 2-3)', hard: 'ท้าทาย (Level 4-6)' };
          return `
            <div class="task-card ${t.completed ? 'completed' : ''}" data-task-id="${t.id}">
              <div class="task-checkbox-wrap">
                <div class="task-custom-check" data-action="toggle-task" data-task-id="${t.id}" title="ทำเครื่องหมายเสร็จสิ้น">
                  <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
              </div>
              <div class="task-body">
                <div class="task-header-row">
                  <div class="task-title">${Utils.escapeHTML(t.title)}</div>
                  <div class="task-actions-wrap">
                    <button type="button" class="btn-task-action" data-action="edit-task" data-task-id="${t.id}" title="แก้ไขเวลาหรือรายละเอียดภารกิจนี้">
                      ✏️ แก้ไข
                    </button>
                    <button type="button" class="btn-task-action delete" data-action="delete-task" data-task-id="${t.id}" title="ลบภารกิจนี้">
                      🗑️
                    </button>
                  </div>
                </div>

                <div class="task-desc">${Utils.escapeHTML(t.description)}</div>
                <div class="task-meta">
                  <span class="task-tag time clickable" data-action="edit-task" data-task-id="${t.id}" title="คลิกเพื่อปรับแก้เวลา">
                    ⏱️ ${Utils.formatMinutes(t.estMinutes || 15)}
                  </span>
                  <span class="task-tag difficulty-${t.difficulty || 'easy'}">⚡ ${diffMap[t.difficulty] || 'ง่าย'}</span>
                </div>
                ${t.tip ? `
                  <div class="task-tip-box">
                    <strong>💡 AI Tip:</strong> ${Utils.escapeHTML(t.tip)}
                  </div>
                ` : ''}
                ${this.renderTaskDrill(t.drill)}
                ${(t.resources && t.resources.length > 0) ? `
                  <div class="task-resources-box">
                    <div class="task-resources-header">
                      <span>🔗</span>
                      <span>แหล่งศึกษาข้อมูล & ตัวช่วยเรียนรู้:</span>
                    </div>
                    <div class="task-resources-list">
                      ${t.resources.map(res => `
                        <a href="${Utils.escapeHTML(res.url)}" target="_blank" rel="noopener noreferrer" class="resource-link-item" title="คลิกเพื่อเปิดลิงก์ศึกษาข้อมูล">
                          <span>${Utils.escapeHTML(res.title)}</span>
                          <span class="external-icon">↗</span>
                        </a>
                      `).join('')}
                    </div>
                  </div>
                ` : `
                  <div style="margin-top: 0.65rem;">
                    <a href="https://www.google.com/search?q=${encodeURIComponent((goal.title || '') + ' ' + (t.title || ''))}" target="_blank" rel="noopener noreferrer" class="resource-link-item" style="display: inline-flex;" title="ค้นคว้าหาข้อมูลเพิ่มเติม">
                      <span>🔍 ค้นหาข้อมูลเพิ่มเติมเกี่ยวกับหัวข้อนี้</span>
                      <span class="external-icon">↗</span>
                    </a>
                  </div>
                `}
              </div>
            </div>
          `;
        }).join('');

        // Toggle Task Complete
        taskList.querySelectorAll('[data-action="toggle-task"]').forEach(checkBtn => {
          checkBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const taskId = checkBtn.getAttribute('data-task-id');
            const result = Store.toggleTask(goal.id, currentDayNum, taskId);
            if (result && result.task.completed) {
              Utils.playSound('complete');
              const allDoneToday = result.dayData.tasks.every(t => t.completed);
              if (allDoneToday) {
                Utils.launchConfetti();
              }
            }
            this.render();
          });
        });

        // Edit Task Trigger
        taskList.querySelectorAll('[data-action="edit-task"]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const taskId = btn.getAttribute('data-task-id');
            const task = dayData.tasks.find(t => t.id === taskId);
            if (task) {
              this.populateEditTaskModal(task, currentDayNum);
            }
          });
        });

        // Quick Delete Task
        taskList.querySelectorAll('[data-action="delete-task"]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const taskId = btn.getAttribute('data-task-id');
            Swal.fire({
              title: 'ลบภารกิจ',
              text: 'คุณแน่ใจหรือไม่ว่าต้องการลบภารกิจนี้?',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: 'var(--danger, #ef4444)',
              cancelButtonColor: 'var(--bg-subtle, #f1f5f9)',
              confirmButtonText: 'ลบ',
              cancelButtonText: 'ยกเลิก',
              reverseButtons: true,
              customClass: { cancelButton: 'swal2-cancel-custom' }
            }).then((result) => {
              if (result.isConfirmed) {
                Store.deleteTask(goal.id, currentDayNum, taskId);
                this.render();
              }
            });
          });
        });

        // Text-to-speech button
        taskList.querySelectorAll('[data-speak]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const text = btn.getAttribute('data-speak');
            Utils.speakText(text);
          });
        });

        // Copy code button
        taskList.querySelectorAll('[data-code]').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const code = decodeURIComponent(btn.getAttribute('data-code'));
            const ok = await Utils.copyToClipboard(code);
            if (ok) {
              const prev = btn.textContent;
              btn.textContent = '✅ คัดลอกแล้ว!';
              setTimeout(() => { btn.textContent = prev; }, 2000);
            }
          });
        });
      }
    }

    const noteArea = document.getElementById('daily-note-input');
    if (noteArea) {
      noteArea.value = dayData.notes || '';
      noteArea.oninput = () => {
        Store.saveDayNote(goal.id, currentDayNum, noteArea.value);
      };
    }
  },

  renderTaskDrill(drill) {
    if (!drill) return '';

    if (drill.type === 'vocab' && Array.isArray(drill.items)) {
      return `
        <div class="task-drill-box">
          <div class="task-drill-header">
            <span>🎯 ${Utils.escapeHTML(drill.title || 'เนื้อหาฝึกฝนวันนี้')}</span>
            <span class="task-drill-badge">คำศัพท์ & ประโยค</span>
          </div>
          <div class="drill-vocab-grid">
            ${drill.items.map(item => `
              <div class="vocab-card">
                <div class="vocab-top-row">
                  <div>
                    <span class="vocab-word">${Utils.escapeHTML(item.word)}</span>
                    ${item.ipa ? `<span class="vocab-ipa">${Utils.escapeHTML(item.ipa)}</span>` : ''}
                  </div>
                  <button type="button" class="btn-speak" data-speak="${Utils.escapeHTML(item.word)}" title="คลิกเพื่อฟังเสียงอ่านภาษาอังกฤษ">
                    🔊 ฟังเสียง
                  </button>
                </div>
                <div class="vocab-meaning">${Utils.escapeHTML(item.meaning)}</div>
                ${item.example ? `
                  <div class="vocab-example">
                    <strong>ตัวอย่าง:</strong> ${Utils.escapeHTML(item.example)}
                    <button type="button" class="btn-speak" style="padding: 0.1rem 0.35rem; margin-left: 0.35rem; font-size: 0.75rem;" data-speak="${Utils.escapeHTML(item.example)}" title="ฟังทั้งประโยค">🔊</button>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (drill.type === 'workout' && Array.isArray(drill.exercises)) {
      return `
        <div class="task-drill-box">
          <div class="task-drill-header">
            <span>🏋️‍♂️ ${Utils.escapeHTML(drill.title || 'ตารางท่าฝึกวันนี้')}</span>
            <span class="task-drill-badge" style="background: var(--accent);">Workout Routine</span>
          </div>
          <table class="drill-table">
            <thead>
              <tr>
                <th>ท่าออกกำลังกาย</th>
                <th>เซ็ต</th>
                <th>จำนวนครั้ง / เวลา</th>
                <th>พัก</th>
              </tr>
            </thead>
            <tbody>
              ${drill.exercises.map(ex => `
                <tr>
                  <td style="font-weight: 600;">${Utils.escapeHTML(ex.name)}</td>
                  <td>${Utils.escapeHTML(ex.sets)}</td>
                  <td>${Utils.escapeHTML(ex.reps)}</td>
                  <td style="color: var(--text-muted);">${Utils.escapeHTML(ex.rest || '45 วิ')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    if (drill.type === 'code' && drill.code) {
      return `
        <div class="task-drill-box">
          <div class="task-drill-header">
            <span>💻 ${Utils.escapeHTML(drill.title || 'ตัวอย่างโค้ดสำหรับฝึกฝน')}</span>
            <span class="task-drill-badge" style="background: #3b82f6;">Code Snippet</span>
          </div>
          <div class="drill-code-wrap">
            <button type="button" class="btn-copy-code" data-code="${encodeURIComponent(drill.code)}" title="คัดลอกโค้ด">📋 คัดลอก</button>
            <pre class="drill-code-block"><code>${Utils.escapeHTML(drill.code)}</code></pre>
          </div>
        </div>
      `;
    }

    if (drill.type === 'steps' && Array.isArray(drill.items)) {
      return `
        <div class="task-drill-box">
          <div class="task-drill-header">
            <span>📋 ${Utils.escapeHTML(drill.title || 'ขั้นตอนปฏิบัติเจาะจง')}</span>
            <span class="task-drill-badge" style="background: #8b5cf6;">Action Steps</span>
          </div>
          <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.35rem;">
            ${drill.items.map(step => `
              <li style="font-size: 0.8125rem; color: var(--text-main); display: flex; align-items: flex-start; gap: 0.5rem;">
                <span style="color: var(--primary); font-weight: 700;">•</span>
                <span>${Utils.escapeHTML(step)}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }

    return '';
  },

  renderRoadmapView(goal) {
    const container = document.getElementById('roadmap-phases-list');
    if (!container) return;

    container.innerHTML = goal.phases.map(phase => {
      const phaseDays = goal.dailyTasks.filter(d => {
        const dayNum = d.day;
        const [start, end] = (phase.daysRange || '').replace(/[^0-9-]/g, '').split('-').map(n => parseInt(n, 10));
        if (start && end) {
          return dayNum >= start && dayNum <= end;
        }
        return true;
      });

      const totalTasksInPhase = phaseDays.reduce((acc, d) => acc + d.tasks.length, 0);
      const completedTasksInPhase = phaseDays.reduce((acc, d) => acc + d.tasks.filter(t => t.completed).length, 0);
      const percentInPhase = totalTasksInPhase > 0 ? Math.round((completedTasksInPhase / totalTasksInPhase) * 100) : 0;

      return `
        <div class="phase-card">
          <div class="phase-header">
            <div class="phase-title-group">
              <div class="phase-number-badge">${phase.phaseNumber || 1}</div>
              <div>
                <div class="phase-title">${Utils.escapeHTML(phase.title)}</div>
                <div class="phase-meta-text">${phase.daysRange || ''} • สำเร็จแล้ว ${percentInPhase}% (${completedTasksInPhase}/${totalTasksInPhase} งาน)</div>
              </div>
            </div>
          </div>
          <div class="phase-body">
            ${phaseDays.map(d => {
              const isDone = d.tasks.length > 0 && d.tasks.every(t => t.completed);
              const doneCount = d.tasks.filter(t => t.completed).length;
              return `
                <div class="phase-day-item ${isDone ? 'completed' : ''}" data-goto-day="${d.day}">
                  <div class="phase-day-header">
                    <span class="phase-day-label">DAY ${d.day}</span>
                    <span style="font-size: 0.75rem; font-weight: 600; color: ${isDone ? 'var(--accent)' : 'var(--text-muted)'}">
                      ${isDone ? '✅ สำเร็จแล้ว' : `${doneCount}/${d.tasks.length} งาน`}
                    </span>
                  </div>
                  <div style="font-size: 0.875rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.25rem;">
                    ${Utils.escapeHTML(d.focus || `ภารกิจวันที่ ${d.day}`)}
                  </div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">
                    ${d.tasks.map(t => `• ${Utils.escapeHTML(t.title)} (${Utils.formatMinutes(t.estMinutes)})`).join('<br>')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('[data-goto-day]').forEach(item => {
      item.addEventListener('click', () => {
        const day = parseInt(item.getAttribute('data-goto-day'), 10);
        Store.state.selectedDay = day;
        this.switchTab('today');
      });
    });
  },

  renderStatsView(goal) {
    const stats = Store.getStats(goal.id);
    const progress = Store.getGoalProgress(goal);

    const streakVal = document.getElementById('stat-streak-val');
    const xpVal = document.getElementById('stat-xp-val');
    const tasksVal = document.getElementById('stat-tasks-val');
    const rateVal = document.getElementById('stat-rate-val');

    if (streakVal) streakVal.textContent = `${stats.streak} วัน`;
    if (xpVal) xpVal.textContent = `${stats.totalXp} XP`;
    if (tasksVal) tasksVal.textContent = `${stats.completedTasksCount} งาน`;
    if (rateVal) rateVal.textContent = `${progress.percent}%`;

    const achievements = [
      { id: 'first_step', title: 'ก้าวแรกสู่ฝัน', desc: 'ทำภารกิจแรกสำเร็จ', icon: '🌱', unlocked: stats.completedTasksCount >= 1 },
      { id: 'streak_3', title: 'ไฟแห่งความพยายาม', desc: 'ทำต่อเนื่องติดต่อกัน 3 วัน', icon: '🔥', unlocked: stats.streak >= 3 },
      { id: 'streak_7', title: 'วินัยเหล็กกล้า', desc: 'ทำต่อเนื่องติดต่อกัน 7 วัน', icon: '⚡', unlocked: stats.streak >= 7 },
      { id: 'halfway', title: 'พิชิตครึ่งทาง', desc: 'บรรลุเป้าหมายเกิน 50%', icon: '🚀', unlocked: progress.percent >= 50 },
      { id: 'mastery', title: 'ผู้พิชิตเป้าหมาย', desc: 'ทำภารกิจครบ 100%', icon: '👑', unlocked: progress.percent >= 100 }
    ];

    const achContainer = document.getElementById('achievements-list');
    if (achContainer) {
      achContainer.innerHTML = achievements.map(ach => `
        <div class="achievement-card ${ach.unlocked ? 'unlocked' : 'locked'}">
          <div class="achievement-icon">${ach.icon}</div>
          <div>
            <div style="font-weight: 700; font-size: 0.9375rem; color: var(--text-main);">${ach.title}</div>
            <div style="font-size: 0.8125rem; color: var(--text-muted);">${ach.desc}</div>
            <div style="font-size: 0.75rem; font-weight: 600; margin-top: 0.25rem; color: ${ach.unlocked ? 'var(--accent)' : 'var(--text-subtle)'};">
              ${ach.unlocked ? '🏆 ปลดล็อกแล้ว' : '🔒 ยังไม่ปลดล็อก'}
            </div>
          </div>
        </div>
      `).join('');
    }
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => await App.init());
} else {
  App.init();
}

// Make globally accessible
window.GoalForge = { Utils, Store, TimerEngine, AIService, App };
