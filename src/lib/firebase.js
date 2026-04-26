import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCCNg6vb5c-Uz64fYoNug833aVfQYdHc3g',
  authDomain: 'spectra-edad0.firebaseapp.com',
  projectId: 'spectra-edad0',
  storageBucket: 'spectra-edad0.firebasestorage.app',
  messagingSenderId: '656690833450',
  appId: '1:656690833450:web:4122ef414beabfb2ed3b53',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
