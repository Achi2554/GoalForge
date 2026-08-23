const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyD-DqVgpshpt0_zIvPG-jtL-5RaMUVo4_s",
  authDomain: "goalforge-app-c800d.firebaseapp.com",
  projectId: "goalforge-app-c800d",
  storageBucket: "goalforge-app-c800d.firebasestorage.app",
  messagingSenderId: "259416655451",
  appId: "1:259416655451:web:31348a28e0b7cf434d617e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

getDocs(collection(db, 'users'))
  .then(() => console.log('Success'))
  .catch(err => console.error('Error:', err.message));
