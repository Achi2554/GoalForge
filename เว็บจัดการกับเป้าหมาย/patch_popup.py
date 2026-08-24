import re
with open('login.html', 'r', encoding='utf-8') as f:
    html = f.read()

new_js = """// Google Login
    document.querySelectorAll('.btn-google-login').forEach(btn => {
      btn.addEventListener('click', () => {
        const isRegister = btn.closest('#panel-register') !== null;
        btn.disabled = true;
        btn.innerHTML = `กำลังเชื่อมต่อกับ Google...`;
        
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider)
          .then(async (result) => {
            if (result && result.user) {
              const firebaseUser = result.user;
              const email = firebaseUser.email;
              let appUser = null;
              
              try {
                const userRef = window.db.collection('users').where('email', '==', email.toLowerCase());
                const snapshot = await userRef.get();
                
                if (snapshot.empty) {
                  appUser = {
                    id: 'google_' + Date.now(),
                    name: firebaseUser.displayName || email.split('@')[0],
                    email: email.toLowerCase(),
                    avatar: firebaseUser.photoURL || null,
                    createdAt: new Date().toISOString()
                  };
                  await window.db.collection('users').doc(appUser.id).set(appUser);
                } else {
                  appUser = snapshot.docs[0].data();
                  if (!appUser.avatar && firebaseUser.photoURL) {
                    appUser.avatar = firebaseUser.photoURL;
                    await window.db.collection('users').doc(appUser.id).update({ avatar: appUser.avatar });
                  }
                }
              } catch (err) {
                console.warn('Firestore fallback.', err);
                appUser = {
                  id: 'google_' + Date.now(),
                  name: firebaseUser.displayName || email.split('@')[0],
                  email: email.toLowerCase(),
                  avatar: firebaseUser.photoURL || null,
                  createdAt: new Date().toISOString()
                };
              }
              AuthService.createSession(appUser);
              window.location.href = 'index.html';
            }
          })
          .catch((error) => {
            console.error(error);
            const alertId = isRegister ? 'register-error' : 'login-error';
            showAlert(alertId, 'เข้าสู่ระบบไม่สำเร็จ หรือคุณยกเลิกการเชื่อมต่อ');
            btn.disabled = false;
            btn.innerHTML = `<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo"> ${isRegister ? 'สมัครสมาชิกด้วย Google' : 'เข้าสู่ระบบด้วย Google'}`;
          });
      });
    });
  </script>
</body>
</html>"""

html = re.sub(r'// Google Login.*</html>', new_js, html, flags=re.DOTALL)

with open('login.html', 'w', encoding='utf-8') as f:
    f.write(html)
