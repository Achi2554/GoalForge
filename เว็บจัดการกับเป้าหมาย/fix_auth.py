with open('login.html', 'r', encoding='utf-8') as f:
    html = f.read()

parts = html.split('// 🚀 Mock Google Login 🚀')
prefix = parts[0]
suffix = parts[1].split('});\n    </script>')[1]

new_code = '''// ====== Real Google Login ======
    document.querySelectorAll('.btn-google-login').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.disabled = true;
        btn.innerHTML = `<div class=\"btn-spinner\"></div> กำลังเชื่อมต่อกับ Google...`;
        
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithRedirect(provider);
      });
    });

    window.addEventListener('DOMContentLoaded', () => {
      firebase.auth().getRedirectResult()
        .then(async (result) => {
          if (result && result.user) {
            const firebaseUser = result.user;
            const email = firebaseUser.email;
            
            try {
              const userRef = window.db.collection('users').where('email', '==', email.toLowerCase());
              const snapshot = await userRef.get();
              let appUser = null;
              
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
              
              AuthService.createSession(appUser);
              window.location.href = 'index.html';
            } catch (err) {
              console.error(err);
              showAlert('login-error', 'เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล');
            }
          }
        })
        .catch((error) => {
          console.error(error);
          showAlert('login-error', 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google');
        });
    });
'''

with open('login.html', 'w', encoding='utf-8') as f:
    f.write(prefix + new_code + '    </script>' + suffix)
