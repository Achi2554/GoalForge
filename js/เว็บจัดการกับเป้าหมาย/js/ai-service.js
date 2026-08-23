/**
 * GoalForge AI - AIService Module
 * Dual-Engine: Google Gemini API + Smart Offline Progressive Curriculum Engine
 */

export const AIService = {
  async generateGoalBreakdown({ title, category, durationDays, dailyMinutes, level, notes, apiKey, model = 'gemini-1.5-flash' }) {
    durationDays = parseInt(durationDays, 10) || 14;
    dailyMinutes = parseInt(dailyMinutes, 10) || 25;

    if (apiKey && apiKey.trim().length > 10) {
      try {
        const result = await this.callGeminiAPI({
          title,
          category,
          durationDays,
          dailyMinutes,
          level,
          notes,
          apiKey: apiKey.trim(),
          model
        });
        if (result && result.phases && result.dailyTasks && result.dailyTasks.length > 0) {
          return result;
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to smart progressive offline generator:', err);
      }
    }

    if (window.GoalForge?.AIService?.generateSmartOfflineBreakdown) {
      return window.GoalForge.AIService.generateSmartOfflineBreakdown({
        title,
        category,
        durationDays,
        dailyMinutes,
        level,
        notes
      });
    }

    return null;
  }
};
