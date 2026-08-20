/**
 * GoalForge AI - Utility Functions
 */

export const Utils = {
  /**
   * Generate a unique ID
   */
  generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  },

  /**
   * Format Thai Date
   */
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

  /**
   * Escape HTML to prevent XSS
   */
  escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  /**
   * Web Audio API synthesized sound effects
   */
  playSound(type = 'complete') {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      if (type === 'complete') {
        // Satisfying chime (two quick pleasant tones)
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
        // Bell sound for timer complete
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
      console.warn('Audio Context error or not allowed:', e);
    }
  },

  /**
   * Confetti celebration burst effect
   */
  launchConfetti() {
    const count = 60;
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.inset = '0';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '99999';
    container.style.overflow = 'hidden';
    document.body.appendChild(container);

    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'];

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      const size = Math.random() * 8 + 6;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const startX = window.innerWidth / 2 + (Math.random() * 200 - 100);
      const startY = window.innerHeight * 0.4;
      const destX = startX + (Math.random() * 600 - 300);
      const destY = startY + Math.random() * 400 + 150;
      const rot = Math.random() * 720 - 360;

      particle.style.position = 'absolute';
      particle.style.width = `${size}px`;
      particle.style.height = `${size * 0.6}px`;
      particle.style.backgroundColor = color;
      particle.style.borderRadius = '2px';
      particle.style.left = `${startX}px`;
      particle.style.top = `${startY}px`;
      particle.style.opacity = '1';
      particle.style.transform = `translate(0, 0) rotate(0deg)`;
      particle.style.transition = `all ${0.8 + Math.random() * 0.7}s cubic-bezier(0.25, 1, 0.5, 1)`;

      container.appendChild(particle);

      requestAnimationFrame(() => {
        particle.style.transform = `translate(${destX - startX}px, ${destY - startY}px) rotate(${rot}deg)`;
        particle.style.opacity = '0';
      });
    }

    setTimeout(() => {
      container.remove();
    }, 1800);
  },

  /**
   * Text-to-Speech audio pronunciation using Web Speech API
   */
  speakText(text, lang = 'en-US') {
    if (!('speechSynthesis' in window)) {
      alert('เบราว์เซอร์ของคุณไม่รองรับระบบออกเสียงข้อความ');
      return;
    }
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9; // Slightly slower for clear learning pronunciation
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  },

  /**
   * Copy text to clipboard
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('Clipboard write failed:', err);
      return false;
    }
  }
};

