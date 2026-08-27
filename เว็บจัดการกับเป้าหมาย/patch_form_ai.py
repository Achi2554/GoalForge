import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

old_edit_goal = """    const formEditGoal = document.getElementById('form-edit-goal');
    if (formEditGoal) {
      formEditGoal.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleSaveEditGoal(false);
      });
    }"""

new_edit_goal = """    const formEditGoal = document.getElementById('form-edit-goal');
    if (formEditGoal) {
      formEditGoal.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleSaveEditGoal(true); // Always replan with AI now
      });
    }"""

js = js.replace(old_edit_goal, new_edit_goal)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
