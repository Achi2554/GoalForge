/**
 * GoalForge AI - Focus Timer & Pomodoro Engine
 */

import { Utils } from './utils.js';

export const TimerEngine = {
  durationSeconds: 25 * 60,
  remainingSeconds: 25 * 60,
  timerInterval: null,
  isRunning: false,
  mode: 'focus', // 'focus' | 'short_break' | 'long_break'
  
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

  setCustomMinutes(minutes) {
    this.pause();
    this.durationSeconds = Math.max(1, parseInt(minutes, 10)) * 60;
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
