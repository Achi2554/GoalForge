/**
 * GoalForge AI - Authentication Module
 * Client-side user management with localStorage
 */

const AuthService = {
  KEYS: {
    USERS: 'goalforge_users',
    SESSION: 'goalforge_session'
  },

  // We no longer use getUsers/saveUsers for local array manipulation.
  // Instead, we interact directly with Firestore.

  // Get current logged-in user
  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.SESSION) || 'null');
    } catch { return null; }
  },

  // Simple hash (not cryptographic — for demo purposes)
  hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return 'hashed_' + Math.abs(hash).toString(36);
  },

  // Register a new user (Async)
  async register({ name, email, password }) {
    if (password.length < 6) {
      return { success: false, error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' };
    }

    try {
      const usersRef = window.db.collection('users');
      const snapshot = await usersRef.where('email', '==', email.trim().toLowerCase()).get();

      if (!snapshot.empty) {
        return { success: false, error: 'อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น' };
      }

      const newUser = {
        id: 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash: this.hashPassword(password),
        createdAt: new Date().toISOString(),
        avatar: name.trim().charAt(0).toUpperCase()
      };

      await usersRef.doc(newUser.id).set(newUser);
      this.createSession(newUser);
      return { success: true, user: newUser };
    } catch (err) {
      console.error("Register Error:", err);
      return { success: false, error: 'เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล' };
    }
  },

  // Login existing user (Async)
  async login({ email, password }) {
    try {
      const usersRef = window.db.collection('users');
      const snapshot = await usersRef.where('email', '==', email.trim().toLowerCase()).get();

      if (snapshot.empty) {
        return { success: false, error: 'ไม่พบอีเมลนี้ในระบบ กรุณาสมัครสมาชิกก่อน' };
      }

      const user = snapshot.docs[0].data();

      if (user.passwordHash !== this.hashPassword(password)) {
        return { success: false, error: 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง' };
      }

      this.createSession(user);
      return { success: true, user };
    } catch (err) {
      console.error("Login Error:", err);
      return { success: false, error: 'เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล' };
    }
  },

  // Create session
  createSession(user) {
    const session = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || user.name.charAt(0).toUpperCase(),
      loginAt: new Date().toISOString()
    };
    localStorage.setItem(this.KEYS.SESSION, JSON.stringify(session));
  },

  // Logout
  logout() {
    localStorage.removeItem(this.KEYS.SESSION);
  },

  // Check if logged in
  isLoggedIn() {
    return !!this.getCurrentUser();
  },

  // Redirect to login if not authenticated
  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  },

  // Get user-specific storage key prefix
  getUserPrefix() {
    const user = this.getCurrentUser();
    return user ? `_${user.id}` : '_guest';
  }
};

window.AuthService = AuthService;
