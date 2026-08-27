import re
with open('index.html', 'r', encoding='utf-8') as f:
    js = f.read()

old_script = """        const avatar = document.getElementById('nav-user-avatar');
        if (avatar) {
          avatar.textContent = user.avatar || user.name.charAt(0).toUpperCase();
          avatar.title = user.name + ' (' + user.email + ')';
        }"""

new_script = """        const avatar = document.getElementById('nav-user-avatar');
        if (avatar) {
          if (user.avatar && user.avatar.startsWith('http')) {
            avatar.innerHTML = `<img src="${user.avatar}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;" alt="User Avatar">`;
            avatar.style.padding = '0';
            avatar.style.overflow = 'hidden';
          } else {
            avatar.textContent = user.name ? user.name.charAt(0).toUpperCase() : '?';
          }
          avatar.title = user.name + ' (' + user.email + ')';
        }"""

js = js.replace(old_script, new_script)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(js)
