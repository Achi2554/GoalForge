const firebaseConfig = {
  apiKey: "AIzaSyD-DqVgpshpt0_zIvPG-jtL-5RaMUVo4_s",
  authDomain: "goalforge-ruby.vercel.app",
  projectId: "goalforge-app-c800d",
  storageBucket: "goalforge-app-c800d.firebasestorage.app",
  messagingSenderId: "259416655451",
  appId: "1:259416655451:web:31348a28e0b7cf434d617e"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

window.db = db;

const auth = firebase.auth();
window.auth = auth;
