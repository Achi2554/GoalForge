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
      model: 'gemini-1.5-flash',
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

  init() {
    try {
      const savedGoals = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (savedGoals) {
        this.state.goals = JSON.parse(savedGoals);
      }

      const savedActiveId = localStorage.getItem(STORAGE_KEYS.ACTIVE_GOAL_ID);
      if (savedActiveId && this.state.goals.some(g => g.id === savedActiveId)) {
        this.state.activeGoalId = savedActiveId;
      } else if (this.state.goals.length > 0) {
        this.state.activeGoalId = this.state.goals[0].id;
      }

      const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (savedSettings) {
        this.state.settings = { ...this.state.settings, ...JSON.parse(savedSettings) };
      }

      const savedStats = localStorage.getItem(STORAGE_KEYS.STATS);
      if (savedStats) {
        this.state.stats = { ...this.state.stats, ...JSON.parse(savedStats) };
      }

      this.checkDailyStreak();
    } catch (e) {
      console.error('Store init error:', e);
    }
  },

  save() {
    try {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(this.state.goals));
      if (this.state.activeGoalId) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_GOAL_ID, this.state.activeGoalId);
      }
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.state.settings));
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(this.state.stats));
    } catch (e) {
      console.error('Store save error:', e);
    }
  },

  getGoals() {
    return this.state.goals;
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

    if (task.completed) {
      this.state.stats.totalXp += 20;
      this.state.stats.completedTasksCount += 1;
      this.recordActivity();
    } else {
      this.state.stats.totalXp = Math.max(0, this.state.stats.totalXp - 20);
      this.state.stats.completedTasksCount = Math.max(0, this.state.stats.completedTasksCount - 1);
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
    const today = new Date().toDateString();
    if (!this.state.stats.lastActiveDate) return;

    const lastDate = new Date(this.state.stats.lastActiveDate);
    const diffTime = Math.abs(new Date(today) - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1 && new Date(today).toDateString() !== lastDate.toDateString()) {
      this.state.stats.streak = 0;
      this.save();
    }
  },

  recordActivity() {
    const today = new Date().toDateString();
    if (this.state.stats.lastActiveDate !== today) {
      this.state.stats.streak += 1;
      this.state.stats.lastActiveDate = today;
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
    if (mode === 'focus') {
      this.durationSeconds = 25 * 60;
    } else if (mode === 'short_break') {
      this.durationSeconds = 5 * 60;
    } else if (mode === 'long_break') {
      this.durationSeconds = 15 * 60;
    }
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
        mode: this.mode
      });
    }
  }
};

// ==========================================================================
// 4. MULTI-CATEGORY AI PROGRESSIVE DECOMPOSER
// ==========================================================================
const AIService = {
  async generateGoalBreakdown({ title, category, durationDays, dailyMinutes, level, notes, model = 'gemini-1.5-flash' }) {
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
    // The Gemini key stays on the server and is never exposed to the browser.
    const endpoint = new URL('/api/generate-goal', window.location.origin);

    const promptText = `
คุณคือสุดยอด AI Goal Coach และผู้เชี่ยวชาญด้านการออกแบบหลักสูตรที่มีความก้าวหน้าอย่างเป็นระบบ (Progressive Curriculum Architect)
หน้าที่ของคุณคือรับเป้าหมายของผู้ใช้ แล้วแตกเป้าหมายออกมาเป็น "ภารกิจย่อยในแต่ละวัน (Daily Micro-Tasks)" ตั้งแต่วันที่ 1 ถึงวันที่ ${durationDays}

ข้อมูลเป้าหมาย:
- เป้าหมาย: "${title}"
- หมวดหมู่: ${category}
- ระยะเวลาทั้งหมด: ${durationDays} วัน
- เวลาว่างต่อวัน: ${dailyMinutes} นาที
- ระดับพื้นฐาน: ${level}
- ข้อมูลเพิ่มเติม: ${notes || 'ไม่มี'}

กฎสำคัญที่สุด (CRITICAL INSTRUCTIONS):
1. **ต้องตรงกับหมวดหมู่และหัวข้อเป้าหมายอย่างเคร่งครัด**: ถ้าเป้าหมายคือลดน้ำหนัก/ออกกำลังกาย ต้องเป็นตารางท่าฝึกและโภชนาการจริง, ถ้าเป็นโปรแกรมมิ่งต้องเป็นโค้ดจริง, ถ้าเป็นภาษาต้องเป็นคำศัพท์/บทสนทนาจริง
2. **ห้ามซ้ำกันเด็ดขาด (100% Unique Every Day)**: ทุกๆ วัน (Day 1 ถึง Day ${durationDays}) ต้องมีเนื้อหาและโจทย์ที่ไม่ซ้ำกัน
3. **ความยากต้องไต่ระดับขึ้นเรื่อยๆ (Progressive Difficulty Escalation)**:
   - Day 1-4: ระดับ "easy" เน้นพื้นฐานเบื้องต้น
   - Day 5-8: ระดับ "medium" ขยายความซับซ้อน
   - Day 9-12: ระดับ "hard" การประยุกต์ใช้จริงขั้นสูง
   - Day 13-${durationDays}: ระดับ "hard" การทดสอบจำลองสถานการณ์จริง
4. **ต้องมีเนื้อหาเจาะจงที่ให้ทำทันที (drill)** ในแต่ละภารกิจ (เช่น vocab, workout, code, steps)
5. **ต้องมีแหล่งศึกษาข้อมูลและลิงก์ความรู้ (resources)**

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
  "dailyTasks": [
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
            "type": "workout",
            "title": "หัวข้อเนื้อหาฝึกฝนเฉพาะวันนี้",
            "exercises": [
              { "name": "Bodyweight Squats", "sets": "3 เซ็ต", "reps": "12 ครั้ง", "rest": "45 วิ" }
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
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
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
    
    const isHealth = category === 'health' || t.includes('ลด') || t.includes('อ้วน') || t.includes('น้ำหนัก') || t.includes('ออกกำลัง') || t.includes('ฟิต') || t.includes('วิ่ง') || t.includes('หุ่น') || t.includes('กล้าม');
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

      curriculumData = [
        {
          focus: 'Level 1: Full-Body Foundation & ตัดน้ำหวาน 100%',
          task1: {
            title: '🏋️‍♂️ ออกกำลังกายพื้นฐานกระตุ้นกล้ามเนื้อมัดใหญ่ (Day 1)',
            desc: 'วอร์มอัพ 3 นาที แล้วทำตามตารางท่าฝึก พัก 45 วินาทีระหว่างเซ็ต',
            tip: 'ท่า Squat ให้ลงจนต้นขาขนานกับพื้น และไม่ให้หัวเข่าเลยปลายเท้า',
            drill: {
              type: 'workout',
              title: 'ตารางท่าฝึก Day 1 (Level 1)',
              exercises: [
                { name: 'Bodyweight Squats (ลุกนั่ง)', sets: '3 เซ็ต', reps: '10-12 ครั้ง', rest: '45 วิ' },
                { name: 'Knee Push-ups (วิดพื้นกับเข่า)', sets: '3 เซ็ต', reps: '8-10 ครั้ง', rest: '45 วิ' },
                { name: 'Plank (เกร็งหน้าท้อง)', sets: '3 เซ็ต', reps: '20 วินาที', rest: '30 วิ' }
              ]
            },
            resources: [{ title: '▶️ วิดีโอสอนท่า Squat และ Push-up ที่ถูกต้อง', url: `https://www.youtube.com/results?search_query=${encodeURIComponent('Home workout beginner no equipment')}` }]
          },
          task2: {
            title: '🥗 กฎโภชนาการ Day 1: ดื่มน้ำ 2.5 ลิตร & ตัดน้ำหวาน',
            desc: 'ดื่มน้ำเปล่า 1 แก้วใหญ่ทันทีหลังตื่นนอน และจิบน้ำตลอดทั้งวัน',
            tip: 'การดื่มน้ำช่วยเพิ่มอัตราการเผาผลาญแคลอรี่ขณะพักได้ถึง 24-30%',
            drill: {
              type: 'steps',
              title: 'Checklist สุขภาพประจำวัน (Day 1)',
              items: [
                '1. ดื่มน้ำ 1 แก้วใหญ่ทันทีหลังตื่นนอน',
                '2. หลีกเลี่ยงน้ำอัดลม ชานม ชาเขียวหวาน และน้ำผลไม้แปรรูป',
                '3. ทานข้าว/แป้งไม่เกิน 1 ทัพพีในแต่ละมื้อ'
              ]
            },
            resources: [{ title: '💡 Healthline: เคล็ดลับการดื่มน้ำเพื่อลดน้ำหนัก', url: 'https://www.healthline.com/nutrition/7-health-benefits-of-water' }]
          }
        },
        {
          focus: 'Level 1+: Low-Impact Cardio & เริ่มต้นบันทึกอาหาร',
          task1: {
            title: '🏃‍♂️ คาร์ดิโอเบิร์นไขมันระดับเริ่มต้น (Cardio Burn)',
            desc: 'ทำท่าบริหารต่อเนื่องเพื่อกระตุ้นอัตราการเต้นของหัวใจ (Heart Rate Zone 2)',
            tip: 'หายใจเข้าทางจมูกและเป่าลมออกทางปากอย่างสม่ำเสมอ',
            drill: {
              type: 'workout',
              title: 'ตารางคาร์ดิโอ Day 2 (Level 1+)',
              exercises: [
                { name: 'Jumping Jacks (กระโดดตบ)', sets: '3 เซ็ต', reps: '25 ครั้ง', rest: '30 วิ' },
                { name: 'Glute Bridges (ยกสะโพกกระชับก้น)', sets: '3 เซ็ต', reps: '12 ครั้ง', rest: '30 วิ' },
                { name: 'Standing High Knees (ยกเข่าสูง)', sets: '3 เซ็ต', reps: '30 วินาที', rest: '30 วิ' }
              ]
            },
            resources: [{ title: '▶️ Low Impact Cardio 15 min', url: `https://www.youtube.com/results?search_query=${encodeURIComponent('Low impact cardio for fat loss at home')}` }]
          },
          task2: {
            title: '📝 จดบันทึกอาหารทุกมื้อลงสมุด/โทรศัพท์ (Food Diary)',
            desc: 'ถ่ายรูปหรือจดรายการอาหารทุกอย่างที่ทานเข้าไปในวันนี้ เพื่อเช็คสัดส่วน',
            tip: 'คนที่จดบันทึกอาหารมีโอกาสลดน้ำหนักสำเร็จมากกว่าคนที่ไม่จดถึง 2 เท่า',
            drill: null,
            resources: [{ title: '🥗 หลักการคำนวณแคลอรี่เบื้องต้น (TDEE/BMR)', url: `https://www.google.com/search?q=${encodeURIComponent('วิธีคำนวณ TDEE ลดน้ำหนัก')}` }]
          }
        },
        {
          focus: 'Level 2: สร้างความแข็งแรงแกนกลางลำตัว (Core & Abs) & เสริมโปรตีน',
          task1: {
            title: '🧘‍♂️ ฝึกแกนกลางลำตัวสร้างหน้าท้องแบนราบ (Core Stability)',
            desc: 'เกร็งหน้าท้องตลอดการเคลื่อนไหว ไม่แอ่นหลังส่วนล่าง',
            tip: 'แนบแผ่นหลังให้ติดพื้นเสมอขณะทำท่า Deadbug',
            drill: {
              type: 'workout',
              title: 'ตารางฝึก Core Day 3 (Level 2)',
              exercises: [
                { name: 'Deadbug (นอนยกแขน-ขาตรงข้าม)', sets: '3 เซ็ต', reps: '10 ครั้ง/ข้าง', rest: '30 วิ' },
                { name: 'Bird-Dog (คุกเข่ายกแขน-ขา)', sets: '3 เซ็ต', reps: '10 ครั้ง/ข้าง', rest: '30 วิ' },
                { name: 'Wall Sit (นั่งพิงผนังค้างไว้)', sets: '3 เซ็ต', reps: '30 วินาที', rest: '45 วิ' }
              ]
            },
            resources: [{ title: '▶️ Core Workout for Beginners', url: `https://www.youtube.com/results?search_query=${encodeURIComponent('Core workout for beginners no equipment')}` }]
          },
          task2: {
            title: '🍗 เพิ่มโปรตีนคุณภาพสูงในมื้อหลัก (Protein Intake)',
            desc: 'ทานโปรตีนอย่างน้อย 1 ฝ่ามือในทุกมื้อหลัก (อกไก่, ไข่ต้ม, ปลา, เต้าหู้)',
            tip: 'โปรตีนช่วยรักษาและสร้างกล้ามเนื้อ ทำให้ร่างกายเผาผลาญพลังงานได้สูงตลอดวัน',
            drill: null,
            resources: [{ title: '💪 แหล่งโปรตีนที่ดีที่สุดสำหรับลดไขมัน', url: `https://www.google.com/search?q=${encodeURIComponent('แหล่งโปรตีนที่ดีที่สุดลดน้ำหนัก')}` }]
          }
        },
        {
          focus: 'Level 2+: Lower Body Tone & เริ่มต้น Intermittent Fasting (IF 16/8)',
          task1: {
            title: '🦵 กระชับต้นขาและสะโพก (Lower Body Endurance)',
            desc: 'ก้าวขาให้กว้างและตั้งฉาก 90 องศาขณะทำท่า Lunges',
            tip: 'ดันตัวขึ้นจากส้นเท้าเพื่อโฟกัสกล้ามเนื้อก้นและต้นขาด้านหลัง',
            drill: {
              type: 'workout',
              title: 'ตารางฝึกขาและก้น Day 4',
              exercises: [
                { name: 'Walking Lunges (ก้าวขาย่อตัว)', sets: '3 เซ็ต', reps: '10 ครั้ง/ข้าง', rest: '45 วิ' },
                { name: 'Incline Push-ups (วิดพื้นกับโต๊ะ/เตียง)', sets: '3 เซ็ต', reps: '10-12 ครั้ง', rest: '45 วิ' },
                { name: 'Mountain Climbers (ปีนเขาวิ่งสลับขา)', sets: '3 เซ็ต', reps: '20 ครั้ง', rest: '30 วิ' }
              ]
            },
            resources: [{ title: '▶️ Lower Body Workout at Home', url: `https://www.youtube.com/results?search_query=${encodeURIComponent('Leg workout for fat loss at home')}` }]
          },
          task2: {
            title: '⏰ ปรับช่วงเวลากินอาหาร: งดกินมื้อดึกหลัง 20:00 น.',
            desc: 'ให้ระบบย่อยอาหารได้พักอย่างน้อย 12-14 ชั่วโมงข้ามคืน',
            tip: 'หากหิวช่วงค่ำ ให้ดื่มน้ำอุ่นหรือชาคาโมมายล์ที่ไม่ใส่น้ำตาล',
            drill: null,
            resources: [{ title: '📚 คู่มือเริ่มต้นทำ IF 16/8 สำหรับมือใหม่', url: `https://www.google.com/search?q=${encodeURIComponent('วิธีทำ IF 16/8 สำหรับมือใหม่')}` }]
          }
        },
        {
          focus: 'Level 3: Full Body Density Circuit & กฎผักใบเขียว 50%',
          task1: {
            title: '🔥 เซอร์กิตเผาผลาญพลังงานแบบ Full-Body (Day 5)',
            desc: 'ทำแต่ละท่าต่อเนื่องโดยพักสั้นๆ เพื่อเบิร์นแคลอรี่อย่างเข้มข้น',
            tip: 'ท่า Sumo Squat ให้กางขากว้างกว่าหัวไหล่และชี้ปลายเท้าออก 45 องศา',
            drill: {
              type: 'workout',
              title: 'Full Body Circuit Day 5 (Level 3)',
              exercises: [
                { name: 'Sumo Squats (สควอทกางขากว้าง)', sets: '3 เซ็ต', reps: '15 ครั้ง', rest: '45 วิ' },
                { name: 'Plank Shoulder Taps (แตะไหล่สลับ)', sets: '3 เซ็ต', reps: '16 ครั้ง', rest: '30 วิ' },
                { name: 'Step-ups (ก้าวขึ้นเก้าอี้/บันได)', sets: '3 เซ็ต', reps: '12 ครั้ง/ข้าง', rest: '45 วิ' }
              ]
            },
            resources: [{ title: '▶️ Full Body Fat Burn Circuit', url: `https://www.youtube.com/results?search_query=${encodeURIComponent('Full body fat burn workout no equipment')}` }]
          },
          task2: {
            title: '🥗 กฎจานอาหาร 2:1:1 (ผัก 2 ส่วน : โปรตีน 1 ส่วน : แป้ง 1 ส่วน)',
            desc: 'เพิ่มผักใบเขียวให้ได้ครึ่งหนึ่งของจานอาหารเพื่อเพิ่มไฟเบอร์และอิ่มนาน',
            tip: 'ไฟเบอร์ช่วยชะลอการดูดซึมน้ำตาล และช่วยให้ระบบขับถ่ายทำงานคล่อง',
            drill: null,
            resources: [{ title: '🥗 กฎจานอาหารสุขภาพ 2:1:1 สสส.', url: `https://www.google.com/search?q=${encodeURIComponent('สูตรอาหาร 2 1 1 ลดน้ำหนัก')}` }]
          }
        }
      ];

      // Fill up to 14 or more days
      for (let d = 6; d <= Math.max(14, durationDays); d++) {
        curriculumData.push({
          focus: `Level ${Math.min(6, Math.ceil(d/2))}: ออกกำลังกาย & พัฒนาความฟิต (วันที่ ${d})`,
          task1: {
            title: `🔥 เซสชันฝึกร่างกายประจำวันที่ ${d} (${Utils.formatMinutes(Math.floor(dailyMinutes * 0.6))})`,
            desc: `ออกกำลังกายตามลำดับท่าฝึกอย่างมีวินัย พักระหว่างเซ็ต 45 วินาที`,
            tip: 'เพิ่มจำนวนครั้งขึ้นทีละนิดเพื่อพัฒนาความแข็งแกร่ง (Progressive Overload)',
            drill: {
              type: 'workout',
              title: `ตารางท่าฝึก Day ${d}`,
              exercises: [
                { name: 'Push-ups / Knee Push-ups', sets: '3 เซ็ต', reps: `${8 + Math.min(10, d)} ครั้ง`, rest: '45 วิ' },
                { name: 'Squat Variations', sets: '3 เซ็ต', reps: `${12 + Math.min(8, d)} ครั้ง`, rest: '45 วิ' },
                { name: 'Core Plank / Russian Twist', sets: '3 เซ็ต', reps: `${20 + Math.min(25, d * 2)} วิ/ครั้ง`, rest: '30 วิ' }
              ]
            },
            resources: [{ title: '▶️ Workouts for weight loss at home', url: `https://www.youtube.com/results?search_query=${encodeURIComponent('Home workout progressive weight loss')}` }]
          },
          task2: {
            title: `🥗 ปฏิบัติการโภชนาการและการพักผ่อน (Day ${d})`,
            desc: `ดื่มน้ำให้ครบ 2.5-3 ลิตร งดของหวาน และนอนหลับให้สนิท 7-8 ชั่วโมง`,
            tip: 'การพักผ่อนและการดื่มน้ำที่เพียงพอคือหัวใจของการลดไขมัน',
            drill: null,
            resources: [{ title: '💡 เคล็ดลับสุขภาพและการลดน้ำหนัก', url: `https://www.google.com/search?q=${encodeURIComponent('เคล็ดลับลดไขมันอย่างยั่งยืน')}` }]
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

      curriculumData = [];
      for (let d = 1; d <= Math.max(14, durationDays); d++) {
        curriculumData.push({
          focus: `Level ${Math.min(6, Math.ceil(d/2))}: การพัฒนาและเขียนโค้ดประจำวันที่ ${d}`,
          task1: {
            title: `💻 ฝึกพิมพ์โค้ดและสร้างฟังก์ชัน (Session ${d})`,
            desc: `เปิด VS Code หรือ Editor แล้วลงมือเขียนโค้ดตามหัวข้อประจำวัน`,
            tip: 'ฝึกแก้ Error ด้วยการอ่านข้อความใน Console อย่างใจเย็น',
            drill: {
              type: 'code',
              title: `Code Snippet Day ${d}`,
              code: `// Code Practice Day ${d}\nconst taskName = "Day ${d} Coding Challenge";\nconsole.log(\`Running: \${taskName}\`);\n\nfunction executeProgress() {\n  return { day: ${d}, completed: true };\n}\n\nconsole.log(executeProgress());`
            },
            resources: [{ title: '🌐 MDN Web Docs', url: 'https://developer.mozilla.org/' }]
          },
          task2: {
            title: `🧪 ทดสอบและบันทึกโค้ดลงโปรเจกต์ (Day ${d})`,
            desc: `ทดลองรันโค้ดและตรวจเช็คผลลัพธ์บนเบราว์เซอร์`,
            tip: 'บันทึกโค้ดบ่อยๆ และเก็บเป็นเวอร์ชันย่อย',
            drill: null,
            resources: [{ title: '💻 JavaScript Practice', url: 'https://javascript.info/' }]
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

      curriculumData = [];
      for (let d = 1; d <= Math.max(14, durationDays); d++) {
        curriculumData.push({
          focus: `Level ${Math.min(6, Math.ceil(d/2))}: อ่านเนื้อหา & สรุปบทเรียนวันที่ ${d}`,
          task1: {
            title: `📖 อ่านเนื้อหาเป้าหมาย 15-20 หน้า (วันที่ ${d})`,
            desc: `อ่านอย่างมีสมาธิแบบ Deep Work ${Utils.formatMinutes(Math.floor(dailyMinutes * 0.6))} ไม่เปิดแจ้งเตือนโทรศัพท์`,
            tip: 'ใช้ดินสอขีดเส้นใต้เฉพาะประโยคที่กระตุกความคิดของคุณจริงๆ',
            drill: {
              type: 'steps',
              title: `สรุปใจความสำคัญประจำวันที่ ${d}`,
              items: [
                `1. สรุปใจความสำคัญของสิ่งที่อ่านในวันนี้ 3 ข้อ`,
                `2. บันทึกไอเดียที่สามารถนำไปปรับใช้กับชีวิตหรือการทำงานได้ทันที 1 ข้อ`
              ]
            },
            resources: [{ title: '🧠 Feynman Technique เทคนิคการเรียนรู้ที่จำแม่น', url: `https://www.google.com/search?q=${encodeURIComponent('Feynman technique คืออะไร')}` }]
          },
          task2: {
            title: `✍️ บันทึกบทเรียนสำคัญลงใน Daily Reflection`,
            desc: `เขียนอธิบายด้วยภาษาของตัวเองเสมือนกำลังเล่าให้เพื่อนฟัง`,
            tip: 'การเขียนสรุปด้วยคำพูดตัวเองทำให้ข้อมูลถูกย้ายเข้าสู่ความจำระยะยาว',
            drill: null,
            resources: [{ title: '📚 Goodreads Book Insights', url: 'https://goodreads.com/' }]
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

      curriculumData = [];
      const vocabs = [
        { w: "Accomplish", ipa: "/əˈkɑːm.plɪʃ/", m: "ทำสำเร็จ, บรรลุผล", ex: "I will accomplish my goals step by step." },
        { w: "Prioritize", ipa: "/praɪˈɔːr.ə.taɪz/", m: "จัดลำดับความสำคัญ", ex: "We must prioritize our most important task." },
        { w: "Collaborate", ipa: "/kəˈlæb.ə.reɪt/", m: "ร่วมมือกันทำงาน", ex: "Let's collaborate on this new project." },
        { w: "Resilience", ipa: "/rɪˈzɪl.jəns/", m: "ความยืดหยุ่นทางใจ, การฟื้นตัวจากปัญหา", ex: "Resilience helps us overcome challenges." },
        { w: "Feasible", ipa: "/ˈfiː.zə.bəl/", m: "เป็นไปได้จริง, ปฏิบัติได้", ex: "This timeline is very feasible." },
        { w: "Compelling", ipa: "/kəmˈpel.ɪŋ/", m: "น่าดึงดูดใจ, มีเหตุผลหนักแน่น", ex: "She made a compelling presentation." },
        { w: "Streamline", ipa: "/ˈstriːm.laɪn/", m: "ปรับกระบวนการให้กระชับ", ex: "We streamline our workflow daily." },
        { w: "Articulate", ipa: "/ɑːrˈtɪk.jə.leɪt/", m: "ถ่ายทอดความคิดได้ชัดเจน", ex: "He articulates his ideas clearly." },
        { w: "Mitigate", ipa: "/ˈmɪt̬.ə.ɡeɪt/", m: "บรรเทา, ลดผลกระทบ", ex: "We mitigated the risk early." },
        { w: "Paradigm", ipa: "/ˈper.ə.daɪm/", m: "กระบวนทัศน์, แบบจำลองความคิด", ex: "A new paradigm in learning." },
        { w: "Spearhead", ipa: "/ˈspɪr.hed/", m: "เป็นหัวหอกนำทัพขับเคลื่อน", ex: "She spearheaded the project." }
      ];

      for (let d = 1; d <= Math.max(14, durationDays); d++) {
        const v = vocabs[(d - 1) % vocabs.length];
        curriculumData.push({
          focus: `Level ${Math.min(6, Math.ceil(d/2))}: คำศัพท์และการสื่อสารประจำวันที่ ${d}`,
          task1: {
            title: `🗣️ ฝึกคำศัพท์และการออกเสียงประจำวันที่ ${d}`,
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
            title: `🎙️ ฝึกพูดประโยคสื่อสารในชีวิตประจำวัน (Day ${d})`,
            desc: `ฝึกพูดออกเสียงประโยค 2-3 นาทีอย่างมั่นใจ`,
            tip: 'บันทึกเสียงตัวเองไว้ในโทรศัพท์เพื่อฟังสำเนียงย้อนหลัง',
            drill: null,
            resources: [{ title: '▶️ English Speaking Practice', url: `https://www.youtube.com/results?search_query=${encodeURIComponent('Daily English speaking practice conversation')}` }]
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

      curriculumData = [];
      for (let d = 1; d <= Math.max(14, durationDays); d++) {
        curriculumData.push({
          focus: `Level ${Math.min(6, Math.ceil(d/2))}: ปฏิบัติการขับเคลื่อนเป้าหมาย (วันที่ ${d})`,
          task1: {
            title: `🎯 ลงมือปฏิบัติการหลักสำหรับ "${title}" (Session ${d})`,
            desc: `กำจัดสิ่งรบกวน จับเวลา Focus Timer ${Utils.formatMinutes(Math.floor(dailyMinutes * 0.6))} และลงมือทำชิ้นงานสำคัญของวันนี้`,
            tip: 'กฎ 2 นาที: ถ้าเริ่มลงมือทำ 2 นาทีแรกได้ คุณจะทำต่อไปได้จนจบ',
            drill: {
              type: 'steps',
              title: `Checklist ปฏิบัติการประจำวันที่ ${d}`,
              items: [
                `1. กำหนดผลลัพธ์ 1 อย่างที่ต้องเสร็จในวันนี้สำหรับ "${title}"`,
                `2. ลงมือทำโดยไม่เปิดแท็บหรือแอปอื่นรบกวน`,
                `3. ตรวจสอบความถูกต้องและบันทึกความคืบหน้า`
              ]
            },
            resources: [{ title: `🔍 ค้นคว้าข้อมูลเพิ่มเติมเกี่ยวกับ "${title}"`, url: `https://www.google.com/search?q=${encodeURIComponent(title)}` }]
          },
          task2: {
            title: `📝 บันทึกความก้าวหน้าและเตรียมความพร้อมสำหรับวันถัดไป`,
            desc: `จดสิ่งที่ทำได้ดีและสิ่งที่ต้องปรับปรุงลงในช่อง Daily Reflection ด้านล่าง`,
            tip: 'การเตรียมพร้อมล่วงหน้าช่วยลดแรงต้านในการเริ่มต้นวันพรุ่งนี้ได้ 2 เท่า',
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

  init() {
    Store.init();
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

    const circumference = 2 * Math.PI * 76;
    if (timerCircle) {
      timerCircle.style.strokeDasharray = `${circumference}`;
    }

    TimerEngine.init({
      onTick: (state) => {
        if (timerDigits) timerDigits.textContent = state.formatted;
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

        if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบภารกิจนี้?')) {
          Store.deleteTask(active.id, dayNum, taskId);
          this.closeModal('edit-task-modal');
          this.render();
        }
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
        if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบเป้าหมาย "${active.title}"?`)) {
          Store.deleteGoal(active.id);
          this.render();
        }
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
    if (modelSelect) modelSelect.value = s.model || 'gemini-1.5-flash';
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
    document.getElementById('edit-goal-category').value = goal.category || 'other';
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
    const category = document.getElementById('edit-goal-category').value;
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
    const category = document.getElementById('goal-category').value;
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
    submitBtn.innerHTML = `<span class="loading-spinner"></span> กำลังให้ AI วิเคราะห์และวางแผน...`;

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
    const streakEl = document.getElementById('nav-streak-count');
    const xpEl = document.getElementById('nav-xp-count');
    if (streakEl) streakEl.textContent = Store.state.stats.streak;
    if (xpEl) xpEl.textContent = `${Store.state.stats.totalXp} XP`;

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
          if (confirm(`คุณต้องการลบ วันที่ ${goal.dailyTasks.length} ออกจากเป้าหมายใช่หรือไม่?`)) {
            Store.removeLastDayFromGoal(goal.id);
            this.render();
          }
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
            if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบภารกิจนี้?')) {
              Store.deleteTask(goal.id, currentDayNum, taskId);
              this.render();
            }
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
    const stats = Store.state.stats;
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
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}

// Make globally accessible
window.GoalForge = { Utils, Store, TimerEngine, AIService, App };
