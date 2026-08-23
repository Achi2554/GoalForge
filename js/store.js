/**
 * GoalForge AI - Data Store & State Management
 */

const STORAGE_KEYS = {
  GOALS: 'goalforge_goals',
  ACTIVE_GOAL_ID: 'goalforge_active_goal_id',
  SETTINGS: 'goalforge_settings',
  STATS: 'goalforge_stats'
};

export const Store = {
  state: {
    goals: [],
    activeGoalId: null,
    selectedDay: 1,
    settings: {
      apiKey: '',
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

  /**
   * Initialize state from localStorage
   */
  init() {
    try {
      const savedGoals = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (savedGoals) {
        this.state.goals = JSON.parse(savedGoals);
        // Backfill resources for any older saved tasks
        this.state.goals.forEach(goal => {
          if (goal.dailyTasks) {
            goal.dailyTasks.forEach(d => {
              if (d.tasks) {
                d.tasks.forEach(t => {
                  if (!t.resources || t.resources.length === 0) {
                    t.resources = [{
                      title: `🔍 ค้นคว้าเรื่อง "${t.title}"`,
                      url: `https://www.google.com/search?q=${encodeURIComponent((goal.title || '') + ' ' + (t.title || ''))}`
                    }];
                  }
                });
              }
            });
          }
        });
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
      console.error('Failed to load store from localStorage', e);
    }
  },

  /**
   * Persist state to localStorage
   */
  save() {
    try {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(this.state.goals));
      if (this.state.activeGoalId) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_GOAL_ID, this.state.activeGoalId);
      }
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.state.settings));
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(this.state.stats));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  },

  /**
   * Get all goals
   */
  getGoals() {
    return this.state.goals;
  },

  /**
   * Get currently active goal
   */
  getActiveGoal() {
    return this.state.goals.find(g => g.id === this.state.activeGoalId) || null;
  },

  /**
   * Set active goal by ID
   */
  setActiveGoal(id) {
    if (this.state.goals.some(g => g.id === id)) {
      this.state.activeGoalId = id;
      this.state.selectedDay = 1;
      this.save();
      return true;
    }
    return false;
  },

  /**
   * Add a new goal
   */
  addGoal(goal) {
    this.state.goals.unshift(goal);
    this.state.activeGoalId = goal.id;
    this.state.selectedDay = 1;
    this.save();
    return goal;
  },

  /**
   * Delete a goal
   */
  deleteGoal(id) {
    this.state.goals = this.state.goals.filter(g => g.id !== id);
    if (this.state.activeGoalId === id) {
      this.state.activeGoalId = this.state.goals.length > 0 ? this.state.goals[0].id : null;
      this.state.selectedDay = 1;
    }
    this.save();
  },

  /**
   * Update full goal object
   */
  updateGoal(updatedGoal) {
    const idx = this.state.goals.findIndex(g => g.id === updatedGoal.id);
    if (idx !== -1) {
      this.state.goals[idx] = updatedGoal;
      this.save();
    }
  },

  /**
   * Toggle a task completion status
   */
  toggleTask(goalId, dayNumber, taskId) {
    const goal = this.state.goals.find(g => g.id === goalId);
    if (!goal) return null;

    const dayData = goal.dailyTasks.find(d => d.day === Number(dayNumber));
    if (!dayData) return null;

    const task = dayData.tasks.find(t => t.id === taskId);
    if (!task) return null;

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date().toISOString() : null;

    // XP calculation: 20 XP per task completed
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

  /**
   * Save daily reflection / note
   */
  saveDayNote(goalId, dayNumber, noteText) {
    const goal = this.state.goals.find(g => g.id === goalId);
    if (!goal) return;

    const dayData = goal.dailyTasks.find(d => d.day === Number(dayNumber));
    if (dayData) {
      dayData.notes = noteText;
      this.save();
    }
  },

  /**
   * Calculate progress for a specific goal
   */
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

  /**
   * Check & update daily streak
   */
  checkDailyStreak() {
    const today = new Date().toDateString();
    if (!this.state.stats.lastActiveDate) return;

    const lastDate = new Date(this.state.stats.lastActiveDate);
    const diffTime = Math.abs(new Date(today) - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1 && new Date(today).toDateString() !== lastDate.toDateString()) {
      // Missed more than 1 day -> reset streak to 0
      this.state.stats.streak = 0;
      this.save();
    }
  },

  /**
   * Record activity for today (updates streak)
   */
  recordActivity() {
    const today = new Date().toDateString();
    if (this.state.stats.lastActiveDate !== today) {
      this.state.stats.streak += 1;
      this.state.stats.lastActiveDate = today;
      this.save();
    }
  },

  /**
   * Update Settings
   */
  updateSettings(newSettings) {
    this.state.settings = { ...this.state.settings, ...newSettings };
    this.save();
  },

  /**
   * Export all data as JSON
   */
  exportData() {
    return JSON.stringify({
      goals: this.state.goals,
      stats: this.state.stats,
      exportedAt: new Date().toISOString()
    }, null, 2);
  },

  /**
   * Import data from JSON
   */
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
