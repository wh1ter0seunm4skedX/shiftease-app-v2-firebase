import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAw6KB3thNwKZ64tJUkLCr7ESwJlTmtkjU",
  authDomain: "wishlist-tracker-9818b.firebaseapp.com",
  projectId: "wishlist-tracker-9818b",
  storageBucket: "wishlist-tracker-9818b.firebasestorage.app",
  messagingSenderId: "42524516665",
  appId: "1:42524516665:web:87cc68dcd2eac04c9488e8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
